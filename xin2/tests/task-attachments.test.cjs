// Metadata-only attachment demo and existing task-creation path regression tests.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),nodes=new Map(),timers=new Map();let nextTimer=0;
function node(id){
 if(!nodes.has(id)){
  const classes=new Set();nodes.set(id,{innerHTML:'',textContent:'',value:'',disabled:false,
   classList:{add(...n){n.forEach(x=>classes.add(x))},remove(...n){n.forEach(x=>classes.delete(x))},contains(n){return classes.has(n)},toggle(n,on){on?classes.add(n):classes.delete(n)}},
   focus(){},setAttribute(){},setSelectionRange(){},scrollTo(){}});
 }return nodes.get(id);
}
const context=vm.createContext({console,location:{hash:''},window:{},
 setTimeout(fn){timers.set(++nextTimer,fn);return nextTimer},clearTimeout(id){timers.delete(id)},
 document:{getElementById:node,addEventListener(){},querySelector(selector){
  if(selector==='#mod .new-task-modal')return node('mod').innerHTML.includes('new-task-modal')?node('modal'):null;
  if(selector==='#new-task-footer > .btn')return node('start');return null;
 }},render(){},renderNav(){},toast(){},go(){},CAMPS:[]});
const run=code=>vm.runInContext(code,context);
run(fs.readFileSync(path.join(root,'js/01-helpers-data.js'),'utf8'));
run(fs.readFileSync(path.join(root,'js/12-task-attachments.js'),'utf8'));
const creation=fs.readFileSync(path.join(root,'js/08-subthreads-newthread-init.js'),'utf8');
run(creation.slice(0,creation.indexOf("document.addEventListener('keydown'")));
run(`toast=()=>{};inferNewTaskMeta=()=>({c:null,d:'电商',a:'orch'});`);
function finish(){while(timers.size){const batch=[...timers.values()];timers.clear();batch.forEach(fn=>fn())}}
function prepare(){run('taReset()');node('mod').innerHTML='<div class="new-task-modal"></div>';node('mod').classList.add('on');node('ta-feedback').textContent=''}
function add(files){context.selected=files;run('taSelect(selected)')}
const file=(name='brief.pdf',size=1024)=>({name,size,lastModified:42,privateContent:'must never be read or stored'});
function check(name,fn){fn();console.log('PASS',name)}
check('new task exposes a keyboard-accessible multi-file picker and drop area',()=>{
 run(`openNew(null,'测试意图')`);
 assert.match(node('mod').innerHTML,/type="file" multiple/);
 assert.match(node('mod').innerHTML,/ondrop="taDrop\(event\)"/);
 assert.doesNotMatch(node('mod').innerHTML,/ta-help|Demo：仅保存本页附件清单/);finish();
});
check('multiple files show simulated upload then become ready',()=>{
 prepare();add([file(),file('data.xlsx',2048)]);
 assert.equal(run('taDraft.files.length'),2);assert.equal(run('taReady()'),false);
 assert.equal(node('start').disabled,true);assert.match(node('ta-files').innerHTML,/模拟上传中/);
 finish();assert.equal(run('taReady()'),true);assert.equal(node('start').disabled,false);
 assert.match(node('ta-files').innerHTML,/已添加（演示）/);
 assert.equal(run('taSnapshot().length'),2);
 assert.doesNotMatch(run('JSON.stringify(taSnapshot())'),/privateContent/);
});
check('unsupported, empty, oversized and duplicate files explain rejection',()=>{
 prepare();add([file('bad.exe'),file('empty.txt',0),file('large.pdf',21*1024*1024),file(),file()]);
 assert.equal(run('taDraft.files.length'),1);
 for(const message of ['格式不支持','文件为空','超过 20 MB','无需重复'])assert.ok(node('ta-feedback').textContent.includes(message));
});
check('max count is enforced and removing an uploading item cancels its timer',()=>{
 prepare();add(Array.from({length:6},(_,i)=>file('file'+i+'.pdf')));
 assert.equal(run('taDraft.files.length'),5);assert.match(node('ta-feedback').textContent,/最多添加 5 个/);
 run('taRemove(taDraft.files[0].id)');finish();assert.equal(run('taSnapshot().length'),4);
});
check('filenames are escaped in form and task detail',()=>{
 prepare();add([file('<img onerror="x">.pdf')]);finish();
 assert.match(node('ta-files').innerHTML,/&lt;img/);
 assert.doesNotMatch(run('taTaskHTML({attachments:taSnapshot()})'),/<img/);
});
check('drag and drop uses the same file validation and preparation',()=>{
 prepare();let prevented=false;
 context.dropEvent={preventDefault(){prevented=true},dataTransfer:{files:[file('drop.csv')]}};
 run('taDrop(dropEvent)');finish();assert.equal(prevented,true);assert.equal(run('taSnapshot()[0].name'),'drop.csv');
});
check('pending uploads block task creation; closing clears draft and timers',()=>{
 prepare();add([file()]);node('ni').value='任务';const count=run('T.length');run('mkThread()');
 assert.equal(run('T.length'),count);run('closeMod()');finish();assert.equal(run('taDraft.files.length'),0);
});
for(const [label,intent,domain,agent] of [['analysis','分析数据','电商','ana'],['content','生成内容','内容',null],['manual','人工处理','电商',null],['generic','其他需求','电商',null]]){
 check(label+' creation retains the selected attachment after modal closes',()=>{
  prepare();add([file(label+'.pdf')]);finish();node('ni').value=intent;
  run(`S.newAgent=${JSON.stringify(agent)};inferNewTaskMeta=()=>({c:null,d:${JSON.stringify(domain)},a:'orch'});mkThread()`);
  assert.equal(run('T[0].attachments[0].name'),label+'.pdf');
  assert.equal(run('taDraft.files.length'),0);
  assert.match(run('taTaskHTML(T[0])'),/Agent 尚未读取/);
 });
}
check('tasks without attachments keep the old flow unchanged',()=>{
 prepare();node('ni').value='普通需求';run('mkThread()');assert.equal(run('T[0].attachments.length'),0);
 assert.equal(run('taTaskHTML(T[0])'),'');
});
