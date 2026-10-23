const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),nodes=new Map(),timers=new Map(),listeners=new Map();let serial=0;
function node(id){if(!nodes.has(id)){const classes=new Set();nodes.set(id,{id,innerHTML:'',textContent:'',value:'',classList:{add:(...xs)=>xs.forEach(x=>classes.add(x)),remove:(...xs)=>xs.forEach(x=>classes.delete(x)),contains:x=>classes.has(x),toggle:(x,on)=>on?classes.add(x):classes.delete(x)},querySelector:()=>null,querySelectorAll:()=>[],style:{setProperty(){}},setAttribute(){},removeAttribute(){},focus(){context.document.activeElement=this;}});}return nodes.get(id);}
let context;
context=vm.createContext({console,location:{hash:''},window:{addEventListener(){}},document:{getElementById:node,querySelectorAll:()=>[],removeEventListener(){},querySelector:s=>s==='.pub-preview .ib'?node('preview-close'):null,addEventListener(name,fn){if(!listeners.has(name))listeners.set(name,[]);listeners.get(name).push(fn);},createElement:()=>node('new')},setTimeout(fn){timers.set(++serial,fn);return serial;},clearTimeout(id){timers.delete(id);},setInterval(){},clearInterval(){},requestAnimationFrame(){},URL,Intl,Date});
const run=code=>vm.runInContext(code,context);
for(const file of ['01-helpers-data.js','02-core-nav-today-comments.js','03-agents-recipes-proposals.js','04-campaigns-analytics-i18n.js','05-knowledge-work.js','06-thread-artifacts-drawer.js','07-listing-promotion-pdp-drawers.js','10-permissions.js','12-task-attachments.js','13-conversation-attachments.js','16-task-deletion.js']){
 run(fs.readFileSync(path.join(root,'js',file),'utf8'));
}
run(fs.readFileSync(path.join(root,'js/08-subthreads-newthread-init.js'),'utf8').split("document.addEventListener('keydown'")[0]);
run(fs.readFileSync(path.join(root,'js/20-publish-demo.js'),'utf8'));
run('const pubTestFuture=pubDefaultTime()');
const original=run("JSON.stringify(findArt('a2-label-copy')[1])");
function reset(){timers.clear();run("pubDispose();PUB_RECORDS.length=0;findArt('a2-label-copy')[0].arts[0]="+original+";findArt('a2-label-copy')[0].deletedAt=null;findArt('a2-label-copy')[0].executionCancelled=false;findArt('a2-label-copy')[0].own='du';permissionCanAccessView=()=>true;permissionCurrentMember=()=>({role:'admin',status:'active'});currentUser=()=> 'du';render=()=>{};");}
function approve(){run("findArt('a2-label-copy')[1].plans[0].s='done'");}
function open(){approve();run("pubOpen('a2-label-copy')");}
function flush(){for(let pass=0;timers.size&&pass<10;pass++){const jobs=[...timers.values()];timers.clear();jobs.forEach(fn=>fn());}}
function check(name,fn){reset();fn();console.log('PASS',name);}
check('publish entry replaces placeholder toast and approval gates opening',()=>{
 const core=fs.readFileSync(path.join(root,'js/06-thread-artifacts-drawer.js'),'utf8');assert.match(core,/n==='发布'.*pubActionHTML/);
 run("pubOpen('a2-label-copy')");assert.equal(run('pubDraft'),null);approve();assert.match(run("peek(findArt('a2-label-copy')[1])"),/pubOpen/);
 run("pubOpen('a2-label-copy')");assert.equal(node('dw').classList.contains('dw-publish'),true);assert.match(node('dw').innerHTML,/预览发布效果|pubOpenPreview/);assert.match(node('dw').innerHTML,/东京|立即发布/);assert.equal(run('PUB_RECORDS.length'),0);
});
check('whole-page preview shows actual first image title full body and tags in order',()=>{
 open();const title=run('pubDraft.snapshot.title'),image=run('pubDraft.snapshot.image');
 run('pubOpenPreview()');const html=node('mod').innerHTML;
 assert.equal(node('mod').classList.contains('on'),true);assert.match(html,/role="dialog"/);assert.match(html,/aria-modal="true"/);assert.ok(html.includes(image.replace(/&/g,'&amp;')));assert.ok(html.includes(title));assert.match(html,/三、它是不是解决了真实需求/);assert.match(html,/#双十一护肤/);
 assert.ok(html.indexOf('pub-note-cover')<html.indexOf('pub-note-copy'));assert.ok(html.indexOf('pub-note-body')<html.indexOf('pub-note-tags'));assert.doesNotMatch(html,/<textarea|contenteditable|pubConfirm\(/);
 const css=fs.readFileSync(path.join(root,'css/15-publish-demo.css'),'utf8');assert.match(css,/white-space:pre-wrap/);assert.match(css,/max-width:620px/);
});
check('closing preview preserves account schedule drawer width and original source',()=>{
 open();const before=run("JSON.stringify(findArt('a2-label-copy')[1])");run("pubSet('account','xhs-content');pubSet('mode','scheduled');pubSet('when','2099-10-22T13:30');");
 node('dw').classList.add('expanded');run('pubOpenPreview();closeMod()');
 assert.equal(run("pubDraft.account"),'xhs-content');assert.equal(run("pubDraft.mode"),'scheduled');assert.equal(run("pubDraft.when"),'2099-10-22T13:30');assert.equal(node('dw').classList.contains('expanded'),true);assert.equal(run("JSON.stringify(findArt('a2-label-copy')[1])"),before);assert.equal(run('PUB_RECORDS.length'),0);
});
check('preview uses first gallery image and escapes text without inventing tags',()=>{
 approve();run("const p=findArt('a2-label-copy')[1].plans[0];p.images=['https://example.com/first.jpg','https://example.com/second.jpg'];p.t='<img src=x onerror=alert(1)>';p.body='<script>alert(1)</script>\\n保留换行';p.tags=['<b>标签</b>','##测试'];pubOpen('a2-label-copy');pubOpenPreview();");
 const html=node('mod').innerHTML;assert.match(html,/https:\/\/example.com\/first.jpg/);assert.doesNotMatch(html,/second.jpg/);assert.match(html,/&lt;script&gt;/);assert.match(html,/#&lt;b&gt;标签&lt;\/b&gt;/);assert.match(html,/#测试/);assert.doesNotMatch(html,/<script>|<img src=x|<b>标签/);
 run('closeMod();pubDispose();delete p.tags;p.images=[];p.img="javascript:alert(1)";pubOpen("a2-label-copy");pubOpenPreview()');assert.match(node('mod').innerHTML,/暂未设置标签/);assert.match(node('mod').innerHTML,/尚未设置第一张图片/);run('closeMod();pubSubmit()');assert.equal(run('pubDraft.stage'),'settings');assert.match(run('pubDraft.error'),/图片/);
});
check('settings submits directly without an intermediate confirmation screen',()=>{
 open();assert.doesNotMatch(node('dw').innerHTML,/确认信息|下一步|确认模拟发布|确认模拟排期/);assert.match(node('dw').innerHTML,/onclick="pubSubmit\(\)">发布/);
 run('pubOpenPreview();closeMod()');assert.equal(run('pubDraft.stage'),'settings');run('pubSubmit();pubSubmit()');assert.equal(run('pubDraft.stage'),'running');assert.equal(run('PUB_RECORDS.length'),0);flush();
 assert.equal(run('PUB_RECORDS.length'),1);assert.equal(run('pubDraft.stage'),'detail');assert.match(node('dw').innerHTML,/内容已发布/);assert.equal(run("findArt('a2-label-copy')[1].plans[0].s"),'done');
 run('pubShowRecords(true)');assert.match(node('dw').innerHTML,/PUB-/);assert.match(run("pubActionHTML(findArt('a2-label-copy')[1])"),/查看发布/);
 run("pubOpen('a2-label-copy');pubSubmit()");flush();assert.equal(run('PUB_RECORDS.length'),1);assert.equal(run('pubDraft.stage'),'detail');assert.doesNotMatch(node('dw').innerHTML,/pubSubmit|pub-account|pub-modes/);
});
check('scheduled demo validates future Tokyo datetime and never auto-publishes',()=>{
 open();for(const date of ['2020-01-01T00:00','2099-02-31T08:00','invalid']){run("pubSet('mode','scheduled');pubSet('when',"+JSON.stringify(date)+");pubSubmit()");assert.equal(run('pubDraft.stage'),'settings');assert.match(run('pubDraft.error'),/未来/);}
 run("pubSet('when',pubTestFuture);pubSubmit()");flush();assert.equal(run('PUB_RECORDS[0].mode'),'scheduled');assert.equal(run('PUB_RECORDS[0].when'),run('pubTestFuture'));assert.match(node('dw').innerHTML,/内容已安排发布/);assert.equal(run('PUB_RECORDS.length'),1);flush();assert.equal(run('PUB_RECORDS.length'),1);
});
check('account availability permissions approval version and deletion rechecked before completion',()=>{
 for(const mutation of ["PUB_ACCOUNTS[0].status='expired'","permissionCanAccessView=()=>false","permissionCurrentMember=()=>({role:'admin',status:'disabled'})","findArt('a2-label-copy')[1].plans[0].s='review'","findArt('a2-label-copy')[1].plans[0].body+='changed'","findArt('a2-label-copy')[1].v++","findArt('a2-label-copy')[0].deletedAt='now'"]){
  reset();run("PUB_ACCOUNTS[0].status='ready'");open();run('pubSubmit();'+mutation);flush();assert.equal(run('PUB_RECORDS.length'),0,mutation);assert.equal(run('pubDraft.stage'),'failed',mutation);
 }run("PUB_ACCOUNTS[0].status='ready'");
});
check('disabled account and invalid requests are rejected without mutating the source',()=>{
 open();run("pubSet('account','xhs-expired')");assert.equal(run('pubDraft.account'),'xhs-brand');run("pubDraft.account='xhs-expired';pubSubmit()");assert.match(run('pubDraft.error'),/可用/);
 reset();approve();run("permissionCurrentMember=()=>({role:'member',status:'active'});currentUser=()=> 'other';pubOpen('a2-label-copy')");assert.equal(run('pubDraft'),null);
});
check('failure retry and closing while running have no late publish side effects',()=>{
 open();run('pubSubmit();pubFail()');flush();assert.equal(run('PUB_RECORDS.length'),0);assert.equal(run('pubDraft.stage'),'failed');run('pubBack();pubSubmit();closeDw()');flush();assert.equal(run('pubDraft'),null);assert.equal(run('PUB_RECORDS.length'),0);
 open();run("pubSubmit();openDw('a2-label-copy',0)");flush();assert.equal(run('PUB_RECORDS.length'),0);assert.equal(run('pubDraft'),null);
});
check('escape closes preview first and then publishing drawer',()=>{
 open();run('pubOpenPreview()');const e={key:'Escape',preventDefault(){},stopImmediatePropagation(){}};
 const handler=listeners.get('keydown').at(-1);handler(e);assert.equal(node('mod').classList.contains('on'),false);assert.ok(run('pubDraft'));assert.equal(node('dw').classList.contains('on'),true);handler(e);assert.equal(run('pubDraft'),null);assert.equal(node('dw').classList.contains('on'),false);
});
check('publish record count tab is omitted in settings and completed details',()=>{
 open();assert.doesNotMatch(node('dw').innerHTML,/发布记录（|onclick="pubShowRecords\(true\)"/);
 run('pubSubmit()');flush();assert.doesNotMatch(node('dw').innerHTML,/发布记录（|onclick="pubShowRecords\(true\)"/);assert.match(node('dw').innerHTML,/发布详情|预览发布效果/);
});
check('publisher is captured on submit and remains stable when viewing as a different user',()=>{
 for(const mode of ['now','scheduled']){
  reset();open();const name=run('U.du.n');run("pubSet('mode',"+JSON.stringify(mode)+");pubSet('when',pubTestFuture);pubSubmit();currentUser=()=> 'br'");flush();
  assert.equal(run('PUB_RECORDS[0].publisherId'),'du');assert.equal(run('PUB_RECORDS[0].publisherName'),name);assert.match(node('dw').innerHTML,/<dt>发布者<\/dt>/);
  assert.ok(node('dw').innerHTML.includes('<dt>发布者</dt><dd>'+name+'</dd>'));run("closeDw();pubOpen('a2-label-copy')");assert.equal(run('pubDraft.stage'),'detail');assert.ok(node('dw').innerHTML.includes('<dt>发布者</dt><dd>'+name+'</dd>'));
 }
});
check('publisher display is escaped and older records do not invent an operator',()=>{
 open();const name=run('U.du.n');
 try{
  run("U.du.n='<img src=x>';pubSubmit()");flush();assert.match(node('dw').innerHTML,/<dt>发布者<\/dt><dd>&lt;img src=x&gt;<\/dd>/);assert.doesNotMatch(node('dw').innerHTML,/<img src=x>/);
  run('delete PUB_RECORDS[0].publisherName;pubPaint()');assert.match(node('dw').innerHTML,/<dt>发布者<\/dt><dd>未记录<\/dd>/);
 }finally{run('U.du.n='+JSON.stringify(name));}
});
check('main page loads publishing feature and no platform or persistence APIs are called',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),js=fs.readFileSync(path.join(root,'js/20-publish-demo.js'),'utf8');assert.match(html,/css\/15-publish-demo.css/);assert.match(html,/js\/20-publish-demo.js/);assert.doesNotMatch(js,/\bfetch\(|XMLHttpRequest|localStorage|sessionStorage|window\.open/);
});
check('publishing screens use normal product labels without simulation disclaimers',()=>{
 open();const clean=()=>assert.doesNotMatch(node('dw').innerHTML,/模拟|演示|真实平台|预置示例/);
 clean();assert.match(node('dw').innerHTML,/>发布<\/button>/);run('pubOpenPreview()');assert.doesNotMatch(node('mod').innerHTML,/模拟|演示/);run("closeMod();pubSet('mode','scheduled');pubSet('when',pubTestFuture)");clean();assert.match(node('dw').innerHTML,/>定时发布<\/button>/);
 run('pubSubmit()');clean();flush();clean();run('pubShowRecords(true)');clean();
});
check('schedule picker and submit both enforce a moving ten-day window',()=>{
 open();run("pubSet('mode','scheduled')");const bounds=run('pubScheduleBounds()');
 const html=node('dw').innerHTML;assert.ok(html.includes('min="'+bounds.min+'"'));assert.ok(html.includes('max="'+bounds.max+'"'));
 const savedNow=Date.now,reference=Date.parse('2026-10-22T12:00:30+09:00');Date.now=()=>reference;
 try{
  assert.equal(run('pubScheduleBounds().min'),'2026-10-22T12:01');assert.equal(run('pubScheduleBounds().max'),'2026-11-01T12:00');
  for(const date of ['2026-10-21T12:00','2026-10-22T12:00','2026-11-01T12:01','2026-11-02T00:00']){
   run("pubSet('when',"+JSON.stringify(date)+")");assert.match(run('pubValidation(pubDraft)'),/10 天/);
  }
  for(const date of ['2026-10-22T12:01','2026-10-27T13:00','2026-11-01T12:00']){
   run("pubSet('when',"+JSON.stringify(date)+")");assert.equal(run('pubValidation(pubDraft)'),'');
  }
  run('pubRefreshScheduleBounds()');assert.equal(node('pub-when').min,'2026-10-22T12:01');assert.equal(node('pub-when').max,'2026-11-01T12:00');
 }finally{Date.now=savedNow;}
});
check('published record reopens as read-only details with original snapshot even after source changes',()=>{
 open();const before=run('pubDraft.snapshot.title');run("pubSubmit()");flush();run("closeDw();findArt('a2-label-copy')[1].plans[0].t='新标题';findArt('a2-label-copy')[1].plans[0].s='review';findArt('a2-label-copy')[1].v++;pubOpen('a2-label-copy')");
 assert.equal(run('pubDraft.stage'),'detail');assert.equal(run('pubDraft.snapshot.title'),before);assert.match(node('dw').innerHTML,/发布详情|内容已发布/);assert.doesNotMatch(node('dw').innerHTML,/pub-steps|pub-account|pub-modes|pubSubmit|pubEditSchedule|pubCancelSchedule/);
 run("pubOpenPreview()");assert.ok(node('mod').innerHTML.includes(before));assert.doesNotMatch(node('mod').innerHTML,/新标题/);assert.match(node('mod').innerHTML,/返回发布详情/);run('closeMod();pubShowRecords(true)');assert.match(node('dw').innerHTML,/查看详情|pubOpenRecord/);run('pubShowRecords(false)');assert.doesNotMatch(node('dw').innerHTML,/pub-account|pubSubmit/);
 assert.match(node('dw').innerHTML,/如需修改或删除已发布内容，请前往小红书平台后台操作/);
});
check('scheduled details direct content time and cancellation changes to the platform backend',()=>{
 open();run("pubSet('mode','scheduled');pubSet('when',pubTestFuture);pubSubmit()");flush();const before=run('JSON.stringify(PUB_RECORDS[0])');
 run("closeDw();pubOpen('a2-label-copy')");assert.equal(run('pubDraft.stage'),'detail');
 assert.match(node('dw').innerHTML,/如需修改内容、调整发布时间或取消定时发布，请前往小红书平台后台操作/);
 assert.doesNotMatch(node('dw').innerHTML,/pub-steps|pub-account|pub-modes|pubSubmit|pubEditSchedule|pubCancelSchedule|保存时间/);
 assert.match(run("pubActionHTML(findArt('a2-label-copy')[1])"),/查看排期/);assert.match(run("pubActionHTML(findArt('a2-label-copy')[1])"),/已定时/);assert.doesNotMatch(node('dw').innerHTML,/待发布/);
 run('pubShowRecords(true);pubOpenRecord(PUB_RECORDS[0].id);pubOpenPreview();closeMod()');assert.equal(run('pubDraft.stage'),'detail');assert.equal(run('JSON.stringify(PUB_RECORDS[0])'),before);
});
check('completed publication screens have no local schedule mutation handlers',()=>{
 const source=fs.readFileSync(path.join(root,'js/20-publish-demo.js'),'utf8');assert.doesNotMatch(source,/function pub(EditSchedule|SaveSchedule|CancelSchedule|StartAgain)|stage='reschedule'/);
 open();run('pubSubmit()');flush();run("closeDw();permissionCanAccessView=()=>false;pubOpen('a2-label-copy')");assert.equal(run('pubDraft'),null);assert.equal(run('PUB_RECORDS.length'),1);
});
