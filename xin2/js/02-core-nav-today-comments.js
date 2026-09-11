/* ============ nav ============ */
function renderNav(){
 $('nav').innerHTML=NAV.map(x=>x.d?'<div class="nv-div"></div>':
  `<button class="nv ${S.view===x.id?'on':''}" onclick="go('${x.id}',null,{nav:true})">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${ICON[x.i]}</svg>
    ${x.n}${x.b?`<span class="bdg num">${x.b==='live'?T.filter(t=>t.st!=='done').length:x.b}</span>`:''}</button>`).join('');
 renderAccount();
}
function currentUser(){return S.currentUser||'du';}
function renderAccount(){
 const id=currentUser();
 const acct=$('acct');if(acct)acct.innerHTML=`<div class="account-panel">${['du','br'].map(k=>{const x=U[k],r=k==='br'?'产品负责人':'任务发起人';return `<button class="${id===k?'on':''}" onclick="switchAccount('${k}',event)" aria-pressed="${id===k}">
  <span class="av" style="width:24px;height:24px;background:linear-gradient(135deg,${x.c}99,${x.c});font-size:var(--fs-xs)">${x.s}</span>
  <span><b>${x.n}</b><span class="meta">${r}${id===k?' · 当前身份':''}</span></span>
 </button>`}).join('')}<div class="account-demo-note">身份仅用于：M1 审批演示 · 天猫详情页内容和新建任务流程演示</div></div>`;
 const u=U[id]||U.du;
 const top=$('topav');if(top){top.textContent=u.s;top.style.background=`linear-gradient(135deg,${u.c}99,${u.c})`;}
}
function toggleAccount(event){if(event)event.stopPropagation();S.accountOpen=!S.accountOpen;renderAccount();}
function switchAccount(id,event){if(event)event.stopPropagation();S.currentUser=id;S.accountOpen=false;renderNav();render();toast('已切换为 '+U[id].n);}
function toggleSb(){$('sb').classList.toggle('on');$('sbscrim').classList.toggle('on');}
function closeSb(){$('sb').classList.remove('on');$('sbscrim').classList.remove('on');}
function navState(){return {view:S.view,tid:S.tid||null};}
function sameNav(a,b){return a&&b&&a.view===b.view&&(a.tid||null)===(b.tid||null);}
function backNav(){
 const prev=S.hist?.at(-1);
 return prev?`<div class="page-back-row"><button class="rvb page-back" onclick="event.stopPropagation();goBack()">← 返回上一页</button></div>`:'';
}
function withBackNav(html){
 if(html.includes('page-back-row'))return html;
 return S.hist?.length?html.replace(/(<div class="wrap"[^>]*>)/,`$1${backNav()}`):html;
}
function goBack(){
 const prev=S.hist&&S.hist.pop();if(!prev)return;
 go(prev.view,prev.tid,{back:true});
}
function go(v,id,opt){closeSb();S.fopen=null;
 const from=navState(),to={view:v,tid:id||null};
 if(opt?.nav)S.hist=[];
 if(!opt?.back&&!opt?.nav&&!sameNav(from,to)){
  S.hist=S.hist||[];S.hist.push(from);if(S.hist.length>30)S.hist.shift();
 }
 if(S.liveT){clearInterval(S.liveT);S.liveT=null;}
 S.view=v;S.tid=id||null;if(id){const _t=T.find(x=>x.id===id);if(_t)_t.new=0;}closeDw();function syncLive(){
 const running=T.filter(t=>t.st==='run').length;
 const on=REG.filter(a=>ONLINE[a.id]&&a.b==='live').length;
 const n=$('lcn'),o=$('lco');if(n)n.textContent=running;if(o)o.textContent=on+' 在线';
}
function syncAppr(){const b=$('apprb');if(b)b.innerHTML='审批 <span class="c num">'+queue().length+'</span>';}
const _r=render;render=function(){_r();syncAppr();syncLive();renderAccount();
 const lz=$('lz'),le=$('le');if(lz)lz.className=LANG==='zh'?'on':'';if(le)le.className=LANG==='en'?'on':'';
 trAll();};
try{
 const o=(typeof Element!=='undefined')&&Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');
 if(o&&o.set)['dw','mod'].forEach(id=>{const el=$(id);if(!el)return;
  Object.defineProperty(el,'innerHTML',{configurable:true,
   set(v){o.set.call(this,v);trDOM(this);},get(){return o.get.call(this)}});});
}catch(e){}
renderNav();render();$('view').scrollTo(0,0);
}
function render(){
 const v=$('view');
 let html;
 if(S.view==='thread')html=vThread();
 else if(S.view==='work')html=vWork();
 else if(S.view==='today')html=vToday();
 else if(S.view==='know')html=vKnow();
 else if(S.view==='agent')html=vAgents();
 else if(S.view==='camp')html=vCamp();
 else if(S.view==='anal')html=vAnal();
 else if(S.view==='prop')html=vProp();
 else html=vSoon();
 v.innerHTML=withBackNav(html);
 if(S.view==='thread')afterThread();
 if(S.view==='today')tickToday();
}
function vSoon(){
 const n=(NAV.find(x=>x.id===S.view)||{}).n||'';
 return `<div class="wrap"><div class="eyebrow">XDIGATE V11</div><h1>${n}</h1>
  <div class="empty" style="margin-top:var(--sp-6)"><div class="h">这一屏不在本次原型范围内</div>
  <div style="font-size:var(--fs-md);max-width:400px;margin:0 auto 18px">本原型只做「工作」列表与任务详情，用来确认线程结构、抽屉分层与审批动作。</div>
  <button class="btn" onclick="go('work')">回到工作</button></div></div>`;
}


/* ============ 今日 ============ */
function queue(){
 const q=[];
 const me=currentUser();
 T.forEach(t=>{
  if(me==='du'&&t.ask&&!t.answered){const askN=t.ask.channels||t.ask.ppt?1:t.ask.qs.length;q.push({t,a:{id:'ask-'+t.id,by:t.ag},oi:null,ttl:t.ask.ppt?'PPT 生成设置待补充':t.ask.channels?'目标渠道待你补充':askN+' 个问题待你回答',
    g:['#C4B5FD','#7C3AED'],ty:'待补充',plat:null,vals:[{l:'信息缺口',v:t.ask.ppt?'PPT 生成设置':t.ask.channels?'渠道配置':askN+' 项',s:'bad'}],wait:8,sla:null,ask:1});}
  if(!t.arts)return;t.arts.forEach(a=>{
  if(a.m1){
   if(a.m1.stage==='owner'&&me===a.m1.owner)q.push({t,a,oi:null,ttl:a.ttl,g:a.g,ty:'负责人审核',plat:a.plat,vals:[{l:'M1 产出',v:'待你先批准',s:'warn'}],wait:5,sla:30,m1:'owner'});
   if(a.m1.stage==='requester'&&me===a.m1.requester)q.push({t,a,oi:null,ttl:t.demoDualAgents?'双 Agent 交付待 dudu 验收':a.ttl,g:a.g,ty:'验收',plat:a.plat,vals:t.demoDualAgents?[{l:'详情页内容',v:'Brooks 已批准',s:'ok'},{l:'巡检报告',v:'Brooks 已批准',s:'ok'}]:[{l:'Brooks',v:'已批准',s:'ok'}],wait:0,sla:null,m1:'requester',priority:1});
   return;
  }
  if(me!=='du')return;
 
 if(a.mode==='options'){a.opts.forEach((o,i)=>{if(o.s==='review')
    q.push({t,a,oi:i,ttl:o.t,g:o.g,ty:a.ty,plat:a.plat,vals:[{l:'禁用词',v:'通过',s:'ok'},{l:'字数',v:'412/1000',s:'ok'}],wait:181,sla:null});});}
  else if(a.st==='review')
    q.push({t,a,oi:null,ttl:a.ttl,g:a.g||(a.rows?['#F9A8D4','#DB2777']:['#C4B5FD','#8B5CF6']),ty:a.ty,plat:a.plat,vals:a.vals,
      wait:a.id==='a4'?312:a.id==='a5'?24:a.id==='a6'?1140:a.id==='a7'?26:120, sla:a.id==='a5'?30:null});
 });});
 const band=x=>x.sla?(x.wait>x.sla?0:x.wait>x.sla*.6?1:2):3;
 return q.sort((x,y)=>{
  if(!!x.priority!==!!y.priority)return x.priority?-1:1;
  const bx=band(x),by=band(y);
  if(bx!==by)return bx-by;
  if(bx<2)return (y.wait/y.sla)-(x.wait/x.sla);
  return y.wait-x.wait;});
}
function wtxt(m){return m>=1440?Math.floor(m/1440)+' 天':m>=60?Math.floor(m/60)+' 小时':m+' 分钟';}
function setApprovalDom(dom){S.approvalDom=dom;S.qall=false;render();}
function todaySubtitle(q){
 const a=q.a,t=q.t;
 if(q.m1==='requester')return t.demoDualAgents?`${t.t} · 两份产出均已由 Brooks 批准，等待你逐个验收和评分。`:`${t.t} · Brooks 已批准，等待你完成最终验收。`;
 if(q.ask){
  const ask=t.ask?.channels?'目标渠道配置待补充':t.ask?.tx||'需要你补充信息';
  return `${t.t} · ${ask}`;
 }
 if(a.inspection)return `${t.t} · 为何标记：${a.ex||'检测到异常，需要确认处理。'}`;
 if(a.sentiment){
  const d=a.sentiment;
  return `${t.t} · 发现：${d.topic||a.ex||'出现需要确认的社交健康信号。'}`;
 }
 if(a.mode==='options'&&q.oi!==null&&q.oi!==undefined){
  const o=a.opts[q.oi]||{};
  return `${t.t} · ${a.ty||'方案'}：${o.e||a.ex||'需要确认这个方向。'}`;
 }
 if(a.mode==='plans'&&q.oi!==null&&q.oi!==undefined){
  const p=a.plans[q.oi]||{};
  return `${t.t} · ${a.ty||'内容'}：${p.e||a.ex||'需要确认这篇内容。'}`;
 }
 const detail=a.body?a.body.split('\n')[0]:a.ex||a.sum||a.ty||'等待确认';
 return `${t.t} · ${detail}`;
}
const RUNP={t5:{p:38,s:'筛选候选池 · 已评估 112/300 位达人'}};
function RUNS(){return T.filter(t=>t.st==='run').map(t=>{
 if(!RUNP[t.id])RUNP[t.id]={p:8,s:'刚开始 · '+((t.plan&&t.plan.steps[0])?t.plan.steps[0].l:'执行中')};
 return {id:t.id,p:RUNP[t.id].p,s:RUNP[t.id].s};});}
const STALL=[{id:'t6',w:'等蓄水期预算确认',who:'Brooks',h:'1 小时未动'},{id:'t7',w:'等天猫版本先定稿',who:'Brooks',h:'3 小时未动'}];

function vToday(){
 const RUN=RUNS();
 const ALLQ=queue(),approvalDom=S.approvalDom||'全部';
 const Q=approvalDom==='全部'?ALLQ:ALLQ.filter(x=>x.t.dom===approvalDom);
 const late=ALLQ.filter(x=>x.sla&&x.wait>x.sla).length,
   near=ALLQ.filter(x=>x.sla&&x.wait<=x.sla&&x.wait>x.sla*.6).length;
 const done=T.filter(t=>t.st==='done');
 return `<div class="wrap" style="max-width:900px">
  <div class="eyebrow">今日</div>
  <h1>需要你的地方</h1>
  <div class="daystrip"><span class="dt">8月15日 · 周六</span>
    <span class="sm"><b class="num">${ALLQ.length}</b> 件等你决定 · <b class="num">${RUN.length}</b> 个 agent 在跑 · 昨夜完成 <b class="num">${done.length}</b> 件${late?` · <b style="color:var(--red)">${late}</b> 件逾期`:''}${near?` · <b style="color:var(--warn-fg)">${near}</b> 件快到时限`:''}</span></div>

  <div class="sec">
    <div class="sech"><span class="t">需要你审批</span><span class="n num">${Q.length}</span><span class="bar2"></span>
      <span class="hint">${Q.length>6?'先看前 6 条':'逾期优先'}</span></div>
    <div class="seg today-approval-tabs">${DOMS.map(d=>`<button class="${approvalDom===d?'on':''}" onclick="setApprovalDom('${d}')">${d}</button>`).join('')}</div>
    ${Q.length?(S.qall?Q:Q.slice(0,6)).map(qrow).join(''):'<div class="allclear">没有等你的决定了。</div>'}
    ${Q.length>6?`<button class="fold" onclick="S.qall=!S.qall;render()">
      <span style="flex:1;text-align:left;font-size:var(--fs-sm);color:var(--t2)">${S.qall?'只看前 6 条':'还有 '+(Q.length-6)+' 条 · 按等待时间排'}</span>
      <span style="color:var(--t3);font-size:var(--fs-sm)">${S.qall?'收起 ▴':'展开 ▾'}</span></button>`:''}
  </div>

  <div class="twocol">
    <div>
      <div class="sech"><span class="t">正在跑</span><span class="n num">${RUN.length}</span><span class="bar2"></span></div>
      ${RUN.map(r=>{const t=T.find(x=>x.id===r.id),a=AG[t.ag];return `<div class="rrow">
        <span class="avs" style="background:${a.c};width:24px;height:24px;font-size:var(--fs-xs)">${a.s}</span>
        <div class="bd"><div class="tt">${esc(t.t)}</div>
          <div class="rbar"><i id="rb-${r.id}" style="width:${r.p}%"></i></div>
          <div class="rmeta"><span id="rp-${r.id}" style="color:var(--t2)">${r.s}</span>
            <button style="color:var(--primary);font-size:var(--fs-xs)" onclick="openTrace('${t.ag}','${t.id}')">看它怎么想的 ↗</button></div></div>
        <button class="ib" onclick="go('thread','${r.id}')">›</button></div>`;}).join('')}
    </div>
    <div>
      <div class="sech"><span class="t">停住了</span><span class="n num">${STALL.length}</span><span class="bar2"></span>
        <span class="hint">在等人</span></div>
      ${STALL.map(x=>{const t=T.find(y=>y.id===x.id);return `<div class="rrow">
        <div class="bd"><div class="tt">${esc(t.t)}</div>
          <div class="rmeta"><span>${x.w} · ${x.who}</span><span>·</span><span>${x.h}</span></div></div>
        <button class="btn ghost sm" onclick="nudge('${x.id}','${x.who}','${esc(x.w)}')">催</button></div>`;}).join('')}
    </div>
  </div>

  <div class="sec">
    <button class="pline" onclick="go('prop')">
      <span class="n2 num">${pOpen().length}</span>
      <span style="flex:1"><span style="font-size:var(--fs-md);font-weight:600;display:block">条新提案等你看</span>
        <span style="font-size:var(--fs-sm);color:var(--t2)">${[...new Set(pOpen().map(p=>nick(p.by)))].join(' · ')||'暂无新提案'}</span></span>
      <span style="color:var(--primary);font-size:var(--fs-md)">去看 →</span></button>
  </div>

  <div class="sec">
    <button class="fold" onclick="S.fold=!S.fold;render()">
      <span class="tk">✓</span><span style="flex:1;text-align:left;font-size:var(--fs-md)">昨夜完成 <b class="num">${done.length}</b> 件 · 已沉淀到知识库</span>
      <span style="color:var(--t3);font-size:var(--fs-sm)">${S.fold?'收起 ▴':'展开 ▾'}</span></button>
    ${S.fold?done.map(t=>`<button class="drow" onclick="go('thread','${t.id}')">
      <span class="tk">✓</span><span class="tt">${esc(t.t)}</span>
      <span class="chip dom">${t.dom}</span><span class="tm">${t.up}</span></button>`).join(''):''}
  </div>
 </div>`;
}
function qrow(q){
 const over=q.sla&&q.wait>q.sla, soon=!over&&q.sla&&q.wait>q.sla*.6, g=AG[q.a.by];
 const bad=(q.vals||[]).some(v=>v.s==='bad'), warn=(q.vals||[]).some(v=>v.s==='warn');
 return `<div class="qrow ${over?'late':soon?'soon':''}">
  <div class="qthumb" style="${grad(q.g[0],q.g[1])}"><span class="ic">${q.ty.slice(0,2)}</span></div>
  <div class="qmid" onclick="${q.m1==='requester'?`goM1Review('${q.t.id}')`:`goArt('${q.t.id}','${q.a.id}',${q.oi})`}">
    <div class="tt">${esc(q.ttl)}</div>
    <div class="mt">${q.plat?`<span class="chip plat">${q.plat}</span>`:''}
      ${q.t.camp?`<span class="chip camp">${q.t.camp}</span>`:'<span class="chip mut">日常</span>'}
      <span class="chip dom">${q.t.dom}</span>
      ${bad?'<span class="chip" style="background:var(--danger-bg);color:var(--danger-fg);border:1px solid var(--danger-bd)">校验未过</span>':warn?'<span class="chip" style="background:var(--warn-bg);color:var(--warn-fg);border:1px solid var(--warn-bd)">有待确认</span>':''}</div>
    <div class="qvals"><span class="fr">${esc(todaySubtitle(q))}</span></div>
  </div>
  <div class="qact">
    <div class="qwait ${over?'late':soon?'soon':'ok'}">${over?'逾期 '+wtxt(q.wait-q.sla):q.sla?'剩 '+wtxt(q.sla-q.wait):'等待 '+wtxt(q.wait)}</div>
    ${q.ask?`<button class="btn sm" onclick="go('thread','${q.t.id}')">去回答</button>`
     :q.m1==='requester'?`<button class="btn sm" onclick="goM1Review('${q.t.id}')">去验收</button>`
     :bad?`<button class="btn sm" onclick="goArt('${q.t.id}','${q.a.id}',${q.oi})">去处理</button>`
       :`<button class="btn sm" onclick="qAct('${q.t.id}','${q.a.id}',${q.oi},1)">批准</button>`}
    ${q.ask||q.m1==='requester'?'':`<button class="btn ghost sm" onclick="qAct('${q.t.id}','${q.a.id}',${q.oi},0)">退回</button>`}
  </div></div>`;
}
function qAct(tid,aid,oi,ok){
 S.tid=tid;const [,a]=findArt(aid);
 if(a?.m1&&a.m1.stage==='owner'){m1OwnerDecision(aid,ok);render();return;}
 if(oi!==null&&oi!==undefined&&a.opts){a.opts[oi].s=ok?'done':'archived';}
 else {a.st=ok?'done':'run';if(!ok)a.v++;}
 const t=T.find(x=>x.id===tid);
 const still=t.arts.some(x=>x.mode==='options'?x.opts.some(o=>o.s==='review'):x.st==='review');
 t.st=still?'review':(ok?'done':'run');
 toast(ok?'已批准':'已退回 · 同一线程内生成新版本');render();
}
function goArt(tid,aid,oi){
 go('thread',tid);
 setTimeout(()=>{openDw(aid);if(oi!==null&&oi!==undefined){S.dtab=0;S.oo=oi;drawDw();}},80);
}
function goM1Review(tid){
 go('thread',tid);
 setTimeout(()=>document.getElementById('delivery-'+tid)?.scrollIntoView({behavior:'smooth',block:'start'}),80);
}
function tickToday(){
 if(S.liveT){clearInterval(S.liveT);S.liveT=null;}
 S.liveT=setInterval(()=>{
  let any=false;
  RUNS().forEach(r=>{const b=$('rb-'+r.id);if(!b)return;any=true;
   const st=RUNP[r.id];st.p=st.p>=97?Math.max(30,st.p-60):st.p+1;
   b.style.width=st.p+'%';const pc=$('rp-'+r.id);if(pc)pc.textContent=st.s;});
  if(!any){clearInterval(S.liveT);S.liveT=null;}
 },950);
}





/* ---- one conversation per thread, scoped ---- */
function allC(t){
 const out=(t.cmts||[]).map(c=>({...c,sc:null}));
 (t.arts||[]).forEach(a=>{
  (a.sub||[]).forEach(m=>out.push({...m,sc:{k:'a',aid:a.id,label:a.ttl||a.ty}}));
  (a.opts||[]).forEach((o,i)=>(o.sub||[]).forEach(m=>out.push({...m,sc:{k:'o',aid:a.id,i,label:o.t}})));
  (a.rows||[]).forEach((r,i)=>(r.sub||[]).forEach(m=>out.push({...m,sc:{k:'r',aid:a.id,i,label:r.n}})));
 });
 return out;
}
function scopeJump(sc){
 if(!sc)return;
 openDw(sc.aid);
 setTimeout(()=>{if(sc.k==='r'){S.dtab=0;toggleRow(sc.i);}else if(sc.k==='o'){S.dtab=0;toggleOpt(sc.i);}},60);
}
function convList(t){
 const all=allC(t);
 if(!all.length)return '<div style="font-size:var(--fs-sm);color:var(--t3);padding:var(--sp-1) 0 10px">还没有人说话。</div>';
 return all.map((c,idx)=>{
  const isA=!U[c.w];
  const who=isA?{n:nick(c.w)||c.w}:(U[c.w]||{n:c.w,c:'#8B7FC7',s:'?'});
  const sys=c.k==='sys';
  if(sys)return '<div class="syswrap">'+(c.sc?'<button class="scchip" onclick="scopeJump('+JSON.stringify(c.sc).replace(/"/g,'&quot;')+')">关于 '+esc(c.sc.label)+'</button>':'')
   +'<div class="sysmsg">'+esc(c.tx)+'</div></div>';
  return '<div class="cmt">'
   +(isA?AV(c.w,26):'<span class="avs" style="background:'+who.c+'">'+who.s+'</span>')
   +'<div class="bd"><div class="hd"><span class="nm">'+who.n+'</span>'
   +(isA?'<span class="chip dom">Agent</span>':'')
   +(c.k==='chg'?'<span class="chip" style="background:var(--warn-bg);color:var(--warn-fg);border:1px solid var(--warn-bd)">要求修改</span>':'')
   +(c.sc?'<button class="scchip" onclick="scopeJump('+JSON.stringify(c.sc).replace(/"/g,'&quot;')+')">关于 '+esc(c.sc.label)+' ↗</button>':'')
   +'<span class="tm">'+(c.at||'')+'</span></div>'
   +'<div class="tx">'+mHTML(c.tx)+'</div></div></div>';
 }).join('');
}

/* ============ mentions ============ */
const TEAM=[{k:'du',n:'dudu',r:'内容运营'},{k:'so',n:'Sophie',r:'策略'},{k:'br',n:'Brooks',r:'电商'},{k:'ar',n:'Ariel',r:'用户运营'},{k:'sam',n:'Sam',r:'KOL'}];
function mHTML(tx){return esc(tx).replace(/@([A-Za-z\u4e00-\u9fa5]+)/g,'<span class="mn">@$1</span>');}
function closeMentions(keepId){
 document.querySelectorAll('[id^="m-"]').forEach(el=>{if(el.id!=='m-'+keepId)el.innerHTML='';});
}
function mentionAnchor(inputId,anchor){
 if(anchor)return anchor;
 return [...document.querySelectorAll('[data-mention-toggle]')].find(b=>b.offsetParent!==null&&(b.getAttribute('onclick')||'').includes(`'${inputId}'`));
}
function showMent(inputId,peopleOnly=false,anchor=null){
 closeMentions(inputId);
 const el=$('m-'+inputId);if(!el)return;
 el.innerHTML=`<div class="mentions">
   <div class="mgrp">团队</div>
   ${TEAM.map(m=>`<button onclick="pickMent('${inputId}','${m.n}')">
     <span class="avs" style="background:${(U[m.k]||{c:'#8B7FC7'}).c};width:20px;height:20px;font-size:var(--fs-xs)">${m.n.slice(0,2).toUpperCase()}</span>
     <span><b>${m.n}</b> <span style="color:var(--t3);font-size:var(--fs-xs)">${m.r}</span></span></button>`).join('')}</div>`;
 const button=mentionAnchor(inputId,anchor),popup=el.querySelector('.mentions');
 if(button&&popup){
  const r=button.getBoundingClientRect(),w=popup.offsetWidth,h=popup.offsetHeight;
  popup.style.position='absolute';popup.style.bottom='auto';
  const parent=popup.offsetParent,pr=parent?parent.getBoundingClientRect():{left:0,top:0};
  const left=Math.max(12,Math.min(r.left,window.innerWidth-w-12));
  const top=r.top-h-6>=12?r.top-h-6:r.bottom+6;
  popup.style.left=(left-pr.left)+'px';
  popup.style.top=(top-pr.top)+'px';
 }
}
function pickMent(inputId,n){
 const i=$(inputId);i.value=i.value.replace(/@$/,'')+'@'+n+' ';$('m-'+inputId).innerHTML='';i.focus();
}
function onKey(e,inputId,peopleOnly=false){
 if(e.data==='@'||(e.target.value||'').endsWith('@'))showMent(inputId,peopleOnly);
 else if($('m-'+inputId))$('m-'+inputId).innerHTML='';
}
/* ============ clarifying questions ============ */
function pickAns(qi,oi){S.ans=S.ans||{};S.ans[qi]=oi;render();}
function setPptAsk(key,value){const t=T.find(x=>x.id===S.tid);if(!t?.ask?.ppt)return;t.ask[key]=value;render();}
function renderPptAsk(t){
 const a=t.ask;
 return `<div class="channel-ask ppt-ask">
  <div class="ppt-ask-field"><div class="ppt-ask-label">PPT 语言 <span>（默认中文）</span></div>
   <div class="ppt-ask-options"><button class="${a.language==='zh'?'on':''}" onclick="setPptAsk('language','zh')">CN 中文</button><button class="${a.language==='en'?'on':''}" onclick="setPptAsk('language','en')">GB English（英文）</button></div>
   <div class="ppt-ask-help">已选中文 · 大纲和最终生成的 PPT 内容均为中文。</div></div>
  <label class="ppt-ask-field"><span class="ppt-ask-label">视觉主题 <span>（非必填，留空则由 AI 自动选用）</span></span>
   <select onchange="setPptAsk('theme',this.value)"><option value="auto" ${a.theme==='auto'?'selected':''}>AI 自动选用</option><option value="business" ${a.theme==='business'?'selected':''}>简约商务</option><option value="brand" ${a.theme==='brand'?'selected':''}>品牌创意</option><option value="data" ${a.theme==='data'?'selected':''}>数据报告</option></select></label>
  <label class="ppt-ask-field"><span class="ppt-ask-label">版式模板 <span>（非必填，留空则由 AI 自动选用）</span></span>
   <select onchange="setPptAsk('template',this.value)"><option value="none" ${a.template==='none'?'selected':''}>不使用模板</option><option value="a80" ${a.template==='a80'?'selected':''}>A80PARIS 品牌模板</option><option value="review" ${a.template==='review'?'selected':''}>月度复盘模板</option></select></label>
 </div>`;
}
function askChannelTask(){const t=T.find(x=>x.id===S.tid);return t?.ask?.channels?t:null;}
function addAskChannel(){const t=askChannelTask();if(!t)return;t.ask.channels.push({platform:'小红书',qty:'1',products:[]});S.askProductRow=null;render();}
function removeAskChannel(i){const t=askChannelTask();if(!t||t.ask.channels.length<=1)return;t.ask.channels.splice(i,1);S.askProductRow=null;render();}
function setAskChannel(i,key,value){const t=askChannelTask();if(!t?.ask.channels[i])return;t.ask.channels[i][key]=value;}
function toggleAskProductMenu(i){S.askProductRow=S.askProductRow===i?null:i;render();}
function toggleAskProduct(i,product){
 const t=askChannelTask(),row=t?.ask.channels[i];if(!row)return;row.products=row.products||[];
 const at=row.products.indexOf(product);if(at>=0)row.products.splice(at,1);else row.products.push(product);render();
}
function channelProductText(row){const p=row.products||[];return p.length?`${esc(p[0])}${p.length>1?` <span class="more">+${p.length-1}</span>`:''}`:'不关联产品';}
function renderChannelAsk(t){
 const a=t.ask;
 return `<div class="channel-ask"><div class="channel-ask-head"><h4>目标渠道</h4><span class="spacer"></span><button class="channel-add" onclick="addAskChannel()">＋ 添加平台</button></div>
  <div class="channel-labels"><span>平台</span><span>文章数量</span><span>关联产品（可多选）</span><span></span></div>
  ${a.channels.map((r,i)=>`<div class="channel-row">
   <select onchange="setAskChannel(${i},'platform',this.value)">${a.platforms.map(x=>`<option ${r.platform===x?'selected':''}>${esc(x)}</option>`).join('')}</select>
   <input value="${esc(r.qty)}" placeholder="如 1 或 8-12" oninput="setAskChannel(${i},'qty',this.value)">
   <div class="channel-product"><button class="channel-product-trigger" onclick="toggleAskProductMenu(${i})"><span class="label">${channelProductText(r)}</span><span class="chev">⌄</span></button>
    ${S.askProductRow===i?`<div class="channel-product-menu">${a.products.map(p=>`<button onclick="toggleAskProduct(${i},'${p.replace(/'/g,"\\'")}')"><span class="tick">${(r.products||[]).includes(p)?'✓':''}</span><span>${esc(p)}</span></button>`).join('')}</div>`:''}</div>
   ${a.channels.length>1?`<button class="channel-del" title="删除这一行" onclick="removeAskChannel(${i})">×</button>`:'<span></span>'}
  </div>`).join('')}
 </div>`;
}
function sendAns(){
 const t=T.find(x=>x.id===S.tid);
 if(t.ask.ppt){
  const cfg={language:t.ask.language,theme:t.ask.theme,template:t.ask.template};
  const languageLabel=cfg.language==='en'?'GB English（英文）':'CN 中文';
  const themeLabel=({auto:'AI 自动选用',business:'简约商务',brand:'品牌创意',data:'数据报告'})[cfg.theme]||cfg.theme;
  const templateLabel=({none:'不使用模板',a80:'A80PARIS 品牌模板',review:'月度复盘模板'})[cfg.template]||cfg.template;
  t.pptConfig=cfg;t.answered=[`PPT 语言：${languageLabel}`,`视觉主题：${themeLabel}`,`版式模板：${templateLabel}`];t.st='run';t.up='刚刚';
  t.plan.steps[1]={l:'确认 PPT 生成设置',m:`${languageLabel} · ${themeLabel} · ${templateLabel}`,s:'ok',r:'刚刚'};
  t.plan.steps[2]={l:'生成并确认 PPT 大纲',m:'正在整理逐页标题、内容要点与配图意向',s:'act',r:'进行中'};
  t.live={t:'PPT Agent 正在生成大纲',el:'刚刚',sub:['正在整理创意主轴与页面结构…','正在生成逐页内容要点…','正在补充配图意向…'],p:48,tk:860};
  render();toast('设置已提交 · PPT Agent 正在生成大纲');
  setTimeout(()=>finishPptOutlineDemo(t.id),1200);return;
 }
 if(t.ask.channels){
  const rows=t.ask.channels,valid=/^\d+(?:\s*-\s*\d+)?$/;
  for(const r of rows){
   if(!valid.test((r.qty||'').trim())){toast('文章数量请填写数字或范围，例如 1、8-12');return;}
   if(r.qty.includes('-')){const [lo,hi]=r.qty.split('-').map(x=>parseInt(x.trim(),10));if(lo>hi){toast('文章数量范围的起始值不能大于结束值');return;}}
  }
  const qtyUnit=t.demoM1Pdp?'页':'篇';
  const summary=rows.map(r=>`${r.platform} ${r.qty} ${qtyUnit}${r.products.length?' · '+r.products.join('、'):' · 不关联产品'}`);
  if(t.demoM1Pdp){
   t.answered=summary;t.answeredChannels=rows.map(r=>({...r,products:[...r.products]}));t.st='run';t.up='刚刚';
   if(t.demoDualAgents){t.agentStates.pdp='运行中';t.agentStates.insp='等待详情页批准';}
   t.plan={...t.plan,v:(t.plan.v||1)+1,status:'running',tx:t.demoDualAgents?'目标平台、页面数量与关联产品已确认。详情页生成正在整理规划并生成内容；Brooks 批准后，店铺巡检再开始检查。':'目标平台、页面数量与关联产品已确认，详情页 Agent 正在整理当前规划表并生成详情页内容。',steps:[
    {l:'读取产品资料与天猫规则',m:'产品中心 · 详情页规范 · 11.11 活动',s:'ok',r:'6秒'},
    {l:'确认目标平台与关联产品',m:summary.join('；'),s:'ok',r:'刚刚'},
    {l:'整理详情页当前规划表',m:'屏幕结构 · 卖点顺序 · 产品露出',s:'act',r:'进行中'},
    {l:'生成详情页内容产出',m:'1 个 M1 产出',s:'todo',r:'—'},
    {l:'提交产品负责人审核',m:'Brooks 先批准，通过后再给 dudu 验收',s:'todo',r:'—'}]};
   if(t.demoDualAgents)t.plan.steps.splice(t.plan.steps.length-1,0,{l:'店铺巡检检查页面与上架风险',m:'等待详情页产出经 Brooks 批准',s:'todo',r:'未开始'});
   t.live={t:'详情页生成正在整理当前规划表',el:'刚刚',sub:['正在读取产品资料与天猫详情页规则'],p:40,tk:720};
   S.askProductRow=null;render();toast('信息已补齐 · 详情页 Agent 正在生成');
   setTimeout(()=>finishM1PdpDemo(t.id),3000);return;
  }
  if(t.demoSocial){
   t.answered=summary;t.answeredChannels=rows.map(r=>({...r,products:[...r.products]}));t.st='run';t.up='刚刚';
   t.plan={...t.plan,v:(t.plan.v||1)+1,status:'running',tx:'目标渠道与内容数量已确认，直接生成社媒文章。',steps:[
    {l:'读取品牌智库与关联产品',m:'品牌规范 · 产品资料 · 禁用词',s:'ok',r:'6秒'},
    {l:'确认目标渠道配置',m:summary.join('；'),s:'ok',r:'刚刚'},
    {l:'生成社媒内容',m:'标题 · 正文 · 话题 · 配图建议',s:'act',r:'进行中'},
    {l:'逐篇审批并交付',m:'全部批准后自动收口',s:'todo',r:'—'}]};
   t.live={t:'内容生成正在撰写 3 篇小红书文章',el:'刚刚',sub:['正在读取产品资料与品牌规则'],p:36,tk:620};
   S.askProductRow=null;render();toast('信息已补齐 · 正在生成社媒内容');
   setTimeout(()=>finishSocialDemo(t.id),3000);return;
  }
  t.answered=summary;t.answeredChannels=rows.map(r=>({...r,products:[...r.products]}));t.st='run';
  t.plan={v:2,tx:'目标渠道已补齐：'+summary.join('；')+'。',steps:[
   {l:'读取品牌智库与产品中心',m:'渠道规范与关联产品已读取',s:'ok',r:'6秒'},
   {l:'确认目标渠道配置',m:summary.join('；'),s:'ok',r:'刚刚'},
   {l:'生成内容计划',m:'按平台规则与文章数量拆分',s:'act',r:'进行中'},
   {l:'提交人工审批',m:'确认后进入内容生成',s:'todo',r:'—'}]};
  t.live={t:'内容生成正在整理新品内容计划',el:'刚刚',sub:['正在根据补充信息匹配渠道、产品与文章数量'],p:42,tk:480};
  S.askProductRow=null;render();toast('已补齐 · Agent 重新出计划');return;
 }
 const n=t.ask.qs.length;
 S.ans=S.ans||{};
 if(Object.keys(S.ans).length<n){toast('还有 '+(n-Object.keys(S.ans).length)+' 个没选');return;}
 const a=t.ask.qs.map((q,i)=>q.o[S.ans[i]]);
 t.answered=a;t.st='run';t.plan={v:2,tx:'信息已补齐。按「'+a[0]+'」在「'+a[1]+'」出 '+a[3]+'，目标是'+a[2]+'。',steps:[
  {l:'读取品牌智库与产品中心',m:a[0],s:'ok',r:'6秒'},
 {l:'识别信息缺口',m:'已由你补齐 4 项',s:'ok',r:'2秒'},
 {l:'生成 3 个创意方向',m:a[1]+' · 目标 '+a[2],s:'act',r:'进行中'},
 {l:'批准后批量生成 '+a[3],m:'—',s:'todo',r:'—'}]};
 t.live={t:'内容生成正在整理创意方向',el:'刚刚',sub:['正在根据补充信息生成方向与执行计划'],p:42,tk:480};
 S.ans={};render();toast('已补齐 · Agent 重新出计划');
}

function finishPptOutlineDemo(tid){
 const t=T.find(x=>x.id===tid);if(!t||t.arts?.some(a=>a.mode==='pptoutline'))return;
 const pages=[
  {title:'项目背景与传播命题',chapter:'开篇',points:'品牌：A80PARIS 抖音首营，美妆造型工具品类\n活动周期：2026-07-27—2026-08-31，预算 ¥20,000\n核心命题：让 A80PARIS 被认知为「拍照友好的潮流造型器」\n执行阵地以抖音品牌官号为主，无达人合作',visual:''},
  {title:'市场机会与用户洞察',chapter:'洞察',points:'年轻用户把造型工具视为出片过程的一部分\n抖音内容更需要第一眼可感知的视觉记忆点\n高饱和色、光影变化和真实自拍场景更容易形成讨论',visual:'用户场景与内容关键词组合'},
  {title:'唯一创意主轴：荧光出片',chapter:'策略',points:'镜头先拍造型器，再拍人，荧光色就是出片道具\n产品既完成造型，也成为画面中的视觉符号\n所有内容围绕同一主轴变化，避免有限预算被分散',visual:'产品与人物前后镜头的双画面构图'},
  {title:'内容支柱与选题结构',chapter:'策略',points:'造型前后对比：突出使用结果\n荧光色出片挑战：强化视觉记忆\n真实场景教程：降低使用门槛',visual:'三列内容支柱卡片'},
  {title:'五阶段内容节奏',chapter:'执行',points:'筹备期：统一视觉与内容口径\n蓄水期：测试封面和开场镜头\n引爆期：集中发布高潜内容\n收割期：承接主页访问与产品兴趣\n复盘期：沉淀可复用内容方法',visual:'横向五阶段时间轴'},
  {title:'内容发布与资源安排',chapter:'执行',points:'品牌官号发布 3 条结构化短视频\n同一拍摄日完成核心素材采集\n优先保障灯光、造型和剪辑节奏\n不安排达人合作，把预算集中到品牌资产',visual:'发布排期与资源分配表'},
  {title:'预算分配',chapter:'执行',points:'拍摄与场地：¥8,000\n造型与道具：¥4,000\n后期制作：¥5,000\n内容测试与机动：¥3,000',visual:'预算环形图与金额列表'},
  {title:'内容效果衡量',chapter:'衡量',points:'停留：3 秒留存与平均观看时长\n互动：点赞、收藏、评论与分享\n兴趣：主页访问和产品相关搜索\n复用：可进入品牌素材库的有效片段数量',visual:'四项核心指标卡'},
  {title:'风险与应对',chapter:'保障',points:'荧光视觉喧宾夺主：始终保持产品为画面焦点\n内容同质化：变化人物、场景与镜头节奏\n预算有限：一次拍摄拆分多条内容\n转化链路弱：统一主页承接与产品信息',visual:'风险—应对双列表'},
  {title:'执行清单与时间节点',chapter:'落地',points:'确认创意与脚本\n完成场景、造型和拍摄准备\n集中拍摄并完成三版剪辑\n分阶段发布、观察并优化\n活动结束后一周完成复盘',visual:'带负责人和日期的任务清单'},
  {title:'总结与展望',chapter:'总结',points:'以「荧光色出片道具」创意主轴贯穿 3 条内容\n通过统一内容结构实现品牌认知快速建立\n低预算、单平台、精品化打法验证种草转化路径\n为后续内容迭代与达人矩阵积累经验',visual:''}
 ];
 const artifact={id:'a-ppt-outline-demo',mode:'pptoutline',ty:'PPT 大纲',ttl:'方向一：荧光出片，造型即内容',deckTitle:'A80PARIS 抖音种草传播方案：荧光出片，造型即内容',summary:'围绕「荧光出片，造型即内容」展开，以抖音品牌官号为核心阵地，形成从创意表达、内容节奏到预算与效果衡量的完整传播方案。',by:'ppt',v:1,st:'review',pv:'wd',g:['#A78BFA','#7C3AED'],ex:'围绕「荧光出片，造型即内容」展开，以抖音品牌官号为核心阵地，形成从创意表达、内容节奏到预算与效果衡量的完整传播方案。',pages,sub:[]};
 t.live=null;t.arts=[artifact];t.outputCount=1;t.st='review';t.up='刚刚';
 t.plan.steps[2]={l:'生成并确认 PPT 大纲',m:'已生成 1 个创意方向 · 11 页大纲待确认',s:'act',r:'刚刚'};
 if(S.view==='thread'&&S.tid===tid)render();else syncAppr();toast('PPT 大纲已生成 · 等待确认');
}
function finishSocialDemo(id){
 const t=T.find(x=>x.id===id);if(!t||!t.demoSocial||t.arts?.length)return;
 const product=t.answeredChannels?.flatMap(x=>x.products||[])[0]||'Evo1.1 轻盈营养体验';
 const aid='social-'+Date.now();
 t.live=null;t.st='review';t.up='刚刚';t.outputCount=3;
 t.plan.steps=[
  {l:'读取品牌智库与关联产品',m:'品牌规范 · 产品资料 · 禁用词',s:'ok',r:'6秒'},
  {l:'确认目标渠道配置',m:(t.answered||[]).join('；'),s:'ok',r:'刚刚'},
  {l:'生成社媒内容 3 篇',m:'标题 · 正文 · 话题 · 配图建议',s:'ok',r:'42秒'},
  {l:'逐篇审批并交付',m:'3 篇待审批',s:'act',r:'待审批'}];
 t.arts=[{id:aid,mode:'plans',demoSocial:true,ty:'社媒内容',ttl:'小红书社媒内容 · 3 篇',by:'gen',v:1,st:'review',pv:'doc',plat:'小红书',g:['#C4B5FD','#8B5CF6'],vals:[],plans:[
  {t:'预算有限时，我更看重这 3 个真实体验',e:'从真实使用频率、肤感和坚持成本切入，让产品自然进入日常生活。',img:'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=900&q=85',body:`预算有限时，我反而不会盲目追新品，而是更在意一款产品能不能真正进入日常。\n\n第一，使用频率够不够高；第二，肤感能不能让我坚持；第三，它是不是解决了真实需求。${product} 给我的感受不是瞬间夸张的变化，而是每天使用都没有负担。\n\n#真实护肤体验 #日常护肤 #理性种草`,s:'review',g:['#A78BFA','#7C3AED'],sub:[]},
  {t:'连续使用 3 周后，我只记录看得见的变化',e:'以时间线记录真实感受，减少夸张承诺，用细节建立可信度。',img:'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=85',body:`这次没有只写第一次使用的感受，我把 ${product} 连续用了 3 周。\n\n第 1 周主要观察肤感和吸收速度；第 2 周看日常状态是否更稳定；到了第 3 周，再记录真正能看见的细节变化。没有滤镜式结论，只有每周真实发生的体验。\n\n#三周实测 #护肤记录 #真实分享`,s:'review',g:['#FDA4AF','#E11D48'],sub:[]},
  {t:'今年双十一，我不再囤一堆用不完的护肤品',e:'从减少无效囤货出发，用使用场景和活动权益完成自然收口。',img:'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=900&q=85',body:`今年双十一，我给自己的原则是：不再因为优惠囤一堆用不完的东西。\n\n真正值得买的，是能稳定用完、适合当前需求，而且价格确实合适的产品。${product} 被我留下，是因为它的使用场景清楚，日常也能持续使用。最后再看活动权益，而不是为了满减反过来制造需求。\n\n#双十一理性买 #护肤清单 #低预算种草`,s:'review',g:['#7DD3FC','#0284C7'],sub:[]}
 ],sub:[]}];
 if(S.view==='thread'&&S.tid===id)render();else syncAppr();toast('3 篇社媒内容已生成 · 等待逐篇审批');
}
function finishM1PdpDemo(id){
 const t=T.find(x=>x.id===id);if(!t||!t.demoM1Pdp||t.arts?.length)return;
 const aid='m1-pdp-'+Date.now();
 t.live=null;t.st='review';t.up='刚刚';t.outputCount=1;
 if(t.demoDualAgents){t.agentStates.pdp='待 Brooks 审批';t.agentStates.insp='等待详情页批准';}
 t.plan.steps=[
  {l:'读取产品资料与天猫规则',m:'产品中心 · 详情页规范 · 11.11 活动',s:'ok',r:'6秒'},
  {l:'确认目标平台与关联产品',m:(t.answered||[]).join('；'),s:'ok',r:'刚刚'},
  {l:'整理详情页当前规划表',m:'共 10 屏 · 当前规划表可编辑',s:'ok',r:'38秒'},
  {l:'生成详情页内容产出',m:'A8O 修护精华 30ml · 详情页 v4',s:'ok',r:'52秒'},
  {l:'提交产品负责人审核',m:'待 Brooks 先审批',s:'act',r:'待审批'}];
 if(t.demoDualAgents)t.plan.steps.splice(t.plan.steps.length-1,0,{l:'店铺巡检检查页面与上架风险',m:'等待详情页产出经 Brooks 批准',s:'todo',r:'未开始'});
 t.arts=[{id:aid,mode:'pdpseq',ty:'详情页内容',plat:'天猫',ttl:'A8O 修护精华 30ml · 天猫详情页 v4',by:'pdp',v:1,st:'review',sourceDirection:1,pv:'wd',g:['#67E8F9','#0891B2'],
  ex:'围绕换季敏感、干燥泛红等真实场景，先建立问题共鸣，再用核心卖点和实验依据完成详情页转化。',vals:[],
  m1:{stage:'owner',kind:'pdp',owner:'br',requester:'du',ownerAt:null,ownerDecision:null,requesterAt:null,score:null,feedback:'',reviewHistory:[]},
  directionOption:{t:'方向一：成分证据先行',e:'首屏直接建立产品与成分认知，依次展开核心成分、实验数据、技术机制与适用人群；整体更偏专业理性，适合强化产品背书。',body:'首屏以产品与核心成分作为视觉中心，用一句明确的修护主张快速建立认知。\n\n第二至第四屏依次解释敏感肌常见问题、核心成分作用与技术机制，并用实验数据支撑产品功效。\n\n后续补充适用人群、使用方法、规格信息与购买利益点，让页面从专业证据自然过渡到购买决策。',referenceImage:undefined},
  planRows:directionPlanRows(0),
  sub:[{w:'br',tx:'首屏先明确核心成分与修护结论，实验数据放到第三屏承接。',at:'刚刚'}]}];
 if(S.view==='thread'&&S.tid===id)render();else syncAppr();toast('详情页内容已生成 · 等待 Brooks 审批');
}
function finishDualInspection(id){
 const t=T.find(x=>x.id===id);if(!t?.demoDualAgents||t.arts?.some(a=>a.m1?.kind==='inspection'))return;
 const aid='m1-inspection-'+Date.now();
 t.live=null;t.st='review';t.up='刚刚';t.outputCount=2;t.agentStates.insp='待 Brooks 审批';
 t.arts.push({id:aid,ty:'店铺巡检报告',ttl:'A8O 修护精华 30ml · 页面与上架风险检查',by:'insp',v:1,st:'review',pv:'doc',g:['#A7F3D0','#059669'],
  ex:'已完成商品资料、页面信息与上架风险检查；当前未发现阻塞上架的问题，2 项信息建议在发布前复核。',
  body:'检查结论：当前详情页内容可继续进入验收。\n\n已检查商品名称、规格、卖点表述、产品图片、活动信息与上架要求。未发现阻塞项；建议发布前再次确认活动价格与赠品口径。',
  inspection:{severity:'正常',source:'Digate',category:'详情页',metric:'检查项',actual:'6 / 6 通过',expected:'无阻塞项',date:'刚刚',basis:'天猫详情页与上架规则',versionLabel:'详情页发布前巡检',updated:'刚刚'},
  vals:[{l:'商品资料',v:'完整',s:'ok'},{l:'页面信息',v:'一致',s:'ok'},{l:'上架风险',v:'无阻塞项',s:'ok'},{l:'发布前复核',v:'2 项',s:'warn'}],
  m1:{stage:'owner',kind:'inspection',owner:'br',requester:'du',ownerAt:null,ownerDecision:null,requesterAt:null,score:null,feedback:'',reviewHistory:[]},sub:[]});
 if(t.plan?.steps){const step=t.plan.steps.find(s=>s.l.includes('店铺巡检'));if(step){step.s='ok';step.r='已完成';}const last=t.plan.steps[t.plan.steps.length-1];if(last){last.s='act';last.r='等待巡检报告审批';}}
 if(S.view==='thread'&&S.tid===id)render();else syncAppr();toast('店铺巡检已完成 · 等待 Brooks 审批');
}
