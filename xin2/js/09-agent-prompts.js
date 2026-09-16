/* ============ Agent prompt management ============ */
const PMST={test:{n:'测试中',c:'run'},pending:{n:'待上线',c:'review'},live:{n:'使用中',c:'done'},retired:{n:'已下线',c:'todo'}};
const PMTYPE={run:'可运行',frag:'共享片段'};
const MODELS=['gpt-4o','gpt-4.1','gpt-5.4','claude-sonnet-4-6','gemini-2.5-pro'];
const SLOTS={
 gen:['{{品牌调性}}','{{活动Brief}}','{{禁用词}}','{{产品资料}}','{{平台}}','{{历史表现}}'],
 plan:['{{活动Brief}}','{{预算}}','{{渠道组合}}','{{排期}}','{{品牌调性}}'],
 pdp:['{{产品资料}}','{{类目规则}}','{{卖点排序}}','{{价格}}','{{品牌调性}}'],
 promoimg:['{{产品图}}','{{广告标语}}','{{创意方向}}','{{人群摘要}}','{{尺寸}}'],
 cs:['{{订单信息}}','{{会员等级}}','{{话术库}}','{{补偿上限}}','{{角色设定}}'],
 kol:['{{达人库}}','{{品牌目标}}','{{预算}}','{{黑名单}}','{{打分权重}}'],
 seo:['{{关键词}}','{{站内结构}}','{{历史表现}}','{{内链候选}}'],
 ad:['{{投放数据}}','{{阈值}}','{{人群包}}','{{活动阶段}}'],
 msg:['{{人群}}','{{触达场景}}','{{品牌调性}}','{{禁用词}}'],
 vid:['{{已批准方向}}','{{时长}}','{{比例}}','{{产品资料}}'],
 orch:['{{用户意图}}','{{可用Agent}}','{{知识库摘要}}','{{活动上下文}}']
};
const PSHARED=[
 {id:'ps-style',shared:true,n:'平台内容风格与规范提示词',ty:'frag',v:6,st:'live',model:null,by:'asher',at:'2026.07.08 06:07',note:'补充小红书标题长度上限与表情使用规范',use:['gen','plan','pdp','seo','msg'],slots:['{{平台}}','{{品牌调性}}','{{禁用词}}'],body:'以下是所有内容类产出必须遵守的平台规范，优先级高于单个场景的提示词。\n\n平台：{{平台}}\n品牌调性：{{品牌调性}}\n\n通用规则\n· 标题不超过平台上限，小红书 20 字、抖音 30 字。\n· 正文段落之间空一行，不使用连续感叹号。\n· 禁用词按 {{禁用词}} 全量校验，命中即停，不做近义替换。',hist:[{v:6,by:'asher',at:'2026.07.08',note:'补充小红书标题长度上限与表情使用规范'},{v:5,by:'asher',at:'2026.06.02',note:'加入绝对化用语禁令'}]},
 {id:'ps-img',shared:true,n:'AI 生图提示词组',ty:'run',v:12,st:'live',model:'gemini-2.5-pro',by:'asher',at:'2026.03.03 08:05',note:'—',use:['gen','pdp','vid','promoimg'],slots:['{{产品图}}','{{创意方向}}','{{尺寸}}'],body:'根据产品参考图与创意方向生成图片提示词。\n\n参考图：{{产品图}}\n创意方向：{{创意方向}}\n输出尺寸：{{尺寸}}\n\n保持包装、瓶身颜色与品牌标识与参考图一致，不新增多余文字。',hist:[{v:12,by:'asher',at:'2026.03.03',note:'—'}]},
 {id:'ps-proj-new',shared:true,n:'创建 Project 提示词',ty:'run',v:3,st:'live',model:'gpt-4o',by:'asher',at:'2026.03.26 07:11',note:'—',use:['orch'],slots:['{{用户意图}}','{{活动上下文}}'],body:'把一句话意图拆解成一个可执行的 Project。\n\n用户意图：{{用户意图}}\n活动上下文：{{活动上下文}}\n\n信息不够先问，不猜；信息完整后再拆步骤。',hist:[{v:3,by:'asher',at:'2026.03.26',note:'—'}]},
 {id:'ps-proj-upd',shared:true,n:'更新 Project 提示词',ty:'run',v:1,st:'live',model:'gpt-4o',by:'cherry',at:'2026.04.13 09:46',note:'—',use:['orch'],slots:['{{用户意图}}','{{活动上下文}}'],body:'根据新的补充信息更新已有 Project 的计划。\n\n变更请求：{{用户意图}}\n\n已完成的步骤不重跑；计划版本号递增。',hist:[{v:1,by:'cherry',at:'2026.04.13',note:'—'}]}
];
const PROMPTS=[
 {id:'pg-gen-now',ag:'gen',n:'即时内容创作提示词组',ty:'run',v:5,st:'live',model:'gpt-5.4',by:'asher',at:'2026.06.10 08:06',note:'把“低预算”从卖点改成约束，避免和专业修护定位打架',runs:142,ed:18,slots:SLOTS.gen,body:'你是 XDIGATE 的内容生成 Agent。按品牌调性与产品资料，为 {{平台}} 生成可直接发布的种草图文。\n\n品牌调性：{{品牌调性}}\n产品资料：{{产品资料}}\n\n一次输出 3 个方向，每个方向给出标题、正文、话题标签、配图建议。全文经过 {{禁用词}} 校验。',hist:[{v:5,by:'asher',at:'2026.06.10',note:'把“低预算”从卖点改成约束'},{v:4,by:'asher',at:'2026.05.28',note:'三方向改为必须输出'}]},
 {id:'pg-gen-camp',ag:'gen',n:'活动内容创作提示词组',ty:'run',v:4,st:'live',model:'gpt-4.1',by:'asher',at:'2026.06.10 08:06',note:'大促期标题前置活动标识',runs:96,ed:24,slots:SLOTS.gen,body:'按活动 Brief 生成大促期内容。\n\n活动 Brief：{{活动Brief}}\n历史表现：{{历史表现}}\n\n标题前置活动标识，正文第一屏出现利益点。',hist:[{v:4,by:'asher',at:'2026.06.10',note:'大促期标题前置活动标识'}]},
 {id:'pg-gen-test',ag:'gen',n:'即时内容创作提示词组',ty:'run',v:6,st:'test',model:'claude-sonnet-4-6',by:'dudu',at:'2026.09.12 16:20',note:'',runs:11,ed:9,slots:SLOTS.gen,body:'你是 XDIGATE 的内容生成 Agent。按品牌调性与产品资料，为 {{平台}} 生成可直接发布的种草图文。\n\n品牌调性：{{品牌调性}}\n产品资料：{{产品资料}}\n\n一次输出 3 个方向，每个方向给出标题、正文、话题标签、配图建议。全文经过 {{禁用词}} 校验。',hist:[{v:6,by:'dudu',at:'2026.09.12',note:'试 claude-sonnet-4-6'}]},
 {id:'pg-gen-old',ag:'gen',n:'社媒正文提示词组（旧）',ty:'run',v:2,st:'retired',model:'gpt-4o',by:'cherry',at:'2026.04.02 09:00',note:'被“即时内容创作提示词组”替代',runs:0,ed:0,slots:SLOTS.gen,body:'根据品牌资料生成社媒正文。',hist:[{v:2,by:'cherry',at:'2026.04.02',note:'被新版本替代'}]},
 {id:'pg-plan',ag:'plan',n:'活动策划提示词组',ty:'run',v:7,st:'live',model:'claude-sonnet-4-6',by:'asher',at:'2026.06.09 09:43',note:'补充分阶段预算与渠道责任',runs:24,ed:22,slots:SLOTS.plan,body:'生成活动主题、排期、预算分配与渠道分工。\n活动 Brief：{{活动Brief}}\n预算：{{预算}}\n渠道：{{渠道组合}}\n排期：{{排期}}',hist:[{v:7,by:'asher',at:'2026.06.09',note:'补充分阶段预算与渠道责任'}]},
 {id:'pg-pdp',ag:'pdp',n:'详情页生成提示词组',ty:'run',v:6,st:'live',model:'gpt-5.4',by:'Brooks',at:'2026.08.03 11:20',note:'先生成规划表，再生成详情页内容',runs:57,ed:41,slots:SLOTS.pdp,body:'根据 {{产品资料}} 与 {{类目规则}} 生成详情页规划。卖点顺序：{{卖点排序}}。',hist:[{v:6,by:'Brooks',at:'2026.08.03',note:'先生成规划表'}]},
 {id:'pg-img',ag:'promoimg',n:'推广图生成提示词组',ty:'run',v:3,st:'live',model:'gemini-2.5-pro',by:'Sam',at:'2026.08.11 15:10',note:'补充参考图一致性要求',runs:24,ed:12,slots:SLOTS.promoimg,body:'依据 {{产品图}}、{{广告标语}} 与 {{创意方向}} 生成 {{尺寸}} 推广图。',hist:[{v:3,by:'Sam',at:'2026.08.11',note:'补充参考图一致性要求'}]},
 {id:'pg-cs',ag:'cs',n:'客服回复提示词组',ty:'run',v:9,st:'live',model:'gpt-4.1',by:'Ariel',at:'2026.08.02 09:40',note:'补充补偿上限校验',runs:1284,ed:12,slots:SLOTS.cs,body:'结合 {{订单信息}}、{{会员等级}} 和 {{话术库}} 生成客服回复，补偿不得超过 {{补偿上限}}。',hist:[{v:9,by:'Ariel',at:'2026.08.02',note:'补充补偿上限校验'}]},
 {id:'pg-kol',ag:'kol',n:'达人匹配提示词组',ty:'run',v:4,st:'live',model:'gpt-4.1',by:'Sophie',at:'2026.07.21 14:00',note:'加入冷却期与黑名单校验',runs:14,ed:29,slots:SLOTS.kol,body:'基于 {{达人库}}、{{品牌目标}} 与 {{打分权重}} 输出达人名单，规避 {{黑名单}}。',hist:[{v:4,by:'Sophie',at:'2026.07.21',note:'加入冷却期与黑名单校验'}]},
 {id:'pg-seo',ag:'seo',n:'SEO 内容提示词组',ty:'run',v:5,st:'live',model:'gpt-5.4',by:'Sophie',at:'2026.07.12 10:30',note:'补充内链候选规则',runs:33,ed:9,slots:SLOTS.seo,body:'围绕 {{关键词}} 生成文章结构与正文，参考 {{站内结构}} 和 {{内链候选}}。',hist:[{v:5,by:'Sophie',at:'2026.07.12',note:'补充内链候选规则'}]},
 {id:'pg-ad',ag:'ad',n:'广告优化提示词组',ty:'run',v:4,st:'live',model:'gpt-4.1',by:'Brooks',at:'2026.07.18 08:50',note:'低曝光计划不自动暂停',runs:88,ed:12,slots:SLOTS.ad,body:'读取 {{投放数据}} 与 {{阈值}}，给出暂停、放量或继续观察建议。',hist:[{v:4,by:'Brooks',at:'2026.07.18',note:'低曝光计划不自动暂停'}]},
 {id:'pg-msg',ag:'msg',n:'消息内容提示词组',ty:'run',v:3,st:'live',model:'gpt-4.1',by:'Ariel',at:'2026.06.28 12:10',note:'增加触达场景约束',runs:73,ed:26,slots:SLOTS.msg,body:'根据 {{人群}} 与 {{触达场景}} 生成消息文案，遵守 {{品牌调性}} 与 {{禁用词}}。',hist:[{v:3,by:'Ariel',at:'2026.06.28',note:'增加触达场景约束'}]},
 {id:'pg-orch',ag:'orch',n:'任务编排提示词组',ty:'run',v:8,st:'live',model:'gpt-5.4',by:'Shlomi',at:'2026.08.09 07:30',note:'缺关键信息时先澄清',runs:318,ed:0,slots:SLOTS.orch,body:'把 {{用户意图}} 拆成可执行计划，从 {{可用Agent}} 中分派。信息不足时先提问。',hist:[{v:8,by:'Shlomi',at:'2026.08.09',note:'缺关键信息时先澄清'}]}
];

function allPrompts(){return PROMPTS.concat(PSHARED)}
function findPrompt(id){return allPrompts().find(p=>p.id===id)}
function promptsOf(id){return PROMPTS.filter(p=>p.ag===id)}
function sharedFor(id){return PSHARED.filter(p=>(p.use||[]).includes(id))}
function livePrompt(id){return PROMPTS.find(p=>p.ag===id&&p.st==='live')}
function promptOwner(p){if(p.shared)return 'Shlomi';const a=REG.find(x=>x.id===p.ag);return a?a.own:'Shlomi'}
function promptAgentName(p){if(p.shared)return (p.use||[]).length+' 个 Agent 引用';const a=REG.find(x=>x.id===p.ag);return a?a.nick:p.ag}
function slotsUsed(body){return [...new Set((String(body).match(/\{\{[^}]+\}\}/g)||[]))]}
function slotPalette(p){return p.shared?(p.slots||[]):(SLOTS[p.ag]||p.slots||[])}
function badSlots(p,body){const pal=slotPalette(p);return slotsUsed(body).filter(s=>!pal.includes(s))}

vAgents=function(){
 if(S.atab===undefined)S.atab=0;if(S.adom===undefined)S.adom='全部';if(S.alv===undefined)S.alv='全部';
 const doms=['全部','内容','电商','用户运营','KOL','B2B','平台'],levels=['全部','M1','M2','M3'];
 const list=REG.filter(a=>(S.adom==='全部'||a.dom===S.adom)&&(S.alv==='全部'||LV[a.lv].k===S.alv)),live=REG.filter(a=>a.b==='live').length;
 return `<div class="wrap"><div class="eyebrow">平台 · Agents</div><h1>Agents</h1><div class="sub">这里是登记处，不是工作台。每个 agent 的自主级别、归属、成本和产出类型都在这里定——工作永远发生在「工作」里。</div>
 <div class="daystrip"><span class="sm"><span class="odot on"></span> 在线 <b class="num">${REG.filter(a=>ONLINE[a.id]).length}</b> · 共 <b class="num">${REG.length}</b> 个 · 已上线 <b class="num">${live}</b> · 开发中 <b class="num">${REG.filter(a=>a.b==='dev').length}</b> · 规划中 <b class="num">${REG.filter(a=>a.b==='plan').length}</b></span></div>
 <div class="bar"><div class="seg"><button class="${S.atab===0?'on':''}" onclick="S.atab=0;render()">Agent 登记处</button><button class="${S.atab===1?'on':''}" onclick="S.atab=1;render()">配方 ${RECIPES.filter(r=>!r.cad).length}</button><button class="${S.atab===2?'on':''}" onclick="S.atab=2;render()">例行 ${RECIPES.filter(r=>r.cad).length}${RECIPES.filter(r=>r.attn).length?` <span class="n">${RECIPES.filter(r=>r.attn).length}</span>`:''}</button><button class="${S.atab===3?'on':''}" onclick="S.atab=3;render()">共享提示词 ${PSHARED.length}</button></div>
 ${S.atab===0?`<div class="seg">${doms.map(d=>`<button class="${S.adom===d?'on':''}" onclick="S.adom='${d}';render()">${d}</button>`).join('')}</div><div class="seg">${levels.map(l=>`<button class="${S.alv===l?'on':''}" onclick="S.alv='${l}';render()">${l}</button>`).join('')}</div>`:''}</div>
 ${S.atab===0?list.map(agRow).join(''):S.atab===1?recipesOnly():S.atab===2?routinesOnly():sharedPromptsView()}</div>`;
};

drawAgent=function(){
 const a=REG.find(x=>x.id===S.ag);if(!a)return;const tabs=['概览','提示词','配置','最近运行'];const body=[agOv(a),agPrompts(a),agConfig(a),agRuns(a)][S.agtab]||agOv(a);
 $('dw').innerHTML=`<div class="dw-h"><button class="ib" onclick="closeDw()"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>${AV(a.id,30)}<div style="flex:1;min-width:0"><div class="ty">${a.dom}</div><h3>${a.nick}</h3></div><span class="st ${BS[a.b].c}">${BS[a.b].n}</span></div>
 <div class="dw-tabs">${tabs.map((t,i)=>`<button class="${S.agtab===i?'on':''}" onclick="S.agtab=${i};drawAgent()">${t}</button>`).join('')}</div><div class="dw-b">${body}</div><div class="dw-f">${S.agtab===2?`<button class="btn" onclick="toast('已保存 Agent 配置')">保存</button>`:S.agtab===1?`<span style="font-size:var(--fs-xs);color:var(--t3)">编辑与试跑不用找开发 · 上线要 ${a.own} 批准</span>`:a.b==='live'&&ONLINE[a.id]?`<button class="btn" onclick="openActivate('${a.id}')">立即运行</button>`:''}<span style="margin-left:auto;font-family:'Sora';font-size:var(--fs-xs);color:var(--t3)">${LV[a.lv].k}</span></div>`;
};

function agPrompts(a){
 const mine=promptsOf(a.id),shared=sharedFor(a.id),slots=SLOTS[a.id]||[],states=['live','test','pending','retired'];
 const counts=Object.fromEntries(states.map(k=>[k,mine.filter(p=>p.st===k).length]));
 S.pmPromptFilter=S.pmPromptFilter||{};
 if(!states.includes(S.pmPromptFilter[a.id]))S.pmPromptFilter[a.id]=counts.live?'live':counts.test?'test':counts.pending?'pending':'retired';
 const active=S.pmPromptFilter[a.id],visible=mine.filter(p=>p.st===active),activeName=PMST[active].n;
 return `<div class="pm-filterbar" role="tablist" aria-label="提示词状态">${states.map(k=>`<button class="${active===k?'on':''}" role="tab" aria-selected="${active===k}" onclick="S.pmPromptFilter['${a.id}']='${k}';drawAgent()"><span>${PMST[k].n}</span><span class="pm-filter-count">${counts[k]}</span></button>`).join('')}</div>
 ${visible.length?visible.map(p=>pmRow(p,false)).join(''):`<div class="allclear pm-empty">暂无${activeName}的提示词。</div>`}
 <div class="bar" style="margin:var(--sp-2) 0 14px"><span class="spacer"></span><button class="btn ghost sm" onclick="newPrompt('${a.id}')">＋ 新建提示词</button></div>${shared.length?`<div style="font-size:var(--fs-xs);font-weight:700;color:var(--t1);margin:var(--sp-4) 0 7px">引用的共享提示词 <span style="font-weight:400;color:var(--t3)">· 在「共享提示词」里维护，改动会同时影响其他 Agent</span></div>${shared.map(p=>pmRow(p,true)).join('')}`:''}${slots.length?`<div style="font-size:var(--fs-xs);font-weight:700;color:var(--t1);margin:var(--sp-4) 0 7px">可用变量槽 <span style="font-weight:400;color:var(--t3)">· 由代码填充，需要新槽位要找开发加</span></div><div class="pm-slots">${slots.map(s=>`<span class="pm-slot">${esc(s)}</span>`).join('')}</div>`:''}`
}
function pmRow(p,isRef){const st=PMST[p.st];return `<button class="pmrow ${isRef?'ref':''}" onclick="openPrompt('${p.id}')"><span class="pmv">v${p.v}</span><span class="pmb"><span class="pmt">${esc(p.n)}<span class="st ${st.c}">${st.n}</span>${p.ty==='frag'?'<span class="chip mut">共享片段</span>':''}${isRef?`<span class="chip dom">被 ${(p.use||[]).length} 个 Agent 引用</span>`:''}</span><span class="pmm">${p.model?`<span class="pmmodel">${p.model}</span>`:'<span class="pmmodel none">无直接模型 · 被其他提示词组合调用</span>'} · ${p.by} · ${p.at}${p.st==='live'&&p.runs?` · 已跑 <span class="num">${p.runs}</span> 次 · 编辑率 <span class="num">${p.ed}%</span>`:''}</span><span class="pmm" style="color:var(--t2)">${p.note&&p.note!=='—'?'改动理由：'+esc(p.note):'<span style="color:var(--danger-fg)">这一版没写改动理由</span>'}</span></span></button>`}
function sharedPromptsView(){return `<div class="note" style="margin-bottom:var(--sp-3)">共享提示词不属于任何单个 Agent。改一版，所有引用它的 Agent 下次运行就一起变——上线审批比单个 Agent 的提示词更重。</div><div class="bar" style="margin:0 0 14px"><span class="chip mut">${PSHARED.length} 条</span><span class="chip mut">${PSHARED.filter(p=>p.ty==='frag').length} 个共享片段</span><span class="spacer"></span><button class="btn sm" onclick="newPrompt(null)">＋ 新建共享提示词</button></div>${PSHARED.map(p=>pmRow(p,true)).join('')}`}

function openPrompt(id){const p=findPrompt(id);if(!p)return;const note=p.note&&p.note!=='—'?p.note:'';S.pm={id,body:p.body,model:p.model,note,originalBody:p.body,originalModel:p.model,originalNote:note,dirty:false,tab:0,chat:[]};drawPrompt();$('mod').classList.add('on')}
function pmSet(k,v){if(!S.pm)return;S.pm[k]=v;S.pm.dirty=S.pm.body!==S.pm.originalBody||S.pm.model!==S.pm.originalModel||S.pm.note!==S.pm.originalNote;pmDirtyState()}
function pmDirtyState(){const b=$('pm-dirty');if(!b||!S.pm)return;b.hidden=!S.pm.dirty}
function promptFamily(p){return p.family||(p.shared?'shared|':'agent|'+p.ag+'|')+p.n}
function promptVersions(p){const family=promptFamily(p);return allPrompts().filter(x=>promptFamily(x)===family)}
function createPromptTestVersion(id){
 const p=findPrompt(id);if(!p)return;const existing=promptVersions(p).find(x=>x.st==='test'||x.st==='pending');
 if(existing){openPrompt(existing.id);toast(existing.st==='test'?'已打开现有测试版本':'已有版本待上线，需先撤回后才能继续修改');return}
 const next=Math.max(...promptVersions(p).map(x=>x.v||0))+1,q={...p,id:'prompt-'+Date.now(),family:promptFamily(p),v:next,st:'test',by:'dudu',at:'刚刚',body:p.body,note:'',runs:0,ed:0,testRuns:0,hist:(p.hist||[]).map(x=>({...x})),slots:(p.slots||[]).slice(),use:p.use?(p.use||[]).slice():undefined};
 (p.shared?PSHARED:PROMPTS).unshift(q);if(q.ag){S.pmPromptFilter=S.pmPromptFilter||{};S.pmPromptFilter[q.ag]='test'}openPrompt(q.id);toast('已创建 v'+next+' 测试版本 · 当前使用中版本保持不变')
}
function pmInsertSlot(slot){const t=$('pm-body');if(!t)return;const a=t.selectionStart||0,b=t.selectionEnd||0;t.value=t.value.slice(0,a)+slot+t.value.slice(b);pmSet('body',t.value);t.focus();t.selectionStart=t.selectionEnd=a+slot.length;pmSyncSlots()}
function pmSyncSlots(){const p=findPrompt(S.pm.id),t=$('pm-body');if(!p||!t)return;pmSet('body',t.value);const used=slotsUsed(t.value),bad=badSlots(p,t.value),box=$('pm-slotbox'),warn=$('pm-slotwarn'),submit=$('pm-submit');if(box)box.innerHTML=slotPalette(p).map(s=>`<span class="pm-slot ${used.includes(s)?'used':''}" onclick="pmInsertSlot('${s}')">${esc(s)}</span>`).join('');if(warn)warn.innerHTML=bad.length?`<div class="pm-bad">正文里有 ${bad.length} 个没声明的变量槽：${bad.map(esc).join(' ')}。请删除或让开发补充槽位。</div>`:'';if(submit)submit.disabled=!!bad.length}
function drawPrompt(){const d=S.pm,p=findPrompt(d.id);if(!p)return;const st=PMST[p.st],used=slotsUsed(d.body),bad=badSlots(p,d.body),tabs=['编辑','版本历史'];$('mod').innerHTML=`<div class="mbox pm-editor"><div class="pm-l"><div class="pm-h"><div style="flex:1;min-width:0"><div class="ey">${p.shared?'共享提示词':promptAgentName(p)}</div><h3>${esc(p.n)} · v${p.v}</h3></div><span class="st ${st.c}">${st.n}</span><button class="ib" onclick="closeMod()" title="关闭">×</button></div><div class="dw-tabs">${tabs.map((t,i)=>`<button class="${d.tab===i?'on':''}" onclick="S.pm.tab=${i};drawPrompt()">${t}</button>`).join('')}</div><div class="pm-b">${d.tab===1?pmHistory(p):`${p.st==='live'?`<div class="note" style="margin-bottom:var(--sp-3)">这一版正在生效。修改后会保存成 <b>v${p.v+1} 草稿</b>，当前版本保留不动。</div>`:''}<div class="fld"><label>提示词正文</label><textarea class="pm-body" id="pm-body" oninput="pmSyncSlots()">${esc(d.body)}</textarea></div><div style="font-size:var(--fs-xs);font-weight:600;color:var(--t2);margin-bottom:var(--sp-1)">变量槽 <span style="font-weight:400;color:var(--t3)">· 点击插入光标处</span></div><div class="pm-slots" id="pm-slotbox">${slotPalette(p).map(s=>`<span class="pm-slot ${used.includes(s)?'used':''}" onclick="pmInsertSlot('${s}')">${esc(s)}</span>`).join('')}</div><div id="pm-slotwarn">${bad.length?`<div class="pm-bad">正文里有未声明的变量槽：${bad.map(esc).join(' ')}</div>`:''}</div><div class="pm-two" style="margin-top:var(--sp-4)"><div class="fld" style="margin:0"><label>模型</label><select onchange="pmSet('model',this.value==='none'?null:this.value)"><option value="none" ${!d.model?'selected':''}>无直接模型（共享片段）</option>${MODELS.map(m=>`<option ${d.model===m?'selected':''}>${m}</option>`).join('')}</select></div><div class="fld" style="margin:0"><label>类型</label><select disabled><option>${PMTYPE[p.ty]}</option></select></div></div><div class="fld" style="margin-top:var(--sp-3)"><label>改动理由 <span class="ct">提交上线必填</span></label><textarea rows="2" placeholder="改了什么、为什么" oninput="pmSet('note',this.value)">${esc(d.note)}</textarea></div>`}</div><div class="pm-f">${d.tab===1?`<button class="btn ghost" onclick="S.pm.tab=0;drawPrompt()">回到编辑</button>`:`<button class="btn ghost" onclick="savePromptDraft()">存草稿</button><button class="btn ghost" onclick="promptToTest()">进入测试</button><button class="btn" id="pm-submit" onclick="submitPrompt()" ${bad.length?'disabled':''}>提交上线</button><span style="margin-left:auto;font-size:var(--fs-xs);color:var(--t3)">批准人 ${promptOwner(p)}</span>`}</div></div><div class="pm-r"><div class="pm-h" style="background:var(--surface-tint)"><div><div class="ey">试跑</div><h3 style="font-size:var(--fs-md)">用这一版跑一句看看</h3></div></div><div class="pm-b"><div style="font-size:var(--fs-xs);color:var(--t3);line-height:1.6;margin-bottom:var(--sp-3)">试跑使用沙箱数据，不会写进线程，也不会产生产出物。</div><div class="pm-chat" id="pm-chat">${d.chat.length?d.chat.map(m=>`<div class="pm-msg ${m.r}">${m.r==='ag'?`<span class="pmw">${esc(p.n)} · v${p.v}</span>`:''}${esc(m.t)}</div>`).join(''):'<div class="csa-empty" style="padding:var(--sp-5) 16px">还没跑过。下面写一句试试。</div>'}</div></div><div class="pm-f" style="flex-direction:column;align-items:stretch"><textarea id="pm-in" rows="2" placeholder="写一句输入试试…"></textarea><div style="display:flex;align-items:center;gap:8px"><span style="flex:1;font-size:var(--fs-xs);color:var(--t3)">沙箱 · 不产生产出物</span><button class="btn ghost sm" onclick="pmResetChat()">重置对话</button><button class="btn sm" onclick="pmRun()">跑一次</button></div></div></div></div>`}
const _drawPromptLayout=drawPrompt;
drawPrompt=function(){_drawPromptLayout();mountPromptChrome()};
function mountPromptChrome(){
 const editor=document.querySelector('.pm-editor'),rightHead=editor&&editor.querySelector('.pm-r>.pm-h');if(!editor||!rightHead)return;
 editor.classList.toggle('wide',!!S.pmWide);
 $('mod').classList.toggle('pm-wide-mode',!!S.pmWide);
 const formRow=editor.querySelector('.pm-l .pm-two');
 if(formRow){
  const fields=[...formRow.children],typeField=fields.find(field=>field.querySelector('select[disabled]')&&!field.querySelector('select[onchange]'));if(typeField)typeField.remove();
  let reason=formRow.querySelector('.pm-reason-field');
  if(!reason){const next=formRow.nextElementSibling;if(next&&next.classList.contains('fld')){reason=next;reason.classList.add('pm-reason-field');reason.style.marginTop='0';formRow.appendChild(reason)}}
  const reasonLabel=reason&&reason.querySelector('label');if(reasonLabel&&reasonLabel.firstChild)reasonLabel.firstChild.nodeValue='改动理由(备注) ';
 }
 applyPromptState(editor);
 let wide=$('pm-wide');
 if(!wide){wide=document.createElement('button');wide.id='pm-wide';wide.className='ib';wide.setAttribute('onclick','pmToggleWide()');rightHead.appendChild(wide)}
 wide.title=S.pmWide?'收缩':'加宽';wide.setAttribute('aria-label',wide.title);
 wide.innerHTML=S.pmWide?'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v5H3M16 3v5h5M8 21v-5H3M16 21v-5h5"/></svg>':'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/></svg>';
 const close=editor.querySelector('.pm-l>.pm-h>.ib');if(close)rightHead.appendChild(close);
}
function applyPromptState(editor){
 const p=findPrompt(S.pm.id),d=S.pm;if(!p)return;const editable=p.st==='test'&&d.tab===0,canRun=['test','live','pending','retired'].includes(p.st),body=editor.querySelector('.pm-l>.pm-b'),footer=editor.querySelector('.pm-l>.pm-f');
 editor.classList.toggle('pm-readonly',!editable);
 let dirty=$('pm-dirty');if(!dirty){dirty=document.createElement('span');dirty.id='pm-dirty';dirty.className='chip pm-dirty';dirty.textContent='未保存';const status=editor.querySelector('.pm-l>.pm-h .st');if(status)status.before(dirty)}pmDirtyState();
 if(d.tab===1)return;
 if(body){body.querySelectorAll('textarea,select').forEach(el=>el.disabled=!editable);if(!editable)body.querySelectorAll('.pm-slot').forEach(el=>el.removeAttribute('onclick'));
  let note=body.querySelector(':scope>.note');const copy=p.st==='live'?'使用中的提示词不可编辑，可在右侧进行测试。如需修改，请先创建测试版本。':p.st==='pending'?'该版本已提交上线，审批期间内容已锁定。撤回后可继续修改。':p.st==='retired'?'该版本已经下线，仅供查看。需要再次使用时，请创建测试版本。':'';
  if(copy){if(!note){note=document.createElement('div');note.className='note';note.style.marginBottom='var(--sp-3)';body.prepend(note)}note.textContent=copy}else if(note)note.remove();
 }
 if(footer){const owner=promptOwner(p),bad=badSlots(p,d.body);footer.innerHTML=p.st==='live'?`<button class="btn" onclick="createPromptTestVersion('${p.id}')">创建测试版本</button><span class="pm-foot-note">当前版本继续生效</span>`:p.st==='test'?`<button class="btn" onclick="savePromptDraft()">保存修改</button><button class="btn ghost" id="pm-submit" onclick="submitPrompt()" ${bad.length?'disabled':''}>提交上线</button><button class="btn ghost pm-delete" onclick="pmAskDeletePromptTestVersion()">删除版本</button><span class="pm-foot-note">批准人 ${owner}</span>`:p.st==='pending'?`<button class="btn ghost" onclick="withdrawPrompt()">撤回修改</button><span class="pm-foot-note">等待 ${owner} 审批</span>`:`<button class="btn" onclick="createPromptTestVersion('${p.id}')">创建测试版本</button><span class="pm-foot-note">当前版本只读</span>`}
 const runTitle=editor.querySelector('.pm-r>.pm-h h3'),runHint=editor.querySelector('.pm-r>.pm-b>div:first-child');
 if(runTitle)runTitle.textContent=p.st==='live'?'试跑当前使用版本':p.st==='pending'?'试跑待上线版本':p.st==='retired'?'试跑已下线版本':'用这一版跑一句看看';
 if(runHint)runHint.textContent=p.st==='live'?'仅用于验证当前线上提示词，不影响线上版本和正式产出。':p.st==='pending'?'仅用于上线前验证，不会修改内容或改变审批状态。':p.st==='retired'?'仅用于回看验证，不会重新上线或改变版本状态。':'试跑使用沙箱数据，不会写进线程，也不会产生产出物。';
 const input=editor.querySelector('#pm-in'),run=editor.querySelector('button[onclick="pmRun()"]');if(input){input.disabled=!canRun;input.placeholder=p.st==='live'?'输入一句话，验证当前使用版本…':p.st==='pending'?'输入一句话，验证待上线版本…':p.st==='retired'?'输入一句话，验证已下线版本…':p.st==='test'?'写一句输入试试…':'当前状态不可试跑'}if(run)run.disabled=!canRun;
}
function pmToggleWide(){S.pmWide=!S.pmWide;mountPromptChrome()}
const _closePromptModal=closeMod;
closeMod=function(){S.pmWide=false;const modal=$('mod');if(modal)modal.classList.remove('pm-wide-mode');_closePromptModal()};
function pmChatHtml(p,chat){return chat.map(m=>`<div class="pm-msg ${m.r}">${m.r==='ag'?`<span class="pmw">${esc(p.n)} · v${p.v}</span>`:''}${esc(m.t)}</div>`).join('')}
function pmResetChat(){
 const d=S.pm,chat=$('pm-chat'),input=$('pm-in');if(!d)return;d.chat=[];
 if(chat)chat.innerHTML='<div class="csa-empty" style="padding:var(--sp-5) 16px">还没跑过。下面写一句试试。</div>';
 if(input){input.value='';input.focus()}
}
function pmRun(){
 const d=S.pm,p=findPrompt(d.id),i=$('pm-in'),text=i&&i.value.trim();if(!text){toast('先写一句输入');return}
 if(!['test','live','pending','retired'].includes(p.st)){toast('当前状态不能试跑');return}
 d.chat.push({r:'me',t:text},{r:'ag',t:p.shared?'片段已注入；下游提示词会继续生成。':'已按当前提示词生成示例结果。变量槽与约束检查通过。'});
 if(p.st==='test')p.testRuns=(p.testRuns||0)+1;
 const chat=$('pm-chat');if(chat){chat.innerHTML=pmChatHtml(p,d.chat);chat.scrollTop=chat.scrollHeight}if(i){i.value='';i.focus()}
}
function pmHistory(p){return `<div style="font-size:var(--fs-sm);color:var(--t2);line-height:1.7;margin-bottom:var(--sp-3)">每一版都保留。需要时可以提交回滚到历史版本。</div>${(p.hist||[]).map(h=>`<div class="pm-ver"><span class="pmv">v${h.v}</span><span class="pl">${h.note&&h.note!=='—'?esc(h.note):'<span style="color:var(--danger-fg)">没写改动理由</span>'}</span><span style="font-size:var(--fs-xs);color:var(--t3)">${h.by} · ${h.at}</span>${h.v===p.v?'<span class="chip lv">当前</span>':`<button class="btn ghost sm" onclick="revertPrompt('${p.id}',${h.v})">回到这版</button>`}</div>`).join('')}`}
function pmAskDeletePromptTestVersion(){
 const p=findPrompt(S.pm&&S.pm.id);if(!p||p.st!=='test'){toast('只有测试中的版本可以删除');return}
 pmCloseDeleteDialog();const layer=document.createElement('div');layer.id='pm-delete-dialog';layer.className='pm-confirm-layer';layer.onclick=e=>{if(e.target===layer)pmCloseDeleteDialog()};
 layer.innerHTML=`<section class="pm-confirm-card" role="dialog" aria-modal="true" aria-labelledby="pm-delete-title"><div class="pm-confirm-head"><span class="pm-confirm-icon" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2m-9 0 1 15h8l1-15M10 11v6M14 11v6"/></svg></span><div><div class="ey">删除测试版本</div><h3 id="pm-delete-title">确认删除这个版本？</h3></div><button class="ib" onclick="pmCloseDeleteDialog()" aria-label="关闭">×</button></div><div class="pm-confirm-body"><strong>${esc(p.n)} · v${p.v}</strong><p>删除后无法恢复，但不会影响当前使用中的版本。</p></div><div class="pm-confirm-foot"><button class="btn ghost" onclick="pmCloseDeleteDialog()">取消</button><button class="btn pm-confirm-delete" onclick="deletePromptTestVersion()">删除版本</button></div></section>`;
 layer.addEventListener('keydown',e=>{if(e.key==='Escape')pmCloseDeleteDialog()});$('mod').appendChild(layer);layer.querySelector('.btn.ghost').focus();
}
function pmCloseDeleteDialog(){const layer=$('pm-delete-dialog');if(layer)layer.remove()}
function deletePromptTestVersion(){
 const p=findPrompt(S.pm&&S.pm.id);if(!p||p.st!=='test'){pmCloseDeleteDialog();toast('只有测试中的版本可以删除');return}
 const list=p.shared?PSHARED:PROMPTS,index=list.findIndex(x=>x.id===p.id);if(index<0)return;
 list.splice(index,1);closeMod();render();if(S.ag)drawAgent();toast('测试版本已删除')
}
function savePromptDraft(){const p=findPrompt(S.pm.id),d=S.pm;if(!p||p.st!=='test'){toast('当前版本只读，不能直接保存');return}p.body=d.body;p.model=d.model;p.note=d.note.trim();p.by='dudu';p.at='刚刚';d.originalBody=d.body;d.originalModel=d.model;d.originalNote=d.note;d.dirty=false;pmDirtyState();toast('修改已保存')}
function promptToTest(){const p=findPrompt(S.pm.id);p.body=S.pm.body;p.model=S.pm.model;if(p.st==='live'){toast('生效中的版本不能直接改成测试 · 已存为草稿');return}p.st='test';drawPrompt();render();if(S.ag)drawAgent();toast('已进入测试')}
function submitPrompt(){const p=findPrompt(S.pm.id),d=S.pm,bad=badSlots(p,d.body);if(!p||p.st!=='test'){toast('只有测试中的版本可以提交上线');return}if(bad.length){toast('还有没声明的变量槽');return}if(p.ty==='run'&&!d.model){toast('可运行提示词要先选模型');return}if(!d.note.trim()){toast('提交上线必须写改动理由');return}p.body=d.body;p.model=d.model;p.note=d.note.trim();p.st='pending';p.by='dudu';p.at='刚刚';(p.hist=p.hist||[]).unshift({v:p.v,by:'dudu',at:'刚刚',note:p.note});if(p.ag){S.pmPromptFilter=S.pmPromptFilter||{};S.pmPromptFilter[p.ag]='pending'}closeMod();render();if(S.ag)drawAgent();toast('已提交 · 等 '+promptOwner(p)+' 批准后生效')}
function withdrawPrompt(){const p=findPrompt(S.pm.id);if(!p||p.st!=='pending')return;p.st='test';if(p.ag){S.pmPromptFilter=S.pmPromptFilter||{};S.pmPromptFilter[p.ag]='test'}S.pm.originalBody=p.body;S.pm.originalModel=p.model;S.pm.originalNote=p.note&&p.note!=='—'?p.note:'';S.pm.dirty=false;drawPrompt();render();if(S.ag)drawAgent();toast('已撤回 · 可以继续修改')}
function revertPrompt(id,v){const p=findPrompt(id);toast('已提交回滚到 v'+v+' · 等 '+promptOwner(p)+' 批准');closeMod()}
function newPrompt(agid){const shared=!agid,p={id:'prompt-'+Date.now(),shared,ag:agid||undefined,n:shared?'新建共享提示词':'新建提示词',ty:shared?'frag':'run',v:1,st:'test',model:shared?null:'gpt-5.4',by:'dudu',at:'刚刚',note:'',use:shared?[]:undefined,slots:shared?[]:(SLOTS[agid]||[]),body:'',hist:[]};(shared?PSHARED:PROMPTS).unshift(p);if(agid){S.pmPromptFilter=S.pmPromptFilter||{};S.pmPromptFilter[agid]='test'}openPrompt(p.id)}
