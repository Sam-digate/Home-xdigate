const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const nodes=new Map();function node(id){if(!nodes.has(id)){const classes=new Set();nodes.set(id,{innerHTML:'',classList:{add(...xs){xs.forEach(x=>classes.add(x));},remove(...xs){xs.forEach(x=>classes.delete(x));},contains:x=>classes.has(x)},querySelector:()=>({focus(){}}),focus(){}});}return nodes.get(id);}
const c=vm.createContext({console,REG:[],location:{hash:''},window:{addEventListener(){}},document:{addEventListener(){},getElementById:node,querySelectorAll:()=>[]},setTimeout(){},clearTimeout(){}}),run=s=>vm.runInContext(s,c);
for(const file of ['01-helpers-data.js','05-knowledge-work.js','10-permissions.js','14-kb-document-demo.js','24-kb-update-review.js','25-kb-insight-sections.js'])run(fs.readFileSync('js/'+file,'utf8'));
run(`currentUser=()=>S.currentUser;toast=()=>{};render=()=>{};closeMod=()=>{$('mod').classList.remove('on')};closeDw=()=>{$('dw').classList.remove('on')};kbBrandUpdatesEnsure();`);
const parent=run("KB.find(e=>e.id==='k4')"),[profiles,motives,needs,barriers]=parent.sections;
assert.equal(parent.sections.length,4);assert.ok(profiles.pendingUpdate);assert.ok(barriers.pendingUpdate);assert.equal(parent.pendingUpdate,undefined);
const originalProfile=profiles.tx,barrierSnapshot=JSON.stringify(barriers),motivesSnapshot=JSON.stringify(motives),needsSnapshot=JSON.stringify(needs);
c.openKB('k4',0);assert.equal((node('dw').innerHTML.match(/<textarea/g)||[]).length,4);assert.match(node('dw').innerHTML,/kbSaveInsightContent/);assert.doesNotMatch(node('dw').innerHTML,/更新待审批|查看更新|kb-insight-section-version|kbApproveBrandUpdate\('k4'/);
c.openKB('k4',2);assert.match(node('dw').innerHTML,new RegExp(profiles.id));assert.match(node('dw').innerHTML,new RegExp(barriers.id));assert.match(node('dw').innerHTML,/<details class="kb-batch-unchanged">/);
c.openKB(profiles.id,2);assert.match(node('dw').innerHTML,/kb-batch-section/);assert.match(node('dw').innerHTML,/kbSubmitInsightBatch/);
c.kbSetInsightDecision('k4',profiles.id,'approve');c.kbSetInsightDecision('k4',barriers.id,'ignore');c.kbSubmitInsightBatch('k4','selected');
assert.equal(parent.version,2);assert.notEqual(profiles.tx,originalProfile);assert.equal(JSON.stringify(motives),motivesSnapshot);assert.equal(JSON.stringify(needs),needsSnapshot);
c.openKB('k4',3);assert.match(node('dw').innerHTML,/kb-history-list/);assert.doesNotMatch(node('dw').innerHTML,/kb-insight-history-row/);
c.openKB(profiles.id,3);assert.match(node('dw').innerHTML,/v2/);
run("S.kbrand='telosin'");assert.equal(c.kbBrandReviewEntry(profiles.id),null);
console.log('PASS user-insight structure, separate pending cards, per-section approval/rejection/stale guard, isolated history/restore and brand scope');
