/* Existing KB document references, metadata only; no document reads or uploads. */
let caDocPicker=null;
function caDocumentReferenceAllowed(reference){
 return kbVisibleDocs().some(file=>{const doc=KB_DOCS.get(file.id);return file.id===reference.documentId&&!['denied','removed'].includes(doc.health)&&!['denied','removed'].includes(doc.state)&&(reference.version==null||reference.version===doc.version);});
}
function caDocumentChoices(){
 if(!caDocPicker)return [];
 return kbVisibleDocs().filter(file=>!!KB_DOCS.get(file.id).sourceTaskId===(caDocPicker.tab==='online'));
}
function caOpenDocumentPicker(key){
 if(!CA_BY_ID.has(key))return;
 const trigger=caMenuTrigger;caCloseMenu();
 caDocPicker={key,trigger,tab:'brand',query:'',type:'全部',selected:new Set(),error:''};
 caPaintDocumentPicker();$('mod').classList.add('on');$('ca-doc-search')?.focus();
}
function caPaintDocumentPicker(){
 const p=caDocPicker;if(!p)return;
 const draft=CA_BY_ID.get(p.key);if(!draft)return;
 const files=caDocumentChoices(),query=p.query.toLowerCase().trim(),list=files.filter(file=>(p.type==='全部'||file.type===p.type)&&(!query||`${file.name} ${file.type}`.toLowerCase().includes(query)));
 const active=document.activeElement,searching=active?.id==='ca-doc-search',start=active?.selectionStart,focusId=active?.id,scroll=document.querySelector('.ca-doc-body')?.scrollTop||0;
 const kinds={PDF:['pdf','PDF'],文档:['doc','DOC'],表格:['sheet','XLS'],PPT:['doc','PPT']};
 $('mod').innerHTML=`<div class="mbox ca-doc-modal" role="dialog" aria-modal="true" aria-labelledby="ca-doc-title">
  <div class="mhd modal-titlebar"><div class="main"><h3 id="ca-doc-title">选择在线文档</h3><p>从当前品牌中选择文件，添加到本次对话。</p></div><button type="button" class="ib" aria-label="关闭" onclick="caCloseDocumentPicker()">×</button></div>
  <div class="ca-doc-tabs" role="tablist" aria-label="文档来源">${[['brand','品牌文件'],['online','在线文档']].map(([key,label])=>`<button type="button" id="ca-doc-tab-${key}" role="tab" aria-controls="ca-doc-panel" aria-selected="${p.tab===key}" class="${p.tab===key?'on':''}" onclick="caSetDocumentTab('${key}')">${label}</button>`).join('')}</div>
  <div class="ca-doc-body" id="ca-doc-panel" role="tabpanel" aria-labelledby="ca-doc-tab-${p.tab}">
   <div class="bf-toolbar"><label class="kc-search bf-search"><input id="ca-doc-search" aria-label="搜索文件名或类型" placeholder="搜索文件名或类型" value="${esc(p.query)}" oninput="if(!event.isComposing)caSearchDocuments(this.value)" oncompositionend="caSearchDocuments(this.value)"></label><div class="seg">${['全部','PDF','文档','表格','PPT'].map(type=>`<button type="button" class="${type===p.type?'on':''}" aria-pressed="${type===p.type}" onclick="caSetDocumentType('${type}')">${type}</button>`).join('')}</div></div>
   <div class="bf-count" role="status">${list.length} / ${files.length} 个文件</div>
   <div class="bf-grid ca-doc-grid">${list.map(file=>{const doc=KB_DOCS.get(file.id),existing=draft.files.some(item=>item.reference?.documentId===file.id),blocked=!caDocumentReferenceAllowed({documentId:file.id}),checked=p.selected.has(file.id),kind=kinds[file.type]||kinds.文档;
    return `<label class="bf-card ca-doc-card ${checked?'selected':''} ${existing||blocked?'disabled':''}"><div class="bf-top"><span class="bf-kind ${kind[0]}">${kind[1]}</span><input id="ca-doc-pick-${file.id}" type="checkbox" aria-label="选择 ${esc(file.name)}" ${checked||existing?'checked':''} ${existing||blocked?'disabled':''} onchange="caToggleDocument('${file.id}',this.checked)"></div><span class="bf-title">${esc(file.name)}</span><div class="bf-desc">${file.type} · ${esc(file.size)}${doc.storage==='sharepoint'?` · v${doc.version}`:''}</div><div class="bf-bottom"><time>${esc(file.date)}</time><span>${existing?'已添加':blocked?'不可用':p.tab==='online'?'系统产出':'品牌文件'}</span></div></label>`;
   }).join('')}</div>${list.length?'':'<div class="ca-doc-empty">没有符合条件的文件</div>'}
  </div><p class="ca-doc-error" role="alert">${esc(p.error)}</p>
  <div class="mft"><span class="ca-doc-count">已选择 ${p.selected.size} 个</span><span class="spacer"></span><button type="button" class="btn ghost sm" onclick="caCloseDocumentPicker()">取消</button><button type="button" class="btn sm" ${p.selected.size?'':'disabled'} onclick="caConfirmDocuments()">添加到对话${p.selected.size?'（'+p.selected.size+'）':''}</button></div>
 </div>`;
 if(searching){const input=$('ca-doc-search');input?.focus();if(typeof start==='number')input?.setSelectionRange(start,start);}
 else if(focusId?.startsWith('ca-doc-pick-'))document.getElementById(focusId)?.focus();
 const body=document.querySelector('.ca-doc-body');if(body)body.scrollTop=scroll;
}
function caSetDocumentTab(tab){if(!caDocPicker||!['brand','online'].includes(tab))return;caDocPicker.tab=tab;caPaintDocumentPicker();$('ca-doc-tab-'+tab)?.focus();}
function caSearchDocuments(value){if(!caDocPicker)return;caDocPicker.query=value;caPaintDocumentPicker();}
function caSetDocumentType(type){if(!caDocPicker||!['全部','PDF','文档','表格','PPT'].includes(type))return;caDocPicker.type=type;caPaintDocumentPicker();}
function caToggleDocument(id,checked){
 const p=caDocPicker;if(!p||!caDocumentChoices().some(file=>file.id===id)||!caDocumentReferenceAllowed({documentId:id}))return;
 const draft=CA_BY_ID.get(p.key);if(!draft||draft.files.some(item=>item.reference?.documentId===id))return;
 if(checked&&draft.files.length+p.selected.size>=TA_MAX_FILES){p.error='最多添加 '+TA_MAX_FILES+' 个附件，请先移除已有附件';caPaintDocumentPicker();return;}
 checked?p.selected.add(id):p.selected.delete(id);p.error='';caPaintDocumentPicker();
}
function caCloseDocumentPicker(){const trigger=caDocPicker?.trigger;caDocPicker=null;$('mod').classList.remove('on');trigger?.focus();}
function caConfirmDocuments(){
 const p=caDocPicker,draft=p&&CA_BY_ID.get(p.key);if(!p||!draft||!p.selected.size)return;
 const visible=kbVisibleDocs(),files=[...p.selected].map(id=>visible.find(file=>file.id===id));
 if(files.some(file=>!file||!caDocumentReferenceAllowed({documentId:file.id}))){p.error='文件不可用或权限已变更，请重新选择';caPaintDocumentPicker();return;}
 const additions=files.filter(file=>!draft.files.some(item=>item.reference?.documentId===file.id));
 if(draft.files.length+additions.length>TA_MAX_FILES){p.error='最多添加 '+TA_MAX_FILES+' 个附件，请减少选择';caPaintDocumentPicker();return;}
 additions.forEach(file=>{const doc=KB_DOCS.get(file.id),match=String(file.size).match(/([\d.]+)\s*(KB|MB|B)/i),size=match?Number(match[1])*({KB:1024,MB:1048576,B:1}[match[2].toUpperCase()]):0;
  draft.files.push({id:++taNextId,name:file.name,size,extension:file.name.split('.').pop().toLowerCase(),lastModified:0,status:'ready',progress:100,reference:{documentId:file.id,source:doc.sourceTaskId?'online':'brand',version:doc.version}});
 });draft.errors='';caRender(draft);caCloseDocumentPicker();toast('已添加 '+additions.length+' 个文档引用');
}
document.addEventListener('keydown',event=>{
 if(!caDocPicker||!$('mod').classList.contains('on')||!document.querySelector('.ca-doc-modal'))return;
 if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();caCloseDocumentPicker();return;}
 if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)&&event.target.closest('.ca-doc-tabs')){event.preventDefault();caSetDocumentTab(event.key==='Home'?'brand':event.key==='End'?'online':caDocPicker.tab==='brand'?'online':'brand');return;}
 if(event.key==='Tab'){const items=[...document.querySelectorAll('.ca-doc-modal button:not([disabled]),.ca-doc-modal input:not([disabled])')];const first=items[0],last=items.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}}
},true);
