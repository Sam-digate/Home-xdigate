/* Local CRM workflow: example contacts only, no network or mail delivery. */
ONLINE.crm=1;
AG.crm={n:'CRM 生命周期运营',s:'CRM',c:'#7C3AED'};
TRACE.crm=[
 {k:'read',h:'读取任务需求',b:'读取本任务描述，确定三封英文结账挽回邮件的内容范围。',m:'来源：当前任务 · 示例数据'},
 {k:'think',h:'确定邮件安排',b:'按结账后 +1 小时、+24 小时和 +72 小时，分别安排提醒、解答顾虑和最后提醒。'},
 {k:'write',h:'起草邮件方案',b:'生成三封邮件的主题和正文，采用简洁、温和的客户沟通语气。'},
 {k:'think',h:'检查内容边界',b:'不添加折扣、虚假倒计时或未经批准的功效表述；正文不包含内部代码字段。'},
 {k:'tool',h:'提交人工审核',b:'合并为一个邮件方案产出，等待人工编辑和批准。批准后交付，不直接发送真实邮件。'}
];
REG.push({id:'crm',nick:'CRM',n:'CRM 生命周期运营 Agent',em:'✉',dom:'用户运营',b:'live',lv:0,own:'Sophie',pm:'Nova',tr:['manual','event'],out:['挽回邮件'],d:'根据结账数据生成挽回邮件，经人工批准后按计划发送，并检查订单和退订状态。',r:0,ok:0,ed:0,c:'—',maturity:'M1',enabled:true});
T.unshift({id:'t-crm-checkout',t:'Sensica · 放弃结账挽回邮件',ag:'crm',dom:'用户运营',own:'du',lv:'M1',st:'todo',trig:'manual',cr:{s:'h',w:'du'},camp:null,up:'刚刚',day:0,workTop:200,cost:'—',arts:[],cmts:[],outputCount:0,crm:{stage:'todo',brief:'为 Sensica 已开始结账但未付款、且已同意邮件营销的客户，准备 3 封英文挽回邮件。第一封提醒返回结账，第二封解答配送、退货和适用性问题，第三封最后提醒。暂不提供折扣，不新增未经批准的功效表述。',mails:[],records:[]}});
function crmTask(){return T.find(t=>t.id==='t-crm-checkout'&&!t.deletedAt);}
function crmCanOperate(){return permissionHasPage('work')&&!!crmTask();}
// Demo rules only; findings are review prompts, not a legal determination.
const CRM_CLAIM_RULES=[
 {text:'visible results in 7 days',risk:'高风险',reason:'包含明确的见效时间承诺，需要与该产品获批主张及适用条件核对。',suggestion:'Review the product information to decide whether it fits your routine.'},
 {text:'professional anti-aging without the clinic',risk:'高风险',reason:'暗示专业或诊所级抗衰效果，需要对应产品的支持依据。',suggestion:'Explore an at-home routine with Sensica.'},
 {text:'guaranteed results',risk:'高风险',reason:'保证效果的绝对化表达，需要删除或改为有依据且有限定条件的描述。',suggestion:'Results may vary.'}
];
function crmMailFindings(mail){
 const findings=[];
 for(const field of ['subject','body'])for(const rule of CRM_CLAIM_RULES){
  const text=mail[field]||'',lower=text.toLowerCase();let from=0,at;
  while((at=lower.indexOf(rule.text,from))!==-1){findings.push({...rule,field,start:at,end:at+rule.text.length});from=at+rule.text.length;}
 }
 return findings.sort((a,b)=>a.field.localeCompare(b.field)||a.start-b.start);
}
function crmHighlightedMail(mail,field,index){
 const text=mail[field]||'',findings=crmMailFindings(mail);let html='',from=0;
 findings.forEach(finding=>{if(finding.field!==field)return;html+=esc(text.slice(from,finding.start))+`<mark>${esc(text.slice(finding.start,finding.end))}</mark>`;from=finding.end;});
 return html+esc(text.slice(from));
}
function crmMailReviewHTML(mail,dirty){
 const findings=crmMailFindings(mail);
 const status=dirty?'<span class="st review">待更新</span>':findings.length?`<span class="crm-risk-count">${findings.length} 处需核查</span>`:'<span class="st done">未发现问题</span>';
 return `<summary>审核结果 ${status}</summary>${dirty?'<p class="crm-context">以下为上次保存的审核结果，保存草稿后更新。</p>':''}${findings.length?findings.map((f,i)=>`<section class="claims-review-item"><h4>${i+1}. ${f.text==='visible results in 7 days'?'见效时间需核对':f.text==='guaranteed results'?'绝对效果承诺':'专业效果需核对'} <span class="crm-risk-count">${f.risk}</span></h4><dl><dt>原文</dt><dd>${esc(mail[f.field].slice(f.start,f.end))}</dd><dt>问题与依据</dt><dd>${esc(f.reason)}</dd></dl><details><summary>查看详细依据</summary><p>位置：邮件${f.field==='subject'?'主题':'正文'}。产品：${esc(mail.product||'Sensica')}。</p><p>依据状态：命中预设演示规则，需结合产品获批主张、适用条件及支持资料核验。</p></details></section>`).join(''):'<p class="crm-context">未检出预设风险，等待人工审核。</p>'}`;
}
function crmMailHasUnsavedChanges(mail,index){return ['subject','body'].some(key=>mail[key]!==crmTask()?.crm.mails[index]?.[key]);}
function crmDraftReviewHTML(mail,index){return crmMailReviewHTML(crmTask().crm.mails[index],crmMailHasUnsavedChanges(mail,index));}
function crmDraftHighlightHTML(mail,field,index){
 const saved=crmTask().crm.mails[index];if(!crmMailHasUnsavedChanges(mail,index))return crmHighlightedMail(saved,field,index);
 // Track only previously checked phrases; new text is checked after saving.
 const text=mail[field],spans=[];let cursor=0;
 for(const f of crmMailFindings(saved).filter(f=>f.field===field)){
  const phrase=saved[field].slice(f.start,f.end),start=text.toLowerCase().indexOf(phrase.toLowerCase(),cursor);
  if(start!==-1){spans.push({start,end:start+phrase.length});cursor=start+phrase.length;}
 }
 let html='',from=0;for(const f of spans){html+=esc(text.slice(from,f.start))+'<mark>'+esc(text.slice(f.start,f.end))+'</mark>';from=f.end;}return html+esc(text.slice(from));
}
function crmSyncMailHighlight(field,input){
 const layer=$('crm-highlight-'+field);if(layer){layer.scrollTop=input.scrollTop;layer.scrollLeft=input.scrollLeft;}
}
function crmMailEditorHTML(mail,field,index,locked){
 const subject=field==='subject';
 return `<div class="crm-highlight-editor ${subject?'crm-highlight-subject':''}"><div id="crm-highlight-${field}" class="crm-highlight-backdrop" aria-hidden="true">${crmDraftHighlightHTML(mail,field,index)}\n</div><textarea id="crm-bundle-${field}" rows="${subject?1:12}" aria-label="${subject?'主题':'正文'}" ${locked?'readonly':''} oninput="crmEditBundleField(${index},'${field}',this.value)" onscroll="crmSyncMailHighlight('${field}',this)">${esc(mail[field])}</textarea></div>`;
}
function crmMailContentHTML(mail,index,locked){
 return `<div class="csa-email"><div class="fld"><label for="crm-bundle-subject">主题</label>${crmMailEditorHTML(mail,'subject',index,locked)}</div><div class="fld"><label for="crm-bundle-body">正文</label>${crmMailEditorHTML(mail,'body',index,locked)}</div></div><details id="crm-mail-review" class="claims-review">${crmDraftReviewHTML(mail,index)}</details>`;
}
function crmNode(label,body,state='ok'){return `<div class="node ${state}"><div class="nlab">${label}</div>${body}</div>`;}
function crmArtifactHTML(c){
 const approved=c.mails.every(m=>m.approved);
 return `<article class="pk"><div class="pk-h"><span class="ty">产出 · 邮件方案</span><span class="chip mut">3 封邮件</span><span class="st ${approved?'done':'review'}">${approved?'已批准':'待审批'}</span><span class="by artifact-run" role="button" tabindex="0" onclick="openTrace('crm','t-crm-checkout')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openTrace('crm','t-crm-checkout')}">${AV('crm',16)}<span class="odot on"></span>CRM · 看运行 ↗</span></div><div class="pk-b" onclick="crmOpenBundle()"><div class="pk-t"><div class="tt">Sensica · 放弃结账挽回邮件方案</div><div class="ex">结账提醒、解答顾虑和最后提醒，分别安排在结账后 +1 小时、+24 小时及 +72 小时。</div></div></div><div class="vals"><span class="val ok">✓ 邮件 <b class="m">${c.mails.length} 封</b></span><span class="val">触达时间 <b class="m">+1h / +24h / +72h</b></span><span class="val ${approved?'ok':''}">已批准 <b class="m">${c.mails.filter(mail=>mail.approved).length} / ${c.mails.length} 封</b></span></div><div class="crm-mail-footer"><button class="btn ghost sm" onclick="crmOpenBundle()">查看产出</button><span class="crm-context">v${c.version||1} · ${approved?'已批准':'等待人工审核'}</span></div></article>`;
}
function crmOpenBundle(preserve=false){
 if(!crmCanOperate())return;const c=crmTask().crm;if(!c.mails.length)return;
 if(S.crmCommentsOpen===undefined)S.crmCommentsOpen=true;
 if(!preserve||!S.crmBundleDraft)S.crmBundleDraft=c.mails.map(m=>({...m}));
 S.crmBundleTab='mail';
 crmDrawBundle();
}
function crmBundleVersions(c){
 if(!c.versions)c.versions=[{version:c.version||1,label:'邮件方案'}];
 return c.versions;
}
function crmRecordBundleSave(c,mailNumbers){
 if(!mailNumbers.length)return;
 const versions=crmBundleVersions(c);
 c.version=(c.version||1)+1;
 versions.push({version:c.version,label:`保存草稿 · 邮件 ${mailNumbers.join('、')}`,at:new Date().toISOString()});
}
function crmBundleVersionsHTML(c){
 const current=c.version||1;
 return crmBundleVersions(c).slice().reverse().map(entry=>{
  const label=entry.version===current?'当前版本 · '+entry.label:entry.label;
  return `<div class="vrow"><span class="vv">v${entry.version}</span><span class="vt">${esc(label)}</span><span class="vd">${entry.at?esc(kbHistoryTime(entry.at)):''}</span></div>`;
 }).join('');
}
function crmAudienceRuleGroups(c){
 if(!c.audienceGroups)c.audienceGroups=[{rows:[{event:'Placed Order',times:'zero times',period:'over all time',days:180}],count:'15,014'},{rows:[{event:'Placed Order',times:'zero times',period:'in the last',days:180}],count:'15,272'}];
 return c.audienceGroups;
}
function crmReloadAudience(){
 if(!crmCanOperate())return;const t=crmTask(),c=t.crm;if(c.audienceSyncing)return;
 c.audienceSyncing=true;const token=c.audienceSyncToken=(c.audienceSyncToken||0)+1;
 crmDrawBundle(S.crmBundleIndex);
 // Local interaction demo: retain the example snapshot; no Klaviyo request is sent.
 setTimeout(()=>{
  if(crmTask()!==t||t.crm!==c||c.audienceSyncToken!==token)return;
  c.audienceSyncing=false;c.audienceSyncedAt=new Date().toISOString();
  if(S.crmBundleTab==='audience'&&S.crmBundleDraft&&$('dw')?.classList.contains?.('on'))crmDrawBundle(S.crmBundleIndex);
  toast('人群重新读取完成（演示）');
 },1000);
}
function crmFlowDraftHTML(c){
 const flow=c.flowDraft;if(!flow||c.stage!=='done')return '';
 const createdAt=new Date(flow.createdAt).toLocaleString('zh-CN',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false});
 return `<section class="crm-flow-draft" aria-label="Klaviyo Flow 草稿"><div class="crm-flow-draft-heading"><div class="crm-flow-draft-title"><h3>Flow ${esc(flow.id)}</h3><span class="st done">已建草稿</span></div><a class="btn ghost sm" href="https://www.klaviyo.com/flow/WBV5mK/edit" target="_blank" rel="noopener noreferrer" title="需在 Klaviyo 登录「Digate」账号（账号 ID XSaFVP）">在 Klaviyo 打开 <i data-lucide="arrow-up-right" aria-hidden="true"></i></a></div><p>已逐封读回核对标题、正文和发送时间，与批准内容一致。</p><p class="crm-context">仅创建草稿，未发送、未启用。请在 Klaviyo 检查后由人工启用。</p><div class="crm-flow-draft-footer"><span class="crm-context">创建时间：${esc(createdAt)}</span></div></section>`;
}
function crmAudienceFlowHTML(c){
 const groups=crmAudienceRuleGroups(c);
 if(!c.audienceSyncedAt)c.audienceSyncedAt=c.versions?.[0]?.at||new Date().toISOString();
 const syncedAt=new Date(c.audienceSyncedAt).toLocaleString('zh-CN',{timeZone:'Asia/Tokyo',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false});
 return `<section class="crm-audience" aria-label="人群 Flow">${crmFlowDraftHTML(c)}<div class="crm-audience-summary"><div><span class="crm-audience-label">匹配人群总数</span><div class="crm-audience-number">1,286 <span>人</span></div></div><div class="crm-audience-actions"><button type="button" class="btn ghost sm" onclick="crmReloadAudience()" ${c.audienceSyncing?'disabled aria-busy="true"':''}>${c.audienceSyncing?'读取中…':'重新读取人群'}</button><a class="btn ghost sm" href="https://www.klaviyo.com/flows" target="_blank" rel="noopener noreferrer">前往 Klaviyo <i data-lucide="arrow-up-right" aria-hidden="true"></i></a></div><div class="crm-audience-sync-note"><p>人群条件需在 Klaviyo 编辑，修改后点击重新读取，同步最新人数与条件。</p><span role="status">上次同步：${esc(syncedAt)}</span></div></div><div class="crm-flow-groups">${groups.map((group,index)=>`${index?`<div class="crm-flow-logic"><span class="crm-flow-logic-label">AND</span></div>`:''}<section class="crm-flow-group" aria-label="Condition ${index+1}"><div class="crm-flow-group-heading"><div class="crm-flow-type">What someone has done (or not done)</div>${group.count?`<span class="crm-flow-count"><i data-lucide="contact-round" aria-hidden="true"></i>${esc(group.count)}</span>`:''}</div>${group.rows.map(rule=>`<div class="crm-flow-row"><span class="crm-flow-person">Person has</span><span class="crm-flow-value crm-flow-event">${esc(rule.event)}</span><span class="crm-flow-value">${esc(rule.times)}</span><span class="crm-flow-value">${esc(rule.period)}</span>${rule.period==='in the last'?`<span class="crm-flow-value crm-flow-days">${esc(rule.days)}</span><span class="crm-flow-value">days</span>`:''}</div>`).join('')}</section>`).join('')}</div></section>`;
}
function crmSwitchBundleTab(tab){
 if(!crmCanOperate()||!S.crmBundleDraft||!['mail','audience','versions'].includes(tab)||S.crmBundleTab===tab)return;
 S.crmBundleTab=tab;
 crmDrawBundle(S.crmBundleIndex);
}
function crmBundleFooterHTML(mail,index,locked){
 if(locked||mail?.approved)return '<span class="st done">已批准</span>';
 return `<button id="crm-approve-all" class="btn" ${crmBundleDirty()?'disabled title="请先保存草稿"':''} onclick="${mail?`crmApproveBundleMail(${index})`:'crmSaveBundle(true)'}">${mail?'批准本封':'批准并建草稿'}</button>${mail?'':'<span class="crm-approval-hint">批准全部邮件，并创建 Flow 草稿</span>'}${mail?`<button id="crm-save-draft" class="btn ghost" ${crmBundleDirty()?'':'disabled'} onclick="crmSaveBundle(false)">保存草稿</button>`:''}`;
}
function crmDrawBundle(index=null){
 if(!crmCanOperate()||!S.crmBundleDraft)return;const c=crmTask().crm,locked=c.stage==='done',draft=S.crmBundleDraft,m=index===null?null:draft[index];
 if(index!==null&&!m)return;
 S.crmBundleIndex=index;
 const showVersions=S.crmBundleTab==='versions',showAudience=S.crmBundleTab==='audience';
 const tabs=`<nav class="dw-tabs" aria-label="邮件方案内容">${[['mail','邮件'],['audience','人群 Flow'],['versions','版本']].map(([key,label])=>`<button type="button" class="${(S.crmBundleTab||'mail')===key?'on':''}" ${(S.crmBundleTab||'mail')===key?'aria-current="page"':''} onclick="crmSwitchBundleTab('${key}')">${label}</button>`).join('')}</nav>`;
 const body=m?`<div class="crm-mail-navigation"><button class="btn ghost sm" onclick="crmNavigateBundle(null)">← 返回邮件列表</button><span class="crm-context" style="margin:0">邮件 ${index+1} / ${draft.length} · ${m.delay}</span><span class="spacer"></span><button class="btn ghost sm" ${index===0?'disabled':''} onclick="crmNavigateBundle(${index-1})">上一封</button><button class="btn ghost sm" ${index===draft.length-1?'disabled':''} onclick="crmNavigateBundle(${index+1})">下一封</button></div>${crmMailContentHTML(m,index,locked||m.approved)}`:`<div class="crm-bundle-heading"><h3>邮件</h3><span class="crm-context" style="margin-left:auto">${draft.length} 封</span></div>${draft.map((mail,i)=>`<button class="crm-mail-card" onclick="crmNavigateBundle(${i})"><span class="crm-mail-card-title"><b>${esc(mail.subject)}</b><span class="chip mut">v${mail.version}</span>${crmMailFindings(mail).length?`<span class="crm-risk-count">${crmMailFindings(mail).length} 处需核查</span>`:''}</span><span class="crm-mail-card-excerpt">${esc(mail.body.split(/\n\s*\n/).filter(p=>p.trim()).slice(1,3).join(' '))}</span><span class="crm-mail-card-meta"><span class="chip mut crm-delay-pill">${mail.delay}</span><span class="spacer"></span><span class="st ${mail.approved?'done':'review'}">${mail.approved?'已批准':'待审批'}</span></span></button>`).join('')}`;
 $('dw').innerHTML=`<section class="personal-agent-application" role="dialog" aria-modal="true" aria-label="CRM 邮件方案"><header class="dw-h"><button class="ib" aria-label="关闭" onclick="closeDw()"><i data-lucide="x"></i></button><div style="flex:1"><div class="ty">CRM · 邮件方案</div><h3>Sensica · 放弃结账挽回邮件方案</h3></div></header>${tabs}<div class="dw-b">${showVersions?crmBundleVersionsHTML(c):showAudience?crmAudienceFlowHTML(c):body}</div><footer class="dw-f">${showVersions?'':crmBundleFooterHTML(showAudience?null:m,showAudience?null:index,locked)}</footer></section>`;
 crmMountComments(index);
 $('dw').classList.add('on');$('scrim').classList.add('on');kpIcons();if(typeof syncDrawerExpandControl==='function')syncDrawerExpandControl();
}
function crmMountComments(index){
 const drawer=$('dw'),content=drawer.querySelector?.(':scope>.personal-agent-application');if(!content)return;
 const footer=content.querySelector('.dw-f'),toggle=document.createElement('button');toggle.className='rvb'+(S.crmCommentsOpen?' on':'');toggle.textContent=S.crmCommentsOpen?'评论 ▴':'评论 ▾';toggle.setAttribute('aria-expanded',String(!!S.crmCommentsOpen));toggle.onclick=()=>{S.crmCommentsOpen=!S.crmCommentsOpen;crmDrawBundle(index)};footer.appendChild(toggle);
 const approvalHint=footer.querySelector('.crm-approval-hint');if(approvalHint)footer.appendChild(approvalHint);
 if(!S.crmCommentsOpen)return;
 const c=crmTask().crm,key=S.crmBundleTab==='audience'?'audience':index===null?'all':'mail-'+index;c.commentThreads=c.commentThreads||{};
 const thread=c.commentThreads[key]||(c.commentThreads[key]={id:'crm-comment-'+key,ttl:S.crmBundleTab==='audience'?'人群 Flow':index===null?'整套邮件方案':`邮件 ${index+1} · ${c.mails[index].delay}`,sub:[]});
 const split=document.createElement('div');split.className='dw-artifact-split';content.classList.add('dw-artifact-content');drawer.appendChild(split);split.appendChild(content);
 const resize=document.createElement('div');resize.className='dw-comment-resize';resize.tabIndex=0;resize.setAttribute('role','separator');resize.setAttribute('aria-label','调整评论宽度');
 const aside=document.createElement('aside');aside.className='dw-artifact-comments';aside.setAttribute('aria-label','邮件方案评论');aside.innerHTML=subPane(thread,null).replaceAll('subSend(','crmBundleCommentSend(');split.append(resize,aside);mountDrawerCommentResize(split,resize);
}
function crmBundleCommentSend(kind,id){
 if(!crmCanOperate())return;
 const c=crmTask().crm,key=S.crmBundleTab==='audience'?'audience':S.crmBundleIndex===null?'all':'mail-'+S.crmBundleIndex,thread=c.commentThreads?.[key];if(!thread||thread.id!==id)return;
 const input=$('si'),draft=caGet('sub',id,null);if(!input||!caReady(draft))return;
 const tx=input.value.trim(),attachments=caFiles(draft);if(!tx&&!attachments.length){toast('先写点什么或添加附件');return;}
 thread.sub.push({w:currentUser(),k:kind==='chg'?'chg':undefined,tx,attachments,at:'刚刚'});caClear(draft);crmDrawBundle(S.crmBundleIndex);$('sl')?.scrollTo?.(0,$('sl').scrollHeight);toast(kind==='chg'?'修改要求已记录':'已留言');
}
function crmBundleDirty(){return !!S.crmBundleDraft?.some((m,i)=>['subject','body'].some(key=>m[key]!==crmTask()?.crm.mails[i]?.[key]));}
function crmNavigateBundle(index){
 if(!crmCanOperate())return;
 if(!crmBundleDirty()){crmDrawBundle(index);return;}
 S.crmPendingNavigation=index;
 $('mod').innerHTML=`<section class="mbox confirm-modal" role="dialog" aria-modal="true" aria-labelledby="crm-unsaved-title"><div class="mhd"><h3 id="crm-unsaved-title">保存邮件修改？</h3><button class="ib" aria-label="关闭" onclick="closeMod()">×</button></div><div class="mbd">当前有未保存的修改，是否保存后继续？</div><div class="mft"><button class="btn" onclick="crmResolveNavigation(true)">保存并继续</button><button class="btn ghost" onclick="crmResolveNavigation(false)">不保存</button><button class="btn ghost" onclick="closeMod()">取消</button></div></section>`;
 $('mod').classList.add('on');
}
function crmResolveNavigation(save){
 if(!crmCanOperate())return;
 const index=S.crmPendingNavigation;
 if(save){if(!crmSaveBundle(false,true))return;}else S.crmBundleDraft=crmTask().crm.mails.map(m=>({...m}));
 closeMod();crmDrawBundle(index);
}
function crmEditBundleField(index,key,value){
 if(!crmCanOperate()||crmTask().crm.stage==='done'||crmTask().crm.mails[index]?.approved||!['subject','body'].includes(key))return;
 const m=S.crmBundleDraft?.[index];if(m){m[key]=value;m.approved=false;const button=$('crm-save-draft');if(button)button.disabled=!crmBundleDirty();
  const approve=$('crm-approve-all');if(approve){const approved=S.crmBundleIndex!==null&&S.crmBundleDraft[S.crmBundleIndex]?.approved;approve.disabled=crmBundleDirty()||approved;approve.title=crmBundleDirty()?'请先保存草稿':'';approve.textContent=S.crmBundleIndex===null?'批准并建草稿':approved?'已批准':'批准本封';}
  if(S.crmBundleIndex===index){const review=$('crm-mail-review');for(const field of ['subject','body']){const layer=$('crm-highlight-'+field),input=$('crm-bundle-'+field);if(layer)layer.innerHTML=crmDraftHighlightHTML(m,field,index)+'\n';if(input)crmSyncMailHighlight(field,input);}if(review)review.innerHTML=crmDraftReviewHTML(m,index);}
 }
}
function crmSaveBundle(approve,keepOpen=false){
 if(!crmCanOperate())return;const c=crmTask().crm;if(c.stage==='done'||c.mails.length!==3)return;
 if(approve&&crmBundleDirty()){toast('请先保存草稿，更新审核结果后再批准');return;}
 if(!S.crmBundleDraft||S.crmBundleDraft.length!==c.mails.length)return;
 if(c.mails.some((m,i)=>m.approved&&['subject','body','cta'].some(key=>m[key]!==S.crmBundleDraft[i]?.[key]))){toast('已批准邮件不可修改');return;}
 const values=S.crmBundleDraft.map(m=>({subject:m.subject.trim(),body:m.body.trim(),cta:m.cta}));
 if(values.some(v=>!v.subject||!v.body||!v.cta)){toast('请补齐每封邮件的标题、正文和按钮文案');return;}
 const changedMails=[];
 c.mails.forEach((m,i)=>{
  const v=values[i];
  if(!m.approved&&Object.keys(v).some(key=>v[key]!==m[key])){
   Object.assign(m,v);
   m.version++;
   delete m.reviewer;
   changedMails.push(i+1);
  }
  if(approve){m.approved=true;m.reviewer=U[currentUser()]?.n||currentUser();}
 });
 crmRecordBundleSave(c,changedMails);
 if(approve)crmCompleteDelivery();S.crmBundleDraft=c.mails.map(m=>({...m}));render();if(!keepOpen){if(approve)closeDw();else crmDrawBundle(S.crmBundleIndex);}toast(approve?'整套邮件已批准并交付':'草稿已保存，修改的邮件需重新批准');return true;
}
function crmApproveBundleMail(index){
 if(!crmCanOperate())return;const c=crmTask().crm,m=c.mails[index];
 if(c.stage!=='review'||!m||m.approved||index!==S.crmBundleIndex)return;
 if(crmBundleDirty()){toast('请先保存草稿，更新审核结果后再批准');return;}
 if(!m.subject.trim()||!m.body.trim()||!m.cta.trim())return;
 m.approved=true;m.reviewer=U[currentUser()]?.n||currentUser();crmCompleteDelivery();
 S.crmBundleDraft=c.mails.map(mail=>({...mail}));render();
 if(c.stage==='done')closeDw();else crmDrawBundle(index);
 toast(c.stage==='done'?'全部邮件已批准并交付':'本封邮件已批准');
}
function crmIntentHTML(c){return `<div class="bub me intent-card"><div class="who"><span class="avs" style="background:var(--primary)">NO</span><span class="nm">Nova</span><span class="tm">刚刚</span></div>${esc(c.brief)}</div>`;}
function crmPlanHTML(c){return `<div class="bub"><div class="who"><span class="avs" style="background:var(--primary)">CR</span><span class="nm">CRM 生命周期运营</span><span class="chip dom">计划 v${c.planVersion||1}</span><span class="tm">${c.stage==='todo'?'待确认':c.stage==='product'?'已确认 · 待补充':c.stage==='done'?'已确认 · 已完成':'已确认 · 执行中'}</span></div><p class="prestart-summary">CRM Agent 读取结账信息，生成 3 封英文挽回邮件。整套邮件由你审核批准后交付。</p><div class="prestart-plan-actions">${c.stage==='todo'?`<button class="btn ghost sm" onclick="crmEditPlan()">调整计划 ↗</button><button class="btn ghost sm" onclick="crmEditPlan()">手动调整</button><button class="btn sm" onclick="crmConfirmPlan()">确认并开始</button>`:'<button class="btn ghost sm" onclick="promoteThread()">变成例行 ↗</button>'}</div></div>`;}
function crmEditPlan(){
 if(!crmCanOperate()||crmTask().crm.stage!=='todo')return;
 const c=crmTask().crm;closeDw();
 $('dw').innerHTML=`<section class="personal-agent-application" role="dialog" aria-modal="true" aria-label="调整 CRM 计划"><header class="dw-h"><button class="ib" aria-label="关闭" onclick="closeDw()"><i data-lucide="x"></i></button><div><div class="ty">CRM 生命周期运营</div><h3>调整任务需求与计划</h3></div></header><div class="dw-b"><div class="pa-question"><h3><label for="crm-plan-brief">任务描述</label></h3><textarea id="crm-plan-brief" rows="7">${esc(c.brief)}</textarea></div><p class="crm-context">邮件安排：结账后 +1 小时提醒、+24 小时解答顾虑、+72 小时最后提醒。邮件均需人工批准；发送前复核授权与订单状态。</p></div><footer class="dw-f"><button class="btn" onclick="crmSavePlan()">保存计划</button><button class="btn ghost" onclick="closeDw()">取消</button></footer></section>`;
 $('dw').classList.add('on');$('scrim').classList.add('on');kpIcons();
}
function crmSavePlan(){if(!crmCanOperate()||crmTask().crm.stage!=='todo')return;const value=$('crm-plan-brief').value.trim();if(!value){toast('请填写任务描述');return;}const c=crmTask().crm;if(value!==c.brief){c.brief=value;c.planVersion=(c.planVersion||1)+1;}closeDw();render();}
function crmThreadHTML(t){
 const c=t.crm,approved=c.mails.filter(m=>m.approved).length;
 return `<div class="wrap thread-wrap"><div class="th-hd"><div class="crumb">工作 › 日常 › 任务</div><h2>${esc(t.t)}</h2><div class="th-meta"><span class="st ${t.st}">${STN[t.st]}</span><span class="chip dom">用户运营</span><span class="chip lv">M1 人工审批</span><span class="chip mut">由 Nova 发起</span></div><p class="crm-context">示例客户数据 · Shopify / Klaviyo 尚未连接</p><div class="th-stats"><div class="ts"><div class="l">主 Agent</div><div class="v thread-agent-list" style="display:flex;align-items:center;gap:4px">${AV('crm',20)}<span class="odot on"></span>CRM 生命周期运营</div></div><div class="ts"><div class="l">产出</div><div class="v num">${t.outputCount}</div></div><div class="ts"><div class="l">更新</div><div class="v">${t.up}</div></div></div></div><div class="spine">${crmNode('意图 · INTENT',crmIntentHTML(c))}${crmNode('计划 · PLAN',crmPlanHTML(c),c.stage==='todo'?'wait':'ok')}${crmProductNode(c)}${crmRunningHTML(c)}${c.mails.length?crmNode('产出 · ARTIFACT',crmArtifactHTML(c),c.mails.every(m=>m.approved)?'ok':'wait'):''}${crmDeliveryHTML(t)}</div>${crmConversationHTML(t)}</div>`;
}
function crmSaveBrief(value){if(crmCanOperate()&&crmTask().crm.stage==='todo')crmTask().crm.brief=value;}
function crmDeliveryHTML(t){return `<div class="node ${t.crm.stage==='done'?'ok':''}" id="delivery-${t.id}"><div class="nlab">交付 · DELIVERY</div><div class="bub" style="color:var(--t2)">${t.crm.stage==='todo'?'计划待确认，尚未开始执行。':t.crm.stage==='product'?'请选择推广产品，确认后生成邮件草稿。':t.crm.stage==='generating'?'执行中，尚未生成产出。':t.crm.stage==='done'?'✓ 已交付：<b style="color:var(--t1)">Sensica · 放弃结账挽回邮件方案</b>，已沉淀到知识库作为可信来源。':'本线程的交付物为 <b style="color:var(--t1)">Sensica · 放弃结账挽回邮件方案</b>。上方产出批准后自动收口。'}</div></div>`;}
function crmCompleteDelivery(){
 const t=crmTask();if(!t||t.crm.stage==='done'||t.crm.mails.length!==3||t.crm.mails.some(m=>!m.approved))return;
 t.crm.stage='done';t.st='done';t.up='刚刚';t.crm.deliveredAt=new Date().toISOString();
 // Preview the draft-creation receipt only; this demo never calls Klaviyo.
 t.crm.flowDraft={id:'WBV5mK',status:'draft',createdAt:t.crm.deliveredAt,mails:t.crm.mails.map(m=>({subject:m.subject,body:m.body,delay:m.delay})),enabled:false,sent:false,demo:true};
 S.crmDeliveredOutputs=S.crmDeliveredOutputs||[];
 if(!S.crmDeliveredOutputs.some(x=>x.taskId===t.id))S.crmDeliveredOutputs.push({taskId:t.id,title:t.t,version:t.crm.version||1,mails:t.crm.mails.map(m=>({...m})),at:t.crm.deliveredAt});
}
function crmConversationHTML(t){return `<div class="card" style="margin-top:var(--sp-5)"><div class="card-t">对话 <span class="chip mut">${(t.cmts||[]).length}</span></div><div id="cl">${convList(t)}</div><div class="cbox" ${caDropAttrs('task',t.id)}><span class="avs" style="background:${U.du.c}">NO</span><div style="flex:1;min-width:0;position:relative"><div id="m-ci"></div><textarea id="ci" rows="3" oninput="onKey(event,'ci');caRemember('task','${t.id}',this.value)" placeholder="补充任务需求或留言…">${esc(caGet('task',t.id).text)}</textarea>${caComposerHTML('task',t.id)}<div class="cbar"><button class="btn ghost sm" data-mention-toggle onclick="showMent('ci',false,this)">@ 提到</button>${caAttachButton('task',t.id)}<button class="btn sm" onclick="crmAddComment()">发送</button></div></div></div></div>`;}
function crmAddComment(){
 if(!crmCanOperate())return;const t=crmTask(),input=$('ci'),draft=caGet('task',t.id);if(!input||!caReady(draft))return;
 const tx=input.value.trim(),attachments=caFiles(draft);if(!tx&&!attachments.length)return;
 t.cmts.push({w:currentUser(),tx,attachments,at:'刚刚'});caClear(draft);render();toast('已发送');
}
const CRM_CAMPAIGN_PRODUCTS=['Sensilift','Sensifirm','Sensilight Mini','Sensilight Pro','Sensilight ICE','品牌层面（不指定具体产品）'];
function crmConfirmPlan(){
 if(!crmCanOperate())return;const t=crmTask(),c=t.crm;
 if(c.stage!=='todo')return;
 if(!c.brief.trim()){toast('请填写任务描述');return;}
 c.stage='product';c.productDraft=CRM_CAMPAIGN_PRODUCTS[0];t.st='ask';render();
}
function crmProductNode(c){
 if(c.stage==='todo')return '';
 if(c.product)return typeof threadAnsweredNode==='function'?threadAnsweredNode(`<b>推广产品：${esc(c.product)}</b>`):crmNode('你的补充 · ANSWERED',`<div class="bub me">推广产品：${esc(c.product)}</div>`);
 if(c.stage!=='product')return '';
 return crmNode('需要你补充 · CLARIFY',`<div class="bub crm-product-form"><section class="crm-product-panel" aria-labelledby="crm-product-heading"><h3 id="crm-product-heading">这些流程主要推哪个产品？</h3><p class="crm-context">选择本次邮件的推广产品，确认后生成草稿。</p><div class="crm-product-options" role="radiogroup" aria-labelledby="crm-product-heading">${CRM_CAMPAIGN_PRODUCTS.map((product,index)=>`<label><input type="radio" name="crm-product" value="${index}" ${product===c.productDraft?'checked':''} onchange="crmSelectProduct(${index})"><span>${product}</span></label>`).join('')}</div><button class="btn" onclick="crmGenerate()">用这个选择生成草稿</button></section></div>`,'wait');
}
function crmSelectProduct(index){
 if(!crmCanOperate())return;const c=crmTask().crm;
 if(c.stage==='product'&&CRM_CAMPAIGN_PRODUCTS[index])c.productDraft=CRM_CAMPAIGN_PRODUCTS[index];
}
function crmGenerate(){
 if(!crmCanOperate())return;const t=crmTask(),c=t.crm;if(c.stage!=='product'||!CRM_CAMPAIGN_PRODUCTS.includes(c.productDraft))return;
 c.product=c.productDraft;c.version=(c.version||0)+1;
 c.stage='generating';c.progress=8;c.progressText='正在读取任务需求与邮件安排…';c.generationToken=(c.generationToken||0)+1;const token=c.generationToken;t.st='run';t.up='刚刚';render();
 const steps=[{p:35,text:'正在起草结账提醒与顾虑解答邮件…'},{p:72,text:'正在生成最后提醒，检查语气和功效表述…'},{p:100,text:'邮件检查完成，准备提交审核'}];
 steps.forEach((step,i)=>setTimeout(()=>{
  if(crmTask()!==t||c.stage!=='generating'||c.generationToken!==token)return;
  c.progress=step.p;c.progressText=step.text;
  if(i===steps.length-1)crmBuildMails(t);else render();
 },(i+1)*1500));
}
function crmRunningHTML(c){return c.stage==='generating'?crmNode('执行 · RUNNING',`<div class="live"><div class="live-h"><span class="spin"></span><span class="t">CRM 正在生成邮件方案</span><span class="e">${c.progress}%</span></div><div class="live-t">${esc(c.progressText)}</div><div class="pbar" role="progressbar" aria-label="邮件生成进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${c.progress}"><i style="width:${c.progress}%"></i></div></div>`,'act'):'';}
function crmDefaultPreview(){
 const t=crmTask();if(!t||t.crm.stage!=='todo'||t.crm.mails.length)return;
 t.crm.product=CRM_CAMPAIGN_PRODUCTS[0];t.crm.productDraft=t.crm.product;t.crm.version=1;
 crmBuildMails(t,true);
}
function crmBuildMails(t,silent=false){
 const c=t.crm;
 c.mails=[
 {delay:'结账后 +1 小时',purpose:'温和提醒尚未完成的结账，帮助客户继续了解和选购。',subject:'A little more time to decide on Sensica?',body:'Hi there,\n\nYou started checking out with Sensica but did not finish your order. If you were interrupted, you can return to checkout whenever you are ready.\n\nChoosing a device for your routine deserves a little thought. Take another look at the product details and suitability information to decide whether it is right for you.\n\nIf something was unclear, our team is here to help you find an answer.\n\nThe Sensica Team',cta:'Return to checkout'},
 {delay:'结账后 +24 小时',purpose:'回应配送、退货、保修与使用方面的顾虑，提供清晰的决策指引。',subject:'A few answers before you choose',body:'Hi there,\n\nStill weighing up your Sensica order? You may want to check delivery options, the returns policy or warranty coverage before making a decision.\n\nProfessional anti-aging without the clinic, visible results in 7 days.\n\nYou can find those details on our website. For questions about using a device, start with its product information and instructions, including the suitability and safety guidance.\n\nIf you cannot find what you need, contact our team. We would be happy to point you in the right direction.\n\nThe Sensica Team',cta:'Review your order'},
 {delay:'结账后 +72 小时',purpose:'最后一次轻量提醒，尊重客户选择，不增加折扣或紧迫感。',subject:'One last note about your Sensica order',body:'Hi there,\n\nWe wanted to leave you one final reminder about the Sensica order you started. If you would like to continue, you can return to checkout and review your selection.\n\nThere is no need to rush. Check the current price, availability and product information before deciding what works for you.\n\nIf now is not the right time, that is fine too. Thank you for considering Sensica.\n\nThe Sensica Team',cta:'Return to your order'}
 ].map(m=>({...m,product:c.product,subject:c.product&&c.product!==CRM_CAMPAIGN_PRODUCTS[5]?m.subject.replaceAll('Sensica',c.product):m.subject,body:c.product&&c.product!==CRM_CAMPAIGN_PRODUCTS[5]?m.body.replace('product details',c.product+' product details').replaceAll('Sensica order',c.product+' order'):m.body,approved:false,version:1}));
 c.versions=[{version:c.version||1,label:'生成邮件方案',at:new Date().toISOString()}];
 c.stage='review';t.st='review';t.outputCount=1;t.up='刚刚';if(!silent){render();toast('已生成 3 封邮件，请审核后交付');}
}
function crmOpenMail(index){
 if(!crmCanOperate())return;const c=crmTask().crm,m=c.mails[index];if(!m)return;
 closeDw();S.crmMail=index;const locked=c.stage==='done';
 $('dw').innerHTML=`<section class="personal-agent-application" role="dialog" aria-modal="true" aria-label="CRM 邮件审核"><header class="dw-h"><button class="ib" aria-label="关闭" onclick="closeDw()"><i data-lucide="x"></i></button><div style="flex:1"><div class="ty">CRM · 邮件 ${index+1} · ${m.delay}</div><h3>放弃结账挽回邮件</h3></div><span class="st ${m.approved?'done':'review'}">${m.approved?'已批准':'待审批'}</span></header><div class="dw-b"><p class="crm-context">${esc(m.purpose)}</p><div class="pa-question"><h3><label for="crm-subject">邮件标题</label></h3><input class="pa-other-tool" id="crm-subject" value="${esc(m.subject)}" ${locked?'disabled':''}></div><div class="pa-question"><h3><label for="crm-body">邮件正文</label></h3><textarea id="crm-body" rows="14" ${locked?'disabled':''}>${esc(m.body)}</textarea></div><div class="pa-question"><h3><label for="crm-cta">按钮文案</label></h3><input class="pa-other-tool" id="crm-cta" value="${esc(m.cta)}" ${locked?'disabled':''}></div><p class="crm-context">返回结账：{{ checkout_url }}<br>邮件页脚：退订链接 {{ unsubscribe_url }} · Sensica 邮寄地址 {{ postal_address }}<br>客户信息和链接在发送前由渠道数据填充。</p></div><footer class="dw-f">${locked?'<button class="btn ghost" onclick="closeDw()">完成</button>':`<button class="btn" onclick="crmSaveMail(${index},true)">保存并批准</button><button class="btn ghost" onclick="crmSaveMail(${index},false)">保存草稿</button>`}</footer></section>`;
 $('dw').classList.add('on');$('scrim').classList.add('on');kpIcons();if(typeof syncDrawerExpandControl==='function')syncDrawerExpandControl();
}
function crmSaveMail(index,approve){
 if(!crmCanOperate())return;const c=crmTask().crm,m=c.mails[index];if(!m||m.approved||c.stage==='done')return;
 const subject=$('crm-subject').value.trim(),body=$('crm-body').value.trim(),cta=$('crm-cta').value.trim();if(!subject||!body||!cta){toast('请补齐标题、正文和按钮文案');return;}
 const changed=subject!==m.subject||body!==m.body||cta!==m.cta;Object.assign(m,{subject,body,cta,approved:approve});if(changed){m.version++;crmRecordBundleSave(c,[index+1]);}if(approve)m.reviewer=U[currentUser()]?.n||currentUser();if(approve)crmCompleteDelivery();closeDw();render();toast(approve?'邮件已批准':'草稿已保存，需重新批准');
}
function crmApprove(index){if(!crmCanOperate())return;const c=crmTask().crm,m=c.mails[index];if(!m||m.approved||c.stage==='done')return;m.approved=true;m.reviewer=U[currentUser()]?.n||currentUser();crmCompleteDelivery();render();}
