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
 return '<button type="button" class="btn ghost sm ca-attach" title="添加附件" aria-label="添加附件" aria-haspopup="menu" aria-expanded="false" onclick="caToggleMenu(event,this)"><i data-lucide="paperclip" aria-hidden="true"></i></button>';
}
let caMenuTrigger=null;
function caCloseMenu(restoreFocus=false){
 const trigger=caMenuTrigger;document.getElementById('ca-source-menu')?.remove();
 trigger?.setAttribute('aria-expanded','false');caMenuTrigger=null;if(restoreFocus)trigger?.focus();
}
function caSourceMenuHTML(){
 return [['files','品牌文件'],['images','素材库'],['upload','本地上传']].map(([icon,label])=>`<button type="button" role="menuitem" onclick="caCloseMenu(true)"><i data-lucide="${icon}" aria-hidden="true"></i><span>${label}</span></button>`).join('');
}
function caToggleMenu(event,trigger){
 event.stopPropagation();const wasOpen=caMenuTrigger===trigger;caCloseMenu();if(wasOpen)return;
 const menu=document.createElement('div');menu.id='ca-source-menu';menu.className='ca-source-menu';menu.setAttribute('role','menu');menu.setAttribute('aria-label','附件来源');menu.innerHTML=caSourceMenuHTML();
 document.body.appendChild(menu);caMenuTrigger=trigger;trigger.setAttribute('aria-expanded','true');
 const box=trigger.getBoundingClientRect(),width=menu.offsetWidth,height=menu.offsetHeight;
 menu.style.left=Math.max(8,Math.min(box.left,window.innerWidth-width-8))+'px';
 menu.style.top=Math.max(8,box.top-height-8)+'px';
 if(window.lucide)lucide.createIcons({root:menu,attrs:{width:15,height:15,'stroke-width':1.5}});
 menu.querySelector('button')?.focus();
}
document.addEventListener('click',event=>{if(caMenuTrigger&&!event.target.closest('#ca-source-menu')&&!caMenuTrigger.contains(event.target))caCloseMenu();});
document.addEventListener('keydown',event=>{
 const menu=document.getElementById('ca-source-menu');if(!menu)return;
 if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();caCloseMenu(true);return;}
 if(event.key==='Tab'){caCloseMenu();return;}
 if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){
  event.preventDefault();const items=Array.from(menu.querySelectorAll('button')),index=items.indexOf(document.activeElement);
  items[event.key==='Home'?0:event.key==='End'?items.length-1:(index+(event.key==='ArrowDown'?1:-1)+items.length)%items.length]?.focus();
 }
},true);
window.addEventListener?.('resize',()=>caCloseMenu());
document.addEventListener('scroll',event=>{if(caMenuTrigger&&!event.target.closest?.('#ca-source-menu'))caCloseMenu();},true);
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
