/* Attachment UI demo: metadata only. No file reads, uploads or Agent parsing. */
const TA_MAX_FILES=5,TA_MAX_BYTES=20*1024*1024;
const TA_EXTENSIONS=['pdf','docx','xlsx','pptx','txt','csv','png','jpg','jpeg','webp'];
let taDraft={files:[],timers:new Map()},taNextId=0;
function taReset(){taDraft.cancelled=true;taDraft.timers.forEach(clearTimeout);taDraft={files:[],timers:new Map()}}
function taSize(bytes){return bytes>=1024*1024?(bytes/1024/1024).toFixed(1)+' MB':Math.max(1,Math.ceil(bytes/1024))+' KB'}
function taIcon(){return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/></svg>'}
function taUploadHTML(){
 return '<section class="ta-upload" aria-labelledby="ta-title"><div class="ta-heading"><span id="ta-title">参考附件</span><span>（选填）</span></div><div id="ta-drop" class="ta-drop" ondragover="taDrag(event,true)" ondragleave="taDrag(event,false)" ondrop="taDrop(event)"><input id="ta-input" type="file" multiple accept="'+TA_EXTENSIONS.map(ext=>'.'+ext).join(',')+'" hidden onchange="taSelect(this.files);this.value=\'\'"><button type="button" class="btn ghost sm ta-add" onclick="document.getElementById(\'ta-input\').click()">'+taIcon()+'添加附件</button><span>或将文件拖到这里</span></div><div id="ta-feedback" class="ta-feedback" role="alert"></div><ul id="ta-files" class="ta-files" aria-label="已选附件"></ul></section>';
}
function taDrag(event,over){
 if(!Array.from(event.dataTransfer?.types||[]).includes('Files'))return;
 event.preventDefault();if(over)event.dataTransfer.dropEffect='copy';
 if(!over&&event.currentTarget?.contains(event.relatedTarget))return;
 $('ta-drop')?.classList.toggle('drag-over',over);
}
function taDrop(event){event.preventDefault();$('ta-drop')?.classList.remove('drag-over');taSelect(event.dataTransfer?.files)}
function taSelect(files){
 if(!document.querySelector('#mod .new-task-modal')||!$('mod').classList.contains('on'))return;
 taQueueFiles(taDraft,files,taRender);
}
function taQueueFiles(draft,files,update){
 const errors=[];
 for(const file of Array.from(files||[])){
  const name=String(file.name||''),extension=name.split('.').pop().toLowerCase(),size=Number(file.size),modified=Number(file.lastModified)||0;
  if(!TA_EXTENSIONS.includes(extension)){errors.push(name+'：格式不支持');continue}
  if(!Number.isFinite(size)||size<=0){errors.push(name+'：文件为空，无法添加');continue}
  if(size>TA_MAX_BYTES){errors.push(name+'：超过 20 MB');continue}
  if(draft.files.some(item=>item.name===name&&item.size===size&&item.lastModified===modified)){errors.push(name+'：已添加，无需重复');continue}
  if(draft.files.length>=TA_MAX_FILES){errors.push('最多添加 5 个附件，请先移除已有附件');break}
  const item={id:++taNextId,name,size,extension,lastModified:modified,status:'uploading',progress:25};
  draft.files.push(item);
  function advance(){
   if(draft.cancelled||!draft.files.includes(item))return;
   if(item.progress===25){item.progress=70;draft.timers.set(item.id,setTimeout(advance,500))}
   else{item.progress=100;item.status='ready';draft.timers.delete(item.id)}
   update();
  }
  draft.timers.set(item.id,setTimeout(advance,450));
 }
 draft.errors=errors.join('；');update();
}
function taRemove(id){
 clearTimeout(taDraft.timers.get(id));taDraft.timers.delete(id);taDraft.files=taDraft.files.filter(item=>item.id!==id);
 taDraft.errors='';taRender();
}
function taRender(){
 const list=$('ta-files');if(!list)return;
 if($('ta-feedback'))$('ta-feedback').textContent=taDraft.errors||'';
 list.innerHTML=taDraft.files.map(item=>'<li class="ta-file">'+taIcon()+'<div class="ta-file-copy"><span class="ta-file-name" title="'+esc(item.name)+'">'+esc(item.name)+'</span><span class="ta-file-meta">'+taSize(item.size)+' · '+(item.status==='ready'?'已添加（演示）':'模拟上传中 '+item.progress+'%')+'</span>'+(item.status==='ready'?'':'<progress max="100" value="'+item.progress+'" aria-label="'+esc(item.name)+' 模拟上传进度"></progress>')+'</div><button type="button" class="ta-remove" aria-label="移除 '+esc(item.name)+'" onclick="taRemove('+item.id+')">移除</button></li>').join('');
 const busy=taDraft.files.some(item=>item.status!=='ready');list.setAttribute('aria-busy',String(busy));
 const submit=document.querySelector('#new-task-footer > .btn');if(submit){submit.disabled=busy;submit.textContent=busy?'附件准备中…':'开始'}
}
function taReady(){
 if(taDraft.files.some(item=>item.status!=='ready')){toast('附件仍在模拟上传中，请稍等或移除后再开始。');return false}
 return true;
}
function taSnapshot(){return taDraft.files.filter(item=>item.status==='ready').map(({name,size,extension,lastModified})=>({name,size,extension,lastModified,demo:true}))}
function taTaskHTML(task){
 if(!task.attachments?.length)return '';
 return '<section class="ta-task" aria-label="任务参考附件"><h4>参考附件 <span>'+task.attachments.length+' 个</span></h4><ul class="ta-files">'+task.attachments.map(item=>'<li class="ta-file">'+taIcon()+'<div class="ta-file-copy"><span class="ta-file-name" title="'+esc(item.name)+'">'+esc(item.name)+'</span><span class="ta-file-meta">'+taSize(item.size)+' · 本地演示附件</span></div></li>').join('')+'</ul><p class="ta-demo-note">附件清单仅用于演示，文件未上传，Agent 尚未读取。</p></section>';
}
