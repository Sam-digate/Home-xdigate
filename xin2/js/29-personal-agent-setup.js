/* Session-only build and connection walkthrough; never requests real credentials. */
const PA_CHANNELS=[
 {id:'slack',name:'Slack',required:true,mark:'S',description:'通过私信接收简报，与助理沟通工作事项。'},
 {id:'m365',name:'Microsoft 365',required:true,mark:'M',description:'连接邮件、日历、Teams 和 SharePoint，在授权范围内读取工作信息。'},
 {id:'xdgate',name:'XDGate',required:true,mark:'X',description:'查看当前账号可访问的项目和任务。'},
 {id:'github',name:'GitHub',required:false,mark:'G',description:'可选，只读取已授权的代码仓库和项目进展。'},
 {id:'notion',name:'Notion',required:false,mark:'N',description:'可选，只读取明确共享给助理的页面。'}
];
function personalAgentBuildProgressHTML(r){return r.status==='building'?`<div class="pa-build-progress"><div class="live"><div class="live-h"><span class="spin"></span><span class="t">正在构建个人助理</span><span class="e">${r.buildProgress||10}%</span></div><div class="live-t">${(r.buildProgress||10)<40?'整理申请目标与权限范围…':r.buildProgress<75?'配置助理能力和运行位置…':'检查设置，准备工作渠道连接…'}</div><div class="pbar" role="progressbar" aria-label="助理构建进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${r.buildProgress||10}"><i style="width:${r.buildProgress||10}%"></i></div></div></div>`:'';}
function personalAgentSetupRecord(id){return personalAgentReviewList().find(r=>r.id===id);}
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
function personalAgentChannelsHTML(r,employee=false){
 const ready=['connecting','live'].includes(r.status),connections=r.connections||{},count=PA_CHANNELS.filter(c=>connections[c.id]).length;
 return `<div class="pa-setup-intro"><h3>${esc(r.name)}${ready?' 已就绪，连接你的工作渠道':' · 工作渠道'}</h3><p>${employee?'每个渠道只需连接一次。助理默认只读，对外发送前会先询问你。':'工作账号由申请人本人连接。'} 已登录 ${count} / ${PA_CHANNELS.length}。</p></div>${PA_CHANNELS.map(c=>`<article class="pa-channel-card"><span class="pa-review-avatar">${c.mark}</span><div class="pa-review-info"><div class="pa-review-title"><b>${c.name}</b>${c.required?'<span class="chip mut">必需</span>':''}</div><p>${c.description}</p></div>${connections[c.id]?`<div class="pa-channel-actions"><span class="st done">已登录</span>${employee?`<button class="btn ghost sm" onclick="personalAgentDisconnectPrompt('${r.id}','${c.id}')">断开连接</button>`:''}</div>`:employee&&ready?`<button class="btn ghost sm" onclick="personalAgentLoginPrompt('${r.id}','${c.id}')">登录 ${c.name}</button>`:'<span class="st todo">未登录</span>'}</article>`).join('')}<p class="crm-context">本页为第三方登录交互演示。</p>`;
}
function openPersonalAgentSetup(id,tab=0){
 const r=personalAgentSetupRecord(id);if(!r||r.owner!==currentUser()||!['connecting','live'].includes(r.status))return;
 closeDw();
 $('dw').innerHTML=`<section class="personal-agent-application" role="dialog" aria-modal="true" aria-label="助理设置"><header class="dw-h"><button class="ib" aria-label="关闭" onclick="closeDw()"><i data-lucide="x"></i></button><div style="flex:1"><div class="ty">我的 Agent · 设置</div><h3>${esc(r.name)}</h3></div><span class="st ${r.status==='live'?'done':'review'}">${PA_REVIEW_STATES[r.status]}</span></header><div class="dw-tabs">${['连接','构建','回答'].map((name,index)=>`<button class="${tab===index?'on':''}" onclick="openPersonalAgentSetup('${id}',${index})">${name}</button>`).join('')}</div><div class="dw-b">${tab===0?personalAgentChannelsHTML(r,true):tab===1?personalAgentBuildHTML(r):r.answers.map((answer,index)=>`<section class="pa-review-answer"><small>${index+1}. ${PERSONAL_AGENT_QUESTIONS[index].title}</small><p>${esc(answer)}</p></section>`).join('')}${tab===0&&r.status==='live'?'<div class="note">助理已上线。你可以在 Slack 中与它开始对话，所有操作仍遵循已批准的权限范围。</div>':''}</div></section>`;
 $('dw').classList.add('on');$('scrim').classList.add('on');kpIcons();if(typeof syncDrawerExpandControl==='function')syncDrawerExpandControl();
}
function personalAgentLoginPrompt(id,channel){
 const record=personalAgentSetupRecord(id),info=PA_CHANNELS.find(item=>item.id===channel);
 if(!record||record.owner!==currentUser()||!['connecting','live'].includes(record.status)||!info||record.connections?.[channel])return;
 const login={id,channel,owner:currentUser(),stage:'loading'};
 S.paLogin=login;
 drawPersonalAgentLogin();
 setTimeout(()=>{
  if(!personalAgentLoginActive(login))return;
  login.stage='success';
  drawPersonalAgentLogin();
 },1500);
}
function personalAgentLoginActive(login){
 return S.paLogin===login&&login.owner===currentUser()&&!!personalAgentSetupRecord(login.id)
  &&$('mod').classList.contains('on')&&!!$('pa-login-dialog');
}
function drawPersonalAgentLogin(){
 const login=S.paLogin,info=PA_CHANNELS.find(item=>item.id===login?.channel);
 if(!info)return;
 const success=login.stage==='success';
 $('mod').innerHTML=`<section id="pa-login-dialog" class="mbox confirm-modal" role="dialog" aria-modal="true" aria-labelledby="pa-login-title">
  <div class="mhd"><h3 id="pa-login-title">${info.name} 登录</h3><button class="ib" aria-label="关闭登录演示" onclick="cancelPersonalAgentLogin()">×</button></div>
  <div class="mbd"><p role="status">${success?'模拟登录成功':`<span class="spin" aria-hidden="true"></span> 正在跳转至 ${info.name} 登录…`}</p><p class="crm-context">第三方登录演示，无需输入真实账号。</p></div>
  <div class="mft">${success?'<button class="btn" onclick="finishPersonalAgentLogin()">返回助理设置</button>':'<button class="btn ghost" onclick="cancelPersonalAgentLogin()">取消</button>'}</div>
 </section>`;
 $('mod').classList.add('on');
}
function cancelPersonalAgentLogin(){S.paLogin=null;closeMod();}
function finishPersonalAgentLogin(){
 const login=S.paLogin;
 if(!login||login.stage!=='success'||!personalAgentLoginActive(login))return;
 S.paLogin=null;
 closeMod();
 personalAgentConnectChannel(login.id,login.channel);
}
function personalAgentConnectChannel(id,channel){
 const r=personalAgentSetupRecord(id);if(!r||r.owner!==currentUser()||!['connecting','live'].includes(r.status)||!PA_CHANNELS.some(c=>c.id===channel))return;
 r.connections=r.connections||{};r.connections[channel]={connectedAt:new Date().toISOString(),owner:currentUser(),demo:true};
 if(r.status==='connecting'&&PA_CHANNELS.filter(c=>c.required).every(c=>r.connections[c.id]))personalAgentActivate(id);
 else openPersonalAgentSetup(id);
}
function personalAgentActivate(id){
 const r=personalAgentSetupRecord(id);if(!r||r.owner!==currentUser()||r.status!=='connecting'||!PA_CHANNELS.filter(c=>c.required).every(c=>r.connections?.[c.id]))return;
 r.status='live';r.activatedAt=new Date().toISOString();personalAgentSyncStatus(r);render();openPersonalAgentSetup(id);toast('助理已上线');
}
function personalAgentDisconnectPrompt(id,channel){
 const r=personalAgentSetupRecord(id),info=PA_CHANNELS.find(c=>c.id===channel);
 if(!r||r.owner!==currentUser()||!r.connections?.[channel]||!info)return;
 S.paDisconnect={id,channel,owner:currentUser()};
 $('mod').innerHTML=`<section class="mbox confirm-modal" role="dialog" aria-modal="true" aria-labelledby="pa-disconnect-title"><div class="mhd"><h3 id="pa-disconnect-title">断开 ${info.name}？</h3><button class="ib" aria-label="关闭" onclick="closeMod()">×</button></div><div class="mbd"><p>${info.required?'这是必需渠道，断开后助理将回到待连接状态。重新连接全部必需渠道后，助理将自动上线。':'断开后助理将无法使用该渠道，其他渠道不受影响。'}</p></div><div class="mft"><button class="btn" onclick="personalAgentConfirmDisconnect()">确认断开</button><button class="btn ghost" onclick="closeMod()">取消</button></div></section>`;
 $('mod').classList.add('on');
}
function personalAgentConfirmDisconnect(){
 const draft=S.paDisconnect;if(!draft||draft.owner!==currentUser()||!$('mod').classList.contains('on'))return;
 const r=personalAgentSetupRecord(draft.id),info=PA_CHANNELS.find(c=>c.id===draft.channel);
 if(!r||r.owner!==currentUser()||!r.connections?.[draft.channel]||!info)return;
 delete r.connections[draft.channel];if(info.required&&r.status==='live')r.status='connecting';
 personalAgentSyncStatus(r);S.paDisconnect=null;closeMod();render();openPersonalAgentSetup(r.id);toast('连接已断开');
}
