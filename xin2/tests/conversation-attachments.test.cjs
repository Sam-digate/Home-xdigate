// Exercise the actual task, artifact-comment and general-Agent send handlers.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),nodes=new Map(),timers=new Map();let nextTimer=0;
function node(id){
 if(!nodes.has(id)){
  const classes=new Set();nodes.set(id,{innerHTML:'',value:'',textContent:'',scrollHeight:0,
   classList:{add(...n){n.forEach(x=>classes.add(x))},remove(...n){n.forEach(x=>classes.delete(x))},contains(n){return classes.has(n)},toggle(n,on){on?classes.add(n):classes.delete(n)}},focus(){},setAttribute(){},querySelector(){return null}});
 }return nodes.get(id);
}
const context=vm.createContext({console,location:{hash:''},window:{},REG:[],ONLINE:{},
 setTimeout(fn){timers.set(++nextTimer,fn);return nextTimer},clearTimeout(id){timers.delete(id)},
 document:{getElementById:node,addEventListener(){},querySelector(){return null},querySelectorAll(){return []}}});
const run=code=>vm.runInContext(code,context),source=name=>fs.readFileSync(path.join(root,'js',name),'utf8');
run(source('01-helpers-data.js'));run(source('02-core-nav-today-comments.js'));run(source('06-thread-artifacts-drawer.js'));
run(source('12-task-attachments.js'));run(source('13-conversation-attachments.js'));
const sub=source('08-subthreads-newthread-init.js');run(sub.slice(0,sub.indexOf("document.addEventListener('keydown'")));
run(`render=()=>{};drawDw=()=>{};scrollDrawerToBottom=()=>{};toast=()=>{};
 const task={id:'chat-test',ag:'gen',st:'review',cmts:[],arts:[{id:'chat-art',mode:'plans',by:'gen',v:1,st:'review',plans:[{t:'One',s:'review',sub:[]},{t:'Two',s:'review',sub:[]}]}]};T.push(task);S.tid=task.id;S.aid='chat-art';`);
function finish(){while(timers.size){const batch=[...timers.values()];timers.clear();batch.forEach(fn=>fn())}}
function add(kind,id,scope=null,name='reference.pdf'){
 context.files=[{name,size:2048,lastModified:123}];context.target={kind,id,scope};
 run('caSelect(caGet(target.kind,target.id,target.scope).id,files)');
}
function check(name,fn){fn();console.log('PASS',name)}
check('composer provides multiple file selection, drag/drop and remove',()=>{
 const html=run(`caComposerHTML('task',task.id)`);
 assert.match(html,/type="file" multiple/);assert.doesNotMatch(html,/ca-toolbar|或拖拽文件/);
 assert.match(run(`caDropAttrs('task',task.id)`),/ondrop="caDrop/);
 const icon=run(`caAttachButton('task',task.id)`);assert.match(icon,/aria-label="添加附件"/);assert.match(icon,/data-lucide="paperclip"/);assert.doesNotMatch(icon,/>添加附件</);
 assert.match(icon,/caToggleMenu/);assert.doesNotMatch(icon,/-input.*click/);
 const menu=run('caSourceMenuHTML()');for(const label of ['品牌文件','素材库','本地上传'])assert.ok(menu.includes(label));
 assert.equal((menu.match(/role="menuitem"/g)||[]).length,3);assert.doesNotMatch(menu,/caSelect|type="file"|\.click\(/);
 add('task','chat-test');assert.match(run(`caPendingHTML(caGet('task',task.id))`),/模拟上传中/);
 run(`caRemove(caGet('task',task.id).id,caGet('task',task.id).files[0].id)`);
 assert.equal(run(`caFiles(caGet('task',task.id)).length`),0);finish();
});
check('task send blocks pending upload then supports attachment-only messages',()=>{
 add('task','chat-test');node('ci').value='';run('addC()');assert.equal(run('task.cmts.length'),0);
 finish();run('addC()');assert.equal(run('task.cmts.length'),1);
 assert.equal(run('task.cmts[0].tx'),'');assert.equal(run('task.cmts[0].attachments[0].name'),'reference.pdf');
 assert.equal(run(`caGet('task',task.id).files.length`),0);
 assert.match(run('convList(task)'),/reference.pdf/);assert.match(run('convList(task)'),/未上传或解析/);
});
check('text and files are sent together; empty repeat does not duplicate',()=>{
 add('task','chat-test',null,'brief.docx');finish();node('ci').value='请参考这份资料';
 run('addC()');assert.equal(run('task.cmts[1].tx'),'请参考这份资料');
 assert.equal(run('task.cmts[1].attachments[0].name'),'brief.docx');
 node('ci').value='';run('addC()');assert.equal(run('task.cmts.length'),2);
});
check('task, artifact, plan and general-Agent drafts are isolated and survive redraw',()=>{
 run(`caRemember('sub','chat-art','留给第一篇',0)`);add('sub','chat-art',0,'plan0.pdf');
 add('sub','chat-art',1,'plan1.pdf');finish();
 assert.equal(run(`caGet('sub','chat-art',0).text`),'留给第一篇');
 assert.equal(run(`caGet('sub','chat-art',1).text`),'');
 assert.equal(run(`caFiles(caGet('task',task.id)).length`),0);
 assert.equal(run(`caFiles(caGet('general',task.id)).length`),0);
 assert.match(run(`caComposerHTML('sub','chat-art',0)`),/plan0.pdf/);
 assert.doesNotMatch(run(`caComposerHTML('sub','chat-art',0)`),/plan1.pdf/);
});
check('artifact attachment comments stay in their plan and do not trigger fake rewrites',()=>{
 node('si').value='参考附件';run(`subSend('chg','chat-art',0)`);
 assert.equal(run('task.arts[0].plans[0].sub.length'),1);
 assert.equal(run('task.arts[0].plans[0].sub[0].attachments[0].name'),'plan0.pdf');
 assert.equal(run('task.arts[0].plans[1].sub.length'),0);
 assert.equal(run('task.arts[0].v'),1);
 assert.match(run('subMsgs(task.arts[0].plans[0].sub)'),/plan0.pdf/);
 assert.equal(run(`caGet('sub','chat-art',1).files.length`),1);
});
check('validation and filename escaping are shared with the creation form',()=>{
 context.files=[{name:'bad.exe',size:1024},{name:'empty.txt',size:0},{name:'huge.pdf',size:21*1024*1024},{name:'<img onerror="x">.pdf',size:1024}];
 run(`caSelect(caGet('task',task.id).id,files)`);finish();
 assert.equal(run(`caFiles(caGet('task',task.id)).length`),1);
 assert.match(run(`caPendingHTML(caGet('task',task.id))`),/超过 20 MB/);
 assert.doesNotMatch(run(`caPendingHTML(caGet('task',task.id))`),/<img/);
 run(`caClear(caGet('task',task.id))`);
});
check('drag/drop and creation-modal reset do not affect conversation uploads',()=>{
 context.event={preventDefault(){},dataTransfer:{files:[{name:'drop.csv',size:1024}]}};
 run(`caDrop(event,caGet('task',task.id).id);taReset()`);finish();
 assert.equal(run(`caFiles(caGet('task',task.id))[0].name`),'drop.csv');
 run(`caClear(caGet('task',task.id))`);
});
check('general-Agent attachment send stores the file without pretending to read it',()=>{
 run(`task.generalAgentConfirmed=true;task.generalMessages=[];task.arts.push({id:'general-art-test',mode:'general-session',v:1,body:'Original',ttl:'Original',st:'review'});S.generalAgentTaskId=task.id;`);
 add('general','chat-test',null,'data.xlsx');node('general-agent-input').value='';
 run(`sendGeneralAgentMessage(task.id)`);assert.equal(run('task.generalMessages.length'),0);
 finish();run(`sendGeneralAgentMessage(task.id)`);
 assert.equal(run('task.generalMessages.length'),1);
 assert.equal(run('task.generalMessages[0].attachments[0].name'),'data.xlsx');
 assert.equal(run('task.arts[1].v'),1);assert.equal(run('task.arts[1].body'),'Original');
 assert.match(node('dw').innerHTML,/data.xlsx/);assert.match(node('dw').innerHTML,/ca-compose/);
});
check('plain text messaging still works without attachments',()=>{
 node('ci').value='普通留言';run('addC()');assert.equal(run('task.cmts.at(-1).tx'),'普通留言');
 node('si').value='普通评论';run(`subSend('note','chat-art',0)`);
 assert.equal(run('task.arts[0].plans[0].sub.at(-1).tx'),'普通评论');
});
