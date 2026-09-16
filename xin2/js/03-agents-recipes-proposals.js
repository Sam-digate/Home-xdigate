/* ============ plan adjustment ============ */

function canAdjustPrestartPlan(t){return !!(t?.prestartDemo&&t.plan.status==='pending'&&!t.plan.startedAt);}
function prestartAgents(){return REG.filter(a=>prestartPlanPreset(a.id)&&a.b==='live'&&a.enabled!==false&&ONLINE[a.id]);}
function prestartPlanNode(t){
 const pending=canAdjustPrestartPlan(t),a=AG[t.ag]||{},p=t.plan,d=S.prestartDraft?.tid===t.id?S.prestartDraft:null;
 const agentIds=t.agents?.length?t.agents:[t.ag];
 const manual=S.prestartManualTid===t.id;
 const rejecting=S.prestartReject?.tid===t.id;
 const rejected=p.status==='rejected';
 const planState=rejected?'未通过':pending?'待确认':t.st==='ask'?'已确认 · 等待补充':t.st==='done'?'已完成':t.st==='review'?'待审批':'已确认 · 执行中';
 return `<div class="node ${pending||rejected?'wait':['ask','review','done'].includes(t.st)?'ok':'act'}"><div class="nlab">计划 · PLAN</div><div class="bub prestart-plan">
  ${agentIds.length>1?`<div class="prestart-pair-head"><div class="prestart-pair-meta"><span class="chip mut">计划 v${p.v}</span><span class="tm">${planState}</span></div><div class="prestart-agent-pair">${agentIds.map(id=>{const label=t.agentLabels?.[id]||agentLabel(id),state=t.agentStates?.[id]||'待确认';return `<button class="prestart-agent-card" onclick="openTrace('${id}','${t.id}')" title="查看${esc(label)}运行状态">${AV(id,26)}<span class="prestart-agent-name">${esc(label)}</span><span class="prestart-agent-state">${esc(state)}</span></button>`;}).join('')}</div></div>`:`<div class="who agent-run-hit" role="button" tabindex="0" onclick="openTrace('${t.ag}','${t.id}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openTrace('${t.ag}','${t.id}')}" title="查看运行状态"><span class="avs" style="background:${a.c}">${a.s}</span><span class="nm">${esc(a.n)}</span><span class="chip mut">计划 v${p.v}</span><span class="tm">${planState}</span></div>`}
  <div class="prestart-summary">${esc(p.tx)}</div>
  ${rejected?`<div class="prestart-rejected-note"><b>不通过原因：</b>${esc(p.feedback||'未填写')}</div>`:''}
  ${pending?(manual?`<div class="prestart-plan-editor"><div class="fld" style="margin:0"><label>执行 Agent</label><select id="prestart-agent-select">${prestartAgents().map(x=>`<option value="${x.id}" ${x.id===t.ag?'selected':''}>${esc(nick(x.id)||x.n)}</option>`).join('')}</select></div>
   <div class="prestart-plan-editor-actions"><button class="btn sm" onclick="saveManualPrestart('${t.id}')">保存调整</button><button class="btn ghost sm" onclick="cancelManualPrestart('${t.id}')">取消</button></div></div>`:d?`<div class="prestart-plan-editor">
   <textarea id="prestart-adjustment" rows="2" aria-label="计划调整要求" oninput="setPrestartDraft(this.value)">${esc(d.tx)}</textarea>
   <div class="prestart-plan-editor-actions"><button class="btn sm" onclick="savePrestartPlan('${t.id}')">改计划</button><button class="btn ghost sm" onclick="cancelPrestartPlan('${t.id}')">取消</button></div>
  </div>`:rejecting?`<div class="prestart-plan-editor">
   <textarea rows="2" aria-label="不通过原因" placeholder="填写不通过原因" oninput="setPrestartReject(this.value)">${esc(S.prestartReject.tx)}</textarea>
   <div class="prestart-plan-editor-actions"><button class="btn sm" onclick="confirmPrestartReject('${t.id}')">确定</button><button class="btn ghost sm" onclick="cancelPrestartReject('${t.id}')">取消</button></div>
  </div>`:`<div class="prestart-plan-actions"><button class="btn ghost sm" onclick="openPrestartPlan('${t.id}')">调整计划 ↗</button><button class="btn ghost sm" onclick="openManualPrestart('${t.id}')">手动调整</button><button class="btn sm" onclick="startPrestartPlan('${t.id}')">确认并开始</button><button class="prestart-reject-link" onclick="openPrestartReject('${t.id}')">不通过</button></div>`):''}
  ${!pending&&!rejected&&t.st!=='done'?`<div style="margin-top:var(--sp-3);padding-top:var(--sp-3);border-top:1px solid var(--hairline)"><button class="btn ghost sm" onclick="promoteThread()">变成例行 ↗</button></div>`:''}
 </div></div>`;
}
function manualPrestartAgents(){return REG.filter(a=>a.b==='live'&&a.enabled!==false&&ONLINE[a.id]);}
function manualPrestartDrawer(){
 const t=T.find(x=>x.id===S.prestartAgentTid);if(!t)return;
 const list=manualPrestartAgents(),picks=Array.isArray(S.prestartAgentPick)?S.prestartAgentPick:[];
 $('dw').innerHTML=`<div class="dw-h">
  <button class="ib" onclick="closeDw()" title="关闭"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
  <div style="flex:1;min-width:0"><div class="ty">调整计划 · Agent</div><h3>选择执行 Agent</h3></div>
  <span class="chip mut">${list.length} 个可用</span></div>
 <div class="dw-b"><div class="manual-agent-list">${list.map(a=>{const m=agAdmin(a),order=picks.indexOf(a.id),on=order>=0;return `<button class="manual-agent-row ${on?'on':''}" onclick="selectManualPrestartAgent('${a.id}')" aria-pressed="${on}">
  ${AV(a.id,36)}<span class="manual-agent-main"><span class="manual-agent-head"><span class="odot on"></span><span class="manual-agent-name">${esc(a.nick)}</span><span class="chip lv">${LV[a.lv].k} ${LV[a.lv].n}</span><span class="chip dom">${esc(a.dom)}</span></span>
  <span class="manual-agent-desc">${esc(a.d)}</span><span class="manual-agent-meta">成功率 ${a.ok}% · 平均评分 ${m.rating} · 准时率 ${m.ontime} · 风险 ${m.risk}</span></span>
  <span class="manual-agent-check">${on?order+1:''}</span></button>`}).join('')}</div></div>
 <div class="dw-f"><button class="btn" onclick="confirmManualPrestartAgent()" ${picks.length?'':'disabled'}>确认选择${picks.length?'（'+picks.length+'）':''}</button><button class="btn ghost" onclick="closeDw()">取消</button><span style="margin-left:auto;font-size:var(--fs-xs);color:var(--t3)">按选择顺序执行 · 确认后仍需批准计划</span></div>`;
}
function openManualPrestart(id){
 const t=T.find(x=>x.id===id);if(!canAdjustPrestartPlan(t))return toast('计划已开始执行，不能更换 Agent');
 S.prestartDraft=null;S.prestartReject=null;S.prestartManualTid=null;S.prestartAgentTid=id;S.prestartAgentPick=[...(t.agents?.length?t.agents:[t.ag])];
 manualPrestartDrawer();$('dw').classList.add('on');$('scrim').classList.add('on');
}
function selectManualPrestartAgent(id){
 if(!manualPrestartAgents().some(a=>a.id===id))return;
 const scrollTop=$('dw')?.querySelector('.dw-b')?.scrollTop||0;
 const picks=Array.isArray(S.prestartAgentPick)?[...S.prestartAgentPick]:[],i=picks.indexOf(id);
 if(i>=0)picks.splice(i,1);else picks.push(id);
 S.prestartAgentPick=picks;manualPrestartDrawer();
 const body=$('dw')?.querySelector('.dw-b');if(body)body.scrollTop=scrollTop;
}
function manualPrestartPlan(agents,t){
 if(agents.length===1){const preset=prestartPlanPreset(agents[0].id);return preset||{tx:t.plan.tx,expected:t.plan.expected,steps:t.plan.steps,reason:'由人工指定 '+agents[0].nick+' 执行；请在开始前再次确认其能力与当前任务匹配。'};}
 const ids=agents.map(a=>a.id),labels=agents.map(a=>agentLabel(a.id)),dual=ids.length===2&&ids[0]==='pdp'&&ids[1]==='insp';
 if(dual){
  const plan=prestartPlanPreset('pdp');
  plan.tx='详情页生成 Agent 先整理规划并生成内容，Brooks 批准后由店铺巡检 Agent 检查商品资料、页面信息与上架风险。两份产出分别经 Brooks 批准后，再交 dudu 统一验收、分别评分。';
  plan.steps.splice(plan.steps.length-1,0,{l:'店铺巡检检查页面与上架风险',m:'等待详情页产出经 Brooks 批准',s:'todo',r:'未开始'});
  return plan;
 }
 return {tx:'按选择顺序由 '+labels.join('、')+' 协作执行本次任务；前一个 Agent 完成交付后，再由下一个 Agent 接续处理。',expected:labels.map(x=>x+' 的阶段产出').join('；')+'。',reason:'已由人工选择 '+agents.length+' 个 Agent，并以选择顺序作为执行顺序。',steps:agents.map((agent,i)=>{const preset=prestartPlanPreset(agent.id);return {l:(i+1)+' · '+agentLabel(agent.id),m:preset?.expected||agent.d||'完成本阶段任务',s:'todo',r:'未开始'};})};
}
function confirmManualPrestartAgent(){
 const t=T.find(x=>x.id===S.prestartAgentTid),available=manualPrestartAgents(),ids=Array.isArray(S.prestartAgentPick)?S.prestartAgentPick:[],agents=ids.map(id=>available.find(a=>a.id===id)).filter(Boolean);if(!t||!canAdjustPrestartPlan(t))return toast('当前计划已不能更换 Agent');
 if(!agents.length)return toast('请至少选择 1 个 Agent');
 const base=manualPrestartPlan(agents,t),dual=ids.length===2&&ids[0]==='pdp'&&ids[1]==='insp';
 t.ag=ids[0];t.agents=[...ids];t.agentLabels=Object.fromEntries(ids.map(id=>[id,agentLabel(id)]));t.agentStates=Object.fromEntries(ids.map((id,i)=>[id,i===0?'待确认':dual&&id==='insp'?'等待详情页批准':'等待前序 Agent']));t.demoDualAgents=dual;t.dom=agents[0].dom||t.dom;t.lv=agents[0].maturity||LV[agents[0].lv].k;t.plan={...t.plan,...base,v:(t.plan.v||1)+1,status:'pending',startedAt:null};t.up='刚刚';
 closeDw();renderNav();render();toast('已选择 '+agents.length+' 个 Agent · 请确认执行顺序与计划');
}
function openPrestartPlan(id){
 const t=T.find(x=>x.id===id);if(!canAdjustPrestartPlan(t)){toast('计划已开始执行，不能再调整原计划');return;}
 S.prestartManualTid=null;S.prestartReject=null;
 S.prestartDraft={tid:id,tx:'生成内容前，还可以调整Agent'};
 render();
}
function openPrestartReject(id){
 const t=T.find(x=>x.id===id);if(!canAdjustPrestartPlan(t)){toast('计划已开始执行，不能再标记不通过');return;}
 S.prestartDraft=null;S.prestartManualTid=null;S.prestartReject={tid:id,tx:''};render();
 setTimeout(()=>{const el=document.querySelector('[aria-label="不通过原因"]');if(el)el.focus();},30);
}
function setPrestartReject(value){if(S.prestartReject)S.prestartReject.tx=value;}
function cancelPrestartReject(id){if(S.prestartReject?.tid===id){S.prestartReject=null;render();}}
function confirmPrestartReject(id){
 const t=T.find(x=>x.id===id),d=S.prestartReject;if(!t||d?.tid!==id||!canAdjustPrestartPlan(t))return;
 const reason=d.tx.trim();if(!reason){toast('请填写不通过原因');return;}
 t.plan.feedback=reason;t.plan.status='rejected';t.plan.rejectedAt=new Date().toISOString();t.up='刚刚';
 (t.cmts=t.cmts||[]).push({k:'sys',tx:'计划未通过：'+reason,at:'刚刚'});
 S.prestartReject=null;renderNav();render();toast('计划已标记为未通过');
}
function setPrestartDraft(value){
 const d=S.prestartDraft;if(!d||!canAdjustPrestartPlan(T.find(x=>x.id===d.tid)))return;d.tx=value;
}
function cancelPrestartPlan(id){
 if(S.prestartDraft?.tid!==id)return;
 S.prestartDraft=null;render();
}
function savePrestartPlan(id){
 const t=T.find(x=>x.id===id),d=S.prestartDraft;if(!d||d.tid!==id||!canAdjustPrestartPlan(t)){toast('计划已开始执行，不能再调整原计划');return;}
 const agent=prestartAgents().find(a=>a.id==='plan');if(!agent){toast('活动策划 Agent 暂不可用，请稍后再试');return;}
 if(t.ag==='plan'){S.prestartDraft=null;render();toast('当前已是活动策划 Agent，等待确认开始');return;}
 t.ag=agent.id;t.agents=[agent.id];t.agentLabels={[agent.id]:agentLabel(agent.id)};t.agentStates={[agent.id]:'待确认'};t.demoDualAgents=false;t.dom=agent.dom;t.lv=agent.maturity||LV[agent.lv].k;
 t.plan={...t.plan,...prestartPlanPreset(agent.id),v:(t.plan.v||1)+1,status:'pending',startedAt:null};
 t.st='todo';t.up='刚刚';S.prestartDraft=null;renderNav();render();toast('已切换为活动策划 Agent，等待确认开始');
}
function startPrestartPlan(id){
 const t=T.find(x=>x.id===id);if(!canAdjustPrestartPlan(t)){toast('计划已启动，无需重复确认');return;}
 if(S.prestartDraft?.tid===id){toast('请先保存或取消正在调整的计划');return;}
 if(S.prestartManualTid===id){toast('请先保存或取消手动调整');return;}
 if(S.prestartReject?.tid===id){toast('请先确定或取消不通过原因');return;}
 const assignedAgents=t.agents?.length?t.agents:[t.ag];
 if(!assignedAgents.every(id=>manualPrestartAgents().some(a=>a.id===id))){toast('推荐的 Agent 暂不可用，请先调整计划');return;}
 if(!t.plan.tx.trim()||!t.plan.expected.trim()||!t.plan.steps.length){toast('请先补齐执行计划');return;}
 // Capture the approved specification before marking any execution step active.
 t.plan.confirmed={ag:t.ag,agents:[...assignedAgents],tx:t.plan.tx,expected:t.plan.expected,steps:t.plan.steps.map(s=>({l:s.l,m:s.m}))};
 if(t.demoSocial||t.demoM1Pdp){
  t.plan.startedAt=new Date().toISOString();t.plan.status='confirmed';t.st='ask';t.up='刚刚';
  if(t.demoDualAgents){t.agentStates.pdp='等待补充';t.agentStates.insp='等待详情页批准';}
  t.plan.steps=t.plan.steps.map((s,i)=>({...s,s:i===0?'ok':i===1?'ask':'todo',r:i===0?'已读取':i===1?'等待补充':'未开始'}));
  S.prestartDraft=null;S.prestartManualTid=null;(t.cmts=t.cmts||[]).push({k:'sys',tx:'已确认计划 v'+t.plan.v+' 与 '+assignedAgents.map(agentLabel).join('、')+'，等待补充目标渠道信息。',at:'刚刚'});
  renderNav();render();toast('计划已确认 · 请补充生成信息');return;
 }
 t.plan.startedAt=new Date().toISOString();t.plan.status='running';t.st='run';t.up='刚刚';
 t.plan.steps[0].s='act';t.plan.steps[0].r='刚开始';S.prestartDraft=null;
 (t.cmts=t.cmts||[]).push({k:'sys',tx:'已确认计划 v'+t.plan.v+'，'+assignedAgents.map(agentLabel).join('、')+' 开始执行。',at:'刚刚'});
 renderNav();render();toast('计划已确认，任务已移到进行中');
}
function blockPrestartDispatch(t){
 if(!t?.prestartDemo)return false;
 toast(canAdjustPrestartPlan(t)?'请先确认计划，再开始执行':'本次执行计划已确认，不能追加或更换 Agent');return true;
}
function adjPlan(){
 const t=T.find(x=>x.id===S.tid);const v=$('pa');
 if(t.prestartDemo){savePrestartPlan(t.id);return;}
 if(!v||!v.value.trim()){toast('写一句要改什么');return;}
 t.plan.v=(t.plan.v||1)+1;
 t.plan.adj='dudu 追加：'+v.value.trim();
 t.plan.steps.splice(t.plan.steps.length-1,0,{l:v.value.trim().slice(0,20),m:'由你追加 · 计划 v'+t.plan.v,s:'todo',r:'—'});
 S.pa=false;render();toast('计划已改为 v'+t.plan.v+' · 未完成的步骤会按新计划走');
}

/* ============ run trace / thinking ============ */
const TRACE={
 gen:[{k:'read',h:'读取品牌智库',b:'战略规划数据 · 品牌核心定位 · 品牌禁用词规则（142 条）· 11.11 活动 Brief',m:'4 个来源 · 1.2k tokens'},
  {k:'think',h:'判断内容切入角度',b:'Brief 里"低预算"是约束不是卖点。如果正面讲便宜，会和品牌"专业修护"的定位打架。\n换个方向：把"预算有限"变成"把钱花在看得见的地方"，约束就变成了选择理由。',m:'2.4k tokens'},
  {k:'think',h:'检查与已有内容的重复',b:'618 用过"问题-对比-结论"结构两次。方向一沿用这个结构，标记为"可能疲劳"，但保留——返场期可复用。',m:'0.8k tokens'},
  {k:'tool',h:'调用 知识库 Agent · 检索可用素材',b:'返回 8 周实验对比图 3 张、真实使用场景实拍 12 张。无第 3 周细节变化的实拍——已在配图建议中标注需补拍。',m:'320ms'},
  {k:'write',h:'生成 3 个方向',b:'方向一沿用已验证结构；方向二走真实感主线；方向三做可复制话题动作。三个方向覆盖不同风险偏好，让人来选。',m:'3.1k tokens'},
  {k:'tool',h:'校验禁用词',b:'142 条规则全过。"修护"一词在精华类目允许，在面霜类目需加限定——本次为精华，通过。',m:'80ms'}],
 vid:[{k:'read',h:'读取已批准方向二',b:'低预算高信任感 · 真实使用场景为主线 · 第 3 周细节变化为证据点',m:'0.6k tokens'},
  {k:'think',h:'拆解 30 秒结构',b:'30 秒竖版，前 3 秒决定完播。不能用产品开场——真实感主线要求从场景进入。\n定为：场景 4 秒 → 痛点对比 7 秒 → 卖点 12 秒 → 利益点 7 秒。',m:'1.8k tokens'},
  {k:'write',h:'生成脚本与分镜',b:'6 个镜头。镜头 5 原计划用效果特写，考虑到真实感要求，改为无修饰面部特写。',m:'2.2k tokens'},
  {k:'tool',h:'调用渲染服务',b:'9:16 · 1080×1920 · 逐镜头渲染中。镜头 1–4 已完成，镜头 5 因参数变更重新排队。',m:'进行中 · 3分18秒'},
  {k:'think',h:'待确认项',b:'背景音乐来自素材库，版权状态未标注。已标为待核，不阻塞渲染但阻塞发布。',m:'0.3k tokens'}],
 adplan:[{k:'read',h:'读取历史投放与会场排期',b:'近 90 天 4 个计划 · 平均 ROAS 2.8 · 收藏加购成本 ¥7.2 · 会场排期已确认',m:'2.1k tokens'},
  {k:'think',h:'判断蓄水期该优化什么',b:'蓄水期直接看 ROAS 是错的目标——这个阶段买的是人群资产，不是当天成交。\n主 KPI 定为收藏加购，ROAS 只做兜底约束（≥2.5），避免为了蓄水无限烧钱。',m:'3.4k tokens'},
  {k:'think',h:'人群配比',b:'内容互动回捞原本给 25%，但小红书那波还没跑完，人群包不够厚。先给 18%，差额转给相似人群拓展，等数据达标再调回。',m:'1.6k tokens'},
  {k:'tool',h:'拉取竞价预估',b:'蓄水期同类目竞价预计上浮 18–22%。已在预算中留 8% 机动。',m:'640ms'},
  {k:'write',h:'生成策略、预算与创意',b:'创意三组分别对应三层人群。创意二用价格锚点，已标注需法务确认比价合规。',m:'4.8k tokens'}],
 seo:[{k:'read',h:'读取上一批文章结构与表现',b:'第 3 批 3 篇 · 平均停留 2分14秒 · 有对照表的那篇停留最长',m:'1.1k tokens'},
  {k:'tool',h:'关键词聚类',b:'主词"敏感肌精华怎么选"月搜索 2,400，拉出 14 个长尾，合计 8,200。',m:'1.2s'},
  {k:'think',h:'决定文章结构',b:'"怎么选"是决策型意图，不是了解型。所以不能从成分讲起，要从"你是不是敏感肌"这个自我判断开始，否则读者对不上号。',m:'2.0k tokens'},
  {k:'write',h:'生成正文',b:'2,140 字 · 5 个 H2 · 内链 3 篇。第一版浓度部分是纯文字，密度 2.4%。',m:'3.6k tokens'},
  {k:'think',h:'响应评论意见',b:'Sophie 指出浓度段落纯文字会流失读者。加入 5 行对照表后，正文字数上升，关键词密度自然稀释到 2.1%，仍在区间内。',m:'1.4k tokens'}],
 list:[{k:'read',h:'读取产品中心',b:'3 个 SKU · 资质文件 · 会场价格表',m:'0.9k tokens'},
  {k:'write',h:'生成上架字段',b:'标题按天猫权重排序：品牌 + 品名 + 规格 + 核心词 + 会场标识。',m:'1.7k tokens'},
  {k:'tool',h:'校验类目资质',b:'安瓶精华的"修护屏障"属于功效宣称，触发天猫特殊类目资质要求，需第三方检测报告。另两个 SKU 无宣称，通过。',m:'420ms'},
  {k:'think',h:'是否整批阻塞',b:'只有 1 个 SKU 缺资质。整批阻塞会耽误另外两个的会场排期。建议拆分提交——已在产出里标出可提交的两个。',m:'0.7k tokens'}],
 kol:[{k:'read',h:'读取达人库与方向二画像',b:'1,240 位达人 · 方向二调性：真实测评、非强种草',m:'2.8k tokens'},
  {k:'think',h:'定打分权重',b:'这次调性比粉丝量重要。内容调性给 35% 权重，粉丝量不单独计分——只通过报价性价比间接体现。',m:'1.3k tokens'},
  {k:'tool',h:'匹配打分',b:'评估 300 位，输出 30 位。规避黑名单 3 位。',m:'2.4s'},
  {k:'think',h:'异常标记',b:'林间小屋匹配度 79% 但 6 月与竞品合作，独家冷却期未过 22 天。不自动剔除——由人判断是否值得等。',m:'0.6k tokens'}],
 pdp:[{k:'read',h:'读取产品中心与类目规则',b:'天猫 · 美容护肤/精华 · 会场要求',m:'1.0k tokens'},
  {k:'think',h:'卖点排序',b:'卖点顺序要跟主推方向走。方向二强调真实感，所以把"真实修护感"提到第一，实验数据第二做支撑，敏感肌第三。',m:'1.5k tokens'},
  {k:'write',h:'生成字段与 A+ 模块',b:'新增成分实验对比区。图片需 9 张，当前 8 张。',m:'2.1k tokens'}],
 cs:[{k:'read',h:'匹配角色与规则',b:'AI Customer Service Assistant · R-001 · Silver member · 订单 #A8O-77213',m:'0.4k tokens'},
  {k:'think',h:'判断补偿额度',b:'外箱全破属于运输责任，运费应由我们承担。规则上限 ¥10，实际运费 ¥12。\n超限了——按 L4 规则，自动发送必须阻止，交人确认。不擅自压到 ¥10，那会让客户再来一次。',m:'0.9k tokens'},
  {k:'write',h:'生成回复草稿',b:'退款话术模板 v3 + 运费补偿。语气取共情主动担责。',m:'0.6k tokens'}],
 ad:[{k:'read',h:'读取近 7 天投放数据',b:'4 个计划 · 3 个转化低于阈值',m:'1.4k tokens'},
  {k:'think',h:'判断是暂停还是复测',b:'3 个创意转化低，但曝光量差异大。曝光不足的那个可能只是没跑出来，不该直接停。\n只建议暂停曝光充分（>5万）且仍不达标的 3 个。',m:'1.1k tokens'}],
 insp:[{k:'tool',h:'每日巡检 · 库存维度',b:'扫描 SKU 库存与动销速度',m:'12秒'},
  {k:'think',h:'风险判断',b:'可卖天数 6.92，低于阈值 7。单看数字只是刚破线，但 11.11 蓄水期即将开始，动销会加速——按当前速度会在会场前断货。\n提高严重度，建单而不是只记录。',m:'0.8k tokens'}],
 orch:[{k:'read',h:'读取品牌智库与产品中心',b:'找到 3 个在售新品',m:'0.7k tokens'},
  {k:'think',h:'判断信息是否足够',b:'"给新品做一波内容"——新品有 3 个，平台没说，目标没说，数量没说。\n这四项任何一项猜错，后面全是白做。不猜，问。',m:'0.9k tokens'},
  {k:'write',h:'生成澄清问题',b:'4 个问题，每个都给出为什么需要，让人知道不是在走流程。',m:'0.5k tokens'}]
};
const LIVEQ={vid:['读取镜头 5 参数（磨皮已关闭）…','渲染镜头 5 · 第 118/240 帧','写入字幕轨 · 0:23–0:27','校验输出比例 9:16…','合成音轨…'],
 kol:['评估达人 118/300…','比对独家冷却期…','计算报价性价比…','规避黑名单命中 3 位…'],
 gen:['检索可用素材…','校验禁用词 142 条…','生成第 2/3 个方向…']};
function openTrace(agid,tid){S.trace=agid;S.traceT=tid||S.tid;drawTrace();$('dw').classList.add('on');$('scrim').classList.add('on');startTrace();}
function startTrace(){
 if(S.trT){clearInterval(S.trT);S.trT=null;}
 const t=T.find(x=>x.id===S.traceT);if(!t||t.st!=='run')return;
 if(t.agentStates?.[S.trace]&&t.agentStates[S.trace]!=='运行中')return;
 const q=LIVEQ[S.trace]||['执行中…'];let i=0;
 S.trT=setInterval(()=>{
  const el=$('lvline');if(!el){clearInterval(S.trT);S.trT=null;return;}
  i=(i+1)%q.length;
  el.textContent=q[i];
 },1600);
}
function traceMeta(m){return String(m||'').split(' · ').filter(x=>!/tokens/i.test(x)).join(' · ');}
function drawTrace(){
 const id=S.trace,a=AG[id]||{n:id,c:'#8B7FC7',s:'A'};
 const t=T.find(x=>x.id===S.traceT),allTr=TRACE[id]||[];
 const tr=t&&t.traceOmit?allTr.filter((_,i)=>!t.traceOmit.includes(i)):allTr;
 const agentState=t?.agentStates?.[id];
 const running=t&&(t.st==='run')&&(!agentState||agentState==='运行中');
 const waitingPlan=t&&canAdjustPrestartPlan(t),rejectedPlan=t?.plan?.status==='rejected';
 const traceStatus=!t?'—':waitingPlan?'待确认':rejectedPlan?'未开始':agentState|| (t.manualPending?'待指定':t.st==='ask'?'等待补充':t.st==='run'?'运行中':t.st==='review'?'待审批':t.st==='done'?'已完成':'未开始');
 const showTrace=!waitingPlan&&!rejectedPlan&&!t?.manualPending&&!/^等待/.test(agentState||'');
 $('dw').innerHTML=`<div class="dw-h">
   <button class="ib" onclick="closeDw()"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
   ${AV(id,30)}
   <div style="flex:1;min-width:0"><div class="ty">运行状态</div><h3>${nick(id)}</h3></div>
   <span class="chip mut">${traceStatus}</span>
   <span class="odot ${ONLINE[id]?'on':'off'}"></span></div>
   <div class="dw-b">
    <div class="note" style="margin-bottom:var(--sp-3)">${showTrace?'这是这次运行的完整记录：读了什么、怎么判断、调了什么工具、为什么这么写。判断错了就在下面说，它会带着这个理由重做。':'当前任务还没有开始运行。'}</div>
   ${showTrace?`<div class="trace">${tr.map((x,i)=>`<div class="tr ${running&&i===tr.length-2?'act':'ok'}">
     <div class="h"><span class="k ${x.k}">${({read:'读取',think:'判断',tool:'工具',write:'生成'})[x.k]}</span>${esc(x.h)}</div>
     <div class="b">${esc(x.b)}</div>${traceMeta(x.m)?`<div class="m">${esc(traceMeta(x.m))}</div>`:''}</div>`).join('')}
     ${running?`<div class="tr act"><div class="h"><span class="k tool">进行中</span><span class="spin"></span>
      <span id="lvline">${(LIVEQ[id]||['执行中…'])[0]}</span></div></div>`:''}</div>`:`<div class="note">当前尚未开始执行，确认计划后可在这里查看运行状态。</div>`}
   <div class="ctx" style="margin-top:var(--sp-4)">
     <div class="ctxr"><span class="k">自主级别</span><span class="v">${(REG.find(r=>r.id===id)||{}).lv!==undefined?LV[REG.find(r=>r.id===id).lv].k+' · '+LV[REG.find(r=>r.id===id).lv].n:'—'}</span></div>
      <div class="ctxr"><span class="k">状态</span><span class="v">${traceStatus}</span></div></div>
  </div>
  <div class="dw-f">
   <button class="btn ghost sm" onclick="closeDw();setTimeout(()=>{const e=$('cl');if(e&&e.scrollIntoView)e.scrollIntoView({behavior:'smooth'})},80)">去对话 ↗</button>
    <button class="btn ghost" onclick="closeDw();toast('已跳到 Agent 登记处')">查看 Agent 配置</button>
   ${showTrace?`<span style="margin-left:auto;font-size:var(--fs-xs);color:var(--t3)">${tr.length} 步</span>`:'<span style="margin-left:auto"></span>'}</div>`;
}


/* ============ nudge ============ */
function nudge(tid,who,why){
 const t=T.find(x=>x.id===tid);
 $('mod').innerHTML=`<div class="mbox">
  <div class="mhd"><div class="e">催一下</div><h3>提醒 ${who}</h3></div>
  <div class="mbd">
   <div style="font-size:var(--fs-sm);color:var(--t2);margin-bottom:var(--sp-3)">
     会作为一条评论发在 <b>${esc(t.t)}</b> 里并 @${who}，同时给他一条通知。不会私发，其他人也看得到——催过的记录留在线程上。</div>
   <div class="fld"><label>内容</label>
     <textarea id="nz" rows="3">@${who} 这条卡在「${why}」，蓄水期排期在等，今天能给个时间吗？</textarea></div>
   <div class="ctx"><div class="ctxr"><span class="k">发到</span><span class="v">${esc(t.t)} · 线程评论</span></div>
     <div class="ctxr"><span class="k">通知</span><span class="v">${who} · 站内 + 企微</span></div>
     <div class="ctxr"><span class="k">可见</span><span class="v">线程内所有人</span></div></div>
  </div>
  <div class="mft"><button class="btn" onclick="sendNudge('${tid}','${who}')">发送提醒</button>
    <button class="btn ghost" onclick="closeMod()">取消</button></div></div>`;
 $('mod').classList.add('on');
}
function sendNudge(tid,who){
 const t=T.find(x=>x.id===tid),tx=$('nz').value.trim();
 (t.cmts=t.cmts||[]).push({w:'du',tx,at:'刚刚'});
 t.new=(t.new||0)+1;closeMod();render();toast('已发到线程并通知 '+who);
}
/* ============ recipe launcher ============ */
function openRecipeDrawer(){
 const recipes=RECIPES.filter(r=>!r.cad);
 $('dw').innerHTML=`<div class="dw-h">
   <div style="flex:1;min-width:0"><div class="ty">工作 · 配方</div><h3>从配方开始</h3></div>
   <button class="ib" onclick="closeDw()" title="关闭"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button></div>
  <div class="dw-b">
   <div class="bar" style="margin:0 0 14px"><span class="chip mut">${recipes.length} 个配方</span>
     <span class="spacer"></span><button class="btn sm" onclick="newRecipe()">＋ 新建配方</button></div>
   <div class="recipe-drawer-list">${recipes.length?recipes.map(r=>rcRow(r,0)).join(''):'<div class="allclear">还没有配方。</div>'}</div>
  </div>`;
 $('dw').classList.add('on');$('scrim').classList.add('on');
}
function openRecipe(i){
 const r=RECIPES[i];if(!r)return;S.rc=i;
 $('mod').innerHTML=`<div class="mbox">
  <div class="mhd"><div class="e">用配方开始</div><h3>${esc(r.n)}</h3></div>
  <div class="mbd">
    <div style="font-size:var(--fs-sm);color:var(--t2);margin-bottom:var(--sp-3)">${esc(r.d)}</div>
    <div class="plan-pv" style="margin-bottom:var(--sp-4)"><div class="h">这条配方会依次用到</div>
      ${r.ag.map((x,j)=>`<div class="s"><span class="i">${j+1}</span>${AV(x,20)} <b>${nick(x)}</b>
        <span class="chip lv" style="margin-left:auto">${LV[(REG.find(y=>y.id===x)||{lv:0}).lv].k}</span></div>`).join('')}</div>
    <div class="fld"><label>归到哪个活动</label>
      <select id="rcc">${CAMPS.map(c=>`<option>${c.n}</option>`).join('')}<option>日常（不归属活动）</option></select></div>
    <div class="fld"><label>范围</label>
      <select id="rcd"><option ${r.dom==='内容'?'selected':''}>内容</option><option ${r.dom==='电商'?'selected':''}>电商</option>
        <option ${r.dom==='用户运营'?'selected':''}>用户运营</option><option ${r.dom==='KOL'?'selected':''}>KOL</option>
        <option ${r.dom==='B2B'?'selected':''}>B2B</option></select></div>
    <div class="fld"><label>这次要交代什么 <span class="ct">会作为意图写进线程</span></label>
      <textarea id="rcn" rows="3" placeholder="例如：主题「2111」，主打低预算高信任感，先给方向不要直接写稿"></textarea></div>
  </div>
  <div class="mft"><button class="btn" onclick="runRecipe()">开始</button>
    <button class="btn ghost" onclick="closeMod()">取消</button>
    <span style="margin-left:auto;font-size:var(--fs-xs);color:var(--t3)">用过 ${r.used} 次</span></div></div>`;
 $('mod').classList.add('on');setTimeout(()=>$('rcn').focus(),60);
}
function runRecipe(){
 const r=RECIPES[S.rc],note=$('rcn').value.trim(),camp=$('rcc').value,dom=$('rcd').value;
 if(!note){toast('写一句这次要交代什么');return;}
 const id='r'+Date.now();
 T.unshift({cr:{s:'h',w:'du'},trig:'manual',id,new:1,t:r.n.split(' → ')[0]+' · '+note.slice(0,14),camp:camp.startsWith('日常')?null:camp,dom,
  ag:r.ag[0],own:'du',st:'run',up:'刚刚',day:0,lv:LV[(REG.find(y=>y.id===r.ag[0])||{lv:0}).lv].k,cost:'¥0.30',
  intent:{who:'du',tx:note,at:'刚刚'},
  plan:{v:1,tx:'按配方「'+r.n+'」执行。',steps:r.ag.map((x,j)=>({l:nick(x),
    m:j===0?'进行中':'排队中',s:j===0?'act':'todo',r:j===0?'刚开始':'—'}))},
  cmts:[]});
 RECIPES[S.rc].used=(RECIPES[S.rc].used||0)+1;closeMod();S.dom=dom;go('thread',id);
 toast('已按配方开线程 · '+nick(r.ag[0])+' 开始跑了');
}
/* ============ direct dispatch ============ */
function openDispatch(){
 const t=T.find(x=>x.id===S.tid);
 $('mod').innerHTML=`<div class="mbox">
  <div class="mhd"><div class="e">直接找 Agent</div><h3>跳过编排，指名要谁</h3></div>
  <div class="mbd">
    <div style="font-size:var(--fs-sm);color:var(--t2);margin-bottom:var(--sp-3)">
      平时由 <b>${nick('orch')}</b> 判断该派谁。如果你已经知道要谁，直接点他——请求会作为新一步加进这条线程。</div>
    <div class="agpick">${REG.filter(a=>a.b==='live'&&ONLINE[a.id]).map(a=>`
      <button class="agp" onclick="dispatch('${a.id}')">${AV(a.id,30)}
        <span style="min-width:0"><span class="nm">${a.nick} <span class="odot on"></span></span>
          <span class="rl">${a.dom}</span></span></button>`).join('')}</div>
  </div>
  <div class="mft"><button class="btn ghost" onclick="closeMod()">取消</button>
    <span style="margin-left:auto;font-size:var(--fs-xs);color:var(--t3)">只显示在线且已上线的 Agent</span></div></div>`;
 $('mod').classList.add('on');
}
function dispatch(agid){
 const t=T.find(x=>x.id===S.tid);
 if(blockPrestartDispatch(t))return;
 t.plan.v=(t.plan.v||1)+1;
 t.plan.adj='dudu 直接指派了 '+nick(agid)+'（未经编排）';
 t.plan.steps.splice(t.plan.steps.length-1,0,{l:nick(agid)+' · 直接指派',m:(REG.find(y=>y.id===agid)||{}).n,s:'act',r:'刚开始'});
 (t.cmts=t.cmts||[]).push({w:'du',tx:'直接找了 @'+nick(agid)+'，不走编排。',at:'刚刚'});
 closeMod();render();toast(nick(agid)+' 已接手 · 已加进这条线程');
}
/* ============ activate agent onto a thread ============ */
function openActivate(agid){
 closeDw();openNew(agid);
}
function activate(agid,tid){
 const t=T.find(x=>x.id===tid);
 if(blockPrestartDispatch(t))return;
 t.plan=t.plan||{v:1,tx:'直接指派。',steps:[]};
 t.plan.v=(t.plan.v||1)+1;
 t.plan.steps.push({l:nick(agid)+' · 立即运行',m:(REG.find(y=>y.id===agid)||{}).n,s:'act',r:'刚开始'});
 t.st='run';t.new=(t.new||0)+1;
 closeMod();closeDw();go('thread',tid);toast(nick(agid)+' 已启动');
}


/* ---- 热点库 (Trend/Hotspot as records) ---- */
const RISK={低:'done',中:'review',高:'hold'};
const HOTS=[
 {n:'#早C晚A 预算有限怎么搭',ty:'关键词热点',plat:'小红书',src:'小红书 · 热搜',fit:.82,risk:'低',use:'已提案',links:3,up:'2小时前',g:['#FDA4AF','#E11D48'],
  why:'讨论集中在"预算有限怎么搭"，和方向二同一话题面。48h 增长 214%，窗口 5–7 天。',brands:12},
 {n:'秋冬换季屏障修护',ty:'关键词热点',plat:'小红书',src:'小红书 · 热搜',fit:.79,risk:'低',use:'未使用',links:5,up:'今天 06:18',g:['#A7F3D0','#059669'],
  why:'换季期常规上升，和我们的主推功效直接相关。不急，但整个 9 月都能用。',brands:8},
 {n:'成分党实验对比',ty:'关键词热点',plat:'小红书',src:'品牌关键词',fit:.71,risk:'低',use:'已使用',links:4,up:'昨天',g:['#C4B5FD','#7C3AED'],
  why:'已用在详情页 A+ 模块的成分实验对比区。',brands:5},
 {n:'文化与艺术',ty:'通用热点',plat:'今日热榜',src:'今日热榜',fit:.34,risk:'低',use:'未使用',links:2,up:'今天 06:18',g:['#BFDBFE','#2563EB'],
  why:'泛话题，与品牌相关度低于阈值 0.55。入库备查，不会提案。',brands:58},
 {n:'科技与创新',ty:'通用热点',plat:'今日热榜',src:'今日热榜',fit:.28,risk:'中',use:'未使用',links:2,up:'今天 06:18',g:['#FDE68A','#D97706'],
  why:'与美妆护肤无关联路径。',brands:58},
 {n:'姆巴佩恋情',ty:'通用热点',plat:'今日热榜',src:'今日热榜',fit:.11,risk:'高',use:'不可用',links:2,up:'今天 06:18',g:['#FCA5A5','#DC2626'],
  why:'名人私生活。品牌安全校验未过——高风险热点永不自动提案，也不建议手动使用。',brands:58}];
// Demo analysis for each hotspot; scores use the existing fit value.
const HOT_ANALYSES={
 '#早C晚A 预算有限怎么搭':{
  summary:'讨论聚焦有限预算下的护肤搭配，用户更关心成分是否适合自己、步骤能否简化，以及产品是否值得长期使用。',
  reason:'大促前的选购需求与理性消费话题叠加，让真实使用体验和清晰的搭配建议更容易引发讨论。',
  tags:['预算护肤指南','真实体验分享','大促选购建议'],
  brand:'与 A80PARIS 的低预算、高信任感内容方向契合。可围绕核心单品、使用频率和真实体验展开，说明适用人群与搭配边界，避免仅以低价吸引关注。'},
 '秋冬换季屏障修护':{
  summary:'换季带来的干燥、紧绷与护肤耐受问题成为讨论重点，用户希望找到温和、稳定且便于坚持的日常护理方案。',
  reason:'季节变化带动护理需求，具体的使用场景与连续体验记录更能回应用户对换季护肤的疑问。',
  tags:['换季护理指南','敏感肌日常','连续体验记录'],
  brand:'与 A80PARIS 的屏障护理方向相关。可结合换季场景说明产品使用步骤、肤感与适用人群，以已确认的产品资料支撑表达，不夸大功效。'},
 '成分党实验对比':{
  summary:'用户通过成分解析、实验过程与对比结果理解产品差异，关注证据来源是否清晰，以及结论能否对应真实使用体验。',
  reason:'护肤决策趋向理性，透明的实验条件与可追溯的数据有助于降低理解门槛，形成更深入的讨论。',
  tags:['成分知识解读','实验过程展示','详情页证据补充'],
  brand:'可补充 A80PARIS 详情页中的成分与实验说明。优先使用已有、可核实的实验资料，注明测试条件和适用范围，避免把单项实验直接等同于实际功效。'},
 '文化与艺术':{
  summary:'古诗词、非遗与艺术表达引发讨论，体现出用户对传统文化传承、当代表达和日常审美体验的关注。',
  reason:'文化内容兼具情感认同与视觉传播特点，传统元素与日常生活的结合为创意表达提供了更多切入点。',
  tags:['文化主题内容','视觉创意参考','品牌故事表达'],
  brand:'可作为 A80PARIS 品牌视觉与故事表达的灵感，但与当前护肤产品需求的直接关联较弱。建议先核实品牌叙事与素材使用权限，暂不直接转为产品功效推广。'},
 '科技与创新':{
  summary:'讨论围绕新技术与日常生活的结合展开，用户关注创新是否带来具体、可感知的体验改善。',
  reason:'新技术话题容易形成关注，但从概念热度转化为产品内容，需要明确的应用场景与可验证依据。',
  tags:['技术趋势观察','产品研发科普','应用场景参考'],
  brand:'目前与 A80PARIS 的产品资料缺少直接关联，适合作为趋势观察。仅在已有研发或测试资料能够支持时再展开科普，避免将无关技术包装成产品卖点。'},
 '姆巴佩恋情':{
  summary:'话题主要涉及公众人物的私人生活，关注集中在人物关系与娱乐讨论，与护肤需求缺少直接联系。',
  reason:'公众人物的关注度会带动短期传播，但话题真实性、隐私边界及品牌安全风险需要优先考虑。',
  tags:['仅作舆情观察','不建议借势','品牌安全关注'],
  brand:'与 A80PARIS 的品牌定位和产品场景关联较低，且涉及私人生活风险。不建议用于品牌推广、产品关联或人物背书，保持当前不可用状态。'}
};
function hotAnalysisSections(h){
 const x=HOT_ANALYSES[h.n];if(!x)return '';
 const score=Math.round(h.fit*100);
 return `<section class="hot-analysis"><h4>AI 分析摘要</h4>
  <p>${esc(x.summary)}</p><p><b>热度原因：</b>${esc(x.reason)}</p>
  <div class="hot-analysis-tags">${x.tags.map(t=>`<span>${esc(t)}</span>`).join('')}</div></section>
 <section class="hot-analysis"><h4>品牌适配分析</h4><div class="hot-brand-fit">
  <div class="hot-brand-copy"><h5>A80PARIS</h5><p>${esc(x.brand)}</p></div>
  <div class="hot-fit-score" role="img" aria-label="A80PARIS 适配度 ${score}%" title="适配度 ${score}%">
   <svg viewBox="0 0 58 58" aria-hidden="true"><circle cx="29" cy="29" r="24" fill="none" stroke="#E8E1F7" stroke-width="3"/><circle cx="29" cy="29" r="24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" pathLength="100" stroke-dasharray="${score} 100"/></svg><span>${score}%</span>
  </div></div></section>`;
}
function kHots(){
 if(S.hotType===undefined)S.hotType='全部';
 const L=HOTS.filter(h=>S.hotType==='全部'||h.ty===S.hotType);
 const by={};L.forEach(h=>by[h.use]=(by[h.use]||0)+1);
 return `<div class="bar" style="margin:0 0 13px">
   <div class="seg">${['全部','关键词热点','通用热点'].map(c=>`<button class="${S.hotType===c?'on':''}" onclick="S.hotType='${c}';render()">${c}</button>`).join('')}</div></div>
  <div class="bar" style="margin:0 0 13px">
    <span class="chip mut">${L.length} 条匹配本品牌</span>
    ${Object.keys(by).map(k=>`<span class="st ${k==='已使用'?'done':k==='已提案'?'review':k==='不可用'?'hold':'todo'}">${k} ${by[k]}</span>`).join('')}
    <span class="spacer"></span>
    <button class="btn ghost sm" onclick="openAgent('trend')">数据源与关键词 ↗</button></div>
  ${L.map(h=>`<button class="row" onclick="openHot(${HOTS.indexOf(h)})" style="align-items:flex-start;padding:var(--sp-3) 14px">
    <span style="flex:1;min-width:0">
      <span style="display:flex;align-items:center;gap:var(--sp-2);flex-wrap:wrap">
        <b style="font-size:var(--fs-md)">${esc(h.n)}</b>
        <span class="chip mut">${h.ty}</span>
        <span class="st ${RISK[h.risk]}">${h.risk}风险</span>
        <span class="st ${h.use==='已使用'?'done':h.use==='已提案'?'review':h.use==='不可用'?'hold':'todo'}">${h.use}</span></span>
      <span style="display:block;font-size:var(--fs-xs);color:var(--t3);margin-top:var(--sp-1)">${esc([...new Set([h.plat,...h.src.split(' · ')])].join(' · '))} · ${h.links} 条证据 · ${h.up}</span>
      <span style="display:block;font-size:var(--fs-sm);color:var(--t2);margin-top:var(--sp-1)">${esc(h.why)}</span></span>
    <span class="chip lv">适配 ${Math.round(h.fit*100)}%</span></button>`).join('')}`;
}
function openHot(i){
 const h=HOTS[i];S.hot=i;
 $('dw').innerHTML=`<div class="dw-h">
   <button class="ib" onclick="closeDw()"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
   <div style="flex:1;min-width:0"><div class="ty">知识库 · 热点</div><h3>${esc(h.n)}</h3></div>
   <span class="st ${RISK[h.risk]}">${h.risk}风险</span></div>
  <div class="dw-b">
   <div class="rec-h" style="${grad(h.g[0],h.g[1])};height:74px"><div class="rec-n"><div class="nm">${esc(h.n)}</div>
     <div class="hd">${h.plat} · ${h.ty}</div></div></div>
   <div style="display:flex;border:1px solid var(--border);border-radius:var(--r);overflow:hidden;margin:var(--sp-3) 0">
     ${[['适配度',Math.round(h.fit*100)+'%'],['风险',h.risk],['证据',h.links+' 条'],['时效窗口','2周内']].map((k,j)=>
       `<div style="flex:1;padding:var(--sp-3) 6px;text-align:center;${j?'border-left:1px solid var(--border)':''}">
         <div style="font-size:var(--fs-xs);color:var(--t3)">${k[0]}</div>
         <div class="num" style="font-size:var(--fs-lg);font-weight:700;margin-top:var(--sp-1)">${k[1]}</div></div>`).join('')}</div>
   ${h.risk==='高'?`<div class="note" style="background:var(--danger-bg);border-color:var(--danger-bd);color:var(--danger-fg-strong);margin-bottom:var(--sp-3)">
     品牌安全校验未过。高风险热点入库备查，但永不自动提案，也不建议手动使用。</div>`:''}
   <div style="font-size:var(--fs-sm);color:var(--t2);line-height:1.7;margin-bottom:var(--sp-3)">${esc(h.why)}</div>
   <div class="ctx"><div class="ctxr"><span class="k">来源</span><span class="v">${h.src}</span></div>
     <div class="ctxr"><span class="k">采集时间</span><span class="v">${h.up}</span></div>
     <div class="ctxr"><span class="k">使用状态</span><span class="v">${h.use}</span></div>
     <div class="ctxr"><span class="k">采集者</span><span class="v">${nick('trend')}</span></div></div>
   ${hotAnalysisSections(h)}
   <div style="font-size:var(--fs-xs);font-weight:600;color:var(--t2);margin:var(--sp-4) 0 8px">证据</div>
   ${Array.from({length:Math.min(h.links,3)}).map((_,j)=>`<div class="vrow">
     <span class="vv">${j+1}</span><span class="vt">${h.plat} · 相关笔记 ${j+1}</span>
     <span class="vd"><button style="color:var(--primary)" onclick="toast('打开原帖')">打开 ↗</button></span></div>`).join('')}
   <div class="note" style="margin-top:var(--sp-3)">热点是素材，不是任务。要用它就开一条内容线程——热点本身不会自己变成活儿。</div>
  </div>
  <div class="dw-f">
   ${h.risk!=='高'&&h.use!=='已使用'?`<button class="btn" onclick="useHot(${i})">用它开一条内容</button>`:''}
   <button class="btn ghost" onclick="toast('已标记为不适用 · 会回到 ${nick('trend')} 的反馈回路')">标记不适用</button>
  </div>`;
 $('dw').classList.add('on');$('scrim').classList.add('on');
}
function useHot(i){
 const h=HOTS[i];h.use='已使用';
 const id='ht'+Date.now();
 T.unshift({cr:{s:'h',w:'du'},trig:'manual',id,new:1,t:'蹭「'+h.n+'」出内容',camp:'11.11 大促',dom:'内容',ag:'gen',own:'du',
  st:'run',up:'刚刚',day:0,lv:'M2',cost:'¥0.20',trig:'manual',
  intent:{who:'du',tx:'用知识库里的热点「'+h.n+'」做一组内容。'+h.why,at:'刚刚'},
  plan:{v:1,tx:'以该热点为切入点生成内容方向。',steps:[
   {l:'读取热点证据与品牌禁用词',m:h.links+' 条证据 · 适配 '+Math.round(h.fit*100)+'%',s:'act',r:'刚开始'},
   {l:'生成 2 个内容方向',m:'—',s:'todo',r:'—'},
   {l:'批准后出正文',m:'—',s:'todo',r:'—'}]},cmts:[]});
 closeDw();go('thread',id);toast('已开线程 · 热点标记为已使用');
}

/* ============ Agents ============ */
const LV=[
 {k:'M1',n:'PM 逐条确认',d:'每一条产出都要 PM 确认后才算数。新上线或编辑率高的 agent 从这里开始。'},
 {k:'M2',n:'直接交给运营',d:'产出直接进运营的审批队列，不经过 PM。绝大多数已验证的 agent 在这一档。'},
 {k:'M3',n:'自动执行 · 例外找人',d:'常规情况自动跑完，只有异常或超出规则边界才停下来找人。'}
];
const BS={live:{n:'已上线',c:'done'},dev:{n:'开发中',c:'run'},plan:{n:'规划中',c:'todo'}};
const REG=[
 {id:'ppt',nick:'小演',em:'▣',avg:'2分16秒',n:'PPT Agent',d:'根据表单需求生成可编辑大纲，确认后制作演示文稿，并提供下载与在线编辑地址。',dom:'内容',b:'live',lv:0,own:'Sophie',pm:'dudu',tr:['manual'],out:['PPT'],r:18,ok:94,ed:17,c:'¥246',maturity:'M1',rating:'4.7',returnRate:'8%',ontime:'94%',risk:'正常',sla:'10',exceptionOwner:'产品经理',enabled:true},
 {id:'gen',nick:'阿文',em:'✍️',avg:'1分12秒',n:'内容生成 Agent',d:'按品牌调性与活动 Brief 生成社媒正文、话题与配图建议。',dom:'内容',b:'live',lv:1,own:'Sophie',pm:'dudu',tr:['manual','proposal'],out:['社媒内容'],r:142,ok:94,ed:18,c:'¥1,840',rec:['内容 Brief → 3 方向 → 策划文档']},
 {id:'vid',nick:'阿影',em:'🎬',avg:'—',n:'视频生成 Agent',d:'脚本 → 分镜表 → 分镜图片。自动剪辑成片尚未具备，成片目前仍需人工完成。',dom:'内容',b:'plan',lv:0,own:'Sophie',pm:'dudu',tr:['manual'],out:['视频'],r:0,ok:0,ed:0,c:'—'},
 {id:'plan',nick:'小策',em:'🗂',avg:'1分46秒',n:'活动策划 Agent',d:'生成活动主题、排期、预算分配与渠道分工。',dom:'内容',b:'live',lv:1,own:'Sophie',pm:'dudu',tr:['manual'],out:['活动策划'],r:24,ok:91,ed:22,c:'¥680'},
 {id:'pub',nick:'小发',em:'📤',avg:'22秒',n:'社媒发布 Agent',d:'把已批准内容推送到小红书/抖音并回收数据。',dom:'内容',b:'live',lv:2,own:'Sophie',pm:'dudu',tr:['orchestrated'],out:[],r:96,ok:98,ed:2,c:'¥210'},
 {id:'trend',nick:'小趋',em:'📈',avg:'36秒',n:'趋势 / 热点 Agent',d:'采集平台热点，按品牌适配度和风险打分入库；时效性强的单独提案。',dom:'内容',b:'live',lv:0,own:'Sophie',pm:'Sophie',tr:['scheduled'],out:['提案','热点'],r:210,ok:76,ed:0,c:'¥940',cfg:'trend'},
 {id:'listen',nick:'小听',em:'👂',avg:'2分18秒',n:'舆情监控 Agent',d:'每日计算品牌社交健康度，负面聚集时提案。只观察，从不发布或回复。',dom:'用户运营',b:'live',lv:0,own:'Ariel',pm:'Sophie',tr:['scheduled'],out:['提案','舆情发现'],r:90,ok:92,ed:4,c:'¥1,120',cfg:'listen'},
 {id:'comp',nick:'小竞',em:'🔍',avg:'2分04秒',n:'竞品分析 Agent',d:'跟踪竞品内容动作与投放变化，沉淀到知识库。',dom:'内容',b:'live',lv:0,own:'Sophie',pm:'Sophie',tr:['scheduled'],out:['文档'],r:31,ok:89,ed:15,c:'¥520'},
 {id:'pdp',nick:'小详',em:'📄',avg:'1分28秒',n:'详情页 Agent',d:'按类目规则生成详情页字段、图片规格与 A+ 模块。',dom:'电商',b:'live',lv:0,own:'Brooks',pm:'Brooks',tr:['manual'],out:['详情页'],r:57,ok:92,ed:41,c:'¥760'},
 {id:'ecamp',nick:'小促',em:'🎯',avg:'—',n:'电商活动策划 Agent',d:'规划平台大促、店铺活动、优惠机制与价格策略。',dom:'电商',b:'dev',lv:1,own:'Brooks',pm:'Brooks',tr:['manual'],out:['活动策划'],r:0,ok:0,ed:0,c:'—'},
 {id:'adplan',nick:'小投',em:'📊',avg:'4分26秒',n:'电商广告规划 Agent',d:'规划天猫/抖音投放目标、人群、卖点与广告结构。',dom:'电商',b:'dev',lv:1,own:'Brooks',pm:'Brooks',tr:['manual'],out:['广告计划'],r:0,ok:0,ed:0,c:'—'},
 {id:'promoimg',nick:'推广计划',em:'图',avg:'2分48秒',n:'推广计划 Agent',d:'读取产品图片、卖点与活动 Brief，生成电商推广图片，涵盖商品场景创意图。',descEn:'Generate e-commerce promotional images from product photos, selling points and campaign briefs, including hero images, promotional posters and lifestyle creatives. Support multiple aspect ratios, reference images and prompt refinement. Require human approval before delivery; never launch ads automatically.',dom:'电商',b:'live',lv:0,own:'Brooks',pm:'Sam',tr:['manual'],out:['电商推广图片'],r:24,ok:96,ed:12,c:'¥168',maturity:'M1',rating:'4.8',returnRate:'4%',ontime:'96%',risk:'正常',sla:'10',exceptionOwner:'产品经理',enabled:true},
 {id:'ad',nick:'小优',em:'⚡',avg:'54秒',n:'广告优化 Agent',d:'按表现数据暂停、放量、复测人群或替换创意。',dom:'电商',b:'live',lv:2,own:'Brooks',pm:'Brooks',tr:['scheduled','proposal'],out:['广告计划','提案'],r:88,ok:81,ed:12,c:'¥1,410'},
 {id:'insp',nick:'小巡',em:'🔦',avg:'18秒',n:'店铺日常巡检 Agent',d:'每日检查库存、价格、广告与销售异常并汇报。',dom:'电商',b:'live',lv:0,own:'Brooks',pm:'Brooks',tr:['scheduled'],out:['巡检发现'],r:31,ok:96,ed:0,c:'¥180'},
 {id:'exec',nick:'小执',em:'✅',avg:'12秒',n:'审批执行 Agent',d:'涉及费用、发布或不可逆的平台动作，人工确认后执行。',dom:'电商',b:'live',lv:1,own:'Brooks',pm:'Shlomi',tr:['orchestrated'],out:[],r:44,ok:99,ed:1,c:'¥90'},
 {id:'list',nick:'小架',em:'📦',avg:'47秒',n:'商品上架 Agent',d:'活动报名、商品详情更新与平台表单自动化。',dom:'电商',b:'plan',lv:0,own:'Brooks',pm:'Brooks',tr:['orchestrated'],out:[],r:0,ok:0,ed:0,c:'—'},
 {id:'cs',nick:'小服',em:'💬',avg:'3.2秒',n:'电商客服 Agent',d:'匹配角色与规则，为进线会话生成回复草稿。',dom:'用户运营',b:'live',lv:2,own:'Ariel',pm:'Ariel',tr:['event'],out:['客服回复'],r:1284,ok:93,ed:12,c:'¥620'},
 {id:'crm',nick:'小客',em:'🔄',avg:'—',n:'CRM 活动策划 Agent',d:'规划复购、召回与生命周期活动。',dom:'用户运营',b:'dev',lv:1,own:'Ariel',pm:'Ariel',tr:['manual'],out:['活动策划'],r:0,ok:0,ed:0,c:'—'},
 {id:'msg',nick:'小信',em:'✉️',avg:'41秒',n:'消息内容生成 Agent',d:'按人群与场景生成触达文案。',dom:'用户运营',b:'live',lv:1,own:'Ariel',pm:'Ariel',tr:['manual'],out:['客服回复'],r:73,ok:90,ed:26,c:'¥310'},
 {id:'kol',nick:'小达',em:'⭐',avg:'3分12秒',n:'达人策略 Agent',d:'按品牌目标建立达人画像、候选池与优先级。',dom:'KOL',b:'dev',lv:1,own:'Sam',pm:'Sophie',tr:['manual'],out:['达人清单'],r:14,ok:89,ed:29,c:'¥420'},
 {id:'brief',nick:'小笺',em:'📋',avg:'58秒',n:'Brief 与沟通 Agent',d:'生成合作 Brief、跟进沟通并记录确认状态。',dom:'KOL',b:'dev',lv:0,own:'Sam',pm:'Sophie',tr:['orchestrated'],out:['文档'],r:9,ok:84,ed:38,c:'¥180'},
 {id:'recap',nick:'小盘',em:'📑',avg:'—',n:'内容审核与复盘 Agent',d:'审核交付内容并汇总曝光、互动与转化表现。',dom:'KOL',b:'plan',lv:0,own:'Sam',pm:'Sophie',tr:['scheduled'],out:['文档'],r:0,ok:0,ed:0,c:'—'},
 {id:'seo',nick:'小搜',em:'🔎',avg:'3分06秒',n:'B2B SEO Agent',d:'站内关键词、内容主题、文章结构和自动发布。',dom:'B2B',b:'live',lv:2,own:'Sophie',pm:'Sophie',tr:['scheduled'],out:['SEO 文章'],r:33,ok:95,ed:9,c:'¥890'},
 {id:'geo',nick:'小引',em:'🤖',avg:'—',n:'B2B GEO Agent',d:'优化 AI 与生成式搜索中的品牌可见度和引用。',dom:'B2B',b:'dev',lv:1,own:'Sophie',pm:'Sophie',tr:['scheduled'],out:['SEO 文章'],r:0,ok:0,ed:0,c:'—'},
 {id:'sem',nick:'小价',em:'💰',avg:'—',n:'B2B SEM Agent',d:'搜索广告关键词、广告组、落地页和线索捕获。',dom:'B2B',b:'plan',lv:1,own:'Sophie',pm:'Sophie',tr:['manual'],out:['广告计划'],r:0,ok:0,ed:0,c:'—'},
 {id:'orch',nick:'小排',em:'🧭',avg:'8秒',n:'Orchestrator',d:'把一句话拆成计划，分派给合适的 agent 并跟踪。',dom:'平台',b:'live',lv:0,own:'Shlomi',pm:'Shlomi',tr:['manual'],out:[],r:318,ok:91,ed:0,c:'¥2,140'},
 {id:'broker',nick:'小荐',em:'💡',avg:'31秒',n:'提案经纪 Agent',d:'汇总各 agent 的提案，按注意力预算排序后推给你。',dom:'平台',b:'live',lv:0,own:'Shlomi',pm:'Shlomi',tr:['scheduled'],out:['提案'],r:64,ok:88,ed:0,c:'¥160'},
 {id:'routine',nick:'小循',em:'🔁',avg:'4秒',n:'Routine Agent',d:'按排期反复触发例行任务。每次触发生成一条任务线程，跑在「工作」里。',dom:'平台',b:'live',lv:2,own:'Shlomi',pm:'Shlomi',tr:['scheduled'],out:[],r:126,ok:99,ed:0,c:'¥240',cfg:'routine'},
 {id:'kb',nick:'小库',em:'📚',avg:'0.6秒',n:'知识库 Agent',d:'索引品牌资料与已批准产出，供其他 agent 检索。',dom:'平台',b:'live',lv:1,own:'Shlomi',pm:'Shlomi',tr:['event'],out:[],r:412,ok:97,ed:0,c:'¥540'},
 {id:'rep',nick:'小报',em:'📰',avg:'6分42秒',n:'报告 Agent',d:'把已批准的产出装配成给客户看的报告。只组装，不重算——数字来自接口，结论来自已批准的分析。',dom:'平台',b:'live',lv:0,own:'Gil',pm:'Shlomi',tr:['scheduled','manual'],out:['客户报告'],r:14,ok:93,ed:34,c:'¥820',cfg:'report'},
 {id:'ana',nick:'小析',em:'📉',avg:'1分04秒',n:'数据分析 Agent',d:'每日巡检、KPI 问答与社媒 × 电商相关性分析。',dom:'平台',b:'live',lv:0,own:'Brooks',pm:'Gil',tr:['scheduled'],out:['文档'],r:62,ok:94,ed:6,c:'¥730'},
 {id:'csa',nick:'小成',em:'🤝',avg:'1分22秒',n:'客户成功 Agent',d:'围绕客户业务数据进行连续问答，并可将分析结论整理为邮件发送。',dom:'平台',b:'live',lv:0,own:'Gil',pm:'Gil',tr:['manual'],out:['数据答复','邮件'],r:28,ok:85,ed:11,c:'¥290'}
];
const DOMC={'内容':'#7C3AED','电商':'#0891B2','用户运营':'#10B981','KOL':'#DB2777','B2B':'#2563EB','平台':'#6D28D9'};
const AGENT_LABELS={
 ppt:'PPT 生成',gen:'内容生成',vid:'视频生成',plan:'活动策划',pub:'社媒发布',trend:'趋势热点',listen:'舆情监控',comp:'竞品分析',
 pdp:'详情页生成',ecamp:'电商活动策划',adplan:'电商广告规划',promoimg:'推广计划',ad:'广告优化',insp:'店铺巡检',exec:'审批执行',list:'商品上架',
 cs:'电商客服',crm:'CRM 活动策划',msg:'消息内容生成',kol:'达人策略',brief:'Brief 沟通',recap:'内容审核复盘',
 seo:'B2B SEO',geo:'B2B GEO',sem:'B2B SEM',orch:'任务编排',broker:'提案经纪',routine:'例行调度',kb:'知识库',
 rep:'报告生成',ana:'数据分析',csa:'客户成功'
};
REG.forEach(a=>{
 a.nick=AGENT_LABELS[a.id]||a.nick;a.n=a.nick;
 if(!AG[a.id])AG[a.id]={n:a.n,c:DOMC[a.dom]||'#8B7FC7',s:(a.nick||a.n).slice(0,1)};
 else AG[a.id].n=a.n;
});
let PAUSED=false;
const RECIPES=[
 {id:'r1',n:'内容 Brief → 3 方向 → 策划文档',d:'最常用的内容起手式。给一句意图，拿回三个方向，选一个再展开。',
  ag:['orch','gen','plan'],dom:'内容',used:64,cad:null,hitl:'approve',own:'dudu'},
 {id:'r2',n:'方向 → 脚本 → 分镜 → 成片',d:'把已批准的内容方向做成竖版短视频。',
  ag:['vid'],dom:'内容',used:22,cad:null,hitl:'approve',own:'dudu'},
 {id:'r3',n:'大促详情页改版',d:'读产品中心 → 生成字段 → 校验类目 → 待人工确认后上架。',
  ag:['pdp','exec'],dom:'电商',used:31,cad:null,hitl:'approve',own:'Brooks'},
 {id:'r4',n:'达人短名单 → 逐个发 Brief',d:'按画像匹配出名单，批准后逐位跟进合作。',
  ag:['kol','brief'],dom:'KOL',used:9,cad:null,hitl:'approve',own:'Sophie'},
 {id:'r5',freq:'每天',time:'05:00',start:'2026/06/01',next3:['明天 05:00','后天 05:00','8月18日 05:00'],catchup:'补跑',overlap:'跳过',retry:2,n:'每日店铺巡检',d:'库存 · 价格 · 广告 · 销售四个维度，异常才建单。',
  ag:['insp','ana'],dom:'电商',used:31,cad:'每天 05:00',tz:'Asia/Shanghai',hitl:'approve',own:'Brooks',
  st:'ok',next:'3 小时后',last:'今天 05:14 · 已送达',dlv:'#店铺运营 (Slack)',
  runs:[{at:'今天 05:14',trig:'定时',dur:'18秒',res:'2 项异常',tid:'t10',art:'巡检发现 · 断货风险'},
   {at:'昨天 05:14',trig:'定时',dur:'16秒',res:'无异常',silent:1},
   {at:'前天 05:14',trig:'定时',dur:'19秒',res:'1 项异常',tid:'t10',art:'价格错配 · 已归档'}]},
 {id:'r6',freq:'每天',time:'02:00',start:'2026/05/18',next3:['明天 02:00','后天 02:00','8月18日 02:00'],catchup:'补跑',overlap:'跳过',retry:2,n:'每日社交健康度',d:'算完才更新品牌健康分。负面聚集时建单。',
  ag:['listen'],dom:'用户运营',used:90,cad:'每天 02:00',tz:'Asia/Shanghai',hitl:'approve',own:'Ariel',
  st:'ok',next:'明天 02:00',last:'今天 02:14 · 已送达',dlv:'#品牌 (Slack)',
  runs:[{at:'今天 02:14',trig:'定时',dur:'2分18秒',res:'健康分 54 · 风险修正 −10',tid:'t17',art:'舆情发现 · 物流破损负面聚集'},
   {at:'昨天 02:11',trig:'定时',dur:'2分12秒',res:'健康分 60 · 无风险',silent:1}]},
 {id:'r7',freq:'每月 1 日',time:'09:00',start:'2026/06/01',next3:['9月1日 09:00','10月1日 09:00','11月1日 09:00'],catchup:'跳过',overlap:'跳过',retry:1,n:'月度电商大促报名',d:'策划 → 审批 → 自动报名。涉及不可逆动作，中间必须停。',
  ag:['ecamp','exec'],dom:'电商',used:6,cad:'每月 1 日',tz:'Asia/Shanghai',hitl:'approve',own:'Brooks',
  st:'pend',next:'卡在审批',last:'今天 09:12 起等待',dlv:'#电商 (Slack)',attn:1,
  gate:{step:2,done:'电商活动策划 → 方案已生成 ✓',todo:'审批执行 Agent — 在天猫完成活动报名',
   chg:['+ 1 个活动','+ 8 个 SKU 报名'],rev:'可逆 — 上线前可撤销报名',since:'今天 09:12'},
  runs:[{at:'今天 09:12',trig:'定时',dur:'—',res:'等待审批',gate:1,tid:'t18'},
   {at:'7月1日',trig:'定时',dur:'3分40秒',res:'已完成 · 6 个 SKU',tid:'t18',art:'活动报名 · 已归档'}]},
 {id:'r8',freq:'每月 1 日',time:'08:00',start:'2026/01/01',next3:['9月1日 08:00','10月1日 08:00','11月1日 08:00'],catchup:'补跑',overlap:'排队',retry:2,n:'月度 SEO 内容集群',d:'关键词聚类 → 结构 → 正文 → 自动发布。',
  ag:['seo'],dom:'B2B',used:12,cad:'每月 1 日',tz:'Asia/Shanghai',hitl:'approve',own:'Sophie',
  st:'idle',next:'9月1日',last:'8月1日 · 已送达',dlv:'#B2B (Slack)',
  runs:[{at:'8月1日',trig:'定时',dur:'9分12秒',res:'3 篇已发布',tid:'t9',art:'SEO 文章 × 3'}]},
 {id:'r10',n:'周度竞品动作扫描',d:'扫竞品主推词、投放和内容变化，有策略级变化才建单。',
  ag:['comp'],dom:'内容',used:1,cad:'每周五 16:00',tz:'Asia/Shanghai',freq:'每周五',time:'16:00',start:'2026/08/08',
  next3:['本周五 16:00','8月22日 16:00','8月29日 16:00'],catchup:'跳过',overlap:'跳过',retry:2,
  hitl:'approve',own:'Sophie',st:'ok',next:'本周五 16:00',last:'上周五 · 已送达',dlv:'#品牌 (Slack)',fresh:1,
  runs:[{at:'上周五 16:00',trig:'定时',dur:'2分04秒',res:'无策略级变化',silent:1}]},
 {id:'r12',n:'每日抖音达人采集',d:'抖音达人不是靠开任务找出来的——每天按画像采集推荐，进达人库。要用的时候从库里筛。',
  ag:['kol'],dom:'KOL',used:0,cad:'每天 06:00',tz:'Asia/Shanghai',freq:'每天',time:'06:00',start:'2026/07/01',
  next3:['明天 06:00','后天 06:00','8月18日 06:00'],catchup:'跳过',overlap:'跳过',retry:2,
  hitl:'approve',own:'Sophie',st:'ok',next:'明天 06:00',last:'今天 06:12 · 已入库 34 位',dlv:'只留在系统里，不外送',
  runs:[{at:'今天 06:12',trig:'定时',dur:'3分41秒',res:'新增 34 位 · 12 位达到匹配线',silent:1},
   {at:'昨天 06:10',trig:'定时',dur:'3分22秒',res:'新增 28 位 · 9 位达到匹配线',silent:1},
   {at:'前天 06:14',trig:'定时',dur:'3分50秒',res:'新增 41 位 · 15 位达到匹配线',silent:1}]},
 {id:'r11',n:'月度客户报告',d:'装配上月成果，按客户口径出报告。涉及外发，中间必须停。',
  ag:['ana','comp','rep'],dom:'平台',used:14,cad:'每月 1 日 08:00',tz:'Asia/Shanghai',freq:'每月 1 日',time:'08:00',start:'2026/03/01',
  next3:['9月1日 08:00','10月1日 08:00','11月1日 08:00'],catchup:'补跑',overlap:'跳过',retry:2,
  hitl:'approve',own:'Gil',st:'pend',next:'卡在审批',last:'今天 08:00 起等待',dlv:'#客户交付 (Slack)',attn:1,
  runs:[{at:'今天 08:00',trig:'定时',dur:'6分42秒',res:'受众口径未过 · 等审批',tid:'t21',art:'客户报告 · 8 月'},
   {at:'7月1日 08:00',trig:'定时',dur:'6分10秒',res:'已交付',tid:'t21',art:'客户报告 · 7 月'},
   {at:'6月1日 08:00',trig:'定时',dur:'7分02秒',res:'已交付 · 退回 1 次',tid:'t21',art:'客户报告 · 6 月'}]},
 {id:'r9',freq:'每周一',time:'09:00',start:'2026/04/06',next3:['已暂停','—','—'],catchup:'跳过',overlap:'跳过',retry:2,n:'周度广告表现',d:'拉取投放数据，异常时提案。',
  ag:['ana','ad'],dom:'电商',used:18,cad:'每周一 09:00',tz:'Asia/Shanghai',hitl:'approve',own:'Brooks',
  st:'fail',next:'已暂停',last:'本周一 · 失败',dlv:'#电商 (Slack)',attn:1,
  err:'数据源超时 · 连续 2 次失败后自动停用',
  runs:[{at:'本周一 09:00',trig:'定时',dur:'—',res:'数据源超时',fail:1},
   {at:'上周一 09:00',trig:'定时',dur:'—',res:'数据源超时',fail:1}]}
];
const TRN={manual:'手动',scheduled:'定时',event:'事件',orchestrated:'被编排',proposal:'提案'};
function requiresApproval(){return true;}
function approvalPill(){return '<span class="recipe-chain-arrow">→</span><span class="pstepc approval">⛒ 审批</span>';}

function vAgents(){
 if(S.atab===undefined)S.atab=0;
 if(S.adom===undefined)S.adom='全部';
 if(S.alv===undefined)S.alv='全部';
 const doms=['全部','内容','电商','用户运营','KOL','B2B','平台'];
 const levels=['全部','M1','M2','M3'];
 const L=REG.filter(a=>(S.adom==='全部'||a.dom===S.adom)&&(S.alv==='全部'||LV[a.lv].k===S.alv));
 const live=REG.filter(a=>a.b==='live').length;
 return `<div class="wrap">
  <div class="eyebrow">平台 · Agents</div><h1>Agents</h1>
  <div class="sub">这里是登记处，不是工作台。每个 agent 的自主级别、归属、成本和产出类型都在这里定——工作永远发生在「工作」里。</div>
  <div class="daystrip"><span class="sm"><span class="odot on"></span> 在线 <b class="num">${REG.filter(a=>ONLINE[a.id]).length}</b> · 共 <b class="num">${REG.length}</b> 个 · 已上线 <b class="num">${live}</b> · 开发中 <b class="num">${REG.filter(a=>a.b==='dev').length}</b> · 规划中 <b class="num">${REG.filter(a=>a.b==='plan').length}</b></span></div>
  <div class="bar">
    <div class="seg"><button class="${S.atab===0?'on':''}" onclick="S.atab=0;render()">Agent 登记处</button>
      <button class="${S.atab===1?'on':''}" onclick="S.atab=1;render()">配方 ${RECIPES.filter(r=>!r.cad).length}</button>
      <button class="${S.atab===2?'on':''}" onclick="S.atab=2;render()">例行 ${RECIPES.filter(r=>r.cad).length}
        ${RECIPES.filter(r=>r.attn).length?`<span class="n" style="background:var(--gold);color:#fff;font-family:'Sora';font-size:var(--fs-xs);font-weight:700;border-radius:9px;padding:0 5px;margin-left:var(--sp-1)">${RECIPES.filter(r=>r.attn).length}</span>`:''}</button></div>
    ${S.atab===0?`<div class="seg">${doms.map(d=>`<button class="${S.adom===d?'on':''}" onclick="S.adom='${d}';render()">${d}</button>`).join('')}</div><div class="seg">${levels.map(l=>`<button class="${S.alv===l?'on':''}" onclick="S.alv='${l}';render()">${l}</button>`).join('')}</div>`:''}
  </div>
  ${S.atab===0?L.map(agRow).join(''):S.atab===1?recipesOnly():routinesOnly()}
 </div>`;
}
function agRow(a){
 const l=LV[a.lv], hot=a.ed>=30&&a.b==='live',m=agAdmin(a);
 return `<button class="row" onclick="openAgent('${a.id}')" style="align-items:flex-start;padding:var(--sp-3) 14px">
  ${AV(a.id,34)}
  <span style="flex:1;min-width:0">
    <span style="display:flex;align-items:center;gap:var(--sp-2);flex-wrap:wrap">
      <span class="odot ${ONLINE[a.id]?'on':'off'}" title="${ONLINE[a.id]?'在线':'离线'}"></span>
      <b style="font-size:var(--fs-md)">${a.nick}</b><span class="st ${BS[a.b].c}">${BS[a.b].n}</span>
      <span class="chip lv">${l.k} ${l.n}</span><span class="chip dom">${a.dom}</span>
      ${hot?'<span class="chip" style="background:var(--warn-bg);color:var(--warn-fg);border:1px solid var(--warn-bd)">编辑率偏高</span>':''}</span>
    <span style="display:block;font-size:var(--fs-sm);color:var(--t2);margin-top:var(--sp-1);line-height:1.55">${esc(a.d)}</span>
    <span style="display:block;font-size:var(--fs-xs);color:var(--t3);margin-top:var(--sp-1)">
      PM ${a.pm} · 成功率 <span class="num">${a.b==='live'?a.ok+'%':'—'}</span> · 平均评分 <span class="num">${m.rating}</span> · 返工率 <span class="num">${m.returnRate}</span> · 准时率 <span class="num">${m.ontime}</span> · 风险 <span class="num" style="${m.risk!=='正常'?'color:var(--warn-fg);font-weight:600':''}">${m.risk}</span>
    </span>
  </span></button>`;
}


function recipesOnly(){
 const M=RECIPES.filter(r=>!r.cad);
 return `<div class="bar" style="margin:0 0 14px"><span class="chip mut">${M.length} 个配方</span>
   <span class="spacer"></span><button class="btn sm" onclick="newRecipe()">＋ 新建配方</button></div>
 ${M.length?M.map(r=>rcRow(r,0)).join(''):'<div class="allclear">还没有配方。把常用的链路存成配方，下次一键开始。</div>'}`;
}
function routinesOnly(){
  const R=RECIPES.filter(r=>r.cad),attn=R.filter(r=>r.attn);
 return `${PAUSED?`<div class="note" style="background:var(--danger-bg);border-color:var(--danger-bd);color:var(--danger-fg-strong);margin-bottom:var(--sp-3);display:flex;align-items:center;gap:var(--sp-3)">
   <span style="flex:1">⏸ 所有例行已全局暂停——没有任何定时触发会发生。进行中的跑完，新的不启动。</span>
   <button class="btn sm" onclick="PAUSED=false;render();toast('已恢复')">全部恢复</button></div>`:''}
 <div class="bar" style="margin:0 0 14px">
   <span class="chip mut">${R.length} 条例行</span>
   <span class="chip mut">${R.filter(r=>r.st==='ok').length} 正常</span>
   ${R.filter(r=>r.st==='fail').length?`<span class="st hold">${R.filter(r=>r.st==='fail').length} 已停用</span>`:''}
   <span class="spacer"></span>
   <button class="btn ghost sm" onclick="${PAUSED?"PAUSED=false;render();toast('已恢复')":"askPause()"}">${PAUSED?'全部恢复':'全局暂停'}</button>
   <button class="btn sm" onclick="newRoutine(null)">＋ 新建例行</button></div>
 ${attn.length?`<div class="sech"><span class="t" style="color:var(--warn-fg)">需要你处理</span><span class="n num">${attn.length}</span><span class="bar2"></span></div>
   ${attn.map(r=>rcRow(r,1)).join('')}<div style="height:14px"></div>`:''}
 ${R.filter(r=>!r.attn).map(r=>rcRow(r,1)).join('')}`;
}

function _oldRecipesView(){
  const R=RECIPES.filter(r=>r.cad),M=RECIPES.filter(r=>!r.cad);
 const attn=RECIPES.filter(r=>r.attn);
 return `${PAUSED?`<div class="note" style="background:var(--danger-bg);border-color:var(--danger-bd);color:var(--danger-fg-strong);margin-bottom:var(--sp-3);display:flex;align-items:center;gap:var(--sp-3)">
   <span style="flex:1">⏸ 所有例行已全局暂停——没有任何定时触发会发生。进行中的跑完，新的不启动。</span>
   <button class="btn sm" onclick="PAUSED=false;render();toast('已恢复')">全部恢复</button></div>`:''}
 <div class="note" style="margin-bottom:var(--sp-3)">
   配方和例行是同一个东西：<b>一串按顺序跑的 agent</b>。手动跑就是配方，挂上排期就是例行。<br>
   每次触发都生成一条任务线程，跑在「工作」里——例行没有自己的工作台。</div>
 ${attn.length?`<div class="sech"><span class="t" style="color:var(--warn-fg)">需要你处理</span><span class="n num">${attn.length}</span><span class="bar2"></span></div>
   ${attn.map(r=>rcRow(r,1)).join('')}`:''}
 <div class="sech" style="margin-top:${attn.length?'22px':'0'}"><span class="t">例行 · 有排期</span><span class="n num">${R.length}</span><span class="bar2"></span>
   <button class="btn ghost sm" style="margin-left:auto" onclick="${PAUSED?"PAUSED=false;render();toast('已恢复')":"askPause()"}">${PAUSED?'全部恢复':'全局暂停'}</button>
   <button class="btn sm" onclick="newRoutine(null)">＋ 新建例行</button></div>
 ${R.filter(r=>!r.attn).map(r=>rcRow(r,1)).join('')}
 <div class="sech" style="margin-top:var(--sp-5)"><span class="t">配方 · 手动跑</span><span class="n num">${M.length}</span><span class="bar2"></span>
   <span class="hint">给它一个排期就变成例行</span></div>
 ${M.map(r=>rcRow(r,0)).join('')}`;
}
function askPause(){
 $('mod').innerHTML=`<div class="mbox" style="max-width:460px">
  <div class="mhd"><div class="e">全局暂停</div><h3>暂停所有例行？</h3></div>
  <div class="mbd"><div style="font-size:var(--fs-sm);color:var(--t2);line-height:1.7">
    所有定时触发立刻停止，直到你恢复。<b>进行中的跑完，新的不启动。</b><br>
    手动配方不受影响。</div></div>
  <div class="mft"><button class="btn" onclick="PAUSED=true;closeMod();render();toast('所有例行已暂停')">暂停全部</button>
    <button class="btn ghost" onclick="closeMod()">取消</button></div></div>`;
 $('mod').classList.add('on');
}
const RST2={ok:'done',pend:'review',idle:'todo',fail:'hold'};
const RSTN={ok:'正常',pend:'等审批',idle:'待触发',fail:'已停用'};
function rcRow(r,sched){
 return `<div class="pcard" style="${r.attn?'border-left:3px solid var(--gold);':''}${r.st==='fail'?'border-left:3px solid var(--red);':''}">
  <div style="display:flex;align-items:flex-start;gap:var(--sp-3);padding:var(--sp-3) 16px 0">
    <div style="flex:1;min-width:0">
      <div style="display:flex;align-items:center;gap:var(--sp-2);flex-wrap:wrap">
        <b style="font-size:var(--fs-md)">${esc(r.n)}</b>
        ${sched?`<span class="st ${RST2[r.st]}">${RSTN[r.st]}</span>`:'<span class="chip mut">手动</span>'}
        ${r.fresh?'<span class="chip" style="background:#ECFEFF;color:#0E7490;border:1px solid #A5F3FC">新建 · 看前几次</span>':''}
        <span class="chip dom">${r.dom}</span></div>
      <div style="font-size:var(--fs-sm);color:var(--t2);margin-top:var(--sp-1);line-height:1.6">${esc(r.d)}</div>
    </div>
    <div style="text-align:right;flex:0 0 auto">
      <div style="font-size:var(--fs-xs);color:var(--t3);white-space:nowrap">${sched?'下次':'用过'}</div>
      <div class="num" style="font-size:var(--fs-sm);font-weight:600;white-space:nowrap">${sched?(PAUSED?'已暂停':r.next):r.used+' 次'}</div>
      ${sched?`<div style="font-size:var(--fs-xs);color:var(--t3);margin-top:var(--sp-1);white-space:nowrap">${r.freq} ${r.time}</div>`:''}</div>
  </div>
  <div class="pcp" style="border-top:0;background:transparent;padding:var(--sp-3) 16px 0">
    <span class="lb">链路</span>
    ${r.ag.map((x,i)=>`<span class="pstepc">${AV(x,16)} ${nick(x)}</span>`).join('<span style="color:var(--t3)">→</span>')}
    ${requiresApproval(r)?approvalPill():''}
    ${r.dlv?`<span class="lb" style="margin-left:auto">送达 ${r.dlv}</span>`:''}
  </div>
  ${r.err?`<div class="note" style="background:var(--danger-bg);border-color:var(--danger-bd);color:var(--danger-fg-strong);margin:var(--sp-3) 16px 0">${esc(r.err)}</div>`:''}
  ${r.gate?`<div class="note" style="background:var(--warn-bg);border-color:var(--warn-bd);color:#92400E;margin:var(--sp-3) 16px 0">
    卡在审批门 · ${r.gate.since} 起等待。<b>还什么都没执行。</b></div>`:''}
  <div class="pca">
    ${r.gate?`<button class="btn sm" onclick="openGate('${r.id}')">看会执行什么 ↗</button>`:''}
    ${sched?`<button class="btn ghost sm" onclick="openRc('${r.id}')">排期与历史 ↗</button>
      <button class="btn ghost sm" onclick="newRoutine(RECIPES.find(x=>x.id==='${r.id}'),1)">编辑</button>
      ${r.st==='fail'?`<button class="btn ghost sm" onclick="toast('已重新启用 · 下次按原排期跑')">重新启用</button>`
       :`<button class="btn ghost sm" onclick="toast('已暂停「${esc(r.n)}」')">暂停</button>`}
      <button class="btn ghost sm" onclick="toast('已立即触发一次 · 线程已建')">立即跑一次</button>`
     :`<button class="btn sm" onclick="openRecipe(RECIPES.findIndex(x=>x.id==='${r.id}'))">用它开始</button>
      <button class="btn ghost sm" onclick="newRoutine(RECIPES.find(x=>x.id==='${r.id}'))">加排期 ↗</button>
      <button class="btn ghost sm" onclick="editRecipe('${r.id}')">编辑</button>`}
    <span style="margin-left:auto;font-size:var(--fs-xs);color:var(--t3)">负责人 ${r.own}${sched&&r.runs?' · 近 '+r.runs.length+' 次跑出 '+r.runs.filter(x=>x.tid).length+' 条线程':''}</span>
  </div></div>`;
}

function runRow(x){
 const t=x.tid?T.find(y=>y.id===x.tid):null;
 const tone=x.fail?'#B91C1C':x.gate?'#B45309':x.silent?'var(--t3)':'var(--t2)';
 return `<div class="runrow ${x.fail?'fail':x.gate?'gate':''}">
  <div style="display:flex;align-items:center;gap:var(--sp-2)">
    <span class="vv">${x.trig}</span>
    <span style="flex:1;min-width:0"><b style="font-size:var(--fs-sm)">${x.at}</b>
      <span style="display:block;font-size:var(--fs-xs);color:${tone};margin-top:var(--sp-1)">${esc(x.res)}</span></span>
    <span class="vd num">${x.dur}</span></div>
  ${t?`<button class="runlink" onclick="closeDw();go('thread','${t.id}')">
     <span class="st ${t.st}">${STN[t.st]}</span>
     <span style="flex:1;min-width:0;text-align:left;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(t.t)}</span>
     ${x.art?`<span class="chip mut">${esc(x.art)}</span>`:''}
     <span style="color:var(--primary)">打开 →</span></button>`
   :x.silent?`<div class="runnote">未建线程 · 没有需要人处理的东西</div>`
   :x.gate?`<div class="runnote" style="color:var(--warn-fg)">卡在审批门 · 还未执行</div>`
   :x.fail?`<div class="runnote" style="color:var(--danger-fg)">未产出 · 已重试 0 次</div>`
   :x.arch?`<div class="runnote">${esc(x.arch)}</div>`:''}
 </div>`;
}

function rcSettings(r){
 return `<div style="font-size:var(--fs-xs);font-weight:600;color:var(--t2);margin-bottom:var(--sp-2)">异常处理</div>
 <div class="ctx" style="margin-bottom:var(--sp-4)">
   <div class="ctxr"><span class="k">错过一次</span><span class="v">${r.catchup}${r.catchup==='补跑'?' · 恢复后立刻补一次':' · 直接等下一个周期'}</span></div>
   <div class="ctxr"><span class="k">上次还没跑完</span><span class="v">${r.overlap}</span></div>
   <div class="ctxr"><span class="k">失败重试</span><span class="v">${r.retry} 次后自动停用</span></div>
   <div class="ctxr"><span class="k">送达</span><span class="v">${r.dlv} <span class="chip mut">Phase 2</span></span></div>
   <div class="ctxr"><span class="k">负责人</span><span class="v">${r.own}</span></div></div>
 <div style="font-size:var(--fs-xs);font-weight:600;color:var(--t2);margin-bottom:var(--sp-2)">接下来三次</div>
 <div class="ctx" style="margin-bottom:var(--sp-3)">${(r.next3||[]).map((n,i)=>`<div class="ctxr">
   <span class="k">${['下次','之后','再之后'][i]}</span><span class="v num">${PAUSED?'已全局暂停':n}</span></div>`).join('')}</div>`;
}
function rcFlow(r){
 return `<div style="font-size:var(--fs-xs);font-weight:600;color:var(--t2);margin-bottom:var(--sp-2)">链路 · 每一步的产出喂给下一步</div>
 ${r.ag.map((x,i)=>`<div class="vrow"><span class="vv">${i+1}</span>${AV(x,20)}
   <span class="vt"><b style="color:var(--t1)">${nick(x)}</b></span></div>`).join('')}
 ${requiresApproval(r)?`<div class="vrow" style="background:var(--warn-bg);border-radius:6px;padding:var(--sp-2) 8px;margin-bottom:var(--sp-4)">
   <span class="vv" style="background:var(--gold);color:#fff">⛒</span><span class="vt" style="color:#92400E">审批门 · 流程完成前统一确认</span></div>`:'<div style="height:15px"></div>'}
 <div style="font-size:var(--fs-xs);font-weight:600;color:var(--t2);margin-bottom:var(--sp-2)">排期</div>
 <div class="ctx" style="margin-bottom:var(--sp-3)">
   <div class="ctxr"><span class="k">频率</span><span class="v">${r.freq}</span></div>
   <div class="ctxr"><span class="k">时间</span><span class="v num">${r.time}</span></div>
   <div class="ctxr"><span class="k">时区</span><span class="v">${r.tz}</span></div>
   <div class="ctxr"><span class="k">生效起</span><span class="v num">${r.start}</span></div>
   <div class="ctxr"><span class="k">上次</span><span class="v">${r.last}</span></div></div>
 ${r.fresh?`<div class="note" style="margin-bottom:var(--sp-3)">
   <b>新建的例行，只跑过 ${r.runs.length} 次。</b>头几次盯一下——数据源改格式、字段消失这类漂移，通常在前几次就露出来。</div>`:''}`;
}
function rcHistory(r){
 const runs=r.runs||[];
 return `<div style="display:flex;align-items:center;gap:var(--sp-2);margin-bottom:var(--sp-3)">
   <span class="chip mut">${runs.length} 次运行</span>
   <span class="chip mut">${runs.filter(x=>x.tid).length} 次产出线程</span>
   <span class="chip mut">${runs.filter(x=>x.silent).length} 次静默</span></div>
  ${runs.length?runs.map(x=>runRow(x)).join(''):'<div class="allclear">还没有运行记录。</div>'}
  <div class="note" style="margin-top:var(--sp-3)"><b>所有运行都记在同一条常驻线程里</b>，不会每次新开一条——否则一条日更例行一年就是 365 条。<br>
   静默的那次不留产出也不打扰你。只有需要你处理的产出会浮到「今日」。</div>`;
}
function openRc(id,tab){
 const r=RECIPES.find(x=>x.id===id);
 S.rctab=Number.isInteger(tab)?tab:0;
 $('dw').innerHTML=`<div class="dw-h">
   <button class="ib" onclick="closeDw()"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
   <div style="flex:1;min-width:0"><div class="ty">例行 · ${r.dom}</div><h3>${esc(r.n)}</h3></div>
   <span class="st ${RST2[r.st]}">${RSTN[r.st]}</span></div>
  <div class="dw-tabs"><button class="${S.rctab===0?'on':''}" onclick="openRc('${r.id}',0)">运行历史</button>
   <button class="${S.rctab===1?'on':''}" onclick="openRc('${r.id}',1)">例行设置</button>
   <button class="${S.rctab===2?'on':''}" onclick="openRc('${r.id}',2)">异常处理</button></div>
  <div class="dw-b">${S.rctab===0?rcHistory(r):S.rctab===1?rcFlow(r):rcSettings(r)}</div>
  <div class="dw-f">
   ${S.rctab!==0?`<button class="btn ghost" onclick="closeDw();newRoutine(RECIPES.find(x=>x.id==='${r.id}'),1)">编辑</button>`:''}
   <button class="btn ghost" onclick="toast('已立即触发一次')">立即跑一次</button>
   ${(r.runs||[]).find(x=>x.tid)?`<button class="btn ghost" onclick="closeDw();go('thread','${(r.runs||[]).find(x=>x.tid).tid}')">打开常驻线程 →</button>`:''}
  </div>`;
 $('dw').classList.add('on');$('scrim').classList.add('on');
}
function openGate(id){
 const r=RECIPES.find(x=>x.id===id),g=r.gate;
 $('mod').innerHTML=`<div class="mbox" style="max-width:560px">
  <div class="mhd"><div class="e">审批门</div><h3>${esc(r.n)}</h3></div>
  <div class="mbd">
   <div class="note" style="margin-bottom:var(--sp-3)"><b>还什么都没执行。</b>批准会跑第 ${g.step} 步；拒绝会中止这次运行并通知 ${r.own}。</div>
   <div style="font-size:var(--fs-xs);font-weight:600;color:var(--t2);margin-bottom:var(--sp-2)">批准后会执行什么</div>
   <div class="vrow"><span class="vv">1</span><span class="vt" style="color:var(--ok-fg)">${esc(g.done)}</span></div>
   <div class="vrow"><span class="vv" style="background:var(--gold);color:#fff">${g.step}</span><span class="vt">${esc(g.todo)}</span></div>
   <div style="font-size:var(--fs-xs);font-weight:600;color:var(--t2);margin:var(--sp-4) 0 8px">会产生的变更</div>
   <div class="ctx">${g.chg.map(c=>`<div class="ctxr"><span class="v" style="font-weight:400">${esc(c)}</span></div>`).join('')}
     <div class="ctxr"><span class="k">可逆性</span><span class="v" style="color:var(--ok-fg)">${esc(g.rev)}</span></div>
     <div class="ctxr"><span class="k">等待时长</span><span class="v">${g.since} 起</span></div></div>
  </div>
  <div class="mft"><button class="btn" onclick="gateAct('${id}',1)">批准并执行</button>
    <button class="btn ghost" onclick="gateAct('${id}',0)">拒绝</button></div></div>`;
 $('mod').classList.add('on');
}
function gateAct(id,ok){
 const r=RECIPES.find(x=>x.id===id);
 const t=T.find(x=>x.standing===r.id);
 if(ok){
  if(t){t.st='run';t.new=(t.new||0)+1;t.up='刚刚';
   t.plan.steps[1]={l:'⛒ 审批门 · dudu 已批准',m:'可逆 · 上线前可撤销报名',s:'ok',r:'—'};
   t.plan.steps[2]={l:'审批执行 · 在天猫完成报名',m:'进行中',s:'act',r:'刚开始'};}
  r.st='ok';r.attn=0;r.gate=null;r.next='9月1日';r.last='刚刚 · 已完成';
  r.runs[0]={at:'今天 09:12',trig:'定时',dur:'3分52秒',res:'已批准 · 8 个 SKU 报名',tid:'t18',art:'活动报名'};
  toast('已批准 · 在原线程内继续执行，没有新开线程');}
 else {
  if(t){t.st='done';t.up='刚刚';
   t.plan.steps[1]={l:'⛒ 审批门 · dudu 已拒绝',m:'本次运行中止，未执行任何动作',s:'ok',r:'—'};
   t.plan.steps[2]={l:'审批执行 · 未执行',m:'已跳过',s:'todo',r:'—'};
   (t.log=t.log||[]).unshift({at:'今天 09:12',res:'已拒绝 · 未执行',silent:1});}
  r.st='idle';r.attn=0;r.gate=null;r.next='9月1日';r.last='刚刚 · 已拒绝';
  r.runs[0]={at:'今天 09:12',trig:'定时',dur:'—',res:'已拒绝 · 未执行',tid:'t18',art:'本次中止'};
  toast('已拒绝 · 已通知 '+r.own+'，线程保留');}
 closeMod();render();
}

function _oldRcRow(r,i){
 return `<button class="row" onclick="openRecipe(${i})" style="align-items:flex-start;padding:var(--sp-3) 14px">
  <span class="avs" style="background:var(--primary);width:30px;height:30px;flex:0 0 30px;border-radius:8px">配</span>
  <span style="flex:1;min-width:0">
    <span style="display:flex;align-items:center;gap:var(--sp-2);flex-wrap:wrap"><b style="font-size:var(--fs-md)">${esc(r.n)}</b>
      <span class="chip dom">${r.dom}</span><span class="chip mut">用过 ${r.used} 次</span></span>
    <span style="display:block;font-size:var(--fs-sm);color:var(--t2);margin-top:var(--sp-1)">${esc(r.d)}</span>
    <span style="display:flex;gap:var(--sp-1);margin-top:var(--sp-2);flex-wrap:wrap;align-items:center">${r.ag.map(x=>
      `<span class="chip mut" style="display:inline-flex;align-items:center;gap:var(--sp-1)">${AV(x,16)} ${nick(x)}</span>`).join('<span style="color:var(--t3)">→</span>')}</span>
  </span>
  <span class="btn ghost sm">用这个开始</span></button>`;
}



/* ---- per-agent configuration ---- */
const WEIGHTS=[['F1','情感质量','按触达加权的净情感',35],['F2','自然可见度','声量对比自身基准',25],
 ['F3','共鸣度','互动对比品类基准',25],['F4','拥护质量','实质性 · 作者多样性 · 复购拥护',15]];
const _UNUSED_ROUTINES=[
 {n:'每日店铺巡检',cad:'每天 05:00',ag:'insp',next:'明天 05:00',last:'今天 05:14',runs:31,note:'库存 · 价格 · 广告 · 销售四个维度'},
 {n:'每日社交健康度',cad:'每天 02:00',ag:'listen',next:'明天 02:00',last:'今天 02:14',runs:90,note:'算完才更新品牌健康分'},
 {n:'月度 SEO 内容集群',cad:'每月 1 日',ag:'seo',next:'9月1日',last:'8月1日',runs:8,note:'关键词聚类 → 结构 → 正文'},
 {n:'周度提案汇总',cad:'每周一 09:00',ag:'broker',next:'下周一',last:'本周一',runs:36,note:'把一周压制的提案汇成摘要'},
 {n:'45 天未回购提醒',cad:'每天 10:00',ag:'cs',next:'明天 10:00',last:'今天 10:00',runs:126,note:'命中人群才建线程，没人命中就静默'}];
const SOURCES=[['今日热榜','通用热点','启用','2026/08/15 06:18'],['小红书 · 热搜','平台热点','启用','2026/08/15 06:18'],
 ['抖音 · 热点榜','平台热点','启用','2026/08/15 06:18'],['微博 · 热搜','平台热点','暂停','—']];
function agCfg(a){
 if(a.cfg==='listen')return `<div style="font-size:var(--fs-xs);font-weight:600;color:var(--t2);margin-bottom:var(--sp-2)">评分权重 · v1.0（alpha 期冻结）</div>
  ${WEIGHTS.map(w=>`<div class="vrow"><span class="vv">${w[0]}</span>
    <span class="vt"><b style="color:var(--t1)">${w[1]}</b><span style="display:block;font-size:var(--fs-xs);color:var(--t3)">${w[2]}</span></span>
    <span class="vd num" style="font-size:var(--fs-md);font-weight:700">${w[3]}%</span></div>`).join('')}
  <div class="vrow" style="border-top:1px solid var(--border);margin-top:var(--sp-1)"><span class="vt" style="color:var(--t2)">风险修正 · 加权和之外单独扣</span><span class="vd num">0 ~ −15</span></div>
  <div class="vrow"><span class="vt" style="font-weight:600">合计</span><span class="vd num" style="font-weight:700">100%</span></div>
  <div class="note" style="margin-top:var(--sp-3);background:var(--danger-bg);border-color:var(--danger-bd);color:var(--danger-fg-strong)">
    提交 v1.1 会重算 3 个品牌 × 90 天的历史。旧序列保留，可对照。权重不满 100 不能提交。</div>
  <div style="font-size:var(--fs-xs);font-weight:600;color:var(--t2);margin:var(--sp-4) 0 8px">采集边界</div>
  <div class="ctx"><div class="ctxr"><span class="k">关键词</span><span class="v">由知识库提议 · 需人工确认后才开始采集</span></div>
    <div class="ctxr"><span class="k">品类基准</span><span class="v">护肤 · F3 的对照基准</span></div>
    <div class="ctxr"><span class="k">回溯</span><span class="v">90 天 · F2 从第一天就用自身基准</span></div>
    <div class="ctxr"><span class="k">不采集</span><span class="v" style="color:var(--warn-fg)">竞品品牌词 · 归 ${nick('comp')} 管</span></div>
    <div class="ctxr"><span class="k">采集不计分</span><span class="v">自有内容 · 付费合作贴</span></div></div>`;
 if(a.cfg==='trend')return `<div style="font-size:var(--fs-xs);font-weight:600;color:var(--t2);margin-bottom:var(--sp-2)">数据源</div>
  ${SOURCES.map(x=>`<div class="vrow"><span class="vt"><b style="color:var(--t1)">${x[0]}</b>
    <span style="display:block;font-size:var(--fs-xs);color:var(--t3)">${x[1]} · 上次 ${x[3]}</span></span>
    <span class="st ${x[2]==='启用'?'done':'todo'}">${x[2]}</span></div>`).join('')}
  <div style="font-size:var(--fs-xs);font-weight:600;color:var(--t2);margin:var(--sp-4) 0 8px">品牌关键词</div>
  <div class="tags"><span class="tag">修护</span><span class="tag">敏感肌</span><span class="tag">精华</span><span class="tag">屏障</span><span class="tag">低预算护肤</span></div>
  <div style="font-size:var(--fs-xs);font-weight:600;color:var(--t2);margin:var(--sp-4) 0 8px">入库与提案的分界</div>
  <div class="ctx"><div class="ctxr"><span class="k">适配度 ≥ 0.55</span><span class="v">入热点库</span></div>
    <div class="ctxr"><span class="k">适配度 ≥ 0.75 且窗口 &lt; 7 天</span><span class="v">额外提案</span></div>
    <div class="ctxr"><span class="k">高风险</span><span class="v" style="color:var(--warn-fg)">入库但标红，永不自动提案</span></div></div>`;
 if(a.cfg==='routine')return `<button class="btn ghost sm" onclick="closeDw();S.atab=1;go('agent')">去配方与例行 ↗</button>`;
 if(0)return `<div class="note" style="margin-bottom:var(--sp-3)">
   <b>每次触发生成一条任务线程。</b>例行工作没有自己的页面——它和手动发起的活儿一样躺在「工作」里，只是触发方式不同。</div>
  ${ROUTINES.map(r=>`<div class="pk" style="margin-bottom:var(--sp-2)">
    <div style="display:flex;align-items:center;gap:var(--sp-3);padding:var(--sp-3) 13px">
      ${AV(r.ag,28)}
      <div style="flex:1;min-width:0"><div style="font-size:var(--fs-md);font-weight:600">${esc(r.n)}</div>
        <div style="font-size:var(--fs-xs);color:var(--t3);margin-top:var(--sp-1)">${r.cad} · ${nick(r.ag)} · 已跑 ${r.runs} 次</div>
        <div style="font-size:var(--fs-xs);color:var(--t2);margin-top:var(--sp-1)">${esc(r.note)}</div></div>
      <div style="text-align:right;flex:0 0 auto"><div style="font-size:var(--fs-xs);color:var(--t3)">下次</div>
        <div class="num" style="font-size:var(--fs-sm);font-weight:600">${r.next}</div></div>
    </div>
    <div class="pk-a" style="border-top:1px solid var(--hairline)">
      <button class="btn ghost sm" onclick="toast('已暂停 ${esc(r.n)}')">暂停</button>
      <button class="btn ghost sm" onclick="toast('已立即触发一次')">立即跑一次</button>
      <span style="margin-left:auto;font-size:var(--fs-xs);color:var(--t3)">上次 ${r.last}</span></div></div>`).join('')}
  <div class="note" style="margin-top:var(--sp-1)">没命中条件的那次不会建线程，也不会提醒——静默是正常的。在「工作」里按<b>触发方式 · 定时</b>筛就能看到它跑出来的东西。</div>`;
 return '';
}



/* ---- Orchestrator composes the chain ---- */
const CHAINRULES=[
 {k:['库存','巡检','店铺','断货','补货','价格'],a:'insp',w:'要看店铺状态，先由店铺巡检跑一遍四个维度'},
 {k:['数据','分析','报表','指标','ROAS','复盘'],a:'ana',w:'要出结论，由数据分析做数据解读'},
 {k:['竞品','对手','友商'],a:'comp',w:'竞品动作交给竞品分析'},
 {k:['舆情','负面','口碑','健康度','提及'],a:'listen',w:'舆情信号交给舆情监控'},
 {k:['热点','趋势','话题'],a:'trend',w:'热点采集交给趋势热点'},
 {k:['内容','文案','种草','笔记','小红书'],a:'gen',w:'内容由内容生成完成'},
 {k:['视频','短视频','成片'],a:'vid',w:'视频由视频生成完成'},
 {k:['详情页','PDP'],a:'pdp',w:'详情页交给详情页生成'},
 {k:['上架','报名','SKU','商品'],a:'list',w:'上架动作交给商品上架'},
 {k:['达人','KOL','KOC'],a:'kol',w:'达人匹配交给达人策略'},
 {k:['SEO','搜索','关键词','文章'],a:'seo',w:'搜索内容交给 B2B SEO'},
 {k:['广告','投放','出价','创意'],a:'ad',w:'投放表现交给广告优化'},
 {k:['客服','回复','工单','会话'],a:'cs',w:'客服会话交给电商客服'},
 {k:['活动','大促','策划'],a:'ecamp',w:'活动方案交给电商活动策划'}];
const IRREV=['上架','报名','发布','提交','投放','扣费','下单'];
function composeChain(txt){
 const t=txt||'';
 let ag=[],why=[];
 CHAINRULES.forEach(r=>{if(r.k.some(k=>t.includes(k))&&!ag.includes(r.a)){ag.push(r.a);why.push(r.w);}});
 if(!ag.length){ag=['ana'];why.push('看不出具体领域，先由数据分析读一遍数据，再决定要不要接别的');}
 const irrev=IRREV.some(k=>t.includes(k));
 if(irrev&&!ag.includes('exec')){ag.push('exec');why.push('里面有不可逆动作，最后一步交给审批执行，并且必须过审批门');}
 return {ag,why,irrev};
}

/* ---- create a routine ---- */
const FREQ={'一次性':{t:'只跑一次，跑完自动停用。',n3:d=>[d||'明天 09:00','—','—']},
 '每天':{t:'每天同一时间。',n3:t=>['明天 '+t,'后天 '+t,'8月18日 '+t]},
 '每周':{t:'每周同一天同一时间。',n3:t=>['本周五 '+t,'8月22日 '+t,'8月29日 '+t]},
 '每月':{t:'每月同一日期。',n3:t=>['9月1日 '+t,'10月1日 '+t,'11月1日 '+t]}};
function scheduleDateValue(offset){
 const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+(offset===undefined?1:offset));
 return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
function parseScheduleDate(v){
 const p=(v||scheduleDateValue(1)).split('-').map(Number);return new Date(p[0],p[1]-1,p[2],12,0,0,0);
}
function formatScheduleRun(d,time){
 const day=['周日','周一','周二','周三','周四','周五','周六'][d.getDay()];
 return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')+' · '+day+' '+(time||'09:00');
}
function routineNextRuns(n){
 const start=parseScheduleDate(n.date),time=n.time||'09:00',out=[];
 if(n.freq==='一次性')return [formatScheduleRun(start,time)];
 if(n.freq==='每天'){
  for(let i=0;i<3;i++){const d=new Date(start);d.setDate(start.getDate()+i);out.push(formatScheduleRun(d,time));}
  return out;
 }
 if(n.freq==='每周'){
  const target=Number.isInteger(n.weekday)?n.weekday:start.getDay(),first=new Date(start);
  first.setDate(first.getDate()+((target-first.getDay()+7)%7));
  for(let i=0;i<3;i++){const d=new Date(first);d.setDate(first.getDate()+i*7);out.push(formatScheduleRun(d,time));}
  return out;
 }
 const day=Math.max(1,Math.min(31,+(n.monthday||1)));let y=start.getFullYear(),m=start.getMonth();
 while(out.length<3){const last=new Date(y,m+1,0).getDate(),d=new Date(y,m,Math.min(day,last),12,0,0,0);
  if(d>=start)out.push(formatScheduleRun(d,time));m++;if(m>11){m=0;y++;}}
 return out;
}
function normFreq(f){
 if(!f)return '每天';
 if(FREQ[f])return f;
 if(f.includes('一次'))return '一次性';
 if(f.includes('每天')||f.includes('每日'))return '每天';
 if(f.includes('每周'))return '每周';
 if(f.includes('每月'))return '每月';
 return '每天';
}
function newRecipe(){
 S.nr={mode:'recipe',freq:'每天',time:'09:00',hitl:'approve',catchup:'补跑',overlap:'跳过',retry:2,
  ag:[],why:null,n:'',d:'',dom:'内容',src:null,editing:null,chainMode:'auto',agentPicker:false};
 drawNewRoutine();
}
function editRecipe(id){
 const r=RECIPES.find(x=>x.id===id);
 S.nr={mode:'recipe',freq:'每天',time:'09:00',hitl:'approve',catchup:'补跑',overlap:'跳过',retry:2,
  ag:r.ag.slice(),why:null,n:r.n,d:r.d,dom:r.dom,src:null,editing:id,chainMode:'auto',agentPicker:false};
 drawNewRoutine();
}
function newRoutine(from,edit){
 const date=from&&from.start&&/^\d{4}-\d{2}-\d{2}$/.test(from.start)?from.start:scheduleDateValue(1);
 const start=parseScheduleDate(date);
 S.nr=from?{freq:normFreq(from.freq),time:from.time||'09:00',hitl:'approve',catchup:from.catchup||'补跑',
   overlap:from.overlap||'跳过',retry:from.retry||2,ag:from.ag.slice(),why:null,
   n:from.n,d:from.d,dom:from.dom,src:edit?null:from.id,editing:edit?from.id:null,dlv:from.dlv,
   date,tz:from.tz||'Asia/Shanghai',weekday:Number.isInteger(from.weekday)?from.weekday:start.getDay(),monthday:from.monthday||start.getDate(),chainMode:'manual',agentPicker:false}
  :{freq:'每天',time:'09:00',hitl:'approve',catchup:'补跑',overlap:'跳过',retry:2,ag:[],why:null,n:'',d:'',dom:'内容',src:null,
    date,tz:'Asia/Shanghai',weekday:start.getDay(),monthday:start.getDate(),chainMode:'auto',agentPicker:false};
 drawNewRoutine();
}
function planChain(){
 const d=($('nrd')||{value:''}).value.trim();
 if(!d){toast('先说清楚要做什么，小排才好排');return;}
 S.nr.d=d;S.nr.n=($('nrn')||{value:S.nr.n}).value.trim()||S.nr.n;
 const c=composeChain(d);
 S.nr.ag=c.ag;S.nr.why=c.why;S.nr.irrev=c.irrev;S.nr.hitl='approve';
 if(S.nr.mode==='recipe'||(!S.nr.src&&!S.nr.editing&&!S.nr.fromThread)){S.nr.chainMode='auto';refreshRecipeChain();toast('小排已给出建议链路，可继续手动调整');}
 else drawNewRoutine();
}
function rechain(){
 const v=($('nrfix')||{value:''}).value.trim();
 if(!v){toast('说一句要怎么改');return;}
 const c=composeChain(S.nr.d+' '+v);
 S.nr.ag=c.ag;S.nr.why=c.why.concat(['按你说的调整：'+v]);S.nr.fix=v;S.nr.irrev=c.irrev;S.nr.hitl='approve';
 drawNewRoutine();toast('小排重排了链路');
}
function selectableRecipeAgents(){
 return REG.filter(a=>!['orch','routine','broker','kb'].includes(a.id));
}
function recipeChainList(n,readOnly=false){
 if(!n.ag.length)return '<div class="recipe-chain-empty">还没有 Agent。</div>';
 if(readOnly)return `<div class="recipe-chain-inline">${n.ag.map(id=>`<span class="pstepc">${AV(id,16)} ${nick(id)}</span>`).join('<span class="recipe-chain-arrow">→</span>')}${requiresApproval(n)?approvalPill():''}</div>`;
 return `<div class="recipe-chain-list">${n.ag.map((id,i)=>`<div class="recipe-chain-step">
  <span class="index">${i+1}</span>${AV(id,20)}<span class="name">${nick(id)}</span>
  ${readOnly?'':`
  <button class="move" onclick="moveRecipeAgent(${i},-1)" ${i===0?'disabled':''} title="前移">←</button>
  <button class="move" onclick="moveRecipeAgent(${i},1)" ${i===n.ag.length-1?'disabled':''} title="后移">→</button>
  <button class="remove" onclick="removeRecipeAgent(${i})" title="删除">×</button>`}
 </div>`).join('')}</div>`;
}
function recipeRechainBox(n){
 return `<label style="font-size:var(--fs-xs)">不同意就直接说</label>
  <div class="recipe-rechain-row">
    <input id="nrfix" placeholder="例如：不需要数据分析，这条只要店铺巡检" style="flex:1">
    <button class="btn ghost sm" onclick="${n.ag.length?'rechain()':'planChain()'}">重排</button></div>`;
}
function recipeAgentPicker(n){
 if(!n.agentPicker)return '';
 return `<div class="recipe-agent-picker"><input placeholder="搜索 Agent" oninput="filterRecipeAgents(this.value)">
  <div class="recipe-agent-grid">${selectableRecipeAgents().map(a=>{const on=n.ag.includes(a.id);return `<button class="recipe-agent-option ${on?'selected':''}" data-recipe-agent="${(a.nick+' '+a.n+' '+a.dom).toLowerCase()}" onclick="${on?'':`addRecipeAgent('${a.id}')`}">${AV(a.id,20)}<span>${esc(a.nick)} · ${esc(a.dom)}</span>${on?'<span style="margin-left:auto;color:var(--green)">✓</span>':''}</button>`;}).join('')}</div></div>`;
}
function recipeChainHtml(n){
 const manual=false;
 return `<div class="fld"><label>链路</label>
  <div class="recipe-chain-mode"><div class="seg"><button class="on" onclick="setRecipeChainMode('auto')">小排推荐</button><button class="disabled" disabled title="下个版本开放">手动编排</button></div></div>
  ${manual?`${recipeChainList(n)}<button class="btn ghost sm" onclick="toggleRecipeAgentPicker()">添加 Agent <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition:.15s;transform:rotate(${n.agentPicker?'180deg':'0deg'})"><path d="m6 9 6 6 6-6"/></svg></button>${recipeAgentPicker(n)}`
   :`${n.ag.length?`${recipeChainList(n,true)}${recipeRechainBox(n)}`:`<div class="plan-pv" style="margin-bottom:var(--sp-2)"><div class="h">${AV('orch',20)} 由小排排链路</div>
    <div style="font-size:var(--fs-sm);color:var(--t2);line-height:1.6;margin-bottom:var(--sp-2)">你说要做什么，小排决定该谁上、什么顺序。你不用挑 agent——挑错了它也不会说。</div>
    <button class="btn sm" onclick="planChain()">让小排排一下</button></div>`}
    `}
 </div>`;
}
function refreshRecipeChain(){
 const box=$('recipe-chain-box');if(box)box.innerHTML=recipeChainHtml(S.nr);
 const sum=$('nr-summary');if(sum)sum.textContent=S.nr.ag.length?S.nr.ag.length+' 步'+(S.nr.mode==='recipe'?' · 手动触发':' · '+S.nr.freq+' '+S.nr.time):'请先添加 Agent';
 const save=$('nr-save');if(save)save.disabled=!S.nr.ag.length;
}
function setRecipeChainMode(mode){if(mode==='manual'){toast('手动编排下个版本开放');return;}S.nr.chainMode=mode;S.nr.agentPicker=false;refreshRecipeChain();}
function toggleRecipeAgentPicker(){S.nr.agentPicker=!S.nr.agentPicker;refreshRecipeChain();}
function addRecipeAgent(id){if(!S.nr.ag.includes(id))S.nr.ag.push(id);refreshRecipeChain();}
function removeRecipeAgent(i){S.nr.ag.splice(i,1);refreshRecipeChain();}
function moveRecipeAgent(i,d){const n=i+d;if(n<0||n>=S.nr.ag.length)return;const x=S.nr.ag.splice(i,1)[0];S.nr.ag.splice(n,0,x);refreshRecipeChain();}
function filterRecipeAgents(q){
 const s=(q||'').trim().toLowerCase();document.querySelectorAll('[data-recipe-agent]').forEach(b=>b.style.display=!s||b.dataset.recipeAgent.includes(s)?'flex':'none');
}
function routineSchedulePreview(n){
 return routineNextRuns(n).map((x,i)=>`<div class="s"><span class="i">${i+1}</span><span class="num">${x}</span></div>`).join('');
}
function routineScheduleHtml(n){
 const f=FREQ[n.freq]||FREQ['每天'];
 return `<div class="fld"><label>排期</label>
   <div class="seg" style="margin-bottom:var(--sp-2)">${Object.keys(FREQ).map(k=>`<button class="${n.freq===k?'on':''}" onclick="nrSet('freq','${k}')">${k}</button>`).join('')}</div>
   <div style="display:flex;gap:var(--sp-3);margin-bottom:var(--sp-2)">
    <div style="flex:1"><label style="font-size:var(--fs-xs)">${n.freq==='一次性'?'执行日期':'开始日期'}</label>
     <input type="date" value="${n.date}" onchange="nrSet('date',this.value)"></div>
    <div style="flex:1"><label style="font-size:var(--fs-xs)">执行时间</label>
     <input type="time" value="${n.time}" onchange="nrSet('time',this.value)"></div></div>
   ${n.freq==='每周'?`<div style="margin-bottom:var(--sp-2)"><label style="font-size:var(--fs-xs)">每周执行日</label>
    <div class="seg">${['日','一','二','三','四','五','六'].map((x,i)=>`<button data-nr-weekday="${i}" class="${n.weekday===i?'on':''}" onclick="nrSet('weekday',${i})">周${x}</button>`).join('')}</div></div>`:''}
   ${n.freq==='每月'?`<div style="margin-bottom:var(--sp-2)"><label style="font-size:var(--fs-xs)">每月第几日</label>
    <input type="number" min="1" max="31" value="${n.monthday}" onchange="nrSet('monthday',Math.max(1,Math.min(31,+this.value||1)))"></div>`:''}
   <div style="display:flex;gap:var(--sp-3)"><div style="flex:1"><label style="font-size:var(--fs-xs)">时区</label>
    <select onchange="nrSet('tz',this.value)"><option value="Asia/Shanghai" ${n.tz==='Asia/Shanghai'?'selected':''}>Asia/Shanghai（中国）</option><option value="Asia/Tokyo" ${n.tz==='Asia/Tokyo'?'selected':''}>Asia/Tokyo（日本）</option><option value="UTC" ${n.tz==='UTC'?'selected':''}>UTC</option></select></div></div>
   <div style="font-size:var(--fs-xs);color:var(--t3);margin-top:var(--sp-2)">${f.t}</div></div>
  <div class="plan-pv" style="margin-bottom:var(--sp-4)"><div class="h">按这个设置，接下来会在</div>
   <div id="nr-next-runs">${routineSchedulePreview(n)}</div></div>`;
}
function nrSet(k,v){
 S.nr[k]=v;
 if(k==='freq'){
  if(v==='每周')S.nr.weekday=parseScheduleDate(S.nr.date).getDay();
  if(v==='每月')S.nr.monthday=parseScheduleDate(S.nr.date).getDate();
  const box=$('nr-schedule');if(box)box.innerHTML=routineScheduleHtml(S.nr);
 }else if(['date','time','weekday','monthday','tz'].includes(k)){
  if(k==='date'&&S.nr.freq==='每周')S.nr.weekday=parseScheduleDate(v).getDay();
  if(k==='date'&&S.nr.freq==='每月')S.nr.monthday=parseScheduleDate(v).getDate();
  if(k==='weekday')document.querySelectorAll('[data-nr-weekday]').forEach(b=>b.classList.toggle('on',+b.dataset.nrWeekday===S.nr.weekday));
  const pv=$('nr-next-runs');if(pv)pv.innerHTML=routineSchedulePreview(S.nr);
 }
 const sum=$('nr-summary');if(sum)sum.textContent=S.nr.ag.length+' 步'+(S.nr.mode==='recipe'?' · 手动触发':' · '+S.nr.freq+' '+S.nr.time);
}
function drawNewRoutine(){
 const n=S.nr;if(!FREQ[n.freq])n.freq=normFreq(n.freq);
 if(!n.date)n.date=scheduleDateValue(1);if(!n.tz)n.tz='Asia/Shanghai';
 if(!Number.isInteger(n.weekday))n.weekday=parseScheduleDate(n.date).getDay();if(!n.monthday)n.monthday=1;
 const fromThread=!!n.fromThread;
 const eyebrow=n.mode==='recipe'?(n.editing?'编辑配方':'新建配方'):(n.editing?'编辑例行':'新建例行');
 const title=n.editing?esc(n.n):n.mode==='recipe'?'存一串常用的 agent 链路':fromThread?'把当前流程变成例行':n.src?'把配方挂上排期':'让一串 agent 按时自己跑';
 const host=$('dw');
 host.innerHTML=`<div class="dw-h">
    <button class="ib" onclick="closeDw()"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
    <div style="flex:1;min-width:0"><div class="ty">${eyebrow}</div><h3>${title}</h3></div></div>
  <div class="dw-b">
   ${n.mode==='recipe'?`<div class="note" style="margin-bottom:var(--sp-3)">
     配方是<b>手动触发</b>的链路——每次用它开线程，不用重新交代一遍。跑顺了随时能加排期变成例行。</div>`
    :n.editing?`<div class="note" style="margin-bottom:var(--sp-3)">改动<b>下次触发起生效</b>。已经跑过的记录和常驻线程都保留，不受影响。</div>`
    :fromThread?`<div class="note" style="margin-bottom:var(--sp-3)">沿用当前任务里的 Agent 和执行方式，只增加排期；不会重新编排，也不会添加其他 Agent。</div>`
    :n.src?`<div class="note" style="margin-bottom:var(--sp-3)">从配方「${esc(n.n)}」创建。链路不变，只是加上排期——跑过的配方变成例行，是最稳的做法。</div>`
    :`<div class="note" style="margin-bottom:var(--sp-3)">建议先用配方手动跑几次，确认链路对了再挂排期。没跑过就直接定时，前几次通常要返工。</div>`}
   <div class="fld"><label>名称</label><input id="nrn" value="${esc(n.n)}" placeholder="例如：周度竞品动作扫描"></div>
   <div class="fld"><label>做什么 <span class="ct">会写进线程的意图</span></label>
     <textarea id="nrd" rows="2" placeholder="扫竞品主推词、投放和内容变化，有策略级变化才建单。">${esc(n.d)}</textarea></div>

   ${n.mode==='recipe'||(!n.src&&!n.editing&&!fromThread)?`<div id="recipe-chain-box">${recipeChainHtml(n)}</div>`
    :`<div class="fld"><label>链路 ${fromThread?'<span class="ct">沿用当前流程</span>':`<span class="ct">${nick('orch')} 排的</span>`}</label>
      <div style="display:flex;gap:var(--sp-1);flex-wrap:wrap;align-items:center;margin-bottom:var(--sp-2)">
        ${n.ag.map(a=>`<span class="pstepc">${AV(a,16)} ${nick(a)}</span>`).join('<span style="color:var(--t3)">→</span>')}
        <span id="nr-approval-step" style="display:contents">${requiresApproval(n)?approvalPill():''}</span></div>
      ${!fromThread&&(n.why||[]).length?`<div class="ctx" style="margin-bottom:var(--sp-2)">${n.why.map(w=>`<div class="ctxr"><span class="v" style="font-weight:400;font-size:var(--fs-sm);text-align:left">· ${esc(w)}</span></div>`).join('')}</div>`:''}
      ${n.irrev?`<div class="note" style="background:var(--warn-bg);border-color:var(--warn-bd);color:#92400E;margin-bottom:var(--sp-2)">
        链路里有不可逆动作，执行前会自动进入<b>审批</b>。</div>`:''}
      ${fromThread?'':`<label style="font-size:var(--fs-xs)">不同意就直接说</label>
      <div style="display:flex;gap:var(--sp-2)">
        <input id="nrfix" placeholder="例如：不需要数据分析，这条只要店铺巡检" style="flex:1">
        <button class="btn ghost sm" onclick="rechain()">重排</button></div>`}</div>`}

   ${n.mode==='recipe'?'':`<div id="nr-schedule">${routineScheduleHtml(n)}</div>`}

   ${n.mode==='recipe'?'':`
   <div class="fld"><label>异常处理</label>
     <div style="display:flex;gap:var(--sp-3);margin-bottom:var(--sp-2)">
       <div style="flex:1"><label style="font-size:var(--fs-xs)">错过一次</label>
         <select onchange="S.nr.catchup=this.value">${['补跑','跳过'].map(o=>`<option ${n.catchup===o?'selected':''}>${o}</option>`).join('')}</select></div>
       <div style="flex:1"><label style="font-size:var(--fs-xs)">上次还没跑完</label>
         <select onchange="S.nr.overlap=this.value">${['跳过','排队'].map(o=>`<option ${n.overlap===o?'selected':''}>${o}</option>`).join('')}</select></div></div>
     <label style="font-size:var(--fs-xs)">失败几次后自动停用</label>
     <select onchange="S.nr.retry=+this.value">${[1,2,3].map(o=>`<option ${n.retry===o?'selected':''}>${o}</option>`).join('')}</select></div>

   <div class="fld"><label>送达</label>
     <select id="nrdlv"><option>#店铺运营 (Slack)</option><option>#品牌 (Slack)</option><option>#电商 (Slack)</option><option>只留在系统里，不外送</option></select></div>`}
  </div>
  <div class="dw-f">
    <button class="btn ghost" onclick="closeDw()">取消</button>
    ${n.editing?`<button class="btn ghost" onclick="delRoutine('${n.editing}')">删除</button>`:''}
    <span id="nr-summary" style="margin-left:auto;font-size:var(--fs-xs);color:var(--t3)">${n.ag.length?n.ag.length+' 步'+(n.mode==='recipe'?' · 手动触发':' · '+n.freq+' '+n.time):(n.chainMode==='manual'?'请先添加 Agent':'先让小排推荐链路')}</span>
    <button id="nr-save" class="btn" onclick="saveRoutine()" ${n.mode==='recipe'&&!n.ag.length?'disabled':''}>${n.editing?'保存改动':n.mode==='recipe'?'创建配方':'创建例行'}</button></div>`;
 $('dw').classList.remove('focus','expanded');$('dw').classList.add('on');$('scrim').classList.add('on');syncDrawerExpandControl();
}
function closeRoutineEditor(){closeDw();}
function saveRoutine(){
 const n=S.nr,nm=($('nrn')||{value:''}).value.trim(),d=($('nrd')||{value:''}).value.trim();
 if(!nm){toast('先起个名字');return;}
 if(!n.ag.length){toast(n.mode==='recipe'?'请先添加 Agent':'先让小排排链路');return;}
 const f=FREQ[normFreq(n.freq)]||FREQ['每天'],nextRuns=routineNextRuns(n);
 if(n.mode==='recipe'){
  if(n.editing){const r=RECIPES.find(x=>x.id===n.editing);
   Object.assign(r,{n:nm,d:d||r.d,ag:n.ag,hitl:n.hitl,dom:n.dom});
   closeRoutineEditor();render();toast('配方已保存');return;}
  RECIPES.push({id:'rc'+Date.now(),n:nm,d:d||'（还没写说明）',ag:n.ag,dom:n.dom,used:0,cad:null,hitl:n.hitl,own:'dudu'});
  closeRoutineEditor();S.atab=1;go('agent');toast('配方已创建 · 随时能加排期变成例行');return;}
 if(n.editing){
  const r=RECIPES.find(x=>x.id===n.editing);
  Object.assign(r,{n:nm,d:d||r.d,ag:n.ag,cad:n.freq+' '+n.time,freq:n.freq,time:n.time,
   start:n.date,tz:n.tz,weekday:n.weekday,monthday:n.monthday,next3:nextRuns,catchup:n.catchup,overlap:n.overlap,retry:n.retry,hitl:n.hitl,
   next:nextRuns[0],dlv:($('nrdlv')||{value:r.dlv}).value});
  if(r.st==='fail'){r.st='idle';r.err=null;}
  closeRoutineEditor();render();toast('已保存 · 下次触发起生效（'+nextRuns[0]+'）');return;}
 const id='rn'+Date.now();
 RECIPES.unshift({id,n:nm,d:d||'（还没写说明）',ag:n.ag,dom:n.dom,used:0,
  cad:n.freq+' '+n.time,tz:n.tz,freq:n.freq,time:n.time,start:n.date,weekday:n.weekday,monthday:n.monthday,
  next3:nextRuns,catchup:n.catchup,overlap:n.overlap,retry:n.retry,
  hitl:n.hitl,own:'dudu',st:'idle',next:nextRuns[0],last:'还没跑过',
  dlv:($('nrdlv')||{value:'只留在系统里，不外送'}).value,fresh:1,oneoff:n.freq==='一次性',runs:[]});
 closeRoutineEditor();S.atab=1;go('agent');
 toast('例行已创建 · 首次 '+nextRuns[0]+(n.freq==='一次性'?' · 跑完自动停用':''));
}
/* promote a thread into a routine — Claude's /schedule pattern */
function delRoutine(id){
 const r=RECIPES.find(x=>x.id===id),t=T.find(x=>x.standing===id);
 $('mod').innerHTML=`<div class="mbox" style="max-width:460px">
  <div class="mhd"><div class="e">删除例行</div><h3>删掉「${esc(r.n)}」？</h3></div>
  <div class="mbd"><div style="font-size:var(--fs-sm);color:var(--t2);line-height:1.7">
   排期立刻停止，不会再触发。<b>${t?'常驻线程和已有产出会保留':'没有产出会被删掉'}</b>——历史记录不删。<br>
   如果只是想暂时停，用「暂停」就够了。</div></div>
  <div class="mft"><button class="btn" onclick="RECIPES.splice(RECIPES.findIndex(x=>x.id==='${id}'),1);closeMod();render();toast('已删除 · 历史保留')">删除</button>
    <button class="btn ghost" onclick="closeMod()">取消</button></div></div>`;
}
function promoteThread(){
 const t=T.find(x=>x.id===S.tid);
 const date=scheduleDateValue(1),weekday=parseScheduleDate(date).getDay();
 const threadAgents=t.plan?.confirmed?.agents?.length?t.plan.confirmed.agents:t.agents?.length?t.agents:(t.ag?[t.ag]:[]);
 S.nr={freq:'一次性',date,time:'09:00',tz:'Asia/Shanghai',weekday,monthday:1,hitl:'approve',catchup:'补跑',overlap:'跳过',retry:2,
  ag:[...threadAgents],why:null,n:t.t.slice(0,18),d:(t.intent||{}).tx||'',dom:t.dom,src:null,fromThread:t.id};
 drawNewRoutine();
}

/* ---- agent drawer ---- */
function openAgent(id){S.ag=id;S.agtab=0;S.cr=null;drawAgent();$('dw').classList.add('on');$('scrim').classList.add('on');}
function drawAgent(){
 const a=REG.find(x=>x.id===S.ag);if(!a)return;
 const tabs=['概览','配置','最近运行'];
 const body=[agOv(a),agConfig(a),agRuns(a)][S.agtab]||agOv(a);
 $('dw').innerHTML=`<div class="dw-h">
   <button class="ib" onclick="closeDw()"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
   ${AV(a.id,30)}
   <div style="flex:1;min-width:0"><div class="ty">${a.dom}</div><h3>${a.nick}</h3></div>
   <span class="st ${BS[a.b].c}">${BS[a.b].n}</span></div>
  <div class="dw-tabs">${tabs.map((t,i)=>`<button class="${S.agtab===i?'on':''}" onclick="S.agtab=${i};drawAgent()">${t}</button>`).join('')}</div>
  <div class="dw-b">${body}</div>
  <div class="dw-f">
    ${S.agtab===1
      ?`<button class="btn" onclick="toast('已保存 Agent 配置')">保存</button>`
      :a.b==='live'&&ONLINE[a.id]?`<button class="btn" onclick="openActivate('${a.id}')">立即运行</button>`:''}
    <span style="margin-left:auto;font-family:'Sora';font-size:var(--fs-xs);color:var(--t3)">${LV[a.lv].k}</span></div>`;
}
function agAdmin(a){
 const active=T.filter(t=>t.ag===a.id&&t.st!=='done').length;
 return {
   maturity:a.maturity||'M1',active,
   rating:a.rating||'0.0',returnRate:a.returnRate||(Math.round(a.ed/3)+'%'),ontime:a.ontime||'100%',
   risk:a.risk||(a.ed>=30||a.ok<88?'需关注':'正常'),
   sla:a.sla||'未设置',exceptionOwner:a.exceptionOwner||'产品经理',
   enabled:a.enabled===false?'停用':'启用'
 };
}
function agMaturity(a,m){
 const levels={M1:'产品经理确认',M2:'稳定运行',M3:'规模化运行'};
 const order=['M1','M2','M3'],idx=Math.max(0,order.indexOf(m.maturity));
 const unmet=[];
 if(a.r<200)unmet.push('有效样本数不足');
 if(a.ok<95)unmet.push('成功率未达标');
 if(!a.rating||Number(a.rating)===0)unmet.push('尚无评分样本');
 if(m.sla==='未设置')unmet.push('未配置 SLA');
 return {label:levels[m.maturity]||'产品经理确认',next:order[idx+1]||null,unmet};
}
function agOv(a){
 const m=agAdmin(a),mp=agMaturity(a,m);
 return `<div style="font-size:var(--fs-md);color:var(--t2);line-height:1.7;margin-bottom:var(--sp-4)">${esc(a.d)}</div>
 <div style="font-size:var(--fs-xs);font-weight:700;color:var(--t1);margin-bottom:var(--sp-2)">表现指标</div>
 <div style="display:grid;grid-template-columns:repeat(5,minmax(0,1fr));border:1px solid var(--border);border-radius:var(--r);overflow:hidden;margin-bottom:var(--sp-4)">
   ${[['成功率',a.b==='live'?a.ok+'%':'—'],['平均评分',m.rating],['返工率',m.returnRate],['准时率',m.ontime],['风险',m.risk]].map((k,i)=>
     `<div style="padding:var(--sp-3) 6px;text-align:center;${i?'border-left:1px solid var(--border)':''}">
       <div style="font-size:var(--fs-xs);color:var(--t3)">${k[0]}</div>
       <div class="num" style="font-size:var(--fs-md);font-weight:700;margin-top:var(--sp-1);${k[0]==='风险'&&k[1]!=='正常'?'color:var(--warn-fg)':''}">${k[1]}</div></div>`).join('')}
 </div>
 <div style="border:1px solid var(--border);border-radius:var(--r);padding:var(--sp-3) 13px;margin-bottom:var(--sp-4);background:var(--surface-tint)">
   <div style="font-size:var(--fs-xs);font-weight:700;color:var(--t3);margin-bottom:var(--sp-2)">成熟度进度</div>
   <div style="display:flex;align-items:center;gap:var(--sp-2);flex-wrap:wrap">
     <span class="chip lv">${m.maturity} · ${mp.label}</span>
     ${mp.next?`<span style="color:var(--t3)">→</span><span style="font-size:var(--fs-xs);color:var(--t3)">下一档位</span><span class="chip" style="background:#EFF6FF;color:#2563EB;border:1px solid #BFDBFE">${mp.next}</span>`:'<span class="st done">最高档位</span>'}
   </div>
   <div style="font-size:var(--fs-xs);font-weight:600;color:var(--t3);margin:var(--sp-3) 0 7px">${mp.unmet.length?'未达标项':'晋级条件'}</div>
   <div style="display:flex;gap:var(--sp-1);flex-wrap:wrap">
     ${mp.unmet.length?mp.unmet.map(x=>`<span class="chip" style="background:#FFF8E7;color:var(--warn-fg);border:1px solid #F6D68A">${x}</span>`).join(''):'<span class="st done">已满足当前晋级条件</span>'}
   </div>
 </div>
 <div class="ctx">
   <div class="ctxr"><span class="k">成熟度</span><span class="v">${m.maturity}</span></div>
   <div class="ctxr"><span class="k">进行中任务</span><span class="v num">${m.active}</span></div>
   <div class="ctxr"><span class="k">产品经理</span><span class="v">${a.pm}</span></div>
   <div class="ctxr"><span class="k">SLA（分钟）</span><span class="v">${m.sla}</span></div>
   <div class="ctxr"><span class="k">异常接收人</span><span class="v">${m.exceptionOwner}</span></div>
   <div class="ctxr"><span class="k">运行状态</span><span class="v"><span class="st ${m.enabled==='启用'?'done':'todo'}">${m.enabled}</span></span></div>
   <div class="ctxr"><span class="k">领域</span><span class="v">${a.dom}</span></div>
   <div class="ctxr"><span class="k">触发方式</span><span class="v">${a.tr.map(t=>TRN[t]).join(' · ')}</span></div>
   <div class="ctxr"><span class="k">产出类型</span><span class="v">${a.out.length?a.out.join(' · '):'不直接产出'}</span></div>
 </div>
 ${a.rec?`<div style="margin-top:var(--sp-4)"><div style="font-size:var(--fs-xs);font-weight:600;color:var(--t2);margin-bottom:var(--sp-2)">参与的配方</div>
   ${a.rec.map(r=>`<div class="vrow"><span class="vt">${esc(r)}</span></div>`).join('')}</div>`:''}`;
}
function setAgentConfig(id,key,value){
 const a=REG.find(x=>x.id===id);if(!a)return;
 a[key]=value;drawAgent();
}
function agConfig(a){
 const m=agAdmin(a),specific=agCfg(a);
 const slas=['5','10','15','20','30','45','60','90','120','未设置'];
 const managers=['dudu','Sophie','Brooks','Ariel','Sam','Shlomi','Gil'];
 return `<div style="font-size:var(--fs-xs);font-weight:700;color:var(--t1);margin-bottom:var(--sp-2)">描述 <span style="font-weight:400;color:var(--t3)">· Router 按它判断这个 Agent 能干什么</span></div>
 <textarea style="width:100%;min-height:104px;resize:vertical;border:1px solid var(--border);border-radius:var(--r);padding:var(--sp-3) 12px;font-size:var(--fs-sm);line-height:1.65;color:var(--t1);background:#fff" oninput="REG.find(x=>x.id==='${a.id}').d=this.value">${esc(a.d)}</textarea>
 <div style="font-size:var(--fs-xs);font-weight:600;color:var(--t2);margin:var(--sp-1) 0 7px">英文描述 <span style="font-weight:400;color:var(--t3)">· 可选</span></div>
 <textarea placeholder="Optional English routing description" style="width:100%;min-height:68px;resize:vertical;border:1px solid var(--border);border-radius:var(--r);padding:var(--sp-3) 12px;font-size:var(--fs-sm);line-height:1.6;color:var(--t1);background:#fff" oninput="REG.find(x=>x.id==='${a.id}').descEn=this.value">${esc(a.descEn||'')}</textarea>

 <div style="font-size:var(--fs-xs);font-weight:700;color:var(--t1);margin:var(--sp-4) 0 7px">产品经理 <span style="font-weight:400;color:var(--t3)">· 确认配置与异常处理</span></div>
 <select style="width:100%;height:38px;border:1px solid var(--border);border-radius:var(--r);padding:0 11px;background:#fff;color:var(--t1)" onchange="setAgentConfig('${a.id}','pm',this.value)">
   ${managers.map(x=>`<option ${x===a.pm?'selected':''}>${x}</option>`).join('')}
 </select>

 <div style="font-size:var(--fs-xs);font-weight:700;color:var(--t1);margin:var(--sp-4) 0 7px">SLA（分钟）</div>
 <div style="display:flex;flex-wrap:wrap;gap:var(--sp-2)">
   ${slas.map(x=>`<button class="btn ghost sm" style="min-width:57px;${String(m.sla)===x?'border-color:var(--primary);color:var(--primary);background:var(--primary-bg)':''}" onclick="setAgentConfig('${a.id}','sla','${x}')">${x==='未设置'?'未设置':x+' 分钟'}</button>`).join('')}
 </div>

 <div style="font-size:var(--fs-xs);font-weight:700;color:var(--t1);margin:var(--sp-4) 0 7px">异常接收人 <span style="font-weight:400;color:var(--t3)">· 处理失败、超时或未解决的异常</span></div>
 <div style="display:flex;gap:var(--sp-2)">
   ${['产品经理','负责人'].map(x=>`<button class="btn ghost sm" style="${m.exceptionOwner===x?'border-color:var(--primary);color:var(--primary);background:var(--primary-bg)':''}" onclick="setAgentConfig('${a.id}','exceptionOwner','${x}')">${x}</button>`).join('')}
 </div>

 <div style="font-size:var(--fs-xs);font-weight:700;color:var(--t1);margin:var(--sp-4) 0 7px">状态 <span style="font-weight:400;color:var(--t3)">· 暂停后不再进入排表，Router 不会路由到它</span></div>
 <div style="display:flex;gap:var(--sp-2)">
   ${[['启用',true],['暂停',false]].map(x=>`<button class="btn ghost sm" style="${(a.enabled!==false)===x[1]?'border-color:var(--primary);color:var(--primary);background:var(--primary-bg)':''}" onclick="setAgentConfig('${a.id}','enabled',${x[1]})">${x[0]}</button>`).join('')}
 </div>

 <div style="height:1px;background:var(--border);margin:var(--sp-4) 0 16px"></div>
 <div style="font-size:var(--fs-xs);font-weight:700;color:var(--t1);margin-bottom:var(--sp-2)">自主级别 <span style="font-weight:400;color:var(--t3)">· 决定产出需要怎样的人工作业</span></div>
 ${agLv(a)}
 ${specific?`<div style="height:1px;background:var(--border);margin:var(--sp-4) 0 16px"></div><div style="font-size:var(--fs-xs);font-weight:700;color:var(--t1);margin-bottom:var(--sp-2)">业务配置</div>${specific}`:''}`;
}
function agLv(a){
 const hot=a.ed>=30&&a.b==='live';
 return `${hot?`<div class="note" style="background:var(--danger-bg);border-color:var(--danger-bd);color:var(--danger-fg-strong);margin-bottom:var(--sp-3)">
   编辑率 ${a.ed}%——每 10 条产出里有 ${Math.round(a.ed/10)} 条被人改过。<b>不建议提升自主级别</b>，先把编辑原因喂回反馈回路。</div>`
  :a.b==='live'&&a.ed<10&&a.lv<2?`<div class="note" style="background:var(--ok-bg);border-color:#A7F3D0;color:#065F46;margin-bottom:var(--sp-3)">
   编辑率只有 ${a.ed}%，连续 30 天稳定。<b>可以考虑提升一级</b>，把这条审批从队列里拿掉。</div>`:''}
 <div style="font-size:var(--fs-sm);color:var(--t2);margin-bottom:var(--sp-3)">自主级别决定产出要不要人来放行。它是 agent 的属性，不是每个页面各自决定的。</div>
 ${LV.map((l,i)=>`<button style="display:flex;gap:var(--sp-3);width:100%;text-align:left;padding:var(--sp-3);border:1px solid ${i===a.lv?'var(--primary)':'var(--border)'};border-radius:var(--r);margin-bottom:var(--sp-2);background:${i===a.lv?'var(--primary-bg)':'#fff'};transition:.13s"
   onclick="setLv('${a.id}',${i})">
   <span class="vv" style="align-self:flex-start;background:${i===a.lv?'var(--primary)':'#EEEAFA'};color:${i===a.lv?'#fff':'var(--t3)'}">${l.k}</span>
   <span style="flex:1;min-width:0"><span style="display:block;font-size:var(--fs-md);font-weight:600;${i===a.lv?'color:var(--primary-h)':''}">${l.n}</span>
     <span style="display:block;font-size:var(--fs-xs);color:var(--t2);margin-top:var(--sp-1);line-height:1.55">${l.d}</span></span>
   ${i===a.lv?'<span class="chip lv" style="align-self:center">当前</span>':''}</button>`).join('')}`;
}
function setLv(id,i){
 const a=REG.find(x=>x.id===id);
 if(a.ed>=30&&i>a.lv){toast('编辑率过高，先降下来再提级');return;}
 a.lv=i;drawAgent();render();toast('已设为 '+LV[i].k+' · '+LV[i].n);
}
function agOut(a){
 if(!a.out.length)return `<div class="note">这个 agent 不直接产出产出物，它执行动作或为其他 agent 提供能力。</div>`;
 const V={'社媒内容':[['禁用词','品牌禁用词规则 · 知识库'],['字数','按平台上限'],['图片数','3–9 张']],
  '视频':[['时长','≤35 秒'],['比例','9:16'],['音乐版权','需核实']],
  '详情页':[['类目规则','按平台类目'],['图片规格','9 张 · 800×800 起'],['价格','与产品中心一致']],
  '客服回复':[['补偿上限','¥10'],['合规话术','客服话术库'],['语气','匹配角色设定']],
  '广告计划':[['预算上限','按活动预算'],['出价上限','类目均值 1.5 倍']],
  '达人清单':[['预算','不超活动预算'],['黑名单','自动规避'],['独家冷却期','需核实']],
  '活动策划':[['预算上限','按活动预算']],'SEO 文章':[['关键词密度','1–3%'],['重复率','<15%']],
  '巡检发现':[],'提案':[],'文档':[]};
 return `<div style="font-size:var(--fs-xs);font-weight:600;color:var(--t2);margin-bottom:var(--sp-2)">产出类型</div>
 ${a.out.map(o=>`<div style="border:1px solid var(--border);border-radius:var(--r);padding:var(--sp-3);margin-bottom:var(--sp-2)">
   <div style="font-size:var(--fs-md);font-weight:600;margin-bottom:var(--sp-2)">${o}</div>
   ${(V[o]||[]).length?(V[o]||[]).map(v=>`<div class="vrow"><span class="vt">${v[0]}</span><span class="vd">${v[1]}</span></div>`).join('')
     :'<div style="font-size:var(--fs-sm);color:var(--t3)">只读产出，无校验规则。</div>'}</div>`).join('')}
 <div class="note">校验规则在产出卡片上直接显示 ✓/✕。校验没过的产出不能一键批准。</div>`;
}
function agRuns(a){
 if(a.b!=='live')return `<div style="font-size:var(--fs-sm);color:var(--t3);padding:var(--sp-2) 0">还没上线。</div>`;
 const mine=T.filter(t=>t.ag===a.id||(t.arts||[]).some(x=>x.by===a.id));
 return `${mine.length?mine.map(t=>`<button class="row" onclick="closeDw();go('thread','${t.id}')">
   <span class="st ${t.st}">${STN[t.st]}</span><span class="tt">${esc(t.t)}</span><span class="up">${t.up}</span></button>`).join('')
  :'<div style="font-size:var(--fs-sm);color:var(--t3);padding:var(--sp-2) 0">本原型里没有这个 agent 的线程。</div>'}`;
}




/* ============ 提案 Proposals — per Proposal Broker Build Spec ============ */
const CONF={hi:{n:'高',c:'done',v:'0.86'},mid:{n:'中',c:'review',v:'0.61'},lo:{n:'低',c:'todo',v:'0.34'}};
const REV={y:{n:'可逆',c:'done'},p:{n:'部分可逆',c:'review'},n:{n:'不可逆',c:'hold'}};
const DROPR=['判断错了','时机不对','已经处理了','不归我管','基准看着不对','有用但现在不做'];
const BUDGET=5;
const PROPS=[
 {src:'a',reason:{"saw": "48 小时内讨论量从基准 2.7 万涨到 8.4 万。", "judge": "增速本身不稀奇，热点每周都有。让我提这一条的是话题的内容——讨论集中在\"预算有限怎么搭\"，和已经批准的方向二「低预算高信任感」几乎是同一句话。所以这不是要你想新东西，是把手上已有的内容换个话题壳。", "ruled": ["等两天看热度是否持续 —— 否决：窗口只有 5–7 天，等到确认就晚了", "自己造一个话题 —— 否决：造话题的成本远高于蹭，方向二本来也不主打新奇", "全平台一起铺 —— 否决：这个话题在抖音的热度只有小红书的 1/6"], "ifdo": "自然曝光 +12–18 万，不额外增加投放预算。", "ifdob": "依据：过去 4 次蹭趋势内容的曝光中位数。样本只有 4 次，别当准数看。", "ifnot": "窗口过去后同样的内容只能靠付费拿曝光，粗算多花 ¥8–12k。"},id:'p1',by:'trend',t:'蹭 #早C晚A 出 2 条内容',conf:'hi',age:'25 分钟前',life:.3,camp:'11.11 大促',dom:'内容',cost:'¥14',st:'new',rev:'y',own:'dudu',score:82,
  sig:'#早C晚A 讨论量 8.4 万条 / 48h',base:'该话题 30 天基准 2.7 万条（带宽 1.9–3.4 万，n=30）',
  why:'增长 214%，讨论集中在"预算有限怎么搭"，和方向二的「低预算高信任感」是同一个话题面。现在切进去成本最低，窗口预计还有 5–7 天。',
  imp:'预估自然曝光 +12–18 万',impb:'依据：过去 4 次蹭趋势内容的曝光中位数，样本 n=4，置信度不高',
  ev:[['信号','讨论量 8.4 万条 / 48h'],['基准','30 天均值 2.7 万（1.9–3.4 万）'],['偏离','+214%'],['相关度','0.78 · 与方向二同一话题面'],['窗口','5–7 天']],
  plan:['读取方向二与品牌禁用词','生成 2 条蹭趋势的内容方向','批准后出正文与配图建议'],
  agents:['gen'],cmts:[{w:'so',tx:'这个可以做，但别硬蹭，还是走真实感那条线。',at:'今天 11:02'}]},
];
const SUPPRESSED=[
 {t:'某腰部达人涨粉较快',by:'kol',score:38,thr:60,own:'Sophie',why:'与本季目标无关，报价高于名单均值'},
 {t:'小红书某美妆话题上升',by:'trend',score:31,thr:60,own:'dudu',why:'品牌相关度 0.31 · 低于阈值 0.55'},
 {t:'某 SKU 价格波动 2%',by:'insp',score:22,thr:60,own:'Brooks',why:'在基准带宽内，未达汇报门槛'},
 {t:'竞品发了一条日常内容',by:'comp',score:19,thr:60,own:'Sophie',why:'无策略变化信号'}];

function pOpen(){return PROPS.filter(p=>['new','snooze'].includes(p.st));}
function pAgents(){return PROPS.filter(p=>p.src==='a');}
function vProp(){
 if(S.ptab===undefined)S.ptab=0;
 const A=pOpen(),B=PROPS.filter(p=>['taken','running','done'].includes(p.st)),C=PROPS.filter(p=>p.st==='drop');
 const L=[A,B,C,[]][S.ptab];
 return `<div class="wrap">
  <div class="eyebrow">做 · 提案</div><h1>提案</h1>
  <div class="sub">Agent 主动发现、且已经编排好的决定。采纳即执行——它不会给你留一件待办。</div>
  <div class="bar">
    <div class="seg">
      <button class="${S.ptab===0?'on':''}" onclick="S.ptab=0;render()">待决定 ${A.length}</button>
      <button class="${S.ptab===1?'on':''}" onclick="S.ptab=1;render()">已采纳 ${B.length}</button>
      <button class="${S.ptab===2?'on':''}" onclick="S.ptab=2;render()">已忽略 ${C.length}</button>
      <button class="${S.ptab===3?'on':''}" onclick="S.ptab=3;render()">Broker 控制台</button></div>
    <div class="spacer"></div>
    <span style="font-size:var(--fs-xs);color:var(--t3)">j/k 移动 · Enter 打开 · a 采纳 · d 忽略</span>
  </div>
  ${S.ptab===3?brokerConsole():
   L.length?L.map(pcard).join(''):emptyProp(S.ptab)}
 </div>`;
}
function emptyProp(t){
 if(t===0)return `<div class="allclear" style="padding:var(--sp-6) 20px">
   <div style="font-size:var(--fs-lg);font-weight:600;color:var(--t2);margin-bottom:var(--sp-2)">没有需要你决定的事</div>
   <div style="font-size:var(--fs-sm)">${new Set(pAgents().map(p=>p.by)).size} 个 agent 还在盯着，上一轮 4 分钟前扫完。<br>
   今天 ${nick('broker')} 推了 ${PROPS.length} 条，压下了 ${SUPPRESSED.length} 条。</div></div>`;
 return `<div class="allclear">${['','还没采纳过提案。','没有忽略过提案。'][t]}</div>`;
}
function pcard(p){
 const cf=CONF[p.conf],rv=REV[p.rev];
 const ageC=p.life>=.75?'late':p.life>=.5?'soon':'';
 if(p.st==='running'||p.st==='done')return `<div class="pcard">
   <div class="pstrip ${p.st}">
     ${p.st==='running'?'<span class="spin"></span>':'<span class="tk">✓</span>'}
     <div style="flex:1;min-width:0"><b style="font-size:var(--fs-md)">${esc(p.t)}</b>
       <div style="font-size:var(--fs-xs);color:var(--t2);margin-top:var(--sp-1)">
         ${p.st==='running'?nick(p.agents[0])+' 正在执行…':'已完成 · '+(p.edited?'你改过参数后采纳':'按原方案采纳')}</div></div>
     ${p.tid?`<button class="btn ghost sm" onclick="go('thread','${p.tid}')">看执行记录 →</button>`:''}
   </div></div>`;
 return `<div class="pcard ${p.st==='snooze'?'snz':''}" id="pc-${p.id}">
  ${p.undo?`<div class="undobar"><span style="flex:1">${esc(p.undo)}</span>
    <button class="btn ghost sm" onclick="undoProp('${p.id}')">撤销</button></div>`:''}
  <div class="pch">${AV(p.by,32)}
    <div style="flex:1;min-width:0">
      <div style="font-size:var(--fs-lg);font-weight:700;line-height:1.4">${esc(p.t)}</div>
      <div style="display:flex;align-items:center;gap:var(--sp-2);flex-wrap:wrap;margin-top:var(--sp-1);font-size:var(--fs-xs);color:var(--t2)">
        <span>${nick(p.by)}</span><span>·</span>
        <span class="st ${cf.c}" title="claimed ${cf.v}">置信 ${cf.n}</span>
        <span class="st ${rv.c}">${rv.n}</span>
        <span class="agec ${ageC}">${p.age}</span>
        ${p.st==='snooze'?'<span class="chip mut">稍后 · 明早再推</span>':''}
        ${p.camp?`<span class="chip camp">${p.camp}</span>`:''}</div>
    </div>
    <div style="text-align:right;flex:0 0 auto">
      <div style="font-size:var(--fs-xs);color:var(--t3)">负责人</div>
      <div style="font-size:var(--fs-sm);font-weight:600">${p.own}</div></div>
  </div>
  <div class="pcev">
    <div class="evl"><span class="k">信号</span><span class="v">${esc(p.sig)}</span></div>
    <div class="evl"><span class="k">基准</span><span class="v">${esc(p.base)}</span></div>
  </div>
  <div class="pcb">
    <div class="rlab">${nick(p.by)} 为什么提这条</div>
    ${esc(p.reason.judge)}
    <div class="rfoot">
      <span class="rf"><b>不做会怎样</b> ${esc(p.reason.ifnot)}</span>
      <button class="rf alt" onclick="openProp('${p.id}')">它还排除了 ${p.reason.ruled.length} 种做法 ↗</button>
    </div>
  </div>
  <div class="pcp">
    <span class="lb">采纳后执行</span>
    ${p.plan.map((x,i)=>`<span class="pstepc"><span class="i">${i+1}</span>${esc(x)}</span>`).join('')}
    <span class="lb" style="margin-left:auto">预估 ${p.imp}</span>
  </div>
  <div class="pca">
    <button class="btn sm" onclick="confirmProp('${p.id}',0)">采纳</button>
    <button class="btn ghost sm" onclick="confirmProp('${p.id}',1)">改一下再采纳</button>
    <button class="btn ghost sm" onclick="dropProp('${p.id}')">忽略</button>
    <button class="btn ghost sm" onclick="snoozeProp('${p.id}')">稍后</button>
    <button class="btn ghost sm" onclick="openProp('${p.id}')">依据 ↗</button>
  </div></div>`;
}
/* --- accept: confirm -> execute in place -> result strip (F2) --- */
function confirmProp(id,edit){
 const p=PROPS.find(x=>x.id===id);
 $('mod').innerHTML=`<div class="mbox">
  <div class="mhd"><div class="e">${edit?'改一下再采纳':'确认执行'}</div><h3>${esc(p.t)}</h3></div>
  <div class="mbd">
   <div style="font-size:var(--fs-sm);color:var(--t2);margin-bottom:var(--sp-3)">
     ${edit?('改动会作为比采纳更强的信号回到 '+nick(p.by)+'——它下次会照着你改的方向来。'):'这不会给你留待办。点确认，'+nick(p.agents[0])+' 立刻开始执行。'}</div>
   ${p.rev==='n'?`<div class="note" style="background:var(--danger-bg);border-color:var(--danger-bd);color:var(--danger-fg-strong);margin-bottom:var(--sp-3)">
     不可逆动作。执行后无法自动撤回——库存承诺一旦发出就在那了。</div>`:''}
   <div style="font-size:var(--fs-xs);font-weight:600;color:var(--t2);margin-bottom:var(--sp-2)">${edit?'现在的方案':'会执行什么'}</div>
   ${p.plan.map((x,i)=>`<div class="vrow"><span class="vv">${i+1}</span><span class="vt">${esc(x)}</span></div>`).join('')}
   ${edit?`<div class="fld" style="margin-top:var(--sp-4)"><label>想改什么？直接说就行</label>
     <textarea id="edn" rows="3" placeholder="例如：别汇总 90 天，只要最近一次活动的成果；简报发出去之前先给我过一眼"></textarea>
     <div style="font-size:var(--fs-xs);color:var(--t3);margin-top:var(--sp-1)">${nick(p.agents[0])} 会照你说的重排方案，你确认之后才执行。</div></div>`:''}
   <div class="ctx" style="margin-top:var(--sp-3)">
     <div class="ctxr"><span class="k">执行 Agent</span><span class="v">${p.agents.map(a=>nick(a)).join(' · ')}</span></div>
     <div class="ctxr"><span class="k">可逆性</span><span class="v">${REV[p.rev].n}</span></div>
     <div class="ctxr"><span class="k">结果回报给</span><span class="v">${p.own} · 就在这张卡上</span></div></div>
  </div>
  <div class="mft"><button class="btn" onclick="${edit?`recompose('${id}')`:`takeProp('${id}',0)`}">${edit?'让 '+nick(p.agents[0])+' 重排':'确认执行'}</button>
    <button class="btn ghost" onclick="closeMod()">取消</button></div></div>`;
 $('mod').classList.add('on');
}
function recompose(id){
 const p=PROPS.find(x=>x.id===id),note=($('edn')||{value:''}).value.trim();
 if(!note){toast('说一句你想改什么');return;}
 p.editNote=note;
 const old=p.plan.slice();
 p.plan=p.plan.map(x=>x).concat([]);
 p.plan[p.plan.length-1]=p.plan[p.plan.length-1]+'（按你的要求调整）';
 p.plan.push('执行前先交你过目：'+note.slice(0,20));
 $('mod').innerHTML=`<div class="mbox">
  <div class="mhd"><div class="e">${nick(p.agents[0])} 重排了方案</div><h3>${esc(p.t)}</h3></div>
  <div class="mbd">
   <div class="msg ag" style="border:0;padding:0;margin-bottom:var(--sp-3)">${AV(p.agents[0],26)}
     <div class="bd"><div class="hd"><span class="nm">${nick(p.agents[0])}</span><span class="chip dom">Agent</span></div>
       <div class="tx">收到。我按你说的重排了——原来的第 ${old.length} 步保留但按你的要求调整，另外加了一步在执行前交给你过目。其余不动。</div></div></div>
   <div style="font-size:var(--fs-xs);font-weight:600;color:var(--t2);margin-bottom:var(--sp-2)">改后的方案</div>
   ${p.plan.map((x,i)=>`<div class="vrow"><span class="vv">${i+1}</span><span class="vt">${esc(x)}</span>
     ${i>=old.length-1?'<span class="chip lv">改动</span>':''}</div>`).join('')}
   <div class="note" style="margin-top:var(--sp-3)">你的原话会作为比"直接采纳"更强的信号回到 ${nick(p.by)}——它下次会照这个方向来。</div>
  </div>
  <div class="mft"><button class="btn" onclick="takeProp('${id}',1)">确认执行</button>
    <button class="btn ghost" onclick="confirmProp('${id}',1)">再改</button></div></div>`;
}
function takeProp(id,edit){
 const p=PROPS.find(x=>x.id===id);
 p.edited=!!edit;closeMod();
 const tid='pt'+Date.now();
 T.unshift({cr:p.src==='h'?{s:'h',w:p.from}:{s:'a',w:p.by},id:tid,new:1,t:p.t,camp:p.camp,dom:p.dom,ag:p.agents[0],own:'du',st:'run',up:'刚刚',day:0,
  lv:LV[(REG.find(y=>y.id===p.agents[0])||{lv:1}).lv].k,cost:'¥0.20',
  intent:{who:'du',tx:'采纳了 '+nick(p.by)+' 的提案：'+p.t+(edit?'。我要求改的是：'+p.editNote:''),at:'刚刚'},
  plan:{v:edit?2:1,tx:'来自提案的预编排方案。'+p.why,adj:edit?'dudu 在采纳时提了改动：'+p.editNote:null,
   steps:p.plan.map((x,i)=>({l:x,m:i===0?'进行中':'排队中',s:i===0?'act':'todo',r:i===0?'刚开始':'—'}))},
  cmts:(p.cmts||[]).slice()});
 p.tid=tid;p.st='running';render();
 toast('执行中 · 结果会回到这张卡上');
 setTimeout(()=>{p.st='done';if(S.view==='prop')render();},3200);
}
/* --- dismiss (S4): six enumerated reasons, confirm blocked until chosen --- */
function dropProp(id){
 S.dr=null;S.drId=id;drawDrop();
}
function drawDrop(){
 const p=PROPS.find(x=>x.id===S.drId);
 $('mod').innerHTML=`<div class="mbox" style="max-width:520px">
  <div class="mhd"><div class="e">忽略提案</div><h3>为什么不做？</h3></div>
  <div class="mbd">
   <div style="font-size:var(--fs-sm);color:var(--t2);margin-bottom:var(--sp-3)">
     必须选一个理由——它是 ${nick(p.by)} 唯一能学到东西的地方。忽略得越具体，它下次越不会白推。</div>
   <div class="rgrid">${DROPR.map(r=>`<button class="rchip ${S.dr===r?'on':''}" onclick="S.dr='${r}';drawDrop()">${r}</button>`).join('')}</div>
   <div class="fld" style="margin-top:var(--sp-3)"><label>补充说明 <span class="ct">可选</span></label>
     <textarea id="drn" rows="2" placeholder="具体一点会更有用…"></textarea></div>
  </div>
  <div class="mft"><button class="btn" onclick="doDrop()" ${S.dr?'':'style="opacity:.45;pointer-events:none"'}>确认忽略</button>
    <button class="btn ghost" onclick="closeMod()">取消</button>
    <span style="margin-left:auto;font-size:var(--fs-xs);color:var(--t3)">${S.dr?'理由会回到反馈回路':'先选一个理由'}</span></div></div>`;
 $('mod').classList.add('on');
}
function doDrop(){
 const p=PROPS.find(x=>x.id===S.drId);
 p.st='drop';p.dropWhy=S.dr;p.dropNote=($('drn')||{value:''}).value.trim();
 p.undo='已忽略 · '+S.dr;closeMod();render();
 setTimeout(()=>{p.undo=null;if(S.view==='prop')render();},4200);
 toast('已忽略 · 理由回到 '+nick(p.by)+' 的反馈回路');
}
function snoozeProp(id){const p=PROPS.find(x=>x.id===id);p.st='snooze';p.undo='已推迟到明早';
 render();setTimeout(()=>{p.undo=null;if(S.view==='prop')render();},4200);toast('明早再推一次 · 之后过期');}
function undoProp(id){const p=PROPS.find(x=>x.id===id);p.st='new';p.undo=null;p.dropWhy=null;render();toast('已撤销');}
/* --- detail drawer (S3) --- */
function openProp(id){
 const p=PROPS.find(x=>x.id===id);S.prop=id;
 $('dw').innerHTML=`<div class="dw-h">
   <button class="ib" onclick="closeDw()"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
   ${AV(p.by,30)}
   <div style="flex:1;min-width:0"><div class="ty">提案 · ${nick(p.by)}</div><h3>${esc(p.t)}</h3></div></div>
  <div class="dw-b">
   <div class="reasoning">
     <div class="rh">${AV(p.by,22)} ${nick(p.by)} 的推理</div>
     <div class="rstep"><span class="rn">1</span><div><b>我看到了什么</b>
       <div>${esc(p.reason.saw)}</div>
       <div class="rbase">对照基准：${esc(p.base)}</div></div></div>
     <div class="rstep"><span class="rn">2</span><div><b>为什么值得打扰你</b>
       <div>${esc(p.reason.judge)}</div></div></div>
     <div class="rstep"><span class="rn">3</span><div><b>我排除了什么</b>
       ${p.reason.ruled.map(r=>`<div class="rruled">${esc(r)}</div>`).join('')}</div></div>
     <div class="rstep"><span class="rn">4</span><div><b>照做会怎样</b>
       <div>${esc(p.reason.ifdo)}</div>
       <div class="rbase">${esc(p.reason.ifdob)}</div></div></div>
     <div class="rstep last"><span class="rn">5</span><div><b>不做会怎样</b>
       <div>${esc(p.reason.ifnot)}</div></div></div>
   </div>
   <div style="font-size:var(--fs-xs);font-weight:600;color:var(--t2);margin:var(--sp-4) 0 8px">依据</div>
   <div class="ctx" style="margin-bottom:var(--sp-2)">${p.ev.map(e=>`<div class="ctxr"><span class="k">${e[0]}</span><span class="v" style="text-align:right;max-width:58%">${esc(e[1])}</span></div>`).join('')}</div>
   <div class="sparkwrap"><div class="sparkband"></div>
     <svg viewBox="0 0 200 46" preserveAspectRatio="none" style="width:100%;height:46px;position:relative">
       <polyline points="0,30 25,28 50,32 75,29 100,27 125,26 150,20 175,10 200,4" fill="none" stroke="var(--primary)" stroke-width="2"/></svg>
     <div class="sparkl"><span>30 天基准带宽</span><span>当前偏离</span></div></div>
   <div style="font-size:var(--fs-xs);font-weight:600;color:var(--t2);margin:var(--sp-4) 0 8px">会执行什么</div>
   <div class="plan-pv" style="margin-bottom:var(--sp-2)">${p.plan.map((x,i)=>`<div class="s"><span class="i">${i+1}</span>${esc(x)}</div>`).join('')}
     <div style="font-size:var(--fs-xs);color:var(--t3);margin-top:var(--sp-2)">预估 ${p.cost} · ${p.agents.map(a=>nick(a)).join(' · ')} · 可在采纳时修改</div></div>
   <div class="ctx" style="margin-bottom:var(--sp-4)">
     <div class="ctxr"><span class="k">可逆性</span><span class="v" style="color:${p.rev==='n'?'#B91C1C':''}">${REV[p.rev].n}${p.rev==='n'?' · 永不自动执行':''}</span></div>
     <div class="ctxr"><span class="k">来源</span><span class="v">${nick(p.by)} · ${(REG.find(a=>a.id===p.by)||{}).tr?.map(t=>TRN[t]).join(' / ')||'定时'}</span></div>
     <div class="ctxr"><span class="k">声称置信</span><span class="v num">${CONF[p.conf].v} · ${CONF[p.conf].n}</span></div>
     <div class="ctxr"><span class="k">排序分</span><span class="v num">${p.score} / 门槛 60</span></div>
     <div class="ctxr"><span class="k">负责人</span><span class="v">${p.own}</span></div></div>
   <button class="btn ghost sm" onclick="closeDw();openTrace('${p.by}','${(T[0]||{}).id}')">看 ${nick(p.by)} 怎么判断的 ↗</button>
   <div style="margin-top:var(--sp-4)"><div style="font-size:var(--fs-xs);font-weight:600;color:var(--t2);margin-bottom:var(--sp-2)">讨论 ${(p.cmts||[]).length}</div>
     ${(p.cmts||[]).length?p.cmts.map(c=>`<div class="msg"><span class="avs" style="background:${U[c.w].c}">${U[c.w].s}</span>
       <div class="bd"><div class="hd"><span class="nm">${U[c.w].n}</span><span class="tm">${c.at}</span></div>
       <div class="tx">${mHTML(c.tx)}</div></div></div>`).join('')
      :'<div style="font-size:var(--fs-sm);color:var(--t3)">还没人说话。</div>'}
     <div class="sub-c" style="border:1px solid var(--border);border-radius:var(--r);margin-top:var(--sp-2)">
       <textarea id="pi" rows="2" placeholder="对这条提案的判断…"></textarea>
       <div class="row2"><button class="btn ghost sm" onclick="propC('${p.id}')">对同事说</button></div></div></div>
  </div>
  <div class="dw-f">
   ${['new','snooze'].includes(p.st)?`<button class="btn" onclick="closeDw();confirmProp('${p.id}',0)">采纳</button>
     <button class="btn ghost" onclick="closeDw();confirmProp('${p.id}',1)">改一下再采纳</button>
     <button class="btn ghost" onclick="closeDw();dropProp('${p.id}')">忽略</button>`
    :`<span style="font-size:var(--fs-sm);color:var(--t2)">${p.st==='drop'?'已忽略 · '+p.dropWhy:'已采纳'}</span>`}
  </div>`;
 $('dw').classList.add('on');$('scrim').classList.add('on');
}
function propC(id){const p=PROPS.find(x=>x.id===id),v=$('pi');if(!v.value.trim())return;
 (p.cmts=p.cmts||[]).push({w:'du',tx:v.value.trim(),at:'刚刚'});openProp(id);toast('已留言');}
/* --- S6 Broker Console + S8 suppression log --- */
const TIERS=[['observe','观察'],['propose','提案'],['auto','自动']];
function brokerConsole(){
 const em=[...new Set(pAgents().map(p=>p.by).concat(SUPPRESSED.map(x=>x.by)))];
 const A=PROPS.filter(p=>p.src==='a'&&['new','snooze'].includes(p.st)).length;
 return `<div class="note" style="margin-bottom:var(--sp-3)">只有平台负责人看得到这一屏。这里管的是「什么够格打扰人」，不是 agent 本身的配置——那个在 Agents。</div>
 <div class="kb" style="grid-template-columns:repeat(4,1fr);margin-bottom:var(--sp-4)">
   ${[['采纳率','68%','近 30 天'],['决定中位时长','4分12秒','从推送到决定'],
     ['今日推送',A+' / '+BUDGET,'每人每天预算'],['归属覆盖','100%','都有唯一负责人']].map(k=>
   `<div class="kcol" style="min-height:0;text-align:center;padding:var(--sp-3) 10px">
     <div style="font-size:var(--fs-xs);color:var(--t3)">${k[0]}</div>
     <div class="num" style="font-size:var(--fs-xl);font-weight:700;margin:var(--sp-1) 0">${k[1]}</div>
     <div style="font-size:var(--fs-xs);color:var(--t3)">${k[2]}</div></div>`).join('')}</div>
 <div class="sech"><span class="t">发射器</span><span class="n num">${em.length}</span><span class="bar2"></span>
   <span class="hint">低于采纳率下限的会被自动降级</span></div>
 ${em.map(id=>{const a=REG.find(x=>x.id===id)||{};
  const rate=({trend:71,ad:84,insp:62,csa:45,comp:58,kol:33})[id]||50;
  const low=rate<50, tier=low?0:1;
  return `<div class="pcard" style="padding:var(--sp-3) 15px;${low?'border-left:3px solid var(--red)':''}">
   <div class="agrow">${AV(id,30)}
     <div style="flex:1;min-width:0"><div style="font-size:var(--fs-md);font-weight:600">${a.nick||id}
       ${low?'<span class="chip" style="background:var(--warn-bg);color:var(--warn-fg);border:1px solid var(--warn-bd)">已降级 · 8/12</span>':''}</div>
       <div style="font-size:var(--fs-xs);color:var(--t3)">${a.n||''}</div></div>
     <div style="text-align:right"><div class="num" style="font-size:var(--fs-lg);font-weight:700;${low?'color:var(--red)':''}">${rate}%</div>
       <div style="font-size:var(--fs-xs);color:var(--t3)">采纳率</div></div>
   </div>
   <div style="display:flex;align-items:center;gap:var(--sp-2);margin-top:var(--sp-3);flex-wrap:wrap">
     <div class="seg" style="padding:var(--sp-1)">${TIERS.map((t,i)=>`<button class="${i===tier?'on':''}" style="padding:var(--sp-1) 10px;font-size:var(--fs-xs);${i===2?'opacity:.4;cursor:not-allowed':''}"
       onclick="${i===2?"toast('自动档是 Phase 2，现在不开')":"toast('已把 "+(a.nick||id)+" 设为 "+t[1]+" 档')"}">${t[1]}${i===2?' ·  P2':''}</button>`).join('')}</div>
     <span style="font-size:var(--fs-xs);color:var(--t3)">校准偏差 ${low?'+0.22 · 高估':'+0.04'}</span>
     <button class="btn ghost sm" style="margin-left:auto" onclick="openAgent('${id}')">配置 ↗</button>
     <button class="btn ghost sm" onclick="toast('已停用 ${a.nick||id} 的提案能力')">停用</button>
   </div></div>`;}).join('')}
 <div class="sech" style="margin-top:var(--sp-5)"><span class="t">被过滤掉的提案</span><span class="n num">${SUPPRESSED.length}</span><span class="bar2"></span>
   <span class="hint">你没看到的东西，以及为什么</span></div>
 <div class="pcard" style="padding:0">
  <div class="suph"><span style="flex:1">提案</span><span style="width:76px">发射器</span><span style="width:64px;text-align:right">分数</span>
    <span style="width:64px;text-align:right">门槛</span><span style="width:72px;text-align:right">归属</span></div>
  ${SUPPRESSED.map(x=>`<div class="supr">
    <span style="flex:1;min-width:0"><b style="font-size:var(--fs-sm)">${esc(x.t)}</b>
      <span style="display:block;font-size:var(--fs-xs);color:var(--t3);margin-top:var(--sp-1)">${esc(x.why)}</span></span>
    <span style="width:76px;font-size:var(--fs-xs);color:var(--t2)">${nick(x.by)}</span>
    <span style="width:64px;text-align:right" class="num">${x.score}</span>
    <span style="width:64px;text-align:right;color:var(--t3)" class="num">${x.thr}</span>
    <span style="width:72px;text-align:right;font-size:var(--fs-xs)">${x.own}</span></div>`).join('')}
 </div>`;
}
