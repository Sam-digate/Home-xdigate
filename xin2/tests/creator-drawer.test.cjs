const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),nodes=new Map();
function node(id){if(!nodes.has(id)){const classes=new Set();nodes.set(id,{innerHTML:'',classList:{add:(...xs)=>xs.forEach(x=>classes.add(x)),remove:(...xs)=>xs.forEach(x=>classes.delete(x)),contains:x=>classes.has(x),toggle:(x,on)=>on?classes.add(x):classes.delete(x)},querySelector:()=>null,querySelectorAll:()=>[],style:{setProperty(){}},setAttribute(){},focus(){}});}return nodes.get(id);}
const context=vm.createContext({console,location:{hash:''},window:{addEventListener(){}},
 document:{getElementById:node,querySelectorAll:()=>[],querySelector:()=>null,addEventListener(){},createElement:()=>node('new')},
 setTimeout(){},clearTimeout(){},setInterval(){},clearInterval(){},requestAnimationFrame(){},URL,Intl});
const run=code=>vm.runInContext(code,context);
for(const file of ['01-helpers-data.js','02-core-nav-today-comments.js','03-agents-recipes-proposals.js','04-campaigns-analytics-i18n.js','05-knowledge-work.js','06-thread-artifacts-drawer.js','07-listing-promotion-pdp-drawers.js','10-permissions.js','12-task-attachments.js','13-conversation-attachments.js','16-task-deletion.js']){
 vm.runInContext(fs.readFileSync(path.join(root,'js',file),'utf8'),context,{filename:file});
}
// Keep real comment/form renderers, omitting only shell initialization and timers.
run(fs.readFileSync(path.join(root,'js/08-subthreads-newthread-init.js'),'utf8').split("document.addEventListener('keydown'")[0]);
run("S.tid='t-douyin-creators';openDw('a-douyin-creators')");
assert.equal(node('dw').classList.contains('on'),true);
assert.equal(node('scrim').classList.contains('on'),true);
assert.match(node('dw').innerHTML,/今日新发现 · 抖音达人 10 人/);
assert.match(node('dw').innerHTML,/全部/);
assert.match(node('dw').innerHTML,/已入选/);
assert.match(node('dw').innerHTML,/备注|评论/);
assert.doesNotMatch(node('dw').innerHTML,/class="douyin-contract-form"/);
run("openRosterComments('a-douyin-creators')");
assert.equal(node('dw').classList.contains('on'),true);
assert.doesNotMatch(node('dw').innerHTML,/class="douyin-contract-form"/);
console.log('PASS opening the full Douyin roster renders its drawer and overall comments');
for(const index of ['null','undefined','-1','999']){
 assert.equal(run(`douyinContractDraftFor(findArt('a-douyin-creators')[1],${index})`),null);
 assert.equal(run(`ensureDouyinContractDraft(findArt('a-douyin-creators')[1],${index})`),null);
 assert.equal(run(`dDouyinContractForm(findArt('a-douyin-creators')[1],${index})`),'');
}
assert.equal(run("douyinContractDraftFor(null,0)"),null);
console.log('PASS missing or out-of-range creator selection does not dereference an absent row');
run("const roster=findArt('a-douyin-creators')[1];roster.rows[0].s='合同确认';ensureDouyinContractDraft(roster,0)");
assert.match(run('subPane(roster,0)'),/class="douyin-contract-form"/);
assert.match(run('subPane(roster,0)'),/保底 GMV/);
assert.doesNotMatch(run('subPane(roster,null)'),/class="douyin-contract-form"/);
run("roster.rows[1].s='样品寄送';ensureSampleShippingDraft(roster,1)");
assert.match(run('subPane(roster,1)'),/寄样|寄出|物流/);
run("S.kgroup='selected';drawDw()");
assert.equal(node('dw').classList.contains('on'),true);
console.log('PASS selected-creator contracts, sample shipping and group switching remain functional');
