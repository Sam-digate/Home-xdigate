const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../js/06-thread-artifacts-drawer.js'),'utf8');
const outline={id:'outline',mode:'pptoutline',st:'done',by:'ppt',deckTitle:'方案',ex:'说明',v:1,pages:[]};
const file={id:'file',mode:'pptfile',st:'review',by:'ppt',ttl:'生成文件',createdAt:'刚刚',pageCount:12,credits:99,v:1};
const task={arts:[outline]};
const c=vm.createContext({S:{pc:false},esc:s=>String(s),findArt:()=>[task,outline],artifactRunLink:()=>'',subCount:()=>0,pptCoverIsOpen:()=>false});
for(const name of ['pptOutlineFile','pptOutlineLocked','updatePptOutlineField','updatePptPageField','movePptPage','deletePptPage','addPptPage','pptPageIsOpen','pptFileOutline','pptCompactFile','pptFilePeek','pptOutlinePeek','dPptOutline','pptOutlineFooter','pptFileFooter','startDrawerReturn','confirmDrawerReturn']){
 const start=source.indexOf('function '+name+'('),next=source.indexOf('\nfunction ',start+1);
 vm.runInContext(source.slice(start,next<0?undefined:next),c);
}
assert.match(c.pptOutlinePeek(outline),/产出 · PPT 大纲/);
assert.doesNotMatch(c.dPptOutline(outline),/PPT 文件产出/);
task.arts.push(file);
const card=c.pptOutlinePeek(outline);assert.match(card,/产出 · PPT 文件/);assert.match(card,/查看产出/);assert.doesNotMatch(card,/查看大纲/);assert.match(card,/openDw\('outline'\)/);assert.match(card,/approvePptFile\('file'\)/);
assert.doesNotMatch(card,/在 Gamma 中打开|openPptOnline/);
assert.match(card,/在线编辑文档/);
assert.ok(card.indexOf('在线编辑文档')<card.indexOf('下载 PPTX'));
assert.ok(card.indexOf('在线编辑文档')<card.indexOf('openReportComments'));
c.dlActionHTML=a=>a===file?'<button>创建在线文档</button>':'';
assert.doesNotMatch(c.pptOutlinePeek(outline),/<button>创建在线文档<\/button>/);
file.st='done';assert.match(c.pptOutlinePeek(outline),/<button>创建在线文档<\/button>/);file.st='review';
let drawer=c.dPptOutline(outline);assert.ok(drawer.indexOf('PPT 文件产出')<drawer.indexOf('ppt-outline-toolbar'));
assert.doesNotMatch(drawer,/onclick="approvePptFile|startDrawerReturn/);
assert.doesNotMatch(drawer,/downloadPptFile|下载 PPTX/);

assert.doesNotMatch(drawer,/openPptOnline|在 Gamma 中打开/);
let footer=c.pptOutlineFooter(outline);assert.match(footer,/approvePptFile\('file'\)/);assert.doesNotMatch(footer,/在 Gamma 中打开|退回|已批准/);assert.match(footer,/downloadPptFile/);assert.ok(footer.indexOf('approvePptFile')<footer.indexOf('downloadPptFile'));
assert.match(drawer,/PPT 已生成完成 · 刚刚 · 12页/);assert.doesNotMatch(drawer,/消耗积分|pk-h|同步到活动|openReportComments/);
file.st='done';footer=c.pptOutlineFooter(outline);assert.doesNotMatch(footer,/approvePptFile|已批准|在 Gamma 中打开/);assert.doesNotMatch(c.dPptOutline(outline),/在 Gamma 中打开|openPptOnline/);
assert.ok(source.includes("a.mode==='pptfile'&&t.arts.some(x=>!x.deferred&&x.mode==='pptoutline')"));
assert.equal(c.pptFileOutline(file),outline);
assert.ok(source.includes("body=[outline?dPptOutline(outline):dPptFile(a),dVer(a)][S.dtab]"));
c.subCount=a=>a===file?3:0;
assert.match(c.pptOutlineFooter(outline,file),/<span class="n">3<\/span>/);
assert.ok(source.includes('pptOutlineFooter(pptFileOutline(a),a)'));
const dlSource=fs.readFileSync(path.join(__dirname,'../js/11-document-layer.js'),'utf8');
const supported=dlSource.slice(dlSource.indexOf('function dlSupported('),dlSource.indexOf('function dlContext('));
vm.runInContext(supported,c);
file.st='review';assert.equal(c.dlSupported(file),false);assert.equal(c.dlSupported(outline),false);
file.st='done';assert.equal(c.dlSupported(file),true);
assert.ok(dlSource.includes("if(a?.mode==='pptoutline')a=pptOutlineFile(a)"));
console.log('PASS merged PPT card, outline-only stage, top file panel and file-specific approval actions');

outline.pptCoverOpen=true;outline.pages=[{title:'Original',chapter:'Chapter',points:'Content',visual:'Image'}];outline.pptOpenPages={0:true};
const lockedDrawer=c.dPptOutline(outline);
assert.match(lockedDrawer,/readonly/);assert.doesNotMatch(lockedDrawer,/ppt-page-actions/);
c.updatePptOutlineField('outline','deckTitle','Changed');assert.notEqual(outline.deckTitle,'Changed');
c.updatePptPageField('outline',0,'title','Changed');assert.equal(outline.pages[0].title,'Original');
c.deletePptPage('outline',0);c.addPptPage('outline');assert.equal(outline.pages.length,1);
task.arts=[outline];outline.outlineConfirmed=false;
const editableDrawer=c.dPptOutline(outline);assert.doesNotMatch(editableDrawer,/readonly/);assert.match(editableDrawer,/ppt-page-actions/);
c.updatePptPageField('outline',0,'title','Editable');assert.equal(outline.pages[0].title,'Editable');
outline.outlineConfirmed=true;assert.equal(c.pptOutlineLocked(outline),true);
console.log('PASS generated outlines are read-only; pre-generation outlines remain editable');
for(const artifact of [outline,file]){
 task.arts=[outline,file];c.findArt=()=>[task,artifact];artifact.st='review';artifact.drawerReturning=true;
 assert.doesNotMatch(artifact===outline?c.pptOutlinePeek(outline):c.pptFilePeek(file),/退回|startDrawerReturn|drawer-return/);
 assert.doesNotMatch(artifact===outline?c.pptOutlineFooter(outline):c.pptFileFooter(file),/退回|startDrawerReturn|drawer-return/);
 artifact.drawerReturning=false;c.startDrawerReturn(artifact.id);assert.equal(artifact.drawerReturning,false);
 c.confirmDrawerReturn(artifact.id);assert.equal(artifact.st,'review');
}
task.arts=[outline];c.findArt=()=>[task,outline];outline.st='review';
assert.doesNotMatch(c.pptOutlinePeek(outline)+c.pptOutlineFooter(outline),/退回|startDrawerReturn|drawer-return/);
console.log('PASS PPT return actions are removed and shared return handlers reject PPT artifacts');
