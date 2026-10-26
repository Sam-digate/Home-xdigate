const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const code=fs.readFileSync(require('node:path').join(__dirname,'../js/21-theme-switcher.js'),'utf8');
function setup(saved,blocked=false){
 const attrs={},label={},root={dataset:{theme:'sensica'}},childRoot={dataset:{}},links=[];
 const child={documentElement:childRoot,querySelector:()=>links[0],createElement:()=>({}),head:{appendChild:x=>links.push(x)}};
 const stored={value:saved},events={};
 const context={window:{},document:{documentElement:root,getElementById:id=>id==='theme-label'?label:{setAttribute:(k,v)=>attrs[k]=v},querySelector:()=>({contentDocument:child}),addEventListener:(k,fn)=>events[k]=fn},localStorage:{getItem:()=>{if(blocked)throw Error();return stored.value;},setItem:(k,v)=>{if(blocked)throw Error();stored.value=v;}}};
 vm.runInNewContext(code,context);events.DOMContentLoaded();
 return {context,root,childRoot,links,stored,label,attrs};
}
const a=setup(null);assert.equal(a.label.textContent,'Sensica 配色');
a.context.window.toggleAppTheme();assert.equal(a.root.dataset.theme,'default');assert.equal(a.childRoot.dataset.theme,'default');assert.equal(a.label.textContent,'原版配色');assert.equal(a.attrs['aria-pressed'],'false');assert.equal(a.stored.value,'default');assert.equal(a.links.length,1);
a.context.window.toggleAppTheme();assert.equal(a.root.dataset.theme,'sensica');assert.equal(a.childRoot.dataset.theme,'sensica');assert.equal(a.links.length,1);
assert.equal(setup('default').root.dataset.theme,'default');assert.equal(setup('invalid').root.dataset.theme,'sensica');
const b=setup(null,true);assert.doesNotThrow(()=>b.context.window.toggleAppTheme());
console.log('PASS theme toggle, persistence, iframe sync without reload, accessible label and blocked storage fallback');
const skin=fs.readFileSync(require('node:path').join(__dirname,'../css/sensica-theme.css'),'utf8');
assert.match(skin,/html\[data-theme="sensica"\] \.avs\[style\*="#7c3aed" i\]\{background:#9A6B43!important;color:#fff\}/);
assert.match(skin,/\[data-user="du"\]/);
console.log('PASS Sensica covers legacy thread identity and plan badges without changing the default theme');
for(const hex of ['#9A6B43','#24201C','#FBF8F4','#DED4C7','#5C544B','#737373','#C8836A'])assert.ok(skin.includes(hex),hex);
assert.doesNotMatch(skin,/#(?:846247|26231F|F8F5F0|E7E0D7|705239|625B53|82766A)\b/i);
console.log('PASS customer skin uses the verified official homepage palette instead of approximate colors');
