const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const nodes=new Map();function node(id){if(!nodes.has(id)){const classes=new Set();nodes.set(id,{innerHTML:'',textContent:'',classList:{add(...xs){xs.forEach(x=>classes.add(x));},remove(...xs){xs.forEach(x=>classes.delete(x));},contains:x=>classes.has(x)},querySelector:()=>({focus(){}}),focus(){}});}return nodes.get(id);}
const c=vm.createContext({console,location:{hash:''},window:{addEventListener(){}},document:{addEventListener(){},getElementById:node,querySelectorAll:()=>[],activeElement:null},setTimeout(){},clearTimeout(){}});
const run=s=>vm.runInContext(s,c);
c.REG=[];
for(const f of ['01-helpers-data.js','05-knowledge-work.js','10-permissions.js','14-kb-document-demo.js','24-kb-update-review.js'])run(fs.readFileSync('js/'+f,'utf8'));
run(`currentUser=()=>S.currentUser;toast=()=>{};render=()=>{};closeMod=()=>{$('mod').classList.remove('on')};closeDw=()=>{$('dw').classList.remove('on')};kbBrandUpdatesEnsure();`);
const entry=run("KB.find(e=>e.id==='k1')"),latest=entry.pendingUpdate,original=entry.tx,usage=entry.reads;
assert.equal(entry.version,2);assert.equal(entry.knowledgeVersions.length,2);assert.equal(entry.pendingUpdate.version,3);assert.equal(entry.pendingUpdate.baseVersion,2);
c.openKB('k1',3);assert.match(node('dw').innerHTML,/kbOpenRestoreVersion\('k1',1\)/);
c.kbBrandUpdatesEnsure();assert.equal(entry.updateReviews.length,1);assert.match(node('dw').innerHTML,/kb-history-header-actions/);assert.doesNotMatch(node('dw').innerHTML,/kb-history-change/);
c.kbOpenRestoreVersion('k1',1);assert.equal(run('S.kbRestoreDraft'),undefined);
// Isolate the one-update lifecycle from the seeded history used for the interactive demo.
entry.version=1;entry.tx=original;entry.knowledgeVersions=[{version:1,text:original,at:entry.at,by:entry.by,kind:'initial'}];entry.updateReviews=[];entry.pendingUpdate={...latest,baseVersion:1,version:2};
run('S.kb=null');
const other=run("KB.find(e=>e.id==='k2')"),otherSnapshot=JSON.stringify(other);
assert.ok(entry.pendingUpdate);assert.equal(entry.version,1);assert.equal(entry.tx,original);assert.equal(entry.gov,'ok');
assert.equal(entry.pendingUpdate.evidence.length,1);assert.equal(entry.pendingUpdate.evidence[0].quote,original);
assert.match(c.kbUpdateExplanationHTML(entry.pendingUpdate),/kb-update-evidence/);assert.match(c.kbUpdateEvidenceHTML(entry.pendingUpdate),/<blockquote>/);
assert.match(c.kBrand(),/kb-update-badge/);
// Opening the original brand entry is the review entry point.
c.openKB('k1');assert.match(node('dw').innerHTML,/kb-merged-document/);assert.equal(run('S.kbtab'),2);assert.match(node('dw').innerHTML,/kb-update-source/);
c.openKB('k1',0);assert.match(node('dw').innerHTML,/kb-content-editor/);assert.match(node('dw').innerHTML,/openKB\('k1',2\)/);
assert.ok(c.kbBrandTabsHTML('k1').indexOf("openKB('k1',2)")<c.kbBrandTabsHTML('k1').indexOf("openKB('k1',0)"));
c.openKB('k1',1);assert.match(node('dw').innerHTML,/ctxr/);assert.equal(entry.tx,original);
c.openKB('k1',2);assert.match(node('dw').innerHTML,/kbApproveBrandUpdate/);assert.match(node('dw').innerHTML,/kb-merged-document/);assert.doesNotMatch(node('dw').innerHTML,/kb-document-comparison|kb-diff-section|kb-diff-row/);
assert.equal((c.kbBrandTabsHTML('k3').match(/role="tab"/g)||[]).length,3);assert.equal((c.kbBrandTabsHTML('k1').match(/role="tab"/g)||[]).length,4);
const ops=c.kbTextDiff(original,entry.pendingUpdate.nextText);
assert.equal(ops.filter(o=>o.kind!=='added').map(o=>o.text).join(''),original);
assert.equal(ops.filter(o=>o.kind!=='removed').map(o=>o.text).join(''),entry.pendingUpdate.nextText);
assert.match(c.kbTextDiffHTML(ops,'before'),/<del>/);assert.match(c.kbTextDiffHTML(ops,'after'),/<ins>/);
const diffHTML=c.kbReviewBodyHTML(entry.pendingUpdate,ops,'diff');assert.match(diffHTML,/<ins>/);assert.match(diffHTML,/<del>/);
assert.equal(c.kbReviewBodyHTML(entry.pendingUpdate,ops,'original'),run('esc')(original));
assert.equal(c.kbReviewBodyHTML(entry.pendingUpdate,ops,'preview'),run('esc')(entry.pendingUpdate.nextText));
for(const mode of ['preview','parallel','diff']){c.kbSwitchBrandUpdateView('k1',mode);assert.match(node('dw').innerHTML,new RegExp('id="kb-review-tab-'+mode+'" role="tab" aria-selected="true"'));assert.doesNotMatch(node('dw').innerHTML,/id="kb-review-tab-original"/);assert.equal(entry.tx,original);assert.equal(entry.version,1);if(mode==='parallel')assert.match(node('dw').innerHTML,/kb-review-parallel/);else assert.doesNotMatch(node('dw').innerHTML,/kb-review-parallel/);}
const parallel=c.kbReviewBodyHTML(entry.pendingUpdate,ops,'parallel');assert.match(parallel,/<ins>/);assert.match(parallel,/<del>/);assert.ok(parallel.indexOf(run('esc')(original))<parallel.indexOf('<del>'));
assert.equal(JSON.stringify(other),otherSnapshot);
assert.doesNotMatch(c.kbTextDiffHTML(c.kbTextDiff('','<script>😀'),'after'),/<script>/);
assert.equal(c.kbTextDiff('same','same').length,1);
assert.match(node('dw').innerHTML,/kbRejectBrandUpdate/);assert.doesNotMatch(node('dw').innerHTML,/kbDeferBrandUpdate/);
assert.equal(JSON.stringify(other),otherSnapshot);
// Brand-file fixtures are unaffected by this brand-entry feature.
c.kbEnsure();assert.equal(run("KB_DOCS.get('bf10').pendingUpdate"),undefined);
c.kbApproveBrandUpdate('k1',1);assert.equal(entry.version,2);assert.equal(entry.pendingUpdate,null);assert.equal(entry.updateReviews[0].beforeText,original);assert.equal(entry.gov,'ok');assert.equal(entry.reads,usage);assert.notEqual(entry.tx,original);
assert.equal(JSON.stringify(other),otherSnapshot);
c.kbApproveBrandUpdate('k1',1);assert.equal(entry.version,2);assert.equal(entry.updateReviews.length,1);
c.kbBrandUpdatesEnsure();assert.equal(entry.pendingUpdate,null);
c.openKB('k1',0);assert.match(node('dw').innerHTML,/openKB\('k1',3\)/);
// Scope changes and stale edits block approval without discarding the candidate.
entry.pendingUpdate={...entry.updateReviews[0],baseVersion:2,version:3,baseText:entry.tx};
run("S.kbrand='telosin'");c.kbApproveBrandUpdate('k1',2);assert.equal(entry.version,2);
run("S.kbrand='a8oparis'");const approved=entry.tx;entry.tx+=' edit';c.kbApproveBrandUpdate('k1',2);assert.equal(entry.version,2);assert.ok(entry.pendingUpdate);entry.tx=approved;
const hasPage=c.permissionHasPage;c.permissionHasPage=()=>false;c.kbApproveBrandUpdate('k1',2);assert.equal(entry.version,2);c.permissionHasPage=hasPage;
c.kbRejectBrandUpdate('k2');assert.equal(other.version,1);assert.equal(other.tx,JSON.parse(otherSnapshot).tx);assert.equal(other.pendingUpdate,null);assert.equal(other.updateReviews[0].decision,'rejected');assert.match(node('dw').innerHTML,/kb-review-receipt/);assert.equal(entry.version,2);
c.kbRejectBrandUpdate('k2');assert.equal(other.updateReviews.length,1);c.kbBrandUpdatesEnsure();assert.equal(other.pendingUpdate,null);
// Version history is independent of suggestions; restoration creates a new version.
assert.equal(entry.knowledgeVersions.length,2);assert.equal(entry.knowledgeVersions[0].text,original);
c.openKB('k1',3);assert.match(node('dw').innerHTML,/kb-history-list/);
c.kbOpenRestoreVersion('k1',1);assert.equal(run('S.kbRestoreDraft'),undefined); // unresolved suggestion blocks restore
entry.pendingUpdate=null;c.kbOpenRestoreVersion('k1',1);assert.equal(entry.version,2);assert.match(node('mod').innerHTML,/kbConfirmRestoreVersion/);
c.closeMod();c.kbConfirmRestoreVersion();assert.equal(entry.version,2);
c.kbOpenRestoreVersion('k1',1);c.kbConfirmRestoreVersion();assert.equal(entry.version,3);assert.equal(entry.tx,original);assert.equal(entry.knowledgeVersions.length,3);assert.equal(entry.updateReviews.at(-1).restoredFrom,1);assert.equal(entry.updateReviews[0].nextText,approved);
c.kbConfirmRestoreVersion();assert.equal(entry.version,3);
// Selecting an older record must remain selected when switching preview mode.
c.kbOpenBrandUpdate('k1','diff',0);c.kbSwitchBrandUpdateView('k1','preview');assert.equal(run('S.kbReviewIndex'),0);
assert.match(c.kbReviewBodyHTML(entry.updateReviews[0],c.kbTextDiff(original,approved),'preview'),/./);
c.kbOpenRestoreVersion('k1',2);entry.tx+=' concurrent edit';c.kbConfirmRestoreVersion();assert.equal(entry.version,3);entry.tx=original;c.closeMod();
c.kbOpenRestoreVersion('k1',2);c.kbConfirmRestoreVersion();assert.equal(entry.version,4);assert.equal(entry.tx,approved);assert.equal(entry.knowledgeVersions.length,4);
assert.equal(other.version,1);assert.equal(other.knowledgeVersions.length,1);assert.equal(c.kbHistoryRestoreAction(other,2),'');
// Manual saves also retain their prior version.
c.kbRecordManualKnowledgeUpdate(other,other.tx+' changed');assert.equal(other.version,2);assert.equal(other.knowledgeVersions.length,2);assert.equal(other.updateReviews.at(-1).kind,'manual');
console.log('PASS independent review and history tabs, approval/rejection isolation, merged diff, archived versions, restore confirmation/new versions, stale/duplicate/scope guards');
