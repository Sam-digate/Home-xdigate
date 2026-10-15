/* Per-conversation metadata drafts. No uploads, file reads or analysis. */
const CA_DRAFTS=new Map(),CA_BY_ID=new Map();let caNextId=0;
function caGet(kind,id,scope=null){
 const a=kind==='sub'?findArt(id)?.[1]:null;
 const channel=a?.mode==='csa'?S.dtab:0;
 const key=JSON.stringify([kind,id,scope??null,channel]);
 if(!CA_DRAFTS.has(key)){
  const draft={id:'ca-'+(++caNextId),files:[],timers:new Map(),errors:'',text:''};
  CA_DRAFTS.set(key,draft);CA_BY_ID.set(draft.id,draft);
 }
 return CA_DRAFTS.get(key);
}
function caRemember(kind,id,text,scope=null){caGet(kind,id,scope).text=text}
function caComposerHTML(kind,id,scope=null){
 const draft=caGet(kind,id,scope),key=draft.id;
 return '<div class="ca-compose" id="'+key+'"><input id="'+key+'-input" type="file" multiple accept="'+TA_EXTENSIONS.map(ext=>'.'+ext).join(',')+'" hidden onchange="caSelect(\''+key+'\',this.files);this.value=\'\'"><div id="'+key+'-pending">'+caPendingHTML(draft)+'</div></div>';
}
function caAttachButton(kind,id,scope=null){
 const key=caGet(kind,id,scope).id;
 return '<button type="button" class="btn ghost sm ca-attach" title="添加附件" aria-label="添加附件" onclick="document.getElementById(\''+key+'-input\').click()"><i data-lucide="paperclip" aria-hidden="true"></i></button>';
}
function caDropAttrs(kind,id,scope=null){
 const key=caGet(kind,id,scope).id;
 return 'ondragover="caDrag(event,\''+key+'\',true)" ondragleave="caDrag(event,\''+key+'\',false)" ondrop="caDrop(event,\''+key+'\')"';
}
function caPendingHTML(draft){
 return '<div class="ta-feedback" role="alert">'+esc(draft.errors||'')+'</div><ul class="ta-files ca-files" aria-label="待发送附件">'+draft.files.map(item=>'<li class="ta-file">'+taIcon()+'<div class="ta-file-copy"><span class="ta-file-name">'+esc(item.name)+'</span><span class="ta-file-meta">'+taSize(item.size)+' · '+(item.status==='ready'?'待发送（演示）':'模拟上传中 '+item.progress+'%')+'</span>'+(item.status==='ready'?'':'<progress max="100" value="'+item.progress+'" aria-label="'+esc(item.name)+' 模拟上传进度"></progress>')+'</div><button type="button" class="ta-remove" onclick="caRemove(\''+draft.id+'\','+item.id+')" aria-label="移除 '+esc(item.name)+'">移除</button></li>').join('')+'</ul>';
}
function caRender(draft){const el=$(draft.id+'-pending');if(el)el.innerHTML=caPendingHTML(draft)}
function caSelect(key,files){const draft=CA_BY_ID.get(key);if(draft)taQueueFiles(draft,files,()=>caRender(draft))}
function caRemove(key,id){
 const draft=CA_BY_ID.get(key);if(!draft)return;
 clearTimeout(draft.timers.get(id));draft.timers.delete(id);draft.files=draft.files.filter(item=>item.id!==id);draft.errors='';caRender(draft);
}
function caDrag(event,key,over){
 if(!Array.from(event.dataTransfer?.types||[]).includes('Files'))return;
 event.preventDefault();if(over)event.dataTransfer.dropEffect='copy';
 if(!over&&event.currentTarget?.contains(event.relatedTarget))return;
 event.currentTarget?.classList.toggle('drag-over',over);
}
function caDrop(event,key){event.preventDefault();event.currentTarget?.classList.remove('drag-over');caSelect(key,event.dataTransfer?.files)}
function caReady(draft){
 if(draft.files.some(item=>item.status!=='ready')){toast('附件仍在模拟上传中，请稍等或移除后再发送。');return false}return true;
}
function caFiles(draft){return draft.files.filter(item=>item.status==='ready').map(({name,size,extension,lastModified})=>({name,size,extension,lastModified,demo:true}))}
function caClear(draft){draft.timers.forEach(clearTimeout);draft.timers.clear();draft.files=[];draft.errors='';draft.text=''}
function caMessageHTML(message){
 if(!message.attachments?.length)return '';
 return '<div class="ca-message-files"><ul class="ta-files">'+message.attachments.map(item=>'<li class="ta-file">'+taIcon()+'<div class="ta-file-copy"><span class="ta-file-name">'+esc(item.name)+'</span><span class="ta-file-meta">'+taSize(item.size)+' · 演示附件，未上传或解析</span></div></li>').join('')+'</ul></div>';
}
