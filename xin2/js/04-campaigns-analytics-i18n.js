/* ============ 活动 Campaigns ============ */
const CAMPS=[
 {id:'c1',n:'11.11 大促',sub:'内容 × KOL × 电商',d:'10/20 上线会场，主线是「低预算也能做出高信任感」。内容先建立信任，KOL 铺量扩散，电商承接转化。',
  from:'2026/08/01',to:'2026/11/15',
  brief:[['主题','2111 · 低预算，先把真实感做满'],['定位','有限预算下最值得被看见的修护'],
    ['口吻','生活化、细节证据优先，避免强种草话术'],['禁用词','沿用品牌禁用词规则 142 条 + 大促比价合规'],
    ['主推品','A8O 修护精华 30ml · 安瓶精华 15ml'],['关键日期','10/20 会场上线 · 11/1 蓄水 · 11/11 爆发']],
  phases:[{n:'筹备',f:'8/1',t:'9/30',cur:1},{n:'预热',f:'10/1',t:'10/31'},{n:'蓄水',f:'11/1',t:'11/7'},
    {n:'爆发',f:'11/8',t:'11/11'},{n:'返场',f:'11/12',t:'11/15'}],
  budget:{total:380000,used:74600,rows:[['付费广告',120000,0,'蓄水期投放待审批'],['KOL / KOC',80000,68800,'名单待批准'],
    ['内容制作',60000,5800,'视频渲染中'],['电商运营',40000,0,'详情页与上架进行中'],['机动预留',80000,0,'按竞价情况释放']]},
  deps:[
   {a:'t1',an:'方向二已批准',b:'t2',bn:'主推视频 30 秒版',ok:1,why:'视频以方向二为脚本依据'},
   {a:'t1',an:'方向二已批准',b:'t5',bn:'达人短名单 Brief',ok:1,why:'达人画像按方向二调性匹配'},
   {a:'t14',an:'安瓶精华上架',b:'t15',bn:'天猫会场广告投放',ok:0,why:'商品未上架前无法投放该 SKU 的广告',blk:'缺第三方检测报告（功效宣称）'},
   {a:'t3',an:'详情页 v4 上架',b:'t15',bn:'天猫会场广告投放',ok:0,why:'落地页需先定稿，否则投放跳转错版',blk:'图片 8/9，缺成分实验实拍'},
   {a:'t5',an:'达人名单批准',b:'t5',bn:'逐个发 Brief',ok:0,why:'名单未批准前不发 Brief',blk:'等你审批'}]},
 {id:'c2',n:'新品上市',sub:'内容',d:'安瓶精华、舒缓面霜、净澈洁面三个新品的上市内容与铺货。',
  from:'2026/08/10',to:'2026/09/30',
  brief:[['主题','新品上市 · 建立认知'],['定位','敏感肌可用的日常修护线'],['口吻','科普为主，克制'],['主推品','三个新品 SKU']],
  phases:[{n:'定调',f:'8/10',t:'8/25',cur:1},{n:'铺货',f:'8/26',t:'9/10'},{n:'扩散',f:'9/11',t:'9/30'}],
  budget:{total:90000,used:0,rows:[['内容制作',50000,0,'待定'],['电商运营',40000,0,'待定']]},
  deps:[{a:'t16',an:'新品内容需求确认',b:'t16',bn:'生成内容方向',ok:0,why:'信息不足无法生成',blk:'4 项信息待你补充'}]}
];

function campaignOutputLinks(c){
 return (c.syncedOutputs||[]).map(link=>{const [t,a]=findArt(link.aid);return {link,t,a};})
  .filter(({link,t,a})=>t?.id===link.tid&&a?.id==='a2-label-copy'&&a.mode==='plans'&&a.plans?.length);
}
function campaignSyncReady(a){return !!(a?.plans?.length&&a.plans.every(p=>p.s==='done'));}
function openCampaignSync(aid){
 const [t,a]=findArt(aid);if(a?.id!=='a2-label-copy'||a.mode!=='plans'||!a.plans?.length){toast('产出不存在或已移除');return;}
 const pending=a.plans.filter(p=>p.s!=='done').length;
 if(pending){toast('还有 '+pending+' 篇内容待审核，全部批准后才能同步到活动');return;}
 S.campSync={aid,tid:t.id,cid:null};
 drawCampaignSync();
}
function drawCampaignSync(){
 const d=S.campSync,[,a]=findArt(d?.aid);if(!d||!a)return;
 const ready=campaignSyncReady(a);
 $('mod').classList.remove('plan-mode','asset-mode');
 $('mod').innerHTML=`<form class="mbox camp-sync-modal" role="dialog" aria-modal="true" aria-labelledby="camp-sync-title" onsubmit="event.preventDefault();confirmCampaignSync()">
  <div class="mhd"><h3 id="camp-sync-title">同步到活动</h3><button type="button" class="ib" onclick="closeMod()" title="关闭" aria-label="关闭"><i data-lucide="x"></i></button></div>
  <div class="mbd"><fieldset class="camp-sync-options"><legend class="camp-sync-label">选择活动</legend>
    ${CAMPS.map(c=>{const linked=campaignOutputLinks(c).some(x=>x.a.id===a.id),phase=c.phases.find(p=>p.cur);
     return `<label class="camp-sync-option"><input type="radio" name="campaign-sync-target" value="${esc(c.id)}" onchange="selectCampaignSync(this.value)" ${d.cid===c.id?'checked':''} ${linked?'disabled':''}>
      <span class="camp-sync-option-main"><b>${esc(c.n)}</b><small>${esc(c.from)} – ${esc(c.to)}${phase?' · '+esc(phase.n)+'期':''}</small></span>
      ${linked?'<span class="st done">已同步</span>':''}</label>`;
    }).join('')||'<div class="camp-sync-label">暂无可选活动</div>'}
   </fieldset>
  </div><div class="mft"><button type="button" class="btn ghost" onclick="closeMod()">取消</button><button type="submit" class="btn" id="campaign-sync-confirm" ${d.cid&&ready?'':'disabled'} title="${ready?'确认同步':'全部产出批准后才能同步'}">确认同步</button></div>
 </form>`;
 $('mod').classList.add('on');
 if(window.lucide)lucide.createIcons({root:$('mod'),attrs:{width:16,height:16,'stroke-width':1.8}});
}
function selectCampaignSync(cid){
 const d=S.campSync,c=CAMPS.find(x=>x.id===cid);if(!d||!c||campaignOutputLinks(c).some(x=>x.a.id===d.aid))return;
 d.cid=cid;const [,a]=findArt(d.aid),confirm=$('campaign-sync-confirm');if(confirm)confirm.disabled=!campaignSyncReady(a);
}
function confirmCampaignSync(){
 const d=S.campSync;if(!d)return;
 const c=CAMPS.find(x=>x.id===d.cid),[t,a]=findArt(d.aid);
 if(!c){toast('请选择要同步的活动');return;}
 if(t?.id!==d.tid||a?.id!=='a2-label-copy'||a.mode!=='plans'||!a.plans?.length){toast('产出不存在或已移除');return;}
 if(!campaignSyncReady(a)){toast('全部产出批准后才能同步到活动');return;}
 if((c.syncedOutputs||[]).some(x=>x.aid===a.id)){toast('这组内容已同步到该活动');return;}
 // Link the output without moving its source task or changing approval state.
 (c.syncedOutputs=c.syncedOutputs||[]).unshift({aid:a.id,tid:t.id,at:new Date().toLocaleString('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false})});
 closeMod();render();toast('已同步到「'+c.n+'」');
}
function campaignSyncLinks(aid){
 const linked=CAMPS.filter(c=>campaignOutputLinks(c).some(x=>x.a.id===aid));
 return linked.length?`<span class="camp-sync-links"><span>已同步：</span>${linked.map(c=>`<button onclick="S.cid='${c.id}';S.cdom='全部';go('camp')">${esc(c.n)} ↗</button>`).join('')}</span>`:'';
}
function campaignOutputs(c){
 const groups=campaignOutputLinks(c);if(!groups.length)return '';
 return `<section class="camp-outputs"><div class="sech"><span class="t">同步产出</span><span class="n num">${groups.length} 组</span><span class="bar2"></span></div>
  ${groups.map(({link,t,a})=>`<div class="camp-output-group"><div class="camp-output-head"><b>社媒内容 · ${a.plans.length} 篇</b><span class="chip plat">小红书</span><span class="chip mut">v${a.v}</span><small>同步于 ${esc(link.at)}</small></div>
   <div class="camp-output-meta"><span>来源任务：</span><button class="camp-output-source" onclick="go('thread','${t.id}')">${esc(t.t)} ↗</button></div>
   <div class="camp-output-grid">${a.plans.map((p,i)=>`<button class="camp-output-card" onclick="openCampaignOutput('${c.id}','${a.id}',${i})" aria-label="查看${esc(p.t)}">
    ${p.img?`<img src="${esc(p.img)}" alt="" loading="lazy">`:''}
    <span class="camp-output-copy"><b>${esc(p.t)}</b><span class="camp-output-excerpt">${esc(p.e)}</span><span class="st ${p.s}">${p.s==='done'?'已批准':STN[p.s]||'待审批'}</span></span>
   </button>`).join('')}</div></div>`).join('')}
 </section>`;
}
function openCampaignOutput(cid,aid,index){
 const c=CAMPS.find(x=>x.id===cid),entry=c&&campaignOutputLinks(c).find(x=>x.a.id===aid);
 if(!entry||!Number.isInteger(index)||!entry.a.plans[index]){toast('产出不存在或已移除');return;}
 closeDw();S.tid=entry.t.id;openDw(aid,index);
}

/* ---- new campaign ---- */
const PHTPL={
 '大促':[{n:'筹备'},{n:'预热'},{n:'蓄水'},{n:'爆发'},{n:'返场'}],
 '新品上市':[{n:'定调'},{n:'铺货'},{n:'扩散'},{n:'复盘'}],
 '常规':[{n:'规划'},{n:'执行'},{n:'复盘'}]
};
function openNewCamp(){
 S.ctpl='大促';
 $('mod').innerHTML=`<div class="mbox">
  <div class="mhd"><div class="e">新建活动</div><h3>开一个跨领域的活动</h3></div>
  <div class="mbd">
   <div style="font-size:var(--fs-sm);color:var(--t2);margin-bottom:var(--sp-3)">
     活动是项目里的项目。开完之后，内容、KOL、电商的任务都可以挂到它下面，共用同一份 Brief。</div>
   <div class="fld"><label>活动名称</label><input id="cn" placeholder="例如：12.12 年终返场"></div>
   <div style="display:flex;gap:var(--sp-3)">
     <div class="fld" style="flex:1"><label>开始</label><input id="cf" placeholder="2026/09/01"></div>
     <div class="fld" style="flex:1"><label>结束</label><input id="ct" placeholder="2026/12/15"></div></div>
   <div class="fld"><label>阶段模板</label>
     <div class="seg" id="ctpl">${Object.keys(PHTPL).map(k=>`<button class="${k==='大促'?'on':''}" onclick="pickTpl('${k}')">${k}</button>`).join('')}</div>
     <div id="ctplp" style="font-size:var(--fs-xs);color:var(--t3);margin-top:var(--sp-2)">${PHTPL['大促'].map(p=>p.n).join(' → ')}</div></div>
   <div class="fld"><label>预算</label><input id="cbg" placeholder="380000"></div>
   <div class="fld"><label>共同基准 <span class="ct">所有 agent 跑之前都会先读这段</span></label>
     <textarea id="cd" rows="3" placeholder="主题、定位、口吻、禁用词、关键日期…"></textarea></div>
  </div>
  <div class="mft"><button class="btn" onclick="mkCamp()">建立活动</button>
    <button class="btn ghost" onclick="closeMod()">取消</button>
    <span style="margin-left:auto;font-size:var(--fs-xs);color:var(--t3)">建好后可以把已有任务挂进来</span></div></div>`;
 $('mod').classList.add('on');setTimeout(()=>$('cn').focus(),60);
}
function pickTpl(k){
 S.ctpl=k;
 [...$('ctpl').children].forEach(b=>b.classList.toggle('on',b.textContent===k));
 $('ctplp').textContent=PHTPL[k].map(p=>p.n).join(' → ');
}
function mkCamp(){
 const n=$('cn').value.trim();if(!n){toast('先给活动起个名');return;}
 const f=$('cf').value.trim()||'2026/09/01',t=$('ct').value.trim()||'2026/12/15';
 const bg=parseInt($('cbg').value.replace(/\D/g,''))||100000;
 const ph=PHTPL[S.ctpl||'大促'].map((p,i)=>({n:p.n,f:'—',t:'—',cur:i===0?1:0}));
 const id='c'+Date.now();
 CAMPS.unshift({id,n,sub:(S.ctpl||'大促')+' · 待挂任务',d:$('cd').value.trim()||'还没写共同基准。建议先补上——每个 agent 跑之前都会读它。',
  from:f,to:t,
  brief:$('cd').value.trim()?[['共同基准',$('cd').value.trim()]]:[['共同基准','待补充']],
  phases:ph,
  budget:{total:bg,used:0,rows:[['付费广告',Math.round(bg*.4),0,'待规划'],['内容制作',Math.round(bg*.3),0,'待规划'],
    ['KOL / KOC',Math.round(bg*.2),0,'待规划'],['机动预留',Math.round(bg*.1),0,'按需释放']]},
  deps:[]});
 closeMod();S.cid=id;S.cdom='全部';go('camp');toast('活动已建立 · 现在可以把任务挂进来');
}

function goCamp(n){const c=CAMPS.find(x=>x.n===n);S.cid=c?c.id:null;go('camp');}
function campaignBudgetText(c){return '¥'+Number(c?.budget?.total||0).toLocaleString('zh-CN');}
function setCampaignTab(tab){S.campTab=tab;render();}
function toggleCampaignPlanSection(i){S.campPlanOpen=S.campPlanOpen||{};S.campPlanOpen[i]=!campaignPlanSectionOpen(i);render();}
function campaignPlanSectionOpen(i){return S.campPlanOpen&&i in S.campPlanOpen?!!S.campPlanOpen[i]:i===0;}
function setAllCampaignPlanSections(open){S.campPlanOpen=open?Object.fromEntries(Array.from({length:7},(_,i)=>[i,true])):{};render();}
function campPlanField(k,v){return `<div class="camp-plan-field"><span>${esc(k)}</span><b>${esc(v)}</b></div>`;}
function campPlanTable(head,rows){return `<div class="camp-plan-table"><table><thead><tr>${head.map(x=>`<th>${esc(x)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(x=>`<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;}
function campaignPlanDoc(){
 const sections=[
  {n:'活动概述',d:'周期、预算、人群、平台与活动目标。',body:
   `<div class="camp-plan-fields">${[
    ['活动名称','内容 Brief 提炼标题'],['活动周期','2026-08-04 - 2026-08-31'],['预算','¥30000'],['内容总数','小红书 3 篇'],
    ['目标人群','高频通勤、加班、熬夜、运动恢复需求的都市成年人'],['覆盖平台','小红书']
   ].map(x=>campPlanField(x[0],x[1])).join('')}</div>
   <p>本次活动围绕“每天一勺，不是养生仪式，是成年人保状态的底层动作”展开，在小红书以生活方式型种草建立产品心智。传播重点是把产品从“偶尔想起的补充品”转化为“再忙也能执行的固定动作”。</p>`},
  {n:'创意方向',d:'方案主题和核心创意。',body:
   `<div class="camp-plan-fields">${[
    ['创意主题','每天一勺，状态在线'],['核心创意','用“保状态”替代“养生感”，把产品放进通勤前、加班中、熬夜后、训练后这些真实节点。'],
    ['承接原因','已批准方向具备强生活化表达空间，能够直接嵌入用户已有作息与情绪波动场景。'],['适合沉淀原因','兼具传播性与转化性，可从单次种草延展为长期习惯方案。']
   ].map(x=>campPlanField(x[0],x[1])).join('')}</div>`},
  {n:'方案小结',d:'策略说明与结果导向。',body:
   `<p>整体策略采用“小内容量、强场景感、重习惯心智”的打法，由品牌官号完成三段式内容推进：先用疲惫节点打开情绪共鸣，再把产品嵌入高频场景，最后推进到稳定状态管理。</p>
   <div class="camp-plan-note"><b>原因说明</b>预算与篇数都较集中，若分散表达会削弱记忆点；围绕一个核心动作反复强化，更适合小红书生活方式内容沉淀。</div>`},
  {n:'战略地图',d:'传播重点、平台策略、渠道分配与内容矩阵。',body:
   `<div class="camp-plan-fields">${[
    ['传播目标','建立“每天一勺=保状态底层动作”的种草认知并带动转化'],['目标人群','都市高压成年人、作息不稳人群、轻运动恢复需求人群'],
    ['核心洞察','用户不缺健康道理，缺的是忙碌生活里能长期坚持的简单动作'],['平台角色','帮用户把自我照顾变得更省事的状态搭子']
   ].map(x=>campPlanField(x[0],x[1])).join('')}</div>
   ${campPlanTable(['账号','平台','预算占比','预算金额','目标'],[['品牌官号','小红书','100%','¥30000','种草转化']])}
   ${campPlanTable(['内容类型','占比','目的'],[['情绪共鸣帖','33%（1篇）','建立停留与代入'],['场景种草帖','33%（1篇）','强化可执行感'],['习惯转化帖','34%（1篇）','推动转化与长期认知']])}`},
  {n:'内容制作建议',d:'风格统筹、内容 Demo 与关键词云。',body:
   `<p>KV 建议采用“同一人不同状态节点”的连续画面结构：早高峰通勤、深夜加班、训练结束三个场景并列，中间用“一勺”动作串联。</p>
   ${campPlanTable(['标题','钩子','内容任务'],[['我把养生改成了一勺','每天一勺，不折腾也能稳住状态','共鸣'],['加班熬夜后我只做这一步','忙到没空养生时，更要留住这一步','场景'],['训练后恢复，我开始固定一勺','恢复快一点，第二天才接得上生活','转化']])}
   <div class="camp-plan-tags">${['每天一勺','状态在线','保状态','通勤族','加班人','恢复快','小红书','生活方式'].map(x=>`<span>${esc(x)}</span>`).join('')}</div>`},
  {n:'执行细则',d:'资源配置、指导 SOP 与行动清单。',body:
   `<div class="camp-plan-fields">${[
    ['执行说明','不含达人合作，执行重心放在品牌官号内容、投放加热与评论区承接。'],['达人分配方案','全部资源回收至品牌官号内容生产、平台加热与社区运营。'],
    ['资源主渠道','小红书'],['分配原因','预算与篇数较少，集中资源更能保证单篇质量与评论承接效率。']
   ].map(x=>campPlanField(x[0],x[1])).join('')}</div>
   ${campPlanTable(['类别','预算','说明'],[['平台触达与投放','约 ¥12000','信息流加热、搜索词覆盖、笔记加热测试'],['内容制作与日常运营','约 ¥13500','选题策划、文案、拍摄、修图、封面设计、发布排期'],['社交互动与社区运营','约 ¥4500','评论维护、私信答疑、收藏引导、舆情监控']])}`},
  {n:'执行清单',d:'落地任务清单。',body:
   `${campPlanTable(['阶段','任务','负责人','优先级','截止'],[
    ['筹备期','传播主线确认','策划','高','2026-08-04'],['筹备期','内容排期制定','运营','高','2026-08-05'],['筹备期','封面标题定稿','文案/设计','高','2026-08-06'],
    ['蓄水期','发布共鸣帖','运营','高','2026-08-08'],['引爆期','发布场景帖','运营','高','2026-08-16'],['收割期','发布转化帖','运营','高','2026-08-23'],['复盘期','数据复盘','策划/运营','高','2026-08-30']
   ])}
   <div class="camp-plan-note"><b>执行提醒</b>P0 事项优先完成：传播主线、排期、首篇上线、第三篇转化帖、项目复盘。</div>`}
 ];
 return `<section class="campaign-plan">
 <div class="campaign-plan-hero"><div class="campaign-plan-meta">
   ${campPlanField('活动','内容 Brief 提炼标题')}${campPlanField('渠道','小红书')}${campPlanField('已批准','2026/08/04 14:56')}${campPlanField('预算','¥ 30000')}
  </div></div>
  <div class="campaign-plan-accordion">${sections.map((s,i)=>{const open=campaignPlanSectionOpen(i);return `<article class="campaign-plan-section ${open?'open':''}">
   <button class="campaign-plan-title" onclick="toggleCampaignPlanSection(${i})" aria-expanded="${open}">
    <span class="campaign-plan-index">${String(i+1).padStart(2,'0')}</span><span class="campaign-plan-copy"><b>${esc(s.n)}</b><small>${esc(s.d)}</small></span><span class="campaign-plan-arrow"><i data-lucide="chevron-down" aria-hidden="true"></i></span>
   </button>
   ${open?`<div class="campaign-plan-body">${s.body}</div>`:''}
  </article>`;}).join('')}</div>
 </section>`;
}
function vCamp(){
 if(!S.cid)return campList();
 const c=CAMPS.find(x=>x.id===S.cid);if(!c)return campList();
 const th=T.filter(t=>t.camp===c.n);
 const Q=queue().filter(q=>q.t.camp===c.n);
 const doms=[...new Set(th.map(t=>t.dom))];
 const cd=S.cdom&&doms.includes(S.cdom)?S.cdom:'全部';
 const ft=cd==='全部'?th:th.filter(t=>t.dom===cd);
 const fdoms=cd==='全部'?doms:[cd];
 const pct=Math.round(c.budget.used/c.budget.total*100);
 return `<div class="wrap">
  <div class="page-back-row campaign-back-row"><button class="rvb page-back" onclick="event.stopPropagation();if(S.hist&&S.hist.length)goBack();else{S.cid=null;render()}">← 返回上一页</button></div>
  <div class="crumb"><button onclick="S.cid=null;render()">活动</button> › <span>${c.n}</span></div>
  <div class="camp-hd">
    <div style="flex:1;min-width:0">
      <h1>${c.n}</h1>
      <div class="sub">${esc(c.d)}</div>
      <div class="th-meta" style="margin-top:var(--sp-3)">
        <span class="chip camp">${c.from.slice(5)} – ${c.to.slice(5)}</span>
        <span class="chip mut">${th.length} 条任务</span>
        <span class="chip mut">${doms.length} 个领域</span>
      </div>
    </div>
  </div>

  <div class="campaign-progress-main">
   <div>
    <div class="sech" style="margin-top:var(--sp-5)"><span class="t">任务</span><span class="n num">${ft.length}</span><span class="bar2"></span>
      <span class="hint">活动会跨过你的默认范围</span></div>
    <div class="bar" style="margin:0 0 13px">
      <div class="seg">${['全部'].concat(doms).map(d=>`<button class="${(S.cdom||'全部')===d?'on':''}" onclick="S.cdom='${d}';render()">${d}${d==='全部'?'':' '+th.filter(t=>t.dom===d).length}</button>`).join('')}</div>
      <div class="spacer"></div>
      <div class="seg"><button class="${S.cview==='group'?'on':''}" onclick="S.cview='group';render()">分组</button>
        <button class="${(S.cview||'kanban')==='kanban'?'on':''}" onclick="S.cview='kanban';render()">看板</button></div>
    </div>
    ${!th.length?`<div class="allclear" style="margin-bottom:var(--sp-3)">还没有任务挂到这个活动上。<br>
      <span style="font-size:var(--fs-sm)">新建任务或用配方开始时，在「活动」里选它就行。</span><br>
      <button class="btn" style="margin-top:var(--sp-3)" onclick="openNew()">＋ 新建任务</button></div>`
    :(S.cview||'kanban')==='kanban'?`<div class="kb">${COLS.map(col=>{
      const it=ft.filter(t=>t.st===col.k||(col.k==='review'&&t.st==='ask'));
      return `<div class="kcol"><div class="kh"><span class="dot" style="background:${col.c}"></span>
        <span class="t">${col.n}</span><span class="n num">${it.length}</span></div>
        ${it.map(kcard).join('')||'<div style="padding:var(--sp-3) 4px;font-size:var(--fs-sm);color:var(--t3)">空</div>'}</div>`;}).join('')}</div>`
    :fdoms.map(d=>{const dt=ft.filter(t=>t.dom===d);if(!dt.length)return '';return `
      <div class="domgrp"><div class="domh"><span class="chip dom">${d}</span>
        <span class="num" style="font-size:var(--fs-xs);color:var(--t3)">${dt.length} 条</span>
        <span style="margin-left:auto;display:flex;gap:var(--sp-1)">${['review','run','todo','done'].map(k=>{
          const n=dt.filter(t=>t.st===k||(k==='review'&&t.st==='ask')).length;
          return n?`<span class="st ${k}">${STN[k]} ${n}</span>`:'';}).join('')}</span></div>
      ${dt.map(t=>`<button class="row src${(t.cr||{s:'h'}).s} ${t.new?'hasnew':''}" onclick="go('thread','${t.id}')">
        <span class="st ${t.st}">${STN[t.st]}</span>
        <span class="tt">${t.new?'<span class="nd"></span>':''}${t.pin?'<span class="pinb">置顶</span>':''}${esc(t.t)}</span>
        <span class="mt">${t.new?`<span class="nchip">${t.new} 条新</span>`:''}</span>
        <span class="byline">${crInfo(t).av} <b>${crInfo(t).nm}</b></span>
        <span class="avs" style="background:${U[t.own].c}">${U[t.own].s}</span>
        <span class="up">${t.up}</span></button>`).join('')}</div>`;}).join('')}

    <div class="card campaign-brief-card">
      <button class="fold" onclick="S.cb=!S.cb;render()" style="border:0;padding:0;background:none">
        <span style="flex:1;text-align:left;font-family:'Sora';font-size:var(--fs-sm);font-weight:600">共同基准 Brief</span>
        <span style="color:var(--t3);font-size:var(--fs-sm)">${S.cb?'收起 ▴':'展开 ▾'}</span></button>
      ${S.cb?`<div style="margin-top:var(--sp-3)">${c.brief.map(b=>`<div class="ctxr" style="padding:var(--sp-2) 0">
        <span class="k" style="flex:0 0 68px">${b[0]}</span><span class="v" style="text-align:right;font-weight:400;color:var(--t2);font-size:var(--fs-sm)">${esc(b[1])}</span></div>`).join('')}
        <div style="font-size:var(--fs-xs);color:var(--t3);margin-top:var(--sp-2);line-height:1.5">每个 agent 在这个活动里跑之前都会先读这份 Brief。</div></div>`
       :'<div style="font-size:var(--fs-xs);color:var(--t3);margin-top:var(--sp-1)">主题、定位、口吻、禁用词、关键日期</div>'}
    </div>
   </div>
  </div>
 </div>`;
}
function campList(){
 return `<div class="wrap">
  <div class="eyebrow">上下文 · 活动</div><h1>活动</h1>
  <div class="sub">活动是项目里的项目：把跨领域的任务放在同一个基准下。审批仍然在「今日」，这里看的是整体走到哪了。</div>
  <div class="bar"><div class="seg"><button class="on">进行中</button><button onclick="toast('本原型没有已结束的活动')">已结束</button></div></div>
  ${CAMPS.map(c=>{const th=T.filter(t=>t.camp===c.n);
   return `<button class="campcard" onclick="S.cid='${c.id}';render()">
    <div style="display:flex;align-items:flex-start;gap:var(--sp-3)">
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:var(--sp-2);flex-wrap:wrap">
          <b style="font-family:'Sora';font-size:var(--fs-lg)">${c.n}</b></div>
        <div style="font-size:var(--fs-sm);color:var(--t2);margin-top:var(--sp-1)">预算 ${campaignBudgetText(c)} · ${esc(c.sub)}</div>
      </div>
      <span class="num" style="font-size:var(--fs-xs);color:var(--t3)">${c.from.slice(5)}–${c.to.slice(5)}</span></div>
    <div style="display:flex;gap:var(--sp-1);margin-top:var(--sp-3);flex-wrap:wrap">
      ${['review','run','todo','done'].map(k=>{const n=th.filter(t=>t.st===k||(k==='review'&&t.st==='ask')).length;
        return n?`<span class="st ${k}">${STN[k]} ${n}</span>`:'';}).join('')}
      <span class="chip mut">${th.length} 条任务</span>${campaignOutputLinks(c).length?`<span class="chip mut">${campaignOutputLinks(c).length} 组产出</span>`:''}</div>
   </button>`;}).join('')}
 </div>`;
}


/* ============ 数据分析 ============ */
const KPI=[
 {id:'gmv',k:'GMV（本月）',v:'¥1.84M',tr:'+6.2%',up:1,vs:'目标 ¥2.1M',pct:88,own:'口径：已支付订单，不含退款',brand:'距月度目标还差 ¥260k'},
 {id:'conversion',k:'转化率',v:'1.4%',tr:'-0.7pt',up:0,vs:'目标 2.1%',pct:67,own:'近 7 天 · 会话数 +12%',brand:'访客变多了，成交比例下降'},
 {id:'roas',k:'ROAS',v:'2.6',tr:'-0.6',up:0,vs:'30 天均值 3.2',pct:81,own:'蓄水期兜底线 2.5，已接近',brand:'广告效率低于近期水平'},
 {id:'stock_days',k:'可售天数',menu:'库存可售天数',v:'4.3 天',tr:'-2.1 天',up:0,vs:'健康区间 7–90 天',pct:61,own:'补货周期 12–15 天，已低于安全线',brand:'部分商品可能在大促前售罄'},
 {id:'cpc',k:'CPC',v:'¥1.86',tr:'-¥0.12',up:1,vs:'30 天均值 ¥1.98',pct:94,own:'近 7 天 · 广告平台',brand:'点击成本低于近期均值'},
 {id:'aov',k:'客单价',v:'¥389',tr:'+4.3%',up:1,vs:'目标 ¥360',pct:100,own:'已支付订单 · 不含退款',brand:'高于当前经营目标'},
 {id:'refund_rate',k:'退款率',v:'2.8%',tr:'+0.4pt',up:0,vs:'健康线 ≤2.5%',pct:78,own:'近 30 天 · 售后系统',brand:'退款率略高于健康线'},
 {id:'response_time',k:'客服响应时长',v:'2分18秒',tr:'-32秒',up:1,vs:'目标 ≤3分钟',pct:92,own:'近 7 天 · 客服系统',brand:'当前响应时长达标'}];
const BH={score:54,label:'Mixed',pre:64,risk:-10,d7:-6,d30:3,mentions:142,model:'v1.0',at:'今天 02:14',
 factors:[['F1','情感质量',35,64,-9,'按触达加权 · 贡献 22.4 分'],['F2','自然可见度',25,71,4,'对比自身 90 天基准 · 贡献 17.8 分'],
  ['F3','共鸣度',25,58,0,'对比护肤品类基准 · 贡献 14.5 分'],['F4','拥护质量',15,62,-3,'实质性 · 作者多样性 · 贡献 9.3 分']],
 marks:[['第 12 天','关键词集变更'],['第 19 天','基准切换为自身历史']],
 sent:[61,52,29],unscored:[14,9]};
const QA={
 '转化':{a:'近 7 天转化率 <b>1.4%</b>，对比目标 <b>2.1%</b>——但不是流量问题：会话数 <b>+12%</b>。<br><br>下滑集中在移动端商详页浏览后未加购。时间上与春季新品广告带来的较冷流量重合。',
  g:'转化率 1.4% · 近 7 天 · 数据时间 今天 07:00 · 店铺分析',
  c:'相关性，不是因果——广告流量这条链路是方向性判断，没有做归因实验。',
  act:'排查移动端商详页加购路径'},
 'ROAS':{a:'ROAS <b>2.6</b>，低于 30 天均值 3.2，但仍在蓄水期兜底线 2.5 之上。<br><br>拉低的主要是 3 个曝光充分（>5 万）但转化 0.42% 的创意——广告优化已就此提过一条提案。',
  g:'ROAS 2.6 · 近 7 天 · 数据时间 昨天 · 广告平台',
  c:'兜底线 2.5 是蓄水期设定，爆发期会切回 ROAS 优先。',
  act:'暂停 3 个低效创意'},
 '库存':{a:'可售天数 <b>4.3 天</b>，低于健康区间下限 7 天。补货周期 12–15 天，也就是说现在下单也接不上。<br><br>店铺巡检今天 05:14 已就修护精华建过单。',
  g:'可售天数 4.3 · 今天 05:14 · 库存系统',
  c:'按当前动销速度外推。蓄水期动销会加速，实际可能更短。',
  act:'拉通供应链确认在途库存'},
 '健康':{a:'品牌社交健康分 <b>54</b>（Mixed），修正前 64。风险修正 −10 来自服务跟进的负面聚集，占本周自然触达 34%。<br><br>四个因子里 F1 情感质量掉得最多（−9）。',
  g:'健康分 54 · 模型 v1.0 · 今天 02:14 · 142 条自然提及',
  c:'风险修正在加权和之外单独扣，不是因子分下降。',
  act:'跟进服务问题'}};
const SESS=[
 {id:'s1',t:'蓄水期预算怎么分',at:'昨天 16:20',qa:[
   {q:'蓄水期预算按什么分比较稳？',a:'历史上老客召回的收藏加购成本最低（¥5.8），相似人群拓展量最大但成本高 40%。建议老客召回不低于 25%。',
    g:'近 90 天 4 个计划 · 数据时间 昨天 · 广告平台',c:'样本只有 4 个计划，结论偏向性强。',act:null}]},
 {id:'s2',t:'为什么 F3 一直不动',at:'8月13日',qa:[
   {q:'品牌健康分的 F3 为什么一直是 58？',a:'F3 共鸣度对比的是护肤品类基准，不是自身历史。我们的互动率一直贴着品类中位数，所以分数稳定在 58 上下——它没坏，只是没有相对优势。',
    g:'F3 58 · 模型 v1.0 · 护肤品类基准',c:'品类基准每季度更新一次，中间不变。',act:null}]}];
function curSess(){
 if(!S.qsess)S.qsess=SESS.map(x=>({...x,qa:x.qa.slice()}));
 if(!S.qcur)S.qcur='live';
 if(S.qcur==='live'){S.qlive=S.qlive||[];return {id:'live',t:'当前对话',qa:S.qlive};}
 return S.qsess.find(x=>x.id===S.qcur)||{id:'live',t:'当前对话',qa:S.qlive||[]};
}
function newSess(){
 if((S.qlive||[]).length){
  S.qsess.unshift({id:'s'+Date.now(),t:S.qlive[0].q.slice(0,14),at:'刚刚',qa:S.qlive.slice()});}
 S.qlive=[];S.qcur='live';S.qhist=0;render();toast('已开新对话 · 上一段存进历史');
}
function openSess(id){S.qcur=id;S.qhist=0;render();}
function askAnalyst(q){
 const key=Object.keys(QA).find(k=>q.includes(k));
 const session=curSess();
 session.qa.push({q,...(QA[key]||{a:'这个我需要先从数据接口取准确数字再说。<b>这里每个数都是取回来的，不是估出来的</b>——取不到我会直说，不会编。',
   g:'来源 你的数据接口 · 数据时间 今天 07:00',c:null,act:null})});
 render();
}
function sendQ(){const i=$('qi');if(!i||!i.value.trim())return;const v=i.value.trim();i.value='';askAnalyst(v);}
function sendMetricGuide(){
 const i=$('mi');if(!i||!i.value.trim())return;
 S.metricGuideCustom=i.value.trim();S.metricGuideAnswer=null;render();
}
function qaAct(i){
 const x=curSess().qa[i];
 const answer=x.a.replace(/<br\s*\/?>/gi,'\n').replace(/<[^>]*>/g,'').replace(/\n{3,}/g,'\n\n').trim();
 const intent=[answer,x.g].filter(Boolean).join('\n\n');
 openNew(null,intent);
}


/* ============ i18n ============ */
const DICT={"今日": "Today", "工作": "Work", "提案": "Proposals", "活动": "Campaigns", "数据分析": "Analytics", "知识库": "Knowledge", "设置": "Settings", "内容运营 · 默认范围 内容": "Content ops · default scope Content", "个 Agent 在跑": "agents running", "在线": "online", "帮我… 或搜索": "Ask me… or search", "审批": "Approvals", "项目": "Project", "内容": "Content", "电商": "E-commerce", "用户运营": "Customer Ops", "平台": "Platform", "日常": "Ad hoc", "全部": "All", "上下文": "Context", "做": "Do", "库": "Library", "待开始": "Not started", "进行中": "Running", "待审批": "Needs approval", "已交付": "Delivered", "待补充信息": "Needs input", "已批准": "Approved", "待审核": "Pending", "已归档": "Archived", "已拒绝": "Rejected", "已确认": "Confirmed", "候选": "Shortlisted", "已发 Brief": "Brief sent", "可提交": "Ready", "待补资质": "Missing docs", "正常": "Healthy", "等审批": "At gate", "待触发": "Idle", "已停用": "Disabled", "已上线": "Live", "开发中": "In dev", "规划中": "Planned", "空的": "Empty", "已过期": "Stale", "已审阅": "Reviewed", "待审阅": "Unreviewed", "未审阅": "Not reviewed", "新建议": "New", "评估中": "Assessing", "已采纳": "Accepted", "已忽略": "Dismissed", "待决定": "To decide", "高": "High", "中": "Medium", "低": "Low", "低风险": "Low risk", "中风险": "Med risk", "高风险": "High risk", "未使用": "Unused", "已使用": "Used", "已提案": "Proposed", "不可用": "Blocked", "批准": "Approve", "退回": "Return", "忽略": "Dismiss", "稍后": "Snooze", "采纳": "Accept", "撤销": "Undo", "编辑": "Edit", "删除": "Delete", "保存": "Save", "取消": "Cancel", "发送": "Send", "留言": "Comment", "回复": "Reply", "打开": "Open", "详情": "Details", "看依据": "Evidence", "建单": "Create task", "建单去做": "Create a task", "立即运行": "Run now", "立即跑一次": "Run once now", "暂停": "Pause", "全部恢复": "Resume all", "全局暂停": "Pause all", "重新启用": "Re-enable", "催": "Nudge", "催一下": "Nudge", "新建任务": "New task", "新建活动": "New campaign", "新建例行": "New routine", "新建配方": "New recipe", "加排期": "Add schedule", "变成例行": "Make recurring", "展开为任务": "Expand into a task", "存进知识库": "Save to Knowledge", "存为模板": "Save as template", "改一下再采纳": "Edit then accept", "要求修改": "Request a change", "调整计划": "Adjust plan", "清除筛选": "Clear filters", "看板": "Board", "按日期": "By date", "分组": "Grouped", "列表": "List", "展开": "Expand", "收起": "Collapse", "放大": "Expand", "上传": "Upload", "导入": "Import", "新建": "New", "问": "Ask", "问一句": "Ask", "去处理": "Handle", "去回答": "Answer", "去看": "View", "看运行": "See run", "排期与历史": "Schedule & history", "逐条评论": "One by one", "评论": "Comments", "入选": "Select", "淘汰": "Drop", "发 Brief": "Send brief", "放回候选": "Back to shortlist", "提交上架": "Submit listing", "催资质": "Chase docs", "暂缓": "Hold", "全部提交": "Submit all", "批准名单": "Approve list", "选这个": "Pick this", "回到当前对话": "Back to current", "回到对话": "Back to chat", "新对话": "New chat", "历史": "History", "意图": "Intent", "计划": "Plan", "执行": "Run", "产出": "Artifact", "交付": "Delivery", "决定": "Decision", "需要你补充": "Needs your input", "你的补充": "Your answers", "线程评论": "Thread comments", "评论": "Comments", "主 Agent": "Lead agent", "累计成本": "Total cost", "更新": "Updated", "负责人": "Owner", "自主": "Autonomy", "计划 v": "Plan v", "版本": "Versions", "本次运行": "This run", "本次提问": "This question", "历史运行": "Run history", "更早问过的": "Earlier questions", "常驻线程": "standing thread", "置顶": "Pinned", "手动": "Manual", "定时触发": "Scheduled", "事件触发": "Event", "采纳提案": "From proposal", "触发方式": "Trigger", "已完成": "Done", "刚刚": "just now", "条新": "new", "小时前": "h ago", "分钟前": "m ago", "今天": "Today", "昨天": "Yesterday", "本周一": "Monday", "本周早些时候": "Earlier this week", "下次": "Next", "上次": "Last", "频率": "Frequency", "时间": "Time", "时区": "Timezone", "送达": "Deliver to", "链路": "Chain", "步": "steps", "次": "×", "轮": "turns", "条": "", "个": "", "天": "d", "需要你的地方": "What needs you", "你的指标": "Your metrics", "品牌健康度": "Brand health", "问分析师": "Ask the analyst", "来源": "Source", "Agent 读的东西": "what agents read", "Agent 写的东西": "what agents wrote", "品牌来源完整度": "Brand sources complete", "条已填": "filled", "已批准产出": "Approved outputs", "模板": "Templates", "素材": "Assets", "产品": "Products", "达人": "Creators", "热点": "Hotspots", "品牌": "Brand", "Agent 登记处": "Agent registry", "配方": "Recipes", "例行": "Routines", "Broker 控制台": "Broker console", "需要你审批": "Needs your approval", "正在跑": "Running now", "停住了": "Stuck", "昨夜完成": "Finished overnight", "条新提案等你看": "new proposals for you", "没有等你的决定了": "Nothing waiting on you.", "需要你处理": "Needs you", "需要注意": "Worth watching", "任务": "Tasks", "依赖关系": "Dependencies", "共同基准 Brief": "Shared brief", "预算": "Budget", "阶段": "Phase", "当前": "current", "已跑": "run", "次使用": "uses", "人工修改率": "Human-edit rate", "信号": "Signal", "基准": "Baseline", "采纳后执行": "On accept, runs", "预估": "Est.", "置信": "Confidence", "可逆": "Reversible", "部分可逆": "Partly reversible", "不可逆": "Irreversible", "剩": "left", "逾期": "Overdue", "等待": "Waiting", "被压下的": "Suppressed", "压制日志": "Suppression log", "发射器": "Emitters", "采纳率": "Accept rate", "运行记录": "Run record", "它怎么想的": "how it reasoned", "读取": "Read", "判断": "Reason", "工具": "Tool", "生成": "Write", "自主级别": "Autonomy", "产出与校验": "Outputs & checks", "最近运行": "Recent runs", "概览": "Overview", "配置": "Config", "30天运行": "30-day runs", "平均耗时": "Avg duration", "成功率": "Success", "编辑率": "Edit rate", "30天成本": "30-day cost", "运营视角": "Operator view", "品牌方视角": "Brand view", "分析即任务": "Analysis as tasks", "对话为主": "Chat-first", "最近的分析": "Recent analyses", "分析线程": "Analysis thread", "分析结论": "Analysis", "治理": "Governance", "谁在读": "Who reads it", "被读次数": "Times read", "在用的 agent": "Agents using it", "对 agent 可见": "Visible to agents", "审阅状态": "Review state", "最后更新": "Last updated", "更新人": "Updated by", "从未": "never", "从未填写": "Never filled", "匹配依据": "Match basis", "名单": "Roster", "打分权重": "Scoring weights", "适配": "Fit", "粉丝": "Followers", "报价": "Rate", "证据": "sources", "采集时间": "Collected", "使用状态": "Usage", "采集者": "Collected by", "没挂产品": "No product linked", "人工上传": "Uploaded", "Agent 生成": "Agent-made", "已批准产出晋升": "Promoted output", "被用": "used", "个 SKU": "SKUs", "齐了": "complete", "缺件": "incomplete", "齐": "ok", "缺": "missing", "来自": "from", "替代": "supersedes", "作为来源打开": "Open as source", "撤销晋升": "Un-promote", "从空白新建": "Start blank", "改得太多": "Edited too often", "个模板": "templates", "个来自真实产出": "from real artifacts", "什么时候用它": "When to use it", "模板名": "Template name", "产出类型": "Artifact type", "不可更改": "locked", "将被谁读": "Read by", "哪些地方每次都不一样": "What changes each time", "这些会变成槽位": "these become slots", "替代了哪个模板": "Supersedes which template", "槽位": "Slots", "缺口": "Gap", "接下来三次": "Next three runs", "异常处理": "Exception handling", "错过一次": "If missed", "补跑": "Catch up", "跳过": "Skip", "上次还没跑完": "If still running", "排队": "Queue", "失败重试": "Retries", "次后自动停用": "failures then auto-disable", "人工介入": "Human step", "跑完通知": "Notify when done", "到点等审批": "Stop for approval", "全自动": "Fully automatic", "审批门": "Approval gate", "会产生的变更": "Changes it will make", "可逆性": "Reversibility", "等待时长": "Waiting since", "批准并执行": "Approve and run", "拒绝": "Reject", "看会执行什么": "See what will run", "未建线程": "No task created", "没有需要人处理的东西": "nothing needed a human", "静默": "silent", "打开常驻线程": "Open standing thread", "看它跑出的任务": "See the tasks it created", "每一条都是一个任务线程：一个意图、一次对话、一个最终产出。范围默认是你的领域，活动会跨范围。": "Every row is a task thread: one intent, one conversation, one final output. Scope defaults to your domain; campaigns cut across.", "Agent 主动发现的建议。每一条都是一个可以直接跑的预编排方案——采纳就变成一条任务线程。": "Suggestions agents found on their own. Each is a pre-composed run — accepting it opens a task thread.", "Agent 主动发现、且已经编排好的决定。采纳即执行——它不会给你留一件待办。": "Decisions agents found and already composed. Accepting executes — it never leaves you a to-do.", "活动是项目里的项目：把跨领域的任务放在同一个基准下。审批仍然在「今日」，这里看的是整体走到哪了。": "A campaign is a project inside the project: cross-domain tasks on one shared brief. Approvals still live in Today; this is where you see overall progress.", "指标不是配出来的，是问出来的。每个数都标了口径、时间和来源——取不到就说取不到。": "Metrics aren't configured, they're asked for. Every number carries its definition, timestamp and source — and says so when it can't be fetched.", "Agent 读的（来源）和 Agent 写的（产出）分开放。": "What agents read (Sources) and what agents wrote (Outputs) are kept apart.", "已批准的产出会晋升成来源": "Approved outputs get promoted into Sources", "所以下次生成时，它站在的是被人确认过的东西上。": "So the next generation stands on something a human confirmed.", "这里是登记处，不是工作台。每个 agent 的自主级别、归属、成本和产出类型都在这里定——工作永远发生在「工作」里。": "This is the registry, not a workbench. Autonomy, ownership, cost and output types are set here — work always happens in Work.", "已上线 / 开发中 / 规划中 只出现在这一页。工作页上的状态只表示「要不要你处理」。": "Live / In dev / Planned appear only on this page. Statuses in Work only mean \"does this need you\".", "配方是": "A recipe is", "一串按顺序跑的 agent": "a chain of agents run in order", "，手动触发。跑顺了就给它挂个排期，它就变成例行。": ", triggered by hand. Once it runs well, give it a schedule and it becomes a routine.", "例行 = 配方 + 排期。每次触发都跑在同一条": "Routine = recipe + schedule. Every trigger runs inside the same", "里，不会每天新开一条。": "— it doesn't open a new one each day.", "没命中条件的那次不建线程，也不提醒——": "A run that matches nothing creates no task and sends no alert —", "静默是正常的": "silence is normal", "，不是失败。": ", not failure.", "Agent 不会凭空干活——它总是跑在某条线程里。": "An agent never works in a vacuum — it always runs inside a thread.", "你说要做什么，小排决定该谁上、什么顺序。你不用挑 agent——挑错了它也不会说。": "You say what you want; the Orchestrator decides who and in what order. You don't pick agents — if you picked wrong it wouldn't tell you.", "链路里有不可逆动作，已自动设为": "The chain contains an irreversible step, so it's set to", "，不能改成全自动。": "and can't be fully automatic.", "全自动只适合": "Fully automatic suits only", "低风险、可逆": "low-risk, reversible", "的活儿。涉及发布、费用、上架这类不可逆动作，请选「到点等审批」。": " work. For publishing, spend or listing — anything irreversible — choose Stop for approval.", "注意力是有预算的。够不上门槛的不会推给你——但你可以看它压下了什么。": "Attention has a budget. Anything below the bar isn't pushed to you — but you can see what it held back.", "必须选一个理由——它是": "You must pick a reason — it's the only thing", "唯一能学到东西的地方。忽略得越具体，它下次越不会白推。": "can learn from. The more specific the dismissal, the less it wastes your attention next time.", "这不会给你留待办。点确认，": "This leaves you no to-do. Confirm and", "立刻开始执行。": "starts immediately.", "不可逆动作。执行后无法自动撤回": "Irreversible. It cannot be rolled back automatically", "这是一条": "This is a", "——例行每次触发都跑在这里，不会每天新开一条。": "— every trigger runs here rather than opening a new thread daily.", "常驻分析线程": "standing analysis thread", "——所有数据问题都问在这一条里，不会每问一次开一条。": "— every data question lives in this one thread rather than opening one each time.", "问不是做。": "Asking isn't doing.", "结论要变成活儿，得另开一条：在产出上点「建单去做」。": "To turn a conclusion into work, open a separate task from the artifact.", "每个数都取自接口，不估算": "Every number is fetched, never estimated", "这里每个数都是取回来的，不是估出来的": "Every number here is retrieved, not estimated", "——取不到我会直说，不会编。": "— if I can't fetch it I'll say so rather than invent it.", "相关性，不是因果": "Correlation, not causation", "轻的问题不用建线程": "light questions don't need a task", "对话会存着，但": "Chats are kept, but", "结论不该只活在对话里": "conclusions shouldn't live only in a chat", "——有用的答案记得建单或存进知识库，不然过两周谁也找不到。": " — turn useful answers into tasks or save them to Knowledge, or nobody will find them in two weeks.", "还是空的，": "still empty,", "条超过 3 个月没更新。": "stale for over 3 months.", "Agent 会照样跑": "Agents will run anyway", "——它不知道自己缺东西，只有你知道。": " — they don't know what's missing. Only you do.", "过期的来源照样在给 agent 打底": "A stale source still grounds every agent", "，而且不会有人提醒。": ", and nothing will warn you.", "这是": "This is a", "被策展的可信来源": "curated source of truth", "。改动要过审之后 agent 才会读到——不然一次手滑就会悄悄影响所有产出。": ". Edits are reviewed before agents read them — otherwise one slip quietly changes every output.", "模板是从": "Templates come from", "已经成立的产出": "artifacts that actually worked", "里抽出来的，不是凭空写的。凭空写的模板没经过真实场景，用两次就得改。": ", not from a blank page. A template written cold hasn't met reality and needs rewriting after two uses.", "它从已经成立的产出里来": "It comes from artifacts that worked", "产品不只是一条记录，是": "A product isn't just a record — it's", "「对某个用途是否齐了」": "whether it's complete for a given use", "。同一个 SKU 可能电商能上、报关不行。": ". The same SKU can be listable but not clearable through customs.", "热点库是": "The hotspot pool is", "跨品牌采集、按适配度分发": "collected across brands and distributed by fit", "入库是自动的，不是审批门槛。人的操作是开启、暂停、修正和补充。": "Ingestion is automatic, not an approval gate. People enable, pause, correct and supplement.", "热点是素材，不是任务。要用它就开一条内容线程——热点本身不会自己变成活儿。": "A hotspot is material, not work. To use one, open a content thread — it won't become work by itself.", "品牌方视角是": "The brand view is an", "内部预览": "internal preview", "第一阶段品牌方不开放登录": "brand owners don't get logins in stage one", "我只做检测和汇报": "I only detect and report", "没有仪表盘要配，也没有图表要拖。": "No dashboards to configure, no charts to drag.", "这一页只放数字，只读。": "This page holds numbers only, read-only.", "平均": "avg", "成功": "success", "发起": "opened by", "秒": "s", "小时": "h", "分钟": "min", "分": "pts", "月": "mo", "件": "", "人": "", "第": "#", "批": "batch", "已": "", "通过": "pass", "未过": "fail", "贡献": "contributes", "依据": "Evidence", "被读": "read", "在用": "in use", "占": "of", "它还排除了": "It also ruled out", "种做法": "other options", "不做会怎样": "If you don't", "我看到了什么": "What I saw", "为什么值得打扰你": "Why it's worth your attention", "我排除了什么": "What I ruled out", "照做会怎样": "If you do", "为什么提这条": "why it raised this", "说": "says", "希望你做的": "What they want", "PM 逐条确认": "PM confirms each", "直接交给运营": "Straight to the operator", "自动执行 · 例外找人": "Auto, exceptions to a human", "例外找人": "exceptions to a human", "禁用词": "banned words", "字数": "length", "图片": "images", "战略规划数据": "Strategic planning", "竞争对手分析": "Competitor analysis", "品牌生态位分析": "Brand niche", "情感质量": "Sentiment quality", "自然可见度": "Earned visibility", "共鸣度": "Resonance", "拥护质量": "Advocacy quality", "风险修正": "Risk modifier", "修正前": "pre-modifier", "自然提及": "organic mentions", "采集但不计分": "collected, not scored", "自有内容": "owned content", "付费合作": "paid partner", "权重与口径": "Weights & definitions", "评分权重": "Scoring weights", "数据源": "Data sources", "品牌关键词": "Brand keywords", "采集边界": "Collection scope", "不采集": "Not collected", "回溯": "Backfill", "品类基准": "Category baseline", "关键词": "Keywords", "模型": "model", "口径": "Definition", "数据时间": "As of", "目标": "target", "健康区间": "healthy range", "均值": "avg", "在下面问一句就能改": "ask below to change", "已固定": "fixed", "内部口径": "Internal view", "对外口径": "Client-facing view", "含阈值与内部判断": "includes thresholds and internal calls", "给客户看的说法": "how we'd say it to the client", "品牌方还没有登录权限": "brand owners have no login yet", "完整度": "completeness", "过期": "stale", "空": "empty", "填": "filled", "被谁读": "read by", "申报名称": "Declaration name", "包装图": "Package image", "净重": "Net weight", "成分表": "Ingredients", "尺寸": "Size", "类目": "Category", "售价": "Price", "商品主图": "Main image", "报关": "Customs", "功效检测报告": "efficacy test report", "成分中英对照": "bilingual ingredient list", "筹备": "Prep", "预热": "Warm-up", "蓄水": "Build-up", "爆发": "Peak", "返场": "Encore", "定调": "Framing", "铺货": "Rollout", "扩散": "Amplify", "复盘": "Review", "规划": "Plan", "进行中的活动": "Active campaigns", "已结束": "Ended", "处卡住": "blocked", "跨范围显示": "shown across scopes", "按领域分组": "grouped by domain", "个领域": "domains", "只有活动这一层看得到": "only visible at the campaign layer", "卡住": "Blocked", "决定中位时长": "Median time to decide", "今日推送": "Pushed today", "归属覆盖": "Ownership coverage", "每人每天预算": "per person per day", "低于采纳率下限的会被自动降级": "below the accept-rate floor is auto-demoted", "校准偏差": "Calibration delta", "停用": "Disable", "观察": "Observe", "自动": "Auto", "已降级": "Demoted", "分数": "Score", "门槛": "Threshold", "归属": "Owner", "判断错了": "Wrong call", "时机不对": "Bad timing", "已经处理了": "Already handled", "不归我管": "Not my area", "基准看着不对": "Baseline looks wrong", "有用但现在不做": "Useful, not now", "补充说明": "Optional note", "可选": "optional", "先选一个理由": "Pick a reason first", "理由会回到反馈回路": "The reason feeds the loop", "预期影响": "Expected impact", "会执行什么": "What will run", "声称置信": "Claimed confidence", "排序分": "Rank score", "排期": "Schedule", "生效起": "Active since", "一次性": "One-off", "每天": "Daily", "每周": "Weekly", "每月": "Monthly", "手动跑": "manual", "有排期": "scheduled", "做什么": "What it does", "名称": "Name", "会作为意图写进线程": "becomes the thread's intent", "不同意就直接说": "Disagree? just say so", "重排": "Re-plan", "让小排排一下": "Let the Orchestrator plan it", "由": "by", "排的": "planned it", "改动": "changed", "下次触发起生效": "takes effect from the next trigger", "还没有": "No ", "不在本次原型范围内": "is out of scope for this prototype", "还没": "Not yet ", "看是哪": "See which", "看它怎么想的": "See how it reasoned", "查看日志": "View log", "实时": "live", "失败": "Failed", "数据源超时": "data source timeout", "被过滤掉的提案": "Filtered out", "这些没推给你 —— 以及为什么": "Not pushed to you — and why", "换一批": "Regenerate", "换一批方向": "a fresh set of directions", "自动剪辑尚未具备": "auto-editing not available", "成片需人工完成": "final cut is manual", "看 Brief": "View brief", "生成 Brief": "Generate brief", "对方已确认": "They confirmed", "标记已发布": "Mark published", "录入表现数据": "Log performance", "合作 Brief": "Collaboration brief", "开场要求": "Opening requirement", "必须做到": "Must include", "不能出现": "Must not include", "交付节点": "Delivery milestones", "已发布": "Published", "每人一份": "one per creator", "跟进": "Follow-up", "上次表现": "Last collaboration", "录入本次表现": "Log this collaboration", "标签": "Tags", "小红书": "Xiaohongshu", "抖音": "Douyin"};
DICT['聊天记录分析']='Chat History Analysis';
DICT['聊天记录分析页面将在下一步设计。']='The chat history analysis page will be designed next.';
DICT['全部店铺']='All stores';
const DKEYS=Object.keys(DICT).sort((a,b)=>b.length-a.length);

let LANG='zh';
function setLang(l){LANG=l;render();}
function trs(v){
 if(LANG!=='en'||!v)return v;
 const k=v.trim();
 if(DICT[k])return v.replace(k,DICT[k]);
 let out=v;
 for(const key of DKEYS){if(out.indexOf(key)>=0)out=out.split(key).join(DICT[key]);}
 return out;
}
function trDOM(root){
 if(LANG!=='en'||!root)return;
 const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null);
 const ns=[];let n;while((n=w.nextNode()))ns.push(n);
 ns.forEach(x=>{if(x.parentElement?.closest('[data-i18n-skip]'))return;const v=trs(x.nodeValue);if(v!==x.nodeValue)x.nodeValue=v;});
 root.querySelectorAll('[placeholder]').forEach(e=>{if(e.closest('[data-i18n-skip]'))return;const v=trs(e.getAttribute('placeholder'));if(v)e.setAttribute('placeholder',v);});
 root.querySelectorAll('[title]').forEach(e=>{if(e.closest('[data-i18n-skip]'))return;const v=trs(e.getAttribute('title'));if(v)e.setAttribute('title',v);});
}
function trAll(){['view','dw','mod','sb','top'].forEach(id=>{const e=$(id);if(e)trDOM(e);});}

/* ---- analyst dock ---- */
function dockMsgs(own){
 const c=curSess();
 if(!c.qa.length){
  const sug=['这周转化为什么掉了？','ROAS 还能救吗？','库存够撑到大促吗？','品牌健康分为什么是 54？'];
  return '<div style="font-size:var(--fs-sm);color:var(--t3);line-height:1.7;padding:var(--sp-1) 0 12px">问一句就行。每个数都取自接口，取不到我会直说。</div>'
   + sug.map(q=>'<button class="qsug" onclick="askAnalyst(\''+q+'\')">'+q+'</button>').join('');
 }
 return c.qa.map(function(x,i){
  let h='<div class="qme">'+esc(x.q)+'</div><div class="qans"><div class="tx">'+x.a+'</div>';
  h+='<div class="gchip">'+esc(x.g)+'</div>';
  if(x.c&&own)h+='<div class="caveat">⚠ '+esc(x.c)+'</div>';
  if(S.qcur==='live'){
   h+='<div class="qacts">';
   if(x.act)h+='<button class="btn sm" onclick="qaAct('+i+')">建单</button>';
   h+='<button class="rvb" onclick="toast(\'已记为有用\')">👍</button>'
    +'<button class="rvb" onclick="toast(\'已记为没用 · 会问你哪里不对\')">👎</button></div>';
  }
  return h+'</div>';
 }).join('');
}
function dockHist(){
 let h='<div style="font-size:var(--fs-xs);font-weight:600;color:var(--t2);margin-bottom:var(--sp-2)">历史对话</div>';
 h+='<button class="hrow '+(S.qcur==='live'?'on':'')+'" onclick="openSess(\'live\')">'
  +'<span style="flex:1;min-width:0;text-align:left"><b style="font-size:var(--fs-sm)">当前对话</b>'
  +'<span style="display:block;font-size:var(--fs-xs);color:var(--t3)">'+((S.qlive||[]).length)+' 轮</span></span></button>';
 h+=(S.qsess||[]).map(x=>'<button class="hrow '+(S.qcur===x.id?'on':'')+'" onclick="openSess(\''+x.id+'\')">'
  +'<span style="flex:1;min-width:0;text-align:left"><b style="font-size:var(--fs-sm)">'+esc(x.t)+'</b>'
  +'<span style="display:block;font-size:var(--fs-xs);color:var(--t3)">'+x.at+' · '+x.qa.length+' 轮</span></span></button>').join('');
 return h+'<div class="note" style="margin-top:var(--sp-3)">对话会存着，但<b>结论不该只活在对话里</b>——有用的答案记得建单或存进知识库，不然过两周谁也找不到。</div>';
}
function analDock(own){
 const c=curSess();
 const ico=(d)=>'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">'+d+'</svg>';
 let h='<aside class="analdock'+(S.qexp?' exp':'')+'">';
 h+='<div class="dockh">'+AV('ana',26)
  +'<div style="flex:1;min-width:0"><div style="font-size:var(--fs-md);font-weight:600">'+nick('ana')+'</div>'
  +'<div style="font-size:var(--fs-xs);color:var(--t3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(c.t)+'</div></div>'
  +'<button class="ib" onclick="S.qhist=!S.qhist;render()" title="历史">'+ico('<path d="M12 8v4l3 2"/><circle cx="12" cy="12" r="9"/>')+'</button>'
  +'<button class="ib" onclick="newSess()" title="新对话">'+ico('<path d="M12 5v14M5 12h14"/>')+'</button>'
  +'<button class="ib" onclick="S.qexp=!S.qexp;render()" title="'+(S.qexp?'收起':'放大')+'">'
  +ico(S.qexp?'<path d="M9 3v6H3M21 15h-6v6"/>':'<path d="M15 3h6v6M9 21H3v-6"/>')+'</button></div>';
 h+='<div class="dockb">'+(S.qhist?dockHist():dockMsgs(own))+'</div>';
 if(S.qhist){h+='<div class="dockc"><button class="btn ghost sm" style="width:100%;justify-content:center" onclick="S.qhist=0;render()">回到对话</button></div>';}
 else if(S.qcur==='live'){
  h+='<div class="dockc"><textarea id="qi" rows="2" placeholder="问一句…" onkeydown="if(event.key===\'Enter\'&&!event.shiftKey){event.preventDefault();sendQ()}"></textarea>'
   +'<div style="display:flex;align-items:center;gap:var(--sp-2);margin-top:var(--sp-2)">'
   +'<span style="flex:1;font-size:var(--fs-xs);color:var(--t3)">Enter 发送 · 数字取自接口，不估算</span>'
   +'<button class="btn sm" onclick="sendQ()">发送</button></div></div>';
 } else {
  h+='<div class="dockc"><button class="btn ghost sm" style="width:100%;justify-content:center" onclick="openSess(\'live\')">回到当前对话</button></div>';
 }
 return h+'</aside>';
}



/* D: right column = recent analyses, no conversation UI */
function anaSide(own){
 const A=anaThreads();
 let h='<aside class="anaside">';
 const st=T.find(x=>x.standing==='ana');
 h+='<div class="card"><div class="card-t">分析线程 <span class="chip" style="background:var(--orange-bg);color:var(--orange-fg);border:1px solid #FFEDD5">置顶</span></div>';
 if(st){
  h+='<div style="font-size:var(--fs-sm);color:var(--t2);line-height:1.7;margin-bottom:var(--sp-2)">所有数据问题都问在<b>同一条常驻线程</b>里，不会越问越多。已问过 '+(st.arts.length+(st.log||[]).length)+' 次。</div>';
  h+=st.arts.slice(0,3).map(a=>'<button class="hrow" onclick="go(\'thread\',\''+st.id+'\')">'
   +'<span style="flex:1;min-width:0;text-align:left"><b style="font-size:var(--fs-sm);display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(a.ttl)+'</b>'
   +'<span style="font-size:var(--fs-xs);color:var(--t3)">分析结论</span></span></button>').join('');
  h+='<button class="btn ghost sm" style="width:100%;justify-content:center;margin-top:var(--sp-2)" onclick="go(\'thread\',\''+st.id+'\')">打开分析线程 →</button>';
 }
 h+='<div style="font-size:var(--fs-xs);color:var(--t3);margin-top:var(--sp-2);line-height:1.55"><b>问不是做。</b>结论要动手，就在产出上点「建单去做」，那才另开一条。</div></div>';
 h+='<div class="card" style="margin-top:var(--sp-3)"><div class="card-t">问一句</div>'
  +'<div style="font-size:var(--fs-sm);color:var(--t2);line-height:1.7;margin-bottom:var(--sp-2)">轻的问题看完就走，不建线程。要往下做再展开成任务。</div>'
  +'<button class="btn" style="width:100%;justify-content:center" onclick="quickAsk()">'+AV('ana',18)+' 问分析师</button></div>';
 return h+'</aside>';
}
const DEFAULT_ANALYTICS_KPIS=['gmv','conversion','roas','stock_days'];
const MAX_ANALYTICS_KPIS=8;
const ANALYTICS_STORES=[
 {id:'all',name:'全部店铺'},
 {id:'tmall',name:'A8OPARIS 天猫国际旗舰店'},
 {id:'douyin',name:'A8OPARIS 抖音旗舰店'},
 {id:'jd',name:'A8OPARIS 京东旗舰店'}
];
const CHAT_RECORDS=[
 {id:'cr1',q:'要先做测试吗？',answer:'您可以选择先进行测试，这样能更好地了解自己的需求和适合的产品。如果您有任何疑问，欢迎随时咨询我们！',platform:'天猫',platformId:'tmall',store:'EVO1.1海外旗舰店',kb:'通用KB',group:'evo产品问答'},
 {id:'cr2',q:'如何申请退款？',answer:'您可以在收到货后7天内申请退款。只需登录您的账户，找到订单页面，点击申请退款即可。如果您已经拒收了包裹，退款会在我们确认收到退回的商品后处理。请注意，退款处理时间通常为1–3个工作日，具体时间可能会因银行处理而有所不同。',platform:'小红书',platformId:'red',store:'cliganic海外旗舰店',kb:'通用KB',group:'退换类'},
 {id:'cr3',q:'这个益生菌适合多大孩子？',answer:'我们建议3岁以上的孩子可以使用我们的益生菌产品，具体选择可以根据孩子的需求来决定。如果您有关于便秘的具体情况，可以告诉我，我可以为您推荐更合适的产品哦。',platform:'天猫',platformId:'tmall',store:'LiveSpo海外旗舰店',kb:'通用KB',group:'livespo产品问答'},
 {id:'cr4',q:'这个喷雾了用不用冲洗？',answer:'这个喷雾使用后不需要冲洗，您可以直接让它在鼻腔内发挥作用。使用时请按照说明书的指引进行操作，确保效果最佳。如果还有其他问题，随时问我！',platform:'天猫',platformId:'tmall',store:'LiveSpo海外旗舰店',kb:'通用KB',group:'livespo产品问答'},
 {id:'cr5',q:'这个益生菌的成分是什么？',answer:'请发送图片或截图给客服看一下，方便我们帮您核实哦。',platform:'天猫',platformId:'tmall',store:'LiveSpo海外旗舰店',kb:'依赖图片',group:'livespo产品问答'},
 {id:'cr6',q:'适合哪个年龄段的人群？',answer:'这个产品适合18周岁以上的成人服用，未成年人不可以吃的哦。',platform:'京东',platformId:'jd',store:'TRU NIAGEN海外旗舰店',kb:'产品KB',group:'关联商品 9 个'},
 {id:'cr7',q:'一瓶能吃多久？',answer:'一瓶五加仑NAD+维活丸有30粒，建议成人每日1–3粒，具体用量可根据个人需求调整。如果每天吃1粒，整瓶可以吃30天；如果每天吃3粒，整瓶可以吃10天。希望这个信息对您有帮助！',platform:'京东',platformId:'jd',store:'TRU NIAGEN海外旗舰店',kb:'产品KB',group:'关联商品 1 个'},
 {id:'cr8',q:'怎么吃呢？',answer:'加强版的服用方法是：每次500mg，每日早饭或午饭随餐或餐后时摄取2粒软胶囊，适合50岁以上，以及40岁以上精力不足的人群。希望对您有帮助！',platform:'京东',platformId:'jd',store:'TRU NIAGEN海外旗舰店',kb:'产品KB',group:'关联商品 2 个'},
 {id:'cr9',q:'保质期多久？',answer:'我们的产品保质期一般为24个月，具体日期会在产品包装上标明。请您在购买时查看包装上的生产日期和保质期，以确保在有效期内使用。如果您还有其他问题，随时可以问我！',platform:'京东',platformId:'jd',store:'TRU NIAGEN海外旗舰店',kb:'通用KB',group:'TN产品问答'},
 {id:'cr10',q:'我可以把不用的购物金退款吗？',answer:'购物金一般是无法直接退款的，但您可以在有效期内使用它进行消费。如果您有特殊情况需要处理，请提供订单信息，我们会有专属客服为您核实处理。希望能帮到您！',platform:'天猫',platformId:'tmall',store:'Moraz洗护海外旗舰店',kb:'通用KB',group:'优惠活动'}
];
const CHAT_IMPORT_HISTORY=[
 {id:'ih1',store:'EPAPLUS海外旗舰店',platforms:[['天猫','tmall']],scope:['EPAPLUS海外旗舰店','Moraz洗护海外旗舰店','Tru Niagen海外旗舰店','TRU NIAGEN海外旗舰店']},
 {id:'ih2',store:'Tru Niagen海外旗舰店',platforms:[['小红书','red'],['天猫','tmall'],['京东','jd']],scope:['Tru Niagen海外旗舰店','TRU NIAGEN海外旗舰店','EPAPLUS海外旗舰店']},
 {id:'ih3',store:'EVO1.1海外旗舰店',platforms:[['天猫','tmall'],['京东','jd']],scope:['EVO1.1海外旗舰店','cliganic海外旗舰店','TRU NIAGEN海外旗舰店','Arcwell海外官方旗舰店']},
 {id:'ih4',store:'EPAPLUS海外旗舰店',platforms:[['天猫','tmall'],['京东','jd']],scope:['EPAPLUS海外旗舰店','TRU NIAGEN海外旗舰店','Tru Niagen海外旗舰店','cliganic海外旗舰店']},
 {id:'ih5',store:'Tru Niagen海外旗舰店',platforms:[['天猫','tmall'],['京东','jd'],['小红书','red']],scope:['Tru Niagen海外旗舰店','Moraz洗护海外旗舰店','TRU NIAGEN海外旗舰店','EPAPLUS海外旗舰店']},
 {id:'ih6',store:'TRU NIAGEN海外旗舰店',platforms:[['京东','jd'],['天猫','tmall']],scope:['TRU NIAGEN海外旗舰店','EPAPLUS海外旗舰店','Tru Niagen海外旗舰店','Moraz洗护海外旗舰店']},
 {id:'ih7',store:'cliganic海外旗舰店',platforms:[['天猫','tmall'],['京东','jd']],scope:['cliganic海外旗舰店','TRU NIAGEN海外旗舰店','Tru Niagen海外旗舰店']}
];
function analyticsKpiIds(){
 const valid=new Set(KPI.map(k=>k.id));
 if(!Array.isArray(S.anaKpiIds))S.anaKpiIds=DEFAULT_ANALYTICS_KPIS.slice();
 S.anaKpiIds=S.anaKpiIds.filter((id,i,a)=>valid.has(id)&&a.indexOf(id)===i).slice(0,MAX_ANALYTICS_KPIS);
 if(!S.anaKpiIds.length)S.anaKpiIds=DEFAULT_ANALYTICS_KPIS.slice();
 return S.anaKpiIds;
}
function selectedAnalyticsKpis(){const ids=analyticsKpiIds();return KPI.filter(k=>ids.includes(k.id));}
function analyticsKpiCards(){return selectedAnalyticsKpis().map(k=>`<div class="kpic">
   <div class="kl">${esc(k.k)}</div><div class="kv num">${esc(k.v)}</div>
   <div class="kt"><span class="${k.up?'up':'dn'}">${esc(k.tr)}</span><span style="color:var(--t3)">${esc(k.vs)}</span></div>
   <div class="kbar" aria-hidden="true"><i style="width:${k.pct}%"></i></div>
  </div>`).join('');}
function analyticsKpiPicker(){
 const ids=analyticsKpiIds(),full=ids.length>=MAX_ANALYTICS_KPIS;
 return `<div class="ana-kpi-control"><button id="ana-kpi-trigger" class="ana-kpi-trigger" aria-expanded="false" aria-controls="ana-kpi-panel" onclick="toggleAnalyticsKpiPicker()"><i data-lucide="sliders-horizontal" aria-hidden="true"></i><span>管理 KPI</span><i class="ana-kpi-chevron" data-lucide="chevron-down" aria-hidden="true"></i></button>
  <div id="ana-kpi-panel" class="ana-kpi-panel" role="group" aria-label="选择展示的 KPI" onclick="event.stopPropagation()" hidden>${KPI.map(k=>`<label class="ana-kpi-option"><input type="checkbox" data-kpi="${k.id}" ${ids.includes(k.id)?'checked':''} ${full&&!ids.includes(k.id)?'disabled':''} onchange="toggleAnalyticsKpi('${k.id}',this)"><span>${esc(k.menu||k.k)}</span></label>`).join('')}<div class="ana-kpi-hint">最多选择 ${MAX_ANALYTICS_KPIS} 项，至少保留 1 项</div></div></div>`;
}
function analyticsStorePicker(){
 const selected=ANALYTICS_STORES.find(store=>store.id===(S.anaStore||'all'))||ANALYTICS_STORES[0];
 return `<div class="ana-store-control"><button id="ana-store-trigger" class="ana-kpi-trigger ana-store-trigger" aria-expanded="false" aria-controls="ana-store-panel" onclick="toggleAnalyticsStorePicker()"><i data-lucide="store" aria-hidden="true"></i><span>${esc(selected.name)}</span><i class="ana-kpi-chevron" data-lucide="chevron-down" aria-hidden="true"></i></button>
  <div id="ana-store-panel" class="ana-kpi-panel ana-store-panel" role="listbox" aria-label="选择店铺" onclick="event.stopPropagation()" hidden>${ANALYTICS_STORES.map(store=>`<button class="ana-store-option ${store.id===selected.id?'on':''}" role="option" aria-selected="${store.id===selected.id}" onclick="selectAnalyticsStore('${store.id}')"><span>${esc(store.name)}</span></button>`).join('')}</div></div>`;
}
function anaKpiOverview(){
 return `<section class="ana-kpi-overview" aria-label="你的指标"><div class="ana-kpi-head"><div class="ana-kpi-title">你的指标</div>${analyticsDatePicker()}${analyticsKpiPicker()}${analyticsStorePicker()}</div>
  <div class="kpigrid" id="ana-kpi-grid">${analyticsKpiCards()}</div></section>`;
}
function metricGuide(){
 const items=[['看看我现在配了哪些','当前配置了 '+selectedAnalyticsKpis().map(x=>x.k).join('、')+'。'],['加一个指标','告诉我指标名称、统计口径和目标值，我会先给你预览。'],['去掉一个指标','选择要移除的指标；移除只影响此处看板，不会删除数据源。'],['设置目标值','选择一个指标并填写目标值，确认后会更新看板对比。']];
 return `<div class="metric-guide"><div class="metric-guide-actions">${items.map((x,i)=>`<button class="metric-guide-action" onclick="metricGuideAction(${i})">${x[0]}</button>`).join('')}</div>${Number.isInteger(S.metricGuideAnswer)?`<div class="metric-guide-answer">${esc(items[S.metricGuideAnswer][1])}</div>`:S.metricGuideCustom?`<div class="metric-guide-answer">收到：${esc(S.metricGuideCustom)}<br>我会先核对可用数据源和统计口径，再给你预览，不会直接改动看板。</div>`:''}</div>`;
}
function metricGuideAction(i){S.metricGuideAnswer=i;render();}
function toggleMetricGuide(){S.qmetric=!S.qmetric;S.qhist=0;S.metricGuideAnswer=null;render();}
function analysisComposer(metricMode){
 if(metricMode)return `<div class="dockc"><textarea id="mi" rows="2" placeholder="说说你想增加、移除或调整哪个指标…" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendMetricGuide()}"></textarea><div style="display:flex;align-items:center;gap:var(--sp-2);margin-top:var(--sp-2)"><span style="flex:1;font-size:var(--fs-xs);color:var(--t3)">Enter 发送 · 先确认口径，再修改看板</span><button class="btn sm" onclick="sendMetricGuide()">发送</button></div></div>`;
 return `<div class="dockc"><textarea id="qi" rows="2" placeholder="${S.qcur==='live'?'问一句…':'继续这段对话…'}" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendQ()}"></textarea><div style="display:flex;align-items:center;gap:var(--sp-2);margin-top:var(--sp-2)"><span style="flex:1;font-size:var(--fs-xs);color:var(--t3)">Enter 发送 · 数字取自接口，不估算</span><button class="btn sm" onclick="sendQ()">发送</button></div></div>`;
}
/* B: KPI cards above the conversation and brand-health columns. */
function anaB(own){
 const metricMode=!!S.qmetric;
 let h=anaKpiOverview()+'<div class="blay">';
 h+='<div class="bmain"><div class="card ana-chat-card">';
 h+='<div class="dockh">'+AV('ana',26)
  +'<div style="flex:1;min-width:0"><div style="font-size:var(--fs-md);font-weight:600">'+(metricMode?'配置向导':nick('ana'))+'</div>'
  +(metricMode?'<div class="metric-guide-status">基于你的数据</div>':'<div style="font-size:var(--fs-xs);color:var(--t3)">'+esc(curSess().t)+'</div>')+'</div>'
  +'<button class="metric-toggle '+(metricMode?'on':'')+'" onclick="toggleMetricGuide()" aria-pressed="'+metricMode+'" title="'+(metricMode?'返回数据对话':'配置指标')+'"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M12 3l1.3 4.2L17.5 9l-4.2 1.8L12 15l-1.3-4.2L6.5 9l4.2-1.8L12 3Z"/><path d="M19 15l.7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z"/></svg><span>'+(metricMode?'问数据':'配指标')+'</span></button>'
  +'<button class="ib" onclick="S.qmetric=false;S.qhist=!S.qhist;render()" title="历史"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 8v4l3 2"/><circle cx="12" cy="12" r="9"/></svg></button>'
 +(metricMode?'':'<button class="ib" onclick="newSess()" title="新对话"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></button>')+'</div>';
 h+='<div class="dockb">'+(metricMode?metricGuide():S.qhist?dockHist():dockMsgs(own))+'</div>';
 h+=S.qhist?'<div class="dockc"><button class="btn ghost sm" style="width:100%;justify-content:center" onclick="S.qhist=0;render()">打开所选对话</button></div>':analysisComposer(metricMode);
 h+='</div></div>';
 // brand-health rail
 h+='<aside class="brail">';
 h+='<div class="card"><div class="card-t">品牌健康度</div>'
  +'<div style="display:flex;align-items:baseline;gap:var(--sp-2)"><span class="num" style="font-size:var(--fs-3xl);font-weight:800">'+BH.score+'</span>'
  +'<span style="font-size:var(--fs-sm);color:var(--t2)">'+BH.label+'</span></div>'
  +'<div class="note" style="background:var(--danger-bg);border-color:var(--danger-bd);color:var(--danger-fg-strong);margin:var(--sp-2) 0 0;font-size:var(--fs-xs)">'
  +'风险修正 <b>'+BH.risk+'</b> · 修正前 <b>'+BH.pre+'</b>。服务跟进负面占触达 34%。</div>'
  +BH.factors.map(f=>'<div class="mrow"><span class="vv">'+f[0]+'</span><span style="flex:1;font-size:var(--fs-xs)">'+f[1]+'</span>'
   +'<span class="num" style="font-size:var(--fs-sm);font-weight:700">'+f[3]+'</span></div>').join('')
  +'<button class="btn sm" style="width:100%;justify-content:center;margin-top:var(--sp-2)" onclick="healthProp()">让舆情监控出个提案</button>'
  +'<button class="btn ghost sm" style="width:100%;justify-content:center;margin-top:var(--sp-2)" onclick="go(\'thread\',\'t17\')">看是哪 1 条 →</button></div>';
 return h+'</aside></div>';
}

/* ---- D: analysis is a thread ---- */
function anaThreads(){return T.filter(t=>t.dom==='数据分析');}
function askThread(seed){
 const q=seed||($('qi2')||{value:''}).value.trim();
 if(!q){toast('先问一句');return;}
 const key=Object.keys(QA).find(k=>q.includes(k));const a=QA[key];
 const t=T.find(x=>x.standing==='ana');
 // older conclusions drop into the run log; the newest stays on top
 if(t.arts.length>=3){const old=t.arts.pop();(t.log=t.log||[]).unshift({at:'早些时候',res:old.ttl,arts:1});}
 t.arts.unshift({id:'aa'+Date.now(),ty:'分析结论',ttl:q.slice(0,20),by:'ana',v:1,st:'done',pv:'doc',g:['#C4B5FD','#7C3AED'],
   ex:(a?a.a:'这个我需要先从数据接口取准确数字再说。这里每个数都是取回来的，不是估出来的——取不到我会直说，不会编。').replace(/<[^>]*>/g,''),
   vals:a?[{l:'口径',v:a.g.split(' · ')[0],s:'ok'},{l:'数据时间',v:'今天 07:00',s:'ok'},{l:'注意',v:a.c?'见结论':'—',s:a.c?'warn':'ok'}]
     :[{l:'状态',v:'需要先取数',s:'warn'}],
   nxt:a&&a.act?[a.act,'存进知识库']:['存进知识库'],sub:[]});
 t.intent={who:'du',tx:q,at:'刚刚'};t.up='刚刚';t.new=(t.new||0)+1;t.day=0;
 closeDw();go('thread',t.id);toast('已加进常驻分析线程 · 没有新开线程');
}
function quickAsk(seed){
 S.qk=seed||null;
 const key=seed?Object.keys(QA).find(k=>seed.includes(k)):null;const a=key?QA[key]:null;
 const sug=['这周转化为什么掉了？','ROAS 还能救吗？','库存够撑到大促吗？','品牌健康分为什么是 54？'];
 let b='';
 if(a){
  b='<div class="qme">'+esc(seed)+'</div><div class="qans"><div class="tx">'+a.a+'</div>'
   +'<div class="gchip">'+esc(a.g)+'</div>'
   +(a.c?'<div class="caveat">⚠ '+esc(a.c)+'</div>':'')
   +'</div>'
   +'<div class="note">问一句就是这样——<b>轻的问题不用建线程</b>。要接着往下做、或者想留住这个结论，就展开成任务。</div>';
 } else if(seed){
  b='<div class="qme">'+esc(seed)+'</div><div class="qans"><div class="tx">这个我需要先从数据接口取准确数字再说。<b>这里每个数都是取回来的，不是估出来的</b>——取不到我会直说，不会编。</div>'
   +'<div class="gchip">来源 你的数据接口 · 数据时间 今天 07:00</div></div>';
 } else {
  b='<div style="font-size:var(--fs-sm);color:var(--t2);line-height:1.7;margin-bottom:var(--sp-3)">'
   +'问完就走，不建任务。<b>只有当答案需要调用其他 Agent 时才建任务</b>——比如「排查移动端加购路径」要店铺巡检去跑。单纯问数不用。'
   +sug.map(q=>'<button class="qsug" onclick="quickAsk(\''+q+'\')">'+q+'</button>').join('');
 }
 $('dw').innerHTML='<div class="dw-h">'
  +'<button class="ib" onclick="closeDw()"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>'
  +AV('ana',30)+'<div style="flex:1;min-width:0"><div class="ty">问一句</div><h3>'+nick('ana')+'</h3></div></div>'
  +'<div class="dw-b">'+b+'</div>'
  +'<div class="dw-f"><textarea id="qi2" rows="1" placeholder="再问一句…" style="flex:1;border:1px solid var(--border);border-radius:8px;padding:var(--sp-2) 10px;font-size:var(--fs-sm);resize:none;font-family:inherit"></textarea>'
  +'<button class="btn ghost sm" onclick="quickAsk(($(\'qi2\').value||\'\').trim())">发送</button>'
  +(seed?'<button class="btn sm" onclick="askThread(\''+esc(seed)+'\')">要调用其他 agent · 建任务</button>':'')+'</div>';
 $('dw').classList.add('on');$('scrim').classList.add('on');
}

function pinAnswer(i){
 const x=curSess().qa[i];
 toast('已存到 知识库 › 已批准产出 · 带着口径和数据时间一起存');
}
function healthProp(){
 if(PROPS.some(p=>p.id==='ph1')){S.ptab=0;go('prop');toast('提案已经在待决定里');return;}
 PROPS.unshift({src:'a',id:'ph1',by:'listen',t:'先把物流破损这条摁住',conf:'hi',age:'刚刚',life:.2,camp:null,dom:'用户运营',cost:'¥6',st:'new',rev:'y',own:'Ariel',score:88,
  sig:'负面聚集占本周自然触达 34%',base:'该主题 90 天基准 4%（带宽 2–7%，n=90）',
  why:'健康分从 64 掉到 54，全部来自这一组，不是普遍下滑。摁住这一条，分数就回来了。',
  imp:'预计风险修正从 −10 回到 −2 以内',impb:'依据：修正前 64 是已知量；回升幅度是推算。',
  ev:[['信号','负面占触达 34%'],['基准','90 天均值 4%（2–7%）'],['偏离','+750%'],['来源','5 条帖子 · 同一承运商'],['关联','客服 6 单破损工单']],
  plan:['汇总近 14 天破损工单与承运商分布','生成给供应链的核查请求'],
  reason:{saw:'负面聚集占本周自然触达 34%，90 天基准是 4%。',
   judge:'健康分掉的 10 分几乎全在这一组里，不是普遍下滑。这种集中式下跌比弥散式好处理——摁住一个源头，分数就回来了。',
   ruled:['等下周看是否自然消退 —— 否决：同一承运商，不会自己消失','只做舆情回复 —— 否决：回复不解决破损，客服那边已经有 6 单工单','判断为个别用户情绪 —— 否决：5 条来自 5 个不同账号'],
   ifdo:'风险修正预计从 −10 回到 −2 以内。',ifdob:'依据：修正前分数 64 是已知量；回升幅度是推算，不是测算。',
   ifnot:'负面继续累积，且客服工单量已经在涨。'},
  agents:['insp'],cmts:[]});
 S.ptab=0;go('prop');toast('舆情监控已出提案 · 在提案里等你决定');
}
function analyticsDateRange(){
 if(!S.anaDateRange){
  const end=new Date(),start=new Date(end);start.setDate(start.getDate()-6);
  const fmt=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  S.anaDateRange={start:fmt(start),end:fmt(end)};
 }
 return S.anaDateRange;
}
function toggleAnalyticsKpiPicker(){
 const panel=$('ana-kpi-panel'),trigger=$('ana-kpi-trigger');if(!panel||!trigger)return;
 const opening=panel.hidden;
 if(opening){closeAnalyticsDatePicker();closeAnalyticsStorePicker();}
 panel.hidden=!opening;trigger.setAttribute('aria-expanded',String(opening));
 if(opening)panel.querySelector('input:not(:disabled)')?.focus();
}
function closeAnalyticsKpiPicker(focus=false){
 const panel=$('ana-kpi-panel'),trigger=$('ana-kpi-trigger');if(!panel||panel.hidden)return;
 panel.hidden=true;if(trigger){trigger.setAttribute('aria-expanded','false');if(focus)trigger.focus();}
}
function toggleAnalyticsStorePicker(){
 const panel=$('ana-store-panel'),trigger=$('ana-store-trigger');if(!panel||!trigger)return;
 const opening=panel.hidden;
 if(opening){closeAnalyticsDatePicker();closeAnalyticsKpiPicker();}
 panel.hidden=!opening;trigger.setAttribute('aria-expanded',String(opening));
 if(opening)panel.querySelector('[role="option"][aria-selected="true"]')?.focus();
}
function closeAnalyticsStorePicker(focus=false){
 const panel=$('ana-store-panel'),trigger=$('ana-store-trigger');if(!panel||panel.hidden)return;
 panel.hidden=true;trigger.setAttribute('aria-expanded','false');if(focus)trigger.focus();
}
function selectAnalyticsStore(id){
 const store=ANALYTICS_STORES.find(item=>item.id===id);if(!store)return;
 S.anaStore=id;closeAnalyticsStorePicker();render();toast(`已切换至${store.name}`);
}
function syncAnalyticsKpiPicker(){
 const ids=analyticsKpiIds(),full=ids.length>=MAX_ANALYTICS_KPIS,panel=$('ana-kpi-panel'),grid=$('ana-kpi-grid');
 if(grid){grid.innerHTML=analyticsKpiCards();if(LANG==='en')trDOM(grid);}
 if(panel)panel.querySelectorAll('input[data-kpi]').forEach(input=>{const checked=ids.includes(input.dataset.kpi);input.checked=checked;input.disabled=full&&!checked;});
}
function toggleAnalyticsKpi(id,input){
 const exists=KPI.some(k=>k.id===id);if(!exists||!input)return;
 let ids=analyticsKpiIds().slice(),selected=ids.includes(id);
 if(input.checked&&!selected){
  if(ids.length>=MAX_ANALYTICS_KPIS){input.checked=false;toast(`最多同时展示 ${MAX_ANALYTICS_KPIS} 个 KPI`);return;}
  ids.push(id);
 }else if(!input.checked&&selected){
  if(ids.length<=1){input.checked=true;toast('至少保留 1 个 KPI');return;}
  ids=ids.filter(x=>x!==id);
 }
 S.anaKpiIds=KPI.map(k=>k.id).filter(k=>ids.includes(k));syncAnalyticsKpiPicker();
}
function analyticsDatePicker(){
 const range=analyticsDateRange();
 return `<div class="ana-range-control">
  <button id="ana-range-trigger" class="ana-range-trigger" aria-expanded="false" aria-controls="ana-range-panel" onclick="toggleAnalyticsDatePicker()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M16 3v4M8 3v4M3 11h18"/></svg><span>${range.start} ~ ${range.end}</span></button>
  <div id="ana-range-panel" class="ana-range-panel" role="dialog" aria-label="选择日期范围" onclick="event.stopPropagation()" hidden></div></div>`;
}
function analyticsDateKey(date){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
function drawAnalyticsCalendar(){
 const panel=$('ana-range-panel'),draft=S.anaRangeDraft;if(!panel||!draft)return;
 const range=analyticsDateRange(),start=draft.start||range.start,end=draft.start?draft.start:range.end;
 const first=new Date(draft.year,draft.month,1),offset=(first.getDay()+6)%7,today=analyticsDateKey(new Date());
 const days=Array.from({length:42},(_,i)=>{
  const date=new Date(draft.year,draft.month,i-offset+1),key=analyticsDateKey(date),endpoint=key===start||key===end;
  return `<button class="ana-calendar-day ${date.getMonth()!==draft.month?'other':''} ${key>=start&&key<=end?'in-range':''} ${endpoint?'endpoint':''} ${key===today?'today':''}" data-date="${key}" aria-label="${key}${key===start?'，开始日期':''}${key===end?'，结束日期':''}" aria-pressed="${endpoint}" onclick="selectAnalyticsDate('${key}')">${date.getDate()}</button>`;
 }).join('');
 panel.innerHTML=`<div class="ana-calendar-head"><button class="ana-calendar-nav" data-month="prev" aria-label="上个月" onclick="moveAnalyticsMonth(-1)">‹</button><span class="ana-calendar-title">${draft.year} 年 ${draft.month+1} 月</span><button class="ana-calendar-nav" data-month="next" aria-label="下个月" onclick="moveAnalyticsMonth(1)">›</button></div><div class="ana-calendar-grid">${['一','二','三','四','五','六','日'].map(d=>`<span class="ana-calendar-week">${d}</span>`).join('')}${days}</div><div class="ana-calendar-hint" role="status">${draft.start?draft.start+' 起 · 请选择结束日期':'点选开始日期，再点结束日期'}</div>`;
}
function moveAnalyticsMonth(offset){
 const draft=S.anaRangeDraft;if(!draft)return;
 const date=new Date(draft.year,draft.month+offset,1);draft.year=date.getFullYear();draft.month=date.getMonth();drawAnalyticsCalendar();
 $('ana-range-panel').querySelector(`[data-month="${offset<0?'prev':'next'}"]`)?.focus();
}
function selectAnalyticsDate(key){
 const draft=S.anaRangeDraft;if(!draft)return;
 if(!draft.start){draft.start=key;drawAnalyticsCalendar();$('ana-range-panel').querySelector(`[data-date="${key}"]`)?.focus();return;}
 const [start,end]=[draft.start,key].sort();applyAnalyticsDateRange(start,end);
}
function toggleAnalyticsDatePicker(){
 const panel=$('ana-range-panel');if(!panel)return;
 if(!panel.hidden){closeAnalyticsDatePicker(true);return;}
 closeAnalyticsKpiPicker();closeAnalyticsStorePicker();
 const range=analyticsDateRange(),[year,month]=range.start.split('-').map(Number);
 S.anaRangeDraft={year,month:month-1,start:null};drawAnalyticsCalendar();
 panel.hidden=false;$('ana-range-trigger').setAttribute('aria-expanded','true');panel.querySelector(`[data-date="${range.start}"]`)?.focus();
}
function closeAnalyticsDatePicker(focus=false){
 const panel=$('ana-range-panel'),trigger=$('ana-range-trigger');if(!panel)return;
 panel.hidden=true;if(trigger){trigger.setAttribute('aria-expanded','false');if(focus)trigger.focus();}
}
function applyAnalyticsDateRange(start,end){
 if(!start||!end||start>end)return;
 S.anaDateRange={start,end};
 $('ana-range-trigger').querySelector('span').textContent=start+' ~ '+end;
 closeAnalyticsDatePicker(true);toast('时间范围已更新，当前指标仍为演示数据');
}
document.addEventListener('click',e=>{if(!e.target.closest('.ana-range-control'))closeAnalyticsDatePicker();if(!e.target.closest('.ana-kpi-control'))closeAnalyticsKpiPicker();if(!e.target.closest('.ana-store-control'))closeAnalyticsStorePicker();if(!e.target.closest('.chat-date-control'))closeChatRecordDatePicker();if(!e.target.closest('.chat-filter-control'))closeChatRecordFilterPickers();if(!e.target.closest('.chat-detail-picker'))closeChatDetailPickers();});
document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;if($('ana-range-panel')&&!$('ana-range-panel').hidden)closeAnalyticsDatePicker(true);else if($('ana-kpi-panel')&&!$('ana-kpi-panel').hidden)closeAnalyticsKpiPicker(true);else if($('ana-store-panel')&&!$('ana-store-panel').hidden)closeAnalyticsStorePicker(true);else if($('chat-date-panel')&&!$('chat-date-panel').hidden)closeChatRecordDatePicker(true);else if(document.querySelector('.chat-detail-picker-panel:not([hidden])'))closeChatDetailPickers(true);else closeChatRecordFilterPickers(true);});
function analyticsViewTabs(){
 const view=S.anaView||'data';
 return `<div class="bar"><div class="seg" role="tablist" aria-label="数据分析视图">
  <button role="tab" aria-selected="${view==='data'}" class="${view==='data'?'on':''}" onclick="S.anaView='data';render()">数据分析</button>
  <button role="tab" aria-selected="${view==='chat'}" class="${view==='chat'?'on':''}" onclick="S.anaView='chat';render()">聊天记录分析</button>
 </div></div>`;
}
function chatRecordState(){
 if(!Array.isArray(S.chatSelected))S.chatSelected=[];
 if(!Array.isArray(S.chatHidden))S.chatHidden=[];
 if(!Array.isArray(S.chatApproved))S.chatApproved=[];
 if(typeof S.chatAnalyzing!=='boolean')S.chatAnalyzing=false;
 if(!S.chatPlatform)S.chatPlatform='all';
 if(!S.chatStore)S.chatStore='all';
 if(!S.chatStatus)S.chatStatus='pending';
 if(!S.chatKb)S.chatKb='all';
 if(!Number.isInteger(S.chatPage))S.chatPage=1;
 return S;
}
function openChatImportModal(){
 S.chatImportFile=null;drawChatImportModal();
}
function openChatImportHistory(){
 if(!Array.isArray(S.chatImportHistoryHidden))S.chatImportHistoryHidden=[];
 S.chatImportHistoryOpen=null;drawChatImportHistory();
}
function drawChatImportHistory(){
 const hidden=S.chatImportHistoryHidden||[],rows=CHAT_IMPORT_HISTORY.filter(item=>!hidden.includes(item.id));
 $('dw').classList.remove('focus','expanded');
 $('dw').innerHTML=`<div class="dw-h"><button class="ib" onclick="closeDw()" aria-label="关闭"><i data-lucide="x" aria-hidden="true"></i></button><div style="flex:1;min-width:0"><div class="ty">客户聊天记录分析</div><h3>导入记录</h3></div></div>
  <div class="dw-b chat-history-body"><div class="chat-history-list">${rows.length?rows.map(chatImportHistoryCard).join(''):'<div class="chat-history-empty">暂无导入记录</div>'}</div></div>`;
 $('dw').classList.add('on');$('scrim').classList.add('on');if(window.lucide)lucide.createIcons({root:$('dw'),attrs:{width:16,height:16,'stroke-width':1.8}});
}
function chatImportHistoryCard(item){
 const open=S.chatImportHistoryOpen===item.id,scope=item.scope.join(' / ');
 return `<article class="chat-history-card ${open?'open':''}">
  <div class="chat-history-card-head"><div class="chat-history-main"><h4>${esc(item.store)}</h4><div class="chat-history-tags"><span class="chat-tag approved">已完成</span>${item.platforms.map(platform=>`<span class="chat-tag platform ${platform[1]}">${platform[0]}</span>`).join('')}</div></div><div class="chat-history-actions"><button class="chat-history-view-icon" aria-expanded="${open}" onclick="toggleChatImportHistory('${item.id}')" aria-label="${open?'收起':'查看'} ${esc(item.store)} 的导入详情"><i data-lucide="eye" aria-hidden="true"></i></button><button class="chat-history-delete" onclick="deleteChatImportHistory('${item.id}')" aria-label="删除 ${esc(item.store)} 的导入记录"><i data-lucide="trash-2" aria-hidden="true"></i></button></div></div>
  <p class="chat-history-scope">${esc(scope)}</p>
  ${open?`<div class="chat-history-detail"><span>导入范围</span><p>本批次包含 ${item.scope.length} 个店铺的聊天记录，已完成分析并生成建议回复。</p></div>`:''}
 </article>`;
}
function toggleChatImportHistory(id){S.chatImportHistoryOpen=S.chatImportHistoryOpen===id?null:id;drawChatImportHistory();}
function deleteChatImportHistory(id){
 const item=CHAT_IMPORT_HISTORY.find(record=>record.id===id);if(!item)return;
 openChatDeleteConfirm({kind:'history',id,title:'删除这条导入记录？',name:item.store,description:'删除后，这条历史导入记录将不再显示。'});
}
function drawChatImportModal(){
 const file=S.chatImportFile,size=file?`${Math.max(1,Math.ceil(file.size/1024))} KB`:'';
 $('mod').classList.remove('plan-mode','asset-mode');
 $('mod').innerHTML=`<form class="mbox chat-import-modal" role="dialog" aria-modal="true" aria-labelledby="chat-import-title" onsubmit="event.preventDefault();confirmChatImport()">
  <header class="chat-import-head"><div><h3 id="chat-import-title">导入聊天记录</h3><p>上传从「聊天记录测试」页面导出的 JSON 文件，系统会自动开始 AI 分析。</p></div><button type="button" class="ib chat-import-close" onclick="closeMod()" aria-label="关闭"><i data-lucide="x" aria-hidden="true"></i></button></header>
  <div class="chat-import-body"><label>选择聊天记录 JSON 文件</label><input id="chat-import-input" type="file" accept=".json,application/json" hidden onchange="selectChatImportFile(this.files[0])">
   <div class="chat-import-dropzone ${file?'has-file':''}" role="button" tabindex="0" aria-label="${file?'重新选择聊天记录 JSON 文件':'选择聊天记录 JSON 文件'}" onclick="$('chat-import-input').click()" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();$('chat-import-input').click()}" ondragover="event.preventDefault();this.classList.add('dragging')" ondragleave="this.classList.remove('dragging')" ondrop="handleChatImportDrop(event)">
    ${file?`<i data-lucide="file-json" aria-hidden="true"></i><div><strong>${esc(file.name)}</strong><span>${size} · 点击重新选择</span></div>`:`<i data-lucide="upload-cloud" aria-hidden="true"></i><strong>点击上传聊天记录文件<span>.json</span></strong><small>也可以将文件拖放到这里</small>`}
   </div>
  </div>
  <footer class="chat-import-foot"><button type="button" class="btn ghost" onclick="closeMod()">取消</button><button type="submit" class="btn" ${file?'':'disabled'}>开始分析</button></footer>
 </form>`;
 $('mod').classList.add('on');if(window.lucide)lucide.createIcons({root:$('mod'),attrs:{width:18,height:18,'stroke-width':1.8}});
}
function selectChatImportFile(file){
 if(!file)return;
 if(!/\.json$/i.test(file.name)){toast('请选择 JSON 格式的聊天记录文件');return;}
 S.chatImportFile=file;drawChatImportModal();
}
function handleChatImportDrop(event){
 event.preventDefault();event.currentTarget.classList.remove('dragging');selectChatImportFile(event.dataTransfer?.files?.[0]);
}
function confirmChatImport(){
 const file=S.chatImportFile;if(!file)return;
 S.chatAnalyzing=true;S.chatImportFile=null;closeMod();render();toast(`已导入 ${file.name}，正在分析`);
}
function stopChatAnalysis(){
 if(!S.chatAnalyzing)return;
 S.chatAnalyzing=false;render();toast('分析已终止');
}
function filteredChatRecords(){
 chatRecordState();
 return CHAT_RECORDS.filter(record=>!S.chatHidden.includes(record.id))
  .filter(record=>S.chatPlatform==='all'||record.platformId===S.chatPlatform)
  .filter(record=>S.chatStore==='all'||record.store===S.chatStore)
  .filter(record=>S.chatStatus==='all'||(S.chatStatus==='approved'?S.chatApproved.includes(record.id):!S.chatApproved.includes(record.id)))
  .filter(record=>S.chatKb==='all'||record.kb===S.chatKb)
  .filter(()=>!S.chatDateRange||('2026-09-16'>=S.chatDateRange.start&&'2026-09-16'<=S.chatDateRange.end));
}
function chatRecordSelect(id,checked){
 chatRecordState();
 S.chatSelected=checked?[...new Set([...S.chatSelected,id])]:S.chatSelected.filter(item=>item!==id);render();
}
function chatRecordSelectAll(checked){
 const ids=filteredChatRecords().map(record=>record.id);
 S.chatSelected=checked?[...new Set([...S.chatSelected,...ids])]:S.chatSelected.filter(id=>!ids.includes(id));render();
}
function setChatRecordFilter(key,value){S[key]=value;S.chatPage=1;render();}
function chatRecordFilterPicker(name,label,options,value,wide=false){
 const selected=options.find(option=>option[0]===value)||options[0];
 return `<div class="chat-filter-control ${wide?'wide':''}"><button id="chat-filter-${name}-trigger" class="ana-kpi-trigger chat-filter-trigger" aria-expanded="false" aria-controls="chat-filter-${name}-panel" onclick="toggleChatRecordFilterPicker('${name}')"><span>${esc(selected[1])}</span><i class="ana-kpi-chevron" data-lucide="chevron-down" aria-hidden="true"></i></button><div id="chat-filter-${name}-panel" class="ana-kpi-panel chat-filter-panel" role="listbox" aria-label="${esc(label)}" onclick="event.stopPropagation()" hidden>${options.map(option=>`<button class="ana-store-option ${option[0]===value?'on':''}" role="option" aria-selected="${option[0]===value}" onclick="selectChatRecordFilter('${name}','${option[0]}')">${esc(option[1])}</button>`).join('')}</div></div>`;
}
function toggleChatRecordFilterPicker(name){
 const panel=$(`chat-filter-${name}-panel`),trigger=$(`chat-filter-${name}-trigger`);if(!panel||!trigger)return;
 const opening=panel.hidden;closeChatRecordFilterPickers(false,name);closeChatRecordDatePicker();
 panel.hidden=!opening;trigger.setAttribute('aria-expanded',String(opening));
 if(opening)panel.querySelector('[role="option"][aria-selected="true"]')?.focus();
}
function closeChatRecordFilterPickers(focus=false,except=''){
 document.querySelectorAll('.chat-filter-control').forEach(control=>{
  const panel=control.querySelector('.chat-filter-panel'),trigger=control.querySelector('.chat-filter-trigger');
  if(!panel||panel.id===`chat-filter-${except}-panel`||panel.hidden)return;
  panel.hidden=true;if(trigger){trigger.setAttribute('aria-expanded','false');if(focus)trigger.focus();}
 });
}
function selectChatRecordFilter(name,value){
 const keys={platform:'chatPlatform',store:'chatStore',status:'chatStatus',kb:'chatKb'};if(!keys[name])return;
 setChatRecordFilter(keys[name],value);
}
function chatRecordDatePicker(){
 const range=S.chatDateRange,label=range?`${range.start} ~ ${range.end}`:'时间筛选';
 return `<div class="chat-date-control"><button id="chat-date-trigger" class="chat-date-filter" aria-expanded="false" aria-controls="chat-date-panel" onclick="toggleChatRecordDatePicker()"><i data-lucide="calendar-days" aria-hidden="true"></i><span>${label}</span></button><div id="chat-date-panel" class="ana-range-panel" role="dialog" aria-label="选择聊天记录日期范围" onclick="event.stopPropagation()" hidden></div></div>`;
}
function drawChatRecordCalendar(){
 const panel=$('chat-date-panel'),draft=S.chatRangeDraft;if(!panel||!draft)return;
 const saved=S.chatDateRange||{},start=draft.start||saved.start||'',end=draft.start?draft.start:(saved.end||'');
 const first=new Date(draft.year,draft.month,1),offset=(first.getDay()+6)%7,today=analyticsDateKey(new Date());
 const days=Array.from({length:42},(_,i)=>{
  const date=new Date(draft.year,draft.month,i-offset+1),key=analyticsDateKey(date),endpoint=key===start||key===end,inRange=start&&end&&key>=start&&key<=end;
  return `<button class="ana-calendar-day ${date.getMonth()!==draft.month?'other':''} ${inRange?'in-range':''} ${endpoint?'endpoint':''} ${key===today?'today':''}" data-chat-date="${key}" aria-label="${key}${key===start?'，开始日期':''}${key===end?'，结束日期':''}" aria-pressed="${endpoint}" onclick="selectChatRecordDate('${key}')">${date.getDate()}</button>`;
 }).join('');
 panel.innerHTML=`<div class="ana-calendar-head"><button class="ana-calendar-nav" data-chat-month="prev" aria-label="上个月" onclick="moveChatRecordMonth(-1)"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg></button><span class="ana-calendar-title">${draft.year} 年 ${draft.month+1} 月</span><button class="ana-calendar-nav" data-chat-month="next" aria-label="下个月" onclick="moveChatRecordMonth(1)"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></button></div><div class="ana-calendar-grid">${['一','二','三','四','五','六','日'].map(day=>`<span class="ana-calendar-week">${day}</span>`).join('')}${days}</div><div class="ana-calendar-hint" role="status">${draft.start?draft.start+' 起 · 请选择结束日期':'点选开始日期，再点结束日期'}</div>`;
}
function toggleChatRecordDatePicker(){
 const panel=$('chat-date-panel'),trigger=$('chat-date-trigger');if(!panel||!trigger)return;
 if(!panel.hidden){closeChatRecordDatePicker(true);return;}
 closeAnalyticsDatePicker();closeAnalyticsKpiPicker();closeAnalyticsStorePicker();closeChatRecordFilterPickers();
 const base=S.chatDateRange?new Date(S.chatDateRange.start+'T00:00:00'):new Date();
 S.chatRangeDraft={year:base.getFullYear(),month:base.getMonth(),start:null};drawChatRecordCalendar();panel.hidden=false;trigger.setAttribute('aria-expanded','true');
 (panel.querySelector('[data-chat-date].today')||panel.querySelector('[data-chat-date]'))?.focus();
}
function closeChatRecordDatePicker(focus=false){
 const panel=$('chat-date-panel'),trigger=$('chat-date-trigger');if(!panel||panel.hidden)return;
 panel.hidden=true;trigger.setAttribute('aria-expanded','false');if(focus)trigger.focus();
}
function moveChatRecordMonth(offset){
 const draft=S.chatRangeDraft;if(!draft)return;const date=new Date(draft.year,draft.month+offset,1);draft.year=date.getFullYear();draft.month=date.getMonth();drawChatRecordCalendar();
 $('chat-date-panel').querySelector(`[data-chat-month="${offset<0?'prev':'next'}"]`)?.focus();
}
function selectChatRecordDate(key){
 const draft=S.chatRangeDraft;if(!draft)return;
 if(!draft.start){draft.start=key;drawChatRecordCalendar();$('chat-date-panel').querySelector(`[data-chat-date="${key}"]`)?.focus();return;}
 const [start,end]=[draft.start,key].sort();S.chatDateRange={start,end};S.chatPage=1;closeChatRecordDatePicker();render();toast(`已筛选 ${start} 至 ${end} 的聊天记录`);
}
function setChatRecordPage(page){S.chatPage=Math.max(1,Math.min(4,page));render();}
function deleteChatRecord(id){
 const record=CHAT_RECORDS.find(item=>item.id===id);if(!record)return;
 openChatDeleteConfirm({kind:'record',id,fromDetail:S.chatDetailDraft?.id===id&&$('dw').classList.contains('on'),title:'删除这条客户问题？',name:record.q,description:'删除后，该问题及其建议回复将从当前列表中移除。'});
}
function approveSelectedChatRecords(){
 chatRecordState();const count=S.chatSelected.length;if(!count)return;
 S.chatApproved=[...new Set([...S.chatApproved,...S.chatSelected])];S.chatSelected=[];render();toast(`已批准 ${count} 条建议回复`);
}
function downloadSelectedChatRecords(){
 chatRecordState();const records=CHAT_RECORDS.filter(record=>S.chatSelected.includes(record.id));if(!records.length)return;
 const quote=value=>'"'+String(value).replace(/"/g,'""')+'"';
 const csv=['客户问题,建议回复,平台,店铺,知识库',...records.map(record=>[record.q,record.answer,record.platform,record.store,record.kb].map(quote).join(','))].join('\n');
 const url=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'})),link=document.createElement('a');
 link.href=url;link.download='客户聊天记录.csv';link.click();URL.revokeObjectURL(url);toast(`已下载 ${records.length} 条记录`);
}
function deleteSelectedChatRecords(){
 chatRecordState();const count=S.chatSelected.length;if(!count)return;
 openChatDeleteConfirm({kind:'selected',count,title:`删除已选择的 ${count} 条记录？`,name:`共 ${count} 条客户问题`,description:'删除后，这些问题及其建议回复将从当前列表中移除。'});
}
function openChatDeleteConfirm(action){
 S.chatDeleteAction=action;$('mod').classList.remove('plan-mode','asset-mode');
 $('mod').innerHTML=`<div class="mbox chat-delete-modal" role="alertdialog" aria-modal="true" aria-labelledby="chat-delete-title" aria-describedby="chat-delete-description">
  <div class="chat-delete-head"><div class="chat-delete-icon"><i data-lucide="trash-2" aria-hidden="true"></i></div><div><h3 id="chat-delete-title">${esc(action.title)}</h3><p id="chat-delete-description">${esc(action.description)}</p></div><button class="ib" onclick="cancelChatDelete()" aria-label="关闭"><i data-lucide="x" aria-hidden="true"></i></button></div>
  <div class="chat-delete-target"><span>即将删除</span><strong>${esc(action.name)}</strong></div>
  <div class="chat-delete-foot"><button class="btn ghost" onclick="cancelChatDelete()">取消</button><button class="btn chat-delete-confirm" onclick="confirmChatDelete()"><i data-lucide="trash-2" aria-hidden="true"></i>确认删除</button></div>
 </div>`;
 $('mod').classList.add('on');if(window.lucide)lucide.createIcons({root:$('mod'),attrs:{width:17,height:17,'stroke-width':1.9}});
}
function cancelChatDelete(){S.chatDeleteAction=null;closeMod();}
function confirmChatDelete(){
 const action=S.chatDeleteAction;if(!action)return;S.chatDeleteAction=null;closeMod();
 if(action.kind==='history'){
  S.chatImportHistoryHidden=[...new Set([...(S.chatImportHistoryHidden||[]),action.id])];if(S.chatImportHistoryOpen===action.id)S.chatImportHistoryOpen=null;drawChatImportHistory();toast('导入记录已删除');return;
 }
 chatRecordState();
 if(action.kind==='record'){
  S.chatHidden=[...new Set([...S.chatHidden,action.id])];S.chatSelected=S.chatSelected.filter(item=>item!==action.id);if(action.fromDetail)closeDw();render();toast('记录已删除');return;
 }
 const count=S.chatSelected.length;S.chatHidden=[...new Set([...S.chatHidden,...S.chatSelected])];S.chatSelected=[];render();toast(`已删除 ${count} 条记录`);
}
function cancelChatRecordSelection(){S.chatSelected=[];render();}
function viewChatRecord(id){
 const record=CHAT_RECORDS.find(item=>item.id===id);if(!record)return;
 S.chatDetailDraft={id,question:record.q,answer:record.answer,kb:record.kb,group:record.group,keywords:record.keywords||record.q.replace(/[？?！!。]/g,''),scope:record.scope||(record.kb==='通用KB'?'通用，可跨品牌/平台复用':'适用于当前知识库内容'),sampleQuestion:record.q,sampleAnswer:record.answer};drawChatRecordDetail();
}
function chatDetailOptions(name){
 return name==='kb'?['通用KB','产品KB','依赖图片']:[...new Set(CHAT_RECORDS.map(record=>record.group))];
}
function chatDetailPicker(name,label,value){
 const options=chatDetailOptions(name);
 return `<div class="chat-detail-picker"><label>${label}</label><button id="chat-detail-${name}-trigger" class="ana-kpi-trigger chat-detail-picker-trigger" aria-expanded="false" aria-controls="chat-detail-${name}-panel" onclick="toggleChatDetailPicker('${name}')"><span>${esc(value)}</span><i class="ana-kpi-chevron" data-lucide="chevron-down" aria-hidden="true"></i></button><div id="chat-detail-${name}-panel" class="ana-kpi-panel chat-detail-picker-panel" role="listbox" aria-label="选择${label}" hidden>${options.map((option,index)=>`<button class="ana-store-option ${option===value?'on':''}" role="option" aria-selected="${option===value}" onclick="selectChatDetailPicker('${name}',${index})">${esc(option)}</button>`).join('')}</div></div>`;
}
function drawChatRecordDetail(){
 const draft=S.chatDetailDraft,record=draft&&CHAT_RECORDS.find(item=>item.id===draft.id);if(!draft||!record)return;
 $('dw').classList.remove('focus','expanded');
 const body=`<div class="fld chat-detail-field"><label for="chat-detail-question">客户问题</label><textarea id="chat-detail-question" rows="4" oninput="S.chatDetailDraft.question=this.value" onblur="saveChatRecordDetail(false,true)">${esc(draft.question)}</textarea></div>
   <div class="fld chat-detail-field reply"><label for="chat-detail-answer">建议回复</label><textarea id="chat-detail-answer" rows="10" oninput="S.chatDetailDraft.answer=this.value" onblur="saveChatRecordDetail(false,true)">${esc(draft.answer)}</textarea></div>
   <div class="chat-detail-meta-grid">${chatDetailPicker('kb','知识库归属',draft.kb)}</div>
   <div class="chat-detail-support-grid"><div class="fld chat-detail-support-field"><label for="chat-detail-keywords">触发关键词</label><textarea id="chat-detail-keywords" rows="2" oninput="S.chatDetailDraft.keywords=this.value" onblur="saveChatRecordDetail(false,true)">${esc(draft.keywords)}</textarea></div><div class="fld chat-detail-support-field"><label for="chat-detail-scope">适用范围</label><textarea id="chat-detail-scope" rows="2" oninput="S.chatDetailDraft.scope=this.value" onblur="saveChatRecordDetail(false,true)">${esc(draft.scope)}</textarea></div></div>
   <div class="chat-sample-head"><h4>样本对话</h4><span><i data-lucide="lock" aria-hidden="true"></i>只读内容</span></div>
   <div class="chat-sample-block"><p><strong>顾客</strong><span>${esc(draft.sampleQuestion)}</span></p><p><strong>客服</strong><span>${esc(draft.sampleAnswer)}</span></p></div>
   <div class="chat-sample-block"><p><strong>顾客</strong><span>这个和我现在看的产品有什么区别？</span></p><p><strong>客服</strong><span>主要区别在适用场景和核心卖点上，可以先确认您更关注效果、成分还是使用体验。</span></p></div>`;
 $('dw').innerHTML=`<div class="dw-h chat-detail-head"><button class="ib" onclick="closeDw()" aria-label="关闭"><i data-lucide="x" aria-hidden="true"></i></button><div style="flex:1;min-width:0"><div class="ty">聊天记录分析 · ${esc(record.platform)}</div><h3>${esc(record.q)}</h3></div></div>
  <div class="dw-b chat-detail-body">${body}</div>
  <div class="dw-f chat-detail-foot"><button class="btn" onclick="saveChatRecordDetail(true)">批准</button><button class="btn ghost" onclick="downloadChatRecordDetail()"><i data-lucide="download" aria-hidden="true"></i>下载</button><button class="btn ghost chat-detail-delete" onclick="deleteChatRecord('${record.id}')"><i data-lucide="trash-2" aria-hidden="true"></i>删除</button></div>`;
 $('dw').classList.add('on');$('scrim').classList.add('on');if(window.lucide)lucide.createIcons({root:$('dw'),attrs:{width:16,height:16,'stroke-width':1.8}});syncDrawerExpandControl();
}
function toggleChatDetailPicker(name){
 const panel=$(`chat-detail-${name}-panel`),trigger=$(`chat-detail-${name}-trigger`);if(!panel||!trigger)return;
 const opening=panel.hidden;closeChatDetailPickers(false,name);panel.hidden=!opening;trigger.setAttribute('aria-expanded',String(opening));if(opening)panel.querySelector('[aria-selected="true"]')?.focus();
}
function closeChatDetailPickers(focus=false,except=''){
 document.querySelectorAll('.chat-detail-picker-panel').forEach(panel=>{
  if(panel.id===`chat-detail-${except}-panel`||panel.hidden)return;
  panel.hidden=true;const trigger=$(panel.id.replace('-panel','-trigger'));if(trigger){trigger.setAttribute('aria-expanded','false');if(focus)trigger.focus();}
 });
}
function selectChatDetailPicker(name,index){
 const options=chatDetailOptions(name),value=options[index];if(!S.chatDetailDraft||value===undefined)return;
 S.chatDetailDraft[name]=value;drawChatRecordDetail();
}
function saveChatRecordDetail(approve=false,quiet=false){
 const draft=S.chatDetailDraft,record=draft&&CHAT_RECORDS.find(item=>item.id===draft.id);if(!draft||!record)return;
 const question=draft.question.trim(),answer=draft.answer.trim();if(!question||!answer){toast('客户问题和建议回复不能为空');return;}
 record.q=question;record.answer=answer;record.kb=draft.kb;record.group=draft.group;record.keywords=draft.keywords.trim();record.scope=draft.scope.trim();
 if(approve){chatRecordState();S.chatApproved=[...new Set([...S.chatApproved,record.id])];}
 render();
 if(approve){closeDw();toast('已批准并保存修改');return;}
 if(!quiet)toast('问题详情已保存');
}
function downloadChatRecordDetail(){
 const draft=S.chatDetailDraft,record=draft&&CHAT_RECORDS.find(item=>item.id===draft.id);if(!draft||!record)return;
 const data={客户问题:draft.question,建议回复:draft.answer,标签:draft.kb,分组:draft.group,平台:record.platform,店铺:record.store,样本对话:[{顾客:draft.sampleQuestion,客服:draft.sampleAnswer}]};
 const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download=`客户问题-${record.id}.json`;link.click();URL.revokeObjectURL(url);toast('问题详情已下载');
}
function chatRecordRows(){
 const records=filteredChatRecords(),page=S.chatPage||1;
 if(page!==1)return `<div class="chat-record-empty">当前原型仅录入第 1 页示例数据。</div>`;
 if(!records.length)return `<div class="chat-record-empty">当前筛选下没有聊天记录。</div>`;
 return records.map(record=>{const approved=S.chatApproved.includes(record.id);return `<div class="chat-record-row">
  <div class="chat-record-check"><input type="checkbox" aria-label="选择 ${esc(record.q)}" ${S.chatSelected.includes(record.id)?'checked':''} onchange="chatRecordSelect('${record.id}',this.checked)"></div>
  <div class="chat-record-question"><strong>${esc(record.q)}</strong><div class="chat-record-tags"><span class="chat-tag ${approved?'approved':'pending'}">${approved?'已批准':'待审核'}</span><span class="chat-tag ai-reply">AI 自动回复</span><span class="chat-tag platform ${record.platformId}">${record.platform}</span><span class="chat-tag kb">${record.kb}</span><span class="chat-record-group">${record.group.startsWith('关联')?'':'分组：'}${esc(record.group)}</span></div><div class="chat-record-source">${esc(record.store)} / 2026/9/16</div></div>
  <div class="chat-record-answer">${esc(record.answer)}</div>
  <div class="chat-record-actions"><button class="chat-icon-button view" aria-label="查看 ${esc(record.q)}" onclick="viewChatRecord('${record.id}')"><i data-lucide="eye" aria-hidden="true"></i></button><button class="chat-icon-button delete" aria-label="删除 ${esc(record.q)}" onclick="deleteChatRecord('${record.id}')"><i data-lucide="trash-2" aria-hidden="true"></i></button></div>
 </div>`;}).join('');
}
function analyticsChatView(){
 chatRecordState();
 const records=filteredChatRecords(),allSelected=records.length&&records.every(record=>S.chatSelected.includes(record.id));
 const stores=[['all','全部店铺'],...Array.from(new Set(CHAT_RECORDS.map(record=>record.store))).map(store=>[store,store])];
 return `<div class="wrap chat-analysis-page">
  <div class="eyebrow">工作 · 客户聊天记录分析</div><h1>客户聊天记录分析</h1>
  <div class="sub ana-page-intro">导入客户聊天记录，AI 自动沉淀高频问题与建议回复，审核后进入知识运营。</div>
  ${analyticsViewTabs()}
  <div class="chat-summary" aria-label="聊天记录统计">
   ${[['171','建议总数'],['33','当前筛选'],[String(138+S.chatApproved.length),'已批准'],['13','导入批次数'],[String(S.chatSelected.length),'已选择']].map(item=>`<div class="chat-summary-item"><strong class="num">${item[0]}</strong><span>${item[1]}</span></div>`).join('')}
  </div>
  <section class="chat-record-panel" aria-label="客户聊天记录">
   <header class="chat-record-panel-head"><div><h2>客户聊天记录分析</h2><p>分析导入的客户聊天记录，审核 AI 建议回复。</p></div><div class="chat-record-head-actions">${S.chatAnalyzing?'<span class="chat-analysis-running" role="status"><i aria-hidden="true"></i>正在分析中</span><button class="btn ghost sm chat-analysis-stop" onclick="stopChatAnalysis()">终止分析</button>':''}<button class="btn ghost sm" onclick="openChatImportHistory()"><i data-lucide="history" aria-hidden="true"></i>导入记录</button><button class="btn sm" onclick="openChatImportModal()"><i data-lucide="plus" aria-hidden="true"></i>导入聊天记录</button></div></header>
   <div class="chat-record-filters">
    ${chatRecordFilterPicker('platform','平台筛选',[['all','全部平台'],['tmall','天猫'],['red','小红书'],['jd','京东']],S.chatPlatform)}
    ${chatRecordFilterPicker('store','店铺筛选',stores,S.chatStore,true)}
    ${chatRecordFilterPicker('status','状态筛选',[['pending','待审核'],['approved','已批准'],['all','全部状态']],S.chatStatus)}
    ${chatRecordFilterPicker('kb','知识库筛选',[['all','全部知识库'],['通用KB','通用KB'],['产品KB','产品KB'],['依赖图片','依赖图片']],S.chatKb)}
    ${chatRecordDatePicker()}
   </div>
   <div class="chat-record-table-head"><div><input type="checkbox" aria-label="选择当前筛选下的全部记录" ${allSelected?'checked':''} onchange="chatRecordSelectAll(this.checked)"></div><div>客户问题</div><div>建议回复</div><div>操作</div></div>
   <div class="chat-record-list">${chatRecordRows()}</div>
   <footer class="chat-record-footer"><strong>总计 33 项</strong><div class="chat-record-pagination"><span>每页</span><select aria-label="每页条数"><option>10</option></select><span>条</span><button class="page-text" ${S.chatPage===1?'disabled':''} onclick="setChatRecordPage(${S.chatPage-1})">上一页</button>${[1,2,3,4].map(page=>`<button class="page-number ${page===S.chatPage?'on':''}" aria-current="${page===S.chatPage?'page':'false'}" onclick="setChatRecordPage(${page})">${page}</button>`).join('')}<button class="page-text" ${S.chatPage===4?'disabled':''} onclick="setChatRecordPage(${S.chatPage+1})">下一页</button></div></footer>
  </section>
  ${S.chatSelected.length?`<div class="chat-bulk-bar" role="toolbar" aria-label="已选择记录的批量操作"><div class="chat-bulk-count">已选择 <strong class="num">${S.chatSelected.length}</strong></div><button onclick="approveSelectedChatRecords()"><i data-lucide="check" aria-hidden="true"></i><span>批准</span></button><button onclick="downloadSelectedChatRecords()"><i data-lucide="download" aria-hidden="true"></i><span>下载</span></button><button class="danger" onclick="deleteSelectedChatRecords()"><i data-lucide="trash-2" aria-hidden="true"></i><span>删除</span></button><button onclick="cancelChatRecordSelection()"><i data-lucide="x" aria-hidden="true"></i><span>取消</span></button></div>`:''}
 </div>`;
}
function vAnal(){
 S.per='op';
 const own=S.per==='op';
 if(!S.anaView)S.anaView='data';
 if(S.anaView==='chat')return analyticsChatView();
 if(S.setup)return anaSetup();
 S.alay='b';
 return `<div class="wrap">
  <div class="eyebrow">上下文 · 数据分析</div><h1>数据分析</h1>
  <div class="sub ana-page-intro">指标不是配出来的，是问出来的。每个数都标了口径、时间和来源——取不到就说取不到。<br>
    <b>只有当答案需要调用其他 agent 时才建任务</b>，否则就停留在对话里。</div>
  ${analyticsViewTabs()}
  ${S.alay==='b'?anaB(own):`<div class="analgrid dlay"><div class="analmain">
  <div class="sech"><span class="t">品牌健康度</span><span class="bar2"></span>
    <span class="hint">舆情监控 · 模型 ${BH.model} · ${BH.at}</span></div>
  <div class="card" style="margin-bottom:var(--sp-5)">
    <div style="display:flex;align-items:center;gap:var(--sp-5);flex-wrap:wrap">
      <div><div class="num" style="font-size:var(--fs-3xl);font-weight:800;line-height:1">${BH.score}</div>
        <div style="font-size:var(--fs-sm);color:var(--t2)">${BH.label} · 修正前 ${BH.pre}</div></div>
      <div style="flex:1;min-width:220px">
        <div class="note" style="background:var(--danger-bg);border-color:var(--danger-bd);color:var(--danger-fg-strong);margin:0">
          风险修正 <b>${BH.risk}</b> · 来自服务跟进负面聚集，占本周触达 34%。</div>
        <div style="display:flex;gap:var(--sp-2);margin-top:var(--sp-2);flex-wrap:wrap">
          <button class="btn sm" onclick="go('thread','t17')">看是哪 1 条 →</button>
          <button class="btn ghost sm" onclick="go('prop')">舆情监控已就此提过 1 条提案 ↗</button></div></div>
    </div>
    <div style="margin-top:var(--sp-3)">${BH.factors.map(f=>`<div class="frow">
      <span class="vv">${f[0]}</span><span style="flex:1;min-width:0"><b style="font-size:var(--fs-sm)">${f[1]}</b>
        <span style="display:block;font-size:var(--fs-xs);color:var(--t3)">${f[5]}</span></span>
      <span class="chip mut">${f[2]}%</span>
      <span class="num" style="font-size:var(--fs-md);font-weight:700;width:34px;text-align:right">${f[3]}</span>
      <span class="num ${f[4]>0?'up':f[4]<0?'dn':''}" style="width:34px;text-align:right;font-size:var(--fs-xs)">${f[4]>0?'+':''}${f[4]||'±0'}</span></div>`).join('')}
      <div style="font-size:var(--fs-xs);color:var(--t3);margin-top:var(--sp-2)">${BH.mentions} 条自然提及 ·
        <button style="color:var(--primary);font-weight:600" onclick="openAgent('listen')">权重与口径 ↗</button></div></div>
  </div>

  <div class="sech"><span class="t">品牌健康度</span><span class="bar2"></span>
    <span class="hint">舆情监控 · 模型 ${BH.model} · ${BH.at}</span></div>
  <div class="card" style="margin-bottom:var(--sp-5)">
    <div style="display:flex;align-items:center;gap:var(--sp-4);flex-wrap:wrap">
      <div><div class="num" style="font-size:var(--fs-3xl);font-weight:800;line-height:1">${BH.score}</div>
        <div style="font-size:var(--fs-sm);color:var(--t2)">${BH.label}</div></div>
      <div style="flex:1;min-width:220px">
        <div class="note" style="background:var(--danger-bg);border-color:var(--danger-bd);color:var(--danger-fg-strong);margin:0">
          风险修正 <b>${BH.risk}</b> · 修正前 <b>${BH.pre}</b>。本周服务跟进负面聚集占触达 34%。</div></div>
      <div style="display:flex;gap:var(--sp-2);flex-wrap:wrap">
        <button class="btn sm" onclick="go('thread','t17')">看是哪 1 条 →</button></div>
    </div></div>

  <div class="sech"><span class="t">你的指标</span><span class="n num">${KPI.length}</span><span class="bar2"></span>
    <span class="hint">${own?'在下面问一句就能改':'已固定'}</span></div>
  <div class="kpigrid">${KPI.map(k=>`<div class="kpic">
    <div class="kl">${k.k}</div>
    <div class="kv num">${k.v}</div>
    <div class="kt"><span class="${k.up?'up':'dn'}">${k.up?'▲':'▼'} ${k.tr}</span>
      <span style="color:var(--t3)">${k.vs}</span></div>
    <div class="kbar"><i style="width:${k.pct}%;background:${k.pct>=85?'var(--green)':k.pct>=70?'var(--gold)':'var(--red)'}"></i></div>
    <div class="kn">${own?k.own:k.brand}</div>
    ${S.alay==='d'?`<button class="kask" onclick="quickAsk('${k.k.replace(/（.*/,'')}怎么了？')">问一句 ↗</button>`:''}</div>`).join('')}</div>

  <div class="sech" style="margin-top:var(--sp-5)"><span class="t">品牌健康度</span><span class="bar2"></span>
    <span class="hint">舆情监控 · 模型 ${BH.model} · ${BH.at}</span></div>
  <div class="card">
    <div style="display:flex;align-items:flex-start;gap:var(--sp-5);flex-wrap:wrap">
      <div style="flex:0 0 auto">
        <div class="num" style="font-size:var(--fs-3xl);font-weight:800;line-height:1">${BH.score}</div>
        <div style="font-size:var(--fs-sm);color:var(--t2);margin-top:var(--sp-1)">${BH.label}</div>
        <div style="display:flex;gap:var(--sp-2);margin-top:var(--sp-2);font-size:var(--fs-xs)">
          <span class="dn">▼ ${Math.abs(BH.d7)} vs 7天</span><span class="up">▲ ${BH.d30} vs 30天</span></div>
      </div>
      <div style="flex:1;min-width:240px">
        ${own?`<div class="note" style="background:var(--danger-bg);border-color:var(--danger-bd);color:var(--danger-fg-strong);margin-bottom:var(--sp-3)">
          风险修正 <b>${BH.risk}</b> 已生效 · 修正前 <b>${BH.pre}</b>。修正在加权和之外单独扣，不是因子分掉了。
          <button style="color:var(--danger-fg-strong);font-weight:600;display:block;margin-top:var(--sp-1)" onclick="go('thread','t17')">看是哪 1 条 →</button></div>`
         :`<div class="note" style="margin-bottom:var(--sp-3)">本周有一组物流相关的负面反馈，已在跟进中。</div>`}
        <div class="spark"><div class="sparkband2"></div>
          <svg viewBox="0 0 300 54" preserveAspectRatio="none" style="width:100%;height:54px;position:relative">
            <polyline points="0,20 30,22 60,18 90,24 120,21 150,26 180,23 195,23" fill="none" stroke="var(--primary)" stroke-width="2"/>
            <polyline points="215,25 240,30 270,38 300,42" fill="none" stroke="var(--primary)" stroke-width="2"/>
            <line x1="195" y1="8" x2="195" y2="48" stroke="var(--border)" stroke-dasharray="3 3"/></svg>
          ${own?`<div class="sparkmk">${BH.marks.map(m=>`<span>◆ ${m[0]} · ${m[1]}</span>`).join('')}<span style="color:var(--t3)">缺口 = 采集失败，不是 0</span></div>`:''}
        </div>
      </div>
    </div>
    ${own?`<div style="margin-top:var(--sp-4)">${BH.factors.map(f=>`<div class="frow">
      <span class="vv">${f[0]}</span>
      <span style="flex:1;min-width:0"><b style="font-size:var(--fs-sm)">${f[1]}</b>
        <span style="display:block;font-size:var(--fs-xs);color:var(--t3)">${f[5]}</span></span>
      <span class="chip mut">${f[2]}%</span>
      <span class="num" style="font-size:var(--fs-md);font-weight:700;width:34px;text-align:right">${f[3]}</span>
      <span class="num ${f[4]>0?'up':f[4]<0?'dn':''}" style="width:34px;text-align:right;font-size:var(--fs-xs)">${f[4]>0?'+':''}${f[4]||'±0'}</span>
    </div>`).join('')}
    <div style="font-size:var(--fs-xs);color:var(--t3);margin-top:var(--sp-2)">
      ${BH.mentions} 条自然提及 · 自有内容 ${BH.unscored[0]} 条、付费合作 ${BH.unscored[1]} 条<b>采集但不计分</b> ·
      <button style="color:var(--primary);font-weight:600" onclick="openAgent('listen')">权重与口径 ↗</button></div></div>`:''}
  </div>
  </div>
  ${anaSide(own)}
 </div>`}
 </div>`;
}
function anaSetup(){
 return `<div class="wrap">
  <div class="eyebrow">上下文 · 数据分析</div><h1>数据分析</h1>
  ${analyticsViewTabs()}
  <div class="firstrun">
    <div class="fr-ic">${AV('ana',44)}</div>
    <h3 style="font-family:'Sora';font-size:var(--fs-xl);font-weight:700;margin-bottom:var(--sp-2)">先把你关心的指标定下来</h3>
    <div style="font-size:var(--fs-md);color:var(--t2);line-height:1.75;max-width:420px;margin:0 auto 18px">
      没有仪表盘要配，也没有图表要拖。我在对话里问你几个问题，把你在意的几个数固定下来——之后全都是问答。</div>
    <div class="ctx" style="text-align:left;margin-bottom:var(--sp-4)">
      <div class="ctxr"><span class="k">已接入</span><span class="v">店铺 · 广告 · 活动 · 客服</span></div>
      <div class="ctxr"><span class="k">可回溯</span><span class="v">90 天</span></div>
      <div class="ctxr"><span class="k">当前模式</span><span class="v">影子模式 · 只检测不告警</span></div></div>
    <button class="btn" onclick="S.setup=0;render()">在对话里开始 →</button>
  </div>
 </div>`;
}



/* ---- save an artifact as a template ---- */
function saveTpl(aid){
 const [t,a]=findArt(aid);
 S.tpl={aid,ty:a.ty,n:a.ttl.slice(0,16)+' 模板',from:a.ttl,fromT:t.id};
 drawSaveTpl();
}
function drawSaveTpl(){
 const x=S.tpl;
 $('mod').innerHTML=`<div class="mbox" style="max-width:540px">
  <div class="mhd"><div class="e">存为模板</div><h3>把这次的结构留下来</h3></div>
  <div class="mbd">
   <div class="note" style="margin-bottom:var(--sp-3)">
     模板是从<b>已经成立的产出</b>里抽出来的，不是凭空写的。凭空写的模板没经过真实场景，用两次就得改。</div>
   <div class="ctx" style="margin-bottom:var(--sp-3)">
     <div class="ctxr"><span class="k">来自</span><span class="v">${esc(x.from)}</span></div>
     <div class="ctxr"><span class="k">产出类型</span><span class="v">${x.ty} · 不可更改</span></div>
     <div class="ctxr"><span class="k">将被谁读</span><span class="v">生成「${x.ty}」的 agent</span></div></div>
   <div class="fld"><label>模板名</label><input id="tpn" value="${esc(x.n)}"></div>
   <div class="fld"><label>什么时候用它 <span class="ct">写给人看的</span></label>
     <textarea id="tpd" rows="2" placeholder="例如：破损、错发、物流延误三类场景"></textarea></div>
   <div class="fld"><label>哪些地方每次都不一样 <span class="ct">这些会变成槽位</span></label>
     <input id="tps" placeholder="客户称呼, 问题描述, 补偿金额" value="${(x.ty==='客服回复'?'客户称呼, 问题描述, 补偿金额':x.ty==='社媒内容'?'场景, 痛点, 证据, 利益点':'')}"></div>
   <div class="fld"><label>替代了哪个模板 <span class="ct">可选</span></label>
     <select id="tpu"><option>——（新增，不替代）</option>${TPLS.filter(t2=>t2.ty===x.ty).map(t2=>`<option>${t2.n}</option>`).join('')}</select></div>
  </div>
   <div class="mft"><button class="btn" onclick="doSaveTpl()">存为模板</button>
     <button class="btn ghost" onclick="closeMod()">取消</button></div></div>`;
 $('mod').classList.add('on');
}
function doSaveTpl(){
 const x=S.tpl,n=($('tpn')||{value:''}).value.trim();
 if(!n){toast('先给模板起个名');return;}
 const sup=($('tpu')||{value:''}).value;
 const slots=(($('tps')||{value:''}).value||'').split(/[,，]/).map(v=>v.trim()).filter(Boolean).map(v=>'{'+v+'}');
 TPLS.unshift({id:'tp'+Date.now(),n,dom:x.dom||kDomFromType(x.ty),ty:x.ty,used:0,edit:0,by:'dudu',at:'今天',
  from:x.from,fromT:x.fromT,sup:sup.startsWith('——')?'——':'替代 '+sup,slots,
  d:($('tpd')||{value:''}).value.trim()||'（还没写使用场景）'});
 closeMod();S.kgrp='out';S.ktab=1;go('know');
 toast('已存为模板 · 生成「'+x.ty+'」的 agent 下次就会读到');
}
