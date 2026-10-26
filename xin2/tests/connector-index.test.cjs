const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');

// Exercise the real route rather than only checking the navigation label.
const pageJSON=read('index.html').match(/<script id="connector-page" type="application\/json">\s*([\s\S]*?)\s*<\/script>/)[1],inlinePage=JSON.parse(pageJSON);
const context=vm.createContext({S:{view:'connector',hist:[]},$:()=>context.view,view:{innerHTML:''},
 document:{getElementById:id=>id==='connector-page'?{textContent:pageJSON}:null},
 esc:value=>String(value).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))});
vm.runInContext(read('js/02-core-nav-today-comments.js'),context);
vm.runInContext('render()',context);
assert.match(context.view.innerHTML,/title="Connector · 连接与授权管理"/);
assert.match(context.view.innerHTML,/srcdoc="/);
assert.doesNotMatch(context.view.innerHTML,/\ssrc="connector-demo.html/);
assert.match(inlinePage,/<html lang="zh-CN" class="embedded">/);
assert.match(inlinePage,/src="js\/connector-demo.js"/);
assert.match(inlinePage,/href="css\/connector-demo.css\?v=4"/);
assert.doesNotMatch(inlinePage,/\bfetch\(|XMLHttpRequest/);
for(const match of inlinePage.matchAll(/<(script|link)\b[^>]*\b(?:src|href)="((?:js|css)\/[^"]+)"/g)){
 assert.ok(fs.existsSync(path.join(root,match[2].split('?')[0])),'shared js/css asset must be included: '+match[2]);
}
assert.doesNotMatch(context.view.innerHTML,/不在本次原型范围/);
assert.match(read('js/01-helpers-data.js'),/id:'connector',n:'Connector',i:'connector'/);
const initialState=read('js/01-helpers-data.js').match(/^let S=.*$/m)[0];
assert.equal(vm.runInNewContext(initialState+'S.view',{location:{hash:''}}),'connector');
assert.equal(vm.runInNewContext(initialState+'S.view',{location:{hash:'#permission'}}),'permission');

// The new view must participate in the existing page-permission contract.
const permissions=read('js/10-permissions.js');
assert.match(permissions,/id:'connector',name:'连接与授权'/);
const accessFunction=permissions.match(/function permissionCanAccessView\(view\)\{[\s\S]*?\n\}/)[0];
const access=vm.createContext({permissionHasPage:id=>id!=='connector'});
vm.runInContext(accessFunction,access);
assert.equal(vm.runInContext("permissionCanAccessView('connector')",access),false);
access.permissionHasPage=()=>true;
assert.equal(vm.runInContext("permissionCanAccessView('connector')",access),true);

// Standalone and embedded presentations reuse the same implementation, with
// styles isolated from index so generic .btn/.drawer selectors cannot leak.
const html=read('connector-demo.html'),css=read('css/connector-demo.css');
assert.match(html,/get\('embedded'\)===\s*'1'/);
assert.match(css,/html\.embedded \.sidebar,html\.embedded \.topbar\{display:none\}/);
assert.match(css,/html\.embedded \.main-shell\{margin-left:0/);
assert.doesNotMatch(read('index.html'),/href="css\/connector-demo.css"/);
assert.ok(fs.existsSync(path.join(root,'js/connector-demo.js')));
console.log('PASS Connector navigation, route, permissions and isolated embedded presentation');

// Keep the drawer chrome aligned with index, including the website variant.
assert.match(css,/width:min\(760px,calc\(46vw \+ 200px\),calc\(100vw - 56px\)\)/);
assert.match(css,/\.drawer \.drawer-header\{padding:12px 18px/);
assert.match(css,/\.drawer \.drawer-title-row \.close-drawer\{order:-2/);
assert.match(css,/\.drawer \.drawer-tabs\{[^}]*gap:4px;[^}]*padding:0 18px/);
assert.match(css,/\.drawer \.drawer-tabs button\{padding:8px 13px/);
assert.match(css,/\.drawer \.drawer-body\{[^}]*padding:16px;background:#fff/);
assert.match(css,/\.drawer \.drawer-footer\{[^}]*padding:12px 18px/);
console.log('PASS Connector drawers share index header, tabs, body and footer geometry');

// Opening an overlay changes clipping only, not iframe or background geometry.
let onLoad,onMessage,onResize;
const hostClasses=new Set(),childClasses=new Set(),properties={},sentGeometry=[];
const rootClasses=new Set();
const child={body:{classList:{contains:name=>childClasses.has(name)}},
  documentElement:{style:{setProperty:(key,value)=>properties[key]=value},classList:{add:name=>rootClasses.add(name),contains:name=>rootClasses.has(name)}}};
let box={left:248,top:49,width:1000,height:700,right:1248,bottom:749};
const frame={matches:selector=>selector==='iframe.connector-frame',
  parentElement:{getBoundingClientRect:()=>box},
  contentWindow:{postMessage:message=>sentGeometry.push(message)},
  style:{setProperty:(key,value)=>properties[key]=value},
  classList:{contains:name=>hostClasses.has(name),add:name=>hostClasses.add(name),toggle:(name,on)=>on?hostClasses.add(name):hostClasses.delete(name)}};
const hostWindow={innerWidth:1248,innerHeight:749,addEventListener:(name,fn)=>{if(name==='message')onMessage=fn;if(name==='resize')onResize=fn;}};hostWindow.parent=hostWindow;
const bridge=vm.createContext({window:hostWindow,document:{querySelector:()=>frame,addEventListener:(name,fn)=>{assert.equal(name,'load');onLoad=fn;}}});
vm.runInContext(read('js/15-connector-shell.js'),bridge);
onLoad({target:frame});
assert.equal(hostClasses.has('connector-mounted'),true);
assert.equal(sentGeometry.at(-1).top,49);
const unchanged=JSON.stringify(properties),initialMessages=sentGeometry.length;
onMessage({source:frame.contentWindow,data:{type:'connector-overlay',open:true}});
assert.equal(hostClasses.has('connector-overlay-open'),true);
assert.equal(JSON.stringify(properties),unchanged,'opening must not resize or reposition background');
assert.equal(sentGeometry.length,initialMessages,'opening must not require asynchronous geometry updates');
onMessage({source:{},data:{type:'connector-overlay',open:false}});
assert.equal(hostClasses.has('connector-overlay-open'),true,'ignore unrelated frames');
onMessage({source:frame.contentWindow,data:{type:'connector-overlay',open:false}});
assert.equal(hostClasses.has('connector-overlay-open'),false);
assert.equal(JSON.stringify(properties),unchanged,'closing must not resize background');
onMessage({source:frame.contentWindow,data:{type:'connector-ready'}});
assert.equal(hostClasses.has('connector-ready'),true);
box={...box,left:76,width:1172};onResize();
assert.equal(sentGeometry.at(-1).left,76,'window resizing updates the content slot');
const shellCSS=read('css/01-foundation-shell.css');
assert.match(shellCSS,/\.connector-frame\.connector-mounted\{position:fixed;inset:0;z-index:1000/);
assert.match(shellCSS,/\.connector-frame\.connector-mounted\.connector-overlay-open\{clip-path:inset\(0\)\}/);
assert.match(css,/scrollbar-gutter:stable/);
assert.match(read('index.html'),/src="js\/15-connector-shell.js\?v=4"/);
assert.match(html,/src="js\/15-connector-shell.js\?v=4"/);
let notifyOverlay,childMessage;
const sent=[],parentWindow={postMessage:message=>sent.push(message)};
const embedded=vm.createContext({window:{parent:parentWindow,addEventListener:(name,fn)=>childMessage=fn},
  location:{search:'?embedded=1'},URLSearchParams,Number,document:child,
  MutationObserver:class{constructor(fn){notifyOverlay=fn;}observe(){}}});
vm.runInContext(read('js/15-connector-shell.js'),embedded);
childMessage({source:parentWindow,data:{type:'connector-geometry',top:56,left:228,width:900,height:700}});
assert.equal(properties['--connector-host-top'],'56px');
assert.equal(properties['--connector-host-height'],'700px');
assert.equal(rootClasses.has('shell-mounted'),true);
assert.equal(sent.at(-1).type,'connector-ready');
childClasses.add('overlay-open');notifyOverlay();
assert.equal(sent.at(-1).open,true);
childClasses.delete('overlay-open');notifyOverlay();
assert.equal(sent.at(-1).open,false);
console.log('PASS Connector overlay clipping preserves background geometry and shell navigation');
// srcdoc inherits the parent base URL, but has no ?embedded=1 query.
rootClasses.add('embedded');sent.length=0;
const srcdoc=vm.createContext({window:{parent:parentWindow,addEventListener:(name,fn)=>childMessage=fn},
 location:{search:''},URLSearchParams,Number,document:child,
 MutationObserver:class{constructor(fn){notifyOverlay=fn;}observe(){}}});
vm.runInContext(read('js/15-connector-shell.js'),srcdoc);
assert.equal(sent.at(-1).type,'connector-overlay');
childMessage({source:parentWindow,data:{type:'connector-geometry',top:56,left:228,width:900,height:700}});
assert.equal(sent.at(-1).type,'connector-ready');
console.log('PASS Connector is carried by index and srcdoc works without a separate HTML file');
