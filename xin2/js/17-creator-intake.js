/* Douyin recommendation: confirm Agent → criteria → roster. Local demo only. */
const CREATOR_SEED=JSON.parse(JSON.stringify(T.find(t=>t.id==='t-douyin-creators').arts[0]));
const CREATOR_TYPES=['直播达人','视频达人','其他'];
const CREATOR_STATUSES=['待建联','已建联','商务洽谈','样品寄送','合同确认','已上播','已取消'];
const CREATOR_CATEGORIES=['美妆护肤','成分科普','生活方式','时尚穿搭','其他'];
const CREATOR_RANGES=[['fans','粉丝范围','万'],['total','结算总额（月销售额）','元'],['live','直播结算总额','元'],['video','视频结算总额','元'],['average','场均直播结算额','元'],['gpm','直播 GPM','元 / 千次观看']];
function prepareCreatorRecommendation(t){
 t.demoDouyinRecommendation=true;t.prestartDemo=true;t.ag='kol';t.agents=['kol'];
 t.st='todo';t.outputCount=0;t.arts=[];t.up='刚刚';t.new=0;
 t.creatorIntake={stage:'recommend',types:[],statuses:[],categories:[],ranges:{},text:{...Object.fromEntries(CREATOR_RANGES.map(([key])=>[key,''])),more:''},moreOpen:false,dropdown:null,prefilled:false};
 t.plan={v:1,status:'pending',startedAt:null,tx:'推荐由达人策略 Agent 执行。确认后填写达人筛选条件，再根据条件生成抖音达人名单。',expected:'符合已确认筛选条件的抖音达人名单',steps:[
  {l:'确认达人策略 Agent',m:'确认后才进入筛选表单',s:'ask',r:'待确认'},
  {l:'填写达人筛选条件',m:'达人类型、粉丝范围、销售额、建联状态与标签分类',s:'todo',r:'未开始'},
  {l:'生成抖音达人名单',m:'提交表单后执行',s:'todo',r:'未开始'}]};
 delete t.ask;delete t.answered;delete t.live;
 return t;
}
const creatorDefaultTask=T.find(t=>t.id==='t-douyin-creators');
prepareCreatorRecommendation(creatorDefaultTask);
creatorDefaultTask.t='抖音达人推荐';creatorDefaultTask.trig='manual';
creatorDefaultTask.cr={s:'h',w:'du'};creatorDefaultTask.cost='—';
creatorDefaultTask.intent={who:'du',tx:'请推荐适合品牌合作的抖音达人，先确认执行 Agent，再补充筛选要求。',at:'刚刚'};
delete creatorDefaultTask.standing;delete creatorDefaultTask.log;
function createCreatorRecommendation(intent){
 const meta=inferNewTaskMeta(intent),id='creator-'+Date.now();
 const t=prepareCreatorRecommendation({id,t:intent.split('\n')[0].slice(0,30),camp:meta.c,dom:'KOL',own:'du',cr:{s:'h',w:'du'},trig:'manual',day:0,lv:'M1',cost:'—',attachments:taSnapshot(),intent:{who:'du',tx:intent,at:'刚刚'},cmts:[]});
 T.unshift(t);S.newAgent=null;closeMod();go('thread',id);toast('已推荐达人策略 Agent，请先确认');
}
function creatorAgentNode(t){
 const pending=canAdjustPrestartPlan(t),a=AG[t.ag],p=t.plan,rejected=p.status==='rejected';
 const draft=S.prestartDraft?.tid===t.id?S.prestartDraft:null,rejecting=S.prestartReject?.tid===t.id;
 const state=rejected?'未通过':pending?'待确认':t.st==='done'?'已完成':t.creatorIntake.stage==='form'?'已确认 · 等待补充':t.creatorIntake.stage==='done'?'待审批':'已确认 · 执行中';
 return `<div class="node ${pending||rejected?'wait':t.creatorIntake.stage==='generating'?'act':'ok'}"><div class="nlab">计划 · PLAN</div><div class="bub prestart-plan">
  <div class="who agent-run-hit" role="button" tabindex="0" onclick="openTrace('${t.ag}','${t.id}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openTrace('${t.ag}','${t.id}')}" title="查看运行状态"><span class="avs" style="background:${a.c}">${a.s}</span><span class="nm">${esc(a.n)}</span><span class="chip mut">计划 v${p.v}</span><span class="tm">${state}</span></div>
  <div class="prestart-summary">${esc(p.tx)}</div>
  ${rejected?`<div class="prestart-rejected-note"><b>不通过原因：</b>${esc(p.feedback||'未填写')}</div>`:''}
  ${pending?(draft?`<div class="prestart-plan-editor"><textarea rows="2" aria-label="计划调整要求" oninput="setPrestartDraft(this.value)">${esc(draft.tx)}</textarea><div class="prestart-plan-editor-actions"><button class="btn sm" onclick="saveCreatorPlan('${t.id}')">改计划</button><button class="btn ghost sm" onclick="cancelPrestartPlan('${t.id}')">取消</button></div></div>`:rejecting?`<div class="prestart-plan-editor"><textarea rows="2" aria-label="不通过原因" placeholder="填写不通过原因" oninput="setPrestartReject(this.value)">${esc(S.prestartReject.tx)}</textarea><div class="prestart-plan-editor-actions"><button class="btn sm" onclick="confirmPrestartReject('${t.id}')">确定</button><button class="btn ghost sm" onclick="cancelPrestartReject('${t.id}')">取消</button></div></div>`:`<div class="prestart-plan-actions"><button class="btn ghost sm" onclick="openCreatorPlan('${t.id}')">调整计划 ↗</button><button class="btn sm" onclick="startPrestartPlan('${t.id}')">确认并开始</button><button class="prestart-reject-link" onclick="openPrestartReject('${t.id}')">不通过</button></div>`):t.restoredPending?`<div class="prestart-plan-actions"><button class="btn sm" onclick="reopenCreatorIntake('${t.id}')">重新确认筛选条件</button></div>`:''}
 </div></div>`;
}
function openCreatorPlan(id){const t=creatorTask(id);if(!canAdjustPrestartPlan(t))return;S.prestartReject=null;S.prestartDraft={tid:id,tx:t.plan.tx};render();}
function saveCreatorPlan(id){const t=creatorTask(id),draft=S.prestartDraft;if(!canAdjustPrestartPlan(t)||draft?.tid!==id)return;const text=draft.tx.trim();if(!text)return toast('请填写计划内容');t.plan.tx=text;t.plan.v=(t.plan.v||1)+1;t.up='刚刚';S.prestartDraft=null;render();toast('计划已调整，请确认后继续');}
function creatorTask(id){const t=T.find(x=>x.id===id);return t&&!t.deletedAt&&t.demoDouyinRecommendation?t:null;}
function confirmCreatorAgent(id){
 const t=creatorTask(id);if(!t||t.creatorIntake.stage!=='recommend')return;
 if(!canAdjustPrestartPlan(t)||S.prestartDraft?.tid===id||S.prestartReject?.tid===id)return;
 prefillCreatorIntake(t);
 t.creatorIntake.stage='form';t.plan.status='confirmed';t.plan.startedAt=new Date().toISOString();
 t.plan.steps[0].s='ok';t.plan.steps[0].r='已确认';t.plan.steps[1].s='ask';t.plan.steps[1].r='待填写';
 t.executionCancelled=false;t.restoredPending=false;t.st='ask';t.ask={creator:true,qs:[],tx:'请填写抖音达人筛选条件，提交后生成名单。'};renderNav();render();toast('Agent 已确认，请填写筛选条件');
 document.querySelector('.creator-intake input')?.focus();
}
function creatorChoice(t,key,title,values){
 const selected=t.creatorIntake[key],open=t.creatorIntake.dropdown===key;
 return `<div class="creator-field"><label id="creator-${key}-${t.id}">${title}<small>多选</small></label><details class="creator-select" ${open?'open':''} ontoggle="setCreatorDropdown('${t.id}','${key}',this.open)"><summary aria-labelledby="creator-${key}-${t.id}"><span>${esc(selected.length?selected.join('、'):'不限，请选择')}</span><i>⌄</i></summary><div class="creator-select-menu" role="group" aria-labelledby="creator-${key}-${t.id}">${values.map((v,i)=>`<label class="creator-select-option"><input type="checkbox" value="${esc(v)}" ${selected.includes(v)?'checked':''} onchange="toggleCreatorOption('${t.id}','${key}',${i},this.checked,this)"><span>${v}</span></label>`).join('')}</div></details></div>`;
}
function creatorRange(t,index){
 const [key,label,unit]=CREATOR_RANGES[index],placeholder=key==='fans'?'例如：10–30万、50万以上、不限':key==='gpm'?'例如：至少100元、100–300元、不限':'例如：10–50万元、至少10万元、不限';
 return `<div class="creator-field"><label for="creator-${key}-${t.id}">${label}${index>1?`<small>${unit}</small>`:''}</label><input id="creator-${key}-${t.id}" type="text" placeholder="${placeholder}" value="${esc(t.creatorIntake.text[key]||'')}" oninput="setCreatorText('${t.id}','${key}',this.value)"></div>`;
}
function creatorIntakeNode(t){
 const f=t.creatorIntake;if(f.stage==='recommend')return '';
 if(f.stage!=='form')return `<div class="node ok"><div class="nlab">筛选条件 · CRITERIA</div><div class="bub creator-summary">${creatorCriteriaSummary(f).map(s=>`<div>${esc(s)}</div>`).join('')}<small>本地演示：使用预置达人与模拟销售指标，不代表平台实时数据。</small>${f.stage==='done'?`<div><button class="btn ghost sm" onclick="reopenCreatorIntake('${t.id}')">调整条件</button></div>`:''}</div></div>`;
 return `<div class="node wait"><div class="nlab">你的补充 · ANSWERED</div><form class="bub creator-intake" onsubmit="event.preventDefault();submitCreatorIntake('${t.id}')">
  <div class="creator-form-title"><h3>你想找什么样的达人？</h3><p>${f.prefilled?'已根据任务描述预填可识别的条件，请确认或修改。':'直接填写你的要求，未填写的条件不限。'}</p></div>
  ${creatorChoice(t,'types','达人类型',CREATOR_TYPES)}
  <div class="creator-range-grid">${creatorRange(t,0)+creatorRange(t,1)}</div>
  <div class="creator-range-grid">${creatorChoice(t,'statuses','建联状态',CREATOR_STATUSES)+creatorChoice(t,'categories','标签分类',CREATOR_CATEGORIES)}</div>
  <details class="creator-more" ${f.moreOpen?'open':''} ontoggle="setCreatorMoreOpen('${t.id}',this.open)"><summary>更多要求 <small>选填</small></summary><div class="creator-range-grid">${[2,3,4,5].map(i=>creatorRange(t,i)).join('')}</div></details>
  ${f.text.more?`<p class="creator-retained-note">任务中的其他要求（待确认）：${esc(f.text.more)}</p>`:''}
  <p class="creator-form-error" id="creator-error-${t.id}" role="alert">${esc(f.error||'')}</p>
  <div class="creator-form-footer"><button type="submit" class="btn">提交并生成名单</button></div>
 </form></div>`;
}
function setCreatorChoice(id,key,index,checked){
 const t=creatorTask(id),values={types:CREATOR_TYPES,statuses:CREATOR_STATUSES,categories:CREATOR_CATEGORIES}[key];
 if(!t||t.creatorIntake.stage!=='form'||!values?.[index])return;
 const selected=new Set(t.creatorIntake[key]);checked?selected.add(values[index]):selected.delete(values[index]);t.creatorIntake[key]=[...selected];
}
function setCreatorText(id,key,value){
 const t=creatorTask(id);if(!t||t.creatorIntake.stage!=='form'||!CREATOR_RANGES.some(([k])=>k===key))return;
 t.creatorIntake.text[key]=value;
}
function setCreatorMoreOpen(id,open){const t=creatorTask(id);if(t&&t.creatorIntake.stage==='form')t.creatorIntake.moreOpen=open;}
function setCreatorDropdown(id,key,open){const t=creatorTask(id);if(!t||t.creatorIntake.stage!=='form')return;if(open)t.creatorIntake.dropdown=key;else if(t.creatorIntake.dropdown===key)t.creatorIntake.dropdown=null;}
function toggleCreatorOption(id,key,index,checked,input){
 const t=creatorTask(id),values={types:CREATOR_TYPES,statuses:CREATOR_STATUSES,categories:CREATOR_CATEGORIES}[key];if(!t||t.creatorIntake.stage!=='form'||!values?.[index])return;
 setCreatorChoice(id,key,index,typeof checked==='boolean'?checked:!t.creatorIntake[key].includes(values[index]));t.creatorIntake.dropdown=key;
 if(input){const summary=input.closest('.creator-select')?.querySelector('summary span');if(summary)summary.textContent=t.creatorIntake[key].join('、')||'不限，请选择';}
 else{render();document.querySelector(`.creator-select[open] label:nth-child(${index+1}) input`)?.focus();}
}
function reopenCreatorIntake(id){
 const t=creatorTask(id);if(!t||(!t.restoredPending&&t.creatorIntake.stage!=='done'))return;
 t.creatorIntake.stage='form';t.creatorIntake.run=(t.creatorIntake.run||0)+1;t.st='ask';t.executionCancelled=false;t.restoredPending=false;
 t.plan.status='confirmed';t.plan.steps[1].s='ask';t.plan.steps[2].s='todo';t.plan.steps[2].r='未开始';
 t.arts=[];t.outputCount=0;delete t.live;t.ask={creator:true,qs:[],tx:'请确认筛选条件后重新生成名单。'};renderNav();render();
}
function creatorCriteriaSummary(f){
 const summary=[['达人类型',f.types],['建联状态',f.statuses],['标签分类',f.categories]].map(([label,values])=>label+'：'+(values.length?values.join('、'):'不限'));
 summary.push('粉丝范围：'+(f.text.fans||'不限'),'结算总额（月销售额）：'+(f.text.total||'不限'));
 CREATOR_RANGES.slice(2).forEach(([key,label])=>{if(f.text[key])summary.push(label+'：'+f.text[key]);});
 if(f.text.more)summary.push('任务中的其他要求：'+f.text.more);
 if(f.unhandled?.length)summary.push('待确认（本地演示未自动筛选）：'+f.unhandled.join('；'));
 return summary;
}
// Rule-based demo recognition, not an LLM call. Preserve all unsupported wording.
function creatorNormalize(text){return String(text||'').normalize('NFKC').replace(/(\d),(?=\d{3}(?:\D|$))/g,'$1').replace(/[—–~～]/g,'-').trim();}
function parseCreatorTextRange(text,key){
 const raw=creatorNormalize(text).replace(/人民币|千次观看|元|粉丝|\/|\s/g,'').replace(/([亿万千kKwWmM])人/g,'$1');
 if(!raw||/^(不限|无要求|都可以)$/.test(raw))return {range:{}};
 if(key!=='fans'&&raw.includes('人'))return {error:'金额请使用元、千元或万元'};
 const number='(\\d+(?:\\.\\d+)?)(亿|万|千|[kKwWmM]|人)?';
 const scale=(n,u)=>Number(n)*({亿:1e8,万:1e4,千:1e3,k:1e3,w:1e4,m:1e6}[String(u||'').toLowerCase()]||1)/(key==='fans'?1e4:1);
 const pair=raw.match(new RegExp('^'+number+'(?:-|至|到)'+number+'(?:之间)?$'));
 if(pair){const min=scale(pair[1],pair[2]||pair[4]),max=scale(pair[3],pair[4]||pair[2]);if(!Number.isFinite(min)||!Number.isFinite(max))return {error:'数值过大，请重新填写'};return min<=max?{range:{min,max}}:{error:'范围前面的值不能高于后面的值'};}
 const one=raw.match(new RegExp('^(至少|不低于|最低|大于等于|>=|≥|超过|大于|>|不超过|不高于|最多|小于等于|<=|≤|低于|小于|<)?'+number+'(以上|起|以下|以内|左右)?$'));
 if(!one)return {error:'暂未识别这个范围，请写成“10–30万”“至少10万”或“不限”'};
 const lower=/^(至少|不低于|最低|大于等于|>=|≥|超过|大于|>)$/.test(one[1]||'')||/^(以上|起)$/.test(one[4]||'');
 const upper=/^(不超过|不高于|最多|小于等于|<=|≤|低于|小于|<)$/.test(one[1]||'')||/^(以下|以内)$/.test(one[4]||'');
 if(lower&&upper)return {error:'上下限表达冲突，请确认范围'};
 const value=scale(one[2],one[3]);
 if(!Number.isFinite(value))return {error:'数值过大，请重新填写'};
 if(lower)return {range:{min:value,...(/^(超过|大于|>)$/.test(one[1]||'')?{minExclusive:true}:{})}};
 if(upper)return {range:{max:value,...(/^(低于|小于|<)$/.test(one[1]||'')?{maxExclusive:true}:{})}};
 if(one[4]==='左右')return {error:'“左右”的范围不明确，请改成明确范围，例如“10–30万”'};
 return {range:{min:value,max:value}};
}
function parseCreatorMore(text){
 const fields={},unhandled=[];
 creatorNormalize(text).split(/[,，;；。\n]+/).map(s=>s.trim()).filter(Boolean).forEach(clause=>{
  const match=clause.match(/^(直播结算总额|视频结算总额|场均直播结算额|直播\s*GPM|GPM)\s*[:：]?\s*(.+)$/i);
  if(!match){if(!/^(不限|无要求)$/.test(clause))unhandled.push(clause);return;}
  const key=/GPM/i.test(match[1])?'gpm':match[1].startsWith('场均')?'average':match[1].startsWith('直播')?'live':'video';
  if(fields[key])unhandled.push(clause);else fields[key]=match[2];
 });return {fields,unhandled};
}
function prefillCreatorIntake(t){
 const f=t.creatorIntake,source=creatorNormalize(t.intent?.tx),leftovers=[];
 const positive=(s,v)=>s.split(/[,，;；。\n]/).some(clause=>clause.includes(v)&&!/(?:不要|不考虑|排除|不含|非直播|非视频)/.test(clause));
 f.types=CREATOR_TYPES.filter(v=>v!=='其他'&&positive(source,v));
 f.statuses=CREATOR_STATUSES.filter(v=>positive(source,v));
 f.categories=CREATOR_CATEGORIES.filter(v=>v!=='其他'&&positive(source,v));
 source.split(/[,，;；。\n]+/).map(s=>s.trim()).filter(Boolean).forEach(clause=>{
  const fans=clause.match(/(?:粉丝范围|粉丝数|粉丝量|粉丝)\s*[:：]?\s*(.+)/);
  const fansBefore=clause.match(/((?:(?:至少|不低于|不超过|最多)\s*)?\d+(?:\.\d+)?\s*(?:万|千|亿)?(?:\s*(?:-|至|到)\s*\d+(?:\.\d+)?\s*(?:万|千|亿)?)?(?:以上|以下|以内)?)\s*粉丝/);
  const total=clause.match(/(?:结算总额\s*[（(]月销售额[）)]|月销售额|结算总额)\s*[:：]?\s*(.+)/);
  let consumed=false;
  if(fans||fansBefore){const value=(fansBefore?.[1]||fans[1]).split(/的|且|并且/)[0].trim();if(!parseCreatorTextRange(value,'fans').error){f.text.fans=value;consumed=true;}}
  if(total&&!/直播结算|视频结算|场均/.test(clause)){const value=total[1].trim();if(!parseCreatorTextRange(value,'total').error){f.text.total=value;consumed=true;}}
  const advanced=clause.replace(/^更多要求\s*[:：]?\s*/,'');
  if(/^(直播结算总额|视频结算总额|场均直播结算额|直播\s*GPM|GPM)/i.test(advanced)){leftovers.push(advanced);return;}
  if(consumed&&!/偏好|不要|必须|希望|排除/.test(clause))return;
  const structured=[...f.types,...f.statuses,...f.categories].some(v=>clause.includes(v));
  if(/偏好|不要|必须|希望|排除/.test(clause)||(!consumed&&!structured&&!/^(请推荐适合品牌合作的抖音达人|先确认执行\s*Agent|再补充筛选要求)$/i.test(clause)))leftovers.push(clause);
 });
 const advanced=parseCreatorMore(leftovers.join('；'));Object.assign(f.text,advanced.fields);f.text.more=advanced.unhandled.join('；');
 f.prefilled=!!(f.types.length||f.statuses.length||f.categories.length||Object.values(f.text).some(Boolean));
}
function creatorDemoRows(){
 // Explicit demo metrics; never infer sales from cooperation quotes or engagement.
 const metrics=[[160000,60000,100000,15000,120],[420000,240000,180000,30000,185],[85000,15000,70000,5000,80],[230000,120000,110000,20000,150],[110000,30000,80000,10000,95],[780000,600000,180000,50000,260],[45000,5000,40000,2500,60],[320000,180000,140000,30000,170],[65000,10000,55000,5000,75],[25000,0,25000,0,0]];
 return JSON.parse(JSON.stringify(CREATOR_SEED.rows)).map((r,i)=>({...r,creatorTypes:i===9?['其他']:i%3===0?['直播达人','视频达人']:i%3===1?['直播达人']:['视频达人'],tagCategories:i===9?['生活方式','其他']:['美妆护肤',i%2?'成分科普':'生活方式'],demoMetrics:Object.fromEntries(['total','live','video','average','gpm'].map((k,j)=>[k,metrics[i][j]]))}));
}
function creatorMatches(r,f){
 if(f.types.length&&!f.types.some(x=>r.creatorTypes.includes(x)))return false;
 if(f.statuses.length&&!f.statuses.includes(rosterStatus(CREATOR_SEED,r)))return false;
 if(f.categories.length&&!f.categories.some(x=>r.tagCategories.includes(x)))return false;
 return CREATOR_RANGES.every(([key])=>{const range=f.ranges[key]||{},v=key==='fans'?parseFloat(r.f):r.demoMetrics[key];return (range.min==null||range.min===''||(range.minExclusive?v>Number(range.min):v>=Number(range.min)))&&(range.max==null||range.max===''||(range.maxExclusive?v<Number(range.max):v<=Number(range.max)));});
}
function submitCreatorIntake(id){
 const t=creatorTask(id);if(!t||t.creatorIntake.stage!=='form'||t.executionCancelled)return;
 const f=t.creatorIntake;
 const ranges={};
 for(const [key,label] of CREATOR_RANGES){const parsed=parseCreatorTextRange(f.text[key],key);
  if(parsed.error){f.error=label+'：'+parsed.error;if(CREATOR_RANGES.findIndex(([k])=>k===key)>1){f.moreOpen=true;render();} $('creator-error-'+id).textContent=f.error;return;}ranges[key]=parsed.range;}
 f.ranges=ranges;f.unhandled=f.text.more?[f.text.more]:[];
 f.error='';f.stage='generating';t.st='run';t.plan.status='running';t.plan.steps[1].s='ok';t.plan.steps[1].r='已提交';t.plan.steps[2].s='act';t.plan.steps[2].r='生成中';
 delete t.ask;t.live={t:'达人策略 Agent 正在筛选名单',el:'刚刚',sub:['正在按已提交的筛选条件匹配演示达人…'],p:55};renderNav();render();
 const run=f.run=(f.run||0)+1;setTimeout(()=>finishCreatorIntake(id,run),1000);
}
function finishCreatorIntake(id,run){
 const t=creatorTask(id);if(!t||t.executionCancelled||t.restoredPending||t.creatorIntake.stage!=='generating'||t.creatorIntake.run!==run)return;
 const rows=creatorDemoRows().filter(r=>creatorMatches(r,t.creatorIntake));
 const art=JSON.parse(JSON.stringify(CREATOR_SEED));art.id=id==='t-douyin-creators'?'a-douyin-creators':'a-'+id;art.rows=rows;art.ttl=`抖音达人推荐名单 · ${rows.length} 人`;art.ex=(rows.length?'根据已识别条件筛选的模拟名单，可打开查看并跟进达人。':'暂无符合已识别条件的演示达人，可调整筛选条件后重新生成。')+(t.creatorIntake.unhandled?.length?' 其他文字要求已保留，尚未自动参与筛选，待确认。':'');
 t.arts=[art];t.outputCount=1;t.st='review';t.up='刚刚';t.creatorIntake.stage='done';t.plan.status='completed';t.plan.steps[2].s='ok';t.plan.steps[2].r=rows.length+' 人';delete t.live;
 renderNav();render();toast(rows.length?`名单已生成 · ${rows.length} 位达人`:'没有符合条件的演示达人');
}
function closeCreatorDropdown(){
 const t=creatorTask(S.tid);if(!t||t.creatorIntake.stage!=='form'||!t.creatorIntake.dropdown)return;
 t.creatorIntake.dropdown=null;document.querySelectorAll('.creator-select[open]').forEach(el=>{el.open=false;});
}
document.addEventListener('click',event=>{if(!event.target.closest('.creator-select'))closeCreatorDropdown();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&event.target.closest('.creator-select')){event.target.closest('.creator-select').querySelector('summary')?.focus();closeCreatorDropdown();event.stopPropagation();}});
