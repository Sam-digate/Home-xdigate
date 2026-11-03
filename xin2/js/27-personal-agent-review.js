const PA_REVIEW_STATES={pending:'待审批',building:'构建中',connecting:'待连接',live:'已上线',rejected:'已拒绝'};
const PA_AUTONOMY={
 M1:{name:'本人逐条确认',description:'助理准备草稿或操作建议，每项对外操作都由本人确认后执行。'},
 M2:{name:'按批准范围执行',description:'在管理员批准的任务与权限范围内处理工作，超出范围时请求确认。'},
 M3:{name:'自动执行 · 例外找人',description:'按已批准的规则自动执行，遇到异常、权限不足或超出范围时交由人工处理。'}
};
function personalAgentAutonomyHTML(r){
 const recommended=r.recommendedLevel||'M1',editable=r.status==='pending';
 return `<h4><label for="pa-review-level">自主级别</label></h4><div class="pa-build-level"><select id="pa-review-level" ${editable?'':'disabled'} onchange="savePersonalAgentReviewLevel('${r.id}',this.value)">${Object.entries(PA_AUTONOMY).map(([level,option])=>`<option value="${level}" ${r.level===level?'selected':''}>${level} ${option.name}</option>`).join('')}</select><span>根据第 5 题建议 ${recommended} · 由管理员最终确认</span></div><p class="pa-autonomy-description">${PA_AUTONOMY[r.level]?.description||PA_AUTONOMY.M1.description}</p>`;
}
function savePersonalAgentReviewLevel(id,value){
 if(!personalAgentCanReview()||!PA_AUTONOMY[value])return;
 const r=personalAgentReviewList().find(r=>r.id===id);if(r?.status!=='pending'||r.level===value)return;
 r.recommendedLevel=r.recommendedLevel||'M1';r.levelHistory=r.levelHistory||[];
 r.levelHistory.push({from:r.level,to:value,actor:currentUser(),at:new Date().toISOString(),reason:'审批前确认自主级别'});r.level=value;
 render();openPersonalAgentReview(id,1);
}
function personalAgentBuildHTML(r){
 const editable=['pending','building'].includes(r.status),modules=r.modules||(r.job.includes('SEM')?['sem','email','research']:r.job.includes('产品')?['dev-projects','research']:['email','research']);
 return `<section class="pa-build-card">${personalAgentAutonomyHTML(r)}<div class="pa-build-fields"><div><label for="pa-review-name">Agent 名字</label><input id="pa-review-name" value="${esc(r.name)}" ${editable?'':'disabled'} oninput="savePersonalAgentReviewName('${r.id}',this.value)"></div><div><label for="pa-review-location">运行位置</label><select id="pa-review-location" ${editable?'':'disabled'} onchange="savePersonalAgentReviewLocation('${r.id}',this.value)">${['云服务器 VPS','本人电脑'].map(location=>`<option ${location===(r.runtime||'云服务器 VPS')?'selected':''}>${location}</option>`).join('')}</select></div></div><div class="pa-build-modules"><label>建议模块</label><div>${modules.map(name=>`<span class="chip mut">${esc(name)}</span>`).join('')}</div></div>${personalAgentBuildProgressHTML(r)}</section>`;
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
 const list=personalAgentReviewList(),existing=list.find(r=>r.owner===app.owner);
 const data={answers:[...app.submittedAnswers],submittedAt:app.submittedAt};
 if(existing){
  if(existing.status==='rejected'){
   existing.reviewHistory=existing.reviewHistory||[];
   existing.reviewHistory.push({answers:[...existing.answers],status:existing.status,reviewedBy:existing.reviewedBy,reviewedAt:existing.reviewedAt,rejectionReason:existing.rejectionReason});
   Object.assign(existing,data,{status:'pending',recommendedLevel:'M1',level:'M1'});delete existing.rejectionReason;delete existing.reviewedBy;delete existing.reviewedAt;
  }
  app.reviewId=existing.id;app.reviewStatus=existing.status;return;
 }
 S.personalAgentReviewRecords.push({...data,id:'PA-'+Date.now(),scope:personalAgentReviewScope(),owner:app.owner,name:(U[app.owner]?.n||app.owner)+' 的 Agent',applicant:U[app.owner]?.n||app.owner,job:'个人助理申请',status:'pending',level:'M1',type:'员工'});
 app.reviewId=S.personalAgentReviewRecords.at(-1).id;
}
function personalAgentReviewBadge(){return personalAgentCanReview()?personalAgentReviewList().filter(r=>r.status==='pending').length:0;}
function personalAgentReviewView(){
 if(!personalAgentCanReview())return '<div class="allclear">暂无审核权限</div>';
 const all=personalAgentReviewList(),filter=S.paReviewFilter||'all',list=all.filter(r=>filter==='all'||r.status===filter).sort((a,b)=>new Date(b.submittedAt)-new Date(a.submittedAt));
 return `<div class="bar"><div class="seg">${[['all','全部'],...Object.entries(PA_REVIEW_STATES)].map(([key,name])=>`<button class="${filter===key?'on':''}" onclick="S.paReviewFilter='${key}';render()">${name} ${key==='all'?all.length:all.filter(r=>r.status===key).length}</button>`).join('')}</div></div>${list.map(r=>`<article class="pa-review-card"><span class="pa-review-avatar">${esc(r.name.slice(0,1))}</span><div class="pa-review-info"><div class="pa-review-title"><b>${esc(r.name)}</b><span>for ${esc(r.applicant)} · ${esc(r.job)}</span><span class="st ${r.status==='live'?'done':r.status==='building'?'todo':'review'}">${PA_REVIEW_STATES[r.status]}</span><span class="chip lv">${r.level} ${PA_AUTONOMY[r.level]?.name||PA_AUTONOMY.M1.name}</span><span class="chip mut">${esc(r.type)}</span></div><p>${esc(r.answers[0])}</p><small>${esc(r.id)} · 提交 ${esc(kbHistoryTime(r.submittedAt))} · 汇报给 ${esc(r.answers[1])} · 需连接 ${esc(r.answers[3])}</small></div><div class="pa-review-actions">${r.status==='pending'?`<button class="btn ghost sm pa-review-reject" onclick="openPersonalAgentReject('${r.id}')">拒绝</button><button class="btn sm" onclick="decidePersonalAgentReview('${r.id}','approve')">批准</button>`:''}<button class="btn ghost sm" onclick="openPersonalAgentReview('${r.id}')">查看详情</button></div></article>`).join('')||'<div class="allclear">暂无相关申请</div>'}`;
}
function openPersonalAgentReview(id,tab=0,reject=false){
 if(!personalAgentCanReview())return;
 const r=personalAgentReviewList().find(r=>r.id===id);if(!r)return;
 closeDw();S.paReviewId=id;if(r.status==='building')personalAgentBeginBuild(id);
 const stage={pending:0,rejected:0,building:1,connecting:2,live:4}[r.status];
 $('dw').innerHTML=`<section class="personal-agent-application" role="dialog" aria-modal="true" aria-label="申请审核"><header class="dw-h"><button class="ib" aria-label="关闭" onclick="closeDw()"><i data-lucide="x"></i></button><div style="flex:1"><div class="ty">申请 ${esc(r.id)} · ${esc(r.applicant)}</div><h3>${esc(r.name)} · 个人助理</h3></div><span class="st review">${PA_REVIEW_STATES[r.status]}</span></header><div class="dw-tabs">${['回答','构建','连接'].map((name,i)=>`<button class="${tab===i?'on':''}" onclick="openPersonalAgentReview('${id}',${i})">${name}</button>`).join('')}</div><div class="dw-b"><div class="pa-review-stages">${['提交','批准','构建','连接','上线'].map((name,i)=>`<div class="${i<=stage?'done':''}">${name}<b>${i<=stage?'✓':'—'}</b></div>`).join('')}</div>${tab===0?r.answers.map((answer,i)=>`<section class="pa-review-answer"><small>${i+1}. ${PERSONAL_AGENT_QUESTIONS[i].title}</small><p>${esc(answer)}</p></section>`).join(''):tab===1?personalAgentBuildHTML(r):personalAgentChannelsHTML(r)}${r.status==='rejected'?`<section class="pa-review-answer"><b>拒绝原因</b><p>${esc(r.rejectionReason||'\u672a\u586b\u5199\u62d2\u7edd\u539f\u56e0')}</p></section>`:''}</div><footer class="dw-f">${r.status==='pending'?`<button class="btn" onclick="decidePersonalAgentReview('${id}','approve')">批准并构建</button><button class="btn ghost pa-review-reject" onclick="openPersonalAgentReject('${id}')">拒绝</button>`:'<button class="btn ghost" onclick="closeDw()">完成</button>'}</footer></section>`;
 $('dw').classList.add('on');$('scrim').classList.add('on');kpIcons();if(typeof syncDrawerExpandControl==='function')syncDrawerExpandControl();
}
function savePersonalAgentReviewName(id,value){if(!personalAgentCanReview())return;const r=personalAgentReviewList().find(r=>r.id===id);if(r&&['pending','building'].includes(r.status))r.name=value;}
function openPersonalAgentReject(id){
 if(!personalAgentCanReview())return;const r=personalAgentReviewList().find(r=>r.id===id);if(r?.status!=='pending')return;
 S.paRejectConfirmation={id,scope:r.scope,submittedAt:r.submittedAt};
 $('mod').innerHTML=`<section class="mbox confirm-modal" role="dialog" aria-modal="true" aria-labelledby="pa-reject-title"><div class="mhd"><h3 id="pa-reject-title">确认拒绝申请？</h3><button class="ib" aria-label="关闭" onclick="closeMod()">×</button></div><div class="mbd"><p>${esc(r.applicant)} · ${esc(r.name)}</p><p>拒绝后，申请人可以修改回答并重新提交。</p><div class="fld" style="margin-top:16px"><label for="pa-reject-reason">拒绝原因（选填）</label><textarea id="pa-reject-reason" rows="3" placeholder="说明需要补充或调整的内容"></textarea></div></div><div class="mft"><button class="btn danger" onclick="decidePersonalAgentReview('${id}','reject')">确认拒绝</button><button class="btn ghost" onclick="closeMod()">取消</button></div></section>`;
 $('mod').classList.add('on');
}
function decidePersonalAgentReview(id,decision){
 if(!personalAgentCanReview())return;const r=personalAgentReviewList().find(r=>r.id===id);if(r?.status!=='pending'||!['approve','reject'].includes(decision))return;
 if(decision==='reject'){
  const draft=S.paRejectConfirmation;if(!draft||draft.id!==id||draft.scope!==r.scope||draft.submittedAt!==r.submittedAt||!$('mod').classList.contains('on'))return;
  r.rejectionReason=$('pa-reject-reason')?.value.trim()||'';S.paRejectConfirmation=null;closeMod();
 }
 if(decision==='approve'&&!r.name.trim()){toast('请填写 Agent 名字');return;}
 r.status=decision==='approve'?'building':'rejected';r.reviewedBy=currentUser();if(decision==='approve')r.approvedLevel=r.level;r.reviewedAt=new Date().toISOString();
 const app=S.personalAgentApplications?.[r.owner];if(app){app.reviewStatus=r.status;app.reviewId=r.id;}
 if(decision==='approve')personalAgentBeginBuild(id);render();if(decision==='reject'&&S.paReviewId===id)closeDw();else if(S.paReviewId===id)openPersonalAgentReview(id,1);toast(decision==='approve'?'申请已批准，开始构建':'申请已拒绝');
}
