'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const paths = {
    house:'M3 10l9-7 9 7v10H3z M9 20v-7h6v7', 'columns-3':'M3 4h18v16H3z M9 4v16 M15 4v16',bot:'M5 8h14v12H5z M12 8V4 M10 4h4 M8 13h.01 M16 13h.01 M9 17h6', 'book-open':'M12 5c-4-2-7-2-10-1v15c3-1 6-1 10 1 4-2 7-2 10-1V4c-3-1-6-1-10 1v15', 'chart-no-axes-combined':'M4 3v17h17 M7 15l4-5 4 2 5-7', 'settings-2':'M4 7h7 M15 7h5 M4 17h3 M11 17h9 M11 4v6 M7 14v6', unplug:'M8 3v5 M16 3v5 M5 8h14v3c0 4-3 6-7 6s-7-2-7-6z M12 17v4', 'shield-check':'M12 3l8 3v6c0 5-8 9-8 9s-8-4-8-9V6z M8 12l3 3 5-6',plus:'M12 5v14 M5 12h14', 'flask-conical':'M9 3h6 M10 3v7L4 20h16l-6-10V3 M7 15h10', 'arrow-up-right':'M6 18L18 6 M6 6h12v12',search:'M20 20l-5-5 M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0', 'rotate-ccw':'M3 10a9 9 0 1 1 2 8 M3 4v6h6',info:'M12 11v6 M12 7h.01 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',check:'M5 12l4 4L19 6',x:'M6 6l12 12 M6 18L18 6', 'circle-check':'M8 12l3 3 5-6 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0', 'triangle-alert':'M12 3L2 21h20z M12 9v5 M12 17h.01', 'clock-3':'M12 8v5l3 2 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',link:'M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-2 2 M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l2-2', 'chevron-right':'M9 5l7 7-7 7', 'file-clock':'M14 2H4v20h16V8z M14 2v6h6 M12 12v4l3 1', 'shield':'M12 3l8 3v6c0 5-8 9-8 9s-8-4-8-9V6z', 'circle-x':'M9 9l6 6 M9 15l6-6 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0'
  };
  const icon = name => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name] || paths.link}"/></svg>`;
  function icons(root = document) { root.querySelectorAll('[data-icon]').forEach(el => { if (!el.querySelector('svg')) el.insertAdjacentHTML('afterbegin', icon(el.dataset.icon)); }); }
  const platforms = [
    {id:'website',name:'SEO官方网站',mark:'◎',desc:'添加品牌官网，先登记站点，再按需连接后台。支持多个不同站点。',resources:[]},
    {id:'meta',name:'Meta',mark:'∞',desc:'管理品牌的社交与广告账号连接。具体产品线与权限待确认。',resources:['A8OPARIS 品牌主页','A8OPARIS 广告账号']},
    {id:'xhs',name:'小红书',mark:'小红书',desc:'连接品牌内容账号。商业业务、账号范围与接入方式待确认。',resources:['A8OPARIS 品牌账号','A8OPARIS 内容资源']},
    {id:'tmall',name:'天猫',mark:'TMALL',desc:'集中管理店铺账号授权。店铺范围与服务场景待确认。',resources:['A8OPARIS 旗舰店','A8OPARIS 店铺资料']},
    {id:'jd',name:'京东',mark:'JD',desc:'管理店铺连接及可访问资源。应用资质和权限待确认。',resources:['A8OPARIS 京东旗舰店','A8OPARIS 店铺资料']},
    {id:'shopify',name:'Shopify',mark:'S',desc:'管理品牌店铺连接。应用接入范围与授权方式待确认。',resources:['a8oparis-demo.myshopify.com','A8OPARIS 店铺资料']},
    {id:'douyin',name:'抖音',mark:'♪',desc:'连接内容或电商账号。具体业务线与开放平台待确认。',resources:['A8OPARIS 官方账号','A8OPARIS 内容资源']},
    {id:'pdd',name:'拼多多',mark:'拼',desc:'管理品牌店铺的连接与授权，实际接入范围待确认。',resources:['A8OPARIS 拼多多店铺']},
    {id:'youzan',name:'有赞',mark:'赞',desc:'管理品牌商城的连接与授权，实际接入范围待确认。',resources:['A8OPARIS 有赞商城']},
    {id:'kuaishou',name:'快手',mark:'快',desc:'管理品牌内容或店铺账号，实际业务线及接入范围待确认。',resources:['A8OPARIS 快手账号']}
  ];
  const statusNames = {connected:'已连接',reauth:'需重新授权',failed:'连接失败',disconnected:'已断开',unconnected:'未连接',pending:'接入待确认'};
  const state = {tab:'connections',role:'admin',query:'',platform:'all',status:'all',connections:[],drawer:null,drawerTab:'info',flow:null,returnFocus:null,drawerFocus:null,serial:0};
  let flowTimer, toastTimer;
  function initialConnections() { return [
    {id:'meta-brand',platform:'meta',name:'Meta · 品牌主账号',account:'A8OPARIS Brand · 示例账号',status:'connected',reason:'最近一次模拟验证成功，示例授权范围可用。',resources:['A8OPARIS 品牌主页'],scope:['账号基本信息','已选资源的只读访问'],verified:'今天 10:42',authTime:'2026-10-12 14:30',expiry:'平台未提供（演示）'},
    {id:'xhs-brand',platform:'xhs',name:'小红书 · 官方品牌账号',account:'A8OPARIS 官方 · 示例账号',status:'reauth',reason:'示例授权已失效，需要由管理员重新确认账号与授权范围。',resources:['A8OPARIS 品牌账号'],scope:['账号基本信息','已选资源的只读访问'],verified:'今天 09:18',authTime:'2026-09-16 09:00',expiry:'2026-10-15（模拟已到期）'},
    {id:'shopify-store',platform:'shopify',name:'Shopify · 品牌独立站',account:'a8oparis-demo.myshopify.com · 示例',status:'connected',reason:'最近一次模拟验证成功，示例授权范围可用。',resources:['a8oparis-demo.myshopify.com'],scope:['账号基本信息','已选资源的只读访问'],verified:'今天 10:35',authTime:'2026-10-10 16:20',expiry:'未知（演示）'},
    {id:'douyin-brand',platform:'douyin',name:'抖音 · 品牌内容账号',account:'A8OPARIS 抖音 · 示例账号',status:'failed',reason:'模拟资源验证失败，尚未形成可用连接。请核对账号并重新尝试。',resources:['A8OPARIS 官方账号'],scope:['账号基本信息'],verified:'今天 09:05',authTime:'未完成',expiry:'未知（演示）'},
    {id:'website-brand',platform:'website',name:'A8OPARIS · 品牌官网',account:'https://a8oparis.example.com',address:'https://a8oparis.example.com',domain:'a8oparis.example.com',language:'中文',cms:'wordpress',status:'connected',reason:'预置官网连接成功示例：WordPress 授权已模拟完成，未连接真实官网、未获得真实权限。',resources:[],scope:['WordPress 后台访问（模拟，实际权限待确认）'],verified:'今天 10:40',authTime:'2026-10-19 10:30',expiry:'未知（演示）',wpAddress:'https://a8oparis.example.com',wpUser:'xdigate-demo',seo:'auto',config:{description:'A8OPARIS 品牌官网，面向消费者介绍品牌理念、产品信息与日常护肤内容。此内容为预置演示。',competitors:'',keywords:'品牌护肤\n日常护理'}}
  ].map(c => ({...c,checks:initialChecks(c),...(c.id==='website-brand'?{analytics:siteDemoData()}:{}),owner:'A8OPARIS',client:'客户 u2c · 项目 a80',logs:[{action:c.status==='connected'?'模拟授权验证成功':c.status==='reauth'?'模拟授权失效':'模拟连接验证失败',actor:'系统',time:'今天 '+c.verified.split(' ').pop(),result:c.status==='connected'?'成功':c.status==='reauth'?'需处理':'失败',note:c.reason},{action:'发起模拟授权',actor:'dudu',time:c.authTime==='未完成'?'今天 09:04':c.authTime,result:'示例记录',note:'模拟授权流程；未发送真实平台请求。'}]})).sort((a,b)=>Number(b.id==='website-brand')-Number(a.id==='website-brand')); }
  const platform = id => platforms.find(p => p.id === id);
  const connection = id => state.connections.find(c => c.id === id);
  // Fixed-viewBox artwork prevents long wordmarks and font glyphs from overflowing.
  const platformArtwork = {
    pdd:'<path d="M12 20 4 12C-2 5 7 1 12 7c5-6 14-2 8 5l-8 8Z"/><path d="M8 10h8M8 14h8M10 8v9M14 8v9"/>',
    youzan:'<path d="M5 7h14l2 14H3L5 7Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2M8 14l3 3 5-5"/>',
    kuaishou:'<rect x="3" y="7" width="14" height="14" rx="4"/><circle cx="7" cy="4" r="2"/><circle cx="13" cy="4" r="2"/><circle cx="10" cy="14" r="3"/><path d="m17 11 4-2v10l-4-2"/>',
    meta:'<path d="M3 15c-2-6 2-11 5-8l8 10c3 3 7-2 5-7-2-5-5-5-8 0l-4 7c-3 4-7 2-6-2Z"/>',
    xhs:'<text x="12" y="15" text-anchor="middle" fill="currentColor" stroke="none" font-size="8" font-weight="700" font-family="Noto Sans SC,system-ui,sans-serif">小红书</text>',
    tmall:'<path d="M4 10V4l5 3a12 12 0 0 1 6 0l5-3v6c2 2 2 6 0 8-4 4-12 4-16 0-2-2-2-6 0-8Z" fill="currentColor" stroke="none"/><path d="M7 12v2m10-2v2" stroke="white" stroke-width="1.8"/>',
    jd:'<text x="12" y="16" text-anchor="middle" fill="currentColor" stroke="none" font-size="13" font-weight="700" font-family="Sora,system-ui,sans-serif">JD</text>',
    shopify:'<path d="M5 7h14l2 14H3L5 7Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/><path d="M14 11c-4-2-6 2-2 3s2 5-2 3"/>',
    douyin:'<path d="M14 3v12.5a4 4 0 1 1-3-3.9V7h3c2 0 4 1 5 2V5c-2 0-4-1-5-2Z" fill="currentColor" stroke="none"/>',
    website:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>'
  };
  const logo = p => `<span class="platform-logo ${p.id}" role="img" aria-label="${esc(p.name)}"><svg class="platform-artwork" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${platformArtwork[p.id] || platformArtwork.website}</svg></span>`;
  const pill = status => `<span class="pill ${status}"><span class="pill-dot"></span>${statusNames[status]}</span>`;
  function now() { return new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Tokyo',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date())+'（东京时间）'; }
  function log(c,action,result,note,actor='dudu') { c.logs.unshift({action,actor,result,note,time:now()}); }
  function toast(message) { clearTimeout(toastTimer); $('toast').textContent=message; $('toast').classList.add('visible'); toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),3500); }
  function canManage() { if(state.role==='admin') return true; toast('只读角色无法管理连接，请切换为演示管理员。'); return false; }
  function render() {
    state.connections.filter(c=>c.platform==='website'&&c.linkedConnection).forEach(c=>{c.status=effectiveSiteStatus(c);});
    const counts = {all:state.connections.length,connected:state.connections.filter(c=>c.status==='connected').length,attention:state.connections.filter(c=>['reauth','failed'].includes(c.status)).length,platforms:new Set(state.connections.filter(c=>c.status!=='disconnected').map(c=>c.platform)).size};
    $('overview').innerHTML = [['连接总数',counts.all,'全部示例连接记录','link'],['已连接',counts.connected,'示例范围内授权可用','circle-check'],['需要处理',counts.attention,'授权失效或连接失败','triangle-alert'],['已配置平台',counts.platforms,'仅为演示数据，非实际接入','unplug']].map(([label,n,note,i],idx)=>`<div class="metric ${idx===2?'warn':''}"><div class="metric-label">${label}${icon(i)}</div><div class="metric-value">${n}</div><p class="metric-note">${note}</p></div>`).join('');
    $('connection-count').textContent=counts.all;
    const visible=state.connections.filter(c=>(state.platform==='all'||c.platform===state.platform)&&(state.status==='all'||c.status===state.status)&&[c.name,c.account,platform(c.platform).name].some(v=>v.toLowerCase().includes(state.query.toLowerCase()))).sort((a,b)=>Number(b.id==='website-brand')-Number(a.id==='website-brand'));
    $('result-count').textContent=`共 ${visible.length} 个连接`;
    $('connection-list').innerHTML=visible.length?`<div class="table-header"><span>连接名称 / 账号</span><span>归属</span><span>授权状态</span><span class="verified-cell">最近验证</span><span>操作</span></div>`+visible.map(connectionRow).join(''):`<div class="empty-state">${icon('search')}<h3>没有符合条件的连接</h3><p>试试其他关键词，或清除筛选条件。</p><button class="btn" data-action="clear-filters">清除筛选</button></div>`;
    $('role-label').textContent=state.role==='admin'?'管理员':'只读角色';
    $('new-connection').disabled=state.role!=='admin';
    $('role-toggle').setAttribute('aria-label',state.role==='admin'?'切换为只读角色':'切换为演示管理员');
  }
  function connectionRow(c) {
    const account=['meta-brand','xhs-brand','shopify-store','douyin-brand'].includes(c.id)?c.account.replace(/\s*·\s*示例(?:账号)?$/,''):c.account;
    return `<article class="connection-row"><div class="account-cell">${logo(platform(c.platform))}<div class="account-text"><button class="connection-title" data-action="detail" data-id="${c.id}">${esc(c.name)}</button><p class="account-sub">${esc(account)}</p></div></div><div class="ownership-cell"><div class="cell-main">${esc(c.owner)}</div></div><div class="status-cell">${pill(c.status)}</div><div class="verified-cell"><div class="cell-main">${esc(c.verified)}</div></div><div class="action-cell"><button class="row-action" data-action="detail" data-id="${c.id}">${c.status==='reauth'?'处理授权':c.status==='failed'?'查看原因':'查看详情'} ${icon('chevron-right')}</button></div></article>`;
  }
  function switchTab() { state.tab='connections'; }
  function kv(rows) { return `<div class="detail-kv">${rows.map(([k,v])=>`<div class="kv-row"><span>${esc(k)}</span><span>${esc(v)}</span></div>`).join('')}</div>`; }
  function openDetail(id) { if(!connection(id))return;state.drawerFocus=document.activeElement;state.drawer=id;state.drawerExpanded=false;state.drawerTab='info';$('detail-drawer').hidden=false;$('drawer-backdrop').hidden=false;document.body.classList.add('overlay-open');renderDrawer();$('detail-drawer').querySelector('button').focus(); }
  function renderDrawer() {
    const c=connection(state.drawer);if(!c)return;const p=platform(c.platform);
    $('detail-drawer').classList.toggle('website-drawer',c.platform==='website');
    $('detail-drawer').classList.toggle('drawer-expanded',!!state.drawerExpanded);
    if(c.platform==='website'){renderSiteDrawer(c);return;}
    $('detail-drawer').innerHTML=`<div class="drawer-header"><div class="drawer-title-row">${logo(p)}<div><h2 id="drawer-title">${esc(c.name)}</h2><p>${p.name} · 示例连接</p></div>${drawerWidthButton()}<button class="icon-button close-drawer" data-action="close-drawer" aria-label="关闭详情">${icon('x')}</button></div></div><div class="drawer-tabs" role="tablist" aria-label="连接详情"><button role="tab" aria-selected="${state.drawerTab==='info'}" class="${state.drawerTab==='info'?'selected':''}" data-action="drawer-info">连接信息</button><button role="tab" aria-selected="${state.drawerTab==='logs'}" class="${state.drawerTab==='logs'?'selected':''}" data-action="drawer-logs">日志记录 <span>(${c.logs.length+(c.checks||[]).length})</span></button></div><div class="drawer-body">${state.drawerTab==='logs'?logsHTML(c):infoHTML(c)}</div><div class="drawer-footer">${c.status!=='disconnected'?`<button class="btn primary" data-action="reauth" data-id="${c.id}" ${state.role!=='admin'?'disabled':''}>${icon('rotate-ccw')}重新授权</button><button class="btn" data-action="disconnect" data-id="${c.id}" ${state.role!=='admin'?'disabled':''}>断开连接</button>`:`<button class="btn primary" data-action="reauth" data-id="${c.id}" ${state.role!=='admin'?'disabled':''}>重新连接（模拟）</button>`}<small>${state.role==='admin'?'仅为本次会话演示':'只读角色 · 无管理权限'}</small></div>`;
  }
  function infoHTML(c) { return `<div class="status-box ${c.status}">${icon(c.status==='reauth'?'triangle-alert':c.status==='connected'?'shield-check':'info')}<div>${pill(c.status)}<p>${esc(c.reason)}</p></div></div><section class="detail-section"><h3>基本信息</h3>${kv([['连接名称',c.name],['外部账号',c.account],['归属',c.client],['授权操作人','dudu · 演示管理员'],['授权时间',c.authTime],['有效期',c.expiry],['最近验证',c.verified+' · 模拟'],['接入方式','待确认；本页不执行真实授权']])}</section><section class="detail-section"><h3>授权范围 <span class="neutral-pill">示例，非平台正式权限</span></h3>${c.scope.map(s=>`<div class="scope-item">${icon('check')}<div><b>${esc(s)}</b><p>仅用于展示最小权限确认流程，不代表平台支持该权限。</p></div></div>`).join('')}</section><section class="detail-section"><h3>允许访问的资源</h3>${c.resources.map(s=>`<div class="scope-item">${icon('book-open')}<div><b>${esc(s)}</b><p>演示资源 · 已选范围</p></div></div>`).join('')}</section><p class="small-note">平台决定实际授权结果。连接状态不代表业务数据已同步；未知有效期不会被推定为永久授权。</p>`; }
  function drawerWidthLabel() {
    const path=state.drawerExpanded?'M13 5h6v6M19 5l-7 7M11 19H5v-6M5 19l7-7':'M9 4H4v5M4 4l7 7M15 20h5v-5M20 20l-7-7';
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${path}"/></svg><span>${state.drawerExpanded?'收起':'加宽'}</span>`;
  }
  function drawerWidthButton() {
    return `<button type="button" id="drawer-width-toggle" class="drawer-width-toggle" data-action="toggle-drawer-width" aria-pressed="${!!state.drawerExpanded}" aria-label="${state.drawerExpanded?'恢复抽屉宽度':'加宽抽屉'}">${drawerWidthLabel()}</button>`;
  }
  function toggleDrawerWidth() {
    if(!state.drawer)return;
    state.drawerExpanded=!state.drawerExpanded;
    $('detail-drawer').classList.toggle('drawer-expanded',state.drawerExpanded);
    const button=$('drawer-width-toggle');
    button.innerHTML=drawerWidthLabel();
    button.setAttribute('aria-pressed',String(state.drawerExpanded));
    button.setAttribute('aria-label',state.drawerExpanded?'恢复抽屉宽度':'加宽抽屉');
  }
  function logsHTML(c) {
    const checks=c.checks||[],success=checks.filter(l=>l.result==='成功').length,failed=checks.filter(l=>l.result==='异常').length;
    const rate=checks.length?Math.round(success/checks.length*100)+'%':'—';
    const tone=result=>/失败|异常/.test(result)?'error':/成功|已保存|已创建|已登记|已停用/.test(result)?'success':/待确认|需处理/.test(result)?'warning':'neutral';
    const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
    const stamp=l=>{const date=l.time.match(/\d{4}-\d{2}-\d{2}/)?.[0]||today;const time=l.time.match(/\d{2}:\d{2}(?::\d{2})?/)?.[0]||'00:00';return date+' '+time;};
    const rows=[...checks.map(l=>({...l,kind:'每日检测'})),...c.logs.map(l=>({...l,kind:'授权操作'}))].sort((a,b)=>stamp(b).localeCompare(stamp(a)));
    return `<div class="audit-notice">${icon('info')}<p>预置日志仅为演示，不代表平台审计记录。计划每天检测一次连接；尚未接入真实定时任务，新操作使用东京时间。</p></div><div class="connector-run-head"><div><b>连接检测概览</b><span>已展示 ${checks.length} 次检测 · 仅统计检测记录</span></div><span>检测周期 1d（计划）</span></div><div class="connector-run-summary" aria-label="连接检测统计"><div><span>成功率</span><b>${rate}</b></div><div><span>成功</span><b>${success}</b></div><div><span>异常</span><b>${failed}</b></div></div><h3 class="connector-run-title">日志记录 <span>共 ${rows.length} 条</span></h3><div class="connector-run-list" aria-label="日志记录">${rows.length?rows.map(l=>`<article class="connector-run-item"><span class="connector-run-dot ${tone(l.result)}" aria-hidden="true"></span><div><div class="connector-run-line"><b>${esc(l.time)}</b><span class="connector-run-status ${tone(l.result)}">${esc(l.result)}</span><span class="connector-run-kind">${l.kind}</span></div><p class="connector-run-action">${esc(l.action)} · ${esc(l.actor)}</p><p class="connector-run-note">${esc(l.note)}</p></div></article>`).join(''):'<p class="small-note audit-empty">暂无日志记录</p>'}</div>`;
  }
  function initialChecks(c) {
    const count=c.platform==='website'?1:3;
    return Array.from({length:count},(_,i)=>{
      const failed=i===0&&['reauth','failed'].includes(c.status);
      return {action:'每日连接检测',actor:'系统',time:`2026-10-${19-i} 10:00:00`,result:failed?'异常':'成功',note:failed?'模拟检测：授权校验异常，连接可能已失效，请重新确认授权。':'模拟检测：连接验证通过，示例授权范围可用。'};
    });
  }
  function closeDrawer() { state.drawer=null;$('detail-drawer').hidden=true;$('drawer-backdrop').hidden=true;if($('modal-backdrop').hidden)document.body.classList.remove('overlay-open');state.drawerFocus?.focus(); }
  function openModal() { state.returnFocus=document.activeElement;$('flow-modal').classList.remove('site-modal');$('modal-backdrop').hidden=false;document.body.classList.add('overlay-open'); }
  function modalFrame(title,body,footer,subtitle='模拟流程 · 不跳转真实平台') { $('flow-modal').innerHTML=`<div class="modal-header"><div><h2 id="modal-title">${title}</h2><p>${subtitle}</p></div><button class="icon-button" data-action="close-modal" aria-label="关闭弹窗">${icon('x')}</button></div><div class="modal-body">${body}</div><div class="modal-footer">${footer}</div>`;$('flow-modal').querySelector('input,select,button')?.focus(); }
  function closeModal(message) { clearTimeout(flowTimer);state.flow=null;$('flow-modal').innerHTML='';$('modal-backdrop').hidden=true;if(!state.drawer)document.body.classList.remove('overlay-open');if(state.returnFocus?.isConnected)state.returnFocus.focus();else if(state.drawer)$('detail-drawer').querySelector('button')?.focus();else $('new-connection').focus();if(message)toast(message); }
  function startFlow(platformId=null,id=null) {
    if(platformId==='website'||(id&&connection(id)?.platform==='website')){if(id)startSiteBackend(id);else startSite();return;}
    if(!canManage())return;const c=id?connection(id):null;state.flow={type:'connect',step:platformId||c?1:0,platform:platformId||c?.platform||null,id,name:c?.name||'',account:c?.account||'',resources:c?[...c.resources]:[],error:null,created:null};openModal();renderFlow();
  }
  function renderFlow() {
    const f=state.flow;if(!f||f.type!=='connect')return;
    if(f.platform==='website'&&f.step>0){startSite();return;}
    const p=platform(f.platform);const back=`<button class="btn" data-action="close-modal">取消</button>`;
    if(f.step===0)modalFrame('新建连接',`<p class="small-note" style="margin-bottom:15px">选择平台，填写信息后即可模拟授权。SEO官方网站使用独立的站点表单。</p><div class="platform-options">${platforms.map(p=>`<button class="platform-option" data-action="choose-platform" data-platform="${p.id}">${logo(p)}<span><b>${p.name}</b><small>${p.id==='website'?'填写站点表单':'账号连接 · 模拟授权'}</small></span>${icon('chevron-right')}</button>`).join('')}</div>`,back);
    if(f.step===1)modalFrame(f.id?'重新授权 · '+p.name:'连接 '+p.name,`<div class="selected-platform">${logo(p)}<div><b>${p.name}</b><p>默认归属 A8OPARIS · 项目 a80</p></div></div><label class="form-field">连接名称 <span class="required">*</span><input id="connection-name" maxlength="60" value="${esc(f.name||p.name+' · A8OPARIS')}" placeholder="为这个连接命名"></label><label class="form-field">平台账号 <span class="required">*</span><input id="platform-account" maxlength="100" autocomplete="off" value="${esc(f.account)}" placeholder="请输入演示账号"></label><label class="form-field">模拟密码 <span class="required">*</span><input id="platform-password" type="password" autocomplete="new-password" maxlength="100" placeholder="任意演示字符，请勿输入真实密码"></label><div class="inline-note">仅演示账号表单与授权过程，不连接真实平台。模拟密码不保存、不发送、不写入日志；正式授权方式待确认。</div>${f.error?`<p class="error-message" role="alert">${esc(f.error)}</p>`:''}`,`<button class="btn" data-action="close-modal">取消</button><button class="btn primary" data-action="authorize">模拟授权</button>`);
    if(f.step===3)modalFrame('模拟授权结果',`<div class="flow-result"><div class="result-icon">${icon('check')}</div><h3>${f.id?'连接已更新':'连接已建立'}</h3><p>仅为演示结果，没有连接真实 ${p.name} 账号。</p>${kv([['连接名称',f.name],['授权资源',f.resources.length+' 个 · 示例'],['归属','A8OPARIS · 项目 a80'],['状态','已连接（模拟）']])}</div>`,`<button class="btn" data-action="finish-flow">完成</button><button class="btn primary" data-action="view-created">查看连接</button>`);
  }
  function authorize(fail=false) {
    if(!canManage())return;const f=state.flow;if(!f||f.type!=='connect'||f.step!==1)return;
    f.name=$('connection-name').value.trim();f.account=$('platform-account').value.trim();
    if(!f.name||!f.account||!$('platform-password').value){f.error=!f.name?'请输入连接名称。':!f.account?'请输入平台账号。':'请输入任意演示密码，请勿使用真实密码。';$('platform-password').value='';renderFlow();return;}
    $('platform-password').value='';f.error=null;f.step=2;
    modalFrame('正在验证模拟授权',`<div class="flow-result"><div class="result-icon">${icon('shield-check')}</div><h3>正在验证账号与权限</h3><p>正在演示授权结果校验，不会请求真实平台。</p><div class="progress" role="progressbar" aria-label="模拟授权验证中"><span></span></div></div><div class="split-actions"><button data-action="authorization-denied">模拟用户拒绝</button><button data-action="authorization-failed">模拟验证失败</button></div>`,`<button class="btn" data-action="cancel-authorization">取消授权</button>`);
    flowTimer=setTimeout(()=>{if(state.flow!==f)return;if(fail){f.step=1;f.error='模拟验证失败：未能确认账号授权，请重试。';renderFlow();return;}finishBinding();},1200);
  }
  function finishBinding() { if(!canManage())return;const f=state.flow;if(!f||f.type!=='connect'||f.step!==2)return;const duplicate=state.connections.find(c=>c.platform===f.platform&&c.account.toLowerCase()===f.account.toLowerCase()&&c.status!=='disconnected'&&c.id!==f.id);if(duplicate){f.step=1;f.error='该平台账号已有连接，请进入已有连接重新授权。';renderFlow();return;}let c=f.id?connection(f.id):null;if(!c){c={id:'demo-'+(++state.serial),platform:f.platform,owner:'A8OPARIS',client:'客户 u2c · 项目 a80',logs:[]};state.connections.unshift(c);}Object.assign(c,{name:f.name,account:f.account,status:'connected',reason:'模拟账号验证成功；没有连接真实平台。',resources:[...platform(f.platform).resources.slice(0,1)],scope:['账号基本信息（模拟）'],authTime:now(),expiry:'未知（演示）',verified:now()});log(c,f.id?'模拟重新授权':'模拟建立连接','成功','完成模拟账号验证；未发送真实请求，未保存密码。');f.resources=c.resources;f.created=c.id;f.step=3;render();if(state.drawer===c.id)renderDrawer();renderFlow(); }
  function startDisconnect(id) { if(!canManage())return;const c=connection(id);if(!c||c.status==='disconnected')return;state.flow={type:'disconnect',id};openModal();modalFrame('断开连接',`<div class="status-box reauth">${icon('triangle-alert')}<div><h3>断开后，将停止该连接的后续使用</h3><p>${esc(c.name)}</p></div></div>${kv([['本地操作','停用此示例连接'],['平台侧授权','单独反馈撤销结果'],['影响范围','关联任务影响待确认；不保证外部在途动作已停止']])}<div class="inline-note">本地断开不等于平台授权已撤销，也不会删除外部数据。</div><label class="check-label"><input id="revoke-failure" type="checkbox" checked>模拟平台侧撤销失败（体验双结果反馈）</label>`,`<button class="btn" data-action="close-modal">取消</button><button class="btn danger" data-action="confirm-disconnect">确认断开（模拟）</button>`); }
  function confirmDisconnect() { if(!canManage())return;const f=state.flow;if(!f||f.type!=='disconnect')return;const c=connection(f.id);const failed=$('revoke-failure').checked;c.status='disconnected';c.reason=failed?'本地已断开，平台授权撤销未确认（模拟）。真实接入时可能需要前往平台处理。':'本地已断开，平台撤销成功（模拟）；未执行真实撤销。';c.verified=now();log(c,'模拟断开连接','本地已停用',c.reason);log(c,'模拟平台侧撤销',failed?'失败':'成功',failed?'示例外部撤销失败；本地已停用，不自动恢复。':'仅模拟结果，未发送真实请求。','系统');render();if(state.drawer)renderDrawer();closeModal(c.reason); }
  function clearFilters() { state.query='';state.platform='all';state.status='all';$('search').value='';$('platform-filter').value='all';$('status-filter').value='all';render(); }
  function reset() { closeModal();closeDrawer();seoDrafts.clear();state.connections=initialConnections();state.role='admin';state.serial=0;clearFilters();switchTab('connections');toast('演示已重置；仅影响本页会话。'); }
  const cmsNames={wordpress:'WordPress',shopify:'Shopify',custom:'其他／自建',unknown:'暂不清楚'};
  function normalizeSiteAddress(raw) {
    const value=raw.trim();
    if(!value||/\s/.test(value))throw new Error('请输入有效的官网地址，例如 https://example.com。');
    const url=new URL(/^[a-z][a-z\d+.-]*:/i.test(value)?value:'https://'+value);
    if(!['http:','https:'].includes(url.protocol)||url.username||url.password||url.port||!url.hostname.includes('.')||url.hostname.endsWith('.')||/^[\d.]+$/.test(url.hostname)||url.hostname==='localhost')throw new Error('请填写公开官网域名，不要输入账号密码、端口或本机地址。');
    const hostname=url.hostname.toLowerCase();
    if(!hostname.split('.').every(label=>/^[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?$/i.test(label)))throw new Error('官网域名格式不正确，请检查后重试。');
    return {address:'https://'+hostname,domain:hostname.replace(/^www\./,'')};
  }
  function startSite(id=null) {
    if(!canManage())return;
    const c=id?connection(id):null;
    state.flow={type:'site',id,name:c?.name||'',address:c?.address||'',owner:c?.owner||'A8OPARIS',language:c?.language||'中文',cms:c?.cms||'wordpress',description:c?.config.description||'',competitors:c?.config.competitors||'',keywords:c?.config.keywords||'',wpAddress:c?.wpAddress||'',wpUser:c?.wpUser||'',seo:c?.seo||'auto',error:null};openModal();renderSiteForm();
  }
  function renderSiteForm() {
    const f=state.flow;
    $('flow-modal').classList.add('site-modal');
    modalFrame(f.id?'编辑站点':'新建站点',`<form autocomplete="off" onsubmit="return false"><fieldset class="site-fieldset"><legend>基本信息</legend><div class="site-form-grid"><label class="form-field">站点名称<span class="required">*</span><input id="site-name" maxlength="60" value="${esc(f.name)}" placeholder="例如：Acme 官网"></label><label class="form-field">域名<span class="required">*</span><input id="site-address" maxlength="500" value="${esc(f.address)}" placeholder="acme.com"><small class="small-note">只保留域名本身；完整网址中的协议、路径与 www 前缀会在提交时去掉。</small></label><label class="form-field">主语言<select id="site-language">${['中文','英文','其他'].map(v=>`<option ${f.language===v?'selected':''}>${v}</option>`).join('')}</select></label><label class="form-field">CMS<select id="site-cms">${Object.entries(cmsNames).map(([k,v])=>`<option value="${k}" ${f.cms===k?'selected':''}>${v}</option>`).join('')}</select></label></div></fieldset><fieldset class="site-fieldset"><legend>站点专属说明（可选）</legend><label class="form-field">这个站点是做什么的 <span class="field-counter" id="site-description-count">${f.description.length}/2000</span><textarea id="site-description" maxlength="2000" rows="4" placeholder="例如：本站面向海外采购商，介绍品牌与产品。说明服务对象、主要市场，以及内容表达的边界。">${esc(f.description)}</textarea></label><p class="small-note">作为站点内容与分析的背景信息。只保存演示配置，不在本页执行 AI 分析。</p></fieldset><fieldset class="site-fieldset"><legend>分析配置（可选）</legend><div class="site-form-grid"><label class="form-field">竞品域名 <span class="small-note">（每行一个）</span><textarea id="site-competitors" maxlength="2000" rows="3" placeholder="competitor-a.com&#10;competitor-b.com">${esc(f.competitors)}</textarea><small class="small-note">用于展示关键词及外链分析配置，不执行实际分析。</small></label><label class="form-field">种子关键词 <span class="small-note">（每行一个）</span><textarea id="site-keywords" maxlength="2000" rows="3" placeholder="B2B 获客&#10;GEO 优化">${esc(f.keywords)}</textarea><small class="small-note">可补充站点相关的业务关键词，不生成分析结果。</small></label></div></fieldset><fieldset class="site-fieldset" id="site-wp-fields" ${f.cms!=='wordpress'?'hidden disabled':''}><legend>WORDPRESS 连接（可选，填写后模拟授权）</legend><div class="site-form-grid"><label class="form-field">站点地址<input id="site-wp-address" maxlength="500" value="${esc(f.wpAddress)}" placeholder="https://acme.com"><small class="small-note">与上方域名一致的 HTTPS 首页地址，不是 /wp-admin。</small></label><label class="form-field">用户名<input id="site-wp-user" maxlength="100" autocomplete="off" value="${esc(f.wpUser)}" placeholder="xdigate-demo"><small class="small-note">请输入演示用户名，不使用真实账号。</small></label><label class="form-field">应用密码（模拟）<input id="site-wp-password" type="password" maxlength="100" autocomplete="new-password" placeholder="任意演示字符，请勿输入真实密钥"><small class="small-note">不保存、不发送、不写入日志；错误或取消后请重新输入。</small></label><label class="form-field">SEO 插件<select id="site-seo">${[['auto','自动检测（模拟）'],['yoast','Yoast SEO'],['rankmath','Rank Math'],['none','无／其他']].map(([key,name])=>`<option value="${key}" ${f.seo===key?'selected':''}>${name}</option>`).join('')}</select><small class="small-note">只记录选择，不检测插件、不自动发布文章。</small></label></div></fieldset><p class="small-note">默认归属 ${esc(f.owner)} · 当前品牌项目。仅本次会话演示，所有真实接入能力待确认。</p><p id="site-form-error" class="error-message" role="alert" ${!f.error?'hidden':''}>${esc(f.error||'')}</p></form>`,`<button class="btn" data-action="close-modal">取消</button><button class="btn primary" data-action="save-site">${f.id?'保存站点':'创建站点'}</button>`,'SEO官方网站 · 表单与授权均为模拟');
  }
  function saveSite() {
    if(!canManage()||state.flow?.type!=='site')return;
    const f=state.flow;Object.assign(f,{name:$('site-name').value.trim(),address:$('site-address').value.trim(),language:$('site-language').value,cms:$('site-cms').value,description:$('site-description').value.trim().slice(0,2000),competitors:$('site-competitors').value.trim().slice(0,2000),keywords:$('site-keywords').value.trim().slice(0,2000),wpAddress:$('site-wp-address').value.trim(),wpUser:$('site-wp-user').value.trim(),seo:$('site-seo').value});
    try{
      if(!f.name)throw new Error('请填写站点名称。');
      if(!cmsNames[f.cms])throw new Error('请选择有效的建站系统。');
      const normalized=normalizeSiteAddress(f.address);
      if(state.connections.some(c=>c.platform==='website'&&c.domain===normalized.domain&&c.id!==f.id))throw new Error('该域名已添加，请从已有官网编辑，避免重复登记。');
      const wantsWP=f.cms==='wordpress'&&Boolean(f.wpAddress||f.wpUser||$('site-wp-password').value);
      if(wantsWP){
        if(!f.wpAddress||!f.wpUser||!$('site-wp-password').value)throw new Error('WordPress 连接为可选；如需模拟授权，请填齐站点地址、演示用户名和模拟应用密码。');
        const wp=normalizeSiteAddress(f.wpAddress);
        if(!/^https:\/\//i.test(f.wpAddress)||!/^(https:\/\/[^/?#]+)\/?$/i.test(f.wpAddress)||wp.domain!==normalized.domain)throw new Error('WordPress 地址需为与上方域名一致的 HTTPS 首页地址，不含路径或参数。');
      }
      $('site-wp-password').value='';f.error=null;f.submitting=true;
      modalFrame(wantsWP?'正在模拟 WordPress 授权':'正在创建站点',`<div class="flow-result"><div class="result-icon">${icon('shield-check')}</div><h3>${wantsWP?'正在验证演示连接信息':'正在保存站点资料'}</h3><p>不访问真实官网，不检测插件，也不执行发布。</p><div class="progress" role="progressbar" aria-label="站点创建模拟进度"><span></span></div></div>${wantsWP?'<div class="split-actions"><button data-action="site-authorization-failed">模拟授权失败</button></div>':''}`,`<button class="btn" data-action="close-modal">取消</button>`);
      flowTimer=setTimeout(()=>{if(state.flow===f&&canManage())completeSite(normalized,wantsWP);},1200);
    }catch(error){$('site-wp-password').value='';f.error=error.message.includes('Invalid URL')?'官网地址格式不正确，请检查后重试。':error.message;$('site-form-error').textContent=f.error;$('site-form-error').hidden=false;$('site-form-error').scrollIntoView?.({block:'nearest'});}
  }
  function completeSite(normalized,wantsWP) {
    const f=state.flow;if(!f||f.type!=='site'||!f.submitting)return;
    let c=f.id?connection(f.id):null;const existing=Boolean(c);
    if(!c){c={id:'site-'+(++state.serial),platform:'website',owner:f.owner,client:`品牌 ${f.owner} · 项目 a80（演示）`,logs:[]};state.connections.unshift(c);}
    Object.assign(c,{name:f.name,account:'https://'+normalized.domain,address:'https://'+normalized.domain,domain:normalized.domain,language:f.language,cms:f.cms,status:wantsWP?'connected':['custom','unknown'].includes(f.cms)?'pending':'unconnected',reason:wantsWP?'WordPress 连接模拟成功；未获得真实权限，未执行发布。':'站点已创建，未配置后台授权；真实接入方式待确认。',resources:[],scope:wantsWP?['WordPress 后台访问（模拟，实际权限待确认）']:[],authTime:wantsWP?now():'未授权',expiry:wantsWP?'未知（演示）':'未授权',verified:wantsWP?now():'尚未验证',wpAddress:wantsWP?f.wpAddress:'',wpUser:wantsWP?f.wpUser:'',seo:f.seo,config:{description:f.description,competitors:f.competitors,keywords:f.keywords}});
    delete c.linkedConnection;log(c,existing?'更新官网站点':'创建官网站点',wantsWP?'模拟授权成功':'已创建',wantsWP?'完成表单及模拟授权；未保存密码，未发送真实请求。':'完成表单登记；没有后台授权。');
    const id=c.id;closeModal();clearFilters();if(state.drawer)closeDrawer();openDetail(id);toast(wantsWP?'站点已创建并完成模拟授权。':'站点资料已保存，尚未授权后台。');
  }
  function effectiveSiteStatus(c) {
    if(c.linkedConnection){const linked=connection(c.linkedConnection);return linked?.status==='connected'?'connected':linked?.status==='reauth'?'reauth':'unconnected';}
    return c.status;
  }
  function renderSiteDrawer(c) {
    const status=effectiveSiteStatus(c), linked=c.linkedConnection?connection(c.linkedConnection):null;
    let body=state.drawerTab==='logs'?logsHTML(c):`<div class="status-box">${icon('info')}<div>${pill(status)}<p>${esc(linked?(status==='connected'?'已关联有效的 Shopify 示例连接，无需重复授权。':'关联的 Shopify 连接当前不可用，请先处理原连接。'):c.reason)}</p></div></div><section class="detail-section"><h3>站点资料</h3>${kv([['站点名称',c.name],['官网地址',c.address],['所属品牌／项目',c.client],['主语言',c.language],['建站系统',cmsNames[c.cms]],['后台授权',linked?linked.name:status==='connected'?'已模拟授权':'尚未授权'],['授权时间',c.authTime],['最近验证',c.verified]])}</section>${linked?`<button class="btn" data-action="linked-detail" data-id="${linked.id}">查看关联 Shopify 连接 ${icon('arrow-up-right')}</button>`:''}<section class="detail-section"><h3>授权边界</h3><p class="small-note">登记网址不代表授权。真实接入方式、权限及所有权验证仍待确认。演示不索取任何密码或应用密钥，不抓取站点，也不执行自动发布。</p></section>`;
    if(state.drawerTab==='info')body=body.replace('<section class="detail-section">',siteOverviewHTML(c)+'<section class="detail-section">');
    if(state.drawerTab==='rankings')body=siteRankingsHTML(c);
    if(state.drawerTab==='published')body=sitePublishedHTML(c);
    if(state.drawerTab==='seo')body=siteSEOHTML(c);
    const backend='编辑站点', data=siteAnalytics(c);
    $('detail-drawer').innerHTML=`<div class="drawer-header"><div class="drawer-title-row">${logo(platform('website'))}<div><p class="website-eyebrow">SEO官方网站 · ${esc(cmsNames[c.cms])}</p><h2 id="drawer-title">${esc(c.name)}</h2><p>${esc(c.domain)}</p></div>${drawerWidthButton()}<div class="website-header-status">${pill(status)}</div><button class="icon-button close-drawer" data-action="close-drawer" aria-label="关闭详情">${icon('x')}</button></div></div><div class="drawer-tabs website-tabs" role="tablist" aria-label="官网详情">${[['info','站点信息'],['rankings',`关键词排名 (${data.keywords.length})`],['published',`已发布内容 (${data.posts.length})`],['logs',`日志记录 (${c.logs.length+(c.checks||[]).length})`],['seo','SEO 设置']].map(([tab,label])=>`<button id="website-tab-${tab}" role="tab" aria-controls="website-tab-panel" aria-selected="${state.drawerTab===tab}" class="${state.drawerTab===tab?'selected':''}" data-action="drawer-${tab}">${label}</button>`).join('')}</div><div class="drawer-body website-body" id="website-tab-panel" role="tabpanel" aria-labelledby="website-tab-${state.drawerTab}">${body}</div><div class="drawer-footer">${state.drawerTab==='seo'?`<button class="btn primary" data-action="save-seo" ${state.role!=='admin'?'disabled':''}>保存设置</button><button class="btn" data-action="reset-seo" ${state.role!=='admin'?'disabled':''}>恢复默认</button><small>仅本次会话保存 · 不执行真实调度</small>`:`<button class="btn primary" data-action="site-backend" data-id="${c.id}" ${state.role!=='admin'?'disabled':''}>${backend}</button>${status==='connected'?`<button class="btn" data-action="${linked?'unlink-site':'disconnect'}" data-id="${c.id}" ${state.role!=='admin'?'disabled':''}>${linked?'解除站点关联':'断开连接'}</button>`:''}<small>本次会话演示 · 不连接真实官网</small>`}</div>`;
  }
  const seoDrafts=new Map();
  const seoPrompt='你是一名资深 SEO 内容策略专家，为 {{domain}} 撰稿。请结合下方品牌知识背景与关键词聚类，进行 {{locale}} 内容创作，目标是在 Google 等搜索引擎获得关键词与长尾词排名。\n\n聚类主题：{{clusterName}}\n关键词：{{keywords}}\n内容缺口：{{gap}}\n\n语气与语言\n使用自然的商务语言——自信且具体，避免学术腔调或过于随意。目标语言为英文时，按母语者的自然商务英语写。\n写作风格应体现实际从业经验，而非泛泛的博客写手风格。\n避免 AI 套路式表达，避免空泛开场、重复总结和未经核实的数据。\n\n围绕用户问题提供具体、有依据、可执行的内容，引用品牌已有资料，不编造事实。';
  function defaultSEO(){return {enabled:true,weekday:'1',hour:'08',minute:'00',monthday:'1',linkHour:'07',linkMinute:'00',quality:0.70,retries:3,images:true,prompt:seoPrompt,engines:['DeepSeek','Kimi','通义']};}
  function seoDraft(c){if(!seoDrafts.has(c.id))seoDrafts.set(c.id,JSON.parse(JSON.stringify(c.seoSettings||defaultSEO())));return seoDrafts.get(c.id);}
  function seoSchedule(s,links=false){return links?`${Number(s.linkMinute)} ${Number(s.linkHour)} ${s.monthday} * *`:`${Number(s.minute)} ${Number(s.hour)} * * ${s.weekday}`;}
  function siteSEOHTML(c){
    const s=seoDraft(c),disabled=state.role!=='admin'?'disabled':'',options=(count,start=0)=>Array.from({length:count},(_,i)=>String(i+start).padStart(2,'0'));
    const select=(key,values)=>`<select id="seo-${key}" data-seo="${key}" aria-label="${({weekday:'流程执行星期',hour:'流程执行小时',minute:'流程执行分钟',monthday:'外链分析日期',linkHour:'外链分析小时',linkMinute:'外链分析分钟'})[key]}">${values.map(v=>{const [value,label]=Array.isArray(v)?v:[v,v];return `<option value="${value}" ${String(s[key])===String(value)?'selected':''}>${label}</option>`;}).join('')}</select>`;
    return `<div class="seo-settings">
    <fieldset class="seo-fields" ${disabled}><section class="seo-section"><h3>调度</h3><label class="seo-check">启用自动调度<input type="checkbox" id="seo-enabled" data-seo="enabled" ${s.enabled?'checked':''}></label><fieldset class="seo-schedules" ${s.enabled?'':'disabled'}>
    <div class="seo-field"><label>流程执行时间</label><p>每周跑一轮：审计／技术分析，并刷新排名与域名评级（DR）。</p><div class="seo-time">每 ${select('weekday',[['1','周一'],['2','周二'],['3','周三'],['4','周四'],['5','周五'],['6','周六'],['0','周日']])}${select('hour',options(24))}<span>:</span>${select('minute',options(60))}<small>中国时间（UTC+8）</small><code id="seo-week-cron">${seoSchedule(s)}</code></div></div>
    <div class="seo-field"><label>外链分析时间</label><p>外链缺口分析为独立外部调用，与流程分开排期；默认每月一次。</p><div class="seo-time">每月 ${select('monthday',Array.from({length:31},(_,i)=>[String(i+1),String(i+1)]))} 日 ${select('linkHour',options(24))}<span>:</span>${select('linkMinute',options(60))}<small>中国时间（UTC+8）</small><code id="seo-month-cron">${seoSchedule(s,true)}</code></div><p>选择 29–31 日时，不存在该日期的月份跳过。</p></div></fieldset></section>
    <section class="seo-section"><h3>内容质量阈值</h3><div class="seo-field"><label class="seo-value" for="seo-quality">中文质量阈值 <output id="seo-quality-value">${Number(s.quality).toFixed(2)}</output></label><p>低于此值提示 ZH quality flag。</p><input type="range" id="seo-quality" data-seo="quality" min="0" max="1" step="0.01" value="${s.quality}"></div><div class="seo-field"><label class="seo-value" for="seo-retries">自动重新生成次数上限 <output id="seo-retries-value">${s.retries}</output></label><p>仅限制系统自动重试，手动驳回重写或在讨论区要求再写一篇不受此限制。</p><input type="range" id="seo-retries" data-seo="retries" min="0" max="6" step="1" value="${s.retries}"></div><label class="seo-check">为每篇文章生成配图 <small>正文首图 + WordPress 特色图</small><input id="seo-images" type="checkbox" data-seo="images" ${s.images?'checked':''}></label></section>
    <section class="seo-section"><div class="seo-section-head"><h3>文章生成提示词</h3><button type="button" class="text-button" data-action="reset-seo-prompt">恢复默认</button></div><p class="seo-placeholders">可用占位符：${['domain','locale','clusterName','keywords','gap'].map(key=>`<code>{{${key}}}</code>`).join(' ')}</p><textarea id="seo-prompt" data-seo="prompt" rows="10" maxlength="12000" aria-label="文章生成提示词">${esc(s.prompt)}</textarea><p class="small-note">输出字段要求（标题／正文／meta／FAQ／评分等）由系统自动追加，无需也无法在此改动。</p></section>
    <section class="seo-section"><h3>GEO 引擎</h3><div class="inline-note seo-geo-note">GEO 引用采样当前尚未启用：结果不展示，也不参与定时调度。以下选择仅保存演示偏好，不触发引擎调用。正式启用需联系系统技术侧。</div><div class="seo-engines">${['DeepSeek','Kimi','通义'].map(name=>`<button type="button" class="btn ${s.engines.includes(name)?'primary':''}" aria-pressed="${s.engines.includes(name)}" data-action="seo-engine" data-engine="${name}">${name}</button>`).join('')}</div></section></fieldset><p id="seo-error" class="error-message" role="alert"></p></div>`;
  }
  function updateSEO(target){
    const c=connection(state.drawer),key=target.dataset?.seo;if(!c||c.platform!=='website'||state.drawerTab!=='seo'||state.role!=='admin'||!key)return;
    const s=seoDraft(c);if(!Object.hasOwn(s,key)||key==='engines')return;
    s[key]=['enabled','images'].includes(key)?!!target.checked:['quality','retries'].includes(key)?Number(target.value):String(target.value);
    if(key==='enabled'){renderDrawer();$('seo-enabled').focus();return;}
    if(key==='quality')$('seo-quality-value').textContent=Number(s.quality).toFixed(2);
    if(key==='retries')$('seo-retries-value').textContent=s.retries;
    $('seo-week-cron').textContent=seoSchedule(s);$('seo-month-cron').textContent=seoSchedule(s,true);
  }
  function seoAction(action,el){
    const c=connection(state.drawer);if(!c||c.platform!=='website'||state.drawerTab!=='seo'||!canManage())return;
    const s=seoDraft(c);
    if(action==='seo-engine'){const name=el.dataset.engine;if(!['DeepSeek','Kimi','通义'].includes(name))return;s.engines=s.engines.includes(name)?s.engines.filter(x=>x!==name):[...s.engines,name];renderDrawer();return;}
    if(action==='reset-seo-prompt'){s.prompt=seoPrompt;renderDrawer();toast('提示词已恢复默认，保存后生效于本次会话。');return;}
    if(action==='reset-seo'){seoDrafts.set(c.id,defaultSEO());renderDrawer();toast('已恢复默认，请保存设置。');return;}
    if(action!=='save-seo')return;
    const validInt=(value,min,max)=>Number.isInteger(Number(value))&&Number(value)>=min&&Number(value)<=max;
    if(!s.prompt.trim()||s.prompt.length>12000||!Number.isFinite(s.quality)||s.quality<0||s.quality>1||!validInt(s.retries,0,6)||!validInt(s.weekday,0,6)||!validInt(s.monthday,1,31)||!validInt(s.hour,0,23)||!validInt(s.linkHour,0,23)||!validInt(s.minute,0,59)||!validInt(s.linkMinute,0,59)){$('seo-error').textContent='请填写有效的执行时间、质量阈值和非空提示词。';return;}
    c.seoSettings=JSON.parse(JSON.stringify(s));log(c,'更新 SEO 设置','成功','已保存本次会话的调度、质量阈值、提示词与引擎偏好；未启动真实调度或外部调用。');renderDrawer();toast('SEO 设置已保存（本次会话）。');
  }
  function siteDemoData() {
    const keywords=[
      ['A8OPARIS 品牌',880,12,['品牌','导航'],1,1,1],['A8OPARIS 官网',720,8,['品牌','导航'],1,2,2],['A8OPARIS 护肤',590,18,['品牌','商业'],3,4,5],['日常护肤步骤',2400,42,['信息'],6,8,9],['护肤品怎么选择',1900,38,['信息','商业'],8,12,8],['护肤品使用顺序',3600,46,['信息'],11,15,14],['换季护肤指南',1300,31,['信息'],14,18,16],['旅行护肤清单',880,25,['信息','商业'],18,22,21],['护肤产品搭配',1600,37,['信息','商业'],23,27,24],['品牌护肤理念',480,22,['品牌','信息'],28,null,30],['护肤产品介绍',720,29,['商业'],35,41,33],['日常护肤常见问题',590,24,['信息'],null,null,null]
    ].map(([term,volume,kd,intent,google,baidu,previous])=>({term,volume,kd,intent,google,baidu,previous}));
    const posts=[
      {id:'brand-story',title:'认识 A8OPARIS：品牌理念与日常护理',path:'/journal/brand-story',target:'A8OPARIS 品牌',best:'A8OPARIS 官网',date:'2026-10-18',excerpt:'品牌介绍页面示例，用于展示已发布内容与关键词之间的关联。'},
      {id:'daily-routine',title:'日常护肤步骤：让护理更有条理',path:'/journal/daily-routine',target:'日常护肤步骤',best:'A8OPARIS 护肤',date:'2026-10-15',excerpt:'日常护理主题文章的示例摘要。本页只预览演示内容，不提供专业护理建议。'},
      {id:'product-guide',title:'选购前先了解：产品信息阅读指南',path:'/journal/product-guide',target:'护肤品怎么选择',best:'护肤品怎么选择',date:'2026-10-12',excerpt:'产品信息说明文章的预置示例，非真实已发布页面。'},
      {id:'season-guide',title:'换季护理指南：整理你的日常清单',path:'/journal/season-guide',target:'换季护肤指南',best:'换季护肤指南',date:'2026-10-09',excerpt:'演示文章条目，用于检查发布日期与排名字段的展示。'},
      {id:'travel-checklist',title:'轻装出行：旅行护理清单',path:'/journal/travel-checklist',target:'旅行护理产品清单',best:null,date:'2026-10-06',excerpt:'尚无排名数据的示例，缺失排名以横线展示，不推定为零。'}
    ];return {keywords,posts,summary:{health:99,dr:16,previousDR:16,referringDomainsAcquired:0}};
  }
  function siteAnalytics(c) { return c.analytics || {keywords:[],posts:[]}; }
  function siteOverviewHTML(c) {
    const data=siteAnalytics(c),summary=data.summary||{},hasData=!!c.analytics;
    const top=engine=>hasData?data.keywords.filter(k=>Number.isInteger(k[engine])&&k[engine]>0&&k[engine]<=20).length:null;
    const previous=hasData?data.keywords.filter(k=>Number.isInteger(k.previous)&&k.previous>0&&k.previous<=20).length:null;
    const google=top('google'),delta=google===null?null:google-previous;
    const rows=[['健康分数',summary.health,'满分 100 · 示例'],['域名评级（DR）',summary.dr,summary.dr===summary.previousDR&&summary.dr!=null?'较上期无变化 · 示例':'演示数据'],['Google Top 20',google,delta===null?'尚未接入':delta>0?'↑ '+delta+' · 较上期示例':delta<0?'↓ '+Math.abs(delta)+' · 较上期示例':'较上期无变化 · 示例'],['Baidu Top 20',top('baidu'),'排名关键词数 · 示例'],['新增引用域名',summary.referringDomainsAcquired,'RDs Acquired · 示例']];
    return `<section class="site-overview" aria-label="站点统计"><p class="site-overview-note">站点统计 · ${hasData?'预置演示数据，非真实采集':'暂无数据，尚未接入统计服务'}</p><div class="site-overview-grid">${rows.map(([label,value,note])=>`<div class="site-overview-card"><span>${label}</span><strong>${value==null?'—':esc(value)}</strong><small>${value==null?'暂无数据':esc(note)}</small></div>`).join('')}</div></section>`;
  }
  function rankNumber(value) { return Number.isInteger(value)&&value>0?`<b class="rank-number">#${value}</b>`:'<span class="rank-missing" title="暂无示例排名">—</span>'; }
  function siteDataNotice() { return `<div class="site-data-notice">${icon('flask-conical')}<span>预置演示数据 · 排名、搜索量及已发布文章均非真实采集，不代表实际站点表现。</span></div>`; }
  function siteRankingsHTML(c) {
    const data=siteAnalytics(c), top=engine=>data.keywords.filter(k=>k[engine]&&k[engine]<=20).length;
    return `${siteDataNotice()}<div class="site-metrics"><div><span>自然搜索关键词</span><strong>${data.keywords.length}</strong><small>当前站点示例</small></div><div><span>Google Top 20</span><strong>${top('google')}</strong><small>前 20 名关键词</small></div><div><span>百度 Top 20</span><strong>${top('baidu')}</strong><small>前 20 名关键词</small></div></div><div id="keyword-table">${keywordTableHTML(c)}</div><p class="site-data-footnote">搜索量为月度估算示例；KD 表示关键词难度（0–100）；涨跌为 Google 排名与上次示例的对比。— 表示暂无示例排名。</p>`;
  }
  function keywordTableHTML(c) {
    const data=siteAnalytics(c), query=(c.keywordQuery||'').trim().toLowerCase(), rows=data.keywords.filter(k=>k.term.toLowerCase().includes(query));
    return `<div class="site-table-scroll"><table class="site-data-table keyword-data"><caption class="visually-hidden">关键词排名示例</caption><thead><tr><th scope="col">关键词 / 意图</th><th scope="col">搜索量</th><th scope="col"><abbr title="关键词难度，0 到 100">KD</abbr></th><th scope="col">Google</th><th scope="col">百度</th></tr></thead><tbody>${rows.length?rows.map(k=>{const delta=k.google&&k.previous?k.previous-k.google:0;return `<tr><td><b class="keyword-term">${esc(k.term)}</b><div class="keyword-intents">${k.intent.map(i=>`<span>${esc(i)}</span>`).join('')}</div></td><td class="numeric">${k.volume.toLocaleString('en-US')}</td><td><span class="kd-score ${k.kd>35?'competitive':'moderate'}">${k.kd}</span></td><td>${rankNumber(k.google)}${delta?`<span class="rank-change ${delta>0?'up':'down'}" aria-label="${delta>0?'上升':'下降'} ${Math.abs(delta)} 名">${delta>0?'↑':'↓'}${Math.abs(delta)}</span>`:''}</td><td>${rankNumber(k.baidu)}</td></tr>`;}).join(''):`<tr><td colspan="5" class="site-table-empty">${data.keywords.length?'没有匹配的关键词，试试其他关键词。':'暂无关键词数据。新站点未连接排名服务，不会自动生成排名。'}</td></tr>`}</tbody></table></div><div class="site-table-count">共 ${rows.length} / ${data.keywords.length} 个关键词 · 演示</div>`;
  }
  function sitePublishedHTML(c) {
    const data=siteAnalytics(c);
    return `${siteDataNotice()}<div id="published-table">${publishedTableHTML(c)}</div><p class="site-data-footnote">点击标题查看演示摘要；不打开真实文章、不执行发布或更新。目标词排名和最高排名词均取自本页关键词示例。</p>`;
  }
  function publishedTableHTML(c) {
    const data=siteAnalytics(c),query=(c.publishedQuery||'').trim().toLowerCase(),rows=data.posts.filter(p=>[p.title,p.target,p.best||''].some(v=>v.toLowerCase().includes(query))),getRank=term=>data.keywords.find(k=>k.term===term)?.google;
    return `<div class="site-table-scroll"><table class="site-data-table published-data"><caption class="visually-hidden">已发布内容示例</caption><thead><tr><th scope="col">文章 / 发布日期</th><th scope="col">目标关键词 / 排名</th><th scope="col">最高排名词 / 排名</th></tr></thead><tbody>${rows.length?rows.map(p=>`<tr><td><button class="article-title" data-action="preview-site-post" data-id="${esc(p.id)}">${esc(p.title)} ${icon('arrow-up-right')}</button><div class="article-meta"><span>示例已发布</span><time datetime="${esc(p.date)}">${esc(p.date)}</time></div></td><td><span class="article-keyword">${esc(p.target)}</span>${rankNumber(getRank(p.target))}</td><td><span class="article-keyword">${esc(p.best||'暂无排名词')}</span>${rankNumber(getRank(p.best))}</td></tr>`).join(''):`<tr><td colspan="3" class="site-table-empty">${data.posts.length?'没有匹配的文章，试试标题或关键词。':'暂无已发布内容。此站点尚未导入真实文章，本页不会代为发布。'}</td></tr>`}</tbody></table></div><div class="site-table-count">共 ${rows.length} / ${data.posts.length} 篇文章 · 演示</div>`;
  }
  function previewSitePost(id) {
    const c=connection(state.drawer),post=c&&siteAnalytics(c).posts.find(p=>p.id===id);if(!post)return;
    state.flow={type:'site-post',id};openModal();modalFrame('文章预览 · 演示',`<div class="site-post-preview"><span class="neutral-pill">预置示例 · 非真实发布</span><h3>${esc(post.title)}</h3><p class="small-note">${esc(c.domain)}${esc(post.path)} · ${esc(post.date)}</p><p>${esc(post.excerpt)}</p>${kv([['目标关键词',post.target],['最高排名词',post.best||'暂无示例数据']])}<p class="small-note">仅预览示例摘要，不访问官网、不发布文章。</p></div>`,`<button class="btn primary" data-action="close-modal">关闭预览</button>`);
  }
  function startSiteBackend(id) {
    if(connection(id)?.platform==='website')startSite(id);
  }
  document.addEventListener('click',event=>{const el=event.target.closest('[data-action]');if(!el)return;const action=el.dataset.action;const f=state.flow;
    if(action==='detail')openDetail(el.dataset.id);
    if(action==='close-drawer')closeDrawer();
    if(action==='toggle-drawer-width')toggleDrawerWidth();
    if(action==='drawer-seo'){const c=connection(state.drawer);if(c?.platform==='website'){state.drawerTab='seo';renderDrawer();$('detail-drawer').querySelector('[data-action="drawer-seo"]').focus();}}
    if(['save-seo','reset-seo','reset-seo-prompt','seo-engine'].includes(action))seoAction(action,el);
    if(action==='save-site')saveSite();
    if(action==='site-backend')startSiteBackend(el.dataset.id);
    if(action==='site-authorization-failed'&&f?.type==='site'){clearTimeout(flowTimer);f.submitting=false;f.error='模拟授权失败，未创建或修改站点。请检查演示信息后重试。';renderSiteForm();}
    if(action==='drawer-rankings'||action==='drawer-published'){const c=connection(state.drawer);if(c?.platform==='website'){state.drawerTab=action==='drawer-rankings'?'rankings':'published';renderDrawer();$('detail-drawer').querySelector(`[data-action="${action}"]`).focus();}}
    if(action==='preview-site-post')previewSitePost(el.dataset.id);
    if(action==='linked-detail'){closeDrawer();openDetail(el.dataset.id);}
    if(action==='unlink-site'&&canManage()){const c=connection(el.dataset.id);if(c?.linkedConnection){delete c.linkedConnection;c.status='unconnected';c.authTime='未授权';c.verified='尚未验证';c.reason='站点关联已解除，原 Shopify 连接及其授权不受影响。';log(c,'解除站点关联','成功','仅解除引用，不撤销 Shopify 原连接授权。');render();renderDrawer();toast('已解除站点关联，原 Shopify 授权保留。');}}
    if(action==='drawer-info'||action==='drawer-logs'){state.drawerTab=action==='drawer-info'?'info':'logs';renderDrawer();$('detail-drawer').querySelector(`[data-action="${action}"]`).focus();}
    if(action==='platform-demo')startFlow(el.dataset.platform);
    if(action==='clear-filters')clearFilters();
    if(action==='close-modal')closeModal();
    if(action==='choose-platform'&&f){if(el.dataset.platform==='website')startSite();else{f.platform=el.dataset.platform;f.step=1;renderFlow();}}
    if(action==='authorize')authorize();
    if(['authorization-denied','authorization-failed','cancel-authorization'].includes(action)&&f){clearTimeout(flowTimer);f.step=1;f.error=action==='authorization-denied'?'模拟用户已拒绝授权，未创建连接。':action==='authorization-failed'?'模拟验证失败：未能确认账号授权，可以重试。':'授权已取消，未创建或更新连接。';renderFlow();}
    if(action==='reauth')startFlow(null,el.dataset.id);
    if(action==='disconnect')startDisconnect(el.dataset.id);
    if(action==='confirm-disconnect')confirmDisconnect();
    if(action==='finish-flow'){closeModal();switchTab('connections');clearFilters();}
    if(action==='view-created'&&f?.created){const id=f.created;closeModal();switchTab('connections');clearFilters();if(state.drawer)closeDrawer();openDetail(id);}
  });
  document.addEventListener('change',event=>{if(event.target.id==='site-cms'&&state.flow?.type==='site'){const wp=event.target.value==='wordpress';$('site-wp-fields').hidden=!wp;$('site-wp-fields').disabled=!wp;if(!wp)$('site-wp-password').value='';}});
  document.addEventListener('input',event=>{if(event.target.dataset?.seo)updateSEO(event.target);if(event.target.id==='site-description'&&state.flow?.type==='site')$('site-description-count').textContent=event.target.value.length+'/2000';});
  document.addEventListener('change',event=>{if(event.target.dataset?.seo)updateSEO(event.target);});
  document.addEventListener('keydown',event=>{const overlay=!$('modal-backdrop').hidden?$('flow-modal'):!$('detail-drawer').hidden?$('detail-drawer'):null;if(!overlay)return;if(event.key==='Escape'){event.preventDefault();if(!$('modal-backdrop').hidden)closeModal();else closeDrawer();}if(event.key==='Tab'){const focusable=[...overlay.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href]')].filter(el=>el.getClientRects().length);if(!focusable.length)return;const first=focusable[0],last=focusable.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}});
  $('search').addEventListener('input',e=>{state.query=e.target.value;render();});
  $('status-filter').insertAdjacentHTML('beforeend','<option value="unconnected">未连接</option><option value="pending">接入待确认</option>');
  $('platform-filter').innerHTML+=platforms.map(p=>`<option value="${p.id}">${p.name}</option>`).join('');
  $('platform-filter').addEventListener('change',e=>{state.platform=e.target.value;render();});
  $('status-filter').addEventListener('change',e=>{state.status=e.target.value;render();});
  $('new-connection').addEventListener('click',()=>startFlow());
  $('reset-demo').addEventListener('click',reset);
  $('role-toggle').addEventListener('click',()=>{state.role=state.role==='admin'?'reader':'admin';render();if(state.drawer)renderDrawer();toast(state.role==='admin'?'已切换为演示管理员。':'已切换为只读角色；可以查看，不能管理连接。');});
  $('drawer-backdrop').addEventListener('click',closeDrawer);
  $('modal-backdrop').addEventListener('click',e=>{if(e.target===$('modal-backdrop'))closeModal();});
  state.connections=initialConnections();icons();render();
})();
