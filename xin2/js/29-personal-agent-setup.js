/* Session-only build and connection walkthrough; never requests real credentials. */
const PA_CHANNELS=[
 {id:'slack',name:'Slack',required:true,mark:'S',description:'通过私信接收简报，与助理沟通工作事项。'},
 {id:'m365',name:'Microsoft 365',required:true,mark:'M',description:'连接邮件、日历、Teams 和 SharePoint，在授权范围内读取工作信息。'},
 {id:'xdgate',name:'XDGate',required:true,mark:'X',description:'查看当前账号可访问的项目和任务。'},
 {id:'github',name:'GitHub',required:false,mark:'G',description:'可选，只读取已授权的代码仓库和项目进展。'},
 {id:'notion',name:'Notion',required:false,mark:'N',description:'可选，只读取明确共享给助理的页面。'}
];
const PA_SALES_CHANNELS=[
 {id:'tmall',name:'天猫',mark:'天',description:'连接天猫店铺，在授权范围内查看商品、订单与经营数据。'},
 {id:'jd',name:'京东',mark:'京',description:'连接京东店铺，在授权范围内查看商品、库存与销售表现。'},
 {id:'pdd',name:'拼多多',mark:'拼',description:'连接拼多多店铺，在授权范围内查看商品、订单与活动表现。'},
 {id:'douyin',name:'抖音',mark:'抖',description:'连接抖音店铺，在授权范围内查看商品、内容带货与交易数据。'}
];
function personalAgentBuildProgressHTML(r){return r.status==='building'?`<div class="pa-build-progress"><div class="live"><div class="live-h"><span class="spin"></span><span class="t">正在构建个人助理</span><span class="e">${r.buildProgress||10}%</span></div><div class="live-t">${(r.buildProgress||10)<40?'整理申请目标与权限范围…':r.buildProgress<75?'配置助理能力和运行位置…':'检查设置，准备工作渠道连接…'}</div><div class="pbar" role="progressbar" aria-label="助理构建进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${r.buildProgress||10}"><i style="width:${r.buildProgress||10}%"></i></div></div></div>`:'';}
function personalAgentSetupRecord(id){return personalAgentReviewList().find(r=>r.id===id);}
function personalAgentDefaultDemo(){
 const owner=currentUser(),records=personalAgentReviewList();
 const existing=records.find(record=>record.owner===owner);
 if(existing)return ['connecting','live'].includes(existing.status)?existing.id:null;
 const at=new Date().toISOString(),name=U[owner]?.n||owner;
 const answers=['跟进项目进展，整理运营数据和工作简报。','项目负责人','与项目团队协作','Slack、Microsoft 365、XDGate','对外操作前由本人确认'];
 const record={id:'PA-DEMO-'+owner+'-'+Date.now(),scope:personalAgentReviewScope(),owner,name:name+' 的 Agent',applicant:name,job:'个人助理',status:'connecting',level:'M1',type:'员工',answers,submittedAt:at,builtAt:at,buildProgress:100,demo:true,connections:{}};
 record.connections.slack=[{id:'demo-slack',name,connected:true,connectedAt:at,owner,demo:true}];
 for(const project of personalAgentProjects().filter(item=>['a80','evo11','tn','nike'].includes(item.id))){
  const brand=project.id==='a80'?'A80Paris':project.name;
  record.connections['project-'+project.id+'-tmall']=[{id:'demo-tmall-'+project.id,name:brand+'天猫旗舰店',projectId:project.id,connected:true,connectedAt:at,owner,demo:true}];
 }
 S.personalAgentReviewRecords.push(record);
 const app=personalAgentApplication();
 Object.assign(app,{status:'pending',reviewStatus:'connecting',reviewId:record.id,submittedAt:at,submittedAnswers:[...answers],answers:[...answers]});
 return record.id;
}
function personalAgentSyncStatus(r){const app=S.personalAgentApplications?.[r.owner];if(app){app.reviewStatus=r.status;app.reviewId=r.id;}}
function personalAgentBeginBuild(id){
 const r=personalAgentSetupRecord(id);if(!personalAgentCanReview()||r?.status!=='building'||r.buildStarted)return;
 r.buildStarted=true;r.buildProgress=10;const scope=r.scope;
 [40,75,100].forEach((progress,i)=>setTimeout(()=>{
  if(r.status!=='building'||r.scope!==scope)return;
  r.buildProgress=progress;
  if(progress===100){r.status='connecting';r.builtAt=new Date().toISOString();personalAgentSyncStatus(r);}
  if(personalAgentReviewScope()!==scope)return;
  render();if(S.paReviewId===id&&$('dw').classList.contains('on'))openPersonalAgentReview(id,progress===100?2:1);
 },(i+1)*1500));
}
function personalAgentProjects(){
 if(typeof PERMISSION_PROJECTS==='undefined')return [{id:'a80',name:'A80PARIS'},{id:'evo11',name:'Evo1.1'},{id:'tn',name:'TN'},{id:'nike',name:'Nike'},{id:'clinic',name:'Clinic'},{id:'tmall',name:'NEXA'}];
 const member=permissionCurrentMember();
 return PERMISSION_PROJECTS.filter(project=>member?.projects?.includes(project.id));
}
function personalAgentChannelList(record){
 const projects=personalAgentProjects();
 const sales=projects.flatMap(project=>PA_SALES_CHANNELS.map(channel=>({
  ...channel,id:'project-'+project.id+'-'+channel.id,platform:channel.id,projectId:project.id,
  required:false
 })));
 return [...PA_CHANNELS,...sales,...(record.customChannels||[]).filter(channel=>!channel.projectId||projects.some(project=>project.id===channel.projectId))];
}
function personalAgentChannelAccounts(record,channel){
 if(channel.startsWith('all-')){
  return personalAgentChannelList(record).filter(item=>item.platform===channel.slice(4)).flatMap(item=>personalAgentChannelAccounts(record,item.id).map(account=>({...account,channelId:item.id,projectId:item.projectId})));
 }
 const firstProject=personalAgentProjects()[0];
 if(firstProject&&channel==='project-'+firstProject.id+'-tmall'&&record.connections?.tmall){
  record.connections[channel]=record.connections[channel]||record.connections.tmall;
  delete record.connections.tmall;
 }
 const saved=record.connections?.[channel];
 if(!saved)return [];
 if(Array.isArray(saved))return saved;
 return [{...saved,id:'legacy-'+channel,name:channel==='tmall'?personalAgentStoreName(0):record.applicant||record.name}];
}
function personalAgentStoreName(index){return ['A80Paris天猫旗舰店','Evo1.1天猫旗舰店','TN天猫旗舰店','Nike天猫旗舰店'][index]||'天猫旗舰店 '+(index+1);}
function personalAgentDemoAccount(record,channel){
 S.paAccountSequence=(S.paAccountSequence||0)+1;
 const info=personalAgentChannelList(record).find(item=>item.id===channel);
 const number=personalAgentChannelAccounts(record,channel).length;
 const project=personalAgentProjects().find(item=>item.id===info?.projectId);
 const brand=project?.id==='a80'?'A80Paris':project?.name;
 const name=project?brand+info.name+'旗舰店'+(number?' '+(number+1):''):U[currentUser()]?.n||record.applicant||currentUser();
 return {id:'account-'+S.paAccountSequence,name};
}
function personalAgentChannelConnected(record,channel){return personalAgentChannelAccounts(record,channel).some(account=>account.connected!==false);}
function personalAgentAccountMenu(button){
 const menu=button.nextElementSibling;
 if(menu.matches(':popover-open')){menu.hidePopover();return;}
 const bounds=button.getBoundingClientRect();
 menu.style.left=Math.max(8,Math.min(bounds.right-148,window.innerWidth-156))+'px';
 menu.style.top=Math.max(8,Math.min(bounds.bottom+4,window.innerHeight-100))+'px';
 menu.showPopover();
}
function personalAgentAccountHTML(record,channel,account,employee){
 channel=account.channelId||channel;
 const connected=account.connected!==false;
 const channelInfo=personalAgentChannelList(record).find(item=>item.id===channel);
 const project=personalAgentProjects().find(item=>item.id===(account.projectId||channelInfo?.projectId));
 const timestamp=connected?account.connectedAt:account.disconnectedAt;
 const loggedAt=timestamp?new Date(timestamp):null;
 const loginTime=loggedAt&&!Number.isNaN(loggedAt.getTime())?loggedAt.toLocaleString('zh-CN',{timeZone:'Asia/Tokyo',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}):'';
 const menuId='pa-account-menu-'+channel+'-'+account.id;
 const actions=employee?`<button type="button" class="pa-account-more" aria-label="${esc(account.name)}的账号操作" aria-expanded="false" aria-controls="${menuId}" onclick="personalAgentAccountMenu(this)"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg></button><div id="${menuId}" class="pa-account-menu" popover="auto" role="group" aria-label="账号操作" ontoggle="this.previousElementSibling.setAttribute('aria-expanded',String(event.newState==='open'))" onclick="this.hidePopover()">${connected?`<button type="button" class="pa-account-disconnect" onclick="personalAgentDisconnectPrompt('${record.id}','${channel}','${account.id}')">断开连接</button>`:`<button type="button" class="pa-account-disconnect pa-account-reconnect" onclick="personalAgentLoginPrompt('${record.id}','${channel}','${account.id}')">重新连接</button>`}<button type="button" class="pa-account-disconnect" onclick="personalAgentDisconnectPrompt('${record.id}','${channel}','${account.id}',true)">删除账号</button></div>`:'';
 return `<div class="pa-channel-account"><div class="pa-review-info"><b>${esc(account.name)}</b>${project?`<span class="chip mut pa-account-project">${esc(project.name)}</span>`:''}${loginTime?`<span class="pa-account-login-time">${connected?'登录于':'断开于'} ${esc(loginTime)}</span>`:''}</div><div class="pa-channel-actions"><span class="st ${connected?'done':'todo'}">${connected?'已登录':'已断开'}</span>${actions}</div></div>`;
}
function personalAgentToggleAccounts(id,channel,employee){
 const record=personalAgentSetupRecord(id);
 if(!record||(employee?record.owner!==currentUser():!personalAgentCanReview()))return;
 const body=$('dw').querySelector?.('.dw-b');
 const scrollTop=body?.scrollTop||0;
 S.paExpandedAccounts=S.paExpandedAccounts||{};
 const key=id+':'+channel;
 S.paExpandedAccounts[key]=!S.paExpandedAccounts[key];
 if(employee)openPersonalAgentSetup(id);else openPersonalAgentReview(id,2);
 const updatedBody=$('dw').querySelector?.('.dw-b');
 if(updatedBody)updatedBody.scrollTop=scrollTop;
 $('dw').querySelector?.(`[data-account-toggle="${channel}"]`)?.focus({preventScroll:true});
}
function personalAgentChannelFilter(id,group,project,employee){
 const record=personalAgentSetupRecord(id);
 if(!record||(employee?record.owner!==currentUser():!personalAgentCanReview())||!['public','project'].includes(group))return;
 if(group==='project'&&project!=='all'&&!personalAgentProjects().some(item=>item.id===project))return;
 S.paChannelFilter={id,group,project};
 if(employee)openPersonalAgentSetup(id);else openPersonalAgentReview(id,2);
}
function personalAgentChannelsHTML(r,employee=false){
 const ready=['connecting','live'].includes(r.status),projects=personalAgentProjects();
 const selected=S.paChannelFilter?.id===r.id?S.paChannelFilter:{group:'public'};
 const project=projects.find(item=>item.id===selected.project);
 const group=selected.group==='project'&&projects.length?'project':'public';
 const projectId=project?.id||'all';
 const allChannels=personalAgentChannelList(r);
 const customIds=new Set((r.customChannels||[]).map(channel=>channel.id));
 const channels=group==='public'?allChannels.filter(channel=>!channel.projectId||customIds.has(channel.id)):project?allChannels.filter(channel=>channel.platform&&channel.projectId===project.id):PA_SALES_CHANNELS.map(channel=>({...channel,id:'all-'+channel.id}));
 return `<div class="pa-channel-filter"><div class="seg"><button class="${group==='public'?'on':''}" onclick="personalAgentChannelFilter('${r.id}','public','',${employee})">公共渠道</button><button class="${group==='project'?'on':''}" ${projects.length?'':'disabled'} onclick="personalAgentChannelFilter('${r.id}','project','${projectId}',${employee})">项目渠道</button></div>${group==='project'?`<label>项目 <select aria-label="选择项目" onchange="personalAgentChannelFilter('${r.id}','project',this.value,${employee})"><option value="all" ${projectId==='all'?'selected':''}>全部</option>${projects.map(item=>`<option value="${esc(item.id)}" ${item.id===projectId?'selected':''}>${esc(item.name)}</option>`).join('')}</select></label>`:''}</div>${group==='project'?'<div class="note" style="margin-bottom:var(--sp-3)">添加账号后，系统会自动识别店铺名称及所属项目。</div>':''}${channels.map(channel=>{
  const accounts=personalAgentChannelAccounts(r,channel.id);
  const expanded=!!S.paExpandedAccounts?.[r.id+':'+channel.id];
  const visibleAccounts=expanded?accounts:accounts.slice(0,3);
  return `<article class="pa-channel-card pa-channel-multi"><div class="pa-channel-heading"><span class="pa-review-avatar">${esc(channel.mark)}</span><div class="pa-review-info"><div class="pa-review-title"><b>${esc(channel.name)}</b>${channel.required?'<span class="chip mut">必需</span>':''}${employee&&r.customChannels?.some(item=>item.id===channel.id)?`<button type="button" class="pa-account-disconnect pa-account-delete" aria-label="删除渠道 ${esc(channel.name)}" title="删除渠道" onclick="personalAgentDeleteChannelPrompt('${r.id}','${channel.id}')"><i data-lucide="trash-2" aria-hidden="true"></i></button>`:''}</div><p class="${channel.loginUrl?'pa-channel-url':''}" ${channel.loginUrl?`title="${esc(channel.loginUrl)}"`:''}>${esc(channel.description)}</p></div>${employee&&ready?`<button class="btn ghost sm" onclick="personalAgentLoginPrompt('${r.id}','${channel.id}')">${accounts.length?'＋ 添加账号':'登录 '+esc(channel.name)}</button>`:''}</div>${accounts.length?`<div class="pa-account-list">${visibleAccounts.map(account=>personalAgentAccountHTML(r,channel.id,account,employee)).join('')}${accounts.length>3?`<button type="button" class="pa-accounts-expand" data-account-toggle="${channel.id}" aria-expanded="${expanded}" onclick="personalAgentToggleAccounts('${r.id}','${channel.id}',${employee})"><span>${expanded?'收起账号':'展开其余 '+(accounts.length-3)+' 个账号'}</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>`:''}</div>`:''}</article>`;
 }).join('')}<p class="crm-context">本页为第三方登录交互演示，展示的账号信息为模拟数据。</p>`;
}
function personalAgentAddChannelPrompt(id){
 const record=personalAgentSetupRecord(id);
 if(!record||record.owner!==currentUser()||!['connecting','live'].includes(record.status))return;
 S.paCustomChannel={id,owner:currentUser()};
 $('mod').innerHTML=`<section class="mbox confirm-modal" role="dialog" aria-modal="true" aria-labelledby="pa-custom-title"><div class="mhd"><h3 id="pa-custom-title">添加公共渠道</h3><button class="ib" aria-label="关闭" onclick="closeMod()">×</button></div><form onsubmit="event.preventDefault();personalAgentSaveCustomChannel()"><div class="mbd"><div class="fld"><label for="pa-custom-name">平台名称</label><input id="pa-custom-name" maxlength="60" required placeholder="例如 Figma"></div><div class="fld"><label for="pa-custom-url">登录链接</label><input id="pa-custom-url" type="url" required placeholder="https://"></div><p id="pa-custom-error" role="alert" class="crm-context"></p></div><div class="mft"><button class="btn" type="submit">保存并登录</button><button class="btn ghost" type="button" onclick="closeMod()">取消</button></div></form></section>`;
 $('mod').classList.add('on');
}
function personalAgentSaveCustomChannel(){
 const draft=S.paCustomChannel,record=draft&&personalAgentSetupRecord(draft.id);
 if(!record||record.owner!==currentUser()||draft.owner!==currentUser()||!['connecting','live'].includes(record.status)||!$('mod').classList.contains('on'))return;
 const name=$('pa-custom-name').value.trim(),raw=$('pa-custom-url').value.trim();
 let url;
 try{url=new URL(raw);if(url.protocol!=='https:'||url.username||url.password)throw Error();}catch(_){$('pa-custom-error').textContent='请输入有效的 HTTPS 登录链接。';return;}
 if(!name||name.length>60){$('pa-custom-error').textContent='请填写平台名称，最多 60 个字符。';return;}
 if(personalAgentChannelList(record).some(channel=>channel.projectId===draft.projectId&&channel.name.toLowerCase()===name.toLowerCase())){$('pa-custom-error').textContent='该范围已存在此平台，请在对应卡片添加账号。';return;}
 record.customChannels=record.customChannels||[];
 S.paChannelSequence=(S.paChannelSequence||0)+1;
 const channel={id:'custom-'+S.paChannelSequence,name,mark:name.slice(0,1).toUpperCase(),description:url.href,loginUrl:url.href,required:false,projectId:draft.projectId};
 record.customChannels.push(channel);S.paChannelFilter={id:record.id,group:'public',project:''};S.paCustomChannel=null;closeMod();openPersonalAgentSetup(record.id);personalAgentLoginPrompt(record.id,channel.id);
}
function personalAgentDeleteChannelPrompt(id,channelId){
 const record=personalAgentSetupRecord(id),channel=record?.customChannels?.find(item=>item.id===channelId);
 if(!record||record.owner!==currentUser()||!['connecting','live'].includes(record.status)||!channel||!personalAgentChannelList(record).some(item=>item.id===channelId))return;
 S.paDeleteChannel={id,channelId,owner:currentUser(),scope:record.scope};
 $('mod').innerHTML=`<section class="mbox confirm-modal" role="dialog" aria-modal="true" aria-labelledby="pa-delete-channel-title"><div class="mhd"><h3 id="pa-delete-channel-title">删除 ${esc(channel.name)}？</h3><button class="ib" aria-label="关闭" onclick="closeMod()">×</button></div><div class="mbd"><p>删除后，将断开并移除该渠道下的全部账号。</p></div><div class="mft"><button class="btn danger" onclick="personalAgentDeleteChannel()">确认删除</button><button class="btn ghost" onclick="closeMod()">取消</button></div></section>`;
 $('mod').classList.add('on');
}
function personalAgentDeleteChannel(){
 const draft=S.paDeleteChannel,record=draft&&personalAgentSetupRecord(draft.id);
 if(!record||record.owner!==currentUser()||draft.owner!==currentUser()||record.scope!==draft.scope||!['connecting','live'].includes(record.status)||!$('mod').classList.contains('on'))return;
 if(!record.customChannels?.some(channel=>channel.id===draft.channelId)||!personalAgentChannelList(record).some(channel=>channel.id===draft.channelId))return;
 record.customChannels=record.customChannels.filter(channel=>channel.id!==draft.channelId);
 if(record.connections)delete record.connections[draft.channelId];
 if(S.paLogin?.id===record.id&&S.paLogin.channel===draft.channelId)S.paLogin=null;
 S.paDeleteChannel=null;closeMod();openPersonalAgentSetup(record.id);toast('渠道已删除');
}
function openPersonalAgentSetup(id,tab=0){
 const r=personalAgentSetupRecord(id);if(!r||r.owner!==currentUser()||!['connecting','live'].includes(r.status))return;
 closeDw();
 $('dw').innerHTML=`<section class="personal-agent-application" role="dialog" aria-modal="true" aria-label="助理设置"><header class="dw-h"><button class="ib" aria-label="关闭" onclick="closeDw()"><i data-lucide="x"></i></button><div style="flex:1"><div class="ty">我的 Agent · 设置</div><h3>${esc(r.name)}</h3></div><span class="st ${r.status==='live'?'done':'review'}">${PA_REVIEW_STATES[r.status]}</span></header><div class="dw-tabs">${['连接','构建','回答'].map((name,index)=>`<button class="${tab===index?'on':''}" onclick="openPersonalAgentSetup('${id}',${index})">${name}</button>`).join('')}</div><div class="dw-b">${tab===0?personalAgentChannelsHTML(r,true):tab===1?personalAgentBuildHTML(r):r.answers.map((answer,index)=>`<section class="pa-review-answer"><small>${index+1}. ${PERSONAL_AGENT_QUESTIONS[index].title}</small><p>${esc(answer)}</p></section>`).join('')}${tab===0&&r.status==='live'?'<div class="note">助理已上线。你可以开始使用已连接的工作渠道，所有操作仍遵循已批准的权限范围。</div>':''}</div>${tab===0?`<footer class="dw-f"><button class="btn ghost" onclick="personalAgentAddChannelPrompt('${r.id}')">＋ 添加公共渠道</button></footer>`:''}</section>`;
 $('dw').classList.add('on');$('scrim').classList.add('on');kpIcons();if(typeof syncDrawerExpandControl==='function')syncDrawerExpandControl();
}
function personalAgentLoginPrompt(id,channel,accountId){
 if(channel.startsWith('all-')){
  const record=personalAgentSetupRecord(id);
  if(!record||record.owner!==currentUser())return;
  const candidates=personalAgentChannelList(record).filter(item=>item.platform===channel.slice(4));
  candidates.sort((a,b)=>personalAgentChannelAccounts(record,a.id).length-personalAgentChannelAccounts(record,b.id).length);
  if(candidates[0])personalAgentLoginPrompt(id,candidates[0].id);
  return;
 }
 const record=personalAgentSetupRecord(id),info=record&&personalAgentChannelList(record).find(item=>item.id===channel);
 if(!record||record.owner!==currentUser()||!['connecting','live'].includes(record.status)||!info)return;
 const existing=accountId?personalAgentChannelAccounts(record,channel).find(account=>account.id===accountId):null;
 if(accountId&&(!existing||existing.connected!==false))return;
 const account=existing||personalAgentDemoAccount(record,channel);
 const login={id,channel,owner:currentUser(),stage:'loading',account,reconnect:!!existing};
 S.paLogin=login;
 drawPersonalAgentLogin();
 setTimeout(()=>{
  if(!personalAgentLoginActive(login))return;
  login.stage='success';
  drawPersonalAgentLogin();
 },1500);
}
function personalAgentLoginActive(login){
 const record=personalAgentSetupRecord(login.id);
 return S.paLogin===login&&login.owner===currentUser()&&record?.owner===login.owner&&['connecting','live'].includes(record.status)
  &&$('mod').classList.contains('on')&&!!$('pa-login-dialog');
}
function drawPersonalAgentLogin(){
 const login=S.paLogin,record=login&&personalAgentSetupRecord(login.id),info=record&&personalAgentChannelList(record).find(item=>item.id===login.channel);
 if(!info)return;
 const success=login.stage==='success';
 $('mod').innerHTML=`<section id="pa-login-dialog" class="mbox confirm-modal" role="dialog" aria-modal="true" aria-labelledby="pa-login-title">
  <div class="mhd"><h3 id="pa-login-title">${esc(info.name)} 登录</h3><button class="ib" aria-label="关闭登录演示" onclick="cancelPersonalAgentLogin()">×</button></div>
  <div class="mbd"><p role="status">${success?'模拟登录成功':`<span class="spin" aria-hidden="true"></span> 正在跳转至 ${esc(info.name)} 登录…`}</p>${success?`<div class="pa-login-account"><b>${esc(login.account.name)}</b></div>`:''}<p class="crm-context">第三方登录演示，账号名称为模拟数据。</p>${info.loginUrl?`<a class="btn ghost sm" href="${esc(info.loginUrl)}" target="_blank" rel="noopener noreferrer">打开登录页面 ↗</a>`:''}</div>
  <div class="mft">${success?'<button class="btn" onclick="finishPersonalAgentLogin()">返回助理设置</button>':'<button class="btn ghost" onclick="cancelPersonalAgentLogin()">取消</button>'}</div>
 </section>`;
 $('mod').classList.add('on');
}
function cancelPersonalAgentLogin(){S.paLogin=null;closeMod();}
function finishPersonalAgentLogin(){
 const login=S.paLogin;
 if(!login||login.stage!=='success'||!personalAgentLoginActive(login))return;
 if(login.reconnect&&!personalAgentChannelAccounts(personalAgentSetupRecord(login.id),login.channel).some(account=>account.id===login.account.id&&account.connected===false))return;
 S.paLogin=null;
 closeMod();
 personalAgentConnectChannel(login.id,login.channel,login.account);
}
function personalAgentConnectChannel(id,channel,account){
 const r=personalAgentSetupRecord(id);if(!r||r.owner!==currentUser()||!['connecting','live'].includes(r.status)||!personalAgentChannelList(r).some(c=>c.id===channel))return;
 const accounts=personalAgentChannelAccounts(r,channel);
 if(account&&accounts.some(item=>item.id===account.id&&item.connected!==false))return;
 const identity=account||personalAgentDemoAccount(r,channel);
 const info=personalAgentChannelList(r).find(item=>item.id===channel);
 const connected={...identity,projectId:info.projectId,connected:true,connectedAt:new Date().toISOString(),owner:currentUser(),demo:true};
 r.connections=r.connections||{};r.connections[channel]=accounts.some(item=>item.id===identity.id)?accounts.map(item=>item.id===identity.id?connected:item):[...accounts,connected];
 if(r.status==='connecting'&&PA_CHANNELS.filter(c=>c.required).every(c=>personalAgentChannelConnected(r,c.id)))personalAgentActivate(id);
 else openPersonalAgentSetup(id);
}
function personalAgentActivate(id){
 const r=personalAgentSetupRecord(id);if(!r||r.owner!==currentUser()||r.status!=='connecting'||!PA_CHANNELS.filter(c=>c.required).every(c=>personalAgentChannelConnected(r,c.id)))return;
 r.status='live';r.activatedAt=new Date().toISOString();personalAgentSyncStatus(r);render();openPersonalAgentSetup(id);toast('助理已上线');
}
function personalAgentDisconnectPrompt(id,channel,accountId,remove=false){
 const r=personalAgentSetupRecord(id),info=r&&personalAgentChannelList(r).find(c=>c.id===channel);
 if(!r||r.owner!==currentUser()||!['connecting','live'].includes(r.status)||!info)return;
 const accounts=personalAgentChannelAccounts(r,channel),account=accounts.find(item=>item.id===accountId)||(!accountId?accounts[0]:null);
 if(!account||(!remove&&account.connected===false))return;
 S.paDisconnect={id,channel,accountId:account.id,owner:currentUser(),remove};
 const lastRequired=info.required&&account.connected!==false&&!accounts.some(item=>item.id!==account.id&&item.connected!==false);
 $('mod').innerHTML=`<section class="mbox confirm-modal" role="dialog" aria-modal="true" aria-labelledby="pa-disconnect-title"><div class="mhd"><h3 id="pa-disconnect-title">${remove?'删除':'断开'} ${esc(info.name)} 账号？</h3><button class="ib" aria-label="关闭" onclick="closeMod()">×</button></div><div class="mbd"><p>${esc(account.name)}</p>${remove?'<p>删除将断开连接并移除该账号信息。</p>':''}<p>${lastRequired?'这是该必需平台的最后一个账号，断开后助理将回到待连接状态。':'断开此账号后，可继续使用其他已登录账号。'}</p></div><div class="mft"><button class="btn" onclick="personalAgentConfirmDisconnect()">${remove?'确认删除':'确认断开'}</button><button class="btn ghost" onclick="closeMod()">取消</button></div></section>`;
 $('mod').classList.add('on');
}
function personalAgentConfirmDisconnect(){
 const draft=S.paDisconnect;if(!draft||draft.owner!==currentUser()||!$('mod').classList.contains('on'))return;
 const r=personalAgentSetupRecord(draft.id),info=r&&personalAgentChannelList(r).find(c=>c.id===draft.channel);
 if(!r||r.owner!==currentUser()||!['connecting','live'].includes(r.status)||!info)return;
 const accounts=personalAgentChannelAccounts(r,draft.channel);
 if(!accounts.some(account=>account.id===draft.accountId))return;
 const remaining=draft.remove?accounts.filter(account=>account.id!==draft.accountId):accounts.map(account=>account.id===draft.accountId?{...account,connected:false,disconnectedAt:new Date().toISOString()}:account);
 r.connections[draft.channel]=remaining;
 if(!remaining.length)delete r.connections[draft.channel];
 if(info.required&&!personalAgentChannelConnected(r,draft.channel)&&r.status==='live')r.status='connecting';
 personalAgentSyncStatus(r);S.paDisconnect=null;closeMod();render();openPersonalAgentSetup(r.id);toast(draft.remove?'账号已删除':'连接已断开，账号信息已保留');
}
