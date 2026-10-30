// State/markup regression checks; this is not a browser layout test.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const nodes=new Map(),opened=[],navigated=[],sameTab=[];
const timers=new Map();let timerId=0;
function tick(){const first=timers.entries().next().value;if(first){timers.delete(first[0]);first[1]()}}
function finish(){while(timers.size)tick()}
function node(id){
 if(!nodes.has(id)){
  const classes=new Set();
  nodes.set(id,{innerHTML:'',textContent:'',value:'',
   classList:{add(...names){names.forEach(n=>classes.add(n))},remove(...names){names.forEach(n=>classes.delete(n))},contains(n){return classes.has(n)}},focus(){}});
 }
 return nodes.get(id);
}
const context=vm.createContext({console,location:{hash:''},
 setTimeout(fn){timers.set(++timerId,fn);return timerId},clearTimeout(id){timers.delete(id)},
 window:{open(...args){opened.push(args);return {opener:null,location:{replace(url){navigated.push(url)}},close(){}}},location:{assign(url){sameTab.push(url)}}},
 document:{getElementById:node,querySelector(selector){
  if(selector==='.dl-create')return node('mod').classList.contains('on')?node('submit'):null;
  return null;
 }},
 peek(){return '<div class="pk-a"><button>批准</button><button>退回</button><span class="v">v1</span></div>'},openDw(){},closeDw(){},
 closeMod(){node('mod').classList.remove('on')},drawDw(){},render(){},currentUser(){return 'br'}
});
const run=code=>vm.runInContext(code,context);
run(fs.readFileSync(path.join(root,'js/01-helpers-data.js'),'utf8'));
run(`function findArt(id){for(const t of T){const a=t.arts?.find(a=>a.id===id);if(a)return [t,a]}return []}`);
run(fs.readFileSync(path.join(root,'js/11-document-layer.js'),'utf8'));
run(`toast=()=>{};const demo=T.find(t=>t.id==='t1-label-copy');if(demo.outputCount!==1||demo.arts[0].plans.length!==1)throw new Error('Demo must have one output');const fixture=JSON.parse(JSON.stringify(demo.arts[0]));fixture.id='document-test-fixture';fixture.plans.push(JSON.parse(JSON.stringify(fixture.plans[0])));T.push({id:'document-test-task',arts:[fixture]});const fixtureBefore=JSON.stringify(fixture);`);
function check(name,fn){fn();console.log('PASS',name)}
check('create entry exists only for supported outputs',()=>{
 assert.match(run('peek(fixture)'),/dlCreate/);
 const html=run('peek(fixture)');
 assert.ok(html.indexOf('退回')<html.indexOf('dlCreate'));
 assert.ok(html.indexOf('dlCreate')<html.indexOf('<span class="v">'));
 assert.equal(run(`dlSupported({mode:'plans',plans:[],st:'review'})`),false);
 assert.equal(run(`dlSupported({mode:'report',st:'run'})`),false);
 assert.equal(run(`dlSupported({mode:'roster',st:'review'})`),false);
});
check('cancel creates no association and opens no tab',()=>{
 run('dlCreate(fixture.id,0);closeMod();dlConfirmCreate()');
 assert.equal(run('DL_RECORDS.size'),0);assert.equal(opened.length,0);
});
check('file type defaults to the recommendation and can be overridden',()=>{
 run('dlCreate(fixture.id,1)');
 assert.equal(run('dlCreation.type'),'docx');
 assert.match(node('mod').innerHTML,/<select id="dl-type"/);
 assert.match(node('mod').innerHTML,/<option value="docx" selected>Word 文档 · DOCX（推荐）/);
 assert.equal(run(`dlFormat({mode:'adtable'})`),'xlsx');
 assert.equal(run(`dlFormat({mode:'pptfile'})`),'pptx');
 run(`dlSelectType('xlsx')`);assert.equal(run('dlCreation.type'),'xlsx');
 run(`dlSelectType('invalid')`);assert.equal(run('dlCreation.type'),'xlsx');
 run('closeMod()');
});
check('blank name keeps the confirmation open',()=>{
 run(`dlCreate(fixture.id,1);dlCreation.name='  ';dlConfirmCreate()`);
 assert.equal(run('DL_RECORDS.size'),0);assert.equal(opened.length,0);
 assert.equal(node('mod').classList.contains('on'),true);
});
check('cancel during progress stops creation and leaves source unchanged',()=>{
 run(`dlCreation.name='Example document';dlConfirmCreate()`);
 assert.match(node('dl-progress').innerHTML,/正在生成文件/);
 assert.equal(run('DL_RECORDS.size'),0);
 run('closeMod()');finish();
 assert.equal(run('DL_RECORDS.size'),0);assert.equal(opened.length,0);
 assert.equal(run('JSON.stringify(fixture)===fixtureBefore'),true);
});
check('creation completes into document details without automatic navigation',()=>{
 const drawerBefore=node('dw').innerHTML;
 run(`dlCreate(fixture.id,1);dlSelectType('xlsx');dlConfirmCreate();dlSelectType('pptx');dlConfirmCreate()`);
 assert.equal(timers.size,1,'double click must not create duplicate timers');
 assert.equal(run('DL_RECORDS.size'),0);assert.equal(opened.length,0);
 assert.match(node('dl-progress').innerHTML,/1\/3 · 正在生成文件/);
 tick();assert.match(node('dl-progress').innerHTML,/2\/3 · 正在保存文件/);
 tick();assert.match(node('dl-progress').innerHTML,/3\/3 · 正在关联任务/);
 assert.equal(run('DL_RECORDS.size'),0);
 tick();
 assert.doesNotMatch(node('dl-progress').innerHTML,/<ol|dl-progress-steps/);
 assert.doesNotMatch(node('mod').innerHTML,/id="dl-progress-open"|>创建完成</);
 assert.equal(opened.length,0,'creation completion must not open the editor');
 assert.equal(run('DL_RECORDS.size'),1);
 assert.equal(run('dlRecord(fixture,1).type'),'xlsx','creation preserves the selected format');
 assert.equal(node('dw').innerHTML,drawerBefore);
 assert.equal(opened.length,0);assert.equal(navigated.length,0);
 assert.match(node('mod').innerHTML,/dl-document-title/);
 assert.match(node('mod').innerHTML,/在 Office 中编辑/);
 assert.equal(node('mod').classList.contains('on'),true);
 assert.equal(run('DL_RECORDS.size'),1);
});
check('reopen uses a document-details button with no duplicate association',()=>{
 const html=run('dlActionHTML(fixture,1)');
 assert.match(html,/>打开在线文档<\/button>/);
 assert.doesNotMatch(html,/（示例）/);
 assert.match(html,/dlShowDocument/);
 run('dlCreate(fixture.id,1)');assert.equal(opened.length,0);
 assert.equal(run('DL_RECORDS.size'),1);
});
check('document details shows stored metadata and does not open Office automatically',()=>{
 const before=opened.length;
 run('dlShowDocument(fixture.id,1)');
 const html=node('mod').innerHTML;
 for(const text of ['在线文档','文档名称','存放位置','生成人','来源任务','在 Office 中编辑','复制链接','下载','在知识库中查看','完成'])assert.ok(html.includes(text),text);
 assert.equal(opened.length,before);
 assert.match(html,/SharePoint · 示例位置/);
 assert.equal(node('mod').classList.contains('on'),true);
 run('closeMod()');
});
check('PPT default document opens the configured example without creating an association',()=>{
 const count=run('DL_RECORDS.size');
 run("T.push({id:'ppt-default-task',own:'du',arts:[{id:'ppt-default-file',mode:'pptfile',st:'review',ttl:'PPT 默认文档',v:1}]});dlShowDocument('ppt-default-file',null)");
 assert.match(node('mod').innerHTML,/已关联默认在线文档/);
 assert.doesNotMatch(node('mod').innerHTML,/尚未关联|disabled/);
 assert.equal(run("dlDisplayRecord(findArt('ppt-default-file')[1],null).url"),run('DL_OFFICE_EXAMPLE'));
 assert.equal(run('DL_RECORDS.size'),count);
 run("findArt('ppt-default-file')[1].st='done'");
 assert.equal(run("dlActionHTML(findArt('ppt-default-file')[1],null)"),'');
 assert.match(fs.readFileSync(path.join(root,'css/09-document-layer.css'),'utf8'),/\.dl-document \.mhd>\.ib\{position:absolute;top:16px;right:18px/);
});
check('different plans keep their own association and source stays unchanged',()=>{
 run('dlCreate(fixture.id,0);dlConfirmCreate()');
 finish();run('closeMod()');
 assert.equal(run('DL_RECORDS.size'),2);
 assert.equal(run('JSON.stringify(fixture)===fixtureBefore'),true);
 assert.equal(run('dlRecord(fixture,0).isExample'),true);
});
check('local editor and simulated version APIs are removed',()=>{
 for(const name of ['dlView','dlDraw','dlExtract','dlEdit','dlSave','dlPreviewVersion','dlCanDiscard'])assert.equal(run('typeof '+name),'undefined');
 assert.equal(run('dlRecord(fixture,1).versions'),undefined);
 assert.equal(run('dlRecord(fixture,1).logs'),undefined);
});
check('failed window open leaves a usable retry link',()=>{
 run(`window.open=()=>{throw new Error('blocked')};dlOpen(fixture.id,1)`);
 assert.match(run('dlActionHTML(fixture,1)'),/dlShowDocument/);
});
check('automatic popup blocking falls back to direct same-tab navigation',()=>{
 run('dlAutoOpen(fixture.id,1)');
 assert.equal(sameTab.length,1);assert.match(sameTab[0],/xdigate.sharepoint.com/);
 context.window.open=()=>null;
 run('dlAutoOpen(fixture.id,1)');assert.equal(sameTab.length,2);
});
check('drawer action is inserted after the footer comment button',()=>{
 const inserts=[];
 const comment={textContent:'评论 1',insertAdjacentHTML(position,html){inserts.push({position,html})}};
 const notes=[];
 const footer={querySelector(){return null},querySelectorAll(){return [{textContent:'批准'},comment]},insertAdjacentHTML(position,html){notes.push({position,html})}};
 context.document.querySelector=selector=>selector==='#dw .dw-artifact-content > .dw-f'?footer:null;
 run('S.aid=fixture.id;S.oi=1;S.cr=null;S.brief=null;drawDw()');
 assert.equal(inserts.length,1);assert.equal(inserts[0].position,'afterend');
 assert.match(inserts[0].html,/>打开在线文档<\/button>/);
 assert.doesNotMatch(inserts[0].html,/dl-source-bar/);
 assert.equal(notes.length,1);
 assert.match(notes[0].html,/注: 系统与在线文档的修改不会自动同步/);
 run('DL_RECORDS.delete(dlContext(fixture,1).key);drawDw()');
 assert.equal(notes.length,1,'no sync note before creation');
});
