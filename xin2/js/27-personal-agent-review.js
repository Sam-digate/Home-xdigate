const PA_REVIEW_STATES={pending:'待审批',building:'构建中',connecting:'待连接',live:'已上线',rejected:'已拒绝'};
function personalAgentBuildHTML(r){
 const editable=['pending','building'].includes(r.status),modules=r.modules||(r.job.includes('SEM')?['sem','email','research']:r.job.includes('产品')?['dev-projects','research']:['email','research']);
 return `<section class="pa-build-card"><h4>成熟度 · 由第 5 题建议</h4><div class="pa-build-level"><span class="chip lv">${r.level} ${r.level==='M1'?'本人逐条确认':'草稿后发送'}</span><span>上线后按表现指标升级，与登记处规则一致</span></div><div class="pa-build-fields"><div><label for="pa-review-name">Agent 名字</label><input id="pa-review-name" value="${esc(r.name)}" ${editable?'':'disabled'} oninput="savePersonalAgentReviewName('${r.id}',this.value)"></div><div><label for="pa-review-location">运行位置</label><select id="pa-review-location" ${editable?'':'disabled'} onchange="savePersonalAgentReviewLocation('${r.id}',this.value)">${['云服务器 VPS','本人电脑'].map(location=>`<option ${location===(r.runtime||'云服务器 VPS')?'selected':''}>${location}</option>`).join('')}</select></div></div><div class="pa-build-modules"><label>建议模块</label><div>${modules.map(name=>`<span class="chip mut">${esc(name)}</span>`).join('')}</div></div></section>`;
}
function savePersonalAgentReviewLocation(id,value){
 if(!personalAgentCanReview()||!['云服务器 VPS','本人电脑'].includes(value))return;
 const r=personalAgentReviewList().find(r=>r.id===id);if(r&&['pending','building'].includes(r.status))r.runtime=value;
}
function personalAgentCanReview(){return ['admin','super'].includes(permissionCurrentMember()?.role);}
function personalAgentReviewScope(){return permissionCurrentTenantAdmin()?.id||'default';}
function personalAgentReviewList(){
 S.personalAgentReviewRecords=S.personalAgentReviewRecords||[];
 const scope=personalAgentReviewScope();S.personalAgentReviewSeeds=S.personalAgentReviewSeeds||{};
 if(!S.personalAgentReviewSeeds[scope]){
  S.personalAgentReviewSeeds[scope]=true;
  const examples=[['A-0142','Ava','Sophie','COO','pending','跟进各部门 OKR，每天早上给我一份简报，提醒我未回复的邮件和会议待办。','CEO','Slack、Microsoft 365、XDGate','M1','经理'],['A-0141','Sami','Lily Chen','SEM 经理','pending','每周汇总广告账户表现，找出花费异常的关键词。','市场总监','Slack、Microsoft 365','M1','员工'],['A-0139','Pia','Ariel','产品经理','building','跟踪 GitHub 上的功能进度和测试反馈。','CTO','Slack、GitHub、Notion','M1','员工'],['A-0137','Max','Shlomi','CEO','connecting','全公司概览、BD 管道、关键决策跟进。','董事会','Slack、Microsoft 365、XDGate','M2','经理'],['A-0131','Otto','运营团队','公司运营','live','政策、任务、SharePoint 与 Teams 会议纪要。','COO','Slack、Microsoft 365、XDGate','M1','公司']];
  for(const [id,name,applicant,job,status,goal,manager,tools,level,type] of examples)S.personalAgentReviewRecords.push({id,scope,name,applicant,job,status,level,type,submittedAt:new Date().toISOString(),answers:[goal,manager,type==='公司'?'运营团队协作':'个人岗位，与相关团队协作',tools,'只读；对外发送前需要本人确认']});
 }
 return S.personalAgentReviewRecords.filter(r=>r.scope===scope);
}
function personalAgentSubmitForReview(app){
 const list=personalAgentReviewList(),existing=list.find(r=>r.owner===app.owner&&r.status==='pending');
 const data={answers:[...app.submittedAnswers],submittedAt:app.submittedAt};
 if(existing){Object.assign(existing,data);return;}
 S.personalAgentReviewRecords.push({...data,id:'PA-'+Date.now(),scope:personalAgentReviewScope(),owner:app.owner,name:(U[app.owner]?.n||app.owner)+' 的 Agent',applicant:U[app.owner]?.n||app.owner,job:'个人助理申请',status:'pending',level:'M1',type:'员工'});
}
function personalAgentReviewBadge(){return personalAgentCanReview()?personalAgentReviewList().filter(r=>r.status==='pending').length:0;}
function personalAgentReviewView(){
 if(!personalAgentCanReview())return '<div class="allclear">暂无审核权限</div>';
 const all=personalAgentReviewList(),filter=S.paReviewFilter||'all',list=all.filter(r=>filter==='all'||r.status===filter);
 return `<div class="bar"><div class="seg">${[['all','全部'],...Object.entries(PA_REVIEW_STATES)].map(([key,name])=>`<button class="${filter===key?'on':''}" onclick="S.paReviewFilter='${key}';render()">${name} ${key==='all'?all.length:all.filter(r=>r.status===key).length}</button>`).join('')}</div></div>${list.map(r=>`<article class="pa-review-card"><span class="pa-review-avatar">${esc(r.name.slice(0,1))}</span><div class="pa-review-info"><div class="pa-review-title"><b>${esc(r.name)}</b><span>for ${esc(r.applicant)} · ${esc(r.job)}</span><span class="st ${r.status==='live'?'done':r.status==='building'?'todo':'review'}">${PA_REVIEW_STATES[r.status]}</span><span class="chip lv">${r.level} ${r.level==='M1'?'本人逐条确认':'草稿后发送'}</span><span class="chip mut">${esc(r.type)}</span></div><p>${esc(r.answers[0])}</p><small>${esc(r.id)} · 提交 ${esc(kbHistoryTime(r.submittedAt))} · 汇报给 ${esc(r.answers[1])} · 需连接 ${esc(r.answers[3])}</small></div><div class="pa-review-actions">${r.status==='pending'?`<button class="btn ghost sm pa-review-reject" onclick="openPersonalAgentReview('${r.id}',0,true)">拒绝</button><button class="btn sm" onclick="decidePersonalAgentReview('${r.id}','approve')">批准</button>`:''}<button class="btn ghost sm" onclick="openPersonalAgentReview('${r.id}')">查看详情</button></div></article>`).join('')||'<div class="allclear">暂无相关申请</div>'}`;
}
function openPersonalAgentReview(id,tab=0,reject=false){
 if(!personalAgentCanReview())return;
 const r=personalAgentReviewList().find(r=>r.id===id);if(!r)return;
 closeDw();S.paReviewId=id;
 const stage={pending:0,rejected:0,building:1,connecting:2,live:4}[r.status];
 $('dw').innerHTML=`<section class="personal-agent-application" role="dialog" aria-modal="true" aria-label="申请审核"><header class="dw-h"><button class="ib" aria-label="关闭" onclick="closeDw()"><i data-lucide="x"></i></button><div style="flex:1"><div class="ty">申请 ${esc(r.id)} · ${esc(r.applicant)}</div><h3>${esc(r.name)} · 个人助理</h3></div><span class="st review">${PA_REVIEW_STATES[r.status]}</span></header><div class="dw-tabs">${['回答','构建','连接'].map((name,i)=>`<button class="${tab===i?'on':''}" onclick="openPersonalAgentReview('${id}',${i})">${name}</button>`).join('')}</div><div class="dw-b"><div class="pa-review-stages">${['提交','批准','构建','连接','上线'].map((name,i)=>`<div class="${i<=stage?'done':''}">${name}<b>${i<=stage?'✓':'—'}</b></div>`).join('')}</div>${tab===0?r.answers.map((answer,i)=>`<section class="pa-review-answer"><small>${i+1}. ${PERSONAL_AGENT_QUESTIONS[i].title}</small><p>${esc(answer)}</p></section>`).join(''):tab===1?personalAgentBuildHTML(r):`<section class="pa-review-answer"><h3>工作渠道</h3><p>${esc(r.answers[3])}</p><p>${r.status==='pending'?'审批通过并完成构建后，由申请人连接工作账号。':r.status==='live'?'工作渠道已连接。':'等待申请人连接工作账号。'}</p></section>`}${r.status==='rejected'?`<section class="pa-review-answer"><b>拒绝原因</b><p>${esc(r.rejectionReason)}</p></section>`:''}${r.status==='pending'?`<section id="pa-reject-panel" class="pa-question" ${reject?'':'hidden'}><h3><label for="pa-reject-reason">拒绝原因</label></h3><textarea id="pa-reject-reason" rows="3" placeholder="请说明需要补充或调整的内容"></textarea><p id="pa-reject-error" role="alert"></p><button class="btn ghost pa-review-reject" onclick="decidePersonalAgentReview('${id}','reject')">确认拒绝</button></section>`:''}</div><footer class="dw-f">${r.status==='pending'?`<button class="btn" onclick="decidePersonalAgentReview('${id}','approve')">批准并构建</button><button class="btn ghost pa-review-reject" onclick="$('pa-reject-panel').hidden=false;$('pa-reject-reason').focus()">拒绝</button>`:'<button class="btn ghost" onclick="closeDw()">完成</button>'}</footer></section>`;
 $('dw').classList.add('on');$('scrim').classList.add('on');kpIcons();if(typeof syncDrawerExpandControl==='function')syncDrawerExpandControl();
}
function savePersonalAgentReviewName(id,value){if(!personalAgentCanReview())return;const r=personalAgentReviewList().find(r=>r.id===id);if(r&&['pending','building'].includes(r.status))r.name=value;}
function decidePersonalAgentReview(id,decision){
 if(!personalAgentCanReview())return;const r=personalAgentReviewList().find(r=>r.id===id);if(r?.status!=='pending'||!['approve','reject'].includes(decision))return;
 if(decision==='reject'){const reason=$('pa-reject-reason')?.value.trim();if(!reason){if($('pa-reject-error'))$('pa-reject-error').textContent='请填写拒绝原因';return;}r.rejectionReason=reason;}
 if(decision==='approve'&&!r.name.trim()){toast('请填写 Agent 名字');return;}
 r.status=decision==='approve'?'building':'rejected';r.reviewedBy=currentUser();r.reviewedAt=new Date().toISOString();
 const app=S.personalAgentApplications?.[r.owner];if(app){app.reviewStatus=r.status;app.reviewId=r.id;}
 render();if(S.paReviewId===id)openPersonalAgentReview(id);toast(decision==='approve'?'申请已批准，开始构建':'申请已拒绝');
}
