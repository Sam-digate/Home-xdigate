/* ============ thread ============ */
function manualFiles(m){return m.files&&m.files.length?m.files:(m.file?[m.file]:[]);}
const MANUAL_PEOPLE=['br','so','du'];
function manualPeopleLabel(ids){return (ids||[]).map(id=>U[id]?.n||id).join('、');}
function manualTaskPeople(t){return t?.manualAssignees?.length?t.manualAssignees:(t?.manualAssignee?[t.manualAssignee]:[]);}
function manualArtifactPeople(m){return m?.assignees?.length?m.assignees:(m?.assignee?[m.assignee]:[]);}
function manualRecordWho(m){return manualPeopleLabel(manualArtifactPeople(m))||'人工处理人';}
function toggleThreadManualPerson(id,checked){
 const list=Array.isArray(S.manualPeople)?[...S.manualPeople]:[S.manualPerson||'br'];
 const set=new Set(list);if(checked)set.add(id);else set.delete(id);
 S.manualPeople=[...set];S.manualPerson=S.manualPeople[0]||'';
 const summary=document.querySelector('[data-thread-manual-summary]');
 if(summary)summary.textContent=(manualPeopleLabel(S.manualPeople)||'请选择人员')+' ▾';
}
function manualAssignmentNode(t){
 const open=!!S.manualAssignOpen,edit=!!S.manualDescOpen,person=S.manualPerson||'br',selected=Array.isArray(S.manualPeople)?S.manualPeople:[person],draft=S.manualDescDraft??(t.intent?.tx||'');
 return `<div class="node wait"><div class="nlab">执行方式 · ASSIGN</div><div class="bub">
  <div class="manual-fallback" style="margin:0">
   <div class="manual-fallback-h">暂未找到适合执行此任务的 Agent</div>
   ${open?`<div class="manual-fields" style="margin-top:var(--sp-3);grid-template-columns:1fr">
    <div class="fld"><label>指定人员 <span class="ct">可多选 · 共同处理，一份交付</span></label>
     <details data-thread-manual-select style="position:relative">
      <summary data-thread-manual-summary style="list-style:none;cursor:pointer;border:1px solid var(--border);border-radius:var(--r-sm);background:#fff;padding:9px 12px;font-size:var(--fs-sm);color:var(--t1)">${esc(manualPeopleLabel(selected)||'请选择人员')} ▾</summary>
      <div style="position:absolute;z-index:20;left:0;right:0;top:calc(100% + 4px);background:#fff;border:1px solid var(--border);border-radius:var(--r-sm);box-shadow:var(--shadow);padding:var(--sp-2)">
       ${MANUAL_PEOPLE.map(id=>`<label style="display:flex;align-items:center;gap:8px;margin:0;padding:7px 8px;border-radius:8px;font-size:var(--fs-sm);font-weight:400;cursor:pointer"><input type="checkbox" data-thread-manual-person value="${id}" ${selected.includes(id)?'checked':''} onchange="toggleThreadManualPerson('${id}',this.checked)" style="width:14px;height:14px;min-width:14px;margin:0;padding:0;flex:0 0 14px"> <span>${U[id].n}</span></label>`).join('')}
      </div>
     </details></div>
   </div>
   <div style="display:flex;gap:var(--sp-2);margin-top:var(--sp-3)"><button class="btn sm" onclick="confirmManualAssignment('${t.id}')">确认人工接管</button><button class="btn ghost sm" onclick="S.manualAssignOpen=false;render()">收起</button></div>`
   :edit?`<div class="manual-desc-editor" style="margin-top:var(--sp-3)">
    <div class="fld" style="margin:0"><label>补充匹配信息</label><textarea id="thread-manual-desc" rows="3" placeholder="补充任务目标、交付物或领域，让系统重新匹配合适 Agent" oninput="S.manualDescDraft=this.value">${esc(draft)}</textarea></div>
    <div style="display:flex;gap:var(--sp-2);margin-top:var(--sp-3)"><button class="btn sm" onclick="confirmManualDescription('${t.id}')">确定</button><button class="btn ghost sm" onclick="cancelManualDescription()">取消</button></div>
   </div>`
   :`<div style="display:flex;gap:var(--sp-2);margin-top:var(--sp-3)"><button class="btn sm" onclick="S.manualAssignOpen=true;S.manualDescOpen=false;render()">指定人员处理</button><button class="btn ghost sm" onclick="openManualDescription('${t.id}')">调整任务描述</button></div>`}
  </div></div></div>`;
}
document.addEventListener('click',e=>{
 const select=document.querySelector('[data-thread-manual-select][open]');
 if(select&&!select.contains(e.target))select.removeAttribute('open');
});
function openManualDescription(id){
 const t=T.find(x=>x.id===id);if(!t)return;
 S.manualDescOpen=true;S.manualAssignOpen=false;S.manualDescDraft=t.intent?.tx||'';render();
 setTimeout(()=>$('thread-manual-desc')?.focus(),30);
}
function cancelManualDescription(){S.manualDescOpen=false;S.manualDescDraft=null;render();}
function confirmManualDescription(id){
 const t=T.find(x=>x.id===id);if(!t)return;const box=$('thread-manual-desc'),tx=(box?box.value:S.manualDescDraft||'').trim();
 if(!tx){toast('请补充用于匹配 Agent 的任务信息');return;}
 t.intent=t.intent||{who:'du',at:'刚刚'};t.intent.tx=tx;t.up='刚刚';
 S.manualDescOpen=false;S.manualDescDraft=null;render();toast('已根据补充信息重新匹配 Agent');
}
function confirmManualAssignment(id){
 const t=T.find(x=>x.id===id);if(!t)return;const people=Array.from(document.querySelectorAll('[data-thread-manual-person]:checked')).map(x=>x.value),deadline='',template='文件交付';
 if(!people.length){toast('请至少指定一位处理人');return;}
 applyManualAssignment(t,people,deadline,template);S.manualAssignOpen=false;S.manualPeople=null;render();toast(manualPeopleLabel(people)+' 已共同接管这条任务');
}
function applyManualAssignment(t,people,deadline,template){
 const assignees=Array.isArray(people)?people:[people],personName=manualPeopleLabel(assignees),aid='manual-'+Date.now();
 t.manualPending=false;t.manualAssignees=assignees;t.manualAssignee=assignees[0];t.manualTemplate=template;t.own=assignees[0];t.st='review';t.up='刚刚';t.outputCount=1;t.t=t.t.replace('待指定人员',personName);
 t.plan={v:1,tx:`未匹配到适合的 Agent，已由 ${personName} 共同接管，并按「${template}」模板提交一份交付。`,steps:[
  {l:'接收人工任务',m:personName+' · 共同处理',s:'ok',r:'刚刚'},
  {l:'按模板整理产出',m:template+' · 一份交付',s:'ok',r:'刚刚'},
  {l:'提交审核',m:'文件与处理记录已进入审批',s:'act',r:'待审批'}]};
 t.arts=[{id:aid,manualOutput:true,mode:'manual',ty:'人工提交',ttl:t.t+' · 交付产出',by:'orch',v:1,st:'review',pv:'doc',g:['#FDBA74','#F97316'],
  ex:`${personName} 已共同接管任务，正在通过默认模板补充一份人工产出。`,vals:[],manual:{assignee:assignees[0],assignees,template,deadline,summary:'已完成任务要求的资料整理，并按模板补充提交说明。',files:[],notes:'关键处理过程已记录；如需修改，可在评论中说明。',unfinished:'无',submitted:false,reviewed:false,reviewDecision:'',reviewScore:null,reviewFeedback:'',records:[{who:personName,at:'刚刚',tx:'共同接收任务并确认交付要求'}]},sub:[]}];
}
function manualReviewForm(a){
 const m=a.manual,people=manualArtifactPeople(m),u=U[people[0]],names=manualPeopleLabel(people);
 return `<div class="bub manual-review">
  <div class="who"><span class="avs" style="background:${u.c}">${u.s}</span><span class="nm">${esc(names)} 已提交</span><span class="chip" style="background:var(--orange-bg);color:var(--orange-fg);border:1px solid #FED7AA">待主管审核</span><span class="tm">刚刚</span></div>
  <div class="manual-review-intro">处理人已标记任务完成。请审核本次交付，通过后任务才会正式完成；退回后由处理人继续修改。</div>
  <div class="manual-review-section"><div class="manual-review-label">1 · 决策</div><div class="manual-review-options">
   <button class="manual-review-choice ${m.reviewDecision==='pass'?'on':''}" onclick="setManualReviewDecision('${a.id}','pass')">通过</button>
   <button class="manual-review-choice ${m.reviewDecision==='return'?'on':''}" onclick="setManualReviewDecision('${a.id}','return')">退回</button>
  </div></div>
  <div class="manual-review-section"><div class="manual-review-label">2 评分</div><div class="manual-review-options">
   ${[1,2,3,4,5].map(n=>`<button class="manual-review-choice manual-review-score ${m.reviewScore===n?'on':''}" onclick="setManualReviewScore('${a.id}',${n})">${n}</button>`).join('')}
  </div></div>
  <div class="manual-review-section"><div class="manual-review-label">3 · 评价 ${m.reviewDecision==='return'?`<span style="color:#DC2626;font-weight:500">· 退回时必填</span>`:`<span class="optional">· 选填</span>`}</div>
   <textarea id="manual-review-feedback-${a.id}" placeholder="${m.reviewDecision==='return'?'请填写退回原因':'给处理人一点反馈'}" oninput="setManualReviewFeedback('${a.id}',this.value)">${esc(m.reviewFeedback||'')}</textarea>
  </div>
  <div class="manual-review-foot"><button class="btn" onclick="submitManualReview('${a.id}')">批准</button><span style="font-size:var(--fs-xs);color:var(--t3)">任务发起人负责审批</span></div>
 </div>`;
}
function manualReviewRecord(a){
 const m=a.manual,d=arguments[1]||m,passed=d.reviewResult==='通过';
 return `<div class="bub manual-review-result ${passed?'pass':'return'}">
  <div class="manual-review-result-head">
   <span class="manual-review-result-icon">${passed?'✓':'↩'}</span>
   <div><div class="manual-review-result-title">主管审核${esc(d.reviewResult)}</div><div class="manual-review-result-sub">${passed?'人工交付已确认，任务正式完成':'已退回 '+esc(manualPeopleLabel(manualArtifactPeople(m)))+' 修改，完成后可再次提交'} · ${esc(d.reviewAt||'刚刚')}</div></div>
   <div class="manual-review-result-meta">${d.reviewScore?`<span class="manual-review-rating">评分 ${d.reviewScore} / 5</span>`:''}</div>
  </div>
  ${d.reviewFeedback?`<div class="manual-review-feedback">${esc(d.reviewFeedback)}</div>`:''}
 </div>`;
}
function manualReviewHistory(a){return (a.manual?.reviewHistory||[]).map(h=>manualReviewRecord(a,h)).join('');}
function vThread(){
 const t=T.find(x=>x.id===S.tid);if(!t)return vSoon();
 const a=AG[t.ag];
 const threadAgents=t.agents?.length?t.agents:[t.ag];
 const manualReviewArt=t.arts?.find(x=>x.manualOutput&&x.manual?.submitted&&!x.manual?.reviewed);
 const manualAuditArt=t.arts?.find(x=>x.manualOutput&&x.manual?.reviewResult);
 const intentAuthor=U[t.intent?.who]||null;
 const m1Art=t.arts?.find(x=>x.m1);
 const hasM1Delivery=!!m1Art;
 const hideM1Delivery=(hasM1Delivery&&m1Art.m1?.stage==='owner'&&!(m1Art.m1.reviewHistory||[]).length)||(t.demoDualAgents&&t.agentStates?.insp==='运行中');
 if(!t.arts&&!t.ask&&!t.standing&&!t.manualPending)return `<div class="wrap"><div class="th-hd"><div class="crumb"><button onclick="go('work')">工作</button> › ${t.camp||'日常'}</div>
  <h2>${esc(t.t)}</h2>
  <div class="th-meta" style="margin-top:var(--sp-3)"><span class="st ${t.st}">${STN[t.st]}</span>
    <span class="chip dom">${t.dom}</span>
    <span class="crbadge ${crInfo(t).s}">${crInfo(t).av} 由 <b>${crInfo(t).nm}</b> 发起</span></div></div>
  <div class="empty"><div class="h">这条线程还没铺内容</div><div style="font-size:var(--fs-md);margin-bottom:var(--sp-4)">原型里详细展开了 4 条线程，分别演示不同的产出类型。</div><button class="btn" onclick="go('work')">回到工作</button></div></div>`;
 return `<div class="wrap" style="max-width:780px">
  <div class="th-hd">
    <div class="crumb"><button onclick="go('work')">工作</button> › ${t.camp?`<button onclick="goCamp('${t.camp}')">${t.camp}</button>`:'日常'} › <span>任务</span></div>
    <h2>${esc(t.t)}</h2>
    <div class="th-meta">
      <span class="st ${t.st}">${STN[t.st]}</span>
      ${t.camp?`<span class="chip camp">${t.camp}</span>`:'<span class="chip mut">日常</span>'}
      <span class="chip dom">${t.dom}</span><span class="chip lv">自主 ${t.lv}</span>
      <span class="chip mut">产品经理 ${U[t.own].n}</span>
      ${t.manualPending?`<span class="chip" style="background:var(--orange-bg);color:var(--orange-fg);border:1px solid #FED7AA">待指定人员</span>`:''}
      ${t.manualAssignee?`<span class="chip" style="background:var(--orange-bg);color:var(--orange-fg);border:1px solid #FED7AA">人工处理</span>`:''}
      <span class="crbadge ${crInfo(t).s}">${crInfo(t).av} 由 <b>${crInfo(t).nm}</b> 发起</span>
      <span class="chip mut">${({manual:'手动',scheduled:'定时触发',event:'事件触发',proposal:'采纳提案'})[t.trig||'manual']}</span>
      ${t.blocked?`<span class="chip" style="background:var(--danger-bg);color:var(--danger-fg);border:1px solid var(--danger-bd)">${t.blocked}</span>`:''}
      ${t.standing?`<span class="chip" style="background:#ECFEFF;color:#0E7490;border:1px solid #A5F3FC">${t.standing==='ana'?'常驻 · 分析线程':'例行 · 常驻线程'}</span>`:''}
      ${t.pin?'<span class="chip" style="background:var(--orange-bg);color:var(--orange-fg);border:1px solid #FFEDD5">置顶</span>':''}
    </div>
    <div class="th-stats">
      <div class="ts"><div class="l">${t.manualPending||t.manualAssignee?'执行人':threadAgents.length>1?'Agent':'主 Agent'}</div><div class="v thread-agent-list">
        ${t.manualPending?`<span style="color:var(--t3);font-weight:500">待指定</span>`:t.manualAssignee?`<span class="avs" style="width:20px;height:20px;background:${U[manualTaskPeople(t)[0]].c}">${U[manualTaskPeople(t)[0]].s}</span>${manualPeopleLabel(manualTaskPeople(t))}`:threadAgents.map(id=>{const label=t.agentLabels?.[id]||agentLabel(id);return `<button class="thread-agent-mini" onclick="openTrace('${id}','${t.id}')" title="查看${esc(label)}运行状态">${AV(id,20)}<span class="odot ${ONLINE[id]?'on':'off'}"></span><span>${esc(label)}</span></button>`;}).join('')}</div></div>
      <div class="ts"><div class="l">产出</div><div class="v num">${t.outputCount??(t.arts?t.arts.length:'—')}</div></div>
      <div class="ts"><div class="l">更新</div><div class="v" style="font-size:var(--fs-md)">${t.up}</div></div>
    </div>
  </div>
  <div class="spine">
    <div class="node ok"><div class="nlab">意图 · INTENT</div>
      <div class="bub me"><div class="who"><span class="avs" style="background:${intentAuthor?intentAuthor.c:'#9490B8'}">${intentAuthor?intentAuthor.s:'SYS'}</span>
        <span class="nm">${intentAuthor?intentAuthor.n:'系统事件'}</span><span class="tm">${t.intent.at}</span></div>
        ${esc(t.intent.tx)}</div></div>

    ${t.standing?`<div class="node ok"><div class="nlab">${t.standing==='ana'?'本次提问':'本次运行 · '+((RECIPES.find(r=>r.id===t.standing)||{}).cad||'')}</div>
      <div class="bub" style="background:#F0FDFF;border-color:#A5F3FC">
        <div style="font-size:var(--fs-sm);color:var(--t2)">${t.standing==='ana'
          ?'这是<b>常驻分析线程</b>——所有数据问题都问在这一条里，不会每问一次开一条。结论按时间往下排，旧的进历史。<br>如果一个结论要真的动手做，用产出上的<b>建单去做</b>另开一条——<b>问不是做</b>。'
          :'这是一条<b>常驻线程</b>——例行每次触发都跑在这里，不会每天新开一条。只有产出需要你处理时才会浮到「今日」。'}</div></div></div>`:''}
    ${t.manualPending?manualAssignmentNode(t):t.prestartDemo?prestartPlanNode(t):`<div class="node ok"><div class="nlab">${t.standing?'本次 · 计划':'计划 · PLAN'}</div>
      <div class="bub"><div class="who${t.manualAssignee?'':' agent-run-hit'}" ${t.manualAssignee?'':`role="button" tabindex="0" onclick="openTrace('${t.ag}','${t.id}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openTrace('${t.ag}','${t.id}')}" title="查看运行状态"`}>${t.manualAssignee?`<span class="avs" style="background:${U[manualTaskPeople(t)[0]].c}">${U[manualTaskPeople(t)[0]].s}</span><span class="nm">${manualPeopleLabel(manualTaskPeople(t))}</span><span class="chip mut">人工执行</span>`:`<span class="avs" style="background:${a.c}">${a.s}</span><span class="nm">${a.n}</span>`}
          ${t.hidePlanVersion?'':`<span class="chip mut">计划 v${t.plan.v||1}</span>`}<span class="tm">${t.plan.v>1?'已调整':'已批准'}</span></div>
        <div style="margin-bottom:var(--sp-3);color:var(--t2)">${esc(t.plan.tx)}</div>
        ${t.plan.adj?`<div class="note" style="margin-bottom:var(--sp-3)">计划中途改过：${esc(t.plan.adj)}。已完成的步骤保留，未开始的按新计划走。</div>`:''}
        ${t.st==='done'?'':`<div style="margin-top:var(--sp-3);padding-top:var(--sp-3);border-top:1px solid var(--hairline)">
          <button class="btn ghost sm" onclick="promoteThread()">变成例行 ↗</button></div>`}
      </div></div>`}

    ${t.ask&&!t.answered&&(!t.prestartDemo||t.plan.status!=='pending')?`<div class="node wait"><div class="nlab">需要你补充 · CLARIFY</div>
      <div class="bub"><div class="who agent-run-hit" role="button" tabindex="0" onclick="openTrace('${t.ag}','${t.id}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openTrace('${t.ag}','${t.id}')}" title="查看运行状态"><span class="avs" style="background:${a.c}">${a.s}</span><span class="nm">${esc(t.ask.agentLabel||a.n)}</span>
        <span class="chip mut">${t.ask.ppt?'PPT 生成设置':t.ask.channels?'目标渠道':t.ask.qs.length+' 个问题'}</span><span class="tm">8分钟前</span></div>
        <div style="margin-bottom:var(--sp-3);color:var(--t2)">${esc(t.ask.tx)}</div>
        ${t.ask.ppt?renderPptAsk(t):t.ask.channels?renderChannelAsk(t):t.ask.qs.map((q,i)=>`<div class="qa"><div class="q">${i+1}. ${esc(q.q)}</div><div class="w">${esc(q.why)}</div>
          <div class="os">${q.o.map((o,j)=>`<button class="o ${(S.ans||{})[i]===j?'on':''}" onclick="pickAns(${i},${j})">${esc(o)}</button>`).join('')}</div></div>`).join('')}
        <div style="display:flex;gap:var(--sp-2);align-items:center;margin-top:var(--sp-1)">
          <button class="btn" onclick="sendAns()">${t.ask.ppt?'提交并继续':'补齐并继续'}</button>
          ${t.ask.channels||t.ask.ppt?'':`<span style="font-size:var(--fs-xs);color:var(--t3)">${Object.keys(S.ans||{}).length}/${t.ask.qs.length} 已选 · 也可以直接在下面留言说明</span>`}</div>
      </div></div>`:''}
    ${t.answered?`<div class="node ok"><div class="nlab">你的补充 · ANSWERED</div>
      <div class="bub me"><div class="who"><span class="avs" style="background:${U.du.c}">DU</span><span class="nm">dudu</span><span class="tm">刚刚</span></div>
        ${t.ask.ppt||t.ask.channels?t.answered.map(x=>`<div style="font-size:var(--fs-sm);padding:var(--sp-1) 0;color:var(--t2)"><b style="color:var(--t1)">${esc(x)}</b></div>`).join(''):t.answered.map((x,i)=>`<div style="font-size:var(--fs-sm);padding:var(--sp-1) 0;color:var(--t2)">${t.ask.qs[i].q} → <b style="color:var(--t1)">${esc(x)}</b></div>`).join('')}</div></div>`:''}
    ${answeredRunningNode(t,a)}
    ${t.live?`<div class="node act"><div class="nlab">执行 · RUNNING</div>
      <div class="live">
        <div class="live-h agent-run-hit" role="button" tabindex="0" onclick="openTrace('${t.ag}','${t.id}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openTrace('${t.ag}','${t.id}')}" title="查看运行状态"><span class="spin"></span><span class="t">${t.live.t}</span><span class="e" id="el">${t.live.el}</span></div>
        <div class="live-t" id="lt">${t.live.sub[0]}</div>
        <div class="pbar"><i id="lp" style="width:${t.live.p}%"></i></div>
        <div class="live-f" style="justify-content:flex-end">
          <button class="btn ghost sm" onclick="openTrace('${t.ag}','${t.id}')">看它怎么想的</button></div>
      </div></div>`:''}

    ${t.arts&&t.arts.length?`<div class="node ${t.st==='review'?'wait':'ok'}"><div class="nlab">产出 · ARTIFACT</div>
      ${t.arts.filter(a=>!a.deferred&&!(t.id==='t1'&&a.id==='a2')).map(peek).join('')}</div>`:''}

    ${pptGeneratingNode(t)}

    ${hideM1Delivery?'':`<div class="node ${manualReviewArt?'wait':manualAuditArt?.manual?.reviewResult==='退回'?'wait':hasM1Delivery?(t.st==='done'?'ok':'wait'):t.st==='done'?'ok':''}" id="delivery-${t.id}"><div class="nlab">交付 · DELIVERY</div>
      ${hasM1Delivery?m1Delivery(t):manualReviewArt?manualReviewHistory(manualReviewArt)+manualReviewForm(manualReviewArt):manualAuditArt?manualReviewHistory(manualAuditArt)+manualReviewRecord(manualAuditArt):`<div class="bub" style="color:var(--t2)">
        ${t.standing==='ana'?'常驻分析线程不收口——它是你问数据的地方。<b>结论要变成活儿，得另开一条</b>：在产出上点「建单去做」。'
         :t.standing?'常驻线程没有"最终交付物"——它按排期一直跑。每次产出单独审批，批完就归档，线程继续。'
         :t.prestartDemo&&!t.arts.length?(t.plan?.status==='rejected'?'计划未通过，未开始执行。':canAdjustPrestartPlan(t)?'计划待确认，尚未开始执行。':'执行中，尚未生成产出。')
         :!t.arts||!t.arts.length?'还没有产出。指定人员和产出模板后，将在当前线程中生成交付模板。'
         :t.st==='done'?'✓ 已交付：<b style="color:var(--t1)">'+esc((t.arts.filter(a=>!a.deferred).slice(-1)[0]||{}).ttl)+'</b>，已沉淀到知识库作为可信来源。'
         :'本线程的交付物为 <b style="color:var(--t1)">'+esc((t.arts.filter(a=>!a.deferred).slice(-1)[0]||{}).ttl)+'</b>。上方产出全部批准后自动收口。'}
      </div>`}</div>`}
  </div>

  ${t.standing&&t.log?`<div class="card" style="margin-top:var(--sp-5)">
    <div class="card-t">${t.standing==='ana'?'更早问过的':'历史运行'} <span class="chip mut">${t.log.length}</span>
      <span style="margin-left:auto;font-weight:400;font-size:var(--fs-xs);color:var(--t3)">
        ${t.standing==='ana'?'一条线程装下所有问题':t.log.filter(x=>x.silent).length+' 次静默 · 静默不留产出，也不打扰你'}</span></div>
    ${t.log.map((x,i)=>`${x.silent?'<div class="logrow">':`<button class="logrow logrow-click" onclick="openHistoryArtifact('${t.id}',${i})">`}
      <span class="vv">${x.at}</span>
      <span style="flex:1;font-size:var(--fs-sm);color:${x.silent?'var(--t3)':'var(--t2)'}">${esc(x.res)}</span>
      ${x.silent?`<span class="chip mut">${t.standing==='ana'?'没能给出结论':'未留产出'}</span>`:`<span class="chip lv">${x.arts} 个产出 · 已归档</span>`}${x.silent?'</div>':'</button>'}`).join('')}
    <div style="font-size:var(--fs-xs);color:var(--t3);margin-top:var(--sp-2);line-height:1.55">
      ${t.standing==='ana'?`已经问过 ${t.log.length+t.arts.length} 次，全在这一条线程里。
        <button style="color:var(--primary);font-weight:600" onclick="go('anal')">回到数据分析 ↗</button>`
       :`这条例行已经跑了 ${t.log.length+1} 次，全部记录在这一条线程里。
        <button style="color:var(--primary);font-weight:600" onclick="closeDw();S.atab=1;go('agent')">看排期与链路 ↗</button>`}</div>
  </div>`:''}

  <div class="card" style="margin-top:var(--sp-5)">
    <div class="card-t">对话 <span class="chip mut">${(t.cmts||[]).length}</span></div>
    <div id="cl">${convList(t)}</div>
    <div class="cbox">
      <span class="avs" style="background:${U.du.c}">DU</span>
      <div style="flex:1;min-width:0;position:relative">
        <div id="m-ci"></div>
        <textarea id="ci" rows="3" oninput="onKey(event,'ci')" placeholder="${t.prestartDemo?'补充任务需求或留言…':'线程级的事：范围、优先级、要不要砍掉某个方向…&#10;输入 @ 可以提到团队成员'}"></textarea>
        <div class="cbar">
          <button class="btn ghost sm" data-mention-toggle onclick="showMent('ci',false,this)">@ 提到</button>
          ${t.prestartDemo?'':'<span class="hintline">@ 团队成员 = 留言给他</span>'}
          <button class="btn sm" onclick="addC()">发送</button></div></div>
    </div>
  </div>
 </div>`;
}
function sentimentSummary(a,compact=false){
 const d=a.sentiment;
 return `<div class="sentiment-summary">
  <div class="sentiment-heading"><b>${esc(a.ttl)}</b><span class="sentiment-topic">· ${esc(d.topic)}</span><span class="sentiment-status"><span class="chip mut">${esc(d.stage)}</span>${a.st==='review'?`<span class="sentiment-overdue">${esc(d.overdue)}</span>`:''}</span></div>
  <div class="sentiment-feedback${compact?' compact':''}">${esc(a.ex)}</div>
  <div class="sentiment-analysis"><span class="chip dom">智能分析</span>${esc(d.analysis)}</div>
 </div>`;
}
function sentimentMentions(a){
 return a.sentiment.mentions.map((m,i)=>`<article class="sentiment-mention">
  <div class="sentiment-mention-head"><b>${esc(m.author)}</b><time>${esc(m.at)}</time><button class="btn ghost sm" onclick="openSentimentOriginal('${a.id}',${i})" title="${m.url?'查看原文':'原文链接待补充'}">查看原文 ↗</button></div>
  <div class="sentiment-mention-title">${esc(m.title)}</div>
  <div class="sentiment-feedback">${esc(m.body)}</div>
  <div class="sentiment-tags"><span class="st done">自然提及</span><span class="st hold">负面</span><span>互动 ${m.interactions}</span><span>#${esc(m.topic)}</span></div>
  <div class="sentiment-source-comments"><div class="label">原文用户评论</div>${m.comments.map(c=>`<div class="sentiment-source-comment"><b>${esc(c.author)}：</b>${esc(c.text)}</div>`).join('')}</div>
 </article>`).join('');
}
function drawerReturnEditor(a){
 return `<div class="listing-reject-inline"><input id="drawer-return-${a.id}" type="text" aria-label="退回原因" placeholder="填写退回原因" value="${esc(a.drawerReturnDraft||'')}" oninput="setDrawerReturnDraft('${a.id}',this.value)"><button class="btn sm" onclick="confirmDrawerReturn('${a.id}')">确认</button><button class="btn ghost sm" onclick="cancelDrawerReturn('${a.id}')">取消</button></div>`;
}
function drawerReturnButton(a){return `<button class="btn ghost sm" onclick="startDrawerReturn('${a.id}')">退回</button>`;}
function m1Status(a){
 const s=a.m1?.stage;
 return s==='owner'?'待审批':s==='approved'||s==='requester'?'已批准':s==='done'?'已交付':s==='returned'?'负责人退回':'待审批';
}
function m1StatusClass(a){return ['approved','requester','done'].includes(a.m1?.stage)?'done':a.m1?.stage==='returned'?'run':'review';}
function m1InlineActions(a){
 const me=currentUser(),m=a.m1;
 if(m.stage==='owner'&&me===m.owner)return `<button class="btn sm" onclick="m1OwnerDecision('${a.id}',true)">批准</button><button class="btn ghost sm" onclick="m1OwnerDecision('${a.id}',false)">退回</button>`;
 if(m.stage==='requester'&&me===m.requester)return '';
 if(m.stage==='owner')return `<button class="btn sm m1-disabled" disabled>批准</button><button class="btn ghost sm" onclick="m1OwnerDecision('${a.id}',false)">退回</button>`;
 return '';
}
function m1Footer(a){
 const me=currentUser(),m=a.m1;
 const download=m.kind==='inspection'?`<button class="btn ghost" onclick="toast('巡检报告下载 · 展示功能')"><i data-lucide="download"></i>下载报告</button>`:S.dtab===0?`<button class="btn ghost" onclick="downloadAllDetailImages()"><i data-lucide="download"></i>批量下载</button>`:S.dtab===1?`<button class="btn ghost" onclick="toast('规划表下载 · 展示功能')"><i data-lucide="download"></i>下载规划表</button>`:'';
 const comment=`<button class="rvb ${S.pc?'on':''}" onclick="toggleM1Comment()">评论 ${subCount(a)?`<span class="n">${subCount(a)}</span>`:''} ${S.pc?'▴':'▾'}</button>`;
 if(m.stage==='owner'&&me===m.owner)return `<button class="btn" onclick="m1OwnerDecision('${a.id}',true)">批准</button><button class="btn ghost" onclick="m1OwnerDecision('${a.id}',false)">退回</button>${download}${comment}`;
 if(m.stage==='requester'&&me===m.requester)return `${download}${comment}`;
 if(m.stage==='owner')return `<button class="btn m1-disabled" disabled>批准</button><button class="btn ghost" onclick="m1OwnerDecision('${a.id}',false)">退回</button>${download}${comment}`;
 return `<span class="st ${m1StatusClass(a)}">${m1Status(a)}</span>${download}${comment}`;
}
function m1OwnerDecision(id,ok){
 const [t,a]=findArt(id);if(!a?.m1)return;
 const m=a.m1,at='刚刚';
 m.ownerAt=at;m.ownerDecision=ok?'通过':'退回';m.reviewHistory.push({who:m.owner,role:'产品负责人',result:m.ownerDecision,at});
 if(ok){
  if(t.demoDualAgents&&m.kind==='pdp'){
   m.stage='approved';a.st='done';t.st='run';t.up='刚刚';t.agentStates.pdp='已批准';t.agentStates.insp='运行中';
   t.live={t:'店铺巡检正在检查页面与上架风险',el:'刚刚',sub:['正在核对商品资料、页面信息与上架要求'],p:38};
   if(t.plan?.steps){const step=t.plan.steps.find(s=>s.l.includes('店铺巡检'));if(step){step.s='act';step.r='运行中';}}
   toast('详情页已批准 · 店铺巡检开始运行');
   render();if(S.aid===id&&$('dw')?.classList.contains('on'))drawDw();setTimeout(()=>finishDualInspection(t.id),3000);return;
  }
  if(t.demoDualAgents&&m.kind==='inspection'){
   m.stage='requester';t.st='review';a.st='review';t.up='刚刚';t.agentStates.insp='已批准';
   if(t.plan?.steps){const last=t.plan.steps[t.plan.steps.length-1];if(last){last.s='act';last.r='等待 dudu 统一验收';}}
   toast('巡检报告已批准 · 等待 dudu 验收并分别评分');
  }else{
  m.stage='requester';t.st='review';a.st='review';t.up='刚刚';
  if(t.plan?.steps){t.plan.steps[2].s='ok';t.plan.steps[2].r='Brooks 已批准';t.plan.steps[3].s='act';t.plan.steps[3].r='待验收';}
  toast('Brooks 已批准 · 等待 dudu 验收');
  }
 }else{
  m.stage='returned';t.st='run';a.st='run';a.v++;t.up='刚刚';
  if(t.demoDualAgents){if(m.kind==='pdp'){t.agentStates.pdp='修改中';t.agentStates.insp='等待详情页批准';}else t.agentStates.insp='修改中';}
  if(t.plan?.steps){t.plan.steps[2].s='act';t.plan.steps[2].r='已退回修改';}
  toast(m.kind==='inspection'?'已退回给店铺巡检 Agent 修改':'已退回给详情页 Agent 修改');
 }
 render();if(S.aid===id&&$('dw')?.classList.contains('on'))drawDw();
}
function refreshM1ReviewControls(){
 render();
 if($('dw')?.classList.contains('on'))drawDw();
}
function setM1Score(v){S.m1Score=v;refreshM1ReviewControls();}
function setM1AgentScore(kind,v){
 const t=T.find(x=>x.id===S.tid),store=t?m1AgentReviewStore(t):null;if(!store)return;
 store.items[kind]={...(store.items[kind]||{}),score:v};
 refreshM1ReviewControls();
}
function setM1Decision(v){S.m1Decision=v;refreshM1ReviewControls();}
function m1AgentReviewStore(t){
 if(S.m1AgentReviews?.tid!==t.id)S.m1AgentReviews={tid:t.id,active:t.arts?.find(x=>x.m1?.kind==='pdp')?.m1.kind||t.arts?.find(x=>x.m1)?.m1.kind,items:{}};
 return S.m1AgentReviews;
}
function selectM1ReviewAgent(kind){const t=T.find(x=>x.id===S.tid);if(!t)return;const store=m1AgentReviewStore(t);store.active=kind;refreshM1ReviewControls();}
function m1AgentReviewComplete(review){return review?.decision==='pass'?!!review.score:review?.decision==='return'?!!(review.feedback||'').trim():false;}
function setM1AgentDecision(kind,v){const t=T.find(x=>x.id===S.tid);if(!t)return;const store=m1AgentReviewStore(t);store.items[kind]={...(store.items[kind]||{}),decision:v};refreshM1ReviewControls();}
function setM1AgentFeedback(kind,v){const t=T.find(x=>x.id===S.tid);if(!t)return;const store=m1AgentReviewStore(t);store.items[kind]={...(store.items[kind]||{}),feedback:v};refreshM1AgentReviewCompletion();}
function refreshM1AgentReviewCompletion(){
 const t=T.find(x=>x.id===S.tid);if(!t?.demoDualAgents)return;const store=m1AgentReviewStore(t),kinds=t.arts.filter(x=>x.m1).map(x=>x.m1.kind);
 kinds.forEach(kind=>{const tab=document.querySelector(`[data-m1-review-kind="${kind}"]`),done=m1AgentReviewComplete(store.items[kind]);if(!tab)return;tab.classList.toggle('done',done);let check=tab.querySelector('.m1-review-check');if(done&&!check){check=document.createElement('span');check.className='m1-review-check';check.textContent='✓';tab.appendChild(check);}else if(!done&&check)check.remove();});
 const complete=document.querySelector('[data-m1-review-complete]'),allDone=kinds.length>0&&kinds.every(kind=>m1AgentReviewComplete(store.items[kind]));if(complete)complete.disabled=!allDone;
 const hint=document.querySelector('[data-m1-review-hint]');if(hint)hint.textContent=allDone?'两个 Agent 均已填写完整':'请先逐个完成 Agent 验收';
}
function m1RequesterApprove(id){
 const [t,a]=findArt(id);if(!a?.m1)return;
 const decision=S.m1Decision,score=S.m1Score,agentScores=S.m1AgentScores||{},fb=($('m1-feedback-'+id)?.value||$('m1-feedback')?.value||'').trim(),m=a.m1;
 if(t.demoDualAgents){
  const store=m1AgentReviewStore(t),reviewed=t.arts.filter(x=>x.m1),reviews=reviewed.map(x=>({artifact:x,review:store.items[x.m1.kind]||{}}));
  if(reviews.some(x=>!m1AgentReviewComplete(x.review))){toast('请先完成每个 Agent 的验收');return;}
  const returned=reviews.filter(x=>x.review.decision==='return');
  reviews.forEach(({artifact:x,review:r})=>{
   const xm=x.m1;xm.requesterAt='刚刚';xm.score=r.score||null;xm.feedback=r.feedback||'';x.st=r.decision==='pass'?'done':'review';xm.stage=r.decision==='pass'?'done':'owner';
   if(r.decision==='return'){xm.ownerAt=null;xm.ownerDecision=null;}
   xm.reviewHistory.push({who:xm.requester,role:'任务发起人',result:r.decision==='pass'?'验收通过':'验收退回，返回负责人审批',score:r.score||null,feedback:r.feedback||'',at:'刚刚'});
   t.agentStates[xm.kind==='inspection'?'insp':'pdp']=r.decision==='pass'?'已完成':'待 Brooks 审批';
  });
  if(returned.length){
   t.st='review';t.up='刚刚';const names=returned.map(x=>x.artifact.m1.kind==='inspection'?'店铺巡检':'详情页生成');
   returned.forEach(x=>{store.items[x.artifact.m1.kind]={};});store.active=returned[0].artifact.m1.kind;
   render();if($('dw')?.classList.contains('on'))drawDw();toast('已退回 '+names.join('、')+' · 备注已提交');return;
  }
  t.st='done';t.up='刚刚';if(t.plan?.steps){const step=t.plan.steps[t.plan.steps.length-1];if(step){step.s='ok';step.r='已验收';}}
  S.m1AgentReviews=null;render();if($('dw')?.classList.contains('on'))drawDw();toast('dudu 已完成逐项验收 · 双 Agent 任务已交付');return;
 }
 if(!decision){toast('请先选择通过或退回');return;}
 if(decision==='pass'&&t.demoDualAgents&&(!agentScores.pdp||!agentScores.inspection)){toast('请分别为两个 Agent 评分');return;}
 if(decision==='pass'&&!t.demoDualAgents&&!score){toast('请先选择评分');return;}
 if(decision==='return'&&!fb){toast('退回时必须填写备注');return;}
 if(decision==='return'){
  m.stage='owner';m.requesterAt='刚刚';m.ownerAt=null;m.ownerDecision=null;m.feedback=fb;m.reviewHistory.push({who:m.requester,role:'任务发起人',result:'验收退回，返回负责人审批',feedback:fb,at:'刚刚'});
  a.st='review';a.v++;t.st='review';t.up='刚刚';if(t.demoDualAgents)t.agentStates.insp='待 Brooks 审批';
  if(t.plan?.steps){const last=t.plan.steps[t.plan.steps.length-1];if(last){last.s='act';last.r='待审批';last.m='dudu 退回后返回 Brooks 重新审批';}}
  S.m1Decision=null;S.m1Score=null;S.m1AgentScores=null;render();if($('dw')?.classList.contains('on'))drawDw();toast(t.demoDualAgents?'已退回巡检报告 · 返回 Brooks 重新审批':'已退回 · 返回 Brooks 重新审批');return;
 }
 const reviewed=t.demoDualAgents?t.arts.filter(x=>x.m1):[a];
 reviewed.forEach(x=>{
  const itemScore=t.demoDualAgents?agentScores[x.m1.kind]:score;
  x.m1.stage='done';x.m1.requesterAt='刚刚';x.m1.score=itemScore;x.m1.feedback=fb;x.st='done';
  x.m1.reviewHistory.push({who:m.requester,role:'任务发起人',result:'验收通过',score:itemScore,feedback:fb,at:'刚刚'});
 });
 t.st='done';t.up='刚刚';if(t.demoDualAgents){t.agentStates.pdp='已完成';t.agentStates.insp='已完成';}
 if(t.plan?.steps){const step=t.demoDualAgents?t.plan.steps[t.plan.steps.length-1]:t.plan.steps[3];if(step){step.s='ok';step.r='已验收';}}
 S.m1Decision=null;S.m1Score=null;S.m1AgentScores=null;render();drawDw();toast(t.demoDualAgents?'dudu 已完成验收并分别评分 · 双 Agent 任务已交付':'dudu 已验收 · 任务已交付');
}
function m1Delivery(t){
 const m1Arts=t.arts?.filter(x=>x.m1)||[];
 const a=m1Arts.find(x=>x.m1.stage==='requester')||m1Arts.find(x=>['owner','returned'].includes(x.m1.stage))||m1Arts[m1Arts.length-1],m=a?.m1,me=currentUser();if(!a||!m)return '';
 const historySource=t.demoDualAgents?m1Arts.flatMap(x=>(x.m1.reviewHistory||[]).map(h=>({...h,artifact:x.ty}))):(m.reviewHistory||[]);
 const history=historySource.map(h=>{
  const returned=(h.result||'').includes('退回');
  return `<div class="manual-record"><b>${esc(U[h.who]?.n||h.who)} · ${esc(h.role)}${h.artifact?' · '+esc(h.artifact):''}</b> <span class="${returned?'manual-record-return':''}">${esc(h.result)}${h.score?` · 评分 ${h.score}/5`:''}</span><span style="float:right;color:var(--t3)">${esc(h.at)}</span>${h.feedback?`<div style="margin-top:var(--sp-1);color:var(--t2)">${esc(h.feedback)}</div>`:''}</div>`;
 }).join('');
 if(m.stage==='owner'){const returned=(m.reviewHistory||[]).some(h=>(h.result||'').includes('退回'));return `<div class="bub manual-review">
  <div class="who"><span class="avs" style="background:${U.br.c}">BR</span><span class="nm">${returned?'返回 Brooks 重新审批':'等待 Brooks 审批'}</span><span class="chip" style="background:var(--orange-bg);color:var(--orange-fg);border:1px solid #FED7AA">待审批</span><span class="tm">刚刚</span></div>
  <div class="manual-review-intro">${returned?'dudu 已退回，本次产出返回产品负责人 Brooks 重新审批；通过后会再次提交给 dudu 验收。':t.demoDualAgents?'店铺巡检报告已经生成。Brooks 批准后，两份产出会一起交给 dudu 验收，并分别为两个 Agent 评分。':'产品负责人需先审批本次产出，通过后再提交给 dudu 验收打分。'}</div>
  ${history}
 </div>`;}
 if(m.stage==='requester'){
  const decision=S.m1Decision;
  const dualStore=t.demoDualAgents?m1AgentReviewStore(t):null;
  const reviewArts=t.demoDualAgents?m1Arts.filter(x=>x.m1):[];
  const reviewKinds=reviewArts.map(x=>x.m1.kind);
  if(dualStore&&!reviewKinds.includes(dualStore.active))dualStore.active=reviewKinds.find(k=>!m1AgentReviewComplete(dualStore.items[k]))||reviewKinds[0];
  const activeKind=dualStore?.active,activeReview=dualStore?.items[activeKind]||{};
  const activeLabel=activeKind==='inspection'?'店铺巡检':'详情页生成';
  const allAgentReviewsDone=!!dualStore&&reviewKinds.length>0&&reviewKinds.every(k=>m1AgentReviewComplete(dualStore.items[k]));
  const dualReview=t.demoDualAgents?`<div class="m1-agent-review-panel">
    <div class="m1-review-tabs">${reviewArts.map(x=>{const kind=x.m1.kind,label=kind==='inspection'?'店铺巡检':'详情页生成',agent=kind==='inspection'?'insp':'pdp',item=dualStore.items[kind]||{},done=m1AgentReviewComplete(item);return `<button class="m1-review-tab ${activeKind===kind?'on':''} ${done?'done':''}" data-m1-review-kind="${kind}" onclick="selectM1ReviewAgent('${kind}')">${AV(agent,22)}<span>${label}</span>${done?'<span class="m1-review-check">✓</span>':''}</button>`;}).join('')}</div>
    <div class="manual-review-section"><div class="manual-review-label">1 决策</div><div class="manual-review-options">
     <button class="manual-review-choice ${activeReview.decision==='pass'?'on':''}" onclick="setM1AgentDecision('${activeKind}','pass')">通过</button>
     <button class="manual-review-choice ${activeReview.decision==='return'?'on':''}" onclick="setM1AgentDecision('${activeKind}','return')">退回</button>
    </div></div>
    <div class="manual-review-section"><div class="manual-review-label">2 评分</div><div class="manual-review-options">
     ${[1,2,3,4,5].map(n=>`<button class="manual-review-choice manual-review-score ${activeReview.score===n?'on':''}" onclick="setM1AgentScore('${activeKind}',${n})">${n}</button>`).join('')}
    </div></div>
    <div class="manual-review-section"><div class="manual-review-label">3 备注 ${activeReview.decision==='return'?`<span style="color:#DC2626;font-weight:500">· 退回时必填</span>`:`<span class="optional">· 选填</span>`}</div>
     <textarea id="m1-feedback-${activeKind}" placeholder="${activeReview.decision==='return'?'请填写退回原因':'给 '+activeLabel+' Agent 一点反馈'}" oninput="setM1AgentFeedback('${activeKind}',this.value)">${esc(activeReview.feedback||'')}</textarea>
    </div>
   </div>
   <div class="manual-review-foot m1-review-complete"><button class="btn" data-m1-review-complete onclick="m1RequesterApprove('${a.id}')" ${allAgentReviewsDone?'':'disabled'}>完成验收</button><span data-m1-review-hint>${allAgentReviewsDone?'两个 Agent 均已填写完整':'请先逐个完成 Agent 验收'}</span></div>`:'';
  return `<div class="bub manual-review">
   <div class="who"><span class="avs" style="background:${U.br.c}">BR</span><span class="nm">${t.demoDualAgents?'两份产出均已由 Brooks 批准':'Brooks 已批准'}</span><span class="chip" style="background:var(--orange-bg);color:var(--orange-fg);border:1px solid #FED7AA">待发起人验收</span><span class="tm">刚刚</span></div>
   <div class="manual-review-intro">${t.demoDualAgents?'详情页内容和店铺巡检报告已全部通过负责人审批。请统一验收，并分别为两个 Agent 评分。':'产品负责人已完成第一层审核。请审核本次交付，通过后任务才会正式完成；退回后由 Agent 继续修改。'}</div>
   ${me===m.requester?(t.demoDualAgents?dualReview:`<div class="manual-review-section"><div class="manual-review-label">1 决策</div><div class="manual-review-options">
    <button class="manual-review-choice ${decision==='pass'?'on':''}" onclick="setM1Decision('pass')">通过</button>
    <button class="manual-review-choice ${decision==='return'?'on':''}" onclick="setM1Decision('return')">退回</button>
   </div></div>
   <div class="manual-review-section"><div class="manual-review-label">2 评分</div><div class="manual-review-options">
    ${[1,2,3,4,5].map(n=>`<button class="manual-review-choice manual-review-score ${S.m1Score===n?'on':''}" onclick="setM1Score(${n})">${n}</button>`).join('')}
   </div></div>
   <div class="manual-review-section"><div class="manual-review-label">3 评价 ${decision==='return'?`<span style="color:#DC2626;font-weight:500">· 退回时必填</span>`:`<span class="optional">· 选填</span>`}</div>
    <textarea id="m1-feedback" placeholder="${decision==='return'?'请填写退回原因':'给详情页 Agent 一点反馈'}">${esc(m.feedback||'')}</textarea>
   </div>
   <div class="manual-review-foot"><button class="btn" onclick="m1RequesterApprove('${a.id}')">批准</button><span style="font-size:var(--fs-xs);color:var(--t3)">任务发起人负责审批</span></div>`):`<span class="st review">等待 dudu 验收</span>`}
  </div>`;
 }
 if(m.stage==='done'){const scoreText=t.demoDualAgents?`详情页生成 ${m1Arts.find(x=>x.m1.kind==='pdp')?.m1.score||4}/5 · 店铺巡检 ${m1Arts.find(x=>x.m1.kind==='inspection')?.m1.score||4}/5`:`评分 ${m.score||4} / 5`;return `<div class="bub manual-review-result pass"><div class="manual-review-result-head"><span class="manual-review-result-icon">✓</span><div><div class="manual-review-result-title">已交付</div><div class="manual-review-result-sub">Brooks 已批准，dudu 已验收 · ${scoreText}</div></div></div>
  <div style="margin:var(--sp-3) 0 10px;color:var(--t2);font-size:var(--fs-sm);line-height:1.65">${t.demoDualAgents?'详情页内容与店铺巡检报告已合并完成验收。':'本线程的交付物为 <b style="color:var(--t1)">A8O 修护精华 30ml · 详情页 v4</b>。上方产出全部批准后自动收口。'}</div>${history}</div>`;
 }
 return `<div class="bub manual-review-result return"><div class="manual-review-result-head"><span class="manual-review-result-icon">↩</span><div><div class="manual-review-result-title">负责人退回</div><div class="manual-review-result-sub">详情页 Agent 修改后会再次提交 Brooks 审核</div></div></div>${history}</div>`;
}
function dM1PdpDirection(a){
 const direction=m1DirectionOption(a);
 const defaultRef='https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=500&q=85';
 const ref=direction.referenceImage===undefined?defaultRef:direction.referenceImage;
 return `<div class="fld"><label>标题</label><textarea rows="2" onchange="setM1DirectionField('${a.id}','t',this.value)">${esc(direction.t)}</textarea></div>
  <div class="fld"><label>内容</label><textarea rows="14" onchange="setM1DirectionField('${a.id}','body',this.value)">${esc(direction.body||direction.e)}</textarea></div>
  <div class="direction-reference"><span class="direction-reference-label">参考产品图（仅限 1 张）</span><div class="img-ref">
   ${ref?`<div class="thumb" style="background-image:url('${esc(ref)}')"><button type="button" class="promotion-ref-remove" onclick="removeM1DirectionReference('${a.id}')" title="移除参考图"><i data-lucide="x"></i></button></div>`:''}
   <span class="ref-add-wrap"><button type="button" class="add" onclick="toggleDirectionReferenceMenu(event,'${a.id}',0)" title="添加参考图"><i data-lucide="plus"></i></button>${S.directionRefMenu===a.id+':0'?directionReferenceMenu(a.id,0):''}</span>
  </div><div class="help">后续详情图生成会使用这里的产品图。此处仅限 1 张清晰参考图，以提升生成稳定性。</div></div>`;
}
function dM1PdpPlan(a){
 if(!a.planRows)a.planRows=directionPlanRows(Number.isInteger(a.sourceDirection)?a.sourceDirection:1);
 return dPdpPlanRows(a.id,0,a.planRows,true);
}
function m1DirectionOption(a){
 if(!a.directionOption)a.directionOption={t:'方向一：成分证据先行',body:'首屏以产品与核心成分作为视觉中心，用一句明确的修护主张快速建立认知。\n\n第二至第四屏依次解释敏感肌常见问题、核心成分作用与技术机制，并用实验数据支撑产品功效。\n\n后续补充适用人群、使用方法、规格信息与购买利益点，让页面从专业证据自然过渡到购买决策。',e:a.ex,referenceImage:undefined};
 return a.directionOption;
}
function setM1DirectionField(id,key,value){
 const [,a]=findArt(id);if(!a?.m1)return;
 const o=m1DirectionOption(a);o[key]=value;if(key==='body')o.e=value.split('\n').filter(Boolean)[0]||value;
 toast('创意方向已保存');
}
function removeM1DirectionReference(id){
 const [,a]=findArt(id);if(!a?.m1)return;
 m1DirectionOption(a).referenceImage=null;drawDw();toast('已移除参考产品图');
}
function toggleM1Comment(){const opening=!S.pc;S.pc=!S.pc;drawDw();if(opening)scrollDrawerToBottom();}
function answeredRunningNode(t,a){
 if(t.live||!t.ask||!t.answered||t.st!=='run'||(t.arts&&t.arts.length))return '';
 const p=t.answerRun?.p||42,tk=t.answerRun?.tk||480,sub=t.answerRun?.sub||'正在根据补充信息生成后续产出';
 return `<div class="node act"><div class="nlab">执行 · RUNNING</div>
  <div class="live">
   <div class="live-h agent-run-hit" role="button" tabindex="0" onclick="openTrace('${t.ag}','${t.id}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openTrace('${t.ag}','${t.id}')}" title="查看运行状态"><span class="spin"></span><span class="t">${esc(a.n)} 正在工作</span><span class="e">刚刚</span></div>
   <div class="live-t">${esc(sub)}</div>
   <div class="pbar"><i style="width:${p}%"></i></div>
  </div></div>`;
}
function pptGeneratingNode(t){
 const live=t.pptLive;if(!live)return '';
 return `<div class="node act"><div class="nlab">执行 · RUNNING</div>
  <div class="live">
   <div class="live-h agent-run-hit" role="button" tabindex="0" onclick="openTrace('ppt','${t.id}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openTrace('ppt','${t.id}')}" title="查看运行状态"><span class="spin"></span><span class="t">${esc(live.t)}</span><span class="e">刚刚</span></div>
   <div class="live-t">${esc(live.sub)}</div>
   <div class="pbar"><i style="width:${live.p}%"></i></div>
   <div class="live-f" style="justify-content:flex-end"><button class="btn ghost sm" onclick="openTrace('ppt','${t.id}')">看它怎么想的</button></div>
  </div></div>`;
}
function refreshDrawerReturn(id){
 const drawerOpen=$('dw')?.classList.contains('on')&&S.aid===id;
 if(drawerOpen)drawDw();else render();
}
function startDrawerReturn(id){
 const [,a]=findArt(id);if(!a)return;
 a.drawerReturning=true;a.drawerReturnDraft='';refreshDrawerReturn(id);
 setTimeout(()=>$('drawer-return-'+id)?.focus(),0);
}
function setDrawerReturnDraft(id,value){const [,a]=findArt(id);if(a)a.drawerReturnDraft=value;}
function cancelDrawerReturn(id){
 const [,a]=findArt(id);if(!a)return;
 a.drawerReturning=false;a.drawerReturnDraft='';refreshDrawerReturn(id);
}
function confirmDrawerReturn(id){
 const [t,a]=findArt(id);if(!t||!a)return;
 const reason=(a.drawerReturnDraft||'').trim();
 if(!reason){toast('请填写退回原因');$('drawer-return-'+id)?.focus();return;}
 a.returnReason=reason;(a.sub=a.sub||[]).push({w:'du',k:'chg',tx:'退回原因：'+reason,at:'刚刚'});
 a.drawerReturning=false;a.drawerReturnDraft='';a.st='run';t.st='run';t.up='刚刚';
 closeDw();render();renderNav();toast('已退回，修改原因已记录');
}
function sentimentActions(a,inDrawer=true){
 if(a.drawerReturning)return drawerReturnEditor(a);
 return `${a.st==='review'?`<button class="btn sm" onclick="sentimentAction('${a.id}','批准')">批准</button>${drawerReturnButton(a)}<button class="btn ghost sm" onclick="sentimentAction('${a.id}','忽略')">忽略</button>`:`<span class="st ${a.sentiment.result?'hold':'done'}">${a.sentiment.result||'已批准'}</span>`}
  <button class="btn ghost sm" onclick="openSentimentMentions('${a.id}')">查看相关提及 ${a.sentiment.mentions.length}</button>
  ${inDrawer
    ?`<button class="rvb ${S.pc?'on':''}" onclick="toggleSentimentComment()" aria-expanded="${!!S.pc}">评论 ${subCount(a)?`<span class="n">${subCount(a)}</span>`:''} ${S.pc?'▴':'▾'}</button>`
    :`<button class="rvb" onclick="openReview('${a.id}')">评论 ${subCount(a)?`<span class="n">${subCount(a)}</span>`:''}</button>`}`;
}
function openSentimentMentions(id){
 if(S.aid!==id||!$('dw').classList.contains('on'))openDw(id);
 S.dtab=1;drawDw();const body=$('dw').querySelector('.dw-b');if(body)body.scrollTop=0;
}
function openSentimentOriginal(id,i){
 const [,a]=findArt(id),m=a?.sentiment?.mentions[i];if(!m)return;
 if(!m.url){toast('这条提及的原文链接待补充');return;}
 if(!/^https?:\/\//i.test(m.url)){toast('原文链接格式不正确');return;}
 window.open(m.url,'_blank','noopener,noreferrer');
}
function toggleSentimentComment(){
 const opening=!S.pc;S.pc=opening;drawDw();if(opening)scrollDrawerToBottom();
}
function sentimentAction(id,action){
 const [t,a]=findArt(id);if(!a?.sentiment)return;
 const drawerOpen=$('dw').classList.contains('on')&&S.aid===id;
 a.st='done';a.sentiment.result=action==='忽略'?'已忽略':null;
 if(t.arts.every(x=>x.st==='done'))t.st='done';
 render();if(drawerOpen)drawDw();toast(action==='忽略'?'已忽略这条舆情发现':'已批准这条舆情发现');
}
function inspectionSummary(a){
 const d=a.inspection;
 if(a.ty==='分析结论'){
  const explanation=`${d.metric||'指标'}为 ${d.actual}，低于预期范围 ${d.expected}。${d.basis} 当前结果说明${d.metric||'该指标'}偏离近期正常水平，${d.explanationHint||'建议继续核对相关业务数据与统计口径。'}`;
  return `<div class="analysis-text-summary"><h2>${esc(a.ttl)}</h2><p>${esc(explanation)}<br>数据时间：${esc(d.date)}　数据来源：${esc(d.source||'Digate')}</p></div>`;
 }
 return `<div class="inspection-summary">
  <div class="inspection-heading"><b>${esc(a.ttl)}</b><span class="st review">${esc(d.severity)}</span><span class="inspection-source">来源：${esc(d.source||'Digate')}</span><span class="chip dom">${esc(d.category)}</span></div>
  <div class="inspection-explanation"><b>为何标记：</b>${esc(a.ex)}</div>
  <div class="inspection-metrics">
   <div class="inspection-metric actual"><span>实际 ${esc(d.metric||'GMV')}</span><strong>${esc(d.actual)}</strong><span class="inspection-hint">数据日期：${esc(d.date)}</span></div>
   <div class="inspection-metric"><span>预期范围</span><strong>${esc(d.expected)}</strong><span class="inspection-hint">预期依据：${esc(d.basis)}</span></div>
  </div>
 </div>`;
}
function artifactRunLink(by){
 const agent=AG[by]||REG.find(x=>x.id===by);if(!agent)return '';
 const t=T.find(x=>x.id===S.tid),label=t?.agentLabels?.[by]||nick(by)||agent.n;
 return `<button class="by artifact-run" onclick="event.stopPropagation();openTrace('${by}','${S.tid}')">${AV(by,16)}<span class="odot ${ONLINE[by]?'on':'off'}"></span>${esc(label)} · 看运行 ↗</button>`;
}
function csaPeek(a){
 const c=a.csa||{};
 return `<div class="pk" id="pk-${a.id}">
  <div class="pk-h"><span class="ty">产出 · 客户数据咨询</span><span class="st ${a.st==='done'?'done':'run'}">${a.st==='done'?'已交付':'进行中'}</span>${artifactRunLink(a.by)}</div>
  <div class="manual-artifact-summary" onclick="openDw('${a.id}')">
   <div class="pk-t"><div class="tt">${esc(a.ttl)}</div><div class="ex">${esc(a.ex)}</div></div>
   <div class="manual-artifact-owner"><span>同一上下文可继续追问</span></div>
  </div>
  <div class="pk-a">${a.st==='done'?'':`<button class="btn sm" onclick="approveCSA('${a.id}')">批准</button>`}<button class="btn ghost sm" onclick="openDw('${a.id}');S.dtab=1;S.pc=false;drawDw()">查看邮件</button><button class="rvb" onclick="openCSAComments('${a.id}')">评论 ${subCount(a)?`<span class="n">${subCount(a)}</span>`:''}</button><span class="v num">v${a.v} · 刚刚</span></div>
  ${a.nxt&&a.st==='done'?`<div class="nxt"><span class="lb">接下来</span>
   ${a.nxt.map(n=>`<button class="na" onclick="toast('${n==='同步到活动'?'已同步到活动':'已在同一线程中新增步骤：'+n}')">${n} →</button>`).join('')}</div>`:''}
 </div>`;
}
function pptOutlinePeek(a){
 return `<div class="pk" id="pk-${a.id}">
  <div class="pk-h"><span class="ty">产出 · PPT 大纲</span><span class="chip plat">中文</span><span class="st ${a.st==='done'?'done':'review'}">${a.st==='done'?'已批准':'待确认'}</span>${artifactRunLink(a.by)}</div>
  <div class="manual-artifact-summary" onclick="openDw('${a.id}')">
   <div class="pk-t"><div class="tt">${esc(a.deckTitle)}</div><div class="ex">${esc(a.ex)}</div></div>
  </div>
  <div class="pk-a">${a.drawerReturning?drawerReturnEditor(a):`${a.st==='done'?'':`<button class="btn sm" onclick="confirmPptOutline('${a.id}')">批准</button>`}<button class="btn ghost sm" onclick="openDw('${a.id}')">查看大纲</button>${a.st==='done'?'':`<button class="btn ghost sm" onclick="startDrawerReturn('${a.id}')">退回</button>`}<button class="rvb" onclick="openReportComments('${a.id}')">评论 ${subCount(a)?`<span class="n">${subCount(a)}</span>`:''}</button><span class="v num">v${a.v} · 刚刚</span>`}</div>
 </div>`;
}
function pptFilePeek(a){
 const ready=a.st!=='run';
 return `<div class="pk" id="pk-${a.id}">
  <div class="pk-h"><span class="ty">产出 · PPT 文件</span><span class="chip plat">PPTX</span><span class="st ${a.st}">${a.st==='done'?'已批准':ready?'待审批':'生成中'}</span>${artifactRunLink(a.by)}</div>
  <div class="manual-artifact-summary ppt-file-summary">
   <div class="pk-t"><div class="tt">${esc(a.ttl)}</div><div class="ex">${ready?`PPT 已生成完成 · ${esc(a.createdAt)}`:'PPT Agent 正在生成演示文稿，请稍候…'}</div></div>
   ${ready?`<div class="ppt-file-meta"><span>页数：<b>${a.pageCount} 页</b></span><span>消耗积分：<b>${a.credits}</b></span></div><div class="ppt-file-hint">下载链接约 7 天有效，建议尽快保存。</div>`:'<div class="pbar ppt-file-progress"><i style="width:68%"></i></div>'}
  </div>
  ${ready?`<div class="pk-a">${a.drawerReturning?drawerReturnEditor(a):`${a.st==='review'?`<button class="btn sm" onclick="approvePptFile('${a.id}')">批准</button>`:''}<button class="btn ghost sm" onclick="openPptOnline('${a.id}')">在线编辑</button><button class="btn ghost sm" onclick="downloadPptFile('${a.id}')">下载 PPTX</button>${a.st==='review'?`<button class="btn ghost sm" onclick="startDrawerReturn('${a.id}')">退回</button>`:''}<button class="rvb" onclick="openReportComments('${a.id}')">评论 ${subCount(a)?`<span class="n">${subCount(a)}</span>`:''}</button><span class="v num">v${a.v} · 刚刚</span>`}</div>${a.st==='done'?`<div class="nxt"><span class="lb">接下来</span><button class="na" onclick="toast('已同步到活动')">同步到活动 →</button></div>`:''}`:''}
 </div>`;
}
function peek(a){
 const g=AG[a.by];
 if(a.mode==='pptfile')return pptFilePeek(a);
 if(a.mode==='pptoutline')return pptOutlinePeek(a);
 if(a.mode==='seo-intake')return seoIntakePeek(a);
 if(a.mode==='csa')return csaPeek(a);
 if(a.mode==='promoseq')return promotionPeek(a);
 if(a.listing)return listingPeek(a);

 if(a.manualOutput){
  const m=a.manual,people=manualArtifactPeople(m),u=U[people[0]],names=manualPeopleLabel(people),files=manualFiles(m);
  return `<div class="pk" id="pk-${a.id}">
   <div class="pk-h"><span class="ty">产出 · 人工提交</span><span class="chip" style="background:var(--orange-bg);color:var(--orange-fg);border:1px solid #FED7AA">${esc(m.template)}</span><span class="st ${a.st}">${STN[a.st]}</span><span class="by" style="margin-left:auto">由 ${esc(names)} 提交</span></div>
   <div class="manual-artifact-summary" onclick="openDw('${a.id}')">
    <div class="pk-t"><div class="tt">${esc(a.ttl)}</div><div class="ex">${esc(a.ex)}</div></div>
    <div class="manual-artifact-owner"><span class="avs" style="background:${u.c}">${u.s}</span><b>${esc(names)}</b>${m.deadline?`<span>· 截止 ${esc(m.deadline.replace('T',' '))}</span>`:''}<span>· ${files.length} 个文件</span></div>
   </div>
   <div class="pk-a">${m.reviewed?`<span class="st done">已完成</span>`:m.submitted?`<span class="st review">待主管审核</span>`:`<button class="btn sm" onclick="completeManualTask('${a.id}')">标记为已完成</button>`}<button class="btn ghost sm" onclick="openDw('${a.id}')">查看产出</button><span class="v num">v${a.v} · 刚刚</span></div>
  </div>`;
 }

 if(a.mode==='report'){
  const bad=a.secs.filter(x=>!x.ok).length, cited=a.secs.filter(x=>x.src==='引用').length;
  return `<div class="pk" id="pk-${a.id}">
   <div class="pk-h"><span class="ty">产出 · ${a.ty}</span>
     <span class="chip mut">${a.secs.length} 节</span>
     <span class="chip lv">引用 ${cited} 条已批准产出</span>
     <span class="st ${a.st}">${STN[a.st]}</span>
     ${artifactRunLink(a.by)}</div>
   <div class="pk-b" onclick="openDw('${a.id}')" style="display:block">
     <div class="pk-t"><div class="tt">${esc(a.ttl)}</div><div class="ex">${esc(a.ex)}</div></div>
     <div style="display:flex;gap:var(--sp-1);margin-top:var(--sp-3);flex-wrap:wrap">
       ${a.secs.map((x,i)=>`<span class="secchip${x.ok?'':' bad'}">${i+1} ${esc(x.n)}</span>`).join('')}</div></div>
   <div class="vals">${a.vals.map(v=>`<span class="val ${v.s}">${v.s==='ok'?'✓':v.s==='warn'?'!':'✕'} ${v.l} <span class="m">${v.v}</span></span>`).join('')}</div>
   <div class="pk-a">
     ${bad?`<button class="btn sm" onclick="openDw('${a.id}')">去处理 · ${bad} 节口径未过</button>`
          :`<button class="btn sm" onclick="act('${a.id}','交付客户')">交付客户</button>`}
     <button class="btn ghost sm" onclick="act('${a.id}','退回')">退回</button>
     <button class="rvb" onclick="openReportComments('${a.id}')">评论${subCount(a)?` <span class="n">${subCount(a)}</span>`:''}</button>
     <span class="v num">v${a.v} · 今天 08:00</span></div>
   <div class="nxt"><span class="lb">接下来</span>
    <span class="plan-download"><button class="na" onclick="event.stopPropagation();S.planDownloadOpen=!S.planDownloadOpen;render()">下载月度报告 →</button>
     ${S.planDownloadOpen?`<span class="plan-download-menu"><button onclick="event.stopPropagation();downloadMonthlyReport('HTML')">HTML 格式</button><button onclick="event.stopPropagation();downloadMonthlyReport('Word')">Word 格式</button></span>`:''}
    </span>
   </div></div>`;
 }
 if(a.mode==='roster'||a.mode==='items'){
  const by={};a.rows.forEach(r=>by[r.s]=(by[r.s]||0)+1);
  const tot=a.rows.reduce((n,r)=>n+subCount(r),0);
  return `<div class="pk" id="pk-${a.id}">
   <div class="pk-h"><span class="ty">产出 · ${a.ty}</span><span class="chip mut">${a.rows.length} ${a.mode==='items'?'个 SKU':'人'}</span>
     <span class="st ${a.st}">${STN[a.st]}</span>${artifactRunLink(a.by)}</div>
   <div class="pk-b" onclick="openDw('${a.id}')" style="display:block">
     <div class="pk-t"><div class="tt">${esc(a.ttl)}</div><div class="ex">${esc(a.ex)}</div></div>
     <div style="display:flex;gap:var(--sp-1);margin-top:var(--sp-3);flex-wrap:wrap">${Object.keys(by).map(k=>`<span class="st ${RST[k]||(k==='可提交'?'done':'hold')}">${k} ${by[k]}</span>`).join('')}</div>
     <div style="display:flex;gap:-8px;margin-top:var(--sp-3)">${a.rows.slice(0,8).map(r=>
       `<span class="pv sq" style="${grad(r.g[0],r.g[1])};width:26px;height:26px;flex:0 0 26px;border-radius:50%;margin-right:-6px;border:2px solid #fff"></span>`).join('')}
       ${a.rows.length<9?'':'<span style="margin-left:var(--sp-3);font-size:var(--fs-xs);color:var(--t3);align-self:center">+22</span>'}</div>
   </div>
   <div class="vals">${a.vals.map(v=>`<span class="val ${v.s}">${v.s==='ok'?'✓':'!'} ${v.l} <span class="m">${v.v}</span></span>`).join('')}</div>
   <div class="pk-a">${a.st==='review'?`<button class="btn sm" onclick="act('${a.id}','批准')">${a.mode==='items'?'全部提交':'批准名单'}</button>`:''}
     <button class="btn ghost sm" onclick="openDw('${a.id}')">打开</button>
     ${a.mode==='roster'?'':`<button class="rvb" onclick="openDw('${a.id}');setTimeout(()=>toggleRow(0),40)">逐条评论 ${tot?`<span class="n">${tot}</span>`:''}</button>`}
     <span class="v num">v${a.v} · 26分钟前</span></div>
   ${a.mode==='roster'&&a.nxt&&a.st==='done'?`<div class="nxt"><span class="lb">接下来</span>
     ${a.nxt.map(n=>`<button class="na" onclick="toast('${n==='同步到活动'?'已同步到活动':'已在同一线程中新增步骤：'+n}')">${n} →</button>`).join('')}</div>`:''}</div>`;
 }
 if(a.mode==='plans'){
  return `<div class="pk" id="pk-${a.id}">
   <div class="pk-h"><span class="ty">产出 · ${a.id==='a2'?'活动策划':'社媒内容'}</span><span class="chip plat">小红书</span>
    ${artifactRunLink(a.by)}</div>
   <div style="padding:var(--sp-3)"><div class="opts">${a.plans.map((p,i)=>`
     <div class="optwrap"><button class="opt ${p.s==='done'?'win':''}" onclick="openDw('${a.id}',${i})" style="width:100%">
       <div class="im" style="${p.img?`background-image:url('${p.img}');background-size:cover;background-position:center`:grad(p.g[0],p.g[1])}"></div>
       <div class="bd"><div class="ot">${esc(p.t)}</div><div class="oe">${esc(p.e)}</div>
         <div class="of"><span class="st ${p.s}">${p.s==='done'?'已批准':'待审批'}</span>
           ${subCount(p)?`<span class="chip mut">评论 ${subCount(p)}</span>`:''}</div></div>
     </button>
     </div>`).join('')}</div></div>
   ${a.id==='a2-label-copy'?`<div class="pk-a">${a.socialReturning?`<div class="listing-reject-inline"><input id="social-return-${a.id}" type="text" aria-label="退回原因" placeholder="填写退回原因" value="${esc(a.socialReturnDraft||'')}" oninput="setSocialReturnDraft('${a.id}',this.value)"><button class="btn sm" onclick="confirmSocialReturn('${a.id}')">确认</button><button class="btn ghost sm" onclick="cancelSocialReturn('${a.id}')">取消</button></div>`:`${a.plans.some(p=>p.s==='review')?`<button class="btn sm" onclick="openSocialApproval('${a.id}')">批准</button><button class="btn ghost sm" onclick="startSocialReturn('${a.id}')">退回</button>`:''}<span class="v">v${a.v} · 2小时前</span>`}</div>`:`<div class="vals">${a.vals.map(v=>`<span class="val ${v.s}">${v.s==='ok'?'✓':v.s==='warn'?'!':'✕'} ${v.l} <span class="m">${v.v}</span></span>`).join('')}</div>
    <div class="pk-a"${a.hideMeta?' style="display:none"':''}><button class="btn ghost sm" onclick="openDw('${a.id}')">编辑 ↗</button>
     ${a.id==='a4-direction'||subCount(a)?`<button class="rvb" onclick="openReview('${a.id}')">评论 ${subCount(a)?`<span class="n">${subCount(a)}</span>`:''}</button>`:''}
     <span class="v">v${a.v} · 2小时前</span></div>`}
    ${a.nxt&&(a.id!=='a2-label-copy'||a.plans.every(p=>p.s==='done'))?`<div class="nxt"><span class="lb">接下来</span>${a.nxt.map(n=>n==='下载活动策划'
      ?`<span class="plan-download"><button class="na" onclick="event.stopPropagation();S.planDownloadOpen=!S.planDownloadOpen;render()">${n} →</button>${S.planDownloadOpen?`<span class="plan-download-menu"><button onclick="downloadActivityPlan('HTML')">HTML 格式</button><button onclick="downloadActivityPlan('Word')">Word 格式</button></span>`:''}</span>`
      :n==='同步到活动'&&a.id==='a2-label-copy'?`<button class="na" onclick="openCampaignSync('${a.id}')">${n} →</button>`
      :`<button class="na" onclick="toast('已在同一线程中新增步骤：${n}')">${n} →</button>`).join('')}${a.id==='a2-label-copy'?campaignSyncLinks(a.id):''}</div>`:''}
   </div>`;
 }
 if(a.mode==='pdpseq'){
  const m1=a.m1;
  return `<div class="pk" id="pk-${a.id}">
   <div class="pk-h"><span class="ty">产出 · ${a.ty}</span><span class="chip plat">${a.plat}</span>
    <span class="st ${m1?m1StatusClass(a):a.st}">${m1?m1Status(a):STN[a.st]}</span>${m1&&a.m1.stage==='owner'?'<span class="m1-owner-pill">待负责人 Brooks 审批</span>':''}${artifactRunLink(a.by)}</div>
   <div style="padding:var(--sp-3)"><div class="pdp-card-grid">
    <button class="opt pdp-product-card" onclick="openDw('${a.id}')" style="width:100%">
     <div class="im" style="${a.img?`background-image:url('${a.img}');background-size:cover;background-position:center`:grad(a.g[0],a.g[1])}"></div>
     <div class="bd"><div class="ot">${esc(a.ttl)}</div><div class="oe">${esc(a.ex)}</div>
      <div class="of"><span class="st ${m1?m1StatusClass(a):a.st}">${m1?m1Status(a):(a.st==='done'?'已批准':'待审批')}</span>
       ${subCount(a)?`<span class="chip mut">评论 ${subCount(a)}</span>`:''}</div></div>
    </button>
   </div></div>
    ${a.id!=='a4-direction'&&a.vals?.length?`<div class="vals">${a.vals.map(v=>`<span class="val ${v.s}">${v.s==='ok'?'✓':v.s==='warn'?'!':'✕'} ${v.l} <span class="m">${v.v}</span></span>`).join('')}</div>`:''}
   <div class="pk-a">
    ${m1?m1InlineActions(a):a.st==='review'?`<button class="btn sm" onclick="act('${a.id}','批准')">批准</button>`:''}
     ${m1?'':a.id==='a4-direction'?`<button class="btn ghost sm" onclick="openDw('${a.id}');dtab(1)">查看规划表</button>
     <button class="btn ghost sm" onclick="openDw('${a.id}')">查看图片</button>`:`<button class="btn ghost sm" onclick="openDw('${a.id}')">查看规划表</button>
     <button class="btn ghost sm" onclick="openDw('${a.id}');dtab(1)">查看图片</button>`}
    ${subCount(a)?`<button class="rvb" onclick="openReview('${a.id}')">评论 <span class="n">${subCount(a)}</span></button>`:''}
    <span class="v">v${a.v} · ${a.st==='run'?'渲染中':'2小时前'}</span></div>
   ${a.nxt&&a.st==='done'?`<div class="nxt"><span class="lb">接下来</span>
    ${a.nxt.map(n=>`<button class="na" onclick="toast('${n==='同步到活动'?'已同步到活动':'已在同一线程中新增步骤：'+n}')">${n} →</button>`).join('')}</div>`:''}
  </div>`;
 }
 if(a.mode==='options'){
  const allOptionsDone=a.opts.every(o=>o.s==='done'||o.s==='archived');
  return `<div class="pk ${a.seoFlow?'seo-flow':''}">
   <div class="pk-h"><span class="ty">产出 · ${a.id==='a1'?'活动策划':a.ty}</span>${a.plat?`<span class="chip plat">${a.plat}</span>`:''}
     ${a.hideChoice||a.independent||(a.id==='a4-direction'&&a.flowStage!=='direction-review')?'':'<span class="chip mut">3 选 1</span>'}${artifactRunLink(a.by)}</div>
    <div style="padding:var(--sp-3)"><div class="opts">${a.opts.map((o,i)=>`
     <div class="optwrap"><button class="opt ${o.s==='done'?'win':''}" onclick="openDw('${a.id}',${i})" style="width:100%">
       <div class="im" style="${o.imagesGenerated?`background-image:url('${directionGeneratedCover(i)}');background-size:cover;background-position:center`:`${grad(o.g[0],o.g[1])}`}"></div>
      <div class="bd"><div class="ot">${esc(o.t).replace(/\n/g,'<br>')}</div><div class="oe">${esc(o.e)}</div>
          <div class="of"><span class="st ${a.id==='a4-direction'&&a.flowStage==='plan-generating'?'run':o.s}">${a.id==='a4-direction'&&a.flowStage==='plan-generating'?'规划表生成中':a.id==='a4-direction'&&a.flowStage==='plan-review'?'规划表待审批':o.s==='done'?'已批准':o.s==='archived'?(a.seoFlow?'未采用':'已归档'):'待审批'}</span>
           ${subCount(o)?`<span class="chip mut">评论 ${subCount(o)}</span>`:''}</div></div>
     </button>
    ${a.id==='a1'||a.id==='a4-direction'||a.seoFlow?'':a.hideChoice||a.independent?`<div class="optact"><span style="font-size:var(--fs-xs);color:var(--t3);padding:var(--sp-1) 0">打开编辑 ↗</span></div>`:o.s==='review'?`<div class="optact">
       <button class="btn sm" onclick="event.stopPropagation();optAct('${a.id}',${i},1)">选这个</button>
       <button class="btn ghost sm" onclick="event.stopPropagation();optAct('${a.id}',${i},0)">淘汰</button></div>`
      :`<div class="optact"><span style="font-size:var(--fs-xs);color:var(--t3);padding:var(--sp-1) 0">${o.s==='done'?'✓ 已选为交付':'已归档'}</span></div>`}
     </div>`).join('')}</div></div>
     <div class="pk-a">${a.id==='a1'||a.id==='a4-direction'
      ?a.drawerReturning
       ?drawerReturnEditor(a)
        :allOptionsDone?`<span class="st done">已批准</span><span class="v num">v${a.v} · 刚刚</span>`
        :a.id==='a4-direction'&&a.flowStage==='plan-generating'?`<span class="v num">v${a.v} · 刚刚</span>`
         :a.id==='a4-direction'&&a.flowStage==='plan-review'?`<button class="btn sm" onclick="openDw('${a.id}',0)">批准</button><button class="btn ghost sm" onclick="openDw('${a.id}',0)">查看规划表</button>${drawerReturnButton(a)}<button class="rvb" onclick="openDirectionComments('${a.id}')">评论 ${subCount(a.opts[0])?`<span class="n">${subCount(a.opts[0])}</span>`:''}</button><span class="v num">v${a.v} · 刚刚</span>`
        :`<button class="btn sm" onclick="openDirectionApproval('${a.id}')">批准</button>${drawerReturnButton(a)}<span class="v num">v${a.v} · 2小时前</span>`
      :a.seoFlow&&allOptionsDone?`<span class="v num">v${a.v} · 2小时前</span>`
      :a.seoFlow&&a.drawerReturning?drawerReturnEditor(a)
      :`<button class="btn ghost sm" onclick="${a.seoFlow?`startDrawerReturn('${a.id}')`:a.returnLabel==='退回'?`openArtifactReturn('${a.id}')`:`toast('已让 '+nick('${a.by}')+' 换一批方向')`}">${a.seoFlow?'退回':a.returnLabel||'换一批'}</button>
       ${a.hideChoice||a.independent||a.seoFlow?'':`<button class="rvb" onclick="openDw('${a.id}');setTimeout(()=>toggleOpt(1),40)">逐条评论 <span class="n">${a.opts.reduce((n,o)=>n+subCount(o),0)}</span></button>`}
       ${a.id==='a4-direction'||a.seoFlow?'':`<span style="font-size:var(--fs-sm);color:var(--t2)">${a.hideChoice||a.independent?'已批准 '+a.opts.filter(o=>o.s==='done').length+' / '+a.opts.length:a.sum||'已批准方向二 · 其余两个待处理'}</span>`}
       <span class="v num">v${a.v} · 2小时前</span>`}</div>
     ${a.nxt&&allOptionsDone?`<div class="nxt"><span class="lb">接下来</span>${a.nxt.map(n=>`<button class="na" onclick="toast('${n==='同步到活动'?'已同步到活动':'已在同一线程中新增步骤：'+n}')">${n} →</button>`).join('')}</div>`:''}
     ${a.returnReason?`<div style="padding:var(--sp-3) 14px;border-top:1px solid var(--border);font-size:var(--fs-sm);color:var(--t2);line-height:1.7;white-space:pre-wrap;overflow-wrap:anywhere"><b style="color:var(--t1)">已退回 · 退回原因：</b>${esc(a.returnReason)}</div>`:''}</div>`;
 }
 if(a.mode==='seq'){
  return `<div class="pk" id="pk-${a.id}">
   <div class="pk-h"><span class="ty">产出 · ${a.ty}</span>${a.plat?`<span class="chip plat">${a.plat}</span>`:''}
    ${artifactRunLink(a.by)}</div>
   <div style="padding:var(--sp-3)"><div class="seo-artifact-grid">
    <button class="opt ${a.st==='done'?'win':''}" onclick="openDw('${a.id}')">
     <div class="im" style="${a.img?`background-image:url('${a.img}');background-size:cover;background-position:center`:grad(a.g[0],a.g[1])}"></div>
     <div class="bd"><div class="ot">${esc(a.ttl)}</div><div class="oe">${esc(a.ex)}</div>
      <div class="of"><span class="st ${a.st}">${STN[a.st]}</span>
       ${subCount(a)?`<span class="chip mut">评论 ${subCount(a)}</span>`:''}</div></div>
    </button>
   </div></div>
   ${a.vals?.length?`<div class="vals">${a.vals.map(v=>`<span class="val ${v.s}">${v.s==='ok'?'✓':v.s==='warn'?'!':'×'} ${v.l} <span class="m">${v.v}</span></span>`).join('')}</div>`:''}
   <div class="pk-a">${a.drawerReturning
    ?drawerReturnEditor(a)
    :`${a.st==='review'?`<button class="btn sm" onclick="act('${a.id}','批准')">批准</button>${drawerReturnButton(a)}`:''}
    ${subCount(a)?`<button class="rvb" onclick="openDw('${a.id}');setTimeout(()=>toggleSeoComment(),40)">评论 <span class="n">${subCount(a)}</span></button>`:''}
    <span class="v">v${a.v} · 2小时前</span>`}</div>
   ${a.nxt&&a.st==='done'?`<div class="nxt"><span class="lb">接下来</span>
    ${a.nxt.map(n=>`<button class="na" onclick="toast('${n==='发布'?'已发布':'已在同一线程中新增步骤：'+n}')">${n} →</button>`).join('')}</div>`:''}
  </div>`;
 }
 const pvc=a.pv==='wd'?'wd':a.pv==='doc'?'doc':'sq';
 return `<div class="pk" id="pk-${a.id}">
  <div class="pk-h"><span class="ty">产出 · ${a.ty}</span>${a.plat?`<span class="chip plat">${a.plat}</span>`:''}
    <span class="st ${a.m1?m1StatusClass(a):a.inspection?.result||a.sentiment?.result?'hold':a.st}">${a.m1?m1Status(a):a.inspection?.result||a.sentiment?.result||STN[a.st]}</span>${a.m1?.stage==='owner'?'<span class="m1-owner-pill">待负责人 Brooks 审批</span>':''}${artifactRunLink(a.by)}</div>
  <div class="pk-b" onclick="openDw('${a.id}')">
    ${a.sentiment?sentimentSummary(a,true):a.inspection?inspectionSummary(a):`${a.pv!=='none'?`<div class="pv ${pvc}" style="${grad(a.g[0],a.g[1])}">
      ${a.dur?`<div class="play"><i>▶</i></div><div class="dur num">${a.dur}</div>`:''}
      ${a.pv==='doc'?`<div class="pv-ph"><span>${esc(a.ttl.slice(0,14))}</span></div>`:''}
    </div>`:''}
    <div class="pk-t"><div class="tt">${esc(a.ttl)}</div>
      <div class="ex">${esc(a.body?a.body.split('\n')[0]:a.ex)}</div>
      ${a.tpl?`<div style="margin-top:var(--sp-2)"><span class="chip mut">模板 · ${a.tpl}</span></div>`:''}</div>`}
  </div>
  ${a.inspection||a.sentiment?'':`<div class="vals">${a.vals.map(v=>`<span class="val ${v.s}">
    ${v.s==='ok'?'✓':v.s==='warn'?'!':'✕'} ${v.l} <span class="m">${v.v}</span></span>`).join('')}</div>`}
  <div class="pk-a ${a.sentiment?'sentiment-card-actions':''}">
    ${a.m1?m1InlineActions(a):a.sentiment?sentimentActions(a,false):a.inspection?inspectionActions(a,false):`${a.st==='review'?`<button class="btn sm" onclick="act('${a.id}','批准')">批准</button>
      ${a.mode==='pdpseq'?'':`<button class="btn ghost sm" onclick="act('${a.id}','退回')">退回</button>`}`:''}
    ${a.mode==='pdpseq'?`<button class="btn ghost sm" onclick="openDw('${a.id}')">查看规划表</button><button class="btn ghost sm" onclick="openDw('${a.id}');dtab(1)">查看图片</button>`:`<button class="btn ghost sm" onclick="openDw('${a.id}')">编辑 ↗</button>`}
    ${subCount(a)?`<button class="rvb" onclick="openReview('${a.id}')">评论 <span class="n">${subCount(a)}</span></button>`:''}`}
    <span class="v">v${a.v}${a.sentiment?' · 4天前':' · '+(a.st==='run'?'渲染中':'2小时前')}</span></div>
  ${a.nxt&&a.st==='done'&&(a.inspection||a.sentiment)?`<div class="nxt"><span class="lb">接下来</span>
    ${a.nxt.map(n=>`<button class="na" onclick="inspectionNextAction('${a.id}','${n}')">${n} →</button>`).join('')}</div>`:''}
  ${a.nxt&&a.st==='done'&&!a.inspection&&!a.sentiment?`<div class="nxt"><span class="lb">接下来</span>
    ${a.nxt.map(n=>n==='存进知识库'||n==='存为模板'
      ?`<button class="na" onclick="saveTpl('${a.id}')">${n} →</button>`
      :`<button class="na" onclick="toast('已在同一线程中新增步骤：${n}')">${n} →</button>`).join('')}</div>`:''}
 </div>`;
}
function downloadActivityPlan(format){S.planDownloadOpen=false;if($('dw')?.classList.contains('on'))drawDw();else render();toast('已开始下载 '+format+' 格式活动策划');}
function downloadMonthlyReport(format){S.planDownloadOpen=false;render();toast('已开始下载 '+format+' 格式月度报告');}
document.addEventListener('click',e=>{
 if(!S.planDownloadOpen||e.target.closest('.plan-download'))return;
 S.planDownloadOpen=false;if($('dw')?.classList.contains('on'))drawDw();else render();
});
function optAct(aid,i,ok){
 const t=T.find(x=>x.id===S.tid),a=t.arts.find(x=>x.id===aid);
 if(a.seoFlow&&ok){
  a.opts.forEach((o,j)=>o.s=j===i?'done':'archived');a.st='done';a.selected=i;
  a.pendingDirection={t:a.opts[i].t,e:a.opts[i].e,questions:[...(a.opts[i].questions||[])],angles:[...(a.opts[i].angles||[])]};
  if(t.plan?.steps){t.plan.steps[1]={l:'生成内容方向',m:'已生成 3 个方向',s:'ok',r:'刚刚'};t.plan.steps[2]={l:'选择一个方向',m:'已批准方向'+['一','二','三'][i],s:'ok',r:'刚刚'};}
  t.live=null;t.st='review';t.up='刚刚';closeDw();finishSeoFlowArticle(t.id,a.id,i);return;
 }
 if(a.hideChoice&&ok)a.opts.forEach((o,j)=>o.s=j===i?'done':'review');
 else{
  a.opts[i].s=ok?'done':'archived';
  if(ok)a.opts.forEach((o,j)=>{if(j!==i&&o.s==='review')o.s='archived';});
 }
 const still=t.arts.some(x=>x.mode==='options'?x.opts.some(o=>o.s==='review'):x.st==='review');
 t.st=still?'review':'done';
 render();toast(a.hideChoice&&ok?'已切换详情图创意方向':ok?'已选为交付 · 其余归档':'已归档该方向');
}
function approvePlan(aid,i){
 const t=T.find(x=>x.id===S.tid),a=t.arts.find(x=>x.id===aid),p=a.plans[i];
 p.s='done';
 if(a.demoSocial){
  const complete=a.plans.every(x=>x.s==='done');a.st=complete?'done':'review';t.st=complete?'done':'review';t.up='刚刚';
  if(t.plan?.steps?.[3])t.plan.steps[3]={l:'逐篇审批并交付',m:complete?'3 篇全部批准':'已批准 '+a.plans.filter(x=>x.s==='done').length+' / '+a.plans.length,s:complete?'ok':'act',r:complete?'已交付':'待审批'};
  render();drawDw();toast(complete?'3 篇全部批准 · 任务已交付':'已批准这篇内容');return;
 }
 a.st='done';t.st='done';render();drawDw();toast('已批准该方案 · 已进入执行');
}
function openSocialApproval(aid){
 const [,a]=findArt(aid);if(!a?.plans?.length)return;
 const pending=a.plans.findIndex(p=>p.s==='review');
 openDw(aid,pending<0?0:pending);
}
function openDirectionApproval(aid){
 const [,a]=findArt(aid);if(!a?.opts?.length)return;
 const pending=a.opts.findIndex(o=>o.s==='review');
 openDw(aid,pending<0?0:pending);
}
function openDirectionComments(aid){
 openDw(aid,0);S.pc=true;drawDw();scrollDrawerToBottom();
}
function startSocialReturn(id){
 const [,a]=findArt(id);if(!a)return;
 a.socialReturning=true;a.socialReturnDraft='';render();
 setTimeout(()=>$('social-return-'+id)?.focus(),0);
}
function setSocialReturnDraft(id,value){const [,a]=findArt(id);if(a)a.socialReturnDraft=value;}
function cancelSocialReturn(id){
 const [,a]=findArt(id);if(!a)return;
 a.socialReturning=false;a.socialReturnDraft='';render();
}
function confirmSocialReturn(id){
 const [t,a]=findArt(id);if(!t||!a)return;
 const reason=(a.socialReturnDraft||'').trim();if(!reason){toast('请填写退回原因');$('social-return-'+id)?.focus();return;}
 const message={w:'du',k:'chg',tx:'退回原因：'+reason,at:'刚刚'};
 a.returnReason=reason;(a.sub=a.sub||[]).push({...message});
 a.socialReturning=false;a.socialReturnDraft='';a.st='run';t.st='run';t.up='刚刚';
 render();renderNav();toast('已退回，修改原因已记录');
}
function stepPlan(d){
 const [,a]=findArt(S.aid);if(!a?.plans?.length)return;
 const current=S.oi===null||S.oi===undefined?0:S.oi,n=current+d;
 if(n<0||n>=a.plans.length)return;
 S.oi=n;S.dtab=0;S.pc=false;drawDw();
}
function togglePlanDrawerComment(){
 const opening=!S.pc;S.pc=!S.pc;drawDw();
 if(opening)scrollDrawerToBottom();
}
function togglePromotionComment(){
 const opening=!S.pc;S.pc=opening;drawDw();
 if(opening)scrollDrawerToBottom();
}
function openPromotionComments(id){
 openDw(id);S.dtab=0;S.pc=true;drawDw();scrollDrawerToBottom();
}
function openReportComments(id){
 openDw(id);S.pc=true;drawDw();scrollDrawerToBottom();
}
function toggleReportComment(){
 const opening=!S.pc;S.pc=opening;drawDw();
 if(opening)scrollDrawerToBottom();
}
function toggleSeoComment(){
 const opening=!S.pc;S.pc=opening;drawDw();
 if(opening)scrollDrawerToBottom();
}
function openManualComments(id){openDw(id);S.pc=true;drawDw();scrollDrawerToBottom();}
function toggleManualComment(){const opening=!S.pc;S.pc=opening;drawDw();if(opening)scrollDrawerToBottom();}
function completeManualTask(id){
 const [t,a]=findArt(id);if(!t||!a||!a.manual)return;const m=a.manual;
 if(m.reviewResult==='退回'){
  (m.reviewHistory=m.reviewHistory||[]).push({reviewResult:m.reviewResult,reviewAt:m.reviewAt,reviewScore:m.reviewScore,reviewFeedback:m.reviewFeedback});
 }
 m.submitted=true;m.reviewed=false;m.reviewResult='';m.reviewAt='';m.reviewDecision='';m.reviewScore=null;m.reviewFeedback='';a.st='review';t.st='review';t.up='刚刚';
 render();if($('dw').classList.contains('on'))drawDw();toast('已提交主管审核');
}
function setManualReviewDecision(id,value){const [,a]=findArt(id);if(!a?.manual)return;a.manual.reviewDecision=value;render();}
function setManualReviewScore(id,value){const [,a]=findArt(id);if(!a?.manual)return;a.manual.reviewScore=value;render();}
function setManualReviewFeedback(id,value){const [,a]=findArt(id);if(a?.manual)a.manual.reviewFeedback=value;}
function submitManualReview(id){
 const [t,a]=findArt(id);if(!t||!a?.manual)return;const m=a.manual;
 if(!m.reviewDecision){toast('请先选择通过或退回');return;}
 const box=$('manual-review-feedback-'+id);if(box)m.reviewFeedback=box.value.trim();
 if(m.reviewDecision==='pass'){
  m.reviewed=true;m.reviewResult='通过';m.reviewAt='刚刚';a.st='done';t.st='done';t.up='刚刚';
  (m.records=m.records||[]).push({who:'dudu',at:'刚刚',tx:'主管审核通过'+(m.reviewScore?' · 评分 '+m.reviewScore:'')});
  toast('主管审核通过 · 任务已完成');
 }else{
  if(!m.reviewFeedback){toast('退回时请填写评价');return;}
  const feedback=m.reviewFeedback;m.submitted=false;m.reviewed=false;m.reviewResult='退回';m.reviewAt='刚刚';m.reviewDecision='';
  a.st='run';a.v=(a.v||1)+1;t.st='run';t.up='刚刚';a.ex=`${manualPeopleLabel(manualArtifactPeople(m))} 正在根据主管审核意见修改人工产出。`;
  (m.records=m.records||[]).push({who:'dudu',at:'刚刚',tx:'主管退回：'+feedback});
  toast('已退回处理人修改');
 }
 render();if($('dw').classList.contains('on'))drawDw();
}
function explainInspectionInChat(id){
 const [t,a]=findArt(id);if(!a?.inspection)return;
 const draft=S.aid===id&&$('si')?$('si').value:'';
 if(S.view!=='thread'||S.tid!==t.id)go('thread',t.id);
 openDw(id);S.pc=true;drawDw();
 if($('si'))$('si').value=draft;
 if(a.inspection.explaining){scrollDrawerToBottom();return;}
 (a.sub=a.sub||[]).push({w:'du',tx:'请解释「'+a.ttl+'」为何被标记，以及接下来应该关注什么。',at:'刚刚'});
 a.inspection.explaining=true;
 refreshInspectionComments(id);syncInspectionConversation(t);
 setTimeout(()=>{
  const d=a.inspection;
  const metric=d.metric||'GMV';
  const answer=`【模拟解释】\n这条异常基于 ${d.date} 的${metric}：实际 ${d.actual}，低于预期范围 ${d.expected} 的下限。\n\n为何标记：${a.ex}\n\n预期依据：${d.basis}\n\n当前数据能说明销售规模低于近期水平，但不能单凭${metric}判断具体原因。${d.explanationHint||'建议继续核对流量、转化率、客单价及当日活动变化。'}确认是正常波动可忽略；若核实数据或判断规则有误，可标记为误报。`;
  a.sub.push({w:a.by,k:'ag',tx:answer,at:'刚刚'});
  d.explaining=false;
  refreshInspectionComments(id);syncInspectionConversation(t);
 },1400);
}
function refreshInspectionComments(id){
 const [,a]=findArt(id);if(!a)return;
 const badge=$('pk-'+id)?.querySelector('.pk-a .rvb .n');
 if(badge)badge.textContent=subCount(a);
 if(!$('dw').classList.contains('on')||S.aid!==id||!S.pc||!$('si'))return;
 const draft=$('si').value;
 drawDw();if($('si'))$('si').value=draft;
 const list=$('sl');if(list)list.scrollTop=list.scrollHeight;
 scrollDrawerToBottom();
}
function syncInspectionConversation(t){
 if(S.view!=='thread'||S.tid!==t.id)return;
 const list=$('cl');if(!list)return;
 list.innerHTML=convList(t);
 const count=list.closest('.card')?.querySelector('.card-t .chip');
 if(count)count.textContent=(t.cmts||[]).length;
}
function openArtifactReturn(id){
 const [,a]=findArt(id);if(!a)return;
 $('mod').innerHTML=`<div class="mbox" style="max-width:560px">
  <div class="mhd"><div class="e">退回产出</div><h3>${esc(a.ttl)}</h3></div>
  <form onsubmit="event.preventDefault();confirmArtifactReturn('${id}')">
   <div class="mbd"><div class="fld" style="margin-bottom:0">
    <label for="artifact-return-reason">退回原因 <span style="color:var(--red)">*</span></label>
    <textarea id="artifact-return-reason" rows="5" required maxlength="2000" placeholder="请说明需要调整的地方，例如：方向与品牌定位不符，需要补充真实使用场景。" oninput="$('artifact-return-submit').disabled=!this.value.trim()"></textarea>
    <div style="font-size:var(--fs-xs);color:var(--t3);margin-top:var(--sp-2)">原因会记录在当前产出中，不会新建任务或修改其他产出。</div>
   </div></div>
   <div class="mft"><button id="artifact-return-submit" type="submit" class="btn" disabled>确认退回</button><button type="button" class="btn ghost" onclick="closeMod()">取消</button></div>
  </form></div>`;
 $('mod').classList.add('on');$('artifact-return-reason').focus();
}
function confirmArtifactReturn(id){
 const input=$('artifact-return-reason'),reason=input?.value.trim();
 if(!reason){toast('请填写退回原因');input?.focus();return;}
 const [t,a]=findArt(id);if(!a)return;
 const message={w:'du',k:'chg',tx:'退回原因：'+reason,at:'刚刚'};
 a.returnReason=reason;(a.sub=a.sub||[]).push({...message});
 // Keep approved directions and other artifacts unchanged; attach feedback to pending directions.
 if(a.opts)a.opts.filter(o=>o.s!=='done').forEach(o=>(o.sub=o.sub||[]).push({...message}));
 a.st='run';t.st='run';t.up='刚刚';
 closeMod();render();renderNav();
 if(S.aid===id&&$('dw').classList.contains('on'))drawDw();
 toast('已退回，修改原因已记录');
}
function act(id,w){
 const t=T.find(x=>x.id===S.tid),a=t.arts.find(x=>x.id===id);
 if(a.mode==='promoseq'&&w==='批准'){approvePromotion(id);return;}
 if(w==='退回'&&(a.returnLabel==='退回'||a.mode==='pdpseq'||a.id==='a2')){openArtifactReturn(id);return;}
 if(a.inspection&&(w==='忽略'||w==='标记为误报')){
  a.inspection.result=w==='忽略'?'已忽略':'已标记为误报';
  a.st='done';t.st=t.arts.every(x=>x.st==='done')?'done':t.st;
  render();toast(a.inspection.result);return;
 }
 if(w==='批准'){a.st='done';t.st='done';toast(a.inspection?'已标记为已解决':'已批准 · 线程收口');}
 else{a.st='run';t.st='run';a.v++;toast('已退回 · 已在同一线程中生成新一轮');}
 render();
}
function addC(){
 const i=$('ci');if(!i.value.trim())return;
 const tx=i.value.trim(),t=T.find(x=>x.id===S.tid);
 (t.cmts=t.cmts||[]).push({w:'du',tx,at:'刚刚'});
 const hit=REG.find(a=>a.b==='live'&&ONLINE[a.id]&&tx.includes('@'+a.nick));
 if(hit&&!t.prestartDemo){dispatchFrom(hit.id,tx);return;}
 render();toast('已发送');
}
function dispatchFrom(agid,tx){
 const t=T.find(x=>x.id===S.tid),a=REG.find(x=>x.id===agid);
 if(blockPrestartDispatch(t))return;
 t.plan=t.plan||{v:1,tx:'直接指派。',steps:[]};
 t.plan.v=(t.plan.v||1)+1;
 t.plan.adj='dudu 在评论里直接 @了 '+a.nick+'（未走编排）';
 t.plan.steps.splice(Math.max(0,t.plan.steps.length-1),0,{l:a.nick+' · 被直接 @ 派活',m:tx.replace('@'+a.nick,'').trim().slice(0,26),s:'act',r:'刚开始'});
 t.cmts.push({w:agid,tx:'收到，我接了。这条会作为新一步跑在这条线程里，跑完回到待审批。',at:'刚刚'});
 t.st='run';render();toast(a.nick+' 接了活 · 已加进这条线程');
}
function afterThread(){
 if(S.liveT){clearInterval(S.liveT);S.liveT=null;}
 const t=T.find(x=>x.id===S.tid);if(!t||!t.live)return;
 let p=t.live.p,i=0;
 S.liveT=setInterval(()=>{
  p=p>=97?62:p+1;t.live.p=p;
  const lp=$('lp'),lpc=$('lpc'),lt=$('lt');if(!lp){clearInterval(S.liveT);return;}
  lp.style.width=p+'%';if(lpc)lpc.textContent=p+'%';
  if(p%12===0){i=(i+1)%t.live.sub.length;lt.textContent=t.live.sub[i];}
 },900);
}

/* ============ drawer ============ */
function pptPageIsOpen(a,i){return a.pptOpenPages?!!a.pptOpenPages[i]:false;}
function togglePptPage(id,i){const [,a]=findArt(id);if(!a)return;a.pptOpenPages=a.pptOpenPages||{};a.pptOpenPages[i]=!pptPageIsOpen(a,i);drawDw();}
function pptCoverIsOpen(a){return !!a.pptCoverOpen;}
function togglePptCover(id){const [,a]=findArt(id);if(!a)return;a.pptCoverOpen=!pptCoverIsOpen(a);drawDw();}
function setAllPptPages(id,open){const [,a]=findArt(id);if(!a)return;a.pptCoverOpen=open;a.pptOpenPages={};a.pages.forEach((_,i)=>a.pptOpenPages[i]=open);drawDw();}
function updatePptOutlineField(id,key,value){const [,a]=findArt(id);if(a)a[key]=value;}
function updatePptPageField(id,i,key,value){const [,a]=findArt(id);if(a?.pages?.[i])a.pages[i][key]=value;}
function movePptPage(id,i,delta){const [,a]=findArt(id),j=i+delta;if(!a||j<0||j>=a.pages.length)return;[a.pages[i],a.pages[j]]=[a.pages[j],a.pages[i]];a.pptOpenPages={};a.pptOpenPages[j]=true;drawDw();}
function deletePptPage(id,i){const [,a]=findArt(id);if(!a)return;if(a.pages.length<=1){toast('至少保留一页');return;}a.pages.splice(i,1);a.pptOpenPages={0:true};drawDw();toast('已删除这一页');}
function addPptPage(id){const [,a]=findArt(id);if(!a)return;a.pages.push({title:'新增页面',chapter:'',points:'填写本页需要表达的内容要点',visual:''});const i=a.pages.length-1;a.pptOpenPages={};a.pptOpenPages[i]=true;drawDw();requestAnimationFrame(()=>requestAnimationFrame(()=>document.getElementById(`ppt-page-${id}-${i}`)?.scrollIntoView({block:'center',behavior:'smooth'})));}
function dPptOutline(a){
 const coverOpen=pptCoverIsOpen(a);
 return `<div class="ppt-outline-editor">
  <div class="ppt-outline-toolbar"><span>共 ${a.pages.length+1} 页</span><span class="spacer"></span><button class="btn ghost sm" onclick="setAllPptPages('${a.id}',true)">全部展开</button><button class="btn ghost sm" onclick="setAllPptPages('${a.id}',false)">全部收起</button></div>
  <div class="ppt-outline-pages"><section class="pdp-screen-card ppt-cover-card ${coverOpen?'open':''}">
   <button class="pdp-screen-head" onclick="togglePptCover('${a.id}')" aria-expanded="${coverOpen}"><span class="screen">第1页</span><span class="module">PPT 标题与摘要</span><span class="chip mut">封面</span><span class="chevron"><i data-lucide="chevron-${coverOpen?'up':'down'}"></i></span></button>
   ${coverOpen?`<div class="pdp-screen-body ppt-cover-form">
    <div class="fld"><label>PPT 总标题</label><input value="${esc(a.deckTitle)}" oninput="updatePptOutlineField('${a.id}','deckTitle',this.value)"></div>
    <div class="fld"><label>一句话摘要 <span class="ct">可选</span></label><textarea rows="4" oninput="updatePptOutlineField('${a.id}','summary',this.value)">${esc(a.summary)}</textarea></div>
   </div>`:''}</section>${a.pages.map((p,i)=>{const open=pptPageIsOpen(a,i);return `<section id="ppt-page-${a.id}-${i}" class="pdp-screen-card ${open?'open':''}">
   <button class="pdp-screen-head" onclick="togglePptPage('${a.id}',${i})" aria-expanded="${open}"><span class="screen">第${i+2}页</span><span class="module">${esc(p.title)}</span><span class="chip mut">${esc(p.chapter||'未分组')}</span><span class="chevron"><i data-lucide="chevron-${open?'up':'down'}"></i></span></button>
   ${open?`<div class="pdp-screen-body ppt-page-form"><div class="ppt-page-actions"><button class="btn ghost sm" onclick="event.stopPropagation();movePptPage('${a.id}',${i},-1)" ${i===0?'disabled':''}>上移</button><button class="btn ghost sm" onclick="event.stopPropagation();movePptPage('${a.id}',${i},1)" ${i===a.pages.length-1?'disabled':''}>下移</button><button class="ppt-page-delete" onclick="event.stopPropagation();deletePptPage('${a.id}',${i})">删除</button></div>
    <div class="ppt-page-grid"><label class="product-field"><span>页面标题</span><input value="${esc(p.title)}" oninput="updatePptPageField('${a.id}',${i},'title',this.value)"></label><label class="product-field"><span>所属章节 <small>（可选）</small></span><input value="${esc(p.chapter)}" oninput="updatePptPageField('${a.id}',${i},'chapter',this.value)"></label></div>
    <label class="product-field"><span>内容要点 <small>（每行一条）</small></span><textarea rows="5" oninput="updatePptPageField('${a.id}',${i},'points',this.value)">${esc(p.points)}</textarea></label>
    <label class="product-field ppt-visual-field"><span>配图意向 <small>（可选）</small></span><textarea rows="1" oninput="updatePptPageField('${a.id}',${i},'visual',this.value)">${esc(p.visual)}</textarea></label>
   </div>`:''}</section>`;}).join('')}</div>
  ${S.pc?`<div style="margin-top:var(--sp-4)">${subPane(a)}</div>`:''}
 </div>`;
}
function dPptDirection(a){
 return `<div class="fld"><label>创意方向</label><input value="${esc(a.ttl)}" oninput="updatePptOutlineField('${a.id}','ttl',this.value)"></div>
  <div class="fld"><label>方向说明</label><textarea rows="12" oninput="updatePptOutlineField('${a.id}','ex',this.value)">${esc(a.ex)}</textarea></div>
  <div class="note">这一方向是本次唯一方案。确认后，PPT Agent 将严格按照当前大纲生成演示文稿。</div>${S.pc?`<div style="margin-top:var(--sp-4)">${subPane(a)}</div>`:''}`;
}
function togglePptComment(){const opening=!S.pc;S.pc=opening;drawDw();if(opening)scrollDrawerToBottom();}
function confirmPptOutline(id){
 const [t,a]=findArt(id);if(!t||!a||a.outlineConfirmed)return;
 a.outlineConfirmed=true;a.st='done';a.drawerReturning=false;t.st='run';t.up='刚刚';
 t.pptLive={t:'PPT 生成正在制作演示文稿',sub:'正在根据已批准大纲生成页面内容与版式',p:43};
 if($('dw')?.classList.contains('on')&&S.aid===id)closeDw();
 render();renderNav();toast('大纲已批准 · PPT 正在生成');
 setTimeout(()=>{
  let file=t.arts.find(x=>x.mode==='pptfile');
  if(!file){file={id:'a-ppt-file-demo',mode:'pptfile',ty:'PPT 文件',ttl:a.deckTitle,ex:'PPT 已生成完成',by:'ppt',v:1,st:'review',pv:'none',g:['#A78BFA','#7C3AED'],vals:[],pageCount:a.pages.length+1,credits:99,createdAt:'刚刚',sub:[]};t.arts.push(file);}
  delete t.pptLive;t.outputCount=t.arts.length;t.st='review';t.up='刚刚';render();renderNav();toast('PPT 已生成，等待审批');
 },1800);
}
function approvePptFile(id){const [t,a]=findArt(id);if(!t||!a)return;a.st='done';t.st=t.arts.every(x=>x.st==='done')?'done':'review';t.up='刚刚';render();renderNav();toast('PPT 文件已批准');}
function openPptOnline(id){const [,a]=findArt(id);if(!a)return;toast('已打开 PPT 在线编辑 · 展示功能');}
function downloadPptFile(id){const [,a]=findArt(id);if(!a)return;toast('PPTX 下载已开始 · 展示功能');}
function dPptFile(a){return `<div class="ppt-file-summary ppt-file-drawer-summary"><div class="pk-t"><div class="tt">${esc(a.ttl)}</div><div class="ex">PPT 已生成完成 · ${esc(a.createdAt)}</div></div><div class="ppt-file-meta"><span>页数：<b>${a.pageCount} 页</b></span><span>消耗积分：<b>${a.credits}</b></span></div><div class="ppt-file-hint">下载链接约 7 天有效，建议尽快保存。</div></div>${S.pc?`<div style="margin-top:var(--sp-4)">${subPane(a)}</div>`:''}`;}
function pptFileFooter(a){if(a.drawerReturning)return drawerReturnEditor(a);return `${a.st==='review'?`<button class="btn" onclick="approvePptFile('${a.id}')">批准</button>`:''}<button class="btn ghost" onclick="openPptOnline('${a.id}')">在线编辑</button><button class="btn ghost" onclick="downloadPptFile('${a.id}')">下载 PPTX</button>${a.st==='review'?`<button class="btn ghost" onclick="startDrawerReturn('${a.id}')">退回</button>`:''}<button class="rvb ${S.pc?'on':''}" onclick="togglePptComment()">评论 ${subCount(a)?`<span class="n">${subCount(a)}</span>`:''} ${S.pc?'▴':'▾'}</button>`;}
function pptOutlineFooter(a){
 if(a.drawerReturning)return drawerReturnEditor(a);
 if(a.st==='done')return `<span class="st done">已批准</span><button class="rvb ${S.pc?'on':''}" onclick="togglePptComment()">评论 ${subCount(a)?`<span class="n">${subCount(a)}</span>`:''} ${S.pc?'▴':'▾'}</button>`;
 return `<button class="btn" onclick="confirmPptOutline('${a.id}')">批准</button><button class="btn ghost" onclick="addPptPage('${a.id}')">新增一页</button><button class="btn ghost" onclick="startDrawerReturn('${a.id}')">退回</button><button class="rvb ${S.pc?'on':''}" onclick="togglePptComment()">评论 ${subCount(a)?`<span class="n">${subCount(a)}</span>`:''} ${S.pc?'▴':'▾'}</button>`;
}
function findArt(id){for(const t of T){if(!t.arts)continue;const a=t.arts.find(x=>x.id===id);if(a)return[t,a];}return[];}
function openDw(id,oi){
 S.aid=id;S.oi=(oi===undefined?null:oi);S.dtab=0;S.pc=false;S.focus=false;S.cr=null;S.brief=null;S.audit=null;S.auditCreator=null;
 const [,openedArtifact]=findArt(id);if(openedArtifact?.mode==='csa')S.pc=true;
 if(id==='a2')S.planSections={0:true};
 drawDw();$('dw').classList.add('on');$('scrim').classList.add('on');
 document.querySelectorAll('.pk').forEach(e=>e.classList.remove('sel'));
 const p=$('pk-'+id);if(p)p.classList.add('sel');
}
function openReview(id){
 const [,a]=findArt(id);
 if(a?.listing){openDw(id);toggleListingComment();return;}
 if(a?.inspection||a?.sentiment){openDw(id);S.pc=true;drawDw();scrollDrawerToBottom();return;}
 if(a?.mode==='pdpseq'&&a.id==='a4-direction'){openDw(id);S.pc=true;drawDw();scrollDrawerToBottom();return;}
 const tab=a.mode==='pdpseq'?2:a.ty==='视频'?3:a.ty==='详情页'?3:a.ty==='客服回复'?2:2;
 openDw(id);S.dtab=tab;drawDw();
 scrollDrawerToBottom();
}
function scrollDrawerToBottom(){
 requestAnimationFrame(()=>requestAnimationFrame(()=>{
  const body=document.querySelector('#dw .dw-b');
  if(body)body.scrollTop=body.scrollHeight;
 }));
}
function closeDw(){S.ag=null;S.trace=null;S.prop=null;S.hot=null;S.kb=null;S.brief=null;S.kfilterOpen=null;S.auditCreator=null;S.prestartAgentTid=null;S.prestartAgentPick=null;if(S.trT){clearInterval(S.trT);S.trT=null;}$('dw').classList.remove('on','focus','expanded');$('scrim').classList.remove('on');S.focus=false;syncDrawerExpandControl();
 document.querySelectorAll('.pk').forEach(e=>e.classList.remove('sel'));}
function openHistoryArtifact(tid,index){
 const t=T.find(x=>x.id===tid),x=t&&t.log&&t.log[index];if(!t||!x||x.silent)return;
 const a=AG[t.ag]||{},title=x.art||x.res,agentName=nick(t.ag)||a.n||'Agent';
 $('dw').classList.remove('focus','expanded');
 $('dw').innerHTML=`<div class="dw-h">
   <button class="ib" onclick="closeDw()" title="关闭"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
   <div style="flex:1;min-width:0"><div class="ty">${esc(t.t)} · 历史产出</div><h3>${esc(title)}</h3></div>
  </div>
  <div class="dw-b">
   <div class="card">
    <div class="card-t">归档产出 <span class="chip lv">${x.arts||1} 个产出 · 已归档</span></div>
    <div class="ctx">
      <div class="ctxr"><span class="k">运行时间</span><span class="v">${esc(x.at)}</span></div>
      <div class="ctxr"><span class="k">运行结果</span><span class="v">${esc(x.res)}</span></div>
      <div class="ctxr"><span class="k">执行 Agent</span><span class="v">${esc(agentName)}</span></div>
      <div class="ctxr"><span class="k">归档状态</span><span class="v">已归档</span></div>
    </div>
    <div class="note" style="margin-top:var(--sp-3)">这是该次例行运行留下的历史产出。当前原型只做归档展示，不影响今天的待审批内容。</div>
   </div>
  </div>`;
 $('dw').classList.add('on');$('scrim').classList.add('on');syncDrawerExpandControl();
}
document.addEventListener('click',e=>{
 const drawer=$('dw'),button=e.target.closest('button');
 if(!drawer?.classList.contains('on')||!button||!drawer.contains(button)||button.disabled)return;
 if(button.hasAttribute('data-keep-drawer')||button.textContent.replace(/\s+/g,'').trim()!=='批准')return;
 setTimeout(()=>{if(drawer.classList.contains('on'))closeDw();},0);
});
function toggleFocus(){S.focus=!S.focus;$('dw').classList.toggle('focus',S.focus);drawDw();}

function toggleDrawerExpanded(){
 const drawer=$('dw');if(!drawer||!drawer.classList.contains('on'))return;
 drawer.classList.toggle('expanded');syncDrawerExpandControl();
}
function syncDrawerExpandControl(){
 const drawer=$('dw'),head=drawer&&drawer.querySelector('.dw-h');if(!head)return;
 let button=head.querySelector('.dw-expand-toggle');
 if(!button){
  button=document.createElement('button');button.type='button';button.className='dw-expand-toggle';
  button.onclick=toggleDrawerExpanded;
  const title=[...head.children].find(el=>el.tagName==='DIV'&&/flex\s*:\s*1/.test(el.getAttribute('style')||''));
  head.insertBefore(button,title?title.nextElementSibling:null);
 }
 const expanded=drawer.classList.contains('expanded'),state=expanded?'expanded':'default';
 if(button.dataset.state!==state){
  button.dataset.state=state;
  button.title=expanded?'把抽屉收回原来的宽度':'把抽屉向左拉宽，方便看长内容';
  button.setAttribute('aria-label',button.title);
  button.setAttribute('aria-pressed',expanded?'true':'false');
  /* inline SVG — never depends on the icon library loading */
  const icon=expanded
   ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 5h6v6"/><path d="M19 5l-7 7"/><path d="M11 19H5v-6"/><path d="M5 19l7-7"/></svg>'
   : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4H4v5"/><path d="M4 4l7 7"/><path d="M15 20h5v-5"/><path d="M20 20l-7-7"/></svg>';
  button.innerHTML=icon+'<span>'+(expanded?'收起':'加宽')+'</span>';
 }
}
function dtab(i){
 S.dtab=i;const [,a]=findArt(S.aid);
 if(a&&a.mode==='csa'){S.pc=i===0;if(i===1)a.csa.emailIndex=null;}
 if(a&&a.mode==='roster'){S.audit=null;if(i!==0)S.auditCreator=null;}
 else if(i!==1)S.audit=null;
 drawDw();
}
function stepArt(d){
 const t=T.find(x=>x.id===S.tid);const i=t.arts.findIndex(a=>a.id===S.aid);
 const n=i+d;if(n<0||n>=t.arts.length)return;openDw(t.arts[n].id);
}
function detailDirectionIndex(a){
 const i=S.oi===null||S.oi===undefined?0:S.oi;
 return Math.max(0,Math.min(a.opts.length-1,i));
}
function stepDirection(d){
 const [,a]=findArt(S.aid);if(!a||!a.opts)return;
 const n=detailDirectionIndex(a)+d;if(n<0||n>=a.opts.length)return;
 S.oi=n;S.dtab=0;S.pc=false;drawDw();
}
function drawDw(){
 const [t,a]=findArt(S.aid);if(!a)return;
 const t2=T.find(x=>x.id===S.tid);const idx=t2.arts.findIndex(x=>x.id===S.aid);
 const planIndex=a.mode==='plans'?Math.max(0,Math.min((a.plans||[]).length-1,S.oi===null?1:S.oi)):null;
 const plan=planIndex===null?null:(a.plans||[])[planIndex];
  const isDetailDirection=a.id==='a4-direction'&&a.mode==='options';
 const isActivityDirection=a.id==='a1';
 const isSocialDirection=a.mode==='options'&&a.independent&&!isActivityDirection;
 const isSeoDirection=a.mode==='options'&&a.seoFlow;
 const isStandaloneDirection=isDetailDirection||isActivityDirection||isSocialDirection||isSeoDirection;
 const directionIndex=isStandaloneDirection?detailDirectionIndex(a):null;
 const direction=isStandaloneDirection?a.opts[directionIndex]:null;
 if(S.brief!==null&&S.brief!==undefined&&a.rows){openBrief(S.brief);return;}
 if(S.cr!==null&&S.cr!==undefined&&a.rows){
  const r=a.rows[S.cr];
  const cp=creatorProfile(r,S.cr);
  $('dw').innerHTML=`<div class="dw-h">
    <button class="ib" onclick="backCreator()" title="返回名单"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg></button>
    <div style="flex:1;min-width:0"><div class="ty">知识库 · 达人档案</div><div style="display:flex;align-items:center;gap:var(--sp-1);flex-wrap:wrap"><h3>${esc(cp.n)}</h3><span class="creator-platform-pill">${esc(cp.plat)}</span><span class="creator-update-pill">更新日期 ${esc(cp.updated)}</span></div></div>
    <button class="ib" onclick="closeDw()"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button></div>
   <div class="dw-tabs">${['文档','录入数据 '+creatorContents(r,S.cr).length,'合作记录 '+creatorCollabs(r,S.cr).length,'本次沟通 '+rosterSubCount(r),'匹配度'].map((x,j)=>`<button class="${(S.crtab||0)===j?'on':''}" onclick="S.creatorCollab=null;S.crtab=${j};drawDw()">${x}</button>`).join('')}</div>
   <div class="dw-b">${dCreator(a,S.cr)}</div>
   <div class="dw-f">${(S.crtab||0)===1?`<button class="btn" onclick="openContentData(S.cr)">＋ 录入内容数据</button>`:''}
     <span style="margin-left:auto;font-size:var(--fs-xs);color:var(--t3)">档案为只读 · 沟通记录属于本次合作</span></div>`;
  return;
 }
 let tabs,body;
 const R=`评论 ${subCount(a)?'· '+subCount(a):''}`;

if(a.mode==='seo-intake'){
 tabs=['关键词确认'];
 body=dSeoIntake(a);
 }
else if(a.mode==='pptfile'){
 tabs=['文件信息','版本'];
 body=[dPptFile(a),dVer(a)][S.dtab];
 }
else if(a.mode==='pptoutline'){
 tabs=['当前大纲','版本'];
 body=[dPptOutline(a),dVer(a)][S.dtab];
 }
else if(a.mode==='csa'){
 tabs=['文档','邮件'];
 body=[dCSASummary(a)+(S.pc?`<div class="csa-summary-comments">${subPane(a)}</div>`:''),dCSAEmail(a)+(S.pc?`<div style="margin-top:var(--sp-4)">${subPane(a)}</div>`:'')][S.dtab];
 }
 else if(a.mode==='plans'){
  const planComments=S.pc?`<div style="margin-top:var(--sp-3)">${subPane(a,planIndex)}</div>`:'';
  if(a.ty==='活动策划'){
   tabs=['文档','版本'];body=[dPlanDoc(a,plan,planIndex)+planComments,dVer(a)][S.dtab];
  }else{
   tabs=['文档','图片','版本'];body=[dPlanDoc(a,plan,planIndex)+planComments,dPlanImgs(plan)+planComments,dVer(a)][S.dtab];
  }
 }
 else if(isStandaloneDirection){
  const directionComments=S.pc?`<div style="margin-top:var(--sp-3)">${subPane(a,directionIndex)}</div>`:'';
  if(isSeoDirection){
   tabs=['内容方向','版本'];body=[dSeoDirection(a,directionIndex),dVer(a)][S.dtab];
  }else if(isActivityDirection&&direction.activityPlanReady){
   tabs=['当前活动策划','创意方向','版本'];body=[dActivityPlanPreview(),dDetailDirection(a,directionIndex),dVer(a)][S.dtab];
  }else if(isDetailDirection&&direction.planReady&&(direction.imagesGenerated||direction.imagesGenerating)){
   tabs=['图片','当前规划表','创意方向','版本'];body=[dDirectionImages(a,directionIndex),dDirectionPlanPreview(a,directionIndex),dDetailDirection(a,directionIndex),dVer(a)][S.dtab];
  }else if(isDetailDirection&&direction.planReady){
   tabs=['当前规划表','创意方向','版本'];body=[dDirectionPlanPreview(a,directionIndex),dDetailDirection(a,directionIndex),dVer(a)][S.dtab];
  }else if(isDetailDirection&&direction.imagesGenerated){
   tabs=['图片','创意方向','版本'];body=[dDirectionImages(a,directionIndex),dDetailDirection(a,directionIndex),dVer(a)][S.dtab];
  }else{
   tabs=[isDetailDirection||isActivityDirection?'创意方向':'文档','版本'];body=[dDetailDirection(a,directionIndex)+(isDetailDirection||isActivityDirection?'':directionComments),dVer(a)][S.dtab];
  }
  if((isDetailDirection||isActivityDirection||isSeoDirection)&&S.pc)body+=directionComments;
 }
 else if(a.mode==='options'){tabs=['方向对比','版本'];body=[dOpts(a),dVer(a)][S.dtab];}
 else if(a.mode==='roster'){tabs=['名单','内容审核','效果分析','版本'];body=[dRoster(a),dContentAudit(a),dEffectAnalysis(a),dVer(a)][S.dtab];}
 else if(a.listing){tabs=['上架流程','版本'];body=[dListingWorkflow(a)+(S.pc?`<div id="listing-comments" style="margin-top:var(--sp-4)">${subPane(a,0)}</div>`:''),dVer(a)][S.dtab];}
 else if(a.mode==='items'){tabs=['SKU','校验','版本'];body=[dItems(a),dOut(a),dVer(a)][S.dtab];}
 else if(a.manualOutput){
  tabs=['产出模板'];
  body=dManualOutput(a)+(S.pc?`<div style="margin-top:var(--sp-4)">${subPane(a)}</div>`:'');
 }
 else if(a.mode==='report'){
  tabs=['章节','数据溯源','受众口径','版本'];
  body=[dRepSecs(a),dRepSrc(a),dRepAud(a),dVer(a)][S.dtab]+(S.pc?`<div style="margin-top:var(--sp-4)">${subPane(a)}</div>`:'');
 }
 else if(a.mode==='seq'){
  if(a.id==='a-seo-flow-article'){
   tabs=['正文','图片','结构与关键词','FAQ','内容方向','版本'];
   body=[dSeo(a),dSeoImgs(a),dSeoKw(a)+dSeoOut(a),dSeoFaq(a),dSeoApprovedDirection(a),dVer(a)][S.dtab]+(S.pc&&S.dtab<4?`<div id="seo-comments" style="margin-top:var(--sp-4)">${subPane(a)}</div>`:'');
  }else{
   tabs=['正文','图片','结构与关键词','FAQ','版本'];
   body=[dSeo(a),dSeoImgs(a),dSeoKw(a)+dSeoOut(a),dSeoFaq(a),dVer(a)][S.dtab]+(S.pc&&S.dtab<4?`<div id="seo-comments" style="margin-top:var(--sp-4)">${subPane(a)}</div>`:'');
  }
 }
 else if(a.mode==='adtable'){tabs=['计划表','策略说明',R,'版本'];body=[dAdTable(a),dStrat(a),subPane(a),dVer(a)][S.dtab];}
 else if(a.ty==='视频'){tabs=['成片','分镜','脚本','版本'];body=[dVid(a),dShots(a),dScript(a),dVer(a)][S.dtab];}
 else if(a.mode==='promoseq'){
  tabs=['图片','推广计划表','版本'];
  body=[dPromotionImages(a),dPromotionPlan(a),dPromotionVersions(a)][S.dtab]+(S.pc&&S.dtab<2?`<div style="margin-top:var(--sp-4)">${subPane(a)}</div>`:'');
 }
  else if(a.mode==='pdpseq'){
   if(a.m1){tabs=['图片','当前规划表','创意方向','版本'];body=[dDirectionImages(a),dM1PdpPlan(a),dM1PdpDirection(a),dVer(a)][S.dtab]+(S.pc&&S.dtab<3?`<div style="margin-top:var(--sp-4)">${subPane(a)}</div>`:'');}
   else if(a.id==='a4-direction'){
    tabs=['图片','当前规划表','创意方向','版本'];
    body=[dImgs(a),dPdpTable(a),dDetailDirection(a,0),dVer(a)][S.dtab]+(S.pc&&S.dtab<3?`<div style="margin-top:var(--sp-4)">${subPane(a)}</div>`:'');
   }
   else {tabs=['规划详情表','图片',R,'版本'];body=[dPdpTable(a),dImgs(a),subPane(a),dVer(a)][S.dtab];}
 }
 else if(a.ty==='详情页'){tabs=['字段','图片','A+ 模块','版本'];body=[dFlds(a),dImgs(a),dAplus(a),dVer(a)][S.dtab];}
 else if(a.ty==='客服回复'){tabs=['回复','客户上下文','模板'];body=[dReply(a),dCtx(a),dTpl(a)][S.dtab];}
 else if(a.sentiment){
  tabs=['发现详情','相关提及 '+a.sentiment.mentions.length];
  body=[sentimentSummary(a),sentimentMentions(a)][S.dtab]+(S.pc?`<div style="margin-top:var(--sp-4)">${subPane(a)}</div>`:'');
 }
 else if(a.inspection){
  tabs=['文档'];
  body=inspectionSummary(a)+(S.pc?`<div style="margin-top:var(--sp-4)">${subPane(a)}</div>`:'');
 }
 else {tabs=['文档','要点','版本'];body=[dDoc(a),dPts(a),dVer(a)][S.dtab];}
 $('dw').innerHTML=`
  <div class="dw-h">
    <button class="ib" onclick="closeDw()" title="关闭"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
    <div style="flex:1;min-width:0"><div class="ty">${a.mode==='plans'?(a.id==='a2'?'活动策划':'社媒内容'):a.ty}${a.plat?' · '+a.plat:''}</div><h3 style="${direction?'white-space:pre-line':''}">${esc(direction?direction.t:plan?plan.t:a.ttl)}</h3></div>
    ${(a.mode==='plans'?a.plans.length:isStandaloneDirection?a.opts.length:t2.arts.length)>1?`<button class="ib" onclick="${a.mode==='plans'?'stepPlan':isStandaloneDirection?'stepDirection':'stepArt'}(-1)" ${(a.mode==='plans'?planIndex<=0:isStandaloneDirection?directionIndex<=0:idx<=0)?'disabled':''} title="${a.mode==='plans'?'上一篇':isStandaloneDirection?'上一个方向':'上一个产出'}"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg></button>
    <button class="ib" onclick="${a.mode==='plans'?'stepPlan':isStandaloneDirection?'stepDirection':'stepArt'}(1)" ${(a.mode==='plans'?planIndex>=a.plans.length-1:isStandaloneDirection?directionIndex>=a.opts.length-1:idx>=t2.arts.length-1)?'disabled':''} title="${a.mode==='plans'?'下一篇':isStandaloneDirection?'下一个方向':'下一个产出'}"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg></button>`:''}
  </div>
  <div class="dw-tabs">${tabs.map((x,i)=>`<button class="${S.dtab===i?'on':''}" onclick="dtab(${i})">${x}</button>`).join('')}</div>
  <div class="dw-b">${body}</div>
  <div class="dw-f ${a.inspection||a.sentiment||a.listing?'inspection-actions':isStandaloneDirection?'direction-actions':''}">
    ${a.mode==='seo-intake'?seoIntakeFooter(a)
     :a.mode==='pptfile'?pptFileFooter(a)
     :a.mode==='pptoutline'?pptOutlineFooter(a)
     :a.mode==='csa'?csaFooter(a)
     :a.listing?`<div id="listing-footer" style="display:flex;align-items:center;gap:var(--sp-2);flex-wrap:wrap">${listingFooter(a)}</div>`
     :a.m1?m1Footer(a):a.sentiment?sentimentActions(a):a.inspection?inspectionActions(a)
     :a.mode==='roster'&&S.dtab===0&&Number.isInteger(S.auditCreator)?creatorAuditFooter(a,S.auditCreator)
     :a.mode==='roster'&&S.dtab===2?`<button class="btn" onclick="openContentData()">＋ 录入内容数据</button>`
     :a.mode==='roster'&&S.dtab===1?globalAuditFooter(a)
     :a.mode==='promoseq'?promotionFooter(a)
       :a.mode==='pdpseq'&&a.id==='a4-direction'&&S.dtab===0?`${a.st==='review'?`<button class="btn" onclick="act('${a.id}','批准');closeDw()">批准</button>`:''}
        <button class="btn ghost" onclick="downloadAllDetailImages()">批量下载</button>${pdpArtifactCommentButton(a)}`
       :a.mode==='pdpseq'&&a.id==='a4-direction'&&S.dtab===1?`${a.st==='review'?`<button class="btn" onclick="act('${a.id}','批准');closeDw()">批准</button>`:''}
        <button class="btn ghost" onclick="downloadDirectionPlan('${a.id}',0)"><i data-lucide="download"></i>下载规划表</button>${pdpArtifactCommentButton(a)}`
      :a.mode==='pdpseq'&&a.id==='a4-direction'&&S.dtab===2?pdpArtifactCommentButton(a)
      :a.mode==='pdpseq'&&a.id==='a4-direction'?''
     :a.mode==='pdpseq'&&S.dtab===1?`${a.st==='review'?`<button class="btn" onclick="act('${a.id}','批准');closeDw()">批准</button>`:''}
      <button class="btn ghost" onclick="downloadAllDetailImages()">批量下载</button>`
     :a.mode==='pdpseq'&&S.dtab===0?`${a.st==='review'?`<button class="btn" onclick="act('${a.id}','批准');closeDw()">批准</button>`:''}
      <button class="btn ghost" onclick="previewDetailPlan()">预览完整规划表</button>`
     :a.mode==='plans'&&a.ty!=='活动策划'&&S.dtab===1?`<button class="btn ghost" onclick="downloadAllPlanImages()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m0 0 4-4m-4 4-4-4"/><path d="M5 21h14"/></svg> 批量下载</button>`
     :a.mode==='plans'&&S.dtab===0?`${plan.s==='review'?`<button class="btn" onclick="approvePlan('${a.id}',${planIndex})">批准</button>`:''}
      <button class="rvb ${S.pc?'on':''}" onclick="togglePlanDrawerComment()">评论
        ${subCount(plan)?`<span class="n">${subCount(plan)}</span>`:''} ${S.pc?'▴':'▾'}</button>`
     :a.mode==='plans'?''
     :a.manualOutput?`${a.manual?.reviewed?`<span class="st done">已完成</span>`:a.manual?.submitted?`<span class="st review">待主管审核</span>`:`<button class="btn" onclick="completeManualTask('${a.id}');closeDw()">标记为已完成</button>`}
      <button class="rvb ${S.pc?'on':''}" onclick="toggleManualComment()">评论 ${subCount(a)?`<span class="n">${subCount(a)}</span>`:''} ${S.pc?'▴':'▾'}</button>`
     :a.mode==='report'?`${a.st==='review'?`<button class="btn" onclick="act('${a.id}','批准');closeDw()">批准</button>
      <button class="btn ghost" onclick="act('${a.id}','退回');closeDw()">退回并说明</button>`:''}
      <button class="rvb ${S.pc?'on':''}" onclick="toggleReportComment()">评论 ${subCount(a)?`<span class="n">${subCount(a)}</span>`:''} ${S.pc?'▴':'▾'}</button>`
     :isSeoDirection?seoDirectionFooter(a,directionIndex)
     :isActivityDirection?`${direction.activityPlanReady
       ?`${direction.activityPlanApproved?'<span class="st done">已批准</span>':`<button class="btn" onclick="approveActivityPlan('${a.id}',${directionIndex})">批准</button>`}
         <button class="btn ghost" onclick="toast('活动策划 PPT 已开始生成')">生成 PPT</button>
         <span class="plan-download"><button class="btn ghost" onclick="event.stopPropagation();S.planDownloadOpen=!S.planDownloadOpen;drawDw()"><i data-lucide="download"></i>下载活动策划</button>${S.planDownloadOpen?`<span class="plan-download-menu"><button onclick="event.stopPropagation();downloadActivityPlan('HTML')">HTML 格式</button><button onclick="event.stopPropagation();downloadActivityPlan('Word')">Word 格式</button></span>`:''}</span>`
       :`<button class="btn" onclick="startActivityPlanGeneration('${a.id}',${directionIndex})" ${S.activityPlanGenerating===a.id+':'+directionIndex?'disabled':''}>${S.activityPlanGenerating===a.id+':'+directionIndex?'<span class="spin"></span>活动策划生成中…':'生成活动策划'}</button>`}
      <button class="rvb ${S.pc?'on':''}" onclick="toggleDirectionComment()">评论 ${subCount(direction)?`<span class="n">${subCount(direction)}</span>`:''} ${S.pc?'▴':'▾'}</button>`
     :isDetailDirection?pdpDirectionFooter(a,directionIndex,tabs)
     :isSocialDirection?`${direction.s!=='done'?`<button class="btn" onclick="approveDirection('${a.id}',${directionIndex})">批准</button>`:''}
      <button class="rvb ${S.pc?'on':''}" onclick="toggleDirectionComment()">评论 ${subCount(direction)?`<span class="n">${subCount(direction)}</span>`:''} ${S.pc?'▴':'▾'}</button>`
     :a.seoFlow?''
     :a.mode==='seq'?`${a.drawerReturning?drawerReturnEditor(a):a.st==='review'?`<button class="btn" onclick="act('${a.id}','批准');closeDw()">批准</button>
      ${drawerReturnButton(a)}`:a.st==='run'?`<span style="font-size:var(--fs-sm);color:var(--t2)">Agent 还在生成，完成后会回到待审批。</span>`:''}
      ${S.dtab===1?`<button class="btn ghost" onclick="downloadAllPlanImages()"><i data-lucide="download"></i>批量下载</button>`:''}
      ${!a.drawerReturning&&S.dtab<4?`<button class="rvb ${S.pc?'on':''}" aria-expanded="${!!S.pc}" aria-controls="seo-comments" onclick="toggleSeoComment()">评论 ${subCount(a)?`<span class="n">${subCount(a)}</span>`:''} ${S.pc?'▴':'▾'}</button>`:''}`
     :a.st==='review'||a.mode==='options'?`<button class="btn" onclick="act('${a.id}','批准');closeDw()">${a.mode==='roster'?'批准名单':'批准'}</button>
      ${a.mode==='roster'||a.mode==='pdpseq'?'':`<button class="btn ghost" onclick="act('${a.id}','退回');closeDw()">退回并说明</button>`}`
     :a.st==='run'?`<span style="font-size:var(--fs-sm);color:var(--t2)">Agent 还在生成，完成后会回到待审批。</span>`
     :''}
  </div>`;
 if(window.lucide)lucide.createIcons({root:$('dw'),attrs:{width:16,height:16,'stroke-width':1.8}});
 syncDrawerExpandControl();
}

function csaAnswerFor(q){
 const s=q.toLowerCase();
 if(s.includes('roas')||s.includes('投放'))return {text:'近 7 天 ROAS 为 2.6，低于 30 天均值 3.2。主要拖累来自春季新品广告组：点击成本上升 18%，但落地页加购率没有同步改善。建议先缩小低意向人群预算，并保留品牌词与高复购人群进行对照。',source:'口径：广告归因 ROAS · 近 7 天 · 来源：广告平台、店铺订单'};
 if(s.includes('库存')||s.includes('可售'))return {text:'当前库存可售天数为 4.3 天，低于健康区间 7–90 天。风险主要集中在 A80 修护精华 30ml；按近 7 天销量估算，若周末活动如期开始，可能在第 4 天出现断货。',source:'口径：可售库存 ÷ 近 7 天日均销量 · 数据截至今天 07:00 · 来源：库存系统'};
 if(s.includes('页面')||s.includes('详情'))return {text:'移动端页面承接仍是更强的异常信号。首屏停留时长下降 11%，权益模块到达率下降 8 个百分点；桌面端没有同方向变化。建议优先检查首屏加载、主卖点与会场权益是否在一屏内表达清楚。',source:'口径：移动端详情页访问行为 · 近 7 天 · 来源：店铺分析'};
 if(s.includes('流量')||s.includes('访客'))return {text:'流量总量增长 12%，但增长主要来自春季新品广告和泛兴趣人群，自然流量基本持平。新增流量的支付转化率为 0.8%，低于站内自然流量的 1.7%，说明流量结构确实放大了整体转化下滑。',source:'口径：渠道访客与支付转化率 · 近 7 天 · 来源：广告平台、店铺分析'};
 return {text:'从当前数据看，这个变化同时受到流量结构与移动端页面承接影响。能够确认的是转化下降主要发生在移动端，并在新增广告流量中更明显；暂时没有足够证据把原因归到单一因素。可以继续按渠道、设备或用户类型往下拆。',source:'口径：店铺支付转化率 · 近 7 天 · 来源：店铺分析、广告平台'};
}
function dCSASummary(a){
 return `<section class="csa-summary-text"><h4>${esc(a.ttl)}</h4><p>${esc(a.ex||'')}</p></section>`;
}
function dCSAConversation(a){
 const c=a.csa||{},messages=c.messages||[];
 return `<div class="csa-chat">
  ${messages.map(m=>`<div class="csa-msg ${m.role}"><div class="csa-msg-head">${m.role==='agent'?`${AV('csa',22)}<b>客户成功</b>`:'<b>你</b>'}<span>${esc(m.at||'刚刚')}</span></div><div>${esc(m.text).replace(/\n/g,'<br>')}</div>${m.source?`<div class="csa-source">${esc(m.source)}</div>`:''}</div>`).join('')}
  ${c.thinking?`<div class="csa-msg agent"><div class="csa-msg-head">${AV('csa',22)}<b>客户成功</b></div><span class="spin" aria-hidden="true"></span> 正在分析数据…</div>`:''}
  ${c.askOpen?`<div class="sub-w"><div class="sub-c"><div style="position:relative"><div id="m-csa-question"></div><textarea id="csa-question" oninput="onKey(event,'csa-question',false)" placeholder="继续询问这组数据…"></textarea></div><div class="row2"><button class="btn sm" onclick="sendCSAQuestion('${a.id}','chg')">对Ai说</button><button class="btn ghost sm" onclick="sendCSAQuestion('${a.id}','note')">对同事说</button><button class="btn ghost sm" data-mention-toggle onclick="showMent('csa-question',false,this)" title="提到某人">@</button></div></div></div>`:''}
 </div>`;
}
function toggleCSAAsk(id){const [,a]=findArt(id);if(!a?.csa)return;a.csa.askOpen=!a.csa.askOpen;drawDw();if(a.csa.askOpen){scrollDrawerToBottom();setTimeout(()=>{const i=$('csa-question');if(i)i.focus();},30);}}
function askCSA(id,q){const i=$('csa-question');if(i)i.value=q;sendCSAQuestion(id);}
function sendCSAQuestion(id,kind='note'){
 const i=$('csa-question'),q=i&&i.value.trim();if(!q){toast('先输入一个数据问题');return;}
 const [,a]=findArt(id);if(!a?.csa||a.csa.thinking)return;
 a.csa.messages.push({role:'user',text:q,kind:kind==='chg'?'chg':'note',at:'刚刚'});a.csa.thinking=true;a.v++;drawDw();scrollDrawerToBottom();
 setTimeout(()=>{const ans=csaAnswerFor(q);a.csa.messages.push({role:'agent',text:ans.text,source:ans.source,at:'刚刚'});a.csa.thinking=false;render();if(S.aid===id&&S.dtab===0){drawDw();scrollDrawerToBottom();}toast(kind==='chg'?'分析结论已按要求更新':'客户成功已回复');},650);
}
function csaEmails(a){
 const c=a.csa;if(!c.emails){const e=c.email;c.emails=e?[{...e,id:'mail-1',v:1,at:'今天 10:24',rules:'向客户说明转化率变化、判断依据和下一步建议。',thread:c.emailThread||{t:'A80PARIS · 客户邮件',sub:[]}}]:[];c.emailIndex=null;}
 return c.emails;
}
function activeCSAEmail(a){const list=csaEmails(a),i=a.csa.emailIndex;return Number.isInteger(i)?list[i]:null;}
function latestCSAAgentText(a){const x=[...(a.sub||[])].reverse().find(m=>m.w==='csa');return x?.tx||'近期转化率变化主要受到移动端页面承接与新增流量结构共同影响，建议先检查首屏加载和权益表达。';}
function createCSAEmail(a,rules){
 const c=a.csa,text=latestCSAAgentText(a),list=csaEmails(a),e={id:'mail-'+Date.now(),v:1,at:'刚刚',to:'client@a80paris.com',cc:'',subject:`${c.customer} 数据变化说明与建议`,body:`您好，\n\n我们复核了 ${c.customer} 最近一周期的经营数据。${text}\n\n建议先按上述方向完成检查，我们会继续跟进数据变化并同步新的结论。\n\n谢谢。`,basis:'由当前数据评论与起草规则生成',rules:rules||'说明数据变化、判断依据和下一步建议。',sent:false,sentAt:null,thread:{t:c.customer+' · 客户邮件',sub:[]}};
 list.unshift(e);c.emailIndex=0;c.email=e;a.v++;return e;
}
function openCSADraftModal(id){
 $('mod').innerHTML=`<div class="mbox" style="max-width:500px"><div class="mhd modal-titlebar"><div class="main"><div class="e">起草邮件</div><h3>这封邮件要怎么写？</h3></div><button class="ib" title="关闭" onclick="closeMod()">×</button></div><div class="mbd"><div class="fld"><label>起草规则</label><textarea id="csa-draft-rules" rows="5" placeholder="例如：面向客户负责人，语气专业简洁；说明转化率下降的主要原因、数据依据和下一步建议。"></textarea></div><div class="note">邮件会引用当前评论中的数据结论，生成后仍可继续编辑。</div></div><div class="mft"><button class="btn ghost" onclick="closeMod()">取消</button><button class="btn" onclick="confirmCSADraft('${id}')">开始起草</button></div></div>`;$('mod').classList.add('on');
}
function confirmCSADraft(id){const [,a]=findArt(id);if(!a?.csa)return;const rules=$('csa-draft-rules')?.value.trim()||'说明数据变化、判断依据和下一步建议。';createCSAEmail(a,rules);closeMod();S.dtab=1;S.pc=false;render();drawDw();toast('邮件草稿已生成');}
function openCSAInlineDraft(id){const [,a]=findArt(id);if(!a?.csa)return;a.csa.draftOpen=true;a.csa.draftRules=a.csa.draftRules||'';drawDw();setTimeout(()=>$('csa-inline-rules')?.focus(),30);}
function setCSAInlineDraftRules(id,value){const [,a]=findArt(id);if(a?.csa)a.csa.draftRules=value;}
function cancelCSAInlineDraft(id){const [,a]=findArt(id);if(!a?.csa||a.csa.draftGenerating)return;a.csa.draftOpen=false;drawDw();}
function confirmCSAInlineDraft(id){
 const [,a]=findArt(id);if(!a?.csa||a.csa.draftGenerating)return;
 const rules=($('csa-inline-rules')?.value||a.csa.draftRules||'').trim()||'说明数据变化、判断依据和下一步建议。';
 a.csa.draftRules=rules;a.csa.draftGenerating=true;drawDw();
 setTimeout(()=>{a.csa.draftGenerating=false;a.csa.draftOpen=false;createCSAEmail(a,rules);render();if(S.aid===id){S.dtab=1;S.pc=false;drawDw();}toast('邮件草稿已生成');},2000);
}
function generateCSAEmail(id){const [,a]=findArt(id),e=activeCSAEmail(a);if(!e)return;e.v++;e.at='刚刚';e.body=`您好，\n\n根据最新数据与评论记录，我们重新整理了 ${a.csa.customer} 的变化说明。${latestCSAAgentText(a)}\n\n建议优先完成相关检查，并按渠道与设备继续验证。我们会持续跟进并同步进展。\n\n谢谢。`;e.sent=false;e.sentAt=null;a.csa.email=e;a.v++;render();drawDw();toast('邮件已重新生成');}
function dCSAEmail(a){
 const list=csaEmails(a),e=activeCSAEmail(a);
 if(!e)return `<div class="audit-toolbar"><span class="ttl">邮件</span><span style="margin-left:auto;color:var(--t3);font-size:var(--fs-xs)">${list.length} 封</span></div>${list.length?list.map((x,i)=>`<button class="audit-card ${i===0?'current':''}" onclick="aOpenCSAEmail('${a.id}',${i})"><div class="audit-card-h"><span class="audit-dot ${x.sent?'old':''}"></span><b>${esc(x.subject)}</b><span class="chip mut">v${x.v}</span></div><div class="audit-card-m"><span>收件人 ${esc(x.to)}</span><span class="spacer"></span><span class="st ${x.sent?'done':'hold'}">${x.sent?'已发送':'草稿'}</span><span class="chip mut">${esc(x.at)}</span></div></button>`).join(''):`<div class="empty" style="padding:var(--sp-6) 16px"><div class="h">还没有邮件</div><div class="s">在评论页点击“起草邮件”创建第一封。</div></div>`}`;
 return `<button class="rvb" onclick="backCSAEmailList('${a.id}')">← 返回邮件列表</button><div class="csa-email" style="margin-top:var(--sp-3)">${e.sent?`<div class="csa-email-state">✓ 已发送给 ${esc(e.to)} · ${esc(e.sentAt||e.at)}</div>`:''}<div class="fld"><label>收件人</label><input value="${esc(e.to||'')}" onchange="setCSAEmailField('${a.id}','to',this.value)"></div><div class="fld"><label>抄送</label><input value="${esc(e.cc||'')}" placeholder="可选" onchange="setCSAEmailField('${a.id}','cc',this.value)"></div><div class="fld"><label>主题</label><input value="${esc(e.subject||'')}" onchange="setCSAEmailField('${a.id}','subject',this.value)"></div><div class="fld"><label>正文</label><textarea onchange="setCSAEmailField('${a.id}','body',this.value)">${esc(e.body||'')}</textarea></div><div class="csa-email-basis">起草规则：${esc(e.rules||'由当前数据结论生成')}</div></div>`;
}
function aOpenCSAEmail(id,i){const [,a]=findArt(id);if(!a?.csa)return;a.csa.emailIndex=i;a.csa.email=csaEmails(a)[i];S.pc=false;drawDw();}
function backCSAEmailList(id){const [,a]=findArt(id);if(!a?.csa)return;a.csa.emailIndex=null;S.pc=false;drawDw();}
function setCSAEmailField(id,key,value){const [,a]=findArt(id),e=a&&activeCSAEmail(a);if(!e)return;e[key]=value;e.sent=false;e.sentAt=null;e.at='刚刚';a.csa.email=e;}
function approveCSA(id){
 const [t,a]=findArt(id);if(!a?.csa)return;
 a.st='done';t.st=t.arts.every(x=>x.st==='done')?'done':t.st;t.up='刚刚';
 render();if(S.aid===id&&$('dw').classList.contains('on'))drawDw();toast('已批准');
}
function csaApproveControl(a){return a.st==='done'?'':`<button class="btn" onclick="approveCSA('${a.id}')">批准</button>`;}
function csaFooter(a){
 if(a.drawerReturning)return drawerReturnEditor(a);
 if(a.csa?.draftOpen)return `<div class="csa-inline-draft"><input id="csa-inline-rules" value="${esc(a.csa.draftRules||'')}" oninput="setCSAInlineDraftRules('${a.id}',this.value)" placeholder="输入邮件起草要求，例如：语气专业简洁，说明原因和下一步建议" ${a.csa.draftGenerating?'disabled':''}><button class="btn" onclick="confirmCSAInlineDraft('${a.id}')" ${a.csa.draftGenerating?'disabled':''}>${a.csa.draftGenerating?'<span class="spin" aria-hidden="true"></span> 起草中…':'起草'}</button><button class="btn ghost" onclick="cancelCSAInlineDraft('${a.id}')" ${a.csa.draftGenerating?'disabled':''}>取消</button></div>`;
 if(S.dtab===0)return `${csaApproveControl(a)}${a.st!=='done'?drawerReturnButton(a):''}<button class="btn ghost csa-draft-btn" onclick="openCSAInlineDraft('${a.id}')">起草邮件</button><button class="rvb ${S.pc?'on':''}" onclick="toggleCSAComment()">评论 ${subCount(a)?`<span class="n">${subCount(a)}</span>`:''} ${S.pc?'▴':'▾'}</button>`;
 const e=activeCSAEmail(a);if(!e)return `${csaApproveControl(a)}<button class="btn ghost csa-draft-btn" onclick="openCSAInlineDraft('${a.id}')">起草邮件</button>`;
 const emailCount=subCount(e.thread||{});
 return `<button class="btn" onclick="toast('邮件已保存')">保存</button><button class="btn ghost" onclick="generateCSAEmail('${a.id}')">重新生成</button><button class="btn ghost" onclick="openCSASendConfirm('${a.id}')">直接发送</button><button class="rvb ${S.pc?'on':''}" onclick="toggleCSAEmailComment()">评论 ${emailCount?`<span class="n">${emailCount}</span>`:''} ${S.pc?'▴':'▾'}</button>`;
}
function openCSAComments(id){
 openDw(id);S.dtab=0;S.pc=true;drawDw();scrollDrawerToBottom();
}
function toggleCSAComment(){S.pc=!S.pc;drawDw();if(S.pc)scrollDrawerToBottom();}
function toggleCSAEmailComment(){S.pc=!S.pc;drawDw();if(S.pc)scrollDrawerToBottom();}
function openCSASendConfirm(id){
 const [,a]=findArt(id),e=a&&activeCSAEmail(a);if(!e)return;
 $('mod').innerHTML=`<div class="mbox" style="max-width:520px"><div class="mhd modal-titlebar"><div class="main"><div class="e">发送确认</div><h3>发送客户邮件</h3></div><button class="ib" title="关闭" onclick="closeMod()">×</button></div><div class="mbd"><div class="note">此 Demo 将模拟发送，并在邮件详情中留下发送时间。</div><div class="fld"><label>收件人</label><div class="ctx">${esc(e.to)}</div></div><div class="fld"><label>主题</label><div class="ctx">${esc(e.subject)}</div></div></div><div class="mft"><button class="btn ghost" onclick="closeMod()">取消</button><button class="btn" onclick="confirmCSASend('${id}')">确认发送</button></div></div>`;$('mod').classList.add('on');
}
function confirmCSASend(id){const [,a]=findArt(id),e=a&&activeCSAEmail(a);if(!e)return;e.sent=true;e.sentAt='刚刚';e.at='刚刚';a.csa.email=e;a.v++;closeMod();render();drawDw();toast('邮件已模拟发送');}

function dManualOutput(a){
 const m=a.manual,names=manualPeopleLabel(manualArtifactPeople(m)),files=manualFiles(m);
 return `<div class="manual-output-card">
  <div class="note" style="margin:0;background:var(--orange-bg);border-color:#FED7AA;color:#9A4B0B">此产出由 <b>${esc(names)}</b> 共同提交，仍沿用当前任务的审批、评论和版本记录。</div>
  <div class="manual-output-box"><h4>结果摘要</h4><textarea rows="4" onchange="setManualField('summary',this.value)">${esc(m.summary)}</textarea></div>
  <div class="manual-output-box"><h4>文件</h4><div class="manual-upload"><button class="btn ghost sm" onclick="$('manual-file-input').click()">上传文件</button><input id="manual-file-input" type="file" multiple hidden onchange="manualFileSelected(this)">${files.length?`<div class="manual-files">${files.map((x,i)=>`<span class="file"><span>${esc(x)}</span><button type="button" onclick="removeManualFile(${i})" title="删除文件" aria-label="删除文件"><i data-lucide="trash-2"></i></button></span>`).join('')}</div>`:''}</div></div>
 </div>`;
}
function dManualRecords(a){
 const m=a.manual;
 return `<div class="manual-output-box"><h4>处理记录</h4>${m.records.map(x=>`<div class="manual-record"><b>${esc(x.who)}</b><span style="float:right;color:var(--t3)">${esc(x.at)}</span><div style="margin-top:var(--sp-1)">${esc(x.tx)}</div></div>`).join('')}
  <div style="display:flex;gap:var(--sp-2);margin-top:var(--sp-3)"><input id="manual-record-input" style="flex:1" placeholder="补充一条处理记录"><button class="btn ghost sm" onclick="addManualRecord()">添加记录</button></div></div>`;
}
function setManualField(key,value){const [,a]=findArt(S.aid);if(!a?.manual)return;a.manual[key]=value;toast('人工产出已保存');}
function manualFileSelected(input){
 const picked=Array.from(input.files||[]);if(!picked.length)return;const [,a]=findArt(S.aid);if(!a?.manual)return;
 const names=picked.map(x=>x.name);a.manual.files=manualFiles(a.manual).filter(x=>x!=='尚未上传文件');names.forEach(name=>{if(!a.manual.files.includes(name))a.manual.files.push(name);});delete a.manual.file;
 a.manual.records.push({who:manualRecordWho(a.manual),at:'刚刚',tx:'上传 '+names.length+' 个文件：'+names.join('、')});render();drawDw();toast('已加入 '+names.length+' 个文件');
}
function removeManualFile(index){
 const [,a]=findArt(S.aid);if(!a?.manual)return;const files=manualFiles(a.manual),name=files[index];if(!name)return;
 files.splice(index,1);a.manual.files=files;delete a.manual.file;
 a.manual.records.push({who:manualRecordWho(a.manual),at:'刚刚',tx:'删除文件：'+name});
 render();drawDw();toast('文件已删除');
}
function addManualRecord(){
 const i=$('manual-record-input'),tx=i&&i.value.trim();if(!tx)return;const [,a]=findArt(S.aid);if(!a?.manual)return;
 a.manual.records.push({who:'dudu',at:'刚刚',tx});drawDw();toast('处理记录已添加');
}

function dDetailDirection(a,i){
 const o=a.opts[i];
 const defaultRef='https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=500&q=85';
 const ref=o.referenceImage===undefined?defaultRef:o.referenceImage;
 return `<div class="fld"><label>标题</label><textarea rows="2" onchange="setDirectionField('${a.id}',${i},'t',this.value)">${esc(o.t)}</textarea></div>
  <div class="fld"><label>内容</label><textarea rows="14" onchange="setDirectionField('${a.id}',${i},'body',this.value)">${esc(o.body||o.e)}</textarea></div>
  ${a.id==='a4-direction'?`<div class="direction-reference"><span class="direction-reference-label">参考产品图（仅限 1 张）</span><div class="img-ref">
   ${ref?`<div class="thumb" style="background-image:url('${esc(ref)}')"><button type="button" class="promotion-ref-remove" onclick="removeDirectionReference('${a.id}',${i})" title="移除参考图"><i data-lucide="x"></i></button></div>`:''}
   <span class="ref-add-wrap"><button type="button" class="add" onclick="toggleDirectionReferenceMenu(event,'${a.id}',${i})" title="添加参考图"><i data-lucide="plus"></i></button>${S.directionRefMenu===a.id+':'+i?directionReferenceMenu(a.id,i):''}</span>
  </div><div class="help">后续详情图生成会使用这里的产品图。此处仅限 1 张清晰参考图，以提升生成稳定性。</div></div>`:''}`;
}
function directionGeneratedCover(i){
 const images=detailImgs(),indexes=[0,3,6];
 return images[indexes[i]??0].src;
}
function setDirectionField(id,i,key,value){
 const [,a]=findArt(id);if(!a||!a.opts||!a.opts[i])return;
 a.opts[i][key]=value;
 if(key==='body')a.opts[i].e=value.split('\n').filter(Boolean)[0]||value;
 toast('方向'+['一','二','三'][i]+'已保存');render();
}
async function addDirectionReference(id,i){
 const input=document.createElement('input');input.type='file';input.accept='image/*';
 input.onchange=async()=>{const refs=await kpReadImages(input.files),[,a]=findArt(id);if(!refs.length||!a||!a.opts||!a.opts[i])return;a.opts[i].referenceImage=refs[0].url;drawDw();toast('参考产品图已更新');};
 input.click();
}
function directionReferenceMenu(id,i){
 return `<div class="ref-menu" role="menu" aria-label="添加参考图方式">
  <button role="menuitem" onclick="chooseDirectionReference('素材库',event)"><i data-lucide="layout-grid"></i><span>素材库</span></button>
  <button role="menuitem" onclick="chooseDirectionReference('本地上传',event)"><i data-lucide="upload"></i><span>本地上传</span></button>
  <button role="menuitem" onclick="chooseDirectionReference('恢复默认参考图',event)"><i data-lucide="rotate-ccw"></i><span>恢复默认参考图</span></button>
 </div>`;
}
function toggleDirectionReferenceMenu(event,id,i){
 if(event)event.stopPropagation();
 const key=id+':'+i;
 S.directionRefMenu=S.directionRefMenu===key?null:key;
 drawDw();
}
function chooseDirectionReference(label,event){
 if(event)event.stopPropagation();
 S.directionRefMenu=null;drawDw();toast(label+' · 展示菜单，暂未接入操作');
}
function removeDirectionReference(id,i){
 const [,a]=findArt(id);if(!a||!a.opts||!a.opts[i])return;
 a.opts[i].referenceImage=null;drawDw();toast('已移除参考产品图');
}
function toggleDirectionComment(){const opening=!S.pc;S.pc=!S.pc;drawDw();if(opening)scrollDrawerToBottom();}
function togglePdpArtifactComment(){const opening=!S.pc;S.pc=!S.pc;drawDw();if(opening)scrollDrawerToBottom();}
function pdpArtifactCommentButton(a){return `<button class="rvb ${S.pc?'on':''}" onclick="togglePdpArtifactComment()">评论 ${subCount(a)?`<span class="n">${subCount(a)}</span>`:''} ${S.pc?'▴':'▾'}</button>`;}
function pdpDirectionFooter(a,i,tabs){
 const o=a.opts[i],comments=`<button class="rvb ${S.pc?'on':''}" onclick="toggleDirectionComment()">评论 ${subCount(o)?`<span class="n">${subCount(o)}</span>`:''} ${S.pc?'▴':'▾'}</button>`;
 if(a.drawerReturning)return drawerReturnEditor(a);
 if(a.flowStage==='plan-generating')return comments;
 if(a.flowStage==='plan-review'){
  if(tabs[S.dtab]==='当前规划表')return `<button class="btn" data-keep-drawer onclick="approvePdpPlan('${a.id}')">批准</button><button class="btn ghost" onclick="downloadDirectionPlan('${a.id}',${i})"><i data-lucide="download"></i>下载规划表</button>${drawerReturnButton(a)}${comments}`;
  return tabs[S.dtab]==='创意方向'?comments:'';
 }
 if(a.flowStage==='detail-generating')return `<button class="btn" disabled><span class="spin"></span>详情页生成中…</button>${comments}`;
 if(a.flowStage==='complete')return `<span class="st done">规划表已批准</span>${comments}`;
 return `<button class="btn" onclick="approvePdpDirection('${a.id}',${i})">批准</button>${drawerReturnButton(a)}${comments}`;
}
function approvePdpDirection(id,i){
 const [t,a]=findArt(id),chosen=a?.opts?.[i];if(!t||id!=='a4-direction'||!chosen||a.flowStage!=='direction-review')return;
 a.discardedOptions=a.opts.filter((_,j)=>j!==i).map(o=>({...o,s:'archived'}));
 a.selectedOriginalIndex=i;chosen.originalIndex=i;chosen.s='review';chosen.planReady=false;chosen.planApproved=false;
 a.opts=[chosen];a.selected=0;a.flowStage='plan-generating';a.st='run';a.sum='已批准'+chosen.t.split('：')[0]+' · 规划表生成中';
 t.st='run';t.up='刚刚';t.live={t:'详情页生成正在整理完整规划表',el:'刚刚',sub:['正在根据已批准方向生成屏次、卖点顺序与画面要求'],p:46,tk:620};
 if(t.plan?.steps?.[3])t.plan.steps[3]={l:'批准一个创意方向',m:chosen.t.replace(/^方向[一二三]：/,''),s:'ok',r:'刚刚'};
 if(t.plan?.steps?.[4])t.plan.steps[4]={l:'生成并批准规划表',m:'正在一次性生成完整规划表',s:'act',r:'进行中'};
 S.oi=0;closeDw();render();toast('方向已批准 · 其他两个方向已作废');
 setTimeout(()=>{
  const [currentTask,current]=findArt(id),selected=current?.opts?.[0];if(!currentTask||!selected)return;
  ensureDirectionPlan(current,0);selected.planApproved=false;current.flowStage='plan-review';current.st='review';current.sum='完整规划表已生成 · 待审批';
  currentTask.live=null;currentTask.st='review';currentTask.up='刚刚';
  if(currentTask.plan?.steps?.[4])currentTask.plan.steps[4]={l:'生成并批准规划表',m:`完整规划表 · ${selected.plan.length} 屏`,s:'act',r:'待审批'};
  render();syncAppr();toast('完整规划表已生成 · 等待批准');
 },1600);
}
function approvePdpPlan(id){
 const [t,a]=findArt(id),o=a?.opts?.[0];if(!t||id!=='a4-direction'||a.flowStage!=='plan-review'||!o?.planReady)return;
 o.planApproved=true;o.s='done';o.imagesGenerating=true;a.st='done';a.flowStage='detail-generating';a.sum='规划表已批准 · 详情页生成中';S.detailImagesComplete=false;S.dtab=0;
 t.st='run';t.up='刚刚';t.live={t:'详情页生成正在生成页面内容',el:'刚刚',sub:['正在根据已批准规划表生成详情页图片与内容模块'],p:52,tk:980};
 if(t.plan?.steps?.[4])t.plan.steps[4]={l:'生成并批准规划表',m:`完整规划表 · ${o.plan.length} 屏 · 已批准`,s:'ok',r:'刚刚'};
 if(t.plan?.steps?.[5])t.plan.steps[5]={l:'生成详情页',m:'正在生成图片与内容模块',s:'act',r:'进行中'};
 render();if(S.aid===id&&$('dw')?.classList.contains('on'))drawDw();toast('规划表已批准 · 开始生成详情页');
 setTimeout(()=>{
  const current=T.find(x=>x.id===t.id),directions=current?.arts?.find(x=>x.id===id),detail=current?.arts?.find(x=>x.id==='a4'),selected=directions?.opts?.[0];
  if(!current||!directions||!detail||!selected)return;
  selected.imagesGenerating=false;selected.imagesGenerated=true;S.detailImagesComplete=true;
  const sourceDirection=directions.selectedOriginalIndex??0,directionHistory={selected:{...selected},discarded:[...(directions.discardedOptions||[])]};
  Object.assign(directions,{mode:'pdpseq',stage:1,sourceDirection,ty:'详情页',plat:detail.plat,ttl:detail.ttl,by:detail.by,v:detail.v,st:'review',pv:detail.pv,g:selected.g||detail.g,img:directionGeneratedCover(sourceDirection),
   ex:`已按「${selected.t.replace(/^方向[一二三]：/,'')}」完成详情页内容与图片生成，完整规划表共 ${selected.plan.length} 屏。`,
   vals:[{l:'规划表',v:selected.plan.length+' 屏',s:'ok'},{l:'图片规格',v:'8/'+selected.plan.length+' 张',s:'warn'}],flds:detail.flds,nxt:detail.nxt,
   sub:[...(selected.sub||[]),...(detail.sub||[])],directionOption:{...selected},directionHistory,planRows:selected.plan,flowStage:'complete'});
  current.arts=current.arts.filter(x=>x.id!=='a4');current.live=null;current.st='review';current.up='刚刚';current.outputCount=1;
  if(current.plan?.steps?.[5])current.plan.steps[5]={l:'生成详情页',m:`A8O 修护精华 30ml · ${selected.plan.length} 屏`,s:'ok',r:'刚刚'};
  if(current.plan?.steps?.[6])current.plan.steps[6]={l:'等待审批后上架',m:'详情页待人工确认',s:'act',r:'待审批'};
  const drawerOpen=S.aid===id&&$('dw')?.classList.contains('on');if(drawerOpen){S.dtab=0;S.oi=null;}
  render();if(drawerOpen)drawDw();syncAppr();toast('详情页图片已生成 · 等待审批');
 },1800);
}
function approveDirection(id,i){
 const [t,a]=findArt(id);if(!a||!a.opts||!a.opts[i])return;
 a.opts[i].s='done';
 if(id==='a1'){
  const complete=a.opts.every(o=>o.s==='done');
  a.st=complete?'done':'review';
  if(t){t.st=complete&&t.arts.every(x=>x.mode==='options'?x.opts.every(o=>o.s==='done'||o.s==='archived'):x.st==='done')?'done':'review';t.up='刚刚';}
  if(t?.plan?.steps?.[2])t.plan.steps[2]={...t.plan.steps[2],m:complete?'3 个方向全部批准':'已批准 '+a.opts.filter(o=>o.s==='done').length+' / '+a.opts.length,s:complete?'ok':'act',r:complete?'已完成':'待审批'};
 }
 if(id==='a4-direction'&&a.opts.every(o=>o.s==='done')){
  a.st='done';
  if(t?.arts?.every(x=>x.mode==='options'?x.opts.every(o=>o.s==='done'||o.s==='archived'):x.st==='done'))t.st='done';
 }
 const complete=id==='a1'&&a.opts.every(o=>o.s==='done');
 render();drawDw();toast(complete?'3 个方向全部批准 · 可同步到活动':'已批准方向'+['一','二','三'][i]+' · 其他方向保持不变');
}
function activityPlanSource(){
 const [,a]=findArt('a2');return a?.plans?.[0]||null;
}
function dActivityPlanPreview(){
 const p=activityPlanSource();
 return p?activityPlanAccordion(p):'<div class="empty">活动策划内容暂不可用</div>';
}
function startActivityPlanGeneration(id,i){
 const [,a]=findArt(id);if(!a||!a.opts||!a.opts[i])return;
 const key=id+':'+i;if(S.activityPlanGenerating===key)return;
 S.activityPlanGenerating=key;drawDw();
 setTimeout(()=>{
  const [,current]=findArt(id),o=current?.opts?.[i];if(!o)return;
  o.activityPlanReady=true;o.activityPlanApproved=false;S.activityPlanGenerating=null;S.planSections={0:true};render();
  if(S.aid===id&&detailDirectionIndex(current)===i){S.dtab=0;drawDw();}
  toast('当前活动策划已生成');
 },2000);
}
function approveActivityPlan(id,i){
 const [t,a]=findArt(id),o=a?.opts?.[i],p=activityPlanSource();if(!o?.activityPlanReady)return;
 o.s='done';o.activityPlanApproved=true;if(p)p.s='done';
 const [,source]=findArt('a2');if(source)source.st='done';
 const complete=a.opts.every(item=>item.s==='done');a.st=complete?'done':'review';
 if(t){t.st=complete&&t.arts.every(x=>x.mode==='options'?x.opts.every(item=>item.s==='done'||item.s==='archived'):x.st==='done')?'done':'review';t.up='刚刚';}
 if(t?.plan?.steps?.[2])t.plan.steps[2]={...t.plan.steps[2],m:complete?'3 个方向全部批准':'已批准 '+a.opts.filter(item=>item.s==='done').length+' / '+a.opts.length,s:complete?'ok':'act',r:complete?'已完成':'待审批'};
 render();drawDw();toast(complete?'3 个方向全部批准 · 可同步到活动':'活动策划已批准 · 其他方向保持不变');
}
function directionPlanRows(i){
 const variants=[
  ['成分证据先行','核心成分建立专业认知','为什么它能修护敏感屏障'],
  ['场景痛点渐进式','从换季敏感进入真实需求','让用户先看见自己的肌肤问题'],
  ['功效对比转化型','用状态差异抓住注意力','先展示结果，再解释结果从何而来']
 ];
 const v=variants[i]||variants[0];
 return [
  {screen:'第一屏',module:'首屏 KV',title:v[0],subtitle:v[1],points:'产品定位、核心承诺、活动识别',product:'包含产品',subject:'产品主体置于画面中心，建立第一视觉焦点；背景保持克制，为标题与核心利益点留出空间。',assist:'极简图标、轻微发光的数据节点、收纳盒轮廓、柔和秩序感光晕',style:'以石墨蓝灰为主色，背景用浅暖灰到雾霾米白渐变，局部点缀柔和蓝绿光，整体偏编辑感与轻科技秩序风。'},
  {screen:'第二屏',module:'痛点引入',title:'肌肤状态不是固定的',subtitle:v[2],points:'干燥、泛红、紧绷、换季波动',product:'不包含产品',subject:'用真实生活场景呈现敏感状态，让用户快速产生代入感，并为后续解决方案建立问题背景。',assist:'短标签式痛点词、成分表碎片、购物车清单、日程提醒图标',style:'浅暖灰与柔米白为底，局部用石墨蓝灰描边信息模块，少量香槟金用于强调秩序缺失与待整理感。'},
  {screen:'第三屏',module:'核心卖点',title:'少研究，也能坚持的修护方案',subtitle:'把有效修护变成日常习惯',points:'温和、稳定、持续使用',product:'产品作为辅助元素出现',subject:'以肌肤细节和简洁卖点标签为主，产品在画面侧边作为证据与识别，不抢夺信息主体。',assist:'对比箭头、简洁清单卡、收纳格、少量状态关键词图标',style:'采用深浅对比构图，左侧偏冷灰杂乱感，右侧偏雾白与香槟金秩序感，整体保持高级克制。'},
  {screen:'第四屏',module:'技术机制',title:'形成管理闭环',subtitle:'从理解到调整更贴近日常节奏',points:'测评理解、日常记录、阶段调整',product:'产品作为辅助元素出现',subject:'用路径图解释修护机制，四个节点依次呈现，产品作为辅助元素连接技术说明。',assist:'步骤编号、聊天气泡、反馈曲线卡、规则说明小图标',style:'石墨蓝灰线性流程配合雾白背景，节点处用柔雾香槟金提亮，风格偏理性信息图与轻科技服务感。'},
  {screen:'第五屏',module:'实验数据',title:'修护变化有迹可循',subtitle:'用数据补足可信证据',points:'实验周期、关键指标、结果说明',product:'不包含产品',subject:'以克制的数据图表和肌肤对比为主体，突出可验证的变化，避免夸张功效表达。',assist:'曲线图、数据标注、前后对比框、实验周期刻度',style:'雾白背景搭配石墨蓝灰数据线，蓝绿色用于正向变化，整体保持实验室式清晰、可信与克制。'},
  {screen:'第六屏',module:'使用场景',title:'把修护放回真实生活',subtitle:'早晚都能自然融入护肤步骤',points:'换季、熬夜、空调房、出差',product:'包含产品',subject:'展示卧室、洗手台或出行场景，产品自然出现于真实使用环境中。',assist:'毛巾、镜子、收纳包、晨晚时间标识',style:'自然日光与浅暖灰空间为主，产品保持真实质感，少量柔蓝阴影强化清洁、安静的生活方式氛围。'},
  {screen:'第七屏',module:'人群适配',title:'更适合这些肌肤状态',subtitle:'明确边界，比泛泛而谈更可信',points:'敏感肌、屏障脆弱、干燥紧绷',product:'不包含产品',subject:'多人群生活化拼图，突出不同肤质与状态，统一画面色调和真实质感。',assist:'人物卡片、状态标签、肤质关键词、轻量勾选图标',style:'低饱和肤色与雾白背景统一拼图，标签使用石墨蓝灰，整体自然真实，不过度磨皮。'},
  {screen:'第八屏',module:'使用方法',title:'步骤尽量简单',subtitle:'固定一勺，更容易养成习惯',points:'用量、顺序、频次、注意事项',product:'包含产品',subject:'用分步动作展示取用、涂抹与吸收过程，产品作为持续主体出现。',assist:'步骤编号、动作箭头、用量示意、早晚频次图标',style:'浅灰白背景配合清晰分步构图，动作路径用柔蓝线条连接，保持教程式简洁与易读。'},
  {screen:'第九屏',module:'规格与权益',title:'会场组合一次看清',subtitle:'规格、赠品与价格信息集中呈现',points:'30ml、赠品、会场价、到手权益',product:'包含产品',subject:'产品组合整齐陈列，重要规格与权益信息按阅读优先级分层展示。',assist:'规格标签、权益卡片、价格层级、会场识别标记',style:'雾白商品陈列搭配石墨蓝灰信息卡，香槟金强调权益和价格，整体清晰而不促销感过重。'},
  {screen:'第十屏',module:'品牌收口',title:'让稳定成为日常',subtitle:'A8OPARIS 修护精华',points:'品牌主张、购买行动、服务说明',product:'包含产品',subject:'以品牌主张和产品英雄图完成收口，保留明确的购买行动区域。',assist:'品牌标识、CTA、服务承诺图标、柔和光晕',style:'深石墨蓝灰与雾白形成稳定收口，产品使用柔和轮廓光，CTA 以克制蓝绿色突出，保持品牌高级感。'}
 ];
}
function ensureDirectionPlan(a,i){
 const o=a.opts[i],sourceIndex=Number.isInteger(o.originalIndex)?o.originalIndex:i;if(!o.plan)o.plan=directionPlanRows(sourceIndex);
 o.planReady=true;return o.plan;
}
function startDirectionPlanGeneration(id,i){
 const [,a]=findArt(id);if(!a||!a.opts||!a.opts[i])return;
 const key=id+':'+i;if(S.directionPlanGenerating===key)return;
 S.directionPlanGenerating=key;drawDw();
 setTimeout(()=>{
  const [,current]=findArt(id);if(!current||!current.opts||!current.opts[i])return;
  ensureDirectionPlan(current,i);S.directionPlanGenerating=null;render();
  if(S.aid===id&&detailDirectionIndex(current)===i){S.dtab=0;drawDw();}
  toast('当前规划表已生成');
 },2000);
}
function openDirectionPlan(id,i){
 const [,a]=findArt(id);if(!a||!a.opts||!a.opts[i])return;
 const o=a.opts[i],rows=ensureDirectionPlan(a,i);render();drawDw();
 $('mod').innerHTML=`<div class="mbox direction-plan-modal">
  <div class="direction-plan-head"><h3>详情图规划表</h3><span class="chip plat">天猫</span>
   <span class="meta">A8O 修护精华 · ${rows.length} 屏 · 生成前可编辑</span>
   <button class="ib close" onclick="closeMod()" title="关闭">×</button></div>
  <div class="direction-plan-body"><div class="direction-plan-grid">
   <div class="direction-plan-row head">${['屏幕','模块名称','主标题','副标题','其他卖点','包含产品','画面主体','辅助元素','色彩与风格','操作'].map(x=>`<div class="direction-plan-cell">${x}</div>`).join('')}</div>
   ${rows.map((r,j)=>directionPlanRow(id,i,j,r)).join('')}
  </div></div>
  <div class="mft direction-plan-foot"><button class="btn ghost" onclick="closeMod();toast('规划表已保存')">完成</button>
   <button class="btn" onclick="closeMod();generateDirectionImages('${id}',${i})">生成详情图</button></div>
 </div>`;
 $('mod').classList.add('on','plan-mode');
}
function previewDetailPlan(){
 const [,a]=findArt('a4-direction'),[,detail]=findArt('a4');if(!a||!a.opts)return;
 const selected=detail&&Number.isInteger(detail.sourceDirection)?detail.sourceDirection:a.opts.findIndex(o=>o.s==='done');
 openDirectionPlan(a.id,selected<0?0:selected);
}
function downloadDirectionPlan(id,i){
 const [,a]=findArt(id),o=a?.opts?.[i],rows=o?.plan||directionPlanRows(i);
 const fields=[['screen','屏幕'],['module','模块名称'],['title','主标题'],['subtitle','副标题'],['points','其他卖点'],['product','包含产品'],['subject','画面主体'],['assist','辅助元素'],['style','色彩与风格']];
 const data=[fields.map(([,label])=>label),...rows.map(row=>fields.map(([key])=>row[key]||''))];
 const csv='\uFEFF'+data.map(row=>row.map(value=>'"'+String(value).replace(/"/g,'""')+'"').join(',')).join('\r\n');
 const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');
 link.href=url;link.download=(o?.t||'详情图规划表')+'.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),10000);toast('已开始下载规划表');
}
function directionPlanRow(id,i,j,r){
 const products=['包含产品','产品作为辅助元素出现','不包含产品'];
 return `<div class="direction-plan-row">
  <div class="direction-plan-cell screen">${esc(r.screen)}</div>
  <div class="direction-plan-cell module"><input value="${esc(r.module)}" onchange="setDirectionPlanField('${id}',${i},${j},'module',this.value)"></div>
  <div class="direction-plan-cell"><textarea rows="3" onchange="setDirectionPlanField('${id}',${i},${j},'title',this.value)">${esc(r.title)}</textarea></div>
  <div class="direction-plan-cell"><textarea rows="3" onchange="setDirectionPlanField('${id}',${i},${j},'subtitle',this.value)">${esc(r.subtitle)}</textarea></div>
  <div class="direction-plan-cell"><textarea rows="3" onchange="setDirectionPlanField('${id}',${i},${j},'points',this.value)">${esc(r.points)}</textarea></div>
  <div class="direction-plan-cell"><select class="product-state-select ${detailProductClass(r.product)}" onchange="setDirectionPlanField('${id}',${i},${j},'product',this.value);this.className='product-state-select '+detailProductClass(this.value)">${products.map(x=>`<option ${x===r.product?'selected':''}>${x}</option>`).join('')}</select></div>
  <div class="direction-plan-cell"><textarea rows="5" onchange="setDirectionPlanField('${id}',${i},${j},'subject',this.value)">${esc(r.subject)}</textarea></div>
  <div class="direction-plan-cell"><textarea rows="5" onchange="setDirectionPlanField('${id}',${i},${j},'assist',this.value)">${esc(r.assist||'')}</textarea></div>
  <div class="direction-plan-cell"><textarea rows="5" onchange="setDirectionPlanField('${id}',${i},${j},'style',this.value)">${esc(r.style||'')}</textarea></div>
  <div class="direction-plan-cell"><button class="delete" onclick="deleteDirectionPlanRow('${id}',${i},${j})">删除</button></div>
 </div>`;
}
function setDirectionPlanField(id,i,j,key,value){
 const [,a]=findArt(id);if(!a)return;
 if(a.m1&&a.planRows&&a.planRows[j]){a.planRows[j][key]=value;return;}
 if(!a.opts||!a.opts[i]||!a.opts[i].plan||!a.opts[i].plan[j])return;
 a.opts[i].plan[j][key]=value;
}
function deleteDirectionPlanRow(id,i,j){
 const [,a]=findArt(id);if(!a||!a.opts||!a.opts[i]||!a.opts[i].plan)return;
 a.opts[i].plan.splice(j,1);openDirectionPlan(id,i);toast('已删除该屏规划');
}
function generateDirectionImages(id,i){
 const [,a]=findArt(id);if(!a||!a.opts||!a.opts[i])return;
 const key=id+':'+i;if(S.directionImagesGenerating===key)return;
 S.directionImagesGenerating=key;drawDw();
 setTimeout(()=>{
  const [,current]=findArt(id);if(!current||!current.opts||!current.opts[i])return;
  const o=current.opts[i];
  // Direct image generation still creates the planning data behind the scenes.
  ensureDirectionPlan(current,i);
  o.imagesGenerated=true;o.s='review';S.detailImagesComplete=true;S.directionImagesGenerating=null;render();
  if(S.aid===id&&detailDirectionIndex(current)===i){S.dtab=0;drawDw();}
  toast('方向'+['一','二','三'][i]+' · 详情图已生成，等待批准');
 },2000);
}

/* ---- option-set drawer ---- */
function dSeoDirection(a,i){
 const o=a.opts[i],questions=o.questions||[],angles=o.angles||[];
 return `<div class="seo-direction-detail">
  <div class="fld"><label>选题名称</label><input value="${esc(o.t)}" oninput="updateSeoDirectionField('${a.id}',${i},'t',this.value)"></div>
  <div class="fld"><label>选题说明</label><textarea rows="5" oninput="updateSeoDirectionField('${a.id}',${i},'e',this.value)">${esc(o.e)}</textarea></div>
  <section class="seo-direction-section"><div class="seo-direction-section-title">覆盖问题 <span>· ${questions.length} 个</span></div><div class="seo-direction-chips">${questions.map(q=>`<span>${esc(q)}</span>`).join('')}</div></section>
  <section class="seo-direction-section"><div class="seo-direction-section-head"><div><div class="seo-direction-section-title">文章角度 <span>· 每篇写什么</span></div><p>同一选题可拆成不同角度，生成文章时将按这里的内容组织结构。</p></div><div class="seo-direction-tools"><button class="btn ghost sm" onclick="addSeoDirectionAngle('${a.id}',${i})">＋ 加一篇</button><button class="btn ghost sm" onclick="helpSplitSeoAngles('${a.id}',${i})">帮我拆角度</button></div></div>
   <div class="seo-direction-angles">${angles.map((x,j)=>`<div class="seo-direction-angle"><span>#${j+1}</span><textarea rows="2" placeholder="填写这篇文章的写作角度" onfocus="selectSeoDirectionAngle('${a.id}',${i},${j})" oninput="updateSeoDirectionAngle('${a.id}',${i},${j},this.value)">${esc(x)}</textarea><button class="ib" title="删除这个角度" onclick="removeSeoDirectionAngle('${a.id}',${i},${j})" ${angles.length<=1?'disabled':''}>×</button></div>`).join('')}</div>
  </section>
 </div>`;
}
function updateSeoDirectionField(aid,i,key,value){const [,a]=findArt(aid),o=a?.opts?.[i];if(!o)return;o[key]=value;o.edited=true;}
function updateSeoDirectionAngle(aid,i,j,value){const [,a]=findArt(aid),o=a?.opts?.[i];if(!o?.angles)return;o.angles[j]=value;o.edited=true;}
function selectSeoDirectionAngle(aid,i,j){const [,a]=findArt(aid),o=a?.opts?.[i];if(o)o.activeAngle=j;}
function addSeoDirectionAngle(aid,i){const [,a]=findArt(aid),o=a?.opts?.[i];if(!o)return;o.angles=o.angles||[];o.angles.push('填写这篇文章的写作角度');o.activeAngle=o.angles.length-1;o.edited=true;drawDw();}
function removeSeoDirectionAngle(aid,i,j){const [,a]=findArt(aid),o=a?.opts?.[i];if(!o?.angles||o.angles.length<=1)return;o.angles.splice(j,1);o.activeAngle=Math.min(o.activeAngle??0,o.angles.length-1);o.edited=true;drawDw();}
function helpSplitSeoAngles(aid,i){
 const [,a]=findArt(aid),o=a?.opts?.[i];if(!o)return;
 const suggestions=[
  ['面向不了解中国平台的读者，做一篇主要平台与使用场景的入门综述','从美国品牌进入中国市场的决策路径，说明如何选择第一站','按认知、种草、转化和留存阶段给出平台组合'],
  ['按用户、人群、内容形式和商业能力横向比较主要平台','制作平台选择矩阵，帮助品牌按业务目标匹配渠道','说明中国社媒与欧美平台在使用场景上的关键差异'],
  ['从业务目标出发搭建平台、内容与转化的完整框架','拆解内容本地化与达人合作的执行步骤','用指标体系和阶段复盘形成可持续的增长计划']
 ];
 const angleIndex=Math.max(0,Math.min(o.angles.length-1,o.activeAngle??0)),pool=suggestions[i]||suggestions[0];
 const current=pool.indexOf(o.angles[angleIndex]),next=current<0?0:(current+1)%pool.length;
 o.angles[angleIndex]=pool[next];o.activeAngle=angleIndex;o.edited=true;drawDw();toast(`已更新第 ${angleIndex+1} 篇的文章角度`);
}
function seoDirectionFooter(a,i){
 const o=a.opts[i];
 if(a.drawerReturning)return drawerReturnEditor(a);
 if(o.s==='done')return `<span class="st done">已选择</span><button class="rvb ${S.pc?'on':''}" onclick="toggleDirectionComment()">评论 ${subCount(o)?`<span class="n">${subCount(o)}</span>`:''}</button>`;
 if(o.s==='archived')return `<span class="st archived">未选择</span>`;
 return `<button class="btn" onclick="optAct('${a.id}',${i},1)">批准</button><button class="btn ghost" onclick="startDrawerReturn('${a.id}')">退回</button><button class="rvb ${S.pc?'on':''}" onclick="toggleDirectionComment()">评论 ${subCount(o)?`<span class="n">${subCount(o)}</span>`:''}</button>`;
}
function dOpts(a){
 return `<div class="note" style="margin-bottom:var(--sp-3)">${a.seoFlow?'选择一个 SEO 内容方向后生成文章；三个方向互斥，只能选择一个。':a.hideChoice?'生成详情页前先确认一个叙事方向；方向确定后，页面结构、卖点顺序与图片提示词都沿用该方向。':'这是一个「三选一」产出组。批准其中一个即成为交付物，其余自动归档——不需要分别退回。'}</div>
 ${a.opts.map((o,i)=>`<div class="pk" style="margin-bottom:var(--sp-3);${o.s==='done'?'border-color:var(--green)':''}">
   <div class="pk-h"><span class="ty">方向 ${['一','二','三'][i]}</span><span class="st ${o.s}">${o.s==='done'?'已批准':o.s==='archived'?'已归档':'待审批'}</span></div>
   <div style="display:flex;gap:var(--sp-3);padding:var(--sp-3)">
     <div class="pv sq" style="${grad(o.g[0],o.g[1])};width:78px;height:78px;flex:0 0 78px"></div>
     <div style="flex:1;min-width:0"><div style="font-size:var(--fs-md);font-weight:600;margin-bottom:var(--sp-1)">${esc(o.t)}</div>
       <div style="font-size:var(--fs-sm);color:var(--t2);line-height:1.6">${esc(o.e)}</div></div>
   </div>
   <div class="vals"><span class="val ok">✓ 禁用词</span><span class="val ok">✓ 字数 <span class="m">412/1000</span></span><span class="val ok">✓ 调性匹配</span></div>
   <div class="pk-a">
     ${o.s==='review'?`<button class="btn sm" onclick="${a.seoFlow?`optAct('${a.id}',${i},1)`:`toast('已批准方向${['一','二','三'][i]}');closeDw()`}">选这个</button>
       ${a.hideChoice?'':`<button class="btn ghost sm" onclick="toast('已归档')">归档</button>`}`:''}
     <button class="rvb ${S.oo===i?'on':''}" onclick="toggleOpt(${i})">评论
       ${subCount(o)?`<span class="n">${subCount(o)}</span>`:''}
       ${S.oo===i?'▴':'▾'}</button></div>
   ${S.oo===i?`<div style="padding:0 11px 12px">${subPane(a,i)}</div>`:''}
   ${o.s==='done'?(a.hideChoice?`<div class="nxt"><span class="lb">接下来</span><button class="na" onclick="toast('详情页已按该方向生成')">查看详情页 v4 →</button></div>`:`<div class="nxt"><span class="lb">接下来</span><button class="na" onclick="toast('已在同一线程中新增步骤：生成正文')">生成正文 →</button>
      <button class="na" onclick="toast('已在同一线程中新增步骤：生成视频版')">生成视频版 →</button>
      <button class="na" onclick="toast('已在同一线程中新增步骤：改写到抖音')">改写到抖音 →</button></div>`):''}
 </div>`).join('')}`;
}


/* ---- creator record (pushed panel) ---- */
function openCreator(i){S.cr=i;S.crtab=0;S.creatorCollab=null;drawDw();}
function backCreator(){S.cr=null;S.crtab=0;S.creatorCollab=null;drawDw();}
function creatorProfile(r,i){
 const contacts=[
  ['138 1826 7309','xiaolu_cd'],
  ['136 5719 2048','baitao_daily'],
  ['159 2108 6617','minyan_guide'],
  ['135 7480 3921','may_skincare'],
  ['186 0127 5506','chengfen_notes']
 ][i%5];
 if(i===0)return {n:'小鹿在成都',plat:'小红书',id:'ID: 11671401034',updated:'2026-08-03',tags:['时尚','运动健身','日系','教程','vlog','ootd'],
   phone:contacts[0],wechat:contacts[1],
   f:'3.6万',eng:'10.4%',score:65,peer:'超过 72% 的同类目博主',pic:'¥600',video:'¥850',active:'91.4%',ifan:'4.2%',intent:'42.7%',
   risk:'缺少受众数据和帖子样本，导致多项检查结果为 INCOMPLETE。'};
 return {n:r.n,plat:(CSRC[r.src||'xhs']||{}).n||'小红书',id:r.h,updated:'—',tags:r.tags||[],f:r.f,eng:r.eng,
   phone:contacts[0],wechat:contacts[1],
   score:r.m,peer:'本次画像匹配参考',pic:r.p,video:'—',active:'—',ifan:'—',intent:'—',risk:r.flag||null};
}
function creatorContactRows(p){
 return `<div class="creator-info-table">
  <div><span>联系方式</span><b>${esc(p.phone)}</b><i></i><span>微信号</span><b>${esc(p.wechat)}</b></div>
 </div>`;
}
function creatorContents(r,i){
 if(i!==0)return [];
 return [
  {t:'终于懂了：精致感，是从脖子往下蔓延的',like:501,fav:136,cmt:9,cost:800,date:'2026-04-22'},
  {t:'终于懂了：精致感，是从脖子往下蔓延的',like:501,fav:136,cmt:9,cost:122,date:'2026-04-22'},
  {t:'打工人续命水🔥熬夜外卖党直接抄作业版',like:546,fav:294,cmt:33,cost:360,date:'2026-04-30'},
  {t:'敏肌舒缓第一步：丢掉你的普通喷雾',like:287,fav:175,cmt:0,cost:500,date:'2026-06-17'}
 ];
}
function creatorRecentContents(r,i){
 if(i!==0)return [];
 return [
  {t:'成都换季急救实录：泛红期我只做这三步',like:684,fav:229,cmt:31,cost:680,date:'2026-07-28'},
  {t:'预算有限也能养稳皮肤，我最近坚持的晚间清单',like:512,fav:301,cmt:26,cost:520,date:'2026-07-19'},
  {t:'连续 7 天不加滤镜，敏感肌状态到底变了多少',like:873,fav:418,cmt:47,cost:760,date:'2026-07-08'},
  {t:'成都通勤人的夏日护肤包，轻装但每样都用得完',like:396,fav:184,cmt:18,cost:480,date:'2026-06-26'}
 ];
}
function creatorCollabs(r,i){
 if(i===0)return [{name:'11.11 敏感肌真实测评合作',brand:'A80 Paris',period:'2026-08-03 ~ 2026-08-04',video:0,post:6,cost:'¥140',status:'已结束'}];
 return (r.hist||[]).map(h=>({name:h[0],brand:h[1],period:h[0],video:0,post:1,cost:'—',status:'已结束'}));
}
function creatorCollabArticles(r,i,collabIndex){
 if(i===0&&collabIndex===0)return [
  {title:'敏感肌换季急救：我的三步修护流程',date:'2026-08-03',type:'图文',like:684,fav:229,cmt:31,cost:24},
  {title:'精华不是越厚越好，屏障期这样用更舒服',date:'2026-08-03',type:'图文',like:512,fav:301,cmt:26,cost:24},
  {title:'连续 7 天真实记录：泛红状态的变化',date:'2026-08-03',type:'图文',like:873,fav:418,cmt:47,cost:23},
  {title:'通勤包里的敏感肌修护搭子',date:'2026-08-04',type:'图文',like:396,fav:184,cmt:18,cost:23},
  {title:'熬夜后不叠太多层，我只保留这一步',date:'2026-08-04',type:'图文',like:438,fav:207,cmt:22,cost:23},
  {title:'11.11 回购清单：修护精华真实使用感',date:'2026-08-04',type:'图文',like:751,fav:366,cmt:39,cost:23}
 ];
 return creatorContents(r,i).map(x=>({title:x.t,date:x.date,type:'图文',like:x.like,fav:x.fav,cmt:x.cmt,cost:x.cost}));
}
function openCreatorCollab(index){S.creatorCollab=index;drawDw();}
function backCreatorCollabs(){S.creatorCollab=null;drawDw();}
function dCreatorCollabs(r,i){
 const rows=creatorCollabs(r,i);
 return rows.length?`<div class="collab-list">${rows.map(x=>`<div class="collab-card">
   <div class="collab-card-head"><button class="collab-card-name" onclick="openCreatorCollab(${rows.indexOf(x)})">${esc(x.name)}</button><span class="collab-status">${x.status}</span></div>
   <div class="collab-card-meta"><span>关联品牌 <b>${esc(x.brand)}</b></span><span>合作周期 <b>${esc(x.period)}</b></span></div>
   <div class="collab-card-grid"><div><div class="l">视频交付</div><div class="v">${x.video}</div></div><div><div class="l">图文交付</div><div class="v">${x.post}</div></div><div><div class="l">合作花费</div><div class="v">${x.cost}</div></div></div>
   <div class="collab-card-foot"><span class="odot on"></span><span>本次共交付 <b>${(Number(x.video)||0)+(Number(x.post)||0)} 条内容</b></span></div>
  </div>`).join('')}</div>`:'<div class="empty"><div class="h">首次合作，无历史记录</div></div>';
}
function dCreatorCollabDetail(r,i,index){
 const collab=creatorCollabs(r,i)[index];if(!collab){S.creatorCollab=null;return dCreatorCollabs(r,i);}
 const articles=creatorCollabArticles(r,i,index),sum=key=>articles.reduce((total,item)=>total+(Number(item[key])||0),0);
 return `<div class="creator-collab-detail">
  <button class="creator-collab-back" onclick="backCreatorCollabs()"><i data-lucide="arrow-left"></i><span>返回合作记录</span></button>
  <section class="creator-collab-overview">
   <div class="creator-collab-title"><div><span>合作记录</span><h4>${esc(collab.name)}</h4></div><span class="collab-status">${esc(collab.status)}</span></div>
   <div class="collab-card-meta"><span>关联品牌 <b>${esc(collab.brand)}</b></span><span>合作周期 <b>${esc(collab.period)}</b></span></div>
   <div class="collab-card-grid"><div><div class="l">视频交付</div><div class="v">${collab.video}</div></div><div><div class="l">图文交付</div><div class="v">${collab.post}</div></div><div><div class="l">合作花费</div><div class="v">${esc(collab.cost)}</div></div></div>
  </section>
  <section class="creator-collab-performance">
   <div class="creator-collab-section-head"><h4>合作数据</h4><span>共 ${articles.length} 篇内容</span></div>
   <div class="creator-collab-metrics">${[['点赞',sum('like').toLocaleString()],['收藏',sum('fav').toLocaleString()],['评论',sum('cmt').toLocaleString()]].map(item=>`<div><span>${item[0]}</span><b>${item[1]}</b></div>`).join('')}</div>
  </section>
  <section class="creator-collab-articles">
   <div class="creator-collab-section-head"><h4>文章列表</h4><span>${articles.length} 篇</span></div>
   <div class="content-list creator-collab-article-list">${articles.map(article=>`<article class="content-item">
    <div class="content-item-head"><div class="content-title">${esc(article.title)}</div><span class="content-actions"><button title="查看文章" aria-label="查看文章" onclick="toast('查看文章')"><i data-lucide="external-link"></i></button></span></div>
    <div class="content-meta"><span>点赞 <b style="color:#F43F5E">${article.like}</b></span><span>收藏 <b style="color:#D97706">${article.fav}</b></span><span>评论 <b style="color:#2563EB">${article.cmt}</b></span><span>花费 <b style="color:var(--t1)">¥${article.cost}</b></span><span class="content-date">更新于 ${esc(article.date)}</span></div>
   </article>`).join('')}</div>
  </section>
 </div>`;
}
function dCreatorContent(r,i){
 const rows=creatorContents(r,i),sum=k=>rows.reduce((n,x)=>n+x[k],0);
 return `<div class="content-summary">
   ${[['累计点赞',sum('like').toLocaleString()],['累计收藏',sum('fav').toLocaleString()],['累计评论',sum('cmt').toLocaleString()],['花费金额','¥'+sum('cost').toLocaleString()]].map(x=>`<div class="box"><div class="l">${x[0]}</div><div class="v">${x[1]}</div></div>`).join('')}
  </div>
  ${rows.length?`<div class="content-list">${rows.map((x,j)=>`<div class="content-item">
    <div class="content-item-head"><div class="content-title">${esc(x.t)}</div><span class="content-actions"><button title="查看" onclick="toast('查看内容')">↗</button><button title="编辑" onclick="toast('编辑内容数据')">✎</button><button title="删除" onclick="toast('删除内容数据')">×</button></span></div>
    <div class="content-meta"><span>点赞 <b style="color:#F43F5E">${x.like}</b></span><span>收藏 <b style="color:#D97706">${x.fav}</b></span><span>评论 <b style="color:#2563EB">${x.cmt}</b></span><span>花费 <b style="color:var(--t1)">¥${x.cost}</b></span><span class="content-date">更新于 ${x.date}</span></div>
   </div>`).join('')}</div>`
   :'<div class="empty"><div class="h">还没有内容数据</div></div>'}`;
}
function dCreatorRecent(r,i){
 const rows=creatorRecentContents(r,i);
 return `<section class="creator-recent"><div class="creator-recent-head"><h4>近期图文数据</h4>${rows.length?`<span class="count">${rows.length} 条</span>`:''}</div>
  ${rows.length?`<div class="creator-recent-list">${rows.map(x=>`<div class="creator-recent-row"><div class="creator-recent-title">${esc(x.t)}</div>
    <div class="creator-recent-meta"><span>点赞 <b style="color:#F43F5E">${x.like}</b></span><span>收藏 <b style="color:#D97706">${x.fav}</b></span><span>评论 <b style="color:#2563EB">${x.cmt}</b></span><span>花费 <b style="color:var(--t1)">¥${x.cost}</b></span><span class="creator-recent-date">更新于 ${esc(x.date)}</span></div></div>`).join('')}</div>`:'<div class="creator-recent-empty">无</div>'}</section>`;
}
function creatorBrandMatches(r,i){
 const shift=Math.max(-12,Math.min(10,(Number(r.m)||82)-86));
 const score=n=>Math.max(36,Math.min(96,n+shift));
 return [
  {id:'a80',n:'A80PARIS',abbr:'A',score:score(i===0?92:86),desc:'敏感肌修护、真实测评、低预算高信任感内容。',acts:[
   {n:'11.11 敏感肌真实测评',date:'2026-08-03 ~ 2026-08-04',score:score(i===0?94:88),note:'内容调性接近真实使用记录，适合承接精华与安瓶的种草沟通。'},
   {n:'9 月屏障修护内容池',date:'2026-08-15 ~ 2026-09-12',score:score(87),note:'粉丝互动稳定，适合补充教程型笔记和评论区答疑。'}]},
  {id:'tru',n:'Tru Niagen',abbr:'T',score:score(65),desc:'抗老与精力管理方向，科学感要求更高。',acts:[
   {n:'618TN 社媒促销活动',date:'2026-06-23 ~ 2026-07-22',score:score(66),note:'平台活跃度达标，但受众与科学营养方向只部分重合。'}]},
  {id:'evo',n:'EVO1.1',abbr:'E',score:score(58),desc:'AI 定制智能营养品牌，定位偏技术与健康管理。',acts:[
   {n:'2026.08.3.3',date:'2026-08-02 ~ 2026-08-03',score:score(61),note:'互动率可用，内容风格需要从生活方式转向营养方案解释。'},
   {n:'中秋活动',date:'2026-07-31 ~ 2026-08-28',score:score(59),note:'节日场景可结合，但品牌心智距离稍远，建议候补。'}]},
  {id:'live',n:'liveSpo',abbr:'L',score:score(63),desc:'益生菌与消化健康方向，适合轻科普内容。',acts:[
   {n:'11.11 电商推广计划',date:'2026-08-06 ~ 2026-09-29',score:score(64),note:'生活方式内容可嫁接，但需补充健康品类可信表达。'}]}
 ];
}
function setCreatorBrandMatch(id){S.creatorMatchBrand=id;drawDw();}
function creatorMatchTone(score){return score>=86?'high':score>=70?'mid':'low';}
function dCreatorBrandMatch(r,i){
 const brands=creatorBrandMatches(r,i);
 const active=brands.find(x=>x.id===(S.creatorMatchBrand||'a80'))||brands[0];
 return `<div class="creator-brand-match">
  <aside class="creator-brand-list">
   <div class="creator-brand-items">${brands.map(b=>`<button class="creator-brand-item ${b.id===active.id?'on':''}" onclick="setCreatorBrandMatch('${b.id}')">
    <span class="creator-brand-avatar">${esc(b.abbr)}</span>
    <span class="creator-brand-copy"><b>${esc(b.n)}</b><small>${esc(b.desc)}</small></span>
    <span class="creator-brand-score ${creatorMatchTone(b.score)}">${b.score}%</span>
   </button>`).join('')}</div>
  </aside>
  <section class="creator-campaign-match">
   <div class="creator-match-head">
    <span class="creator-brand-avatar lg">${esc(active.abbr)}</span>
   <div><h4>${esc(active.n)} 进行中的活动</h4><p>推荐活动方案</p></div>
  </div>
  <div class="creator-match-cards">${active.acts.map(act=>`<article class="creator-match-card">
    <div class="creator-match-card-title"><span>${esc(act.n)}</span><b class="${creatorMatchTone(act.score)}">${act.score}%</b></div>
    <div class="creator-match-date"><span></span>${esc(act.date)}</div>
    <div class="creator-match-note"><b>AI 匹配洞察</b>${esc(act.note)}</div>
    <div class="creator-match-actions">
     <button class="btn sm" onclick="toast('已标记入选候选')">入选</button>
     <button class="btn ghost sm" onclick="toast('已准备生成 Brief')">生成 Brief</button>
     <button class="btn ghost sm" onclick="toast('已标记为淘汰')">淘汰</button>
    </div>
   </article>`).join('')}</div>
  </section>
 </div>`;
}
function dCreator(a,i){
 const r=a.rows[i];
 const p=creatorProfile(r,i);
 const tab=S.crtab||0;
 if(tab===1)return dCreatorContent(r,i);
 if(tab===2)return Number.isInteger(S.creatorCollab)?dCreatorCollabDetail(r,i,S.creatorCollab):dCreatorCollabs(r,i);
 if(tab===3)return `<div style="font-size:var(--fs-xs);font-weight:600;color:var(--t2);margin-bottom:var(--sp-2)">这次合作的沟通</div>${subPane(a,i)}`;
 if(tab===4)return dCreatorBrandMatch(r,i);
 return `<div class="creator-overview">
   <div class="creator-main"><div class="creator-avatar-wrap"><div class="creator-avatar">${esc(p.n.slice(0,1).toUpperCase())}</div><button class="creator-fav creator-fav-float ${isCreatorFav(r,i)?'on':''}" onclick="toggleCreatorFav(${i},event)" aria-label="${isCreatorFav(r,i)?'取消收藏':'收藏'}${esc(p.n)}">★</button></div>
     <div style="min-width:0"><div class="creator-name">${esc(p.n)} <button class="tag" onclick="toast('打开达人主页')">访问主页 ↗</button></div>
       <div class="creator-id">${esc(p.id)}</div>
       <div class="creator-tags">${p.tags.map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div></div></div>
   <div class="creator-topstats"><div class="creator-topstat"><div class="l">粉丝总数</div><div class="v">${p.f}</div></div>
     <div class="creator-topstat"><div class="l">互动率</div><div class="v purple">${p.eng}</div></div></div>
 </div>
 ${creatorContactRows(p)}
 ${p.risk?`<div class="creator-risk"><span class="ic"></span><div><div class="t">AI 校验 · 中风险 <span style="font-weight:400;color:var(--t3);margin-left:var(--sp-2)">${p.updated}</span></div><div class="d">${esc(p.risk)}</div></div></div>`:''}
 <div class="creator-metrics">
   <div class="creator-metric"><div class="l">数据评分</div><div class="v" style="color:var(--orange-fg)">${p.score}</div><div style="font-size:var(--fs-xs);color:var(--t3);margin-top:var(--sp-1)">${p.peer}</div><div class="creator-scorebar"><i style="width:${p.score}%"></i></div></div>
   <div class="creator-metric"><div class="l">图文报价</div><div class="v" style="color:#2563EB">${p.pic}</div></div>
   <div class="creator-metric"><div class="l">视频报价</div><div class="v" style="color:var(--primary)">${p.video}</div></div>
   <div class="creator-metric"><div class="l">活跃粉丝</div><div class="v">${p.active}</div></div>
   <div class="creator-metric"><div class="l">互动粉丝</div><div class="v">${p.ifan}</div></div>
   <div class="creator-metric"><div class="l">下单意向</div><div class="v">${p.intent}</div></div>
 </div>
 ${dCreatorRecent(r,i)}`;
}



/* ---- 客户报告 ---- */
function dRepSecs(a){
 return '<div class="note" style="margin-bottom:var(--sp-3)">报告是<b>装配</b>出来的，不是重算出来的。每一节都标了它引用的是哪条已批准产出——'
  +'这样报告不会和你上个月已经拍板的结论打架。</div>'
  +a.secs.map((x,i)=>'<div class="repsec'+(x.ok?'':' leak')+'">'
   +'<div class="rsh"><span class="rsn">'+(i+1)+'</span>'
   +'<b style="flex:1;font-size:var(--fs-md)">'+esc(x.n)+'</b>'
   +'<span class="chip '+(x.src==='引用'?'lv':'mut')+'">'+x.src+'</span>'
   +(x.ok?'':'<span class="st hold">口径未过</span>')+'</div>'
   +'<div class="rsf">来自 '+esc(x.from)+'</div>'
   +'<div class="rst">'+esc(x.tx)+'</div>'
   +((x.figs||[]).length?'<div class="rsg">'+x.figs.map(f=>'<span class="figc"><b>'+f[0]+'</b> '
     +'<span class="num">'+f[1]+'</span><span class="src">'+f[2]+'</span></span>').join('')+'</div>':'')
   +(x.leak?'<div class="note" style="background:var(--danger-bg);border-color:var(--danger-bd);color:var(--danger-fg-strong);margin:var(--sp-2) 0 0">'
     +'检出内部口径：<b>'+esc(x.leak)+'</b>。客户版本里不能出现——在下面的评论里说一句怎么改。</div>':'')
   +'<div class="rsa"><button class="rvb" onclick="toast(\'仅重生成第 '+(i+1)+' 节，其余不动\')">只重做这一节</button>'
   +'<button class="rvb" onclick="toast(\'已跳到来源\')">看来源 ↗</button></div>'
   +'</div>').join('');
}
function dRepSrc(a){
 const figs=[];a.secs.forEach((x,i)=>(x.figs||[]).forEach(f=>figs.push([i+1,f[0],f[1],f[2]])));
 return '<div class="ctx" style="margin-bottom:var(--sp-3)">'
  +'<div class="ctxr"><span class="k">数字总数</span><span class="v num">18</span></div>'
  +'<div class="ctxr"><span class="k">可溯源</span><span class="v num" style="color:var(--ok-fg)">18 / 18</span></div>'
  +'<div class="ctxr"><span class="k">引用的已批准产出</span><span class="v num">12 条</span></div>'
  +'<div class="ctxr"><span class="k">最旧数据</span><span class="v" style="color:var(--warn-fg)">广告平台 · 3 天前</span></div></div>'
  +'<div style="font-size:var(--fs-xs);font-weight:600;color:var(--t2);margin-bottom:var(--sp-2)">每个数字的来源</div>'
  +figs.map(f=>'<div class="vrow"><span class="vv">§'+f[0]+'</span>'
   +'<span class="vt"><b style="color:var(--t1)">'+f[1]+'</b> <span class="num">'+f[2]+'</span></span>'
   +'<span class="vd">'+f[3]+'</span></div>').join('')
  +'<div class="note" style="margin-top:var(--sp-3)">数字是<b>取回来的，不是模型写的</b>。模型只负责数字之间的叙述。'
  +'取不到的数字会留空并标注，永远不会被编出来。</div>';
}
function dRepAud(a){
 const bad=a.secs.filter(x=>!x.ok);
 return '<div class="note" style="margin-bottom:var(--sp-3)">同一份数据，对内对外说法不同。'
  +'内部阈值、单位成本、出价规则、模型细节<b>不能进客户版本</b>——这条是校验，不是建议。</div>'
  +'<div class="ctx" style="margin-bottom:var(--sp-3)">'
  +'<div class="ctxr"><span class="k">受众</span><span class="v">A80PARIS · 品牌方</span></div>'
  +'<div class="ctxr"><span class="k">口径</span><span class="v">对外 · 不含内部阈值与成本</span></div>'
  +'<div class="ctxr"><span class="k">检出</span><span class="v" style="color:'+(bad.length?'#B91C1C':'#047857')+'">'
  +(bad.length?bad.length+' 节需处理':'全部通过')+'</span></div></div>'
  +(bad.length?bad.map(x=>'<div class="note" style="background:var(--danger-bg);border-color:var(--danger-bd);color:var(--danger-fg-strong);margin-bottom:var(--sp-2)">'
   +'<b>'+esc(x.n)+'</b> — '+esc(x.leak)+'</div>').join(''):'')
  +'<div style="font-size:var(--fs-xs);font-weight:600;color:var(--t2);margin:var(--sp-4) 0 8px">这条规则从哪来</div>'
  +'<div style="font-size:var(--fs-sm);color:var(--t2);line-height:1.7">数据分析页的<b>运营视角 / 品牌方视角</b>就是同一条规则。'
  +'报告是品牌方视角<b>固化下来的一份文件</b>——所以用同一套口径，不另起一套。</div>';
}

/* ---- SEO article ---- */
function seoIntakePeek(a){
 const q=a.seoIntake,status=q.status==='confirmed'?'已确认':q.status==='rejected'?'已拒绝':'待确认';
 return `<div class="pk" id="pk-${a.id}">
  <div class="pk-h"><span class="ty">产出 · 关键词确认</span><span class="st ${q.status==='confirmed'?'done':q.status==='rejected'?'ask':'review'}">${status}</span>${artifactRunLink(a.by)}</div>
  <button class="seo-intake-summary" onclick="openDw('${a.id}')"><span class="seo-intake-verdict"><b>「${esc(a.ttl)}」</b> ${esc(q.fit)}</span><span>${esc(q.summary)}</span><span class="seo-intake-stats">自然结果 ${q.natural} 条 · 文章类页面 ${q.articlePages} 条 · 前 10 位 AI 摘要占据 ${q.topTenAI} 个位置</span></button>
  <div class="pk-a">${q.status==='confirmed'?'<span class="st done">已确认 · 正在生成 3 个方向</span>':q.status==='rejected'?'<span class="st ask">已拒绝</span>':`<button class="btn sm" onclick="confirmSeoIntake('${a.id}')">确认</button><button class="btn ghost sm" onclick="rejectSeoIntake('${a.id}')">拒绝</button>`}<button class="btn ghost sm" onclick="openDw('${a.id}')">查看表单</button><span class="v num">v${a.v} · 刚刚</span></div>
 </div>`;
}
function dSeoIntake(a){
 const q=a.seoIntake;
 return `<div class="seo-intake-panel"><div class="seo-intake-hero"><div class="seo-intake-verdict"><b>「${esc(a.ttl)}」</b><span class="st done">${esc(q.fit)}</span></div><p>${esc(q.summary)}</p></div>
  <div class="seo-intake-metrics"><div><span>有效自然结果</span><b class="num">${q.natural}</b></div><div><span>文章类页面</span><b class="num">${q.articlePages}</b></div><div><span>未分类结果</span><b class="num">${q.uncategorized}</b></div><div><span>前 10 位 AI 摘要</span><b class="num">${q.topTenAI}</b></div></div>
  <div class="seo-intake-market"><span>查询市场</span><b>${esc(q.market)}</b></div>
  <button class="seo-results-toggle" onclick="toggleSeoIntakeResults('${a.id}')" aria-expanded="${!!q.expanded}">${q.expanded?'收起':'展开'}搜索结果（${q.results.length}）<span>${q.expanded?'▴':'▾'}</span></button>
  ${q.expanded?`<div class="seo-result-list">${q.results.map(r=>`<div class="seo-result-row"><span class="num">${esc(r[0])}</span><span>${esc(r[1])}</span><span>${esc(r[2])}</span></div>`).join('')}</div>`:''}</div>`;
}
function seoIntakeFooter(a){const s=a.seoIntake.status;if(s==='confirmed')return '<span class="st done">已确认</span><span style="font-size:var(--fs-sm);color:var(--t2)">正在生成 3 个内容方向…</span>';if(s==='rejected')return '<span class="st ask">已拒绝</span>';return `<button class="btn" onclick="confirmSeoIntake('${a.id}')">确认</button><button class="btn ghost" onclick="rejectSeoIntake('${a.id}')">拒绝</button>`;}
function toggleSeoIntakeResults(id){const [,a]=findArt(id);if(!a?.seoIntake)return;a.seoIntake.expanded=!a.seoIntake.expanded;drawDw();}
function confirmSeoIntake(id){
 const [t,a]=findArt(id);if(!a?.seoIntake)return;
 a.seoIntake.status='confirmed';a.st='done';
 let directions=t.arts.find(x=>x.id==='a-seo-directions');
 if(!directions){
  directions={id:'a-seo-directions',mode:'options',seoFlow:true,ty:'SEO 内容方向',ttl:'Chinese Social media · 内容方向',by:'seo',v:1,st:'review',pv:'none',g:['#93C5FD','#2563EB'],returnLabel:'退回',opts:[
   {t:'方向一：美国品牌进入中国社媒的入门指南',e:'从市场进入决策切入，对比微信、小红书、抖音和微博的角色，帮助美国品牌选择第一站。',g:['#93C5FD','#2563EB'],s:'review',sub:[],questions:['what are chinese social media apps','what social media do chinese use','what is the chinese social media app'],angles:['填写这篇文章的写作角度']},
   {t:'方向二：中国社媒平台与用户场景对比',e:'以平台对照为主线，比较用户人群、内容形态、商业能力和适合的品牌目标。',g:['#C4B5FD','#7C3AED'],s:'review',sub:[],questions:['most popular social media in China','WeChat vs Xiaohongshu','Chinese social media demographics'],angles:['填写这篇文章的写作角度']},
   {t:'方向三：从策略到执行的中国社媒营销框架',e:'围绕目标、平台组合、内容本地化、达人合作与效果衡量，提供可执行的落地框架。',g:['#6EE7B7','#059669'],s:'review',sub:[],questions:['China social media marketing strategy','how to market in China','Chinese influencer marketing'],angles:['填写这篇文章的写作角度']}
  ]};
  t.arts.push(directions);
 }
 t.st='review';t.up='刚刚';
 if(t.plan?.steps){t.plan.steps[0]={l:'确认关键词机会',m:'已确认适合写文章',s:'ok',r:'刚刚'};t.plan.steps[1]={l:'生成内容方向',m:'3 个方向已生成 · 待选择',s:'act',r:'刚刚'};}
 S.aid=directions.id;S.oi=0;S.dtab=0;render();drawDw();toast('已生成 3 个 SEO 内容方向 · 请选择一个');
}
function rejectSeoIntake(id){const [t,a]=findArt(id);if(!a?.seoIntake)return;a.seoIntake.status='rejected';a.st='ask';t.st='ask';t.up='刚刚';if(t.plan?.steps)t.plan.steps[0]={l:'确认关键词机会',m:'已拒绝 · 等待调整关键词',s:'warn',r:'刚刚'};render();drawDw();toast('已拒绝 · 可以调整关键词后重新分析');}
function finishSeoFlowArticle(tid,directionId,i){
 const t=T.find(x=>x.id===tid),a=t?.arts?.find(x=>x.id===directionId);if(!t||!a?.pendingDirection)return;
 const direction=a.pendingDirection;
 let article=t.arts.find(x=>x.id==='a-seo-flow-article');
 if(!article){article=buildSeoFlowArticle(direction,i);t.arts.push(article);}
 article.sourceDirection={t:direction.t,e:direction.e,questions:[...(direction.questions||[])],angles:[...(direction.angles||[])]};
 article.ttl=direction.t.replace(/^方向[一二三]：/,'');article.ex=direction.e;
 article.seoMeta.title=article.ttl;article.out=[['H1',article.ttl],...(direction.angles||[]).map((x,j)=>[`H2 ${j+1}`,x])];
 delete a.pendingDirection;t.live=null;t.st='review';t.up='刚刚';t.outputCount=t.arts.length;
 if(t.plan?.steps)t.plan.steps[3]={l:'生成 SEO 文章',m:'文章已生成 · 待审批',s:'ok',r:'刚刚'};
 if(S.view==='thread'&&S.tid===tid)render();else syncAppr();toast('SEO 文章已生成 · 等待审批');
}
function buildSeoFlowArticle(direction,i){const titles=['How US Brands Can Choose the Right Chinese Social Media Platform','Chinese Social Media Platforms Compared: Users, Content and Commerce','A Practical Chinese Social Media Strategy for Global Brands'];return {id:'a-seo-flow-article',mode:'seq',ty:'SEO 文章',ttl:titles[i],by:'seo',v:1,st:'review',pv:'doc',g:['#93C5FD','#2563EB'],ex:direction.e,img:'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=900&q=85',vals:[{l:'关键词密度',v:'1.8% · 区间 1.5–2.5%',s:'ok'},{l:'重复率',v:'5% · 上限 15%',s:'ok'},{l:'内链',v:'3 条',s:'ok'}],nxt:['发布','同步到活动'],seoMeta:{title:titles[i],description:'A practical guide to Chinese social media platforms, audience behavior and market-entry strategy for US brands.',slug:'chinese-social-media-guide',alt:'Chinese social media platforms and brand marketing guide'},kw:[['Chinese Social media','主词','2,900/月'],['Chinese social media platforms','长尾','1,600/月'],['social media in China','长尾','1,100/月'],['China social media marketing','长尾','720/月'],['WeChat marketing for US brands','长尾','480/月']],faq:[['Which social media platform is most popular in China?','WeChat has the broadest reach, while the right platform depends on the audience and business goal.'],['Can US brands market on Chinese social media?','Yes. Brands should localize content, choose suitable platforms and follow local account and advertising requirements.'],['Should a brand launch on every platform?','No. Start with the one or two platforms that best match the audience, content format and commercial objective.']],out:[['H1',titles[i]],['H2 1','How the Chinese social media ecosystem differs'],['H2 2','Who uses each major platform'],['H2 3','Choose platforms by business goal'],['H2 4','Localize content and operations'],['H2 5','Build a practical launch plan']],sub:[]};}
function dSeo(a){
 if(a.id==='a-seo-flow-article'&&a.sourceDirection){
  const source=a.sourceDirection;
  const sections=(source.angles||[]).map((x,i)=>`${i+1}. ${x}\n围绕这一角度展开论证，并结合 Chinese Social media 的平台特点、用户场景与品牌目标给出具体建议。`).join('\n\n');
  return `<div class="seo-article-toolbar"><span>图片与正文组合预览</span><button class="btn ghost sm" onclick="openSeoArticlePreview('${a.id}')">预览 ↗</button></div>
   <div class="fld"><label>标题</label><input id="seo-article-title" value="${esc(a.ttl)}" oninput="updateSeoArticleDraft('${a.id}','ttl',this.value)"></div>
   <div class="fld"><label>正文</label><textarea id="seo-article-body" rows="13" oninput="updateSeoArticleDraft('${a.id}','body',this.value)">${esc(a.previewBody??`${source.e}\n\n${sections}`)}</textarea></div>
   ${dSeoPublishingFields(a)}`;
 }
 if(a.id==='a-seo-flow-article')return `<div class="fld"><label>标题 <span class="ct">H1</span></label><input value="${esc(a.ttl)}"></div>
 <div class="fld"><label>正文 <span class="ct">1,680 字</span></label><textarea rows="13">Chinese social media is not a single channel. WeChat, Xiaohongshu, Douyin and Weibo serve different audiences, content habits and commercial goals. For a US brand, the right starting point depends on what the business needs to achieve first.

1. Understand how the ecosystem differs
Chinese platforms combine discovery, community, messaging and commerce more tightly than most Western social networks. A market-entry plan should account for the complete user journey.

2. Match the platform to the audience
WeChat supports private-domain communication and retention. Xiaohongshu is strong for product discovery. Douyin offers high-reach video and commerce, while Weibo supports public conversation.

3. Choose by business goal
Brands seeking awareness may prioritize short video and creator reach. Brands that need education and trust can begin with search-friendly lifestyle content.

4. Localize content and operations
Translation alone is not localization. Creative formats, proof points, publishing cadence and community responses should reflect local expectations.

5. Build a focused launch plan
Start with one primary platform and one supporting channel, define measurable goals, test for four to six weeks, and expand after a repeatable pattern appears.</textarea></div>`;
 return `<div class="fld"><label>标题 <span class="ct">H1</span></label><input value="${esc(a.ttl)}"></div>
 <div class="fld"><label>正文 <span class="ct">2,140 字</span></label><textarea rows="13">${esc(a.ex)}

一、先判断你是"敏感"还是"敏感肌"
偶尔泛红和长期屏障受损是两件事。前者换季就好，后者需要系统修护。判断标准很简单：停用所有功效产品两周，如果泛红消失，你只是暂时敏感。

二、三个最常见的踩坑成分
高浓度酸类、高浓度维A、以及部分香精。不是不能用，是不能在屏障没修好的时候用。

三、浓度不是越高越好
（此处为 v2 新增的浓度对照表）

四、建立耐受的 4 周节奏
第 1 周隔天用，第 2 周每天用，第 3 周观察细节变化，第 4 周再考虑叠加。

五、按预算给的选购清单
300 元以下、300–600 元、600 元以上各两个方向。</textarea></div>`;
}
function updateSeoArticleDraft(id,key,value){const [,a]=findArt(id);if(!a)return;if(key==='ttl')a.ttl=value;else a.previewBody=value;}
function dSeoPublishingFields(a){
 const meta=a.seoMeta||{},category=a.publishCategory||'不指定（归入 WordPress 默认分类）';
 return `<section class="seo-publish-fields">
  <div class="seo-publish-category"><label>发布分类 <span>读取自站点当前分类</span></label><select required onchange="updateSeoPublishCategory('${a.id}',this.value)"><option ${category.startsWith('不指定')?'selected':''}>不指定（归入 WordPress 默认分类）</option><option ${category==='市场洞察'?'selected':''}>市场洞察</option><option ${category==='社交媒体营销'?'selected':''}>社交媒体营销</option><option ${category==='中国市场指南'?'selected':''}>中国市场指南</option></select></div>
  <button class="seo-more-settings" onclick="toggleSeoMoreSettings('${a.id}')" aria-expanded="${!!a.seoSettingsOpen}"><span>更多设置</span><b>${a.seoSettingsOpen?'收起 SEO 元数据':'SEO 元数据'}</b><i>${a.seoSettingsOpen?'▴':'▾'}</i></button>
  ${a.seoSettingsOpen?`<div class="seo-meta-editor"><div class="seo-meta-editor-head"><b>SEO 元数据</b></div>
   <div class="seo-meta-edit-field"><label>Meta Title <span class="seo-field-count">${(meta.title||'').length} / 60</span></label><input maxlength="60" value="${esc(meta.title||'')}" oninput="updateSeoMetaField('${a.id}','title',this.value);this.previousElementSibling.querySelector('.seo-field-count').textContent=this.value.length+' / 60'"></div>
   <div class="seo-meta-edit-field"><label>Meta Description <span class="seo-field-count">${(meta.description||'').length} / 160</span></label><textarea rows="3" maxlength="160" oninput="updateSeoMetaField('${a.id}','description',this.value);this.previousElementSibling.querySelector('.seo-field-count').textContent=this.value.length+' / 160'">${esc(meta.description||'')}</textarea></div>
   <div class="seo-meta-edit-grid"><div class="seo-meta-edit-field"><label>URL 别名</label><input value="${esc(meta.slug||'')}" oninput="updateSeoMetaField('${a.id}','slug',this.value)"></div><div class="seo-meta-edit-field"><label>图片 ALT</label><input value="${esc(meta.alt||'')}" oninput="updateSeoMetaField('${a.id}','alt',this.value)"></div></div>
  </div>`:''}
 </section>`;
}
function updateSeoPublishCategory(id,value){const [,a]=findArt(id);if(a)a.publishCategory=value;}
function toggleSeoMoreSettings(id){const [,a]=findArt(id);if(!a)return;a.seoSettingsOpen=!a.seoSettingsOpen;drawDw();}
function updateSeoMetaField(id,key,value){const [,a]=findArt(id);if(!a)return;a.seoMeta=a.seoMeta||{};a.seoMeta[key]=value;}
function openSeoArticlePreview(id){
 const [,a]=findArt(id);if(!a)return;
 const title=$('seo-article-title')?.value||a.ttl;
 const body=$('seo-article-body')?.value||a.previewBody||a.ex||'';
 a.ttl=title;a.previewBody=body;
 const blocks=body.split(/\n\s*\n/).filter(Boolean).map((x,i)=>{
  const lines=x.split('\n'),first=lines.shift()||'';
  if(/^\d+[\.、]\s*/.test(first))return `<section><h2>${esc(first.replace(/^\d+[\.、]\s*/,''))}</h2>${lines.length?`<p>${esc(lines.join('\n')).replace(/\n/g,'<br>')}</p>`:''}</section>`;
  return i===0?`<p class="seo-preview-lead">${esc(x).replace(/\n/g,'<br>')}</p>`:`<p>${esc(x).replace(/\n/g,'<br>')}</p>`;
 }).join('');
 $('mod').innerHTML=`<div class="mbox seo-article-preview" role="dialog" aria-modal="true" aria-label="SEO 文章预览">
  <div class="kp-dialog-head"><div><span class="ty">SEO 文章 · 预览</span><h3>${esc(title)}</h3></div><button class="ib" onclick="closeMod()" title="关闭" aria-label="关闭"><i data-lucide="x"></i></button></div>
  <div class="seo-preview-stage"><article><header class="seo-preview-title"><div class="seo-preview-kicker">Chinese Social Media</div><h1>${esc(title)}</h1></header><img class="seo-preview-cover" src="${a.img}" alt="${esc(a.seoMeta?.alt||title)}"><div class="seo-preview-copy">${blocks}</div></article></div>
  <div class="kp-dialog-foot"><span class="kp-preview-caption">图片与文章文案的组合效果</span><button class="btn sm" onclick="closeMod()">返回</button></div>
 </div>`;
 $('mod').classList.add('on');if(window.lucide)lucide.createIcons({root:$('mod'),attrs:{width:16,height:16,'stroke-width':1.8}});
}
function dSeoApprovedDirection(a){
 const source=a.sourceDirection||{},questions=source.questions||[],angles=source.angles||[];
 return `<div class="seo-approved-direction">
  <div class="seo-approved-head"><span class="st done">已批准</span><span>生成本文时采用的内容方向</span></div>
  <section><div class="seo-approved-label">选题名称</div><h4>${esc(source.t||a.ttl)}</h4></section>
  <section><div class="seo-approved-label">选题说明</div><p>${esc(source.e||a.ex||'')}</p></section>
  ${questions.length?`<section><div class="seo-approved-label">覆盖问题 · ${questions.length} 个</div><div class="seo-direction-chips">${questions.map(q=>`<span>${esc(q)}</span>`).join('')}</div></section>`:''}
  <section><div class="seo-approved-label">文章角度 · ${angles.length} 篇</div><div class="seo-approved-angles">${angles.map((x,i)=>`<div><span>#${i+1}</span><p>${esc(x)}</p></div>`).join('')}</div></section>
 </div>`;
}
function dSeoImgs(a){
 const imgs=planImgs().slice(0,1);
 return `<div style="font-size:var(--fs-sm);color:var(--t2);margin-bottom:var(--sp-3)">图片素材 · 1 张</div>
 <div class="imgs">${imgs.map((x,i)=>`<button class="imgc" onclick="openSeoImage(${i})" style="background-image:url('${x.src}');background-size:cover;background-position:center"><span class="lb">图片 ${i+1}</span></button>`).join('')}</div>`;
}
function dSeoOut(a){
 return `<section class="seo-kw-section"><div class="seo-kw-title">文章结构 <span class="count">· 5 个 H2</span></div>
 <div class="seo-structure-list">${a.out.map(o=>`<div class="seo-structure-row"><span class="seo-structure-level">${o[0]}</span><span class="seo-structure-text">${esc(o[1])}</span></div>`).join('')}</div></section>
 <div class="note" style="margin-top:var(--sp-3)">结构在正文之前单独确认过一次——改结构比改正文便宜得多。</div>`;
}
function dSeoKw(a){
 const meta=a.seoMeta||{title:a.ttl,description:a.ex,slug:'sensitive-skin-serum-guide',alt:a.ttl};
 return `<div class="ctx" style="margin-bottom:var(--sp-3)"><div class="ctxr"><span class="k">SEO 评分</span><span class="v num">85</span></div>
  <div class="ctxr"><span class="k">关键词密度</span><span class="v num">1.4%</span></div>
  <div class="ctxr"><span class="k">内链</span><span class="v num">3篇</span></div>
  <div class="ctxr"><span class="k">字数</span><span class="v num">1320</span></div>
  <div class="ctxr"><span class="k">语言</span><span class="v">en</span></div></div>
 <section class="seo-meta-section"><div class="seo-kw-title">SEO 元数据</div>
  <div class="seo-meta-grid">
   <div class="seo-meta-item wide"><span class="seo-meta-label">Meta Title</span><span class="seo-meta-value">${esc(meta.title)}</span></div>
   <div class="seo-meta-item wide"><span class="seo-meta-label">Meta Description</span><span class="seo-meta-value">${esc(meta.description)}</span></div>
   <div class="seo-meta-item"><span class="seo-meta-label">URL 别名</span><span class="seo-meta-value code">${esc(meta.slug)}</span></div>
   <div class="seo-meta-item"><span class="seo-meta-label">图片 ALT</span><span class="seo-meta-value">${esc(meta.alt)}</span></div>
  </div></section>
 <section class="seo-kw-section"><div class="seo-kw-title">关键词 <span class="count">· ${a.kw.length} 个</span></div>
 <div class="seo-keyword-grid">${a.kw.map(k=>`<div class="seo-keyword-item"><span class="vv">${k[1]}</span><span class="vt" title="${esc(k[0])}">${esc(k[0])}</span></div>`).join('')}</div></section>`;
}
function dSeoFaq(a){
 const faq=a.faq||[];
 return `<div style="font-size:var(--fs-sm);color:var(--t2);margin-bottom:var(--sp-3)">常见问题 · ${faq.length} 条</div>
 ${faq.map(item=>`<div class="seo-faq-item"><div class="seo-faq-line"><span class="seo-faq-mark">Q:</span><b>${esc(item[0])}</b></div><div class="seo-faq-line"><span class="seo-faq-mark">A:</span><span>${esc(item[1])}</span></div></div>`).join('')}
 <div class="note" style="margin-top:var(--sp-3)">发布时会作为独立小节追加到正文末尾（标题按站点语言取「常见问题」/「FAQ」），所以正文预览里看不到它。</div>`;
}
