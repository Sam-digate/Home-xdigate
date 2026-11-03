/* Personal Agent application demo, scoped to the current employee. */
const PERSONAL_AGENT_QUESTIONS=[
 {title:'你希望助理帮你达成什么？',hint:'Objectives — 最重要的 2–3 件事。',placeholder:'例如：每天早上一份简报；跟进团队 OKR；提醒我没回复的邮件'},
 {title:'你向谁汇报？',hint:'Reports to — 助理会按此准备周报。',placeholder:'例如：CEO'},
 {title:'你的团队结构是怎样的？',hint:'Team — 下属、合作团队、主要客户。',placeholder:'例如：运营 5 人、客服 6 人；个人岗位可填写无下属'},
 {title:'你每天用哪些工具？',hint:'Tools — 决定需要连接哪些渠道。',placeholder:'Slack、Outlook、Teams、XDGate、SharePoint…'},
 {title:'助理可以自己做什么？',hint:'Autonomy — 用于建议自主级别 M1/M2/M3，默认 M1：发送前逐条问你。',placeholder:'例如：可以起草邮件，但发送前要我确认'}
];
const PERSONAL_AGENT_TOOLS=['Slack','Outlook','Teams','XDGate','SharePoint','GitHub','Notion','其他'];
function personalAgentReceiptHTML(app){
 const status=app.reviewStatus||'pending';
 const labels={pending:'待审批',building:'构建中',connecting:'待连接',live:'已上线',rejected:'已拒绝'};
 const text={pending:'管理员审批后，我们会在云端为你构建助理，并通过 Slack 或邮件发送连接链接。通常在一个工作日内完成。',building:'管理员已批准你的申请，正在构建助理。构建完成后，你可以连接工作账号。',connecting:'助理已就绪，等待连接工作账号。',live:'你的个人助理已上线。',rejected:'申请未通过，可修改回答后重新提交。'};
 return `<div class="pa-success"><span class="st review">${labels[status]}</span><h2>${status==='pending'?'已提交，谢谢！':labels[status]}</h2><p>${text[status]}</p>${['pending','rejected'].includes(status)?'<button class="btn ghost" onclick="editPersonalAgentApplication()">修改回答</button>':''}</div>`;
}
function personalAgentQuestionsHTML(app){
 return `<form id="pa-form" onsubmit="event.preventDefault();submitPersonalAgentApplication()">${PERSONAL_AGENT_QUESTIONS.map((q,i)=>`<section class="pa-question"><h3><label ${i===3?'':'for="pa-answer-'+i+'"'}>${i+1}. ${q.title}</label></h3><p id="pa-hint-${i}">${q.hint}</p>${i===3?`<div class="pa-tools" role="group" aria-label="常用工具（可多选）">${PERSONAL_AGENT_TOOLS.map((tool,n)=>`<label><input type="checkbox" ${app.tools?.includes(tool)?'checked':''} onchange="togglePersonalAgentTool(${n},this.checked)"><span>${tool}</span></label>`).join('')}</div><input class="pa-other-tool" id="pa-other-tool" aria-label="其他工具" placeholder="请填写其他常用工具，多个工具可用顿号分隔" value="${esc(app.otherTool||'')}" ${app.tools?.includes('其他')?'':'hidden'} oninput="savePersonalAgentOtherTool(this.value)">`:`<textarea id="pa-answer-${i}" rows="${i===1?2:3}" aria-describedby="pa-hint-${i}" placeholder="${q.placeholder}" oninput="savePersonalAgentAnswer(this.value,${i})">${esc(app.answers[i])}</textarea>`}<p id="pa-error-${i}" class="pa-field-error" role="alert"></p></section>`).join('')}</form>`;
}
function syncPersonalAgentTools(app){app.answers[3]=(app.tools||[]).filter(t=>t!=='其他').concat(app.tools?.includes('其他')&&app.otherTool?.trim()?[app.otherTool.trim()]:[]).join('、');}
function togglePersonalAgentTool(index,checked){
 if(S.personalAgentApplicationOwner!==currentUser())return;
 const app=personalAgentApplication(),tool=PERSONAL_AGENT_TOOLS[index];if(!tool)return;
 app.tools=(app.tools||[]).filter(t=>t!==tool);if(checked)app.tools.push(tool);
 syncPersonalAgentTools(app);$('pa-error-3').textContent='';
 if(tool==='其他'){$('pa-other-tool').hidden=!checked;if(checked)$('pa-other-tool').focus();}
}
function savePersonalAgentOtherTool(value){if(S.personalAgentApplicationOwner!==currentUser())return;const app=personalAgentApplication();app.otherTool=value;syncPersonalAgentTools(app);$('pa-error-3').textContent='';}
function personalAgentApplication(){
 S.personalAgentApplications=S.personalAgentApplications||{};
 const owner=currentUser();
 return S.personalAgentApplications[owner]||(S.personalAgentApplications[owner]={owner,answers:['','','','',''],step:0,status:'draft'});
}
function openPersonalAgentApplication(){
 closeDw();S.personalAgentApplicationOwner=currentUser();drawPersonalAgentApplication();
 $('dw').classList.add('on');$('scrim').classList.add('on');
 if(typeof syncDrawerExpandControl==='function')syncDrawerExpandControl();
}
function drawPersonalAgentApplication(editing=false){
 if(S.personalAgentApplicationOwner!==currentUser())return;
 const app=personalAgentApplication(),submitted=app.status!=='draft'&&!editing;
 $('dw').innerHTML=`<section class="personal-agent-application" role="dialog" aria-modal="true" aria-label="申请我的 Agent"><header class="dw-h"><button class="ib" aria-label="关闭" onclick="closeDw()"><i data-lucide="x"></i></button><div style="flex:1"><div class="ty">Agents · 个人助理</div><h3>申请我的 Agent</h3></div>${submitted?'<span class="st review">待审批</span>':''}</header><div class="dw-b">${submitted?personalAgentReceiptHTML(app):`<div class="pa-intro"><h2>申请你的个人助理</h2><p>5 个问题，大约 3 分钟。提交后由管理员审批，审批通过后你会收到连接 Slack 和 Microsoft 365 的链接。</p></div>${personalAgentQuestionsHTML(app)}`}</div><footer class="dw-f pa-footer">${submitted?'<button class="btn ghost" onclick="closeDw()">完成</button>':`<button class="btn" type="submit" form="pa-form">提交申请</button>`}</footer></section>`;
 kpIcons();
}
function savePersonalAgentAnswer(value,index){
 if(S.personalAgentApplicationOwner!==currentUser())return;
 if(![0,1,2,4].includes(index))return;personalAgentApplication().answers[index]=value;
 if($('pa-error-'+index))$('pa-error-'+index).textContent='';
}
function editPersonalAgentApplication(){
 if(S.personalAgentApplicationOwner!==currentUser())return;
 personalAgentApplication().step=0;drawPersonalAgentApplication(true);
}
function submitPersonalAgentApplication(){
 if(S.personalAgentApplicationOwner!==currentUser())return;
 const app=personalAgentApplication();syncPersonalAgentTools(app);let first=-1;
 for(let i=0;i<5;i++){
  const invalid=!app.answers[i].trim()||(i===3&&app.tools?.includes('其他')&&!app.otherTool?.trim());
  $('pa-error-'+i).textContent=invalid?'请补充这一项的回答。':'';if(invalid&&first===-1)first=i;
 }
 if(first!==-1){$(first===3?(app.tools?.includes('其他')?'pa-other-tool':'pa-form'):'pa-answer-'+first)?.focus();return;}
 app.status='pending';app.reviewStatus='pending';app.submittedAt=new Date().toISOString();app.submittedAnswers=[...app.answers];personalAgentSubmitForReview(app);render();drawPersonalAgentApplication();
}
