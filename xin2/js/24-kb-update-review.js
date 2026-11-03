/* Brand knowledge entry review; pending suggestions never overwrite active content. */
const KB_UPDATE_SOURCE={
 sourceLabel:'品牌文件《Neil test KB1 渠道与人群更新测试.txt》v1',generatedAt:'2026-10-29T15:59:02+09:00',
 detailUrl:'https://testagent.xdigate.cn/app/documents/6ae2ebd9cad08af270c6df60/',
 sharepointUrl:'https://xdigate.sharepoint.com/sites/test/Shared%20Documents/X-digate-%E6%B5%8B%E8%AF%95%E7%8E%AF%E5%A2%83/Tru%20Niagen/%E5%93%81%E7%89%8C%E6%96%87%E4%BB%B6/Neil%20test%20KB1%20%E6%B8%A0%E9%81%93%E4%B8%8E%E4%BA%BA%E7%BE%A4%E6%9B%B4%E6%96%B0%E6%B5%8B%E8%AF%95.txt'
};
function kbBrandUpdatesEnsure(){
 KNOWLEDGE_BRANDS.forEach(brand=>brand.entries.forEach(kbEnsureEntryVersions));
 const brand=KNOWLEDGE_BRANDS.find(b=>b.id==='a8oparis');
 for(const entry of (brand?.entries||[]).filter(e=>['k1','k2'].includes(e.id))){
 if(entry.updateReviewSeeded)continue;
 entry.updateReviewSeeded=true;entry.version=entry.version||1;
 if(entry.id==='k1'&&entry.version===1&&!entry.updateReviews?.length){
  // Seed one prior approved version so the restore action is visible on first open.
  const before='A8OPARIS 定位在专业修护，价格带 300–600 元。品牌传播侧重产品信息与基础使用体验。';
  const at='2026-06-12T10:00:00+09:00';
  entry.version=2;entry.knowledgeVersions=[{version:1,text:before,at:'2026/05/20',by:'Sophie',kind:'initial'},{version:2,text:entry.tx,at,by:'Sophie',kind:'approved'}];
  entry.updateReviews=[{baseVersion:1,version:2,baseText:before,beforeText:before,nextText:entry.tx,sourceLabel:'品牌资料复核',internalSource:true,agent:'品牌团队',generatedAt:at,detectedAt:at,approvedAt:at,decision:'approved',reviewer:'Sophie',changeSummary:'补充敏感肌定位与本季品牌传播的表达方向。',reason:'品牌团队复核通过。'}];
 }
 if(entry.id==='k2'){
  entry.pendingUpdate={baseVersion:entry.version,version:entry.version+1,baseText:entry.tx,nextText:entry.tx.replace('不主打成分堆料，主打可验证的变化。','不堆砌成分概念，优先说明真实使用体验与有依据的变化。')+'定位表达围绕具体使用场景展开，不将未经验证的信息作为功效承诺。',changeSummary:'调整核心定位的措辞，并补充功效表达的边界。',evidence:[{summary:'原定位强调有依据的变化，而不是单纯堆砌成分概念。',quote:entry.tx,location:'当前已审阅内容 · 品牌核心定位'}],agent:'品牌策略 Agent',reason:'根据近期品牌策略复核，更新核心定位的表达。',...KB_UPDATE_SOURCE,detectedAt:new Date().toISOString(),deferred:false};continue;
 }
 entry.pendingUpdate={baseVersion:entry.version,version:entry.version+1,baseText:entry.tx,nextText:entry.tx.replace('敏感肌可用的专业修护','敏感肌日常修护').replace('用真实证据而非价格话术来化解','优先用真实体验与可核实的产品信息来化解')+'内容围绕换季与日常精简护理展开，产品参数及功效描述以已批准的资料为依据。',changeSummary:'更新修护定位与内容表达，补充日常护理场景和资料引用要求。',evidence:[{summary:'现有品牌资料强调专业感与可负担之间的平衡，并以真实证据支持内容表达。',quote:entry.tx,location:'当前已审阅内容 · 品牌整体理解'}],agent:'品牌资料维护 Agent',reason:'根据近期用户反馈与品牌资料复核，更新品牌整体理解。',...KB_UPDATE_SOURCE,detectedAt:new Date().toISOString(),deferred:false};
 }
 if(typeof kbEnsureInsightSections==='function')kbEnsureInsightSections();
}
function kbFindKnowledgeItem(id){return knowledgeBrandEntries().flatMap(entry=>[entry,...(entry.sections||[])]).find(e=>e.id===id)||null;}
function kbBrandReviewEntry(id){
 kbBrandUpdatesEnsure();if(!permissionHasPage('know.src')||knowledgeActiveBrand().status==='disabled')return null;
 return kbFindKnowledgeItem(id);
}
function kbEnsureEntryVersions(entry){
 entry.version=entry.version||1;
 if(!entry.knowledgeVersions)entry.knowledgeVersions=entry.filled?[{version:entry.version,text:entry.tx,at:entry.at,by:entry.by||'品牌团队',kind:'initial'}]:[];
}
function kbAppendEntryVersion(entry,at,by,kind){
 kbEnsureEntryVersions(entry);
 if(!entry.knowledgeVersions.some(v=>v.version===entry.version))entry.knowledgeVersions.push({version:entry.version,text:entry.tx,at,by,kind});
}
function kbRecordManualKnowledgeUpdate(entry,text){
 if(text===entry.tx)return;kbEnsureEntryVersions(entry);
 const actor=U[currentUser()]?.n||currentUser(),at=new Date().toISOString(),baseVersion=entry.version;
 entry.updateReviews=entry.updateReviews||[];entry.updateReviews.push({baseVersion,version:baseVersion+1,baseText:entry.tx,nextText:text,sourceLabel:'人工编辑',agent:actor,internalSource:true,generatedAt:at,detectedAt:at,approvedAt:at,decision:'approved',kind:'manual',reviewer:actor,changeSummary:'手动编辑并保存品牌知识内容。',reason:'人工保存'});
 entry.version++;entry.knowledgeVersions.push({version:entry.version,text,at,by:actor,kind:'manual'});
}
function kbHistoryTime(at){if(!at)return '未记录时间';if(/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(at))return at.replace(/-/g,'/');const date=new Date(at);return Number.isNaN(date.getTime())?at:date.toLocaleString('zh-CN',{timeZone:'Asia/Tokyo',hour12:false});}
function kbHistoryRestoreAction(entry,version){
 const v=entry.knowledgeVersions.find(x=>x.version===version);if(!v||version===entry.version)return '';
 const pending=!!entry.pendingUpdate||entry.sections?.some(s=>s.pendingUpdate),disabled=pending||v.text===entry.tx;
 return `<button class="btn ghost sm" ${disabled?'disabled':''} title="${pending?'请先处理待审批更新':v.text===entry.tx?'与当前内容相同':'恢复为新版本，保留全部历史记录'}" onclick="kbOpenRestoreVersion('${entry.id}',${version})">恢复此版本</button>`;
}
function kbHistoryCardHTML(entry,record){
 const ignored=record.decision==='ignored',rejected=record.decision==='rejected'||ignored,current=!rejected&&record.version===entry.version;
 const name=ignored?'更新建议已忽略':rejected?'更新建议已忽略':record.kind==='rollback'?'恢复历史版本':record.kind==='manual'?'手动更新':'自动更新已通过';
 return `<article class="kb-history-item"><header class="kb-history-card-head"><span class="kb-history-version">${rejected?'建议':'v'+record.version}</span><div class="kb-history-card-title"><div class="kb-history-title-line"><b>${name}</b><span class="st ${current?'done':rejected?'review':'todo'}">${current?'当前版本':rejected?(ignored?'已忽略':'已忽略'):'历史版本'}</span></div><div class="kb-history-meta">${esc(record.reviewer)}<span> · </span>${esc(kbHistoryTime(record.approvedAt||record.rejectedAt||record.ignoredAt))}</div></div><div class="kb-history-header-actions"><button class="btn ghost sm" onclick="kbOpenBrandUpdate('${entry.id}','diff',${record.index})">查看对比</button>${!rejected?kbHistoryRestoreAction(entry,record.version):''}</div></header></article>`;
}
function kbInitialHistoryCardHTML(entry,initial){
 const restore=kbHistoryRestoreAction(entry,initial.version);
 return `<article class="kb-history-item"><header class="kb-history-card-head"><span class="kb-history-version">v${initial.version}</span><div class="kb-history-card-title"><div class="kb-history-title-line"><b>初始版本</b>${initial.version===entry.version?'<span class="st done">当前版本</span>':'<span class="st todo">历史版本</span>'}</div><div class="kb-history-meta">${esc(initial.by)}<span> · </span>${esc(kbHistoryTime(initial.at))}</div></div>${restore?`<div class="kb-history-header-actions">${restore}</div>`:''}</header><details class="kb-history-initial"><summary><span class="kb-history-show">查看内容</span><span class="kb-history-hide">收起内容</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary><div class="kb-history-content"><p>${esc(initial.text)}</p></div></details></article>`;
}
function kbShowBrandHistory(id){
 const entry=kbBrandReviewEntry(id);if(!entry){toast('无法查看此条目的更新记录');return;}
 const brand=knowledgeActiveBrand(),expanded=$('dw').classList.contains('expanded');closeDw();S.kb=id;S.kbtab=3;
 const drawer=$('dw');if(expanded)drawer.classList.add('expanded');
 const records=(entry.updateReviews||[]).map((r,index)=>({...r,index})).reverse(),initial=entry.knowledgeVersions[0];
 drawer.innerHTML=`<section class="kb-update-drawer" role="dialog" aria-modal="true" aria-label="品牌知识更新记录"><header class="dw-h"><button class="ib" aria-label="关闭更新记录" onclick="closeDw()"><i data-lucide="x"></i></button><div style="flex:1;min-width:0"><div class="ty">${esc(brand.name)} · ${esc(entry.cat)}</div><h3>${esc(entry.n)}</h3></div><span class="chip mut">当前 v${entry.version}</span></header>${kbBrandTabsHTML(id,3)}<div class="dw-b">${typeof kbInsightBreadcrumbHTML==='function'?kbInsightBreadcrumbHTML(entry):''}<p class="kb-history-hint">已通过的历史版本可恢复为新版本，现有记录会完整保留。${entry.pendingUpdate?'请先处理待审批的更新建议，再恢复历史版本。':''}</p><div class="kb-history-list">${records.map(r=>kbHistoryCardHTML(entry,r)).join('')}${initial?kbInitialHistoryCardHTML(entry,initial):'<div class="allclear">暂无更新记录</div>'}</div></div><footer class="dw-f"><button class="btn ghost" onclick="closeDw()">完成</button></footer></section>`;
 drawer.classList.add('on');$('scrim').classList.add('on');kpIcons();if(typeof syncDrawerExpandControl==='function')syncDrawerExpandControl();
}
function kbOpenRestoreVersion(id,version){
 const entry=kbBrandReviewEntry(id),target=entry?.knowledgeVersions.find(v=>v.version===version);
 if(!entry||!target||target.version===entry.version||target.text===entry.tx){toast('当前无需恢复此版本');return;}
 if(entry.pendingUpdate||entry.sections?.some(s=>s.pendingUpdate)){toast('请先处理待审批的更新建议');return;}
 S.kbRestoreDraft={id,brand:knowledgeActiveBrand().id,version,expectedVersion:entry.version,expectedText:entry.tx};
 $('mod').innerHTML=`<section class="mbox kb-restore-modal" role="dialog" aria-modal="true" aria-labelledby="kb-restore-title"><div class="mhd"><h3 id="kb-restore-title">恢复历史版本？</h3><button class="ib" aria-label="关闭" onclick="closeMod()">×</button></div><div class="mbd"><b>${esc(entry.n)}</b><p>将 v${version} 的内容恢复为新版本 v${entry.version+1}，当前版本与全部更新记录都会保留。</p></div><div class="mft"><button class="btn" onclick="kbConfirmRestoreVersion()">确认恢复</button><button class="btn ghost" onclick="closeMod()">取消</button></div></section>`;
 $('mod').classList.add('on');
}
function kbConfirmRestoreVersion(){
 const draft=S.kbRestoreDraft;if(!draft||!$('mod').classList.contains('on'))return;
 const entry=kbBrandReviewEntry(draft.id),target=entry?.knowledgeVersions.find(v=>v.version===draft.version);
 if(!entry||!target||knowledgeActiveBrand().id!==draft.brand||entry.pendingUpdate||entry.sections?.some(s=>s.pendingUpdate)||entry.version!==draft.expectedVersion||entry.tx!==draft.expectedText){toast('内容或权限已变化，请重新核对后恢复');return;}
 const actor=U[currentUser()]?.n||currentUser(),at=new Date().toISOString(),version=entry.version+1;
 const record={baseVersion:entry.version,version,baseText:entry.tx,nextText:target.text,sourceLabel:'版本恢复 · v'+target.version,internalSource:true,agent:actor,generatedAt:at,detectedAt:at,approvedAt:at,decision:'approved',kind:'rollback',restoredFrom:target.version,reviewer:actor,changeSummary:'将历史 v'+target.version+' 的内容恢复为新版本 v'+version+'。',reason:'人工确认恢复历史内容。'};
 entry.updateReviews=entry.updateReviews||[];entry.updateReviews.push(record);entry.tx=target.text;entry.version=version;entry.by=actor;entry.at=new Date(at).toLocaleDateString('sv-SE',{timeZone:'Asia/Tokyo'}).replace(/-/g,'/');entry.filled=1;entry.stale=0;entry.gov='ok';kbAppendEntryVersion(entry,at,actor,'rollback');
 if(entry.sections&&target.sections){
  for(const section of entry.sections){const snapshot=target.sections.find(s=>s.id===section.id);if(snapshot){section.tx=snapshot.tx;section.by=actor;section.at=entry.at;}}
  entry.knowledgeVersions.at(-1).sections=typeof kbInsightSnapshot==='function'?kbInsightSnapshot(entry):target.sections.map(s=>({...s}));
 }
 if(typeof kbSyncInsightParent==='function')kbSyncInsightParent(entry);S.kbRestoreDraft=null;closeMod();render();kbShowBrandHistory(entry.id);toast('已恢复为 v'+version+'，历史记录已保留');
}
function kbBrandUpdateStatus(entry){
 if(entry.sections){const count=entry.sections.filter(s=>s.pendingUpdate).length;return count?`<span class="kb-update-badge">更新待审批</span>`:'';}
 return entry.pendingUpdate?`<span class="kb-update-badge">${entry.pendingUpdate.deferred?'更新暂缓':'更新待审批'}</span>`:'';
}
function kbBrandTabsHTML(id,active=0){
 const entry=kbFindKnowledgeItem(id),tabs=[{label:'内容',index:0},{label:'使用情况',index:1},{label:'更新记录',index:3}];
 if(entry?.pendingUpdate||entry?.sections?.some(s=>s.pendingUpdate))tabs.unshift({label:'更新建议',index:2});
 return `<div class="dw-tabs" role="tablist" aria-label="品牌知识详情">${tabs.map(({label,index})=>`<button type="button" class="${active===index?'on':''}" role="tab" aria-selected="${active===index}" onclick="openKB('${id}',${index})">${label}</button>`).join('')}</div>`;
}
function kbTextDiff(before,after){
 const a=Array.from(before),b=Array.from(after),ops=[];
 const push=(kind,text)=>{if(!text)return;const last=ops.at(-1);if(last?.kind===kind)last.text+=text;else ops.push({kind,text});};
 if(a.length*b.length>1000000){push('removed',before);push('added',after);return ops;}
 const table=Array.from({length:a.length+1},()=>new Uint32Array(b.length+1));
 for(let i=a.length-1;i>=0;i--)for(let j=b.length-1;j>=0;j--)table[i][j]=a[i]===b[j]?table[i+1][j+1]+1:Math.max(table[i+1][j],table[i][j+1]);
 let i=0,j=0;while(i<a.length&&j<b.length){if(a[i]===b[j]){push('same',a[i++]);j++;}else if(table[i+1][j]>=table[i][j+1])push('removed',a[i++]);else push('added',b[j++]);}
 push('removed',a.slice(i).join(''));push('added',b.slice(j).join(''));return ops;
}
function kbTextDiffHTML(ops,side){
 return ops.filter(o=>side==='combined'||o.kind!== (side==='before'?'added':'removed')).map(o=>o.kind==='same'?esc(o.text):`<${o.kind==='added'?'ins':'del'}>${esc(o.text)}</${o.kind==='added'?'ins':'del'}>`).join('');
}
function kbReviewBodyHTML(update,ops,mode){
 if(mode==='parallel')return `<div class="kb-parallel-grid"><section><h4>原文 · v${update.baseVersion}</h4><div class="kb-parallel-text">${esc(update.baseText)}</div></section><section><h4>修改对比 · v${update.version}</h4><div class="kb-parallel-text">${kbTextDiffHTML(ops,'combined')}</div></section></div>`;
 return mode==='original'?esc(update.baseText):mode==='preview'?esc(update.nextText):kbTextDiffHTML(ops,'combined');
}
function kbSwitchBrandUpdateView(id,mode){kbOpenBrandUpdate(id,mode,S.kbReviewEntry===id?S.kbReviewIndex:null);$('kb-review-tab-'+mode)?.focus({preventScroll:true});}
function kbUpdateEvidenceHTML(update){
 const evidence=update.evidence||[];if(!evidence.length)return '';
 return `<section class="kb-update-evidence"><b>依据（${evidence.length} 条）</b>${evidence.map(item=>`<article><p>${esc(item.summary)}</p><blockquote>${esc(item.quote)}</blockquote><small>${esc(item.location)}</small></article>`).join('')}</section>`;
}
function kbUpdateExplanationHTML(update){
 return `<div class="kb-update-source"><div class="kb-source-visible"><b>来源</b><div class="kb-source-line"><span>${esc(update.sourceLabel||update.agent)}</span><time>生成于 ${esc(new Date(update.generatedAt||update.detectedAt).toLocaleString('zh-CN',{timeZone:'Asia/Tokyo',hour12:false}))}</time></div><div class="kb-source-links">${!update.internalSource?`<a class="kb-source-link" href="${esc(update.detailUrl||KB_UPDATE_SOURCE.detailUrl)}" target="_blank" rel="noopener noreferrer">文档详情</a><a class="kb-source-link" href="${esc(update.sharepointUrl||KB_UPDATE_SOURCE.sharepointUrl)}" target="_blank" rel="noopener noreferrer">在 SharePoint 打开</a>`:''}<button type="button" class="kb-source-more-toggle" aria-expanded="false" aria-controls="kb-source-more-content" onclick="kbToggleSourceMore(this)"><span class="kb-more-closed">查看更多</span><span class="kb-more-open">收起</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button></div></div><div class="kb-update-source-content" id="kb-source-more-content" hidden><section><b>改动摘要</b><p>${esc(update.changeSummary||update.reason)}</p></section><section><b>理由</b><p>${esc(update.reason)}</p></section>${kbUpdateEvidenceHTML(update)}</div></div>`;
}
function kbToggleSourceMore(button){
 const panel=button.closest('.kb-update-source')?.querySelector('.kb-update-source-content');if(!panel)return;
 panel.hidden=!panel.hidden;button.setAttribute('aria-expanded',String(!panel.hidden));
}
function kbOpenBrandUpdate(id,mode='diff',recordIndex=null){
 const entry=kbBrandReviewEntry(id);if(!entry){toast('当前条目不可审批');return;}
 const historical=Number.isInteger(recordIndex)?entry.updateReviews?.[recordIndex]:null;
 if(recordIndex!==null&&!historical){toast('更新记录不存在');return;}
 const pending=historical?null:entry.pendingUpdate,review=historical||entry.updateReviews?.at(-1),u=pending||review;if(!u){openKB(id,0);return;}
 const rejected=!pending&&u.decision==='rejected',ignored=!pending&&u.decision==='ignored';
 const activeMode=['original','diff','parallel','preview'].includes(mode)?mode:'diff';
 const brand=knowledgeActiveBrand(),ops=kbTextDiff(u.baseText,u.nextText),counts={added:ops.filter(o=>o.kind==='added').reduce((sum,o)=>sum+Array.from(o.text).length,0),removed:ops.filter(o=>o.kind==='removed').reduce((sum,o)=>sum+Array.from(o.text).length,0)};
 const expanded=$('dw').classList.contains('expanded');closeDw();S.kb=id;S.kbtab=pending?2:3;S.kbReviewEntry=id;S.kbReviewIndex=historical?recordIndex:null;
 const drawer=$('dw');if(expanded)drawer.classList.add('expanded');
 drawer.innerHTML=`<section class="kb-update-drawer ${activeMode==='parallel'?'kb-review-parallel':''}" role="dialog" aria-modal="true" aria-label="品牌知识更新对比"><header class="dw-h"><button class="ib" aria-label="关闭更新对比" onclick="closeDw()"><i data-lucide="x"></i></button><div style="flex:1;min-width:0"><div class="ty">${esc(brand.name)} · ${esc(entry.cat)}</div><h3>${esc(entry.n)}</h3></div><span class="st ${pending||rejected||ignored?'review':'done'}">${pending?(pending.deferred?'更新暂缓':'更新待审批'):ignored?'更新已忽略':rejected?'更新已忽略':'更新已通过'}</span></header>${kbBrandTabsHTML(id,S.kbtab)}<div class="dw-b">${typeof kbInsightBreadcrumbHTML==='function'?kbInsightBreadcrumbHTML(entry):''}<div class="kb-merged-toolbar"><div class="seg" role="tablist" aria-label="内容显示方式">${[['diff','对比'],['preview','预览'],['parallel','并列']].map(([key,label])=>`<button type="button" id="kb-review-tab-${key}" role="tab" aria-selected="${activeMode===key}" aria-controls="kb-review-body" class="${activeMode===key?'on':''}" onclick="kbSwitchBrandUpdateView('${id}','${key}')">${label}</button>`).join('')}</div></div><div class="kb-merged-document"><div class="kb-merged-meta"><span>${activeMode==='original'?'原文 · v'+u.baseVersion:activeMode==='preview'?'更新后预览 · v'+u.version:'原文 → 更新建议'}</span>${['diff','parallel'].includes(activeMode)?`<span class="kb-merged-counts"><span class="added">+ 新增 ${counts.added} 字</span><span class="removed">− 删除 ${counts.removed} 字</span></span>`:''}</div><article class="kb-merged-body ${activeMode==='parallel'?'kb-parallel-body':''}" id="kb-review-body" role="tabpanel" tabindex="0" aria-labelledby="kb-review-tab-${activeMode}">${kbReviewBodyHTML(u,ops,activeMode)}</article></div>${kbUpdateExplanationHTML(u)}${!pending?`<div class="kb-review-receipt">${esc(u.reviewer)} 于 ${esc(new Date(u.approvedAt||u.rejectedAt||u.ignoredAt).toLocaleString('zh-CN',{timeZone:'Asia/Tokyo',hour12:false}))} ${ignored?'忽略更新':rejected?'忽略更新':'确认通过'}</div>`:''}</div><footer class="dw-f">${pending?`<button class="btn" onclick="kbApproveBrandUpdate('${id}',${u.baseVersion})">确认通过</button><button class="btn ghost" onclick="kbRejectBrandUpdate('${id}')">忽略</button>`:`<button class="btn ghost" onclick="kbShowBrandHistory('${id}')">返回更新记录</button>`}</footer></section>`;
 drawer.classList.add('on');$('scrim').classList.add('on');kpIcons();if(typeof syncDrawerExpandControl==='function')syncDrawerExpandControl();drawer.querySelector('.ib')?.focus({preventScroll:true});
}
function kbApproveBrandUpdate(id,baseVersion){
 const entry=kbBrandReviewEntry(id),u=entry?.pendingUpdate;if(!u){toast('此更新已处理或不可审批');return;}
 if(entry.version!==baseVersion||u.baseVersion!==baseVersion||entry.tx!==u.baseText){toast('当前内容已变化，请重新核对更新');return;}
 const actor=U[currentUser()]?.n||currentUser(),at=new Date().toISOString();
 entry.updateReviews=entry.updateReviews||[];entry.updateReviews.push({...u,beforeText:entry.tx,approvedAt:at,decision:'approved',reviewer:actor});
 entry.tx=u.nextText;entry.version=u.version;entry.filled=1;entry.gov='ok';entry.stale=0;entry.by=actor;entry.at=new Date(at).toLocaleDateString('sv-SE',{timeZone:'Asia/Tokyo'}).replace(/-/g,'/');entry.pendingUpdate=null;
 kbAppendEntryVersion(entry,at,actor,'approved');
 if(typeof kbSyncInsightParent==='function')kbSyncInsightParent(entry);
 closeDw();render();toast('更新已确认通过，品牌知识已更新');
}
function kbRejectBrandUpdate(id){
 const entry=kbBrandReviewEntry(id);if(!entry?.pendingUpdate)return;
 const u=entry.pendingUpdate,actor=U[currentUser()]?.n||currentUser();
 entry.updateReviews=entry.updateReviews||[];entry.updateReviews.push({...u,beforeText:entry.tx,decision:'rejected',rejectedAt:new Date().toISOString(),reviewer:actor});
 entry.pendingUpdate=null;closeDw();render();toast('已忽略更新，原内容保持不变');
}
