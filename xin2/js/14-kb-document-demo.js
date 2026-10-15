/* E1–E4: session-only fixtures, never a real SharePoint upload, parser or permission service. */
const KB_DOCS=new Map();
const KB_DEMO_TEXT={
 bf1:'品牌定位：聚焦日常修护场景，围绕产品体验与用户需求组织内容。',
 bf2:'竞品评论：按肤感、使用频率、包装体验三个维度整理反馈。',
 bf3:'用户访谈：购买决策关注肤感、使用便利性与持续使用意愿。',
 bf5:'渠道资源：按渠道、内容形式和负责人整理资源分配。',
 bf6:'品牌定位候选：扩大至所有护肤人群。此为未批准候选，不能作为正式依据。',
 bf7:'品牌定位复核：内容聚焦日常修护场景；以真实使用体验为表达重点，避免未经核实的功效承诺。',
 bf9:'行业趋势：关注消费者日常使用场景与理性选购需求。',
 bf10:'品牌语言：使用清晰、具体的场景描述，避免绝对化功效表达。'
};
const KB_DEMO={query:'品牌定位',purpose:'reference',agent:'gen',results:null};
let KB_MIGRATION=null;
function kbEnsure(){
 BRAND_FILES.forEach(file=>{if(!KB_DOCS.has(file.id))KB_DOCS.set(file.id,{
  id:file.id,brand:'a8oparis',project:'a80',client:'u2c',storage:'legacy',version:1,indexVersion:0,
  fileId:'',link:'',health:'unchecked',state:'legacy',kind:['bf6','bf7'].includes(file.id)?'output':'source',
  approval:file.id==='bf6'?'pending':file.id==='bf7'?'approved':null,
  text:KB_DEMO_TEXT[file.id]||'',indexedText:'',generation:0,history:[],checkedAt:null
 });});
}
function kbScopeAllowed(doc,member=permissionCurrentMember()){
 if(!member||member.status==='disabled'||!permissionHasPage('know.src'))return false;
 if(member.role==='super')return true;
 if(permissionIsBrandAdminMember(member))return permissionCurrentTenantAdmin()?.accountId===doc.client;
 return (member.projects||[]).includes(doc.project)&&permissionAccountParts(member).prefix===doc.client;
}
function kbAgentAllowed(agent){
 const member=permissionCurrentMember();if(!member)return false;
 if(member.status==='disabled')return false;
 return member.role==='super'||(permissionIsBrandAdminMember(member)?permissionTenantAgents().some(a=>a.id===agent):(member.agents||[]).includes(agent));
}
function kbCanUpload(){return kbScopeAllowed({project:'a80',client:'u2c'});}
function kbVisibleDocs(){kbEnsure();return BRAND_FILES.filter(file=>{const doc=KB_DOCS.get(file.id);return doc.brand===knowledgeActiveBrand().id&&kbScopeAllowed(doc);});}
function kbStatus(doc){return ({legacy:'待迁移',saving:'模拟保存中',indexing:'自动建立索引',ready:'已索引',unparsed:'待解析',removed:'原文件不存在',denied:'无访问权限'})[doc.state]||'待核对';}
function kbIsOnline(doc){return doc.storage==='sharepoint'&&!doc.migrating&&!['saving','indexing'].includes(doc.state);}
function kbFileActionHTML(file,doc,compact=false){
 const online=kbIsOnline(doc),blocked=['denied','removed'].includes(doc.health);
 const action=online?`kbOpenFile('${file.id}',true)`:`downloadBrandFile('${file.id}')`;
 const label=online?'编辑在线文档':'下载文件';
 return `<button class="${compact?'bf-icon':'btn ghost'}" ${blocked?'disabled':''} onclick="${action}" title="${label}" aria-label="${label} ${esc(file.name)}">${compact?`<i data-lucide="${online?'arrow-up-right':'download'}"></i>`:label}</button>`;
}
function kbCardStatusHTML(doc){
 const label=({saving:'保存中',indexing:'索引中',removed:'链接失效',denied:'无权限'})[doc.state]||kbStatus(doc);
 const tone=doc.state==='ready'?'ready':['removed','denied'].includes(doc.state)?'error':['saving','indexing','unparsed'].includes(doc.state)?'pending':'idle';
 return `<span class="kb-file-state ${tone}" title="${esc(kbStatus(doc))}">${esc(label)}</span>`;
}
function kbLog(doc,message){doc.history.unshift({at:new Date().toLocaleTimeString('zh-CN',{hour12:false}),message});doc.history=doc.history.slice(0,8);}
function kbPaint(){
 kbUpdateMigrationProgress();
 const root=$('kb-files'),active=document.activeElement;
 const focus=root?.contains(active)?{id:active.id,start:active.selectionStart,end:active.selectionEnd}:null;
 if(root){const next=document.createElement('div');next.innerHTML=kbFilesHTML();root.replaceWith(next.firstElementChild);kpIcons();}
 if(focus?.id){const input=$(focus.id);input?.focus({preventScroll:true});if(typeof focus.start==='number')input?.setSelectionRange(focus.start,focus.end);}
 const detail=$('kb-file-detail');if(detail&&$('dw').classList.contains('on')){
  const focused=$('dw').contains(active)?active.id:null;
  const scroll=detail.closest('.dw-b')?.scrollTop||0;
  kbShowFile(detail.dataset.file);
  const next=$('kb-file-detail');if(next){next.closest('.dw-b').scrollTop=scroll;if(focused)$(focused)?.focus({preventScroll:true});}
 }
}
function kbFilesHTML(){
 const files=kbVisibleDocs(),type=S.brandFileType||'全部',mode=S.brandFileMode||'grid',query=String(S.brandFileSearch||'').trim().toLowerCase();
 const list=files.filter(file=>(type==='全部'||file.type===type)&&(!query||`${file.name} ${file.type}`.toLowerCase().includes(query)));
 const pending=files.filter(file=>KB_DOCS.get(file.id).storage==='legacy').length;
 const migrating=files.some(file=>KB_DOCS.get(file.id).migrating);
 const icons={PDF:['pdf','PDF'],文档:['doc','DOC'],表格:['sheet','XLS'],PPT:['doc','PPT']};
 return `<section id="kb-files">${pending||migrating?`<div class="kb-storage"><div><strong>品牌文件 · SharePoint</strong><p>原文件存于 SharePoint，知识库保留引用与索引。更新和链接状态由系统自动维护。</p><small>Demo：迁移、解析及链接状态均为模拟，仅本次会话有效，不会移动原文件。</small></div><button class="btn ghost sm" ${pending?'':'disabled'} onclick="kbMigration()">${pending?`迁移现有文件 (${pending})`:'正在迁移…'}</button></div>`:''}
 <div class="bf-toolbar"><label class="kc-search bf-search"><i data-lucide="search"></i><input id="brand-file-search" aria-label="搜索品牌文件" placeholder="搜索文件名或类型" value="${esc(S.brandFileSearch||'')}" oninput="if(!event.isComposing)searchBrandFiles(this)" oncompositionend="searchBrandFiles(this)"></label>
 <div class="seg" aria-label="品牌文件类型">${['全部','PDF','文档','表格','PPT'].map(t=>`<button class="${t===type?'on':''}" aria-pressed="${t===type}" onclick="S.brandFileType='${t}';render()">${t}</button>`).join('')}</div><span class="spacer"></span>
 <div class="seg bf-view"><button class="${mode==='list'?'on':''}" onclick="S.brandFileMode='list';render()">列表</button><button class="${mode==='grid'?'on':''}" onclick="S.brandFileMode='grid';render()">图标</button></div>
 <button class="btn ghost sm" ${kbCanUpload()?'': 'disabled'} onclick="$('brand-file-upload').click()"><i data-lucide="upload"></i>上传文件</button><input id="brand-file-upload" type="file" multiple hidden accept=".pdf,.doc,.docx,.md,.txt,.rtf,.xls,.xlsx,.csv,.ppt,.pptx" onchange="uploadBrandFiles(this)"></div>
 <div class="bf-count" role="status">${list.length} / ${files.length} · 自动维护已开启（演示）</div>
 <div class="${mode==='grid'?'bf-grid':'bf-list'}">${list.map(file=>{const doc=KB_DOCS.get(file.id),icon=icons[file.type],state=kbCardStatusHTML(doc);return `<article class="bf-card"><div class="bf-top"><span class="bf-kind ${icon[0]}">${icon[1]}</span>${mode==='grid'?state:''}<div class="bf-tools">${kbFileActionHTML(file,doc,true)}</div></div><div class="bf-info"><button class="bf-title" onclick="kbShowFile('${file.id}')">${esc(file.name)}</button><div class="bf-desc"><span>${file.type} · ${esc(file.size)}${doc.storage==='sharepoint'?` · v${doc.version}`:''}</span>${mode==='list'?state:''}</div></div><div class="bf-bottom"><time>${esc(file.date)}</time><span class="bf-uploader" style="background:${file.color}">${esc(file.by)}</span></div></article>`;}).join('')}</div>
 ${!list.length?'<div class="allclear">没有可访问的文件，可上传当前品牌的参考资料。</div>':''}</section>`;
}
function kbMigration(){
 const files=kbVisibleDocs().filter(file=>KB_DOCS.get(file.id).storage==='legacy');
 if(!files.length)return;
 kpDialog('迁移现有品牌文件',`<p class="kb-muted">核对文件清单后开始演示。原文件保持不变，不会实际上传或删除。</p><div class="kb-migration-list">${files.map(file=>`<label><input name="kb-migrate" type="checkbox" value="${file.id}" checked><span>${esc(file.name)}</span><small>${esc(file.size)}</small></label>`).join('')}</div><p id="kb-migration-error" class="kb-warning" role="alert"></p>`,`<button class="btn ghost sm" onclick="closeMod()">取消</button><button class="btn sm" onclick="kbStartMigration()">确认并迁移</button>`);
}
function kbStartMigration(){
 if(KB_MIGRATION&&!KB_MIGRATION.finished)return;
 const ids=Array.from(document.querySelectorAll('input[name="kb-migrate"]:checked')).map(input=>input.value).filter(id=>{const doc=KB_DOCS.get(id);return doc&&kbScopeAllowed(doc)&&doc.storage==='legacy';});
 if(!ids.length){$('kb-migration-error').textContent='请至少选择一个文件';return;}
 KB_MIGRATION={ids,finished:false};
 ids.forEach((id,index)=>kbIngest(KB_DOCS.get(id),'已核对文件清单，开始模拟迁移',index*220));
 kpDialog('迁移现有品牌文件',`<div class="kb-migration-progress"><div class="kb-progress-heading"><span id="kb-migration-status">正在迁移…</span><strong id="kb-migration-percent">0%</strong></div><progress id="kb-migration-bar" max="100" value="0" aria-label="品牌文件迁移进度"></progress><p id="kb-migration-count" role="status">已完成 0 / ${ids.length} 个文件</p></div>`,`<span class="kb-muted">演示进度，不会移动原文件。</span><button class="btn ghost sm" onclick="closeMod()">后台运行</button>`);
 kbPaint();
}
function kbMigrationProgress(job){
 const docs=job.ids.map(id=>KB_DOCS.get(id));
 const completed=docs.filter(doc=>doc&&!doc.migrating&&['ready','unparsed'].includes(doc.state)).length;
 const units=docs.reduce((sum,doc)=>sum+(doc&&!doc.migrating&&['ready','unparsed'].includes(doc.state)?1:doc?.state==='indexing'?0.6:0),0);
 return {completed,total:docs.length,percent:Math.round(units/docs.length*100)};
}
function kbUpdateMigrationProgress(){
 const job=KB_MIGRATION;if(!job)return;
 const {completed,total,percent}=kbMigrationProgress(job),bar=$('kb-migration-bar');
 if(bar&&$('mod').classList.contains('on')){bar.value=percent;$('kb-migration-percent').textContent=percent+'%';$('kb-migration-count').textContent=`已完成 ${completed} / ${total} 个文件`;$('kb-migration-status').textContent=completed===total?'迁移完成':'正在迁移…';}
 if(completed===total&&!job.finished){job.finished=true;setTimeout(()=>{if(KB_MIGRATION!==job)return;if($('kb-migration-bar')&&$('mod').classList.contains('on'))closeMod();KB_MIGRATION=null;},650);}
}
function kbIngest(doc,message,delay=0){
 doc.migrating=doc.storage==='legacy'&&!BRAND_FILES.find(file=>file.id===doc.id)?.url;
 const token=++doc.generation;doc.state='saving';doc.health='checking';doc.indexVersion=0;doc.indexedText='';kbLog(doc,message);
 setTimeout(()=>{
  if(doc.generation!==token)return;
  doc.storage='sharepoint';doc.fileId='sp-demo-'+doc.id;doc.link='xdigate://demo/kb/'+doc.id;doc.state='indexing';kbLog(doc,'已模拟保存 SharePoint 文件引用，自动解析与索引中');kbPaint();
  setTimeout(()=>{if(doc.generation!==token)return;doc.migrating=false;doc.health='available';doc.checkedAt=new Date().toISOString();doc.state=doc.text?'ready':'unparsed';doc.indexVersion=doc.text?doc.version:0;doc.indexedText=doc.text;kbLog(doc,doc.text?'索引已更新；链接与权限核对通过（模拟）':'已关联引用；本 Demo 未解析实际上传内容，不参与检索');kbPaint();},900);
 },650+delay);
}
function kbRegisterUpload(file){
 kbEnsure();const doc=KB_DOCS.get(file.id);doc.brand=knowledgeActiveBrand().id;doc.text='';doc.kind='source';doc.approval=null;
 kbIngest(doc,'新增文件：模拟写入 SharePoint；实际文件仅在本页预览');
}
function kbFileRows(rows){return `<div class="ctx">${rows.map(([label,value])=>`<div class="ctxr"><span class="k">${label}</span><span class="v">${esc(String(value))}</span></div>`).join('')}</div>`;}
function kbFileInfoHTML(file,doc){
 const brand=KNOWLEDGE_BRANDS.find(item=>item.id===doc.brand)?.name||doc.brand;
 const unavailable=['removed','denied'].includes(doc.health),readable=doc.health==='available'&&doc.state==='ready';
 const content=readable?doc.indexedText:unavailable?'文件不可访问，解析内容与引用已停用。':doc.state==='legacy'?'迁移后自动解析并建立索引。':doc.state==='saving'||doc.state==='indexing'?'正在自动处理，请稍候。':'此 Demo 未解析上传文件。';
 return `${unavailable?`<div class="note kb-access-note">${doc.health==='denied'?'SharePoint 访问权限已撤销。':'SharePoint 原文件已不存在。'}相关索引与引用已自动停用。</div>`:''}
 <section class="kb-info-section"><h4 class="kb-section-title">基本信息</h4>${kbFileRows([
  ['文件类型',file.type],['文件大小',file.size],['上传日期',file.date],['存储位置',doc.storage==='legacy'?'现有知识库（待迁移）':'SharePoint（演示）']
 ])}</section>
 <section class="kb-info-section"><h4 class="kb-section-title">知识库信息</h4>${kbFileRows([
  ['品牌',brand],['权限范围',`客户 ${doc.client} · 项目 ${doc.project}`],['资料属性',doc.kind==='source'?'参考资料':doc.approval==='approved'?'已批准产出（演示）':'未批准产出（演示）'],
  ['文件版本','v'+doc.version],['索引版本',doc.indexVersion?'v'+doc.indexVersion:'未建立'],['自动检查',doc.checkedAt?new Date(doc.checkedAt).toLocaleTimeString('zh-CN',{hour12:false})+'（模拟）':'尚未检查'],
  ['文件 ID',doc.fileId||'迁移后生成'],['知识库引用',doc.link||'迁移后关联']
 ])}</section>
 <section class="kb-info-section"><h4 class="kb-section-title">解析内容${readable?'（预置演示）':''}</h4><div class="ctx"><p class="kb-file-content ${readable?'':'kb-muted'}">${esc(content)}</p></div></section>`;
}
function kbOpenFile(id,edit=false){
 kbEnsure();const file=BRAND_FILES.find(item=>item.id===id),doc=KB_DOCS.get(id);
 if(!file||!doc)return;
 if(!kbIsOnline(doc)){downloadBrandFile(id);return;}
 if(!kbScopeAllowed(doc)||['denied','removed'].includes(doc.health)){toast('文件不可访问，暂时无法打开');return;}
 const example=typeof DL_OFFICE_EXAMPLE==='string'?DL_OFFICE_EXAMPLE:'';
 const url=String(file.sharepointUrl||(edit?example:file.url)||'');
 if(!(edit?/^https:\/\//i:/^(https:\/\/|blob:)/i).test(url)){toast('此示例尚未提供真实文件链接，暂不可跳转');return;}
 try{window.open(url,'_blank','noopener,noreferrer');}catch(error){toast('无法打开文件，请稍后重试');}
}
function kbShowFile(id){
 kbEnsure();const file=BRAND_FILES.find(f=>f.id===id),doc=KB_DOCS.get(id);if(!file||!doc||!kbScopeAllowed(doc)){toast('没有权限访问此文件');return;}
 const drawer=$('dw'),detail=$('kb-file-detail'),opening=!detail||detail.dataset.file!==id||!drawer.classList.contains('on');
 if(opening){closeDw();drawer.classList.remove('focus','expanded');}
 const bad=['removed','denied'].includes(doc.health),stateClass=bad?'review':doc.state==='ready'?'done':'hold';
 const brand=KNOWLEDGE_BRANDS.find(item=>item.id===doc.brand)?.name||doc.brand;
 drawer.innerHTML=`<section class="kb-file-drawer" role="dialog" aria-modal="true" aria-label="${esc(file.name)}"><header class="dw-h">
  <button class="ib" id="kb-file-close" onclick="closeDw()" aria-label="关闭文件详情"><i data-lucide="x"></i></button>
  <div style="flex:1;min-width:0"><div class="ty">品牌文件 · ${esc(brand)}</div><h3>${esc(file.name)}</h3></div><span class="st ${stateClass}">${kbStatus(doc)}</span></header>
 <div class="dw-b"><div id="kb-file-detail" data-file="${id}">${kbFileInfoHTML(file,doc)}</div></div>
 <footer class="dw-f">${kbFileActionHTML(file,doc)}<span class="kb-footer-note">Demo · 仅本次会话有效</span></footer></section>`;
 drawer.classList.add('on');$('scrim').classList.add('on');kpIcons();
 if(typeof syncDrawerExpandControl==='function')syncDrawerExpandControl();
 if(opening)$('kb-file-close')?.focus({preventScroll:true});
}
function kbExternalEvent(id,event){
 const doc=KB_DOCS.get(id);if(!doc||!kbScopeAllowed(doc)||!['update','replace','removed','denied','restore'].includes(event))return;
 if(doc.storage!=='sharepoint'){toast('请先迁移文件，再演示 SharePoint 变更');return;}
 // Invalidate before asynchronous work: old citations must never survive a detected change.
 ++doc.generation;doc.indexedText='';doc.indexVersion=0;doc.checkedAt=new Date().toISOString();
 if(event==='removed'||event==='denied'){
  doc.health=event;doc.state=event;kbLog(doc,event==='removed'?'自动检测到原文件不存在，已停用索引与引用':'自动检测到权限撤销，已停用索引与引用');
 }else{
  if(event!=='restore'){doc.version++;if(doc.text)doc.text=(KB_DEMO_TEXT[id]||doc.text)+`（${event==='replace'?'替换':'更新'}后的 v${doc.version} 演示内容）`;}
  kbIngest(doc,event==='restore'?'自动检测到原文件及权限恢复':`自动检测到文件${event==='replace'?'替换':'更新'}，旧引用已失效`);
 }
 kbPaint();
}
function kbEligible(doc,purpose,agent){
 return kbScopeAllowed(doc)&&kbAgentAllowed(agent)&&doc.storage==='sharepoint'&&doc.health==='available'&&doc.state==='ready'&&doc.indexVersion===doc.version&&!!doc.indexedText&&(doc.kind!=='output'||doc.approval==='approved')&&(purpose!=='formal'||doc.kind==='output'&&doc.approval==='approved');
}
function kbChangeFilter(key,value){KB_DEMO[key]=value;KB_DEMO.results=null;const results=$('kb-results');if(results)results.innerHTML='';}
function kbRetrieve(){
 KB_DEMO.query=String($('kb-query')?.value||'').trim();KB_DEMO.purpose=$('kb-purpose')?.value||'reference';KB_DEMO.agent=$('kb-agent')?.value||'';
 if(!KB_DEMO.query){toast('请输入要检索的内容');return;}
 const tokens=KB_DEMO.query.toLowerCase().split(/\s+/).filter(Boolean);kbEnsure();
 KB_DEMO.results=kbVisibleDocs().map(file=>({file,doc:KB_DOCS.get(file.id)})).filter(({file,doc})=>kbEligible(doc,KB_DEMO.purpose,KB_DEMO.agent)&&tokens.some(token=>(file.name+' '+doc.indexedText).toLowerCase().includes(token))).map(({doc})=>({id:doc.id,version:doc.version,generation:doc.generation,brand:doc.brand}));
 kbPaint();
}
function kbRetrievalHTML(){
 const agents=(typeof PERMISSION_AGENTS==='undefined'?[]:PERMISSION_AGENTS).filter(agent=>kbAgentAllowed(agent.id));
 if(!agents.some(agent=>agent.id===KB_DEMO.agent))KB_DEMO.agent=agents[0]?.id||'';
 return `<details class="kb-retrieval" ${KB_DEMO.results!==null?'open':''}><summary>Agent 检索演示</summary><p class="kb-muted">使用预置解析文本演示；按当前账号的项目／客户及 Agent 权限过滤。正式业务依据仅使用已批准产出。</p><div class="kb-query-controls"><label>Agent<select id="kb-agent" onchange="kbChangeFilter('agent',this.value)">${agents.map(agent=>`<option value="${esc(agent.id)}" ${agent.id===KB_DEMO.agent?'selected':''}>${esc(agent.name)}</option>`).join('')}</select></label><label>用途<select id="kb-purpose" onchange="kbChangeFilter('purpose',this.value)"><option value="reference" ${KB_DEMO.purpose==='reference'?'selected':''}>参考资料</option><option value="formal" ${KB_DEMO.purpose==='formal'?'selected':''}>正式业务依据</option></select></label><label class="kb-query-label">检索内容<input id="kb-query" value="${esc(KB_DEMO.query)}" oninput="kbChangeFilter('query',this.value)" onkeydown="if(event.key==='Enter'&&!event.isComposing)kbRetrieve()"></label><button class="btn sm" ${agents.length?'':'disabled'} onclick="kbRetrieve()">检索</button></div><div id="kb-results" role="status">${kbResultsHTML()}</div></details>`;
}
function kbResultsHTML(){
 if(KB_DEMO.results===null)return '';
 if(!KB_DEMO.results.length)return '<p class="kb-muted">没有符合权限、用途和关键词的已索引内容。请先迁移文件，或调整关键词／用途。</p>';
 return `<p class="kb-muted">检索引用（演示，非 Agent 生成回答）</p><ul class="kb-results">${KB_DEMO.results.map(ref=>{
  const doc=KB_DOCS.get(ref.id),file=BRAND_FILES.find(f=>f.id===ref.id);
  if(!doc||!file||doc.brand!==knowledgeActiveBrand().id||!kbEligible(doc,KB_DEMO.purpose,KB_DEMO.agent)||doc.version!==ref.version||doc.generation!==ref.generation)return '<li class="kb-warning">原引用已失效，请重新检索。</li>';
  return `<li><button class="bf-title" onclick="kbShowFile('${doc.id}')">${esc(file.name)} · v${ref.version}</button><p>${esc(doc.indexedText)}</p><small>${doc.kind==='output'?'已批准产出':'参考资料'} · 已校验项目／客户权限</small></li>`;
 }).join('')}</ul>`;
}
