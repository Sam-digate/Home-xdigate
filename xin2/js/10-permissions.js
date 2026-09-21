/* ============ 权限管理 ============ */
const PERMISSION_AGENTS=(typeof REG!=='undefined'?REG.map(a=>({
 id:a.id,
 name:typeof AGENT_LABELS!=='undefined'&&AGENT_LABELS[a.id]?AGENT_LABELS[a.id]:a.n.replace(/\s*Agent$/i,''),
 domain:a.dom,
 color:typeof DOMC!=='undefined'&&DOMC[a.dom]?DOMC[a.dom]:'#7C3AED'
})):[
 {id:'gen',name:'内容生成',domain:'内容',color:'#7C3AED'},
 {id:'ppt',name:'PPT 生成',domain:'内容',color:'#6366F1'}
]);

const PERMISSION_AGENT_TEMPLATES=[
 {id:'default',name:'默认权限',agents:['gen','ppt','trend','kb']},
 {id:'content',name:'内容运营',agents:['gen','vid','plan','pub','trend','comp','msg']},
 {id:'commerce',name:'电商运营',agents:['pdp','ecamp','adplan','promoimg','ad','insp','exec','list','cs']},
 {id:'design',name:'设计',agents:['ppt','gen','vid','promoimg']},
 {id:'kol',name:'达人运营',agents:['kol','brief','recap']},
 {id:'b2b',name:'B2B 营销',agents:['seo','geo','sem','rep','ana']},
 {id:'all',name:'全部 Agent',agents:[]}
];

const PERMISSION_PROJECTS=[
 {id:'a80',name:'A80PARIS',color:'#7C3AED'},
 {id:'tmall',name:'NEXA',color:'#E11D48'},
 {id:'douyin',name:'LUMIÈRE',color:'#F59E0B'},
 {id:'red',name:'MORIKO',color:'#DB2777'},
 {id:'velora',name:'VELORA',color:'#2563EB'},
 {id:'solvia',name:'SOLVIA',color:'#0891B2'},
 {id:'elara',name:'ELARA',color:'#10B981'},
 {id:'nova',name:'NOVA SKIN',color:'#C026D3'},
 {id:'atelier',name:'ATELIER N',color:'#D97706'},
 {id:'orie',name:'ORIÉ',color:'#4F46E5'},
 {id:'mira',name:'MIRA LAB',color:'#0F766E'},
 {id:'vivant',name:'VIVANT',color:'#BE123C'},
 {id:'lunea',name:'LUNEA',color:'#7E22CE'},
 {id:'aura',name:'AURA+',color:'#0369A1'},
 {id:'kinu',name:'KINU',color:'#A16207'}
];

const PERMISSION_MEMBERS=[
 {id:'br',name:'Brooks',email:'brooks@xdigate.cn',initials:'BR',color:'#0891B2',role:'admin',status:'active',last:'今天 10:32',agents:[],projects:[]},
 {id:'du',name:'Dudu',accountId:'dudu',password:'Dudu66',initials:'DU',color:'#7C3AED',role:'member',status:'active',last:'刚刚',agents:['ppt','trend','ana'],projects:['a80','tmall']},
 {id:'asher',name:'asher',email:'asher@xdigate.cn',initials:'AS',color:'#2563EB',role:'member',status:'active',last:'今天 09:18',agents:['gen','ppt','pdp','trend'],projects:['a80','tmall']},
 {id:'so',name:'Sophie',email:'sophie@xdigate.cn',initials:'SO',color:'#E11D48',role:'member',status:'active',last:'昨天 18:42',agents:['gen','plan','kol'],projects:['tmall','red']},
 {id:'ar',name:'Ariel',email:'ariel@xdigate.cn',initials:'AR',color:'#10B981',role:'member',status:'active',last:'昨天 16:05',agents:['cs','trend'],projects:['a80']},
 {id:'sam',name:'Sam',email:'sam@xdigate.cn',initials:'SA',color:'#7C83C6',role:'member',status:'active',last:'9 月 18 日',agents:['gen','vid','pdp'],projects:['tmall','douyin']},
 {id:'cherry',name:'Cherry',email:'cherry@xdigate.cn',initials:'CH',color:'#C026D3',role:'member',status:'active',last:'9 月 17 日',agents:['ppt'],projects:['a80']},
 {id:'lily',name:'Lily',email:'lily@xdigate.cn',initials:'LI',color:'#D97706',role:'member',status:'active',last:'尚未登录',agents:[],projects:[]}
];

function permissionState(){
 if(!S.permView)S.permView='members';
 if(S.permQuery==null)S.permQuery='';
}
function permissionTabKey(event){
 if(!['ArrowLeft','ArrowRight'].includes(event.key))return;
 event.preventDefault();S.permView=S.permView==='members'?'agents':'members';render();
 requestAnimationFrame(()=>document.querySelector('.permission-tabs button[aria-selected="true"]')?.focus());
}
function permissionRoleLabel(role){return role==='super'?'超级管理员':role==='admin'?'管理员':'成员';}
function permissionRoleClass(role){return role==='super'?'super':role==='admin'?'admin':'member';}
function permissionStatus(m){
 if(m.status==='disabled')return '<span class="permission-status disabled"><i></i>已停用</span>';
 return '<span class="permission-status active"><i></i>正常</span>';
}
function permissionAvatar(m,size='md'){return `<span class="permission-avatar ${size}" style="--avatar:${m.color}">${esc(m.initials)}</span>`;}
function permissionAccountId(m){return m.accountId||(m.email?m.email.split('@')[0]:m.id);}
function permissionAccountPassword(m){return m.password||'XDGATE';}
function permissionMemberAgents(m){
 if(m.role!=='member')return '<span class="permission-all-access"><i data-lucide="check-circle-2"></i>全部 Agent</span>';
 if(!m.agents.length)return '<span class="permission-none">暂未授权</span>';
 const shown=m.agents.slice(0,2).map(id=>PERMISSION_AGENTS.find(a=>a.id===id)).filter(Boolean);
 return `<span class="permission-agent-tags">${shown.map(a=>`<span>${esc(a.name)}</span>`).join('')}${m.agents.length>2?`<span>+${m.agents.length-2}</span>`:''}</span>`;
}
function permissionMemberProjects(m){
 if(m.role!=='member')return '<span class="permission-all-access"><i data-lucide="check-circle-2"></i>全部品牌</span>';
 if(!m.projects?.length)return '<span class="permission-none">暂未授权</span>';
 const shown=m.projects.map(id=>PERMISSION_PROJECTS.find(p=>p.id===id)).filter(Boolean);
 return `<span class="permission-agent-tags">${shown.map(p=>`<span>${esc(p.name)}</span>`).join('')}</span>`;
}
function permissionMemberRows(){
 const q=S.permQuery.trim().toLowerCase();
 const rows=PERMISSION_MEMBERS.filter(m=>m.role!=='super'&&(!q||`${m.name} ${permissionAccountId(m)}`.toLowerCase().includes(q)));
 if(!rows.length)return `<tr><td colspan="6"><div class="permission-empty"><i data-lucide="search-x"></i><b>没有找到成员</b><span>换一个姓名或账号 ID 试试。</span></div></td></tr>`;
 return rows.map(m=>`<tr class="${m.role==='member'?'permission-row':'permission-row-static'}" ${m.role==='member'?`onclick="openPermissionMember('${m.id}')"`:''}>
  <td><div class="permission-person">${permissionAvatar(m)}<span><b>${esc(m.name)}</b><small>账号 ID：${esc(permissionAccountId(m))}</small></span></div></td>
  <td><span class="permission-role ${permissionRoleClass(m.role)}">${permissionRoleLabel(m.role)}</span></td>
  <td>${permissionMemberProjects(m)}</td>
  <td>${permissionMemberAgents(m)}</td>
  <td>${permissionStatus(m)}</td>
  <td>${m.role==='member'?`<button class="permission-icon-button" aria-label="编辑 ${esc(m.name)} 的权限" onclick="event.stopPropagation();openPermissionMember('${m.id}')"><i data-lucide="chevron-right"></i></button>`:''}</td>
 </tr>`).join('');
}
function filterPermissionMembers(value){
 S.permQuery=value;
 const body=document.querySelector('.permission-table tbody');
 if(body)body.innerHTML=permissionMemberRows();
 if(window.lucide)lucide.createIcons();
}
function permissionAgentRows(){
 return PERMISSION_AGENTS.map(a=>{
  const members=PERMISSION_MEMBERS.filter(m=>m.role==='member'&&m.status!=='disabled'&&m.agents.includes(a.id));
  const names=members.slice(0,3);
  return `<tr class="permission-row" onclick="openPermissionAgent('${a.id}')">
   <td><div class="permission-agent"><span class="permission-agent-mark" style="--agent:${a.color}"><i data-lucide="bot"></i></span><span><b>${esc(a.name)}</b><small>${esc(a.domain)}</small></span></div></td>
   <td><strong class="permission-count num">${members.length}</strong> 位成员</td>
   <td><div class="permission-avatar-stack">${names.map(m=>permissionAvatar(m,'sm')).join('')}${members.length>3?`<span class="permission-avatar sm more">+${members.length-3}</span>`:''}${!members.length?'<span class="permission-none">暂未授权</span>':''}</div></td>
   <td><span class="permission-status active"><i></i>已上线</span></td>
   <td><button class="permission-manage-button" onclick="event.stopPropagation();openPermissionAgent('${a.id}')">管理成员</button></td>
  </tr>`;
 }).join('');
}
function vPermission(){
 permissionState();
 const active=PERMISSION_MEMBERS.filter(m=>m.role!=='super'&&m.status==='active').length;
 return `<div class="wrap permission-page">
  <header class="permission-head">
   <div><h1>权限管理</h1><p>管理组织成员，并决定每位成员可以访问哪些品牌、使用哪些 Agent。</p></div>
   <button class="btn permission-invite" onclick="openPermissionCreateAccount()"><i data-lucide="user-plus"></i>创建账号</button>
  </header>
  <div class="permission-overview" aria-label="权限概览">
   <span><b class="num">${active}</b> 位活跃成员</span><i></i><span><b class="num">${PERMISSION_PROJECTS.length}</b> 个品牌</span><i></i><span><b class="num">${PERMISSION_AGENTS.length}</b> 个可授权 Agent</span>
  </div>
  <div class="seg permission-tabs" role="tablist" aria-label="权限管理视图">
   <button id="permission-members-tab" role="tab" aria-controls="permission-members-panel" aria-selected="${S.permView==='members'}" tabindex="${S.permView==='members'?'0':'-1'}" class="${S.permView==='members'?'on':''}" onclick="S.permView='members';render()" onkeydown="permissionTabKey(event)">成员管理</button>
   <button id="permission-agents-tab" role="tab" aria-controls="permission-agents-panel" aria-selected="${S.permView==='agents'}" tabindex="${S.permView==='agents'?'0':'-1'}" class="${S.permView==='agents'?'on':''}" onclick="S.permView='agents';render()" onkeydown="permissionTabKey(event)">Agent 授权</button>
  </div>
  ${S.permView==='members'?`<section id="permission-members-panel" class="permission-panel" role="tabpanel" aria-labelledby="permission-members-tab">
   <div class="permission-toolbar">
    <div><h2 id="permission-members-title">全部成员</h2><p>为普通成员设置可访问的品牌与可使用的 Agent。</p></div>
    <div class="permission-filters">
     <label class="permission-search"><i data-lucide="search"></i><input value="${esc(S.permQuery)}" placeholder="搜索姓名或账号 ID" aria-label="搜索成员" oninput="filterPermissionMembers(this.value)"></label>
    </div>
   </div>
   <div class="permission-scroll-hint"><i data-lucide="move-horizontal"></i>左右滑动查看完整权限</div><div class="permission-table-wrap" tabindex="0" aria-label="成员权限表，可横向滚动"><table class="permission-table"><thead><tr><th>成员</th><th>平台角色</th><th>品牌</th><th>Agent 权限</th><th>状态</th><th></th></tr></thead><tbody>${permissionMemberRows()}</tbody></table></div>
  </section>`:`<section id="permission-agents-panel" class="permission-panel" role="tabpanel" aria-labelledby="permission-agents-tab">
   <div class="permission-toolbar"><div><h2 id="permission-agents-title">Agent 授权</h2><p>从 Agent 维度添加或移除成员；管理员无需重复授权。</p></div></div>
   <div class="permission-scroll-hint"><i data-lucide="move-horizontal"></i>左右滑动查看完整授权</div><div class="permission-table-wrap" tabindex="0" aria-label="Agent 授权表，可横向滚动"><table class="permission-table permission-agent-table"><thead><tr><th>Agent</th><th>已授权</th><th>成员</th><th>状态</th><th></th></tr></thead><tbody>${permissionAgentRows()}</tbody></table></div>
  </section>`}
 </div>`;
}

function permissionDrawerOpen(){
 S.permissionReturnFocus=document.activeElement;$('dw').setAttribute('role','dialog');$('dw').setAttribute('aria-modal','true');$('dw').setAttribute('aria-labelledby','permission-drawer-title');
 $('dw').classList.remove('focus','expanded');$('dw').classList.add('on');$('scrim').classList.add('on');document.addEventListener('keydown',permissionTrapKey);
 requestAnimationFrame(()=>$('dw').querySelector('.permission-close')?.focus());
 if(window.lucide)lucide.createIcons();
}
function permissionTrapKey(event){
 const root=$('mod').classList.contains('on')?$('mod').querySelector('.permission-invite-modal'):$('dw').classList.contains('on')?$('dw'):null;if(!root)return;
 if(event.key==='Escape'&&S.permBrandPickerOpen){event.preventDefault();togglePermissionBrandPicker(false);return;}
 if(event.key==='Escape'){event.preventDefault();root===$('dw')?closeDw():closeMod();return;}
 if(event.key!=='Tab')return;
 const items=[...root.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(x=>x.offsetParent!==null);if(!items.length)return;
 const first=items[0],last=items.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
}
function closePermissionFocus(){
 document.removeEventListener('keydown',permissionTrapKey);$('dw')?.removeAttribute('role');$('dw')?.removeAttribute('aria-modal');$('dw')?.removeAttribute('aria-labelledby');
 document.removeEventListener('click',permissionBrandOutsideClick);S.permBrandPickerOpen=false;
 const back=S.permissionReturnFocus;S.permissionReturnFocus=null;if(back&&back.isConnected)requestAnimationFrame(()=>back.focus());
}
function permissionCloseButton(){return `<button class="permission-close" onclick="closeDw()" aria-label="关闭"><i data-lucide="x"></i></button>`;}
function openPermissionMember(id){
 const m=PERMISSION_MEMBERS.find(x=>x.id===id);if(!m)return;
 if(m.role!=='member'){toast('管理员默认拥有全部品牌和 Agent 权限');return;}
 S.permMemberId=id;S.permDraft={agents:[...m.agents],projects:[...(m.projects||[])]};S.permBrandPickerOpen=false;drawPermissionMember();permissionDrawerOpen();
}
function togglePermissionDraftAgent(id,checked){
 const set=new Set(S.permDraft.agents);checked?set.add(id):set.delete(id);S.permDraft.agents=[...set];
 const count=$('permission-agent-count');if(count)count.textContent=S.permDraft.agents.length;
 const agent=PERMISSION_AGENTS.find(a=>a.id===id);if(agent)refreshPermissionAgentGroup(agent.domain);
 refreshPermissionAgentTemplates();
}
function permissionAgentTemplateIds(template){return template.id==='all'?PERMISSION_AGENTS.map(a=>a.id):template.agents.filter(id=>PERMISSION_AGENTS.some(a=>a.id===id));}
function permissionActiveAgentTemplate(){
 const selected=[...S.permDraft.agents].sort().join('|');return PERMISSION_AGENT_TEMPLATES.find(template=>[...permissionAgentTemplateIds(template)].sort().join('|')===selected)?.id||'custom';
}
function applyPermissionAgentTemplate(id){
 const template=PERMISSION_AGENT_TEMPLATES.find(t=>t.id===id);if(!template)return;S.permDraft.agents=permissionAgentTemplateIds(template);
 document.querySelectorAll('.permission-agent-option input').forEach(input=>{input.checked=S.permDraft.agents.includes(input.value);});
 const count=$('permission-agent-count');if(count)count.textContent=S.permDraft.agents.length;[...new Set(PERMISSION_AGENTS.map(a=>a.domain))].forEach(refreshPermissionAgentGroup);refreshPermissionAgentTemplates();
}
function refreshPermissionAgentTemplates(){
 const active=permissionActiveAgentTemplate();document.querySelectorAll('.permission-template-button').forEach(button=>{const on=button.dataset.template===active;button.classList.toggle('on',on);button.setAttribute('aria-pressed',on);});
}
function togglePermissionAgentDomain(domain,checked){
 const ids=PERMISSION_AGENTS.filter(a=>a.domain===domain).map(a=>a.id),set=new Set(S.permDraft.agents);ids.forEach(id=>checked?set.add(id):set.delete(id));S.permDraft.agents=[...set];
 const group=document.querySelector(`.permission-agent-group[data-agent-group="${domain}"]`);group?.querySelectorAll('.permission-agent-option input').forEach(input=>input.checked=checked);
 const count=$('permission-agent-count');if(count)count.textContent=S.permDraft.agents.length;refreshPermissionAgentGroup(domain);refreshPermissionAgentTemplates();
}
function refreshPermissionAgentGroup(domain){
 const agents=PERMISSION_AGENTS.filter(a=>a.domain===domain),selected=agents.filter(a=>S.permDraft.agents.includes(a.id)).length,group=document.querySelector(`.permission-agent-group[data-agent-group="${domain}"]`);if(!group)return;
 const all=group.querySelector('.permission-agent-all input'),meta=group.querySelector('.permission-agent-group-count');if(all){all.checked=selected===agents.length;all.indeterminate=selected>0&&selected<agents.length;}if(meta)meta.textContent=`${selected} / ${agents.length}`;
}
function togglePermissionDraftProject(id,checked){
 const set=new Set(S.permDraft.projects);checked?set.add(id):set.delete(id);S.permDraft.projects=[...set];
 const count=$('permission-project-count');if(count)count.textContent=S.permDraft.projects.length;
 refreshPermissionBrandPicker();
}
function permissionBrandSummary(){
 const brands=S.permDraft.projects.map(id=>PERMISSION_PROJECTS.find(p=>p.id===id)).filter(Boolean);return brands.length?brands.map(brand=>`<span class="permission-brand-chip">${esc(brand.name)}<button type="button" aria-label="取消选择 ${esc(brand.name)}" onclick="event.stopPropagation();removePermissionBrand('${brand.id}')">×</button></span>`).join(''):'<span class="permission-none">暂未选择品牌</span>';
}
function togglePermissionBrandPicker(open){
 S.permBrandPickerOpen=typeof open==='boolean'?open:!S.permBrandPickerOpen;const picker=document.querySelector('.permission-brand-picker'),select=document.querySelector('.permission-brand-select'),button=document.querySelector('.permission-brand-toggle'),panel=$('permission-brand-dropdown');if(picker)picker.classList.toggle('open',S.permBrandPickerOpen);if(select)select.classList.toggle('on',S.permBrandPickerOpen);if(button){button.setAttribute('aria-expanded',S.permBrandPickerOpen);button.setAttribute('aria-label',S.permBrandPickerOpen?'收起品牌选择':'展开品牌选择');}if(panel)panel.hidden=!S.permBrandPickerOpen;
 document.removeEventListener('click',permissionBrandOutsideClick);if(S.permBrandPickerOpen)document.addEventListener('click',permissionBrandOutsideClick);
}
function permissionBrandOutsideClick(event){if(!document.querySelector('.permission-brand-picker')?.contains(event.target))togglePermissionBrandPicker(false);}
function removePermissionBrand(id){const set=new Set(S.permDraft.projects);set.delete(id);S.permDraft.projects=[...set];const option=document.querySelector(`.permission-brand-option[data-brand-id="${id}"] input`);if(option)option.checked=false;const count=$('permission-project-count');if(count)count.textContent=S.permDraft.projects.length;refreshPermissionBrandPicker();}
function toggleAllPermissionBrands(checked){S.permDraft.projects=checked?PERMISSION_PROJECTS.map(p=>p.id):[];document.querySelectorAll('.permission-brand-option input').forEach(input=>input.checked=checked);const count=$('permission-project-count');if(count)count.textContent=S.permDraft.projects.length;refreshPermissionBrandPicker();}
function filterPermissionBrands(value){
 const query=value.trim().toLowerCase();let visible=0;document.querySelectorAll('.permission-brand-option').forEach(label=>{const show=!query||label.dataset.search.includes(query);label.hidden=!show;if(show)visible++;});const empty=$('permission-brand-empty');if(empty)empty.hidden=visible>0;
}
function clearPermissionBrandSearch(){
 const input=$('permission-brand-search-input'),button=$('permission-brand-search-clear');if(!input)return;input.value='';filterPermissionBrands('');if(button)button.hidden=true;input.focus();
}
function refreshPermissionBrandPicker(){
 const summary=$('permission-brand-summary');if(summary)summary.innerHTML=permissionBrandSummary();const selected=S.permDraft.projects.length,all=$('permission-brand-all');if(all){all.checked=selected===PERMISSION_PROJECTS.length;all.indeterminate=selected>0&&selected<PERMISSION_PROJECTS.length;}
}
function drawPermissionMember(){
 const m=PERMISSION_MEMBERS.find(x=>x.id===S.permMemberId);if(!m)return;
 const draft=S.permDraft;
 $('dw').innerHTML=`<div class="dw-h permission-drawer-head">${permissionCloseButton()}${permissionAvatar(m,'lg')}<div><div class="ty">成员权限</div><h3 id="permission-drawer-title">${esc(m.name)}</h3></div></div>
  <div class="dw-b permission-drawer-body" onclick="if(S.permBrandPickerOpen)togglePermissionBrandPicker(false)">
   <section class="permission-form-section permission-invite-details"><div class="permission-section-title"><div><h4>账号信息</h4><p>账号信息仅供查看，不可在此修改。</p></div></div><div class="permission-invite-fields"><label class="permission-field"><span>姓名</span><input value="${esc(m.name)}" readonly aria-readonly="true"></label><label class="permission-field"><span>账号 ID</span><input value="${esc(permissionAccountId(m))}" readonly aria-readonly="true"></label><label class="permission-field permission-field-wide"><span>密码</span><span class="permission-password readonly"><input id="permission-account-password" type="password" value="${esc(permissionAccountPassword(m))}" readonly aria-readonly="true"><button id="permission-password-toggle" type="button" aria-label="显示密码" aria-pressed="false" onclick="togglePermissionPassword()"><i data-lucide="eye"></i></button></span></label></div></section>
   <section class="permission-form-section"><div class="permission-section-title"><div><h4>可访问的品牌</h4><p>选择该成员可以进入和参与工作的品牌。</p></div><span><b id="permission-project-count" class="num">${draft.projects.length}</b> / ${PERMISSION_PROJECTS.length}</span></div>
    <div class="permission-brand-picker" onclick="event.stopPropagation()"><div class="permission-brand-select" role="button" tabindex="0" aria-label="选择可访问的品牌" onclick="togglePermissionBrandPicker()" onkeydown="if(event.target===this&&(event.key==='Enter'||event.key===' ')){event.preventDefault();togglePermissionBrandPicker()}"><span id="permission-brand-summary" class="permission-brand-summary">${permissionBrandSummary()}</span><button type="button" class="permission-brand-toggle" aria-label="展开品牌选择" aria-expanded="false" onclick="event.stopPropagation();togglePermissionBrandPicker()"><i data-lucide="chevron-down"></i></button></div><div id="permission-brand-dropdown" class="permission-brand-dropdown" hidden><div class="permission-brand-search"><i data-lucide="search"></i><input id="permission-brand-search-input" placeholder="搜索品牌" aria-label="搜索品牌" oninput="filterPermissionBrands(this.value);$('permission-brand-search-clear').hidden=!this.value"><button id="permission-brand-search-clear" type="button" aria-label="清除搜索内容" hidden onclick="clearPermissionBrandSearch()">×</button></div><div class="permission-brand-actions"><label><input id="permission-brand-all" type="checkbox" onchange="toggleAllPermissionBrands(this.checked)"><span class="permission-check"></span><b>全部品牌</b></label></div><div class="permission-brand-options">${PERMISSION_PROJECTS.map(p=>`<label class="permission-brand-option" data-brand-id="${p.id}" data-search="${esc(p.name.toLowerCase())}"><input type="checkbox" value="${p.id}" ${draft.projects.includes(p.id)?'checked':''} onchange="togglePermissionDraftProject('${p.id}',this.checked)"><span class="permission-check"></span><b>${esc(p.name)}</b></label>`).join('')}<div id="permission-brand-empty" class="permission-brand-empty" hidden>没有找到品牌</div></div></div></div>
   </section>
   <section class="permission-form-section"><div class="permission-section-title"><div><h4>可使用的 Agent</h4><p>选择该成员登录后可以看见和使用的 Agent。</p></div><span><b id="permission-agent-count" class="num">${draft.agents.length}</b> / ${PERMISSION_AGENTS.length}</span></div>
    <div class="permission-agent-control"><div class="permission-agent-templates"><div class="permission-template-label"><b>快捷权限</b><span>选择一个模板后仍可逐项调整</span></div><div class="permission-template-buttons">${PERMISSION_AGENT_TEMPLATES.map(template=>`<button class="permission-template-button ${permissionActiveAgentTemplate()===template.id?'on':''}" data-template="${template.id}" aria-pressed="${permissionActiveAgentTemplate()===template.id}" onclick="applyPermissionAgentTemplate('${template.id}')">${esc(template.name)}</button>`).join('')}<span id="permission-template-custom" class="permission-template-custom" role="status">自定义</span></div></div>
     <div class="permission-agent-picker"><div class="permission-agent-groups">${[...new Set(PERMISSION_AGENTS.map(a=>a.domain))].map(domain=>{const agents=PERMISSION_AGENTS.filter(a=>a.domain===domain),selected=agents.filter(a=>draft.agents.includes(a.id)).length;return `<section class="permission-agent-group" data-agent-group="${esc(domain)}"><div class="permission-agent-group-head"><b>${esc(domain)}</b><span class="permission-agent-group-count">${selected} / ${agents.length}</span></div><div class="permission-agent-options"><label class="permission-agent-all"><input type="checkbox" ${selected===agents.length?'checked':''} onchange="togglePermissionAgentDomain('${domain}',this.checked)"><span class="permission-check"></span><b>全部</b></label>${agents.map(a=>`<label class="permission-agent-option"><input type="checkbox" value="${a.id}" ${draft.agents.includes(a.id)?'checked':''} onchange="togglePermissionDraftAgent('${a.id}',this.checked)"><span class="permission-check"></span><b>${esc(a.name)}</b></label>`).join('')}</div></section>`;}).join('')}</div></div></div>
   </section>
  </div>
  <div class="dw-f permission-drawer-foot">${m.role==='member'?`<button class="btn ghost permission-disable" onclick="togglePermissionMemberStatus('${m.id}')">${m.status==='disabled'?'恢复成员':'停用成员'}</button>`:'<span></span>'}<div><button class="btn ghost" onclick="closeDw()">取消</button><button class="btn" onclick="savePermissionMember()">保存更改</button></div></div>`;
 refreshPermissionBrandPicker();[...new Set(PERMISSION_AGENTS.map(a=>a.domain))].forEach(refreshPermissionAgentGroup);
 if(window.lucide)lucide.createIcons();
}
function savePermissionMember(){
 const m=PERMISSION_MEMBERS.find(x=>x.id===S.permMemberId);if(!m)return;
 m.agents=[...S.permDraft.agents];m.projects=[...S.permDraft.projects];closeDw();render();toast('成员权限已更新');
}
function togglePermissionMemberStatus(id){
 const m=PERMISSION_MEMBERS.find(x=>x.id===id);if(!m)return;
 const disabling=m.status!=='disabled';if(disabling&&!window.confirm(`停用后，${m.name} 将立即无法登录，也不能继续使用已授权的 ${m.agents.length} 个 Agent。确认停用吗？`))return;
 m.status=m.status==='disabled'?'active':'disabled';closeDw();render();toast(m.status==='disabled'?`${m.name} 已停用`:`${m.name} 已恢复`);
}

function openPermissionAgent(id){
 const a=PERMISSION_AGENTS.find(x=>x.id===id);if(!a)return;
 S.permAgentId=id;S.permAgentDraft=PERMISSION_MEMBERS.filter(m=>m.role==='member'&&m.agents.includes(id)).map(m=>m.id);
 drawPermissionAgent();permissionDrawerOpen();
}
function togglePermissionAgentMember(id,checked){const s=new Set(S.permAgentDraft);checked?s.add(id):s.delete(id);S.permAgentDraft=[...s];const c=$('permission-member-count');if(c)c.textContent=S.permAgentDraft.length;}
function drawPermissionAgent(){
 const a=PERMISSION_AGENTS.find(x=>x.id===S.permAgentId);if(!a)return;
 const members=PERMISSION_MEMBERS.filter(m=>m.role==='member');
 $('dw').innerHTML=`<div class="dw-h permission-drawer-head">${permissionCloseButton()}<span class="permission-agent-mark large" style="--agent:${a.color}"><i data-lucide="bot"></i></span><div><div class="ty">Agent 授权</div><h3 id="permission-drawer-title">${esc(a.name)}</h3><span>${esc(a.domain)}</span></div></div>
  <div class="dw-b permission-drawer-body"><div class="permission-note neutral"><i data-lucide="info"></i><span>超级管理员和管理员默认可以访问全部 Agent，此处仅配置普通成员。</span></div>
   <section class="permission-form-section"><div class="permission-section-title"><div><h4>可使用成员</h4><p>取消勾选后，成员将不能继续进入或运行该 Agent。</p></div><span><b id="permission-member-count" class="num">${S.permAgentDraft.length}</b> 位</span></div>
    <div class="permission-member-checks">${members.map(m=>`<label class="${m.status==='disabled'?'disabled':''}"><input type="checkbox" ${S.permAgentDraft.includes(m.id)?'checked':''} ${m.status==='disabled'?'disabled':''} onchange="togglePermissionAgentMember('${m.id}',this.checked)"><span class="permission-check"></span>${permissionAvatar(m)}<span><b>${esc(m.name)}</b><small>${m.status==='disabled'?'已停用':`账号 ID：${esc(permissionAccountId(m))}`}</small></span></label>`).join('')}</div>
   </section>
  </div><div class="dw-f permission-drawer-foot"><span></span><div><button class="btn ghost" onclick="closeDw()">取消</button><button class="btn" onclick="savePermissionAgent()">保存更改</button></div></div>`;
 if(window.lucide)lucide.createIcons();
}
function savePermissionAgent(){
 const id=S.permAgentId,set=new Set(S.permAgentDraft);
 PERMISSION_MEMBERS.filter(m=>m.role==='member').forEach(m=>{const a=new Set(m.agents);set.has(m.id)?a.add(id):a.delete(id);m.agents=[...a];});
 closeDw();render();toast('Agent 授权成员已更新');
}

function openPermissionCreateAccount(){
 S.permDraft={agents:[],projects:[]};S.permBrandPickerOpen=false;
 const draft=S.permDraft;
 $('dw').innerHTML=`<div class="dw-h permission-drawer-head">${permissionCloseButton()}<span class="permission-invite-mark"><i data-lucide="user-plus"></i></span><div><div class="ty">成员管理</div><h3 id="permission-drawer-title">创建账号</h3></div></div>
  <div class="dw-b permission-drawer-body" onclick="if(S.permBrandPickerOpen)togglePermissionBrandPicker(false)">
   <section class="permission-form-section permission-invite-details"><div class="permission-section-title"><div><h4>账号信息</h4><p>设置成员的登录账号和初始密码。</p></div></div><div class="permission-invite-fields"><label class="permission-field"><span>姓名</span><input id="permission-invite-name" required autocomplete="off" placeholder="输入成员姓名"></label><label class="permission-field"><span>账号 ID</span><input id="permission-account-id" required minlength="3" maxlength="32" autocomplete="username" placeholder="例如：sophie"></label><label class="permission-field permission-field-wide"><span>密码</span><span class="permission-password"><input id="permission-account-password" type="password" required minlength="6" autocomplete="new-password" placeholder="至少输入 6 位密码" onkeydown="if(event.key==='Enter')submitPermissionAccount()"><button id="permission-password-toggle" type="button" aria-label="显示密码" aria-pressed="false" onclick="togglePermissionPassword()"><i data-lucide="eye"></i></button></span></label></div></section>
   <section class="permission-form-section"><div class="permission-section-title"><div><h4>可访问的品牌</h4><p>设置成员加入后可以进入和参与工作的品牌。</p></div><span><b id="permission-project-count" class="num">${draft.projects.length}</b> / ${PERMISSION_PROJECTS.length}</span></div>
    <div class="permission-brand-picker" onclick="event.stopPropagation()"><div class="permission-brand-select" role="button" tabindex="0" aria-label="选择可访问的品牌" onclick="togglePermissionBrandPicker()" onkeydown="if(event.target===this&&(event.key==='Enter'||event.key===' ')){event.preventDefault();togglePermissionBrandPicker()}"><span id="permission-brand-summary" class="permission-brand-summary">${permissionBrandSummary()}</span><button type="button" class="permission-brand-toggle" aria-label="展开品牌选择" aria-expanded="false" onclick="event.stopPropagation();togglePermissionBrandPicker()"><i data-lucide="chevron-down"></i></button></div><div id="permission-brand-dropdown" class="permission-brand-dropdown" hidden><div class="permission-brand-search"><i data-lucide="search"></i><input id="permission-brand-search-input" placeholder="搜索品牌" aria-label="搜索品牌" oninput="filterPermissionBrands(this.value);$('permission-brand-search-clear').hidden=!this.value"><button id="permission-brand-search-clear" type="button" aria-label="清除搜索内容" hidden onclick="clearPermissionBrandSearch()">×</button></div><div class="permission-brand-actions"><label><input id="permission-brand-all" type="checkbox" onchange="toggleAllPermissionBrands(this.checked)"><span class="permission-check"></span><b>全部品牌</b></label></div><div class="permission-brand-options">${PERMISSION_PROJECTS.map(p=>`<label class="permission-brand-option" data-brand-id="${p.id}" data-search="${esc(p.name.toLowerCase())}"><input type="checkbox" value="${p.id}" onchange="togglePermissionDraftProject('${p.id}',this.checked)"><span class="permission-check"></span><b>${esc(p.name)}</b></label>`).join('')}<div id="permission-brand-empty" class="permission-brand-empty" hidden>没有找到品牌</div></div></div></div>
   </section>
   <section class="permission-form-section"><div class="permission-section-title"><div><h4>可使用的 Agent</h4><p>设置成员加入后可以看见和使用的 Agent。</p></div><span><b id="permission-agent-count" class="num">${draft.agents.length}</b> / ${PERMISSION_AGENTS.length}</span></div>
    <div class="permission-agent-control"><div class="permission-agent-templates"><div class="permission-template-label"><b>快捷权限</b><span>选择一个模板后仍可逐项调整</span></div><div class="permission-template-buttons">${PERMISSION_AGENT_TEMPLATES.map(template=>`<button type="button" class="permission-template-button ${permissionActiveAgentTemplate()===template.id?'on':''}" data-template="${template.id}" aria-pressed="${permissionActiveAgentTemplate()===template.id}" onclick="applyPermissionAgentTemplate('${template.id}')">${esc(template.name)}</button>`).join('')}<span id="permission-template-custom" class="permission-template-custom" role="status">自定义</span></div></div>
     <div class="permission-agent-picker"><div class="permission-agent-groups">${[...new Set(PERMISSION_AGENTS.map(a=>a.domain))].map(domain=>{const agents=PERMISSION_AGENTS.filter(a=>a.domain===domain),selected=agents.filter(a=>draft.agents.includes(a.id)).length;return `<section class="permission-agent-group" data-agent-group="${esc(domain)}"><div class="permission-agent-group-head"><b>${esc(domain)}</b><span class="permission-agent-group-count">${selected} / ${agents.length}</span></div><div class="permission-agent-options"><label class="permission-agent-all"><input type="checkbox" ${selected===agents.length?'checked':''} onchange="togglePermissionAgentDomain('${domain}',this.checked)"><span class="permission-check"></span><b>全部</b></label>${agents.map(a=>`<label class="permission-agent-option"><input type="checkbox" value="${a.id}" ${draft.agents.includes(a.id)?'checked':''} onchange="togglePermissionDraftAgent('${a.id}',this.checked)"><span class="permission-check"></span><b>${esc(a.name)}</b></label>`).join('')}</div></section>`;}).join('')}</div></div></div>
   </section>
  </div><div class="dw-f permission-drawer-foot"><span></span><div><button class="btn ghost" onclick="closeDw()">取消</button><button class="btn" onclick="submitPermissionAccount()">创建账号</button></div></div>`;
 refreshPermissionBrandPicker();[...new Set(PERMISSION_AGENTS.map(a=>a.domain))].forEach(refreshPermissionAgentGroup);permissionDrawerOpen();setTimeout(()=>$('permission-invite-name')?.focus(),30);
}
function submitPermissionAccount(){
 const nameInput=$('permission-invite-name'),accountInput=$('permission-account-id'),passwordInput=$('permission-account-password');if(!nameInput||!accountInput||!passwordInput)return;
 if(!nameInput.reportValidity()||!accountInput.reportValidity()||!passwordInput.reportValidity())return;
 const name=nameInput.value.trim(),accountId=accountInput.value.trim(),password=passwordInput.value,role='member';
 if(PERMISSION_MEMBERS.some(m=>permissionAccountId(m).toLowerCase()===accountId.toLowerCase())){toast('该账号 ID 已存在');accountInput.focus();return;}
 const agents=[...S.permDraft.agents],projects=[...S.permDraft.projects];
 const initials=(name.match(/[A-Za-z]/g)||name.split('')).slice(0,2).join('').toUpperCase();
 PERMISSION_MEMBERS.push({id:'member-'+Date.now(),name,accountId,password,initials:initials||'ME',color:'#7C3AED',role,status:'active',last:'尚未登录',agents,projects});
 closeDw();render();toast(`${name} 的账号已创建`);
}
function togglePermissionPassword(){
 const input=$('permission-account-password'),button=$('permission-password-toggle');if(!input||!button)return;const showing=input.type==='text';input.type=showing?'password':'text';button.setAttribute('aria-label',showing?'显示密码':'隐藏密码');button.setAttribute('aria-pressed',String(!showing));button.innerHTML=`<i data-lucide="${showing?'eye':'eye-off'}"></i>`;if(window.lucide)lucide.createIcons();input.focus();
}
