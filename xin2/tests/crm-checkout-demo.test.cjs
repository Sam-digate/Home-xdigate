const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const timers=[];let allowed=true;const nodes={};const $=id=>nodes[id]||(nodes[id]={value:'',innerHTML:'',classList:{add(){}}});
const ctx=vm.createContext({setTimeout(fn){timers.push(fn);},AG:{},ONLINE:{},REG:[],T:[],S:{},U:{du:{n:'dudu'}},currentUser:()=> 'du',permissionHasPage:()=>allowed,$,render(){},toast(){},closeDw(){},closeMod(){},kpIcons(){},esc:String,STN:{todo:'todo',review:'review',done:'done'}});
vm.runInContext(fs.readFileSync('js/28-crm-checkout-demo.js','utf8'),ctx);
const t=ctx.crmTask();assert.equal(t.st,'todo');ctx.crmGenerate();assert.equal(t.st,'run');assert.ok(ctx.crmRunningHTML(t.crm).includes('progressbar'));ctx.crmGenerate();assert.equal(timers.length,3);while(timers.length)timers.shift()();assert.equal(t.st,'review');assert.equal(t.outputCount,1);ctx.crmCompleteDelivery();assert.equal(t.st,'review');
ctx.crmOpenBundle();assert.ok($('dw').innerHTML.includes('crm-mail-card'));ctx.crmDrawBundle(0);assert.ok($('dw').innerHTML.includes('crm-bundle-subject'));
ctx.crmEditBundleField(0,'subject','Revised subject');ctx.crmNavigateBundle(1);assert.equal(ctx.S.crmBundleDraft[0].subject,'Revised subject');
ctx.crmEditBundleField(2,'body','');ctx.crmSaveBundle(true);assert.equal(t.st,'review');assert.notEqual(t.crm.mails[0].subject,'Revised subject');
ctx.crmEditBundleField(2,'body',t.crm.mails[2].body);ctx.crmSaveBundle(false);assert.ok(t.crm.mails.every(m=>!m.approved));assert.equal(t.st,'review');
allowed=false;ctx.crmSaveBundle(true);assert.equal(t.st,'review');allowed=true;ctx.crmSaveBundle(true);assert.equal(t.st,'done');assert.equal(t.crm.stage,'done');assert.equal(ctx.S.crmDeliveredOutputs.length,1);
ctx.crmSaveBundle(true);ctx.crmCompleteDelivery();assert.equal(ctx.S.crmDeliveredOutputs.length,1);assert.equal(typeof ctx.crmSend,'undefined');
console.log('PASS CRM single output, card/detail navigation, atomic validation, draft review, approval delivery, permissions and duplicate protection');

t.crm.stage='review';t.st='review';ctx.crmOpenBundle();ctx.crmDrawBundle(0);assert.equal(ctx.crmBundleDirty(),false);const saved=t.crm.mails[0].subject;
ctx.crmEditBundleField(0,'subject','unsaved');assert.equal(ctx.crmBundleDirty(),true);ctx.crmNavigateBundle(1);assert.equal(ctx.S.crmBundleIndex,0);assert.ok($('mod').innerHTML.includes('crmResolveNavigation'));
ctx.crmResolveNavigation(false);assert.equal(ctx.S.crmBundleIndex,1);assert.equal(ctx.S.crmBundleDraft[0].subject,saved);assert.equal(ctx.crmBundleDirty(),false);
ctx.crmEditBundleField(1,'body','Updated body');ctx.crmNavigateBundle(null);ctx.crmResolveNavigation(true);assert.equal(ctx.S.crmBundleIndex,null);assert.equal(t.crm.mails[1].body,'Updated body');assert.equal(ctx.crmBundleDirty(),false);
ctx.crmEditBundleField(0,'subject','temp');ctx.crmEditBundleField(0,'subject',t.crm.mails[0].subject);assert.equal(ctx.crmBundleDirty(),false);
console.log('PASS dirty detection, reverted edits, navigation save/discard and disabled save reset');
