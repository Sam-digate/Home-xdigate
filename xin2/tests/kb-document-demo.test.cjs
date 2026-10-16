const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),nodes=new Map(),timers=new Map();let timer=0;
function node(id){if(!nodes.has(id)){const classes=new Set();nodes.set(id,{innerHTML:'',value:'',textContent:'',classList:{add(...v){v.forEach(x=>classes.add(x))},remove(...v){v.forEach(x=>classes.delete(x))},contains(x){return classes.has(x)}},focus(){}});}return nodes.get(id);}
node('mod');node('dw');node('scrim');node('kb-query').value='品牌定位';node('kb-purpose').value='reference';node('kb-agent').value='gen';
const context=vm.createContext({console,location:{hash:''},window:{addEventListener(){}},URL:{createObjectURL:()=> 'blob:local-only'},
 setTimeout(fn){timers.set(++timer,fn);return timer},clearTimeout(id){timers.delete(id)},
 document:{activeElement:null,getElementById:id=>nodes.get(id)||null,addEventListener(){},querySelectorAll:()=>[],createElement:()=>({click(){},remove(){}}),body:{appendChild(){}}}});
const run=code=>vm.runInContext(code,context),load=name=>run(fs.readFileSync(path.join(root,'js',name),'utf8'));
load('01-helpers-data.js');load('05-knowledge-work.js');load('10-permissions.js');load('14-kb-document-demo.js');
run(`currentUser=()=>S.currentUser;toast=()=>{};render=()=>{};closeMod=()=>$('mod').classList.remove('on');closeDw=()=>{$('dw').classList.remove('on');$('scrim').classList.remove('on')};kbEnsure();`);
function finish(){while(timers.size){const batch=[...timers.values()];timers.clear();batch.forEach(fn=>fn());}}
function check(name,fn){fn();console.log('PASS',name);}
check('existing files require migration and brand-file delete code is removed',()=>{
 assert.equal(run(`KB_DOCS.get('bf1').state`),'legacy');
 const source=fs.readFileSync(path.join(root,'js/05-knowledge-work.js'),'utf8');
 assert.doesNotMatch(source,/manageBrandFile|removeBrandFile|legacyBrandFilesHTML|legacyPreviewBrandFile/);
 const html=run('kbFilesHTML()');assert.match(html,/8 个文件待迁移至 SharePoint/);assert.match(html,/迁移文件/);assert.doesNotMatch(html,/品牌文件 · SharePoint|Demo：迁移|手动刷新|检查链接|删除文件|Agent 检索演示|kb-retrieval|kb-query-controls/);
});
check('one system output example includes source task, approval and illustrative content',()=>{
 assert.equal(run('BRAND_FILES.filter(f=>f.systemOutputDemo).length'),1);
 assert.equal(run(`KB_DOCS.get('bf-output-demo').approval`),'approved');
 assert.equal(run(`KB_DOCS.get('bf-output-demo').state`),'ready');
 run(`kbShowFile('bf-output-demo')`);const html=node('dw').innerHTML;
 assert.match(html,/来源任务/);assert.match(html,/新品上市 · 品牌生态位复核/);
 assert.match(html,/审批状态（演示）/);assert.match(html,/已批准/);assert.match(html,/预置示例/);
 assert.match(html,/class="row kb-origin-task"/);assert.match(html,/kbOpenSourceTask/);
 assert.doesNotMatch(html,/知识库引用|解析内容|kb-file-tab-2/);
 assert.match(run('kbFilesHTML(true)'),/系统产出 · 文档/);run('closeDw()');
});
check('system output has exactly three labelled illustrative audit records without duplication',()=>{
 assert.equal(run(`KB_DOCS.get('bf-output-demo').history.length`),3);
 run('kbEnsure();kbEnsure()');assert.equal(run(`KB_DOCS.get('bf-output-demo').history.length`),3);
 run(`kbShowFile('bf-output-demo',1)`);const html=node('dw').innerHTML;
 for(const text of ['创建在线文档','批准产出','创建产出','Sophie','预置演示','M365 账号：未关联','成功（演示）'])assert.ok(html.includes(text));
 assert.equal((html.match(/class="ds-run-item"/g)||[]).length,3);assert.doesNotMatch(html,/已编辑|已保存/);run('closeDw()');
});
check('migration preserves originals and progresses automatically to reference and index',()=>{
 run(`kbIngest(KB_DOCS.get('bf1'),'开始演示')`);
 assert.equal(run(`KB_DOCS.get('bf1').state`),'saving');assert.equal(run('BRAND_FILES.length'),9);
 finish();assert.equal(run(`KB_DOCS.get('bf1').state`),'ready');assert.equal(run(`KB_DOCS.get('bf1').indexVersion`),1);
 assert.match(run(`KB_DOCS.get('bf1').fileId`),/sp-demo/);assert.match(run(`KB_DOCS.get('bf1').indexedText`),/品牌定位/);
});
check('Agent retrieves indexed content with versioned citations, never pending outputs',()=>{
 run(`kbIngest(KB_DOCS.get('bf6'),'迁移');kbIngest(KB_DOCS.get('bf7'),'迁移')`);finish();run('kbRetrieve()');
 assert.equal(run('KB_DEMO.results.length'),2);assert.equal(run(`KB_DEMO.results.some(r=>r.id==='bf6')`),false);
 assert.match(run('kbResultsHTML()'),/v1/);assert.match(run('kbResultsHTML()'),/品牌定位复核/);
 node('kb-purpose').value='formal';run('kbRetrieve()');assert.equal(run('KB_DEMO.results.length'),1);assert.equal(run('KB_DEMO.results[0].id'),'bf7');
});
check('project, client, disabled-account and Agent grants are checked at retrieval',()=>{
 run(`S.currentUser='so'`);assert.equal(run('kbVisibleDocs().length'),0);
 run(`S.currentUser='asher';KB_DOCS.get('bf1').client='other'`);assert.equal(run(`kbEligible(KB_DOCS.get('bf1'),'reference','gen')`),false);
 run(`KB_DOCS.get('bf1').client='u2c';PERMISSION_MEMBERS.find(m=>m.id==='asher').status='disabled'`);assert.equal(run('kbVisibleDocs().length'),0);
 run(`PERMISSION_MEMBERS.find(m=>m.id==='asher').status='active';S.currentUser='du'`);assert.equal(run(`kbEligible(KB_DOCS.get('bf1'),'reference','gen')`),false);
 run(`S.currentUser='br'`);
});
check('changes invalidate old citations immediately and automatically rebuild the new version',()=>{
 run(`kbExternalEvent('bf7','update')`);assert.match(run('kbResultsHTML()'),/引用已失效/);assert.doesNotMatch(run('kbResultsHTML()'),/品牌定位复核/);
 assert.equal(run(`KB_DOCS.get('bf7').indexedText`),'');finish();assert.equal(run(`KB_DOCS.get('bf7').indexVersion`),2);
 assert.match(run('kbResultsHTML()'),/引用已失效/);run('kbRetrieve()');assert.match(run('kbResultsHTML()'),/v2/);
});
check('external removal and permission revocation exclude content without deleting KB records',()=>{
 const count=run('BRAND_FILES.length');run(`kbExternalEvent('bf7','removed')`);
 assert.equal(run('BRAND_FILES.length'),count);assert.equal(run(`KB_DOCS.get('bf7').health`),'removed');assert.match(run('kbResultsHTML()'),/引用已失效/);
 run(`kbExternalEvent('bf1','denied')`);assert.equal(run(`kbEligible(KB_DOCS.get('bf1'),'reference','gen')`),false);
 run(`kbExternalEvent('bf1','restore')`);finish();assert.equal(run(`KB_DOCS.get('bf1').state`),'ready');
});
check('late indexing callbacks cannot resurrect a revoked or removed file',()=>{
 run(`kbExternalEvent('bf1','update');kbExternalEvent('bf1','denied')`);finish();
 assert.equal(run(`KB_DOCS.get('bf1').state`),'denied');assert.equal(run(`KB_DOCS.get('bf1').indexVersion`),0);
 run(`kbExternalEvent('bf1','restore')`);finish();
});
check('upload enters the same ingestion pipeline but does not invent extracted text',()=>{
 context.input={files:[{name:'test.pptx',size:1024}],value:'picked'};run('uploadBrandFiles(input)');finish();
 assert.equal(run('BRAND_FILES[0].type'),'PPT');assert.equal(run('KB_DOCS.get(BRAND_FILES[0].id).state'),'unparsed');
 assert.equal(run('KB_DOCS.get(BRAND_FILES[0].id).indexedText'),'');assert.equal(run('BRAND_FILES[0].url'),'blob:local-only');
});
check('details use the right drawer, escape filenames and never reopen after closing',()=>{
 run(`BRAND_FILES[0].name='<img src=x onerror=alert(1)>.pptx';kbShowFile(BRAND_FILES[0].id)`);
 assert.match(node('dw').innerHTML,/&lt;img/);assert.match(node('dw').innerHTML,/文件 ID/);assert.doesNotMatch(node('dw').innerHTML,/解析内容|知识库引用/);
 assert.match(node('dw').innerHTML,/kb-file-drawer/);assert.match(node('dw').innerHTML,/aria-modal="true"/);
 assert.equal(node('dw').classList.contains('on'),true);assert.equal(node('scrim').classList.contains('on'),true);
 assert.equal(node('mod').classList.contains('on'),false);
 run('closeDw();kbPaint()');assert.equal(node('dw').classList.contains('on'),false);
});
check('brand selection isolates files and old citations',()=>{
 run(`S.kbrand='telosin'`);assert.equal(run('kbVisibleDocs().length'),0);assert.doesNotMatch(run('kbResultsHTML()'),/品牌定位复核/);
 run(`S.kbrand='a8oparis'`);
});
check('file drawer separates audit records from file information, without simulation controls',()=>{
 run(`kbShowFile('bf1')`);const info=node('dw').innerHTML;
 assert.match(info,/class="ty">品牌文件/);assert.match(info,/class="ctxr"/);
 assert.match(info,/文件信息/);assert.match(info,/操作日志/);assert.doesNotMatch(info,/运行记录|自动处理记录|模拟 SharePoint 变更|kb-file-event/);
 run(`kbShowFile('bf1',1)`);assert.match(node('dw').innerHTML,/未接入 M365 审计/);assert.match(node('dw').innerHTML,/X-Digate 系统事件（模拟）/);
 assert.doesNotMatch(node('dw').innerHTML,/class="ctxr"/);
});
check('automatic drawer refresh preserves expansion, scroll and control focus',()=>{
 const detail=node('kb-file-detail'),body={scrollTop:230};detail.dataset={file:'bf1'};detail.closest=()=>body;
 const control=node('kb-file-close');control.id='kb-file-close';let focusCount=0;control.focus=()=>focusCount++;
 context.document.activeElement=control;node('dw').contains=element=>element===control;
 run(`$('dw').classList.add('on','expanded');kbPaint()`);
 assert.equal(node('dw').classList.contains('expanded'),true);assert.equal(body.scrollTop,230);assert.equal(focusCount,1);
 assert.doesNotMatch(node('dw').innerHTML,/运行记录|模拟 SharePoint 变更/);
 nodes.delete('kb-file-detail');context.document.activeElement=null;run('closeDw()');
});
check('brand files exclude image category, fixtures and uploads',()=>{
 const count=run('BRAND_FILES.length');context.input={files:[{name:'photo.png',size:2048},{name:'photo.jpg',size:2048}],value:'picked'};
 run('uploadBrandFiles(input)');finish();assert.equal(run('BRAND_FILES.length'),count);
 assert.equal(run("BRAND_FILES.some(f=>f.type==='图片')"),false);
 assert.doesNotMatch(run('kbFilesHTML()'),/图片|\.png|\.jpg|IMG/);
});
check('accounts lacking the current brand grant cannot upload',()=>{
 run(`S.currentUser='so'`);const count=run('BRAND_FILES.length');context.input={files:[{name:'no.pdf',size:1024}],value:'picked'};run('uploadBrandFiles(input)');
 assert.equal(run('BRAND_FILES.length'),count);assert.equal(context.input.value,'');run(`S.currentUser='br'`);
});
check('changing retrieval filters clears previous answer and uses no network APIs',()=>{
 node('kb-results');run(`kbChangeFilter('purpose','reference')`);assert.equal(run('KB_DEMO.results'),null);assert.equal(node('kb-results').innerHTML,'');
 const source=fs.readFileSync(path.join(root,'js/14-kb-document-demo.js'),'utf8');assert.doesNotMatch(source,/fetch\(|XMLHttpRequest|localStorage|FileReader/);
});
check('file cards use online external-link icons and open files instead of downloading',()=>{
 run(`kbIngest(KB_DOCS.get('bf2'),'迁移')`);finish();
 const html=run(`kbFileActionHTML(BRAND_FILES.find(f=>f.id==='bf2'),KB_DOCS.get('bf2'),true)`);assert.match(html,/data-lucide="arrow-up-right"/);assert.doesNotMatch(html,/data-lucide="download"|onclick="downloadBrandFile/);
 const opened=[];context.window.open=(...args)=>opened.push(args);
 run(`kbOpenFile('bf2')`);assert.equal(opened.length,0);
 run(`BRAND_FILES.find(f=>f.id==='bf2').sharepointUrl='https://example.com/file';kbOpenFile('bf2')`);
 assert.equal(opened.length,1);assert.deepEqual(opened[0],['https://example.com/file','_blank','noopener,noreferrer']);
 run(`KB_DOCS.get('bf2').health='denied';kbOpenFile('bf2')`);assert.equal(opened.length,1);
 run(`KB_DOCS.get('bf2').health='available';BRAND_FILES.find(f=>f.id==='bf2').sharepointUrl='javascript:alert(1)';kbOpenFile('bf2')`);assert.equal(opened.length,1);
});
check('drawer edits online using the configured example instead of downloading',()=>{
 run(`kbIngest(KB_DOCS.get('bf3'),'迁移')`);finish();
 run(`const DL_OFFICE_EXAMPLE='https://example.com/sharepoint-demo?action=edit'`);
 const opened=[];context.window.open=(...args)=>opened.push(args);
 run(`kbShowFile('bf3')`);const html=node('dw').innerHTML;
 assert.match(html,/编辑在线文档/);assert.match(html,/kbOpenFile\('bf3',true\)/);assert.doesNotMatch(html,/downloadBrandFile|下载文件/);
 run(`kbOpenFile('bf3',true)`);assert.equal(opened[0][0],'https://example.com/sharepoint-demo?action=edit');
 run(`KB_DOCS.get('bf3').health='denied';kbOpenFile('bf3',true)`);assert.equal(opened.length,1);
});
check('before migration both card and drawer download, switching only once migration completes',()=>{
 run(`KB_DOCS.get('bf10').storage='legacy';KB_DOCS.get('bf10').state='legacy';kbShowFile('bf10')`);
 assert.match(node('dw').innerHTML,/下载文件/);assert.doesNotMatch(node('dw').innerHTML,/编辑在线文档/);
 assert.match(run(`kbFileActionHTML(BRAND_FILES.find(f=>f.id==='bf10'),KB_DOCS.get('bf10'),true)`),/data-lucide="download"/);
 run(`kbIngest(KB_DOCS.get('bf10'),'迁移')`);
 let batch=[...timers.values()];timers.clear();batch.forEach(fn=>fn());
 assert.match(run(`kbFileActionHTML(BRAND_FILES.find(f=>f.id==='bf10'),KB_DOCS.get('bf10'))`),/下载文件/);
 finish();run(`kbShowFile('bf10')`);assert.match(node('dw').innerHTML,/编辑在线文档/);
});
check('migration banner disappears only after all original files finish migration',()=>{
 run(`BRAND_FILES.filter(f=>KB_DOCS.get(f.id).storage==='legacy').forEach(f=>kbIngest(KB_DOCS.get(f.id),'迁移'))`);
 assert.match(run('kbFilesHTML()'),/class="kb-storage"/);
 const batch=[...timers.values()];timers.clear();batch.forEach(fn=>fn());
 assert.match(run('kbFilesHTML()'),/class="kb-storage"/);
 finish();assert.doesNotMatch(run('kbFilesHTML()'),/class="kb-storage"|迁移已完成|品牌文件 · SharePoint/);
 assert.match(run('kbFilesHTML()'),/class="bf-toolbar"/);
});
check('card status is compact at the top and version is grouped with file metadata',()=>{
 run(`S.brandFileMode='grid'`);const html=run('kbFilesHTML()');
 assert.match(html,/class="bf-top"><span class="bf-kind [^"]+">[^<]+<\/span><span class="kb-file-state/);
 assert.match(html,/class="bf-desc"><span>PDF · 2.4 MB · v\d+<\/span>/);
 assert.doesNotMatch(html,/已索引 · v/);
 assert.match(run(`kbCardStatusHTML({state:'ready'})`),/kb-file-state ready/);
 assert.match(run(`kbCardStatusHTML({state:'denied'})`),/kb-file-state error/);
 assert.doesNotMatch(run(`kbCardStatusHTML({state:'legacy'})`),/kb-state-dot/);
 assert.doesNotMatch(html,/data-lucide="info"/);
 assert.match(html,/class="bf-title" onclick="kbShowFile/);
 run(`S.brandFileMode='list'`);assert.match(run('kbFilesHTML()'),/class="bf-desc"><span>[^<]+<\/span><span class="kb-file-state/);
 run(`S.brandFileMode='grid'`);
});
check('migration shows incremental progress, completed count and closes only after 100 percent',()=>{
 run(`['bf1','bf2'].forEach(id=>{const doc=KB_DOCS.get(id);doc.storage='legacy';doc.state='legacy';doc.health='unchecked'})`);
 context.document.querySelectorAll=()=>[{value:'bf1'},{value:'bf2'}];
 ['kb-migration-bar','kb-migration-percent','kb-migration-count','kb-migration-status'].forEach(node);
 run('kbStartMigration()');assert.match(node('mod').innerHTML,/<progress/);assert.equal(node('kb-migration-bar').value,0);
 assert.match(run('kbFilesHTML()'),/正在迁移 · 0%/);assert.match(run('kbFilesHTML()'),/class="kb-inline-progress"/);
 const timerCount=timers.size;run('kbStartMigration()');assert.equal(timers.size,timerCount);
 let batch=[...timers.values()];timers.clear();batch.forEach(fn=>fn());
 assert.equal(node('kb-migration-bar').value,60);assert.match(node('kb-migration-count').textContent,/0 \/ 2/);
 batch=[...timers.values()];timers.clear();batch.forEach(fn=>fn());
 assert.equal(node('kb-migration-bar').value,100);assert.match(node('kb-migration-count').textContent,/2 \/ 2/);
 assert.equal(node('mod').classList.contains('on'),true);finish();assert.equal(node('mod').classList.contains('on'),false);
 ['kb-migration-bar','kb-migration-percent','kb-migration-count','kb-migration-status'].forEach(id=>nodes.delete(id));
});
check('background migration does not close a different modal when it finishes',()=>{
 run(`KB_DOCS.get('bf1').storage='legacy';KB_DOCS.get('bf1').state='legacy'`);
 context.document.querySelectorAll=()=>[{value:'bf1'}];run('kbStartMigration();closeMod()');
 node('mod').innerHTML='<div>Another dialog</div>';node('mod').classList.add('on');finish();
 assert.equal(node('mod').classList.contains('on'),true);assert.equal(run('KB_MIGRATION'),null);
});
check('system online documents live under outputs and brand files contain only uploads',()=>{
 run(`S.brandFileType='全部';S.brandFileSearch=''`);
 const brand=run('kbFilesHTML(false)'),online=run('kbFilesHTML(true)');
 assert.match(brand,/品牌生态位分析源数据.pdf/);assert.doesNotMatch(brand,/新品上市品牌生态位复核.docx|文件来源|系统生成/);
 assert.match(online,/新品上市品牌生态位复核.docx/);assert.doesNotMatch(online,/品牌生态位分析源数据.pdf|brand-file-upload|kbMigration\(/);
 assert.equal(run(`KGRP.out.tabs.join(',')`),'已保存产出,在线文档,模板');
 run(`S.brandFileType='PDF'`);assert.match(run('kbFilesHTML(true)'),/暂无符合条件的文件/);
 run(`S.brandFileType='文档';S.brandFileSearch='新品'`);assert.match(run('kbFilesHTML(true)'),/新品上市品牌生态位复核.docx/);
 run(`S.brandFileType='全部';S.brandFileSearch=''`);
});
