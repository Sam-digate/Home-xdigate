const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../js/06-thread-artifacts-drawer.js'),'utf8');
const outline={id:'outline',mode:'pptoutline',st:'done',by:'ppt',deckTitle:'方案',ex:'说明',v:1,pages:[]};
const file={id:'file',mode:'pptfile',st:'review',by:'ppt',ttl:'生成文件',createdAt:'刚刚',pageCount:12,credits:99,v:1};
const task={arts:[outline]};
const c=vm.createContext({S:{pc:false},esc:s=>String(s),findArt:()=>[task,outline],artifactRunLink:()=>'',subCount:()=>0,pptCoverIsOpen:()=>false});
for(const name of ['pptOutlineFile','pptFileOutline','pptCompactFile','pptFilePeek','pptOutlinePeek','dPptOutline','pptOutlineFooter']){
 const start=source.indexOf('function '+name+'('),next=source.indexOf('\nfunction ',start+1);
 vm.runInContext(source.slice(start,next<0?undefined:next),c);
}
assert.match(c.pptOutlinePeek(outline),/产出 · PPT 大纲/);
assert.doesNotMatch(c.dPptOutline(outline),/PPT 文件产出/);
task.arts.push(file);
const card=c.pptOutlinePeek(outline);assert.match(card,/产出 · PPT 文件/);assert.match(card,/查看大纲/);assert.match(card,/openDw\('outline'\)/);assert.match(card,/approvePptFile\('file'\)/);
assert.doesNotMatch(card,/在 Gamma 中打开|openPptOnline/);
c.dlActionHTML=a=>a===file?'<button>创建在线文档</button>':'';
assert.doesNotMatch(c.pptOutlinePeek(outline),/创建在线文档/);
file.st='done';assert.match(c.pptOutlinePeek(outline),/创建在线文档/);file.st='review';
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
