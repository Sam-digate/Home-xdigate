/* Session-local execution lifecycle for the new-product task. */
function executionTask(id){const t=T.find(x=>x.id===id);return t?.id==='t16'&&!t.deletedAt?t:null;}
function executionAudit(t,action,note=''){
 t.executionHistory=t.executionHistory||[];
 t.executionHistory.push({action,note,actor:typeof currentUser==='function'?currentUser():'du',at:new Date().toISOString()});
}
function executionStatusLabel(t){return ({stopping:'正在中止',stopped:'已中止',failed:'执行失败'})[t.executionState]||'';}
function executionRefresh(t){render();if(S.traceT===t.id&&$('dw')?.classList.contains('on')){drawTrace();startTrace();}}
function executionTraceSteps(t){
 const steps=(t.plan?.steps||[]).map(s=>({k:s.s==='ok'?'read':'write',h:s.l,b:s.m,m:s.s==='ok'?'已完成':s.s==='todo'?'未开始':executionStatusLabel(t)||'执行中',state:s.s==='ok'?'ok':s.s==='act'&&!t.executionCancelled?'act':''}));
 return steps.concat((t.executionHistory||[]).map(r=>({k:'tool',h:r.action,b:r.note,m:(U[r.actor]?.n||r.actor)+' · '+new Date(r.at).toLocaleString('zh-CN',{timeZone:'Asia/Tokyo',hour12:false}),state:r.action==='执行失败'?'execution-trace-failed':'ok'})));
}
function executionStopButton(t){return executionTask(t.id)&&t.live?`<button class="btn ghost sm" onclick="openExecutionStop('${t.id}')" ${t.executionState==='stopping'?'disabled':''}>${t.executionState==='stopping'?'正在中止…':'中止 Agent'}</button>`:'';}
function openExecutionStop(id){
 const t=executionTask(id);if(!t?.live||t.executionState==='stopping')return;
 $('mod').innerHTML=`<section class="mbox execution-stop-modal" role="dialog" aria-modal="true" aria-labelledby="execution-stop-title"><div class="mhd"><h3 id="execution-stop-title">中止 Agent？</h3><button class="ib" aria-label="关闭" onclick="closeMod()">×</button></div><div class="mbd"><b>${esc(t.t)}</b><p style="margin-top:12px;color:var(--t2);line-height:1.8">中止后将停止后续执行，已完成的内容和补充信息会保留。之后可在当前任务中重试。</p></div><div class="mft"><button class="btn ghost" id="execution-keep-running" onclick="closeMod()">继续执行</button><button class="btn danger execution-stop-confirm" onclick="confirmExecutionStop('${id}')">确认中止</button></div></section>`;
 $('mod').classList.add('on');$('execution-keep-running')?.focus();
}
function confirmExecutionStop(id){
 const t=executionTask(id);if(!t?.live||t.executionState==='stopping')return;
 closeMod();t.executionState='stopping';t.executionCancelled=true;t.executionToken=(t.executionToken||0)+1;
 const token=t.executionToken;t.executionSnapshot=JSON.parse(JSON.stringify(t.live));
 if(S.tid===id&&S.liveT){clearInterval(S.liveT);S.liveT=null;}
 executionRefresh(t);
 setTimeout(()=>{
  if(!executionTask(id)||t.executionToken!==token)return;
  t.live=null;t.executionState='stopped';t.up='刚刚';
  executionAudit(t,'已中止',t.executionSnapshot.t);executionRefresh(t);toast('Agent 已中止，可在当前任务中重试');
 },450);
}
function failTaskExecution(id,reason,token){
 const t=executionTask(id);if(!t?.live||t.executionCancelled||t.executionState==='stopping'||(token!==undefined&&t.executionToken!==token))return;
 t.executionSnapshot=JSON.parse(JSON.stringify(t.live));t.live=null;t.executionState='failed';t.executionCancelled=true;t.executionError=reason;t.up='刚刚';
 if(S.tid===id&&S.liveT){clearInterval(S.liveT);S.liveT=null;}
 executionAudit(t,'执行失败',reason);executionRefresh(t);toast('执行失败，可重试');
}
function retryTaskExecution(id){
 const t=executionTask(id);if(!t||!['failed','stopped'].includes(t.executionState))return;
 const wasStopped=t.executionState==='stopped';
 t.executionToken=(t.executionToken||0)+1;const token=t.executionToken;
 t.executionState='running';t.executionCancelled=false;t.executionError=null;t.st='run';t.up='刚刚';
 t.live={...(t.executionSnapshot||{}),t:'内容生成正在整理新品内容计划',el:'刚刚',sub:['沿用已补齐的渠道、产品与文章数量，重新生成内容计划'],p:8,tk:480};
 executionAudit(t,'重试','复用已补齐信息，从生成内容计划步骤重新执行');executionRefresh(t);toast('已重试 · 沿用当前配置继续执行');
 // One timeout example exercises the failure/retry path without changing real services.
 if(wasStopped&&!t.executionFailureShown){t.executionFailureShown=true;setTimeout(()=>failTaskExecution(id,'内容计划生成超时，暂未获得结果。补充信息已保留，请重试。',token),8000);}
}
function executionTerminalNode(t){
 if(!executionTask(t.id)||!['failed','stopped'].includes(t.executionState))return '';
 const failed=t.executionState==='failed',last=t.executionHistory?.at(-1),actor=U[last?.actor]?.n||last?.actor||'dudu';
 return `<div class="node wait"><div class="nlab">执行 · ${failed?'FAILED':'STOPPED'}</div><div class="bub execution-result"><div class="who"><b>${failed?'执行失败':'Agent 已中止'}</b><span class="tm">${esc(actor)} · ${last?esc(new Date(last.at).toLocaleString('zh-CN',{timeZone:'Asia/Tokyo',hour12:false})):'刚刚'}</span></div><p>${esc(failed?t.executionError:'已停止后续执行，补充信息与已完成内容均已保留。')}</p><p class="execution-step">停留步骤：生成内容计划</p><div class="execution-actions"><button class="btn sm" onclick="retryTaskExecution('${t.id}')">重试</button><button class="btn ghost sm" onclick="openTrace('${t.ag}','${t.id}')">看它怎么想的</button></div></div></div>`;
}
