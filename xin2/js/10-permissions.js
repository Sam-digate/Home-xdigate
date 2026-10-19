/* ============ 权限管理 ============ */
const PERMISSION_AGENTS=(typeof REG!=='undefined'?REG.map(a=>({
 id:a.id,
 name:typeof AGENT_LABELS!=='undefined'&&AGENT_LABELS[a.id]?AGENT_LABELS[a.id]:a.n.replace(/\s*Agent$/i,''),
 domain:a.dom,
 color:typeof DOMC!=='undefined'&&DOMC[a.dom]?DOMC[a.dom]:'#7C3AED',
 status:'active'
})):[
 {id:'gen',name:'内容生成',domain:'内容',color:'#7C3AED',status:'active'},
 {id:'ppt',name:'PPT 生成',domain:'内容',color:'#6366F1',status:'active'}
]);

const PERMISSION_AGENT_TEMPLATES=[
 {id:'all',name:'全部权限',agents:[],pages:[]}
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

const PERMISSION_TENANT_ADMINS=[
 {id:'admin-a80',name:'u2c',accountId:'u2c',password:'U2c666',initials:'U2',color:'#0891B2',projectId:'a80',recipes:['r1','r3','r4'],agents:PERMISSION_AGENTS.map(agent=>agent.id),pages:['today','work','prop','camp','anal.data','anal.chat','know.src','know.out','agent.registry','agent.recipes','agent.routines','agent.prompts','permission'],memberUsed:7,memberLimit:10,projectUsed:15,projectLimit:15,monthlyCredits:500000,expires:'2027-09-30',createdAt:'2026-01-12',status:'active',last:'刚刚'},
 {id:'admin-nexa',name:'Nike',accountId:'nike',password:'Nike666',initials:'NI',color:'#E11D48',projectId:'tmall',recipes:['r1','r3'],agents:PERMISSION_AGENTS.map(agent=>agent.id),pages:['today','work','camp','anal.data','know.src','know.out','agent.registry','agent.prompts','permission'],memberUsed:5,memberLimit:8,projectUsed:8,projectLimit:10,monthlyCredits:200000,expires:'2027-03-31',createdAt:'2026-03-05',status:'active',last:'昨天 17:20'},
 {id:'admin-lumi',name:'Yida',accountId:'yida',password:'Yida666',initials:'YI',color:'#F59E0B',projectId:'douyin',recipes:[],agents:PERMISSION_AGENTS.map(agent=>agent.id),pages:['today','work','camp','anal.data','know.src','know.out','agent.registry','permission'],memberUsed:3,memberLimit:5,projectUsed:5,projectLimit:8,monthlyCredits:100000,expires:'2026-12-31',createdAt:'2026-06-18',status:'disabled',last:'9 月 18 日'}
];

const PERMISSION_PAGE_GROUPS=[
 {id:'base',name:'基础页面',pages:[
  {id:'today',name:'今日'},{id:'work',name:'工作'},{id:'prop',name:'提案'},{id:'camp',name:'活动'}
 ]},
 {id:'anal',name:'数据分析',pages:[
  {id:'anal.data',name:'数据分析'},{id:'anal.chat',name:'聊天记录分析'}
 ]},
 {id:'know',name:'知识库',pages:[
  {id:'know.src',name:'来源 · Agent 读的东西'},{id:'know.out',name:'产出 · Agent 写的东西'}
 ]},
 {id:'agent',name:'Agents',pages:[
  {id:'agent.registry',name:'Agent 登记处'},{id:'agent.recipes',name:'配方'},{id:'agent.routines',name:'例行'},{id:'agent.prompts',name:'共享提示词'}
 ]},
 {id:'connector',name:'Connector',pages:[
  {id:'connector',name:'连接与授权'}
 ]},
 {id:'permission',name:'权限管理',pages:[
  {id:'permission',name:'权限管理'}
 ]}
];
const PERMISSION_PAGE_IDS=PERMISSION_PAGE_GROUPS.flatMap(group=>group.pages.map(page=>page.id));
const PERMISSION_MEMBER_PAGE_IDS=PERMISSION_PAGE_IDS.filter(id=>id!=='permission');

const PERMISSION_MEMBERS=[
 {id:'br',name:'u2c',accountId:'u2c',password:'U2c666',initials:'U2',color:'#0891B2',role:'admin',status:'active',createdAt:'2026-01-12',last:'今天 10:32',agents:[],projects:[],pages:[...PERMISSION_PAGE_IDS]},
 {id:'du',name:'Dudu',accountId:'u2c:dudu',password:'Dudu66',initials:'DU',color:'#7C3AED',role:'admin',status:'active',createdAt:'2026-02-03',last:'刚刚',agents:['ppt','trend','ana'],projects:['a80','tmall'],pages:[...PERMISSION_MEMBER_PAGE_IDS]},
 {id:'asher',name:'asher',email:'asher@xdigate.cn',initials:'AS',color:'#2563EB',role:'member',status:'active',createdAt:'2026-02-15',last:'今天 09:18',agents:['gen','ppt','pdp','trend'],projects:['a80','velora','solvia'],pages:[...PERMISSION_MEMBER_PAGE_IDS]},
 {id:'so',name:'Sophie',email:'sophie@xdigate.cn',initials:'SO',color:'#E11D48',role:'member',status:'active',createdAt:'2026-03-08',last:'昨天 18:42',agents:['gen','plan','kol'],projects:['tmall','douyin'],pages:[...PERMISSION_MEMBER_PAGE_IDS]},
 {id:'ar',name:'Ariel',email:'ariel@xdigate.cn',initials:'AR',color:'#10B981',role:'member',status:'active',createdAt:'2026-04-21',last:'昨天 16:05',agents:['cs','trend'],projects:['red','elara'],pages:[...PERMISSION_MEMBER_PAGE_IDS]},
 {id:'sam',name:'Sam',email:'sam@xdigate.cn',initials:'SA',color:'#7C83C6',role:'member',status:'active',createdAt:'2026-05-12',last:'9 月 18 日',agents:['gen','vid','pdp'],projects:['nova','atelier'],pages:[...PERMISSION_MEMBER_PAGE_IDS]},
 {id:'cherry',name:'Cherry',email:'cherry@xdigate.cn',initials:'CH',color:'#C026D3',role:'member',status:'active',createdAt:'2026-06-06',last:'9 月 17 日',agents:['ppt'],projects:['orie'],pages:[...PERMISSION_MEMBER_PAGE_IDS]},
 {id:'lily',name:'Lily',email:'lily@xdigate.cn',initials:'LI',color:'#D97706',role:'member',status:'active',createdAt:'2026-07-19',last:'尚未登录',agents:[],projects:[],pages:[...PERMISSION_MEMBER_PAGE_IDS]}
];

function permissionAutoGrantDraft(account){return {autoGrantProjects:account?.autoGrantProjects!==false,autoGrantAgents:account?.autoGrantAgents!==false};}
function permissionAutoGrantHtml(kind){
 const key=kind==='projects'?'autoGrantProjects':'autoGrantAgents',label=kind==='projects'?'项目':'Agent';
 return `<label class="permission-auto-grant"><input type="checkbox" ${S.permDraft[key]?'checked':''} onchange="S.permDraft.${key}=this.checked"><span>自动授权以后新增的${label}</span></label>`;
}
function permissionAutoGrantSave(){return {...permissionAutoGrantDraft(S.permDraft),autoGrantKnownProjects:PERMISSION_PROJECTS.map(project=>project.id),autoGrantKnownAgents:PERMISSION_AGENTS.map(agent=>agent.id)};}
function permissionSyncAutoGrants(){
 const sync=(account,key,catalog,allowed)=>{
  const flag=key==='projects'?'autoGrantProjects':'autoGrantAgents',knownKey=key==='projects'?'autoGrantKnownProjects':'autoGrantKnownAgents';
  if(!account[flag])return;
  if(!Array.isArray(account[knownKey])){account[knownKey]=catalog.map(item=>item.id);return;}
  const known=new Set(account[knownKey]),grants=new Set(account[key]||[]);
  catalog.forEach(item=>{if(known.has(item.id)||!allowed.has(item.id))return;grants.add(item.id);known.add(item.id);});
  account[key]=[...grants];account[knownKey]=[...known];
 };
 PERMISSION_TENANT_ADMINS.forEach(admin=>sync(admin,'agents',PERMISSION_AGENTS,new Set(PERMISSION_AGENTS.map(agent=>agent.id))));
 PERMISSION_MEMBERS.forEach(member=>{
  const accountId=permissionAccountId(member),prefix=accountId.includes(':')?accountId.split(':')[0]:'u2c',tenant=PERMISSION_TENANT_ADMINS.find(admin=>admin.accountId.toLowerCase()===prefix.toLowerCase());
  if(!tenant)return;
  sync(member,'agents',PERMISSION_AGENTS,new Set(tenant.agents||[]));
  sync(member,'projects',PERMISSION_PROJECTS,new Set(tenant.projects||PERMISSION_PROJECTS.map(project=>project.id)));
 });
}
function permissionRecipePages(domain){
 const pages=['today','work','know.src','know.out','agent.registry','agent.recipes'];
 if(['内容','电商','KOL'].includes(domain))pages.push('camp');
 if(['电商','KOL','B2B','平台'].includes(domain))pages.push('anal.data');
 return [...new Set(pages)];
}
function permissionRecipeCatalog(){
 if(typeof RECIPES==='undefined')return [];
 return RECIPES.filter(recipe=>!recipe.cad).map(recipe=>({id:recipe.id,name:recipe.n,description:recipe.d,agents:[...recipe.ag],pages:permissionRecipePages(recipe.dom),domain:recipe.dom,used:recipe.used||0,source:recipe}));
}

function permissionCurrentMember(){permissionSyncAutoGrants();return PERMISSION_MEMBERS.find(member=>member.id===currentUser());}
function permissionCurrentTenantAdmin(){
 const member=permissionCurrentMember(),accountId=member?permissionAccountId(member):'',tenantAccountId=accountId.includes(':')?accountId.split(':')[0]:accountId;
 return PERMISSION_TENANT_ADMINS.find(admin=>admin.accountId.toLowerCase()===tenantAccountId.toLowerCase());
}
function permissionTenantAgents(){
 const tenant=permissionCurrentTenantAdmin();return tenant?PERMISSION_AGENTS.filter(agent=>tenant.agents.includes(agent.id)):PERMISSION_AGENTS;
}
function permissionAssignableProjects(){return PERMISSION_PROJECTS;}
function permissionProjectById(id){return permissionAssignableProjects().find(project=>project.id===id)||PERMISSION_PROJECTS.find(project=>project.id===id);}
function permissionAssignableAgents(){
 if(S.permAgentScope==='platform')return PERMISSION_AGENTS;
 return permissionTenantAgents();
}
function permissionTenantPages(){
 const tenant=permissionCurrentTenantAdmin();return tenant?(tenant.pages||[]).filter(page=>page!=='permission'):PERMISSION_MEMBER_PAGE_IDS;
}
function permissionAssignablePages(){return S.permAgentScope==='platform'?PERMISSION_PAGE_IDS:permissionTenantPages();}
function permissionHasPage(id){
 const member=permissionCurrentMember();if(!member||member.role!=='member')return true;
 return (member.pages||PERMISSION_MEMBER_PAGE_IDS).includes(id);
}
function permissionCanAccessView(view){
 if(view==='thread')return permissionHasPage('work');
 const map={today:['today'],work:['work'],prop:['prop'],camp:['camp'],anal:['anal.data','anal.chat'],know:['know.src','know.out'],agent:['agent.registry','agent.recipes','agent.routines','agent.prompts'],permission:['permission']};
 if(view==='connector')return permissionHasPage('connector');
 return !map[view]||map[view].some(permissionHasPage);
}
function permissionFirstView(){return ['today','work','prop','camp','anal','know','agent','permission'].find(permissionCanAccessView)||'today';}

function permissionState(){
 permissionSyncAutoGrants();
 const systemRecipeIds=permissionRecipeCatalog().map(recipe=>recipe.id);PERMISSION_TENANT_ADMINS.forEach(admin=>{admin.recipes=[...systemRecipeIds];admin.pages=[...PERMISSION_PAGE_IDS];});
 const memberPrefix=(permissionCurrentTenantAdmin()?.accountId||'u2c').replace(/:$/,'');PERMISSION_MEMBERS.forEach(member=>{if(member.role!=='member')return;member.pages=[...PERMISSION_MEMBER_PAGE_IDS];const accountId=permissionAccountId(member);if(accountId&&!accountId.includes(':'))member.accountId=`${memberPrefix}:${accountId}`;});
 if(!S.permLevel)S.permLevel='super';
 if(!['accounts','recipes'].includes(S.permSuperView))S.permSuperView='accounts';
 S.permView='members';
 if(S.permQuery==null)S.permQuery='';
 if(!S.permStatus)S.permStatus='all';
 if(!S.permAgentStatus)S.permAgentStatus='all';
 if(S.permTenantQuery==null)S.permTenantQuery='';
 if(!S.permTenantStatus)S.permTenantStatus='all';
}
function permissionLevelTabKey(event){
 if(!['ArrowLeft','ArrowRight'].includes(event.key))return;
 event.preventDefault();S.permLevel=S.permLevel==='super'?'admin':'super';render();
 requestAnimationFrame(()=>document.querySelector('.permission-level-tabs button[aria-selected="true"]')?.focus());
}
function permissionSuperTabKey(event){
 if(!['ArrowLeft','ArrowRight'].includes(event.key))return;
 const tabs=['accounts','recipes'],current=Math.max(0,tabs.indexOf(S.permSuperView)),step=event.key==='ArrowRight'?1:-1;
 event.preventDefault();S.permSuperView=tabs[(current+step+tabs.length)%tabs.length];render();
 requestAnimationFrame(()=>document.querySelector('.permission-super-tabs button[aria-selected="true"]')?.focus());
}
function permissionTenantAgentTags(admin){
 const agents=admin.agents.map(id=>PERMISSION_AGENTS.find(agent=>agent.id===id)).filter(Boolean),shown=agents.slice(0,2);
 return `<span class="permission-agent-tags">${shown.map(agent=>`<span>${esc(agent.name)}</span>`).join('')}${agents.length>2?`<span>+${agents.length-2}</span>`:''}</span>`;
}
function permissionTenantAdminRows(){
 const query=S.permTenantQuery.trim().toLowerCase();
 const rows=PERMISSION_TENANT_ADMINS.filter(admin=>(S.permTenantStatus==='all'||admin.status===S.permTenantStatus)&&(!query||`${admin.name} ${admin.accountId}`.toLowerCase().includes(query)));
 if(!rows.length)return `<tr><td colspan="7"><div class="permission-empty"><i data-lucide="search-x"></i><b>没有找到管理员账号</b><span>调整搜索内容或状态筛选后再试。</span></div></td></tr>`;
 return rows.map(admin=>{const usage=Math.min(100,Math.round(admin.memberUsed/admin.memberLimit*100));return `<tr class="permission-row" onclick="openPermissionTenantAdmin('${admin.id}')">
  <td><div class="permission-person">${permissionAvatar(admin)}<span><b>${esc(admin.name)}</b></span></div></td>
  <td>${permissionTenantAgentTags(admin)}</td>
  <td><div class="permission-seat-usage"><span><b class="num">${admin.memberUsed}</b> / ${admin.memberLimit}</span><i><em style="width:${usage}%"></em></i></div></td>
  <td><span class="permission-expiry">${esc(admin.expires)}</span></td><td><span class="permission-expiry">${esc(admin.createdAt)}</span></td><td>${permissionStatus(admin)}</td>
  <td><button class="permission-icon-button" aria-label="管理 ${esc(admin.name)}" onclick="event.stopPropagation();openPermissionTenantAdmin('${admin.id}')"><i data-lucide="chevron-right"></i></button></td>
 </tr>`;}).join('');
}
function filterPermissionTenantAdmins(value){S.permTenantQuery=value;const body=document.querySelector('.permission-super-table tbody');if(body)body.innerHTML=permissionTenantAdminRows();if(window.lucide)lucide.createIcons();}
function filterPermissionTenantStatus(value){S.permTenantStatus=value;const body=document.querySelector('.permission-super-table tbody');if(body)body.innerHTML=permissionTenantAdminRows();if(window.lucide)lucide.createIcons();}
function permissionSuperAdminPanel(){
 return `<section id="permission-super-panel" class="permission-panel permission-super-panel" role="tabpanel" aria-labelledby="permission-super-accounts-tab">
  <div class="permission-toolbar permission-member-toolbar"><div class="permission-filters"><label class="permission-search"><i data-lucide="search"></i><input value="${esc(S.permTenantQuery)}" placeholder="搜索管理员账号或 ID" aria-label="搜索管理员账号" oninput="filterPermissionTenantAdmins(this.value)"></label><label class="permission-status-filter"><select aria-label="筛选管理员状态" onchange="filterPermissionTenantStatus(this.value)"><option value="all" ${S.permTenantStatus==='all'?'selected':''}>全部状态</option><option value="active" ${S.permTenantStatus==='active'?'selected':''}>正常</option><option value="disabled" ${S.permTenantStatus==='disabled'?'selected':''}>停用</option></select></label></div><button class="btn permission-invite" onclick="openPermissionTenantAdmin()"><i data-lucide="user-plus"></i>创建管理员</button></div>
  <div class="permission-super-summary"><span><i data-lucide="shield-check"></i>超级管理员设置品牌可用的 Agent 与子账号数量，品牌管理员只能在授权范围内向下分配。</span></div>
  <div class="permission-scroll-hint"><i data-lucide="move-horizontal"></i>左右滑动查看完整管理员信息</div><div class="permission-table-wrap" tabindex="0" aria-label="品牌管理员账号表，可横向滚动"><table class="permission-table permission-super-table"><thead><tr><th>管理员账号</th><th>Agent 授权</th><th>子账号</th><th>服务期限</th><th>创建时间</th><th>状态</th><th></th></tr></thead><tbody>${permissionTenantAdminRows()}</tbody></table></div>
 </section>`;
}
function permissionSuperRecipePanel(){
 return `<section id="permission-super-recipes-panel" class="permission-panel permission-super-panel" role="tabpanel" aria-labelledby="permission-super-recipes-tab">
  <div class="permission-toolbar"><div><h2>系统配方管理</h2><p>管理 Agents 中创建的系统配方及其运行链路。</p></div><button class="btn permission-invite" onclick="newRecipe()"><i data-lucide="plus"></i>创建配方</button></div>
  <div class="permission-super-summary"><span><i data-lucide="workflow"></i>系统配方创建后会自动提供给全部管理员，无需单独授权。</span></div>
  <div class="permission-scroll-hint"><i data-lucide="move-horizontal"></i>左右滑动查看完整配方信息</div><div class="permission-table-wrap" tabindex="0" aria-label="平台配方管理表，可横向滚动"><table class="permission-table permission-recipe-table"><thead><tr><th>系统配方</th><th>使用次数</th><th>管理</th></tr></thead><tbody>${permissionRecipeRows()}</tbody></table></div>
 </section>`;
}
function permissionRecipeAgentTags(recipe){
 return `<div class="recipe-chain-inline permission-recipe-chain-inline">${recipe.agents.map(id=>`<span class="pstepc">${AV(id,16)} ${nick(id)}</span>`).join('<span class="recipe-chain-arrow">→</span>')}${approvalPill()}</div>`;
}
function permissionRecipeRows(){
 const recipes=permissionRecipeCatalog();if(!recipes.length)return `<tr><td colspan="3"><div class="permission-empty"><i data-lucide="workflow"></i><b>暂无配方</b><span>请先在 Agents · 配方中创建配方。</span></div></td></tr>`;
 return recipes.map(recipe=>`<tr class="permission-row" onclick="editRecipe('${recipe.id}')">
  <td><div class="permission-agent permission-recipe-name"><span><span class="permission-recipe-title"><b>${esc(recipe.name)}</b><em class="chip recipe-system">系统</em></span><small>${esc(recipe.description)}</small><span class="permission-recipe-chain-row"><em>链路</em>${permissionRecipeAgentTags(recipe)}</span></span></div></td>
  <td><span class="permission-expiry"><b class="num">${recipe.used}</b> 次</span></td>
  <td><button class="btn ghost sm permission-manage-button" type="button" onclick="event.stopPropagation();editRecipe('${recipe.id}')">管理</button></td></tr>`).join('');
}
function permissionSuperPanel(){
 if(S.permSuperView==='accounts')return permissionSuperAdminPanel();
 return permissionSuperRecipePanel();
}
function permissionRoleLabel(member){return member.role==='super'?'超级管理员':member.role==='admin'?(permissionIsBrandAdminMember(member)?'管理员':'普通管理员'):'成员';}
function permissionRoleClass(role){return role==='super'?'super':role==='admin'?'admin':'member';}
function permissionStatus(m){
 if(m.status==='disabled')return '<span class="permission-status disabled"><i></i>已停用</span>';
 return '<span class="permission-status active"><i></i>正常</span>';
}
function permissionAvatar(m,size='md'){return `<span class="permission-avatar ${size}" style="--avatar:${m.color}">${esc(m.initials)}</span>`;}
function permissionAccountId(m){return m.accountId||(m.email?m.email.split('@')[0]:m.id);}
function permissionAccountPassword(m){return m.password||'XDGATE';}
function permissionIsBrandAdminMember(m){const accountId=permissionAccountId(m).toLowerCase();return m.role==='admin'&&PERMISSION_TENANT_ADMINS.some(admin=>admin.accountId.toLowerCase()===accountId);}
function permissionAccountParts(m){const accountId=permissionAccountId(m),separator=accountId.indexOf(':');return separator<0?{prefix:(permissionCurrentTenantAdmin()?.accountId||'u2c').replace(/:$/,''),suffix:accountId}:{prefix:accountId.slice(0,separator),suffix:accountId.slice(separator+1)};}
function permissionMemberAgents(m){
 if(permissionIsBrandAdminMember(m))return '<span class="permission-all-access"><i data-lucide="check-circle-2"></i>全部 Agent</span>';
 if(!m.agents.length)return '<span class="permission-none">暂未授权</span>';
 const shown=m.agents.slice(0,2).map(id=>PERMISSION_AGENTS.find(a=>a.id===id)).filter(Boolean);
 return `<span class="permission-agent-tags">${shown.map(a=>`<span>${esc(a.name)}</span>`).join('')}${m.agents.length>2?`<span>+${m.agents.length-2}</span>`:''}</span>`;
}
function permissionMemberProjects(m){
 if(permissionIsBrandAdminMember(m))return '<span class="permission-all-access"><i data-lucide="check-circle-2"></i>全部项目</span>';
 if(!m.projects?.length)return '<span class="permission-none">暂未授权</span>';
 const shown=m.projects.map(permissionProjectById).filter(Boolean);
 return `<span class="permission-agent-tags">${shown.map(p=>`<span>${esc(p.name)}</span>`).join('')}</span>`;
}
function permissionMemberRows(){
 const q=S.permQuery.trim().toLowerCase();
 const rows=PERMISSION_MEMBERS.filter(m=>m.role!=='super'&&(S.permStatus==='all'||m.status===S.permStatus)&&(!q||`${m.name} ${permissionAccountId(m)}`.toLowerCase().includes(q)));
 if(!rows.length)return `<tr><td colspan="7"><div class="permission-empty"><i data-lucide="search-x"></i><b>没有找到成员</b><span>${S.permStatus!=='all'?'调整状态筛选后再试。':'换一个姓名或账号 ID 试试。'}</span></div></td></tr>`;
 return rows.map(m=>`<tr class="permission-row" onclick="openPermissionMember('${m.id}')">
  <td><div class="permission-person">${permissionAvatar(m)}<span><b>${esc(m.name)}</b><small>账号 ID：${esc(permissionAccountId(m))}</small></span></div></td>
  <td><span class="permission-role ${permissionRoleClass(m.role)}">${permissionRoleLabel(m)}</span></td>
  <td>${permissionMemberProjects(m)}</td>
  <td><span class="permission-expiry">${esc(m.createdAt)}</span></td>
  <td>${permissionMemberAgents(m)}</td>
  <td>${permissionStatus(m)}</td>
  <td><button class="permission-icon-button" aria-label="${permissionIsBrandAdminMember(m)?'查看':'编辑'} ${esc(m.name)} 的权限" onclick="event.stopPropagation();openPermissionMember('${m.id}')"><i data-lucide="chevron-right"></i></button></td>
 </tr>`).join('');
}
function filterPermissionMembers(value){
 S.permQuery=value;
 const body=document.querySelector('.permission-table tbody');
 if(body)body.innerHTML=permissionMemberRows();
 if(window.lucide)lucide.createIcons();
}
function filterPermissionMemberStatus(value){
 S.permStatus=value;
 const body=document.querySelector('.permission-table tbody');
 if(body)body.innerHTML=permissionMemberRows();
 if(window.lucide)lucide.createIcons();
}
function filterPermissionAgentStatus(value){
 S.permAgentStatus=value;
 const body=document.querySelector('.permission-agent-table tbody');
 if(body)body.innerHTML=permissionAgentRows();
 if(window.lucide)lucide.createIcons();
}
function setPermissionAgentStatus(id,value,event){
 if(event)event.stopPropagation();
 const agent=PERMISSION_AGENTS.find(a=>a.id===id);if(!agent||agent.status===value)return;
 const platformScope=S.permLevel==='super'&&S.permSuperView==='agents';
 if(value==='disabled'){
  if(event?.target)event.target.value=agent.status;
  openPermissionAgentStatusConfirm(id);
  return;
 }
 agent.status=value;
 render();
 toast(value==='disabled'?`${agent.name} 已停用，${platformScope?'品牌':'成员'}授权已保留`:`${agent.name} 已上线`);
}
function openPermissionAgentStatusConfirm(id){
 const agent=PERMISSION_AGENTS.find(a=>a.id===id);if(!agent)return;
 const platformScope=S.permLevel==='super'&&S.permSuperView==='agents';
 const memberCount=platformScope?PERMISSION_TENANT_ADMINS.filter(admin=>admin.agents.includes(id)).length:PERMISSION_MEMBERS.filter(m=>m.role==='member'&&m.agents.includes(id)).length;
 S.permAgentStatusPending=id;
 $('mod').classList.remove('plan-mode','asset-mode');
 $('mod').innerHTML=`<section class="mbox permission-agent-confirm" role="alertdialog" aria-modal="true" aria-labelledby="permission-agent-confirm-title" aria-describedby="permission-agent-confirm-copy">
  <header class="permission-agent-confirm-head"><span class="permission-agent-confirm-icon"><i data-lucide="power"></i></span><div><span class="ty">Agent 状态</span><h3 id="permission-agent-confirm-title">确认停用「${esc(agent.name)}」？</h3></div><button class="ib" onclick="cancelPermissionAgentStatus()" aria-label="关闭"><i data-lucide="x"></i></button></header>
  <div class="permission-agent-confirm-body"><p id="permission-agent-confirm-copy">停用后，${platformScope?'所有品牌账号及其成员':'成员'}将暂时无法进入或运行这个 Agent。</p><div class="permission-agent-confirm-target"><span class="permission-agent-mark" style="--agent:${agent.color}"><i data-lucide="bot"></i></span><span><b>${esc(agent.name)}</b><small>${esc(agent.domain)} · 已授权 ${memberCount} ${platformScope?'个品牌账号':'位成员'}</small></span></div><div class="permission-agent-confirm-note"><i data-lucide="shield-check"></i><span>已有${platformScope?'品牌':'成员'}授权会完整保留，重新上线后自动恢复。</span></div></div>
  <footer class="permission-agent-confirm-foot"><button class="btn ghost" onclick="cancelPermissionAgentStatus()">取消</button><button class="btn permission-agent-confirm-action" onclick="confirmPermissionAgentStatus()"><i data-lucide="power"></i>确认停用</button></footer>
 </section>`;
 $('mod').classList.add('on');
 if(window.lucide)lucide.createIcons({root:$('mod'),attrs:{width:17,height:17,'stroke-width':1.9}});
 requestAnimationFrame(()=>$('mod').querySelector('.btn.ghost')?.focus());
}
function cancelPermissionAgentStatus(){S.permAgentStatusPending=null;closeMod();}
function confirmPermissionAgentStatus(){
 const agent=PERMISSION_AGENTS.find(a=>a.id===S.permAgentStatusPending);if(!agent){cancelPermissionAgentStatus();return;}
 const platformScope=S.permLevel==='super'&&S.permSuperView==='agents';
 agent.status='disabled';S.permAgentStatusPending=null;closeMod();render();toast(`${agent.name} 已停用，${platformScope?'品牌':'成员'}授权已保留`);
}
function permissionAgentRows(){
 const rows=permissionTenantAgents().filter(a=>S.permAgentStatus==='all'||a.status===S.permAgentStatus);
 if(!rows.length)return `<tr><td colspan="5"><div class="permission-empty"><i data-lucide="search-x"></i><b>没有符合条件的 Agent</b><span>调整状态筛选后再试。</span></div></td></tr>`;
 return rows.map(a=>{
  const members=PERMISSION_MEMBERS.filter(m=>m.role==='member'&&m.status!=='disabled'&&m.agents.includes(a.id));
  const names=members.slice(0,3);
  return `<tr class="permission-row" onclick="openPermissionAgent('${a.id}')">
   <td><div class="permission-agent"><span class="permission-agent-mark" style="--agent:${a.color}"><i data-lucide="bot"></i></span><span><b>${esc(a.name)}</b><small>${esc(a.domain)}</small></span></div></td>
   <td><strong class="permission-count num">${members.length}</strong> 位成员</td>
   <td><div class="permission-avatar-stack">${names.map(m=>permissionAvatar(m,'sm')).join('')}${members.length>3?`<span class="permission-avatar sm more">+${members.length-3}</span>`:''}${!members.length?'<span class="permission-none">暂未授权</span>':''}</div></td>
   <td><label class="permission-agent-status-control" onclick="event.stopPropagation()"><select class="${a.status==='disabled'?'disabled':'active'}" aria-label="设置 ${esc(a.name)} 状态" onchange="setPermissionAgentStatus('${a.id}',this.value,event)"><option value="active" ${a.status==='active'?'selected':''}>已上线</option><option value="disabled" ${a.status==='disabled'?'selected':''}>已停用</option></select></label></td>
   <td><button class="permission-manage-button" onclick="event.stopPropagation();openPermissionAgent('${a.id}')">管理成员</button></td>
  </tr>`;
 }).join('');
}
function vPermission(){
 permissionState();
 const active=PERMISSION_MEMBERS.filter(m=>m.role!=='super'&&m.status==='active').length;
 const tenantAdmin=permissionCurrentTenantAdmin();
 return `<div class="wrap permission-page">
  <header class="permission-head">
   <div><h1>权限管理</h1><p>管理组织成员，并决定每位成员可以访问哪些页面与项目、使用哪些 Agent。</p></div>
  </header>
  <div class="permission-overview" aria-label="权限概览">
   <span><b class="num">${active}</b> 位活跃成员</span><i></i><span><b class="num">${PERMISSION_PROJECTS.length}</b> 个项目</span><i></i><span><b class="num">${PERMISSION_AGENTS.length}</b> 个可授权 Agent</span>
  </div>
  <div class="seg permission-level-tabs" role="tablist" aria-label="管理员层级">
   <button id="permission-super-tab" role="tab" aria-controls="permission-super-content" aria-selected="${S.permLevel==='super'}" tabindex="${S.permLevel==='super'?'0':'-1'}" class="${S.permLevel==='super'?'on':''}" onclick="S.permLevel='super';render()" onkeydown="permissionLevelTabKey(event)">超级管理员</button>
   <button id="permission-admin-tab" role="tab" aria-controls="permission-admin-content" aria-selected="${S.permLevel==='admin'}" tabindex="${S.permLevel==='admin'?'0':'-1'}" class="${S.permLevel==='admin'?'on':''}" onclick="S.permLevel='admin';render()" onkeydown="permissionLevelTabKey(event)">管理员</button>
  </div>
  ${S.permLevel==='super'?`<div id="permission-super-content" role="tabpanel" aria-labelledby="permission-super-tab">
  <div class="seg permission-tabs permission-subtabs permission-super-tabs" role="tablist" aria-label="超级管理员权限视图">
   <button id="permission-super-accounts-tab" role="tab" aria-controls="permission-super-panel" aria-selected="${S.permSuperView==='accounts'}" tabindex="${S.permSuperView==='accounts'?'0':'-1'}" class="${S.permSuperView==='accounts'?'on':''}" onclick="S.permSuperView='accounts';render()" onkeydown="permissionSuperTabKey(event)">账号管理</button>
   <button id="permission-super-recipes-tab" role="tab" aria-controls="permission-super-recipes-panel" aria-selected="${S.permSuperView==='recipes'}" tabindex="${S.permSuperView==='recipes'?'0':'-1'}" class="${S.permSuperView==='recipes'?'on':''}" onclick="S.permSuperView='recipes';render()" onkeydown="permissionSuperTabKey(event)">配方管理</button>
  </div>
  ${permissionSuperPanel()}</div>`:`<div id="permission-admin-content" role="tabpanel" aria-labelledby="permission-admin-tab">
  <div class="seg permission-tabs permission-subtabs" role="tablist" aria-label="管理员权限视图">
   <button id="permission-members-tab" role="tab" aria-controls="permission-members-panel" aria-selected="true" tabindex="0" class="on">成员管理</button>
  </div>
  <section id="permission-members-panel" class="permission-panel" role="tabpanel" aria-labelledby="permission-members-tab">
   <div class="permission-toolbar permission-member-toolbar">
    <div class="permission-filters">
     <label class="permission-search"><i data-lucide="search"></i><input value="${esc(S.permQuery)}" placeholder="搜索姓名或账号 ID" aria-label="搜索成员" oninput="filterPermissionMembers(this.value)"></label>
     <label class="permission-status-filter"><select aria-label="筛选成员状态" onchange="filterPermissionMemberStatus(this.value)"><option value="all" ${S.permStatus==='all'?'selected':''}>全部状态</option><option value="active" ${S.permStatus==='active'?'selected':''}>正常</option><option value="disabled" ${S.permStatus==='disabled'?'selected':''}>停用</option></select></label>
    </div>
    <div class="permission-member-actions">${tenantAdmin?`<span class="permission-seat-badge">子账号 <b class="num">${tenantAdmin.memberUsed}</b> / ${tenantAdmin.memberLimit}</span>`:''}<button class="btn permission-invite" onclick="openPermissionCreateAccount()" ${tenantAdmin&&tenantAdmin.memberUsed>=tenantAdmin.memberLimit?'disabled':''}><i data-lucide="user-plus"></i>创建账号</button></div>
   </div>
   <div class="permission-scroll-hint"><i data-lucide="move-horizontal"></i>左右滑动查看完整权限</div><div class="permission-table-wrap" tabindex="0" aria-label="成员权限表，可横向滚动"><table class="permission-table"><thead><tr><th>成员</th><th>平台角色</th><th>项目</th><th>创建时间</th><th>Agent 权限</th><th>状态</th><th></th></tr></thead><tbody>${permissionMemberRows()}</tbody></table></div>
  </section></div>`}
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
function permissionTemplateButtonsHtml(){
 const active=permissionActiveAgentTemplate();
 return `<div class="permission-agent-templates"><div class="permission-template-label"><span class="permission-template-icon"><i data-lucide="sparkles"></i></span><div><b>快捷权限</b><span>默认开放全部 Agent 权限</span></div><em>快捷配置</em></div><div class="permission-template-buttons">${PERMISSION_AGENT_TEMPLATES.map(template=>`<button type="button" class="permission-template-button ${active===template.id?'on':''}" data-template="${template.id}" aria-pressed="${active===template.id}" onclick="applyPermissionAgentTemplate('${template.id}')">${esc(template.name)}</button>`).join('')}${permissionAutoGrantHtml('agents')}</div></div>`;
}
function permissionAgentGroupsHtml(){
 const selected=S.permDraft.agents||[],available=permissionAssignableAgents();
 return [...new Set(available.map(agent=>agent.domain))].map(domain=>{const agents=available.filter(agent=>agent.domain===domain),count=agents.filter(agent=>selected.includes(agent.id)).length;return `<section class="permission-agent-group" data-agent-group="${esc(domain)}"><div class="permission-agent-group-head"><b>${esc(domain)}</b><span class="permission-agent-group-count">${count} / ${agents.length}</span></div><div class="permission-agent-options"><label class="permission-agent-all"><input type="checkbox" ${count===agents.length?'checked':''} onchange="togglePermissionAgentDomain('${domain}',this.checked)"><span class="permission-check"></span><b>全部</b></label>${agents.map(agent=>`<label class="permission-agent-option"><input type="checkbox" value="${agent.id}" ${selected.includes(agent.id)?'checked':''} onchange="togglePermissionDraftAgent('${agent.id}',this.checked)"><span class="permission-check"></span><b>${esc(agent.name)}</b></label>`).join('')}</div></section>`;}).join('');
}
function permissionPageGroupsHtml(){
 const selected=S.permDraft.pages||[],available=new Set(permissionAssignablePages());
 return PERMISSION_PAGE_GROUPS.map(group=>({...group,pages:group.pages.filter(page=>available.has(page.id))})).filter(group=>group.pages.length).map(group=>{const count=group.pages.filter(page=>selected.includes(page.id)).length;return `<section class="permission-agent-group" data-page-group="${group.id}"><div class="permission-agent-group-head"><b>${esc(group.name)}</b><span class="permission-page-group-count">${count} / ${group.pages.length}</span></div><div class="permission-agent-options"><label class="permission-page-all"><input type="checkbox" ${count===group.pages.length?'checked':''} onchange="togglePermissionPageGroup('${group.id}',this.checked)"><span class="permission-check"></span><b>全部</b></label>${group.pages.map(page=>`<label class="permission-page-option"><input type="checkbox" value="${page.id}" ${selected.includes(page.id)?'checked':''} onchange="togglePermissionDraftPage('${page.id}',this.checked)"><span class="permission-check"></span><b>${esc(page.name)}</b></label>`).join('')}</div></section>`;}).join('');
}
function permissionAccessControlHtml(isCreate=false,scope='member'){
 const draft=S.permDraft;
 const tenantScope=scope==='tenant',adminScope=scope==='admin',subject=tenantScope?'品牌管理员':adminScope?'该普通管理员':isCreate?'账号创建后':'该成员登录后';
 return `<section class="permission-form-section permission-access-section"><div class="permission-section-title"><div><h4>Agent 权限配置</h4><p>设置${subject}可使用的 Agent，页面默认全部开放。</p></div></div>
  <div class="permission-access-stack">
   <div class="permission-agent-control permission-template-control">${permissionTemplateButtonsHtml()}</div>
   <div class="permission-agent-control permission-access-panel"><div class="permission-access-panel-title"><div><button type="button" class="permission-collapse" aria-label="折叠 Agent 权限配置" aria-expanded="true" aria-controls="permission-agent-panel-body" onclick="togglePermissionAccessPanel(this)"><i data-lucide="chevron-up"></i></button><b>Agent 权限配置</b><span>${tenantScope?'选择该品牌购买并可向下授权的 Agent':adminScope?'选择该普通管理员可以看见和使用的 Agent':isCreate?'选择账号创建后可以看见和使用的 Agent':'选择该成员登录后可以看见和使用的 Agent'}</span></div><div class="permission-access-panel-meta"><em><b id="permission-agent-count" class="num">${draft.agents.length}</b> / ${permissionAssignableAgents().length}</em></div></div><div id="permission-agent-panel-body" class="permission-access-panel-body"><div class="permission-agent-picker"><div class="permission-agent-groups">${permissionAgentGroupsHtml()}</div></div></div></div>
  </div>
 </section>`;
}
function togglePermissionAccessPanel(button){
 const panel=button.closest('.permission-access-panel'),body=panel?.querySelector('.permission-access-panel-body');if(!panel||!body)return;
 const expanded=button.getAttribute('aria-expanded')==='true',label=panel.classList.contains('permission-page-control')?'可访问的页面':'Agent 权限配置';
 button.setAttribute('aria-expanded',String(!expanded));button.setAttribute('aria-label',`${expanded?'展开':'折叠'} ${label}`);body.hidden=expanded;panel.classList.toggle('collapsed',expanded);button.innerHTML=`<i data-lucide="chevron-${expanded?'down':'up'}"></i>`;if(window.lucide)lucide.createIcons();
}
function togglePermissionDraftPage(id,checked){
 if(!permissionAssignablePages().includes(id))return;
 const set=new Set(S.permDraft.pages||[]);checked?set.add(id):set.delete(id);S.permDraft.pages=[...set];
 const count=$('permission-page-count');if(count)count.textContent=S.permDraft.pages.length;
 const group=PERMISSION_PAGE_GROUPS.find(item=>item.pages.some(page=>page.id===id));if(group)refreshPermissionPageGroup(group.id);
 refreshPermissionAgentTemplates();
}
function togglePermissionPageGroup(id,checked){
 const group=PERMISSION_PAGE_GROUPS.find(item=>item.id===id);if(!group)return;
 const available=new Set(permissionAssignablePages()),set=new Set(S.permDraft.pages||[]);group.pages.filter(page=>available.has(page.id)).forEach(page=>checked?set.add(page.id):set.delete(page.id));S.permDraft.pages=[...set];
 document.querySelectorAll(`.permission-agent-group[data-page-group="${id}"] .permission-page-option input`).forEach(input=>input.checked=checked);
 const count=$('permission-page-count');if(count)count.textContent=S.permDraft.pages.length;refreshPermissionPageGroup(id);refreshPermissionAgentTemplates();
}
function refreshPermissionPageGroup(id){
 const group=PERMISSION_PAGE_GROUPS.find(item=>item.id===id),root=document.querySelector(`.permission-agent-group[data-page-group="${id}"]`);if(!group||!root)return;
 const available=new Set(permissionAssignablePages()),pages=group.pages.filter(page=>available.has(page.id)),selected=pages.filter(page=>(S.permDraft.pages||[]).includes(page.id)).length,all=root.querySelector('.permission-page-all input'),meta=root.querySelector('.permission-page-group-count');
 if(all){all.checked=selected===pages.length;all.indeterminate=selected>0&&selected<pages.length;}if(meta)meta.textContent=`${selected} / ${pages.length}`;
}
function refreshPermissionPageGroups(){PERMISSION_PAGE_GROUPS.forEach(group=>refreshPermissionPageGroup(group.id));}
function openPermissionMember(id){
 const m=PERMISSION_MEMBERS.find(x=>x.id===id);if(!m)return;
 const readonly=permissionIsBrandAdminMember(m);S.permMemberReadonly=readonly;S.permAgentScope=readonly?'platform':'tenant';S.permMemberId=id;
 if(readonly){
  const admin=PERMISSION_TENANT_ADMINS.find(item=>item.accountId.toLowerCase()===permissionAccountId(m).toLowerCase());
  S.permDraft={agents:[...(admin?.agents||PERMISSION_AGENTS.map(agent=>agent.id))],projects:PERMISSION_PROJECTS.map(project=>project.id),pages:[...(admin?.pages||PERMISSION_PAGE_IDS)]};
 }else S.permDraft={agents:[...m.agents].filter(agent=>permissionAssignableAgents().some(item=>item.id===agent)),projects:[...(m.projects||[])].filter(project=>permissionAssignableProjects().some(item=>item.id===project)),pages:[...(m.pages||PERMISSION_MEMBER_PAGE_IDS)].filter(page=>permissionAssignablePages().includes(page))};
 Object.assign(S.permDraft,permissionAutoGrantDraft(m));S.permBrandPickerOpen=false;drawPermissionMember();permissionDrawerOpen();
}
function togglePermissionDraftAgent(id,checked){
 if(!permissionAssignableAgents().some(agent=>agent.id===id))return;
 const set=new Set(S.permDraft.agents);checked?set.add(id):set.delete(id);S.permDraft.agents=[...set];
 const count=$('permission-agent-count');if(count)count.textContent=S.permDraft.agents.length;
 const agent=PERMISSION_AGENTS.find(a=>a.id===id);if(agent)refreshPermissionAgentGroup(agent.domain);
 refreshPermissionAgentTemplates();
}
function permissionAgentTemplateIds(template){const available=permissionAssignableAgents();return template.id==='all'?available.map(a=>a.id):template.agents.filter(id=>available.some(a=>a.id===id));}
function permissionTemplatePageIds(template){const available=permissionAssignablePages();return template.id==='all'?[...available]:(template.pages||[]).filter(id=>available.includes(id));}
function permissionActiveAgentTemplate(){
 const agents=[...S.permDraft.agents].sort().join('|'),pages=[...(S.permDraft.pages||[])].sort().join('|');return PERMISSION_AGENT_TEMPLATES.find(template=>[...permissionAgentTemplateIds(template)].sort().join('|')===agents&&[...permissionTemplatePageIds(template)].sort().join('|')===pages)?.id||'custom';
}
function applyPermissionAgentTemplate(id){
 const template=PERMISSION_AGENT_TEMPLATES.find(t=>t.id===id);if(!template)return;const allSelected=id==='all'&&permissionAgentTemplateIds(template).every(agent=>S.permDraft.agents.includes(agent));S.permDraft.agents=allSelected?[]:permissionAgentTemplateIds(template);S.permDraft.pages=permissionTemplatePageIds(template);
 document.querySelectorAll('.permission-agent-option input').forEach(input=>{input.checked=S.permDraft.agents.includes(input.value);});
 document.querySelectorAll('.permission-page-option input').forEach(input=>{input.checked=S.permDraft.pages.includes(input.value);});
 const agentCount=$('permission-agent-count'),pageCount=$('permission-page-count');if(agentCount)agentCount.textContent=S.permDraft.agents.length;if(pageCount)pageCount.textContent=S.permDraft.pages.length;[...new Set(PERMISSION_AGENTS.map(a=>a.domain))].forEach(refreshPermissionAgentGroup);refreshPermissionPageGroups();refreshPermissionAgentTemplates();
}
function refreshPermissionAgentTemplates(){
 const active=permissionActiveAgentTemplate();document.querySelectorAll('.permission-template-button').forEach(button=>{const on=button.dataset.template===active;button.classList.toggle('on',on);button.setAttribute('aria-pressed',on);});
}
function togglePermissionAgentDomain(domain,checked){
 const ids=permissionAssignableAgents().filter(a=>a.domain===domain).map(a=>a.id),set=new Set(S.permDraft.agents);ids.forEach(id=>checked?set.add(id):set.delete(id));S.permDraft.agents=[...set];
 const group=document.querySelector(`.permission-agent-group[data-agent-group="${domain}"]`);group?.querySelectorAll('.permission-agent-option input').forEach(input=>input.checked=checked);
 const count=$('permission-agent-count');if(count)count.textContent=S.permDraft.agents.length;refreshPermissionAgentGroup(domain);refreshPermissionAgentTemplates();
}
function refreshPermissionAgentGroup(domain){
 const agents=permissionAssignableAgents().filter(a=>a.domain===domain),selected=agents.filter(a=>S.permDraft.agents.includes(a.id)).length,group=document.querySelector(`.permission-agent-group[data-agent-group="${domain}"]`);if(!group)return;
 const all=group.querySelector('.permission-agent-all input'),meta=group.querySelector('.permission-agent-group-count');if(all){all.checked=selected===agents.length;all.indeterminate=selected>0&&selected<agents.length;}if(meta)meta.textContent=`${selected} / ${agents.length}`;
}
function togglePermissionDraftProject(id,checked){
 if(!permissionAssignableProjects().some(project=>project.id===id))return;
 const set=new Set(S.permDraft.projects);checked?set.add(id):set.delete(id);S.permDraft.projects=[...set];
 const count=$('permission-project-count');if(count)count.textContent=S.permDraft.projects.length;
 refreshPermissionBrandPicker();
}
function permissionBrandSummary(){
 const projects=S.permDraft.projects.map(permissionProjectById).filter(Boolean);return projects.length?projects.map(project=>`<span class="permission-brand-chip">${esc(project.name)}<button type="button" aria-label="取消选择 ${esc(project.name)}" onclick="event.stopPropagation();removePermissionBrand('${project.id}')">×</button></span>`).join(''):'<span class="permission-none">暂未选择项目</span>';
}
function togglePermissionBrandPicker(open){
 S.permBrandPickerOpen=typeof open==='boolean'?open:!S.permBrandPickerOpen;const picker=document.querySelector('.permission-brand-picker'),select=document.querySelector('.permission-brand-select'),button=document.querySelector('.permission-brand-toggle'),panel=$('permission-brand-dropdown');if(picker)picker.classList.toggle('open',S.permBrandPickerOpen);if(select)select.classList.toggle('on',S.permBrandPickerOpen);if(button){button.setAttribute('aria-expanded',S.permBrandPickerOpen);button.setAttribute('aria-label',S.permBrandPickerOpen?'收起项目选择':'展开项目选择');}if(panel)panel.hidden=!S.permBrandPickerOpen;
 document.removeEventListener('click',permissionBrandOutsideClick);if(S.permBrandPickerOpen)document.addEventListener('click',permissionBrandOutsideClick);
}
function permissionBrandOutsideClick(event){if(!document.querySelector('.permission-brand-picker')?.contains(event.target))togglePermissionBrandPicker(false);}
function removePermissionBrand(id){const set=new Set(S.permDraft.projects);set.delete(id);S.permDraft.projects=[...set];const option=document.querySelector(`.permission-brand-option[data-brand-id="${id}"] input`);if(option)option.checked=false;const count=$('permission-project-count');if(count)count.textContent=S.permDraft.projects.length;refreshPermissionBrandPicker();}
function toggleAllPermissionBrands(checked){S.permDraft.projects=checked?permissionAssignableProjects().map(p=>p.id):[];document.querySelectorAll('.permission-brand-option input').forEach(input=>input.checked=checked);const count=$('permission-project-count');if(count)count.textContent=S.permDraft.projects.length;refreshPermissionBrandPicker();}
function filterPermissionBrands(value){
 const query=value.trim().toLowerCase();let visible=0;document.querySelectorAll('.permission-brand-option').forEach(label=>{const show=!query||label.dataset.search.includes(query);label.hidden=!show;if(show)visible++;});const empty=$('permission-brand-empty');if(empty)empty.hidden=visible>0;
}
function clearPermissionBrandSearch(){
 const input=$('permission-brand-search-input'),button=$('permission-brand-search-clear');if(!input)return;input.value='';filterPermissionBrands('');if(button)button.hidden=true;input.focus();
}
function refreshPermissionBrandPicker(){
 const summary=$('permission-brand-summary'),available=permissionAssignableProjects();if(summary)summary.innerHTML=permissionBrandSummary();const selected=S.permDraft.projects.length,all=$('permission-brand-all');if(all){all.checked=selected===available.length;all.indeterminate=selected>0&&selected<available.length;}
}
function permissionProjectCopyOptions(excludeId=''){
 return PERMISSION_MEMBERS.filter(member=>member.id!==excludeId&&!permissionIsBrandAdminMember(member)&&member.status!=='disabled').map(member=>`<button type="button" class="permission-copy-option" data-search="${esc(`${member.name} ${permissionAccountId(member)}`.toLowerCase())}" onclick="copyPermissionProjectsFrom('${member.id}')"><span><b>${esc(member.name)}</b><small>${esc(permissionAccountId(member))}</small></span><em>${(member.projects||[]).length} 个项目</em></button>`).join('');
}
function permissionProjectCopyControl(excludeId=''){
 return `<div class="permission-copy-source" onclick="event.stopPropagation()"><button type="button" class="permission-copy-trigger" aria-haspopup="true" aria-expanded="false" onclick="togglePermissionProjectCopy()"><span>从成员复制</span><i data-lucide="chevron-down"></i></button><div id="permission-project-copy-menu" class="permission-copy-menu" hidden><label class="permission-copy-search"><i data-lucide="search"></i><input id="permission-project-copy-search" autocomplete="off" placeholder="搜索姓名或账号 ID" aria-label="搜索成员" oninput="filterPermissionProjectCopies(this.value)"></label><div class="permission-copy-options">${permissionProjectCopyOptions(excludeId)}<div id="permission-project-copy-empty" class="permission-brand-empty" hidden>没有找到成员</div></div></div></div>`;
}
function togglePermissionProjectCopy(open){
 const source=document.querySelector('.permission-copy-source'),trigger=source?.querySelector('.permission-copy-trigger'),menu=$('permission-project-copy-menu');if(!source||!trigger||!menu)return;const next=typeof open==='boolean'?open:menu.hidden;menu.hidden=!next;source.classList.toggle('open',next);trigger.setAttribute('aria-expanded',String(next));trigger.querySelector('svg')?.setAttribute('data-lucide',next?'chevron-up':'chevron-down');document.removeEventListener('click',permissionProjectCopyOutsideClick);if(next){document.addEventListener('click',permissionProjectCopyOutsideClick);setTimeout(()=>$('permission-project-copy-search')?.focus(),0);}if(window.lucide)lucide.createIcons();
}
function permissionProjectCopyOutsideClick(event){if(!document.querySelector('.permission-copy-source')?.contains(event.target))togglePermissionProjectCopy(false);}
function filterPermissionProjectCopies(value){
 const query=value.trim().toLowerCase();let visible=0;document.querySelectorAll('.permission-copy-option').forEach(option=>{const show=!query||option.dataset.search.includes(query);option.hidden=!show;if(show)visible++;});const empty=$('permission-project-copy-empty');if(empty)empty.hidden=visible>0;
}
function copyPermissionProjectsFrom(memberId){
 if(!memberId)return;const member=PERMISSION_MEMBERS.find(item=>item.id===memberId);if(!member)return;const available=new Set(permissionAssignableProjects().map(project=>project.id));S.permDraft.projects=[...(member.projects||[])].filter(project=>available.has(project));document.querySelectorAll('.permission-brand-option input').forEach(input=>input.checked=S.permDraft.projects.includes(input.value));const count=$('permission-project-count');if(count)count.textContent=S.permDraft.projects.length;refreshPermissionBrandPicker();togglePermissionProjectCopy(false);toast(`已复制 ${member.name} 的 ${S.permDraft.projects.length} 个项目权限`);
}
function drawPermissionMember(){
 const m=PERMISSION_MEMBERS.find(x=>x.id===S.permMemberId);if(!m)return;
 const draft=S.permDraft,projects=permissionAssignableProjects(),readonly=permissionIsBrandAdminMember(m),account=permissionAccountParts(m);
 const accountFields=readonly?`<label class="permission-field"><span>姓名</span><input value="${esc(m.name)}" readonly aria-readonly="true"></label><label class="permission-field"><span>账号 ID</span><input value="${esc(permissionAccountId(m))}" readonly aria-readonly="true"></label><label class="permission-field"><span>密码</span><span class="permission-password readonly"><input id="permission-account-password" type="password" value="${esc(permissionAccountPassword(m))}" readonly aria-readonly="true"><button id="permission-password-toggle" type="button" aria-label="显示密码" aria-pressed="false" onclick="togglePermissionPassword()"><i data-lucide="eye"></i></button></span></label>`:`<label class="permission-field"><span>姓名</span><input value="${esc(m.name)}" readonly aria-readonly="true"></label><label class="permission-field"><span>账号 ID</span><span class="permission-account-prefix readonly"><b>${esc(account.prefix)}:</b><input value="${esc(account.suffix)}" readonly aria-readonly="true"></span></label><label class="permission-field"><span>密码</span><span class="permission-password readonly"><input id="permission-account-password" type="password" value="${esc(permissionAccountPassword(m))}" readonly aria-readonly="true"><button id="permission-password-toggle" type="button" aria-label="显示密码" aria-pressed="false" onclick="togglePermissionPassword()"><i data-lucide="eye"></i></button></span></label><label class="permission-field"><span>账号角色</span><select id="permission-member-role"><option value="member" ${m.role==='member'?'selected':''}>成员</option><option value="admin" ${m.role==='admin'?'selected':''}>普通管理员</option></select></label>`;
 $('dw').innerHTML=`<div class="dw-h permission-drawer-head">${permissionCloseButton()}${permissionAvatar(m,'lg')}<div><div class="ty">${readonly?'品牌管理员 · 仅查看':m.role==='admin'?'普通管理员账号':'成员账号'}</div><h3 id="permission-drawer-title">${esc(m.name)}</h3></div></div>
  <div class="dw-b permission-drawer-body" onclick="if(S.permBrandPickerOpen)togglePermissionBrandPicker(false)">
   ${readonly?'<div class="permission-note neutral permission-tenant-note"><i data-lucide="eye"></i><span>管理员默认拥有全部页面；这里展示当前可访问的项目与 Agent，配置由超级管理员统一调整。</span></div>':''}
   <section class="permission-form-section permission-invite-details"><div class="permission-section-title"><div><h4>账号信息</h4><p>${readonly?'品牌主管理员账号仅供查看。':'账号建立后姓名、账号 ID 和密码不可修改，可调整账号角色。'}</p></div></div><div class="permission-invite-fields">${accountFields}</div></section>
   <section class="permission-form-section"><div class="permission-section-title"><div><h4>可访问的项目</h4><p>项目名称可以使用对应品牌名，默认提供 15 个项目。</p></div><div class="permission-project-title-actions">${readonly?'':permissionProjectCopyControl(m.id)}<span><b id="permission-project-count" class="num">${draft.projects.length}</b> / ${projects.length}</span></div></div>
    <div class="permission-brand-picker" onclick="event.stopPropagation()"><div class="permission-brand-select" role="button" tabindex="0" aria-label="选择可访问的项目" onclick="togglePermissionBrandPicker()" onkeydown="if(event.target===this&&(event.key==='Enter'||event.key===' ')){event.preventDefault();togglePermissionBrandPicker()}"><span id="permission-brand-summary" class="permission-brand-summary">${permissionBrandSummary()}</span><button type="button" class="permission-brand-toggle" aria-label="展开项目选择" aria-expanded="false" onclick="event.stopPropagation();togglePermissionBrandPicker()"><i data-lucide="chevron-down"></i></button></div><div id="permission-brand-dropdown" class="permission-brand-dropdown" hidden><div class="permission-brand-search"><i data-lucide="search"></i><input id="permission-brand-search-input" placeholder="搜索项目" aria-label="搜索项目" oninput="filterPermissionBrands(this.value);$('permission-brand-search-clear').hidden=!this.value"><button id="permission-brand-search-clear" type="button" aria-label="清除搜索内容" hidden onclick="clearPermissionBrandSearch()">×</button></div><div class="permission-brand-actions"><label><input id="permission-brand-all" type="checkbox" onchange="toggleAllPermissionBrands(this.checked)"><span class="permission-check"></span><b>全部项目</b></label></div><div class="permission-brand-options">${projects.map(p=>`<label class="permission-brand-option" data-brand-id="${p.id}" data-search="${esc(p.name.toLowerCase())}"><input type="checkbox" value="${p.id}" ${draft.projects.includes(p.id)?'checked':''} onchange="togglePermissionDraftProject('${p.id}',this.checked)"><span class="permission-check"></span><b>${esc(p.name)}</b></label>`).join('')}<div id="permission-brand-empty" class="permission-brand-empty" hidden>没有找到项目</div></div></div></div>
    ${permissionAutoGrantHtml('projects')}
   </section>
   ${permissionAccessControlHtml(false,readonly?'tenant':m.role==='admin'?'admin':'member')}
  </div>
  <div class="dw-f permission-drawer-foot">${readonly?'<span></span><div><button class="btn" onclick="closeDw()">关闭</button></div>':`<button class="btn ghost permission-disable" onclick="togglePermissionMemberStatus('${m.id}')">${m.status==='disabled'?'恢复成员':'停用成员'}</button><div><button class="btn ghost" onclick="closeDw()">取消</button><button class="btn" onclick="savePermissionMember()">保存更改</button></div>`}</div>`;
 refreshPermissionBrandPicker();[...new Set(PERMISSION_AGENTS.map(a=>a.domain))].forEach(refreshPermissionAgentGroup);
 if(readonly)$('dw').querySelectorAll('.permission-brand-options input,.permission-brand-actions input,.permission-agent-options input,.permission-template-button,.permission-auto-grant input').forEach(control=>control.disabled=true);
 if(window.lucide)lucide.createIcons();
}
function savePermissionMember(){
 const m=PERMISSION_MEMBERS.find(x=>x.id===S.permMemberId);if(!m)return;
 if(permissionIsBrandAdminMember(m))return;
 const roleInput=$('permission-member-role');if(!roleInput)return;const role=roleInput.value==='admin'?'admin':'member',available=new Set(permissionTenantAgents().map(agent=>agent.id)),projects=new Set(permissionAssignableProjects().map(project=>project.id)),agents=[...S.permDraft.agents].filter(agent=>available.has(agent));Object.assign(m,{role,agents,projects:[...S.permDraft.projects].filter(project=>projects.has(project)),pages:[...permissionTenantPages()],...permissionAutoGrantSave()});if(!permissionCanAccessView(S.view)){S.view=permissionFirstView();S.tid=null;S.hist=[];}closeDw();renderNav();render();toast('账号角色与权限已更新');
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

function openPermissionTenantAdmin(id){
 const admin=id?PERMISSION_TENANT_ADMINS.find(item=>item.id===id):null;
 S.permAgentScope='platform';
 S.permTenantAdminId=admin?.id||null;
 S.permDraft={agents:admin?[...(admin.agents||[])]:PERMISSION_AGENTS.map(agent=>agent.id),projects:[],pages:admin?[...(admin.pages||[])]:[...PERMISSION_PAGE_IDS]};
 Object.assign(S.permDraft,permissionAutoGrantDraft(admin));S.permMemberReadonly=false;
 drawPermissionTenantAdmin();permissionDrawerOpen();
}
function drawPermissionTenantAdmin(){
 const admin=PERMISSION_TENANT_ADMINS.find(item=>item.id===S.permTenantAdminId),creating=!admin;
 const draft=admin||{name:'',accountId:'',password:'',projectId:'',memberUsed:0,memberLimit:5,projectUsed:0,projectLimit:15,monthlyCredits:100000,expires:'2027-09-30',status:'active'};
 $('dw').innerHTML=`<div class="dw-h permission-drawer-head">${permissionCloseButton()}<span class="permission-invite-mark"><i data-lucide="${creating?'user-plus':'shield-check'}"></i></span><div><div class="ty">超级管理员 · 品牌账号</div><h3 id="permission-drawer-title">${creating?'创建管理员':esc(admin.name)}</h3></div></div>
  <div class="dw-b permission-drawer-body">
   <div class="permission-note neutral permission-tenant-note"><i data-lucide="info"></i><span>管理员默认拥有全部页面，可使用已授权的 Agent，并且最多创建指定数量的子账号。</span></div>
   <section class="permission-form-section permission-invite-details"><div class="permission-section-title"><div><h4>管理员账号</h4><p>管理员账号同时作为品牌账号和唯一标识。</p></div></div><div class="permission-invite-fields"><label class="permission-field"><span>管理员账号</span><input id="permission-tenant-name" required minlength="3" maxlength="32" value="${esc(draft.accountId||draft.name)}" placeholder="例如：u2c"></label><label class="permission-field"><span>登录密码</span><span class="permission-password"><input id="permission-account-password" type="password" required minlength="6" value="${esc(draft.password)}" placeholder="至少输入 6 位密码"><button id="permission-password-toggle" type="button" aria-label="显示密码" aria-pressed="false" onclick="togglePermissionPassword()"><i data-lucide="eye"></i></button></span></label></div></section>
   <section class="permission-form-section"><div class="permission-section-title"><div><h4>服务配置</h4><p>设置子账号与项目额度、每月积分、服务有效期和账号状态。</p></div></div><div class="permission-tenant-fields"><label class="permission-field"><span>子账号上限</span><input id="permission-tenant-limit" type="number" min="${draft.memberUsed||1}" max="999" value="${draft.memberLimit}" required></label><label class="permission-field"><span>项目上限</span><input id="permission-tenant-project-limit" type="number" min="${draft.projectUsed||1}" max="999" value="${draft.projectLimit}" required></label><label class="permission-field"><span>每月积分</span><input id="permission-tenant-credits" type="number" min="0" step="1000" value="${draft.monthlyCredits}" required></label><label class="permission-field"><span>服务期限</span><input id="permission-tenant-expiry" type="date" value="${esc(draft.expires)}" required></label><label class="permission-field permission-field-wide"><span>账号状态</span><select id="permission-tenant-status"><option value="active" ${draft.status==='active'?'selected':''}>正常</option><option value="disabled" ${draft.status==='disabled'?'selected':''}>停用</option></select></label></div></section>
   ${permissionAccessControlHtml(creating,'tenant')}
  </div><div class="dw-f permission-drawer-foot"><span></span><div><button class="btn ghost" onclick="closeDw()">取消</button><button class="btn" onclick="savePermissionTenantAdmin()">${creating?'创建管理员':'保存更改'}</button></div></div>`;
 [...new Set(PERMISSION_AGENTS.map(agent=>agent.domain))].forEach(refreshPermissionAgentGroup);
 if(window.lucide)lucide.createIcons();
}
function savePermissionTenantAdmin(){
 const nameInput=$('permission-tenant-name'),passwordInput=$('permission-account-password'),limitInput=$('permission-tenant-limit'),projectLimitInput=$('permission-tenant-project-limit'),creditsInput=$('permission-tenant-credits'),expiryInput=$('permission-tenant-expiry'),statusInput=$('permission-tenant-status');
 if(!nameInput||!passwordInput||!limitInput||!projectLimitInput||!creditsInput||!expiryInput||!statusInput)return;
 if(!nameInput.reportValidity()||!passwordInput.reportValidity()||!limitInput.reportValidity()||!projectLimitInput.reportValidity()||!creditsInput.reportValidity()||!expiryInput.reportValidity())return;
 const current=PERMISSION_TENANT_ADMINS.find(item=>item.id===S.permTenantAdminId),accountId=nameInput.value.trim();
 if(PERMISSION_TENANT_ADMINS.some(item=>item.id!==current?.id&&item.accountId.toLowerCase()===accountId.toLowerCase())){toast('该管理员账号已存在');nameInput.focus();return;}
 const name=accountId,memberLimit=Number(limitInput.value),projectLimit=Number(projectLimitInput.value),monthlyCredits=Number(creditsInput.value),recipes=permissionRecipeCatalog().map(recipe=>recipe.id),pages=[...PERMISSION_PAGE_IDS];
 if(current){const oldAccountId=current.accountId,linked=PERMISSION_MEMBERS.find(member=>member.role==='admin'&&permissionAccountId(member).toLowerCase()===oldAccountId.toLowerCase());Object.assign(current,{name,accountId,password:passwordInput.value,memberLimit,projectLimit,monthlyCredits,expires:expiryInput.value,status:statusInput.value,recipes,agents:[...S.permDraft.agents],pages,...permissionAutoGrantSave()});if(linked){linked.name=name;linked.accountId=accountId;linked.password=passwordInput.value;linked.initials=current.initials;linked.pages=[...pages];}}
 else{const initials=(name.match(/[A-Za-z]/g)||name.split('')).slice(0,2).join('').toUpperCase()||'AD';PERMISSION_TENANT_ADMINS.unshift({id:'tenant-admin-'+Date.now(),name,accountId,password:passwordInput.value,initials,color:'#7C3AED',projectId:'',recipes,agents:[...S.permDraft.agents],pages,memberUsed:0,memberLimit,projectUsed:0,projectLimit,monthlyCredits,expires:expiryInput.value,createdAt:new Date().toISOString().slice(0,10),status:statusInput.value,last:'尚未登录',...permissionAutoGrantSave()});}
 closeDw();render();toast(current?'管理员账号已更新':'管理员账号已创建');
}

function openPermissionCreateAccount(){
 const tenant=permissionCurrentTenantAdmin();if(tenant&&tenant.memberUsed>=tenant.memberLimit){toast(`子账号数量已达上限（${tenant.memberUsed} / ${tenant.memberLimit}）`);return;}
 S.permAgentScope='tenant';S.permDraft={agents:permissionTenantAgents().map(agent=>agent.id),projects:[],pages:[...permissionTenantPages()]};S.permBrandPickerOpen=false;
 Object.assign(S.permDraft,permissionAutoGrantDraft(null));S.permMemberReadonly=false;
 const draft=S.permDraft,projects=permissionAssignableProjects(),accountPrefix=(tenant?.accountId||'u2c').replace(/:$/,'');
 $('dw').innerHTML=`<div class="dw-h permission-drawer-head">${permissionCloseButton()}<span class="permission-invite-mark"><i data-lucide="user-plus"></i></span><div><div class="ty">成员管理</div><h3 id="permission-drawer-title">创建账号</h3></div></div>
  <div class="dw-b permission-drawer-body" onclick="if(S.permBrandPickerOpen)togglePermissionBrandPicker(false)">
   <section class="permission-form-section permission-invite-details"><div class="permission-section-title"><div><h4>账号信息</h4><p>设置姓名、登录账号、初始密码和账号角色，默认创建为成员。</p></div></div><div class="permission-invite-fields"><label class="permission-field"><span>姓名</span><input id="permission-invite-name" required maxlength="40" autocomplete="name" placeholder="输入姓名"></label><label class="permission-field"><span>账号 ID</span><span class="permission-account-prefix"><b>${esc(accountPrefix)}:</b><input id="permission-account-id" required minlength="3" maxlength="32" pattern="[A-Za-z0-9._-]{3,32}" title="请输入 3–32 位字母、数字、点、下划线或连字符" autocomplete="username" placeholder="例如：sophie"></span></label><label class="permission-field"><span>密码</span><span class="permission-password"><input id="permission-account-password" type="password" required minlength="6" autocomplete="new-password" placeholder="至少输入 6 位密码" onkeydown="if(event.key==='Enter')submitPermissionAccount()"><button id="permission-password-toggle" type="button" aria-label="显示密码" aria-pressed="false" onclick="togglePermissionPassword()"><i data-lucide="eye"></i></button></span></label><label class="permission-field"><span>账号角色</span><select id="permission-account-role"><option value="member" selected>成员</option><option value="admin">普通管理员</option></select></label></div></section>
   <section class="permission-form-section"><div class="permission-section-title"><div><h4>可访问的项目</h4><p>项目名称可以使用对应品牌名，默认提供 15 个项目。</p></div><div class="permission-project-title-actions">${permissionProjectCopyControl()}<span><b id="permission-project-count" class="num">${draft.projects.length}</b> / ${projects.length}</span></div></div>
    <div class="permission-brand-picker" onclick="event.stopPropagation()"><div class="permission-brand-select" role="button" tabindex="0" aria-label="选择可访问的项目" onclick="togglePermissionBrandPicker()" onkeydown="if(event.target===this&&(event.key==='Enter'||event.key===' ')){event.preventDefault();togglePermissionBrandPicker()}"><span id="permission-brand-summary" class="permission-brand-summary">${permissionBrandSummary()}</span><button type="button" class="permission-brand-toggle" aria-label="展开项目选择" aria-expanded="false" onclick="event.stopPropagation();togglePermissionBrandPicker()"><i data-lucide="chevron-down"></i></button></div><div id="permission-brand-dropdown" class="permission-brand-dropdown" hidden><div class="permission-brand-search"><i data-lucide="search"></i><input id="permission-brand-search-input" placeholder="搜索项目" aria-label="搜索项目" oninput="filterPermissionBrands(this.value);$('permission-brand-search-clear').hidden=!this.value"><button id="permission-brand-search-clear" type="button" aria-label="清除搜索内容" hidden onclick="clearPermissionBrandSearch()">×</button></div><div class="permission-brand-actions"><label><input id="permission-brand-all" type="checkbox" onchange="toggleAllPermissionBrands(this.checked)"><span class="permission-check"></span><b>全部项目</b></label></div><div class="permission-brand-options">${projects.map(p=>`<label class="permission-brand-option" data-brand-id="${p.id}" data-search="${esc(p.name.toLowerCase())}"><input type="checkbox" value="${p.id}" onchange="togglePermissionDraftProject('${p.id}',this.checked)"><span class="permission-check"></span><b>${esc(p.name)}</b></label>`).join('')}<div id="permission-brand-empty" class="permission-brand-empty" hidden>没有找到项目</div></div></div></div>
    ${permissionAutoGrantHtml('projects')}
   </section>
   ${permissionAccessControlHtml(true)}
  </div><div class="dw-f permission-drawer-foot"><span></span><div><button class="btn ghost" onclick="closeDw()">取消</button><button class="btn" onclick="submitPermissionAccount()">创建账号</button></div></div>`;
 refreshPermissionBrandPicker();[...new Set(PERMISSION_AGENTS.map(a=>a.domain))].forEach(refreshPermissionAgentGroup);permissionDrawerOpen();setTimeout(()=>$('permission-invite-name')?.focus(),30);
}
function submitPermissionAccount(){
 const nameInput=$('permission-invite-name'),accountInput=$('permission-account-id'),passwordInput=$('permission-account-password'),roleInput=$('permission-account-role');if(!nameInput||!accountInput||!passwordInput||!roleInput)return;
 if(!nameInput.reportValidity()||!accountInput.reportValidity()||!passwordInput.reportValidity())return;
 const tenant=permissionCurrentTenantAdmin(),accountPrefix=(tenant?.accountId||'u2c').replace(/:$/,''),accountSuffix=accountInput.value.trim(),name=nameInput.value.trim(),accountId=`${accountPrefix}:${accountSuffix}`,password=passwordInput.value,role=roleInput.value==='admin'?'admin':'member';
 if(PERMISSION_MEMBERS.some(m=>permissionAccountId(m).toLowerCase()===accountId.toLowerCase())){toast('该账号 ID 已存在');accountInput.focus();return;}
 if(tenant&&tenant.memberUsed>=tenant.memberLimit){toast(`子账号数量已达上限（${tenant.memberUsed} / ${tenant.memberLimit}）`);return;}
 const available=new Set(permissionTenantAgents().map(agent=>agent.id)),brandScope=new Set(permissionAssignableProjects().map(project=>project.id)),agents=[...S.permDraft.agents].filter(agent=>available.has(agent)),projects=[...S.permDraft.projects].filter(project=>brandScope.has(project)),pages=[...permissionTenantPages()];
 const initials=(name.match(/[A-Za-z]/g)||name.split('')).slice(0,2).join('').toUpperCase();
 PERMISSION_MEMBERS.push({id:'member-'+Date.now(),name,accountId,password,initials:initials||'ME',color:'#7C3AED',role,status:'active',createdAt:new Date().toISOString().slice(0,10),last:'尚未登录',agents,projects,pages,...permissionAutoGrantSave()});
 if(tenant)tenant.memberUsed++;
 closeDw();render();toast(`${name} 的账号已创建`);
}
function togglePermissionPassword(){
 const input=$('permission-account-password'),button=$('permission-password-toggle');if(!input||!button)return;const showing=input.type==='text';input.type=showing?'password':'text';button.setAttribute('aria-label',showing?'显示密码':'隐藏密码');button.setAttribute('aria-pressed',String(!showing));button.innerHTML=`<i data-lucide="${showing?'eye':'eye-off'}"></i>`;if(window.lucide)lucide.createIcons();input.focus();
}
