/* Fixed walkthrough only: illustrative rules, not a real regulatory verdict. */
const CLAIMS_DEMO_SENTENCES=[
 'Intended for women, 30-70 years old who desire to reduce mild to moderate facial wrinkles.',
 'Fast and easy treatment taking only 5 minutes once a week.',
 'Professional anti-aging without the clinic, visible results in 7 days.'
];
const CLAIMS_DEMO_REPLACEMENTS=[
 'Explore Sensilift and review the product information to see whether it fits your routine.',
 'Read the instructions for use, including suitability and safety guidance, before starting.',
 'Contact the Sensica team if you have questions before choosing your device.'
];
const CLAIMS_DEMO_SAFE=CLAIMS_DEMO_REPLACEMENTS.join(' ');
AG.claims={n:'功效宣称与合规审核',s:'审',c:'#7C3AED'};ONLINE.claims=1;
REG.push({id:'claims',nick:'合规审核',n:'Claims & Compliance Review Agent',em:'🛡',dom:'内容',b:'live',lv:0,own:'Sophie',pm:'dudu',tr:['manual','orchestrated'],out:['合规检查报告'],d:'核对功效宣称、适用范围及必要说明，给出依据摘要与修改建议，交由人工确认。',r:0,ok:0,ed:0,c:'—',enabled:true});
TRACE.claims=[{k:'read',h:'识别审核上下文',b:'Sensilift · 美国 · Meta 广告，不跨产品混查。'},{k:'read',h:'读取文案',b:'识别适用范围、使用计划及效果承诺。'},{k:'think',h:'应用演示规则',b:'本任务使用预置示例结果，未检索真实获批资料。'},{k:'write',h:'整理重点结果',b:'输出原句、问题与依据摘要、建议改为；详细信息折叠。'},{k:'tool',h:'提交人工审核',b:'修改使原检查失效；重新检查后才能批准交付。'}];
T.unshift({id:'t-claims-sensilift',t:'Sensilift · Meta 广告合规审核',dom:'内容',ag:'claims',own:'du',lv:'M1',st:'todo',trig:'manual',cr:{s:'h',w:'du'},camp:null,up:'刚刚',day:0,workTop:210,cost:'—',arts:[],cmts:[],outputCount:0,claims:{stage:'recommend',selected:true,original:CLAIMS_DEMO_SENTENCES.join(' '),text:CLAIMS_DEMO_SENTENCES.join(' '),version:1,checkedText:null}});
function claimsTask(){return T.find(t=>t.id==='t-claims-sensilift'&&!t.deletedAt);}
function claimsAllowed(){return !!claimsTask()&&permissionHasPage('work');}
function claimsPlanHTML(c){
 return `<div class="bub"><div class="who"><span class="avs" style="background:var(--primary)">审</span><span class="nm">功效宣称与合规审核</span><span class="chip dom">计划 v${c.planVersion||1}</span><span class="tm">${c.stage==='recommend'?'待确认':c.stage==='done'?'已确认 · 已完成':'已确认 · 执行中'}</span></div><p class="prestart-summary">合规审核 Agent 按 Sensilift、美国市场与 Meta 广告范围检查文案，整理重点问题、依据摘要及改写建议，修改复审后交由人工批准。</p><div class="prestart-plan-actions">${c.stage==='recommend'?'<button class="btn ghost sm" onclick="claimsEditPlan()">调整计划 ↗</button><button class="btn ghost sm" onclick="claimsEditPlan()">手动调整</button><button class="btn sm" onclick="claimsStart()">确认并开始</button>':'<button class="btn ghost sm" onclick="promoteThread()">变成例行 ↗</button>'}</div></div>`;
}
function claimsEditPlan(){
 if(!claimsAllowed())return;const c=claimsTask().claims;if(c.stage!=='recommend')return;closeDw();
 $('dw').innerHTML=`<section class="personal-agent-application" role="dialog" aria-modal="true" aria-label="调整审核计划"><header class="dw-h"><button class="ib" aria-label="关闭" onclick="closeDw()"><i data-lucide="x"></i></button><div><div class="ty">功效宣称与合规审核</div><h3>调整审核计划</h3></div></header><div class="dw-b"><div class="fld"><label>推荐 Agent</label><select><option>功效宣称与合规审核 Agent（已选中）</option></select></div><div class="crm-plan-steps"><span>产品：Sensilift</span><span>市场：美国</span><span>渠道：Meta 广告</span></div><div class="fld"><label for="claims-plan-text">待审核文案</label><textarea id="claims-plan-text" rows="8">${esc(c.original)}</textarea></div><p class="crm-context">检查重点问题，提供依据摘要和修改建议；详细内容折叠，人工批准后交付。</p></div><footer class="dw-f"><button class="btn" onclick="claimsSavePlan()">保存计划</button><button class="btn ghost" onclick="closeDw()">取消</button></footer></section>`;
 $('dw').classList.add('on');$('scrim').classList.add('on');kpIcons();if(typeof syncDrawerExpandControl==='function')syncDrawerExpandControl();
}
function claimsSavePlan(){
 if(!claimsAllowed())return;const c=claimsTask().claims;if(c.stage!=='recommend')return;
 const text=$('claims-plan-text').value.trim();if(!text){toast('请填写待审核文案');return;}
 if(text!==c.original){c.original=text;c.text=text;c.planVersion=(c.planVersion||1)+1;}c.selected=true;closeDw();render();
}
function claimsArtifactHTML(c){
 const done=c.stage==='done',stale=c.checkedText!==c.text,passed=!stale&&c.verdict==='pass';
 const status=done?'已批准':'待人工批准';
 const result=claimsRisk(c).label;
 return `<article class="pk"><div class="pk-h"><span class="ty">产出 · 合规检查报告</span><span class="chip mut">1 份报告</span><span class="st ${done?'done':'review'}">${status}</span><span class="by artifact-run" role="button" tabindex="0" onclick="openTrace('claims','t-claims-sensilift')" onkeydown="if(event.key==='Enter')openTrace('claims','t-claims-sensilift')">${AV('claims',16)}<span class="odot on"></span>合规审核 · 看运行 ↗</span></div><div class="pk-b" onclick="claimsOpenReport()"><div class="pk-t"><div class="tt">Sensilift · Meta 广告合规检查</div><div class="ex">${done?'修改稿及审核记录已交付。':'核对适用部位、使用频率和效果承诺，提供问题依据与修改建议。'}</div></div></div><div class="vals"><span class="val">审核范围 <b class="m">Sensilift / 美国 / Meta</b></span><span class="val ${passed?'ok':'warn'}">${result}</span></div><div class="crm-mail-footer"><button class="btn ghost sm" onclick="claimsOpenReport()">查看产出</button><span class="crm-context">v${c.version||1} · ${done?'已批准':stale?'等待重新检查':'等待人工审核'}</span></div></article>`;
}
function claimsThreadHTML(t){
 const c=t.claims,ready=c.stage!=='recommend',done=c.stage==='done';
 return `<div class="wrap thread-wrap"><div class="th-hd"><div class="crumb">工作 › 日常 › 任务</div><h2>${esc(t.t)}</h2><div class="th-meta"><span class="st ${t.st}">${STN[t.st]}</span><span class="chip dom">内容</span><span class="chip lv">M1 人工确认</span><span class="chip mut">由 dudu 发起</span></div><div class="th-stats"><div class="ts"><div class="l">主 Agent</div><div class="v">${AV('claims',20)} 合规审核</div></div><div class="ts"><div class="l">产出</div><div class="v num">${t.outputCount}</div></div><div class="ts"><div class="l">更新</div><div class="v">${t.up}</div></div></div></div><div class="spine">${crmNode('意图 · INTENT',`<div class="bub me intent-card"><div class="who"><span class="avs" style="background:var(--primary)">DU</span><span class="nm">dudu</span><span class="tm">刚刚</span></div><p>Review this Sensilift Meta ad copy for US claims compliance:</p><p style="margin-top:8px">${esc(c.original)}</p></div>`)}${crmNode('计划 · PLAN',claimsPlanHTML(c),ready?'ok':'wait')}${c.stage==='running'?crmNode('执行 · RUNNING',`<div class="live"><div class="live-h"><span class="spin"></span><span class="t">正在检查广告文案</span><span class="e">${c.progress}%</span></div><div class="live-t">${esc(c.progressText)}</div><div class="pbar" role="progressbar" aria-label="合规检查进度" aria-valuenow="${c.progress}" aria-valuemin="0" aria-valuemax="100"><i style="width:${c.progress}%"></i></div></div>`,'act'):''}${['review','done'].includes(c.stage)?crmNode('产出 · ARTIFACT',claimsArtifactHTML(c),done?'ok':'wait'):''}${crmNode('交付 · DELIVERY',`<div class="bub" style="color:var(--t2)">${done?'✓ 已交付：<b>Sensilift · Meta 广告合规检查报告</b>，已保留修改稿和人工审核记录。':ready?'本线程的交付物为合规检查报告与修改稿。完成复审并人工批准后交付。':'计划待确认，尚未开始执行。'}</div>`,done?'ok':'') }</div>${crmConversationHTML(t).replace('crmAddComment()','claimsAddComment()')}</div>`;
}
function claimsSelectAgent(){if(!claimsAllowed()||claimsTask().claims.stage!=='recommend')return;claimsTask().claims.selected=true;render();}
function claimsStart(){
 if(!claimsAllowed())return;const t=claimsTask(),c=t.claims;if(!c.selected||c.stage!=='recommend')return;
 c.stage='running';c.progress=10;c.progressText='确认 Sensilift · 美国 · Meta 审核范围…';t.st='run';render();
 [45,80,100].forEach((p,i)=>setTimeout(()=>{if(claimsTask()!==t||c.stage!=='running')return;c.progress=p;c.progressText=p<80?'检查适用部位、使用频率和效果承诺…':'整理依据摘要与修改建议…';if(p===100){claimsEvaluate(c);c.stage='review';t.st='review';t.outputCount=1;}render();},(i+1)*1200));
}
function claimsEvaluate(c){
 c.checkedText=c.text;c.findings=[];c.checkedAt=new Date().toISOString();
 const specs=[['适用部位需核对','“facial” 泛指面部，当前示例信息不足以确认其与获批适用部位一致。'],['使用计划需核对','“5 minutes once a week” 需要对应产品说明的支持，本演示没有接入正式依据。'],['效果承诺缺少依据','专业级效果及 7 天见效表述没有可核验的批准依据，不能默认放行。']];
 CLAIMS_DEMO_SENTENCES.forEach((sentence,i)=>{if(c.text.includes(sentence))c.findings.push({index:i,original:sentence,title:specs[i][0],reason:specs[i][1],replacement:CLAIMS_DEMO_REPLACEMENTS[i]});});
 c.verdict=c.text.trim()===CLAIMS_DEMO_SAFE?'pass':'review';
 if(!c.findings.length&&c.verdict!=='pass')c.findings.push({index:null,title:'修改内容需人工核验',original:c.text,reason:'这段内容超出预置示例，本地演示无法核验，不能自动判为通过。',replacement:null});
}
function claimsRisk(c){
 if(c.checkedText!==c.text)return {label:'待评估',style:'review'};
 if(c.findings?.some(f=>f.index===2))return {label:'高风险',style:'hold'};
 if(c.verdict!=='pass')return {label:'中风险',style:'review'};
 return {label:'低风险',style:'done'};
}
function claimsRiskPill(c){const risk=claimsRisk(c);return `<span class="st ${risk.style}">${risk.label}</span>`;}
function claimsFindingRiskPill(f){return f.index===2?'<span class="st hold">高风险</span>':'<span class="st review">中风险</span>';}
function claimsReviewHTML(c,valid,passed){
 return `<h3>审核结果</h3>${!valid?'<p class="crm-context">内容已修改，重新检查后更新审核结果。</p>':passed?`<p class="crm-context">${c.stage==='done'?'审核记录已人工批准。':'检查已完成，等待人工确认。'}</p>`:c.findings.map((f,i)=>`<section class="claims-review-item"><h4>${i+1}. ${esc(f.title)} ${claimsFindingRiskPill(f)}</h4><dl><dt>原文</dt><dd>${esc(f.original)}</dd><dt>问题与依据</dt><dd>${esc(f.reason)}</dd>${f.replacement?`<dt>建议改为</dt><dd>${esc(f.replacement)}</dd>`:''}</dl><details><summary>查看详细依据</summary><p>位置：原文第 ${f.index===null?'—':f.index+1} 句。审核范围：Sensilift / 美国 / Meta。</p><p>依据状态：本地示例说明，未检索正式获批来源，需人工核验。</p></details></section>`).join('')}`;
}
function claimsRecommendation(c){
 const findings=c.findings||[],high=findings.some(f=>f.index===2);
 const label=c.verdict==='pass'?'通过':high?'不通过':'部分通过';
 const style=c.verdict==='pass'?'done':high?'hold':'review';
 const summary=c.verdict==='pass'?'当前文案可保留，建议由人工确认后使用。':high?'原文含缺少依据的效果承诺，建议调整后使用下方文案。':'部分表述需要核实，建议采用下方改写，并确认产品说明。';
 const complete=findings.every(f=>!!f.replacement);
 const text=complete?findings.reduce((copy,f)=>copy.replace(f.original,f.replacement),c.text):null;
 return {label,style,summary,text};
}
function claimsReportBody(c,locked,valid,passed){
 const advice=claimsRecommendation(c);
 return `<section class="claims-document"><section class="claims-advice" aria-label="审核建议"><h3>审核建议 <span class="st ${advice.style}">${advice.label}</span></h3><p class="claims-advice-summary">${esc(advice.summary)}</p><div class="claims-advice-copy"><h4>改写建议</h4><p>${advice.text?esc(advice.text):'暂无完整建议文案，请结合下方审核结果人工确认。'}</p></div></section>${!locked?'':`<p class="crm-context">批准人 ${esc(c.approvedBy)} · ${esc(kbHistoryTime(c.approvedAt))}</p>`}<section class="claims-review" id="claims-review">${claimsReviewHTML(c,valid,passed)}</section></section>`;
}
function claimsOpenReport(preserve=false){
 if(!claimsAllowed())return;const c=claimsTask().claims;if(!['review','done'].includes(c.stage))return;
 closeDw();if(S.claimsCommentsOpen===undefined)S.claimsCommentsOpen=true;const locked=c.stage==='done',valid=c.checkedText===c.text,passed=valid&&c.verdict==='pass';
 $('dw').innerHTML=`<header class="dw-h"><button class="ib" aria-label="关闭" onclick="closeDw()"><i data-lucide="x"></i></button><div style="flex:1"><div class="ty">功效宣称与合规审核</div><h3>Sensilift · Meta 广告合规检查</h3></div><span class="st ${passed?'done':'review'}">${locked?'已交付':'待人工批准'}</span></header><nav class="dw-tabs" aria-label="报告内容"><button class="on" aria-current="page">文档</button></nav><div class="dw-b">${claimsReportBody(c,locked,valid,passed)}</div><footer class="dw-f">${locked?'<button class="btn ghost" onclick="closeDw()">完成</button>':`<button class="btn" id="claims-approve" onclick="claimsApprove()">批准并交付</button>`}<button class="rvb ${S.claimsCommentsOpen?'on':''}" aria-expanded="${!!S.claimsCommentsOpen}" onclick="claimsToggleComments()">评论 ${S.claimsCommentsOpen?'▴':'▾'}</button></footer>`;
 claimsMountComments();
 $('dw').classList.add('on');$('scrim').classList.add('on');kpIcons();if(typeof syncDrawerExpandControl==='function')syncDrawerExpandControl();
}
function claimsToggleComments(){S.claimsCommentsOpen=!S.claimsCommentsOpen;claimsOpenReport(true);}
function claimsMountComments(){
 if(!$('dw').querySelector)return;
 const c=claimsTask().claims;
 const thread=c.commentThread||(c.commentThread={id:'claims-report-comments',ttl:'Sensilift · Meta 广告合规检查',sub:[]});
 S.pc=S.claimsCommentsOpen;
 mountDrawerCommentSplit(thread,{tabs:['文档']});
 const pane=$('dw').querySelector('.dw-artifact-comments');
 if(pane)pane.innerHTML=pane.innerHTML.replaceAll('subSend(','claimsReportCommentSend(');
}
function claimsReportCommentSend(kind,id){
 if(!claimsAllowed())return;const thread=claimsTask().claims.commentThread;
 if(!thread||thread.id!==id)return;const input=$('si'),draft=caGet('sub',id,null);
 if(!input||!caReady(draft))return;const tx=input.value.trim(),attachments=caFiles(draft);
 if(!tx&&!attachments.length){toast('先写点什么或添加附件');return;}
 thread.sub.push({w:currentUser(),k:kind==='chg'?'chg':undefined,tx,attachments,at:'刚刚'});caClear(draft);
 claimsOpenReport(true);$('sl')?.scrollTo?.(0,$('sl').scrollHeight);toast(kind==='chg'?'修改要求已记录，请修改后重新检查':'已留言');
}
function claimsEditText(value){
 if(!claimsAllowed()||claimsTask().claims.stage!=='review')return;
 const c=claimsTask().claims;c.text=value;claimsEvaluate(c);
 const review=$('claims-review');if(review)review.innerHTML=claimsReviewHTML(c,true,c.verdict==='pass');
 if($('claims-approve'))$('claims-approve').disabled=false;
}
function claimsRecheck(){if(!claimsAllowed()||claimsTask().claims.stage!=='review')return;const c=claimsTask().claims;claimsEvaluate(c);c.version++;render();claimsOpenReport(true);}
function claimsApprove(){
 if(!claimsAllowed())return;const t=claimsTask(),c=t.claims;if(c.stage!=='review')return;
 if(c.checkedText!==c.text)claimsEvaluate(c);
 c.approvedRisk=claimsRisk(c).label;
 c.approvedRecommendation={...claimsRecommendation(c)};
 c.approvedReview={verdict:c.verdict,findings:c.findings.map(f=>({...f})),checkedText:c.checkedText,checkedAt:c.checkedAt};
 c.stage='done';c.approvedBy=U[currentUser()]?.n||currentUser();c.approvedAt=new Date().toISOString();c.approvedText=c.text;t.st='done';t.up='刚刚';closeDw();render();toast('合规检查报告已批准并交付');
}
function claimsAddComment(){
 if(!claimsAllowed())return;const t=claimsTask(),draft=caGet('task',t.id),input=$('ci');if(!input||!caReady(draft))return;
 const tx=input.value.trim(),attachments=caFiles(draft);if(!tx&&!attachments.length)return;t.cmts.push({w:currentUser(),tx,attachments,at:'刚刚'});caClear(draft);render();
}
