const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function setup(){
 const nodes=new Map();function node(id){if(!nodes.has(id)){const classes=new Set();nodes.set(id,{innerHTML:'',scrollTop:0,classList:{add(...xs){xs.forEach(x=>classes.add(x));},remove(...xs){xs.forEach(x=>classes.delete(x));},contains:x=>classes.has(x)},querySelector:()=>({focus(){},scrollTop:0}),focus(){}});}return nodes.get(id);}
 const c=vm.createContext({console,REG:[],location:{hash:''},window:{addEventListener(){}},document:{addEventListener(){},getElementById:node,querySelectorAll:()=>[]},setTimeout(){},clearTimeout(){}}),run=s=>vm.runInContext(s,c);
 for(const file of ['01-helpers-data.js','05-knowledge-work.js','10-permissions.js','14-kb-document-demo.js','24-kb-update-review.js','25-kb-insight-sections.js'])run(fs.readFileSync('js/'+file,'utf8'));
 run(`currentUser=()=>S.currentUser;toast=()=>{};render=()=>{};closeMod=()=>{$('mod').classList.remove('on')};closeDw=()=>{$('dw').classList.remove('on')};kbBrandUpdatesEnsure();`);
 const parent=run("KB.find(e=>e.id==='k4')");return {c,run,node,parent};
}
{
 const {c,node,parent}=setup(),[profiles,motives,needs,barriers]=parent.sections,old=profiles.tx,other=JSON.stringify([motives,needs]);
 c.openKB('k4');assert.match(node('dw').innerHTML,/kb-batch-section/);assert.match(node('dw').innerHTML,/kbSubmitInsightBatch/);assert.doesNotMatch(node('dw').innerHTML,/>查看更新</);
 const footer=node('dw').innerHTML.split('kb-batch-footer')[1];assert.ok(footer.indexOf("'selected'")<footer.indexOf("'approve-all'"));assert.ok(footer.indexOf("'approve-all'")<footer.indexOf("'ignore-all'"));
 c.kbSetInsightDecision('k4',profiles.id,'approve');assert.equal(profiles.version,1);assert.equal(profiles.tx,old);assert.ok(profiles.pendingUpdate);
 c.kbSubmitInsightBatch('k4','selected');assert.equal(profiles.version,1);assert.equal(barriers.version,1);
 c.kbSetInsightDecision('k4',barriers.id,'ignore');c.kbSetInsightBatchMode('k4','preview');assert.equal(profiles.tx,old);
 const draft=c.kbInsightBatchDraft(parent);assert.doesNotMatch(c.kbInsightBatchSectionHTML(parent,barriers,draft),/购买渠道/);
 c.kbSetInsightBatchMode('k4','parallel');assert.match(node('dw').innerHTML,/kb-review-parallel/);
 c.kbSubmitInsightBatch('k4','selected');assert.equal(parent.version,2);assert.equal(profiles.version,1);assert.notEqual(profiles.tx,old);assert.equal(barriers.version,1);assert.equal(barriers.updateReviews[0].decision,'ignored');assert.equal(profiles.pendingUpdate,null);assert.equal(barriers.pendingUpdate,null);assert.equal(JSON.stringify([motives,needs]),other);
 c.kbShowBrandHistory(barriers.id);assert.match(node('dw').innerHTML,/更新建议已忽略/);assert.doesNotMatch(node('dw').innerHTML,/kbOpenRestoreVersion/);
 c.kbOpenBrandUpdate(barriers.id,'diff',0);assert.match(node('dw').innerHTML,/更新已忽略/);
 c.kbSubmitInsightBatch('k4','selected');assert.equal(profiles.updateReviews.length,1);assert.equal(barriers.updateReviews.length,1);
}
for(const action of ['approve-all','ignore-all']){
 const {c,parent}=setup();c.openKB('k4',2);c.kbSubmitInsightBatch('k4',action);
 for(const s of parent.sections.filter(s=>['profiles','barriers'].includes(s.key))){assert.equal(parent.version,action==='approve-all'?2:1);assert.equal(s.version,1);assert.equal(s.pendingUpdate,null);assert.equal(s.updateReviews[0].decision,action==='approve-all'?'approved':'ignored');}
}
{
 const {c,parent,run}=setup(),[profiles,,,barriers]=parent.sections;c.openKB('k4',2);
 c.kbSetInsightDecision('k4',profiles.id,'approve');c.kbSetInsightDecision('k4',barriers.id,'approve');barriers.pendingUpdate.nextText+=' concurrent change';
 c.kbSubmitInsightBatch('k4','selected');assert.equal(profiles.version,1);assert.equal(profiles.updateReviews.length,0);assert.ok(profiles.pendingUpdate);assert.ok(barriers.pendingUpdate);
 run("S.kbrand='telosin'");c.kbSubmitInsightBatch('k4','approve-all');assert.equal(profiles.version,1);
}
{
 const {c,parent,node}=setup(),[profiles,motives,needs,barriers]=parent.sections,snapshot=JSON.stringify(barriers),old=profiles.tx;
 c.openKB('k4',0);for(const s of parent.sections)node('kb-insight-edit-'+s.id).value=s.tx;
 node('kb-insight-edit-'+profiles.id).value=old+' manual edit';c.kbDrawInsightPage(parent,0);assert.equal(profiles.tx,old);
 for(const s of parent.sections)node('kb-insight-edit-'+s.id).value=s.tx;
 node('kb-insight-edit-'+profiles.id).value=old+' manual edit';c.kbSaveInsightContent('k4');assert.equal(parent.version,2);assert.equal(profiles.version,1);assert.equal(profiles.pendingUpdate,null);assert.equal(profiles.updateReviews[0].kind,'superseded');assert.equal(parent.updateReviews[0].kind,'manual');assert.equal(JSON.stringify(barriers),snapshot);assert.equal(motives.version,1);assert.equal(needs.version,1);assert.ok(parent.tx.includes('manual edit'));
}
console.log('PASS same-page batch choices, staged decisions, preview/parallel, mixed/all approval/ignore, editable content isolation, duplicate/stale/scope protection');

{
 const {c,parent,node}=setup(),before=parent.tx,sections=parent.sections.map(s=>s.tx);
 c.openKB('k4',2);c.kbSubmitInsightBatch('k4','approve-all');
 assert.equal(parent.version,2);assert.equal(parent.updateReviews.length,1);assert.equal(parent.updateReviews[0].sectionDecisions.length,2);assert.equal(parent.knowledgeVersions.length,2);
 c.openKB('k4',3);assert.match(node('dw').innerHTML,/kbOpenRestoreVersion\('k4',1\)/);
 c.kbOpenRestoreVersion('k4',1);c.kbConfirmRestoreVersion();assert.equal(parent.version,3);assert.equal(parent.tx,before);assert.deepEqual(parent.sections.map(s=>s.tx),sections);assert.equal(parent.knowledgeVersions.length,3);
 c.kbOpenRestoreVersion('k4',2);c.kbConfirmRestoreVersion();assert.equal(parent.version,4);assert.notEqual(parent.tx,before);assert.equal(parent.sections[0].tx.split('\n\n').length,4);
}
