/* ============ sub-thread ============ */
function subCount(x){return (x.sub||[]).filter(m=>m.k!=='sys').length;}
function rosterVisibleSub(x){return (x.sub||[]).filter(m=>m.k!=='chg'&&m.k!=='ag'&&m.k!=='sys'&&!AG[m.w]);}
function rosterSubCount(x){return rosterVisibleSub(x).length;}
function subMsgs(arr){
 return (arr||[]).map(m=>{
  if(m.k==='sys')return `<div class="sysln"><span>${esc(m.tx)}</span></div>`;
  const p=U[m.w]||AG[m.w],isAg=!!AG[m.w];
  return `<div class="msg ${m.k==='chg'?'chg':isAg?'ag':''}">
    <span class="avs" style="background:${p.c}">${p.s}</span>
    <div class="bd"><div class="hd"><span class="nm">${p.n}</span>
      ${m.k==='chg'?'<span class="chip mut">对Ai说</span>':''}
      ${isAg?'<span class="chip dom">Agent</span>':''}
      <span class="tm">${m.at}</span></div>
      <div class="tx">${mHTML(m.tx)}</div></div></div>`;
 }).join('')||'<div style="font-size:var(--fs-sm);color:var(--t3);padding:var(--sp-3) 0;text-align:center">还没有评论记录。有判断就写在这里——它只属于这个产出。</div>';
}
function scopeNote(a,oi){
 const kids=a.opts||a.rows||a.plans;
 if(oi===null||oi===undefined)return '这条评论只落在<b>这个产出</b>上，不会打扰线程里的其他产出。';
 const x=kids[oi];
 const group=a.plans?'同一组方案':a.rows?'同一份名单':'同一组方向';
 return '这条评论只落在<b>'+esc(x.t||x.n)+'</b>上——'+group+'里的其他 '+(kids.length-1)+' 个看不到，也不会被改动。';
}
function subPane(a,oi){
 const kids=a.opts||a.rows||a.plans;
 const activeEmail=a.mode==='csa'&&S.dtab===1?activeCSAEmail(a):null;
 const emailThread=activeEmail?(activeEmail.thread=activeEmail.thread||{t:a.csa.customer+' · 客户邮件',sub:[]}):null;
 const x=emailThread||((oi===null||oi===undefined)?a:kids[oi]);
 const label=emailThread?emailThread.t:((oi===null||oi===undefined)?a.ttl:(x.t||x.n));
 const unit=a.plans?'方案':'产出';
 const peopleOnly=a.mode==='roster';
 const visibleSub=peopleOnly?rosterVisibleSub(x):x.sub;
 return `<div class="sub-w">
   <div class="sub-h"><span class="t">评论</span><span class="chip mut">${esc(label.slice(0,18))}</span>
     <span class="s">${subCount({sub:visibleSub})} 条 · 只属于这个${unit}</span></div>
   <div class="sub-l" id="sl">${subMsgs(visibleSub)}
    ${a.inspection?.explaining?`<div style="display:flex;align-items:center;gap:var(--sp-2);padding:var(--sp-3) 0;color:var(--primary);font-size:var(--fs-sm)" role="status"><span class="spin" aria-hidden="true"></span>${esc(nick(a.by)||'店铺巡检')}正在解释…</div>`:''}</div>
   ${a.rows&&!a.listing?`<div class="collab-meta">
     ${a.mode==='roster'?`<label class="collab-field"><span>合作状态</span><select onchange="kolSet(${oi},this.value)">${Object.keys(RST).map(s=>`<option ${s===x.s?'selected':''}>${s}</option>`).join('')}</select></label>`:''}
     <label class="collab-field"><span>配合度</span><select onchange="setCreatorField('${a.id}',${oi},'coop',this.value,'配合度')">${['高','中','低'].map(s=>`<option ${s===(x.coop||'中')?'selected':''}>${s}</option>`).join('')}</select></label>
     <label class="collab-field"><span>负责人</span><select onchange="setCreatorField('${a.id}',${oi},'commOwner',this.value,'负责人')">${['待分配','jack','dudu','Sophie','Sam'].map(s=>`<option ${s===(x.commOwner||'待分配')?'selected':''}>${s}</option>`).join('')}</select></label>
   </div>`:''}
   <div class="sub-c">
     <div style="position:relative"><div id="m-si"></div>
       <textarea id="si" oninput="onKey(event,'si',${peopleOnly})" placeholder="${peopleOnly?'写给同事看 → 对同事说。输入 @ 提到人。':'写给同事看 → 对同事说；写给 Ai 改 → 对Ai说。输入 @ 提到人。'}"></textarea></div>
     <div class="row2">
       ${peopleOnly?'':a.mode==='csa'&&S.dtab===0?`<button class="btn sm" onclick="subSend('ask','${a.id}',${oi===undefined?null:oi})">对Ai说</button>`:`<button class="btn sm" onclick="subSend('chg','${a.id}',${oi===undefined?null:oi})">对Ai说</button>`}
       <button class="btn ghost sm" onclick="subSend('note','${a.id}',${oi===undefined?null:oi})">对同事说</button>
      <button class="btn ghost sm" data-mention-toggle onclick="showMent('si',${peopleOnly},this)" title="提到某人">@</button>
     </div></div></div>`;
}
function setCreatorField(id,oi,key,value,label){
 const [,a]=findArt(id);if(!a||!a.rows||!a.rows[oi])return;
 a.rows[oi][key]=value;toast(a.rows[oi].n+' · '+label+'：'+value);
}
function subSend(kind,id,oi){
 const i=$('si');if(!i||!i.value.trim()){toast('先写点什么');return;}
 const [,a]=findArt(id);const kids=a.opts||a.rows||a.plans;const activeEmail=a.mode==='csa'&&S.dtab===1?activeCSAEmail(a):null;const x=activeEmail?(activeEmail.thread=activeEmail.thread||{t:a.csa.customer+' · 客户邮件',sub:[]}):((oi===null)?a:kids[oi]);
 x.sub=x.sub||[];
 const tx=i.value.trim();x.sub.push({w:'du',k:kind==='chg'?'chg':undefined,tx,at:'刚刚'});
 if(a.mode==='csa'){
  if(S.dtab===1){drawDw();const l=$('sl');if(l)l.scrollTop=l.scrollHeight;toast(kind==='chg'?'邮件修改要求已记录':'已留言');return;}
  if(kind==='note'){drawDw();const l=$('sl');if(l)l.scrollTop=l.scrollHeight;toast('已留言');return;}
  const ans=csaAnswerFor(tx);x.sub.push({w:'csa',k:'ag',tx:ans.text+' '+ans.source,at:'刚刚'});a.v++;
  if(kind==='chg')x.sub.push({k:'sys',tx:'已更新数据分析结论 · 口径与来源同步刷新'});
  drawDw();const l=$('sl');if(l)l.scrollTop=l.scrollHeight;toast(kind==='chg'?'分析结论已按要求更新':'客户成功已回复');return;
 }
 if(a.mode==='promoseq'){
  if(kind==='chg')promotionNeedsReview(a);
  render();drawDw();scrollDrawerToBottom();toast(kind==='chg'?'修改要求已记录，等待推广计划处理':'已留言');return;
 }
 if(a.listing){
  a.listing.commentDraft='';refreshListingCard(a);drawDw();scrollDrawerToBottom();
  const list=$('sl');if(list)list.scrollTop=list.scrollHeight;
  toast(kind==='chg'?'修改要求已记录，已确认步骤保持锁定':'已留言');return;
 }
 if(a.sentiment){
  if(kind==='chg'){
   delete a.sentiment.result;a.st='review';
   const [task]=findArt(id);task.st='review';
  }
  render();drawDw();scrollDrawerToBottom();
  const list=$('sl');if(list)list.scrollTop=list.scrollHeight;
  toast(kind==='chg'?'修改要求已记录，等待舆情监控处理':'已留言');return;
 }
 if(a.inspection){
  if(kind==='chg'){
   delete a.inspection.result;a.st='review';
   const [task]=findArt(id);task.st='review';
  }
  render();drawDw();scrollDrawerToBottom();
  const list=$('sl');if(list)list.scrollTop=list.scrollHeight;
  toast(kind==='chg'?'修改要求已记录，等待'+(nick(a.by)||'店铺巡检')+'处理':'已留言');return;
 }
 if(kind==='chg'){
  const g=AG[a.by];
  x.sub.push({w:a.by,k:'ag',tx:'收到。已按你的说明改这一处，其余内容保持不变。改动会作为 diff 进入反馈回路。',at:'刚刚'});
  if(oi===null){a.v++;x.sub.push({k:'sys',tx:'已生成 v'+a.v+' · 变更 1 处'});a.st='review';}
  else{
   if(a.demoSocial){a.v++;x.s='review';a.st='review';const [task]=findArt(id);if(task)task.st='review';x.sub.push({k:'sys',tx:'已生成 v'+a.v+' · 仅更新这篇文章，其余 '+(a.plans.length-1)+' 篇未动'});}
   else x.sub.push({k:'sys',tx:a.rows?'已更新「'+x.n+'」· 其余 '+(a.rows.length-1)+' 位未动':a.plans?'已重写该方案 · 其余 '+(a.plans.length-1)+' 个方案未动':'已重写该方向'});
  }
  toast('已在这个产出上生成新版本');
 } else toast('已留言');
 drawDw();
 const l=$('sl');if(l)l.scrollTop=l.scrollHeight;
}

/* ============ new thread ============ */
function newTaskCampaignLabelHTML(c){return c?`<span class="new-task-campaign-name">${esc(c.n)}</span><span class="new-task-campaign-date">（${esc(c.from||'—')}–${esc(c.to||'—')}）</span>`:'<span class="new-task-campaign-name">日常（不归属活动）</span>';}
function openNew(agid,prefill){
 S.newAgent=agid||null;
 const a=S.newAgent?REG.find(x=>x.id===S.newAgent):null;
 const currentCampaign=CAMPS.some(c=>c.id===S.cid)?S.cid:'';S.newCampaignId=currentCampaign;
 $('mod').innerHTML=`<div class="mbox new-task-modal">
  <div class="mhd"><div class="e">新建任务</div><h3>你想让什么发生？</h3></div>
  <div class="mbd">
    <div class="fld"><label>意图</label>
      <textarea id="ni" rows="6" placeholder="例如：围绕 11.11 主题做一组小红书内容，先给方向不要直接写稿">${esc(prefill||'')}</textarea></div>
    <div class="fld"><label>所属活动 <span style="color:var(--t3);font-weight:400">（选填）</span></label>
      <div class="new-task-campaign-picker"><input id="new-task-campaign" type="hidden" value="${esc(currentCampaign)}">
       <button type="button" class="new-task-campaign-trigger" onclick="toggleNewTaskCampaignMenu(event)" aria-haspopup="listbox" aria-expanded="false"><span id="new-task-campaign-label">${newTaskCampaignLabelHTML(CAMPS.find(c=>c.id===currentCampaign))}</span><i data-lucide="chevron-down"></i></button>
       <div id="new-task-campaign-menu" class="new-task-campaign-menu" role="listbox" hidden>
        <button type="button" data-campaign-id="" class="new-task-campaign-option ${currentCampaign?'':'on'}" onclick="selectNewTaskCampaign(event,'')">日常（不归属活动）</button>
        ${CAMPS.map(c=>`<button type="button" data-campaign-id="${esc(c.id)}" class="new-task-campaign-option ${currentCampaign===c.id?'on':''}" onclick="selectNewTaskCampaign(event,'${esc(c.id)}')">${newTaskCampaignLabelHTML(c)}</button>`).join('')}
        <div class="new-task-campaign-divider"></div><button type="button" class="new-task-campaign-create-action" onclick="beginInlineCampaign(event)">＋ 创建活动</button>
       </div>
      </div></div>
    <div id="new-task-campaign-create"></div>
    <div id="npv"></div>
  </div>
  <div class="mft" id="new-task-footer"><button class="btn" onclick="mkThread()">开始</button>
    <button class="btn ghost" onclick="closeMod()">取消</button>
    <span style="margin-left:auto;font-size:var(--fs-xs);color:var(--t3)">${a?nick(a.id):'Agent'} 会先给计划，你批准后才动手</span></div>
 </div>`;
 $('mod').classList.add('on');if(window.lucide)lucide.createIcons({root:$('mod'),attrs:{width:16,height:16,'stroke-width':1.8}});setTimeout(()=>{const i=$('ni');i.focus();i.setSelectionRange(i.value.length,i.value.length);},60);
}
function toggleNewTaskCampaignMenu(event){
 event?.stopPropagation();const menu=$('new-task-campaign-menu'),trigger=document.querySelector('.new-task-campaign-trigger');if(!menu||!trigger)return;
 const open=menu.hidden;menu.hidden=!open;trigger.setAttribute('aria-expanded',String(open));
}
function closeNewTaskCampaignMenu(){
 const menu=$('new-task-campaign-menu'),trigger=document.querySelector('.new-task-campaign-trigger');if(menu)menu.hidden=true;if(trigger)trigger.setAttribute('aria-expanded','false');
}
function selectNewTaskCampaign(event,id){
 event?.stopPropagation();const input=$('new-task-campaign'),label=$('new-task-campaign-label'),campaign=CAMPS.find(c=>c.id===id);if(input)input.value=id;if(label)label.innerHTML=newTaskCampaignLabelHTML(campaign);
 S.newCampaignId=id;document.querySelectorAll('.new-task-campaign-option').forEach(button=>button.classList.toggle('on',button.dataset.campaignId===id));
 const panel=$('new-task-campaign-create');if(panel)panel.innerHTML='';closeNewTaskCampaignMenu();
}
function beginInlineCampaign(event){
 event?.stopPropagation();closeNewTaskCampaignMenu();const panel=$('new-task-campaign-create');if(!panel)return;
 panel.innerHTML=`<section class="new-task-campaign-form">
  <div class="new-task-campaign-form-head"><div><b>创建新活动</b><span>创建后会自动关联到当前任务</span></div><button type="button" class="ib" onclick="cancelInlineCampaign()" title="取消创建"><i data-lucide="x"></i></button></div>
  <div class="fld"><label for="new-campaign-name">活动名称</label><input id="new-campaign-name" maxlength="50" placeholder="例如：12.12 年终返场"></div>
  <div class="new-task-campaign-dates"><div class="fld"><label for="new-campaign-from">开始</label><input id="new-campaign-from" type="date"></div><div class="fld"><label for="new-campaign-to">结束</label><input id="new-campaign-to" type="date"></div></div>
  <div class="fld"><label for="new-campaign-budget">活动预算</label><input id="new-campaign-budget" type="number" min="1" step="1" placeholder="请输入预算金额"></div>
  <div class="fld"><label for="new-campaign-baseline">共同基准 <span style="color:var(--t3);font-weight:400">（选填）</span><span class="ct">填写后，所有 Agent 执行前都会读取</span></label><textarea id="new-campaign-baseline" rows="3" placeholder="主题、定位、口吻、禁用词、关键日期…"></textarea></div>
  <div class="new-task-campaign-actions"><button type="button" class="btn sm" onclick="createInlineCampaign()">创建并关联</button><button type="button" class="btn ghost sm" onclick="cancelInlineCampaign()">取消</button></div>
 </section>`;
 if(window.lucide)lucide.createIcons({root:panel,attrs:{width:16,height:16,'stroke-width':1.8}});setTimeout(()=>$('new-campaign-name')?.focus(),0);
}
function cancelInlineCampaign(){
 const panel=$('new-task-campaign-create');if(panel)panel.innerHTML='';
}
function createInlineCampaign(){
 const name=$('new-campaign-name')?.value.trim(),from=$('new-campaign-from')?.value,to=$('new-campaign-to')?.value;
 const budget=Number($('new-campaign-budget')?.value),baseline=$('new-campaign-baseline')?.value.trim();
 if(!name){toast('请填写活动名称');$('new-campaign-name')?.focus();return;}
 if(CAMPS.some(c=>c.n===name)){toast('已有同名活动，请换一个名称');$('new-campaign-name')?.focus();return;}
 if(!from||!to){toast('请选择活动开始和结束日期');return;}
 if(from>to){toast('结束日期不能早于开始日期');return;}
 if(!Number.isFinite(budget)||budget<=0){toast('请填写有效的活动预算');$('new-campaign-budget')?.focus();return;}
 const id='c'+Date.now(),displayFrom=from.replace(/-/g,'/'),displayTo=to.replace(/-/g,'/');
 CAMPS.unshift({id,n:name,sub:'自建活动 · 待挂任务',d:baseline||'暂未填写共同基准。',from:displayFrom,to:displayTo,brief:[['共同基准',baseline||'待补充']],
  phases:[{n:'进行中',f:displayFrom,t:displayTo,cur:1}],budget:{total:Math.round(budget),used:0,rows:[['待规划',Math.round(budget),0,'待规划']]},deps:[]});
 const input=$('new-task-campaign'),label=$('new-task-campaign-label'),menu=$('new-task-campaign-menu'),campaign=CAMPS.find(c=>c.id===id);if(input)input.value=id;if(label)label.innerHTML=newTaskCampaignLabelHTML(campaign);
 if(menu){const button=document.createElement('button');button.type='button';button.dataset.campaignId=id;button.className='new-task-campaign-option on';button.innerHTML=newTaskCampaignLabelHTML(campaign);button.onclick=event=>selectNewTaskCampaign(event,id);menu.insertBefore(button,menu.querySelector('.new-task-campaign-divider'));menu.querySelectorAll('.new-task-campaign-option').forEach(item=>item.classList.toggle('on',item===button));}
 S.newCampaignId=id;const panel=$('new-task-campaign-create');if(panel)panel.innerHTML='';toast('活动已创建并关联');
}
document.addEventListener('click',event=>{if(!event.target.closest('.new-task-campaign-picker'))closeNewTaskCampaignMenu();});
function planPv(){
 const v=$('ni').value.trim();
 if(S.manualFallback){S.manualFallback=false;resetNewTaskFooter();}
 if(v.includes('人工')){$('npv').innerHTML='';return;}
 const aid=S.newAgent||'orch';
 $('npv').innerHTML=v.length<6?'':`<div class="plan-pv">
   <div class="h">${AV(aid,18)} ${S.newAgent?nick(aid):'Orchestrator'} 建议的计划</div>
   ${['读取品牌智库与关联产品','确认渠道与内容数量','直接生成社媒内容','逐篇审批后完成交付'].map((s,i)=>
     `<div class="s"><span class="i">${i+1}</span>${s}</div>`).join('')}
   <div style="font-size:var(--fs-xs);color:var(--t3);margin-top:var(--sp-2)">预估 ¥14 · 自主级别 L2（产出直接给你，不自动发布）</div></div>`;
}
function resetNewTaskFooter(){
 const f=$('new-task-footer');if(!f)return;
 const a=S.newAgent?REG.find(x=>x.id===S.newAgent):null;
 f.innerHTML=`<button class="btn" onclick="mkThread()">开始</button><button class="btn ghost" onclick="closeMod()">取消</button>
  <span style="margin-left:auto;font-size:var(--fs-xs);color:var(--t3)">${a?nick(a.id):'Agent'} 会先给计划，你批准后才动手</span>`;
}
function showManualFallback(){
 S.manualFallback=true;
 $('npv').innerHTML=`<div class="manual-fallback">
  <div class="manual-fallback-h">暂未找到适合执行此任务的 Agent</div>
  <div class="manual-fallback-p">可以调整任务描述，或指定人员继续处理。人工提交仍会进入当前的审批、评论和版本流程。</div>
  <div class="manual-fields">
   <div class="fld"><label>指定人员</label><select id="manual-person"><option value="br">Brooks</option><option value="so">Sophie</option><option value="du">dudu</option></select></div>
   <div class="fld"><label>截止时间</label><input id="manual-deadline" type="datetime-local" value="2026-08-28T18:00"></div>
  </div>
  <div class="fld" style="margin:var(--sp-3) 0 0"><label>产出模板</label><input id="manual-template" type="hidden" value="文件交付">
   <div class="manual-template-options"><button class="on" onclick="selectManualTemplate('文件交付',this)">文件交付</button><button onclick="selectManualTemplate('数据录入',this)">数据录入</button><button onclick="selectManualTemplate('自定义记录',this)">自定义记录</button></div>
  </div>
  <div class="manual-template-preview" id="manual-template-preview"><b>文件交付模板</b><br>结果摘要 · 文件 · 补充说明 · 未完成项</div>
 </div>`;
 $('new-task-footer').innerHTML=`<button class="btn" onclick="createManualThread()">创建人工任务</button><button class="btn ghost" onclick="S.manualFallback=false;resetNewTaskFooter();planPv();$('ni').focus()">调整任务描述</button><button class="btn ghost" onclick="closeMod()">取消</button>`;
}
function selectManualTemplate(type,btn){
 $('manual-template').value=type;document.querySelectorAll('.manual-template-options button').forEach(x=>x.classList.toggle('on',x===btn));
 const copy={文件交付:'结果摘要 · 文件 · 补充说明 · 未完成项',数据录入:'数据表 · 数据来源 · 统计口径 · 异常说明',自定义记录:'处理结果 · 过程记录 · 附件 · 补充说明'};
 $('manual-template-preview').innerHTML=`<b>${type}模板</b><br>${copy[type]}`;
}
function inferNewTaskMeta(intent){
 const text=(intent||'').toLowerCase();
 const analysis=/(转化率|会话数|加购|数据时间|店铺分析|指标|漏斗|roas|gmv)/i.test(text);
 const dom=S.newAgent?(REG.find(x=>x.id===S.newAgent)?.dom||'内容')
  :analysis?'平台'
  :/(达人|kol|koc|brief)/i.test(text)?'KOL'
  :/(b2b|seo|白皮书|行业客户)/i.test(text)?'B2B'
  :/(用户运营|社群|会员|召回|留存)/i.test(text)?'用户运营'
  :/(电商|商品|详情页|上架|天猫|京东|直播|推广图)/i.test(text)?'电商':'内容';
 const campaignField=$('new-task-campaign'),campaignId=campaignField?campaignField.value:(S.newCampaignId||'');
 const matched=CAMPS.find(c=>c.id===campaignId)||null;
 return {d:dom,c:matched?matched.n:null,a:analysis?'ana':null};
}
function createManualThread(){
 const v=$('ni').value.trim(),meta=inferNewTaskMeta(v),c=meta.c,d=meta.d,person=$('manual-person').value,deadline=$('manual-deadline').value,template=$('manual-template').value;
 const id='n'+Date.now(),aid='manual-'+Date.now(),personName=U[person].n;
 const title=v==='人工'?'人工处理任务 · '+template:v.slice(0,26)+(v.length>26?'…':'');
 const task={cr:{s:'h',w:'du'},trig:'manual',id,t:title,camp:c,dom:d,ag:'orch',own:person,manualAssignee:person,manualTemplate:template,st:'review',up:'刚刚',day:0,lv:'M1',cost:'—',outputCount:1,
  intent:{who:'du',tx:v,at:'刚刚'},
  plan:{v:1,tx:`未匹配到适合的 Agent，已由 ${personName} 人工接管，并按「${template}」模板提交。`,steps:[
   {l:'接收人工任务',m:`${personName} · 截止 ${deadline.replace('T',' ')}`,s:'ok',r:'刚刚'},
   {l:'按模板整理产出',m:template+' · 已填写示例内容',s:'ok',r:'刚刚'},
   {l:'提交审核',m:'文件与处理记录已进入审批',s:'act',r:'待审批'}]},
  arts:[{id:aid,manualOutput:true,mode:'manual',ty:'人工提交',ttl:title+' · 交付产出',by:'orch',v:1,st:'review',pv:'doc',g:['#FDBA74','#F97316'],
   ex:`${personName} 已接管任务，正在通过默认模板补充人工产出。`,vals:[],manual:{assignee:person,template,deadline,summary:'已完成任务要求的资料整理，并按模板补充提交说明。',files:[],notes:'关键处理过程已记录；如需修改，可在评论中说明。',unfinished:'无',submitted:false,reviewed:false,reviewDecision:'',reviewScore:null,reviewFeedback:'',records:[{who:personName,at:'刚刚',tx:'接收任务并确认交付要求'}]},sub:[]}],cmts:[]};
 T.unshift(task);S.newAgent=null;S.manualFallback=false;closeMod();go('thread',id);toast('人工任务已创建 · '+personName+' 已接管');
}
function contentDataRow(){
 return `<div class="content-data-row">
   <input class="link" placeholder="🔗 请输入文章 / 视频链接">
   <select aria-label="平台"><option>小红书</option><option>抖音</option></select>
   <input type="number" min="0" placeholder="本次花费（元）">
   <select aria-label="内容类型"><option>图文</option><option>视频</option></select>
   <button class="del" onclick="this.closest('.content-data-row').remove()" title="删除">×</button>
  </div>`;
}
function addContentDataRow(){
 const box=document.querySelector('.content-data-rows');if(box)box.insertAdjacentHTML('beforeend',contentDataRow());
}
function openContentData(i){
 const found=findArt('a7'),a=found[1],r=a&&a.rows&&Number.isInteger(i)?a.rows[i]:null;
 $('mod').innerHTML=`<div class="mbox content-data-modal">
  <div class="content-data-head"><div class="main"><h3>录入内容数据</h3>
   <div class="sub">${r?esc(r.n)+' · 录入窗口':'11.11 腰部 KOC 短名单 · 录入窗口'}</div></div>
   <button class="btn ghost sm" onclick="toast('打开录入历史')">↶ 录入历史</button>
   <button class="ib" onclick="closeMod()" title="关闭">×</button></div>
  <div class="content-data-body"><div class="content-data-label"><span>配置单篇投放内容明细</span><span class="spacer"></span>
   <button class="btn ghost sm" onclick="addContentDataRow()">＋ 添加</button></div>
   <div class="content-data-rows">${contentDataRow()}</div></div>
  <div class="mft content-data-foot"><button class="btn" onclick="closeMod();toast('内容数据已保存')">保存录入</button></div>
 </div>`;
 $('mod').classList.add('on');
}
function closeMod(){S.manualFallback=false;S.campSync=null;S.newCampaignId=null;$('mod').classList.remove('on','plan-mode','asset-mode');}
function mkThread(){
 const v=$('ni').value.trim();if(!v){toast('先写一句你想做什么');return;}
 if(v.includes('人工')){createManualPendingThread();return;}
 const dualDemo=v==='2';
 const taskIntent=dualDemo?'生成天猫详情页内容，并在详情页产出批准后由店铺巡检检查商品资料、页面信息与上架风险。':v;
 const meta=inferNewTaskMeta(taskIntent),c=meta.c,d=meta.d,ag=dualDemo?'pdp':S.newAgent||meta.a||'orch';
 if(ag==='ana'){
  const id='n'+Date.now(),preset=prestartPlanPreset('ana');
  T.unshift({cr:{s:'h',w:'du'},trig:'manual',id,t:v.split('\n')[0].slice(0,30),camp:c,dom:d,ag:'ana',own:'du',st:'todo',up:'刚刚',day:0,lv:'M2',cost:'¥0.20',outputCount:0,prestartDemo:true,
   intent:{who:'du',tx:v,at:'刚刚'},plan:{v:1,status:'pending',startedAt:null,...preset},arts:[],cmts:[]});
  S.newAgent=null;closeMod();S.view='thread';S.tid=id;renderNav();render();$('view').scrollTo(0,0);toast('任务已创建 · 数据分析 Agent 计划待确认');return;
 }
 if(dualDemo||d==='内容'){
  const id='n'+Date.now(),plan=prestartPlanPreset('pdp');
  plan.tx=dualDemo?'详情页生成 Agent 先整理规划并生成内容，Brooks 批准后由店铺巡检 Agent 检查商品资料、页面信息与上架风险。两份产出分别经 Brooks 批准后，再交 dudu 统一验收、分别评分。':'详情页生成 Agent 先整理详情页规划并生成内容。M1 产出先交 Brooks 审批，再交 dudu 验收打分。';
  if(dualDemo)plan.steps.splice(plan.steps.length-1,0,{l:'店铺巡检检查页面与上架风险',m:'等待详情页产出经 Brooks 批准',s:'todo',r:'未开始'});
  T.unshift({cr:{s:'h',w:'du'},trig:'manual',id,t:dualDemo?'天猫详情页生成与店铺巡检':v.slice(0,26)+(v.length>26?'…':''),camp:c,dom:'电商',ag:'pdp',agents:dualDemo?['pdp','insp']:['pdp'],agentLabels:dualDemo?{pdp:'详情页生成',insp:'店铺巡检'}:{pdp:'详情页生成'},agentStates:dualDemo?{pdp:'待确认',insp:'等待详情页批准'}:{pdp:'待确认'},own:'br',st:'todo',up:'刚刚',day:0,lv:'M1',cost:'¥0.20',outputCount:0,prestartDemo:true,demoM1Pdp:true,demoDualAgents:dualDemo,
   intent:{who:'du',tx:taskIntent,at:'刚刚'},plan:{v:1,status:'pending',startedAt:null,...plan},
   ask:{agentLabel:'详情页生成',tx:'开始生成前，请确认目标平台、页面数量和关联产品。',platforms:['天猫','京东','抖音电商'],products:['A80 修护精华 30ml','A80 修护安瓶精华 15ml','Evo1.1 轻盈营养体验','Clean Glow 修护霜 50g'],channels:[{platform:'天猫',qty:'1',products:['A80 修护精华 30ml']}]},arts:[],cmts:[]});
  S.newAgent=null;closeMod();S.view='thread';S.tid=id;renderNav();render();$('view').scrollTo(0,0);toast(dualDemo?'任务已创建 · 已推荐 2 个 Agent，计划待确认':'任务已创建 · 已推荐详情页生成 Agent，计划待确认');return;
 }
 T.unshift({cr:{s:'h',w:'du'},trig:'manual',id:'n'+Date.now(),t:v.slice(0,26)+(v.length>26?'…':''),camp:c,dom:d,ag,own:'du',st:'run',up:'刚刚',day:0,lv:'M2',cost:'¥0.20'});
 S.newAgent=null;
 closeMod();S.dom=d;go('work');toast('已开线程 · Agent 正在起草计划');
}
function createManualPendingThread(){
 const v=$('ni').value.trim(),meta=inferNewTaskMeta(v),c=meta.c,d=meta.d,id='n'+Date.now();
 T.unshift({cr:{s:'h',w:'du'},trig:'manual',id,t:v==='人工'?'人工处理任务':v.slice(0,26)+(v.length>26?'…':''),camp:c,dom:d,ag:'orch',own:'du',manualPending:true,st:'todo',up:'刚刚',day:0,lv:'M1',cost:'—',outputCount:0,
  intent:{who:'du',tx:v,at:'刚刚'},arts:[],cmts:[]});
 S.newAgent=null;S.manualAssignOpen=false;S.manualTemplate='文件交付';S.manualPerson='br';S.manualDeadline='2026-08-28T18:00';
 closeMod();S.view='thread';S.tid=id;renderNav();render();$('view').scrollTo(0,0);toast('任务已创建 · 暂未匹配到合适的 Agent');
}

document.addEventListener('keydown',e=>{
 if(e.key==='Escape'){if($('mod').classList.contains('on'))closeMod();else closeDw();}
 if((e.metaKey||e.ctrlKey)&&e.key==='k'){e.preventDefault();openNew();}
});
document.addEventListener('click',e=>{
 if(S.accountOpen&&!e.target.closest('.account-wrap')){S.accountOpen=false;renderAccount();}
 if(e.target.closest('.mentions')||e.target.closest('[data-mention-toggle]'))return;
 if(S.refMenuOpen&&!e.target.closest('.ref-add-wrap')){S.refMenuOpen=false;if(S.promotionImage)drawPromotionImage();else if($('mod')?.classList.contains('on'))drawPlanImage();}
 if(S.directionRefMenu&&!e.target.closest('.ref-add-wrap')){S.directionRefMenu=null;if($('dw')?.classList.contains('on'))drawDw();}
 closeMentions();
 if(S.kfilterOpen&&!e.target.closest('.roster-filterarea')){S.kfilterOpen=null;if($('dw').classList.contains('on'))drawDw();}
});
function syncLive(){
 const running=T.filter(t=>t.st==='run').length;
 const on=REG.filter(a=>ONLINE[a.id]&&a.b==='live').length;
 const n=$('lcn'),o=$('lco');if(n)n.textContent=running;if(o)o.textContent=on+' 在线';
}
function syncAppr(){const b=$('apprb');if(b)b.innerHTML='审批 <span class="c num">'+queue().length+'</span>';}
const _r=render;render=function(){_r();syncAppr();syncLive();
 const lz=$('lz'),le=$('le');if(lz)lz.className=LANG==='zh'?'on':'';if(le)le.className=LANG==='en'?'on':'';
 trAll();if(window.lucide)lucide.createIcons({attrs:{width:15,height:15,'stroke-width':1.8}});};
try{
 const o=(typeof Element!=='undefined')&&Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');
 if(o&&o.set)['dw','mod'].forEach(id=>{const el=$(id);if(!el)return;
  Object.defineProperty(el,'innerHTML',{configurable:true,
   set(v){o.set.call(this,v);trDOM(this);},get(){return o.get.call(this)}});});
}catch(e){}
const drawerExpandObserver=new MutationObserver(()=>syncDrawerExpandControl());
drawerExpandObserver.observe($('dw'),{childList:true});
renderNav();render();
