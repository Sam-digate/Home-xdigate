/* Online-document handoff demo. No Office conversion, local editor or cloud sync. */
const DL_OFFICE_EXAMPLE='https://xdigate.sharepoint.com/sites/msteams_45edec/_layouts/15/doc.aspx?sourcedoc={f0824232-fd64-4da2-a1b1-51fc560a55a5}&action=edit';
const DL_RECORDS=new Map();
let dlCreation=null;
function dlActor(){return U[currentUser()]?.n||'当前用户'}
function dlProject(task){return task?.project||task?.brand||document.querySelector('#top .proj .v')?.textContent.trim()||'任务未提供项目'}
function dlSupported(a){
 return !!a&&!a.inspection&&!a.sentiment&&!a.listing&&a.st!=='run'&&
 (a.mode!=='plans'||!!a.plans?.length)&&
 (['plans','report','general-session','seq','adtable','items','pptoutline','pptfile'].includes(a.mode)||(!a.mode&&['文档','报告','活动策划','策划方案'].includes(a.ty)));
}
function dlContext(a,requested){
 const scope=a.mode==='plans'?Math.max(0,Math.min(a.plans.length-1,Number.isInteger(requested)?requested:0)):null;
 const unit=scope===null?a:a.plans[scope],key=a.id+':'+(scope===null?'artifact':scope),task=findArt(a.id)[0];
 return {aid:a.id,scope,key,title:unit.t||a.ttl||'未命名文档',unit,task};
}
function dlRecord(a,scope){return DL_RECORDS.get(dlContext(a,scope).key)}
function dlFormat(a){return ['pptfile','pptoutline'].includes(a.mode)?'pptx':['adtable','items'].includes(a.mode)?'xlsx':'docx'}
function dlType(type){return {docx:'Word 文档',xlsx:'Excel 表格',pptx:'PPT 演示文稿'}[type]||'文档'}
function dlActionHTML(a,scope){
 if(!dlSupported(a))return '';
 const c=dlContext(a,scope),doc=DL_RECORDS.get(c.key),args=JSON.stringify(a.id)+','+JSON.stringify(c.scope);
 if(doc)return '<a class="btn ghost sm dl-entry" href="'+esc(doc.url)+'" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">编辑在线文档</a>';
 return '<button type="button" class="btn ghost sm dl-entry" onclick="event.stopPropagation();dlCreate('+esc(args)+')">创建在线文档</button>';
}
const dlOriginalPeek=peek;
peek=function(a){
 const html=dlOriginalPeek(a);if(!dlSupported(a))return html;
 return html.replace(/(<div class="pk-a"[^>]*>)([\s\S]*?)(<\/div>)/,(match,start,actions,end)=>{
  const entry=dlActionHTML(a,null),version=actions.search(/<span class="v(?:\s|\")/);
  return start+(version<0?actions+entry:actions.slice(0,version)+entry+actions.slice(version))+end;
 });
};
const dlOriginalCloseMod=closeMod;
closeMod=function(){if($('mod').classList.contains('on')&&document.querySelector('.dl-create')){clearTimeout(dlCreation?.timer);dlCreation=null}return dlOriginalCloseMod()};
const dlOriginalDrawDw=drawDw;
drawDw=function(){
 dlOriginalDrawDw();
 const a=findArt(S.aid)?.[1];if(!dlSupported(a)||S.cr!=null||S.brief!=null)return;
 const footer=document.querySelector('#dw .dw-artifact-content > .dw-f')||document.querySelector('#dw > .dw-f');if(!footer)return;
 const scope=a.mode==='plans'?S.oi:null;
 footer.querySelector('.dl-entry')?.remove();
 footer.querySelector('.dl-sync-note')?.remove();
 const comment=[...footer.querySelectorAll('button')].find(button=>button.textContent.includes('评论'));
 if(comment)comment.insertAdjacentHTML('afterend',dlActionHTML(a,scope));
 else footer.insertAdjacentHTML('beforeend',dlActionHTML(a,scope));
 if(dlRecord(a,scope))footer.insertAdjacentHTML('beforeend','<span class="dl-sync-note">注: 系统与在线文档的修改不会自动同步</span>');
};
function dlCreate(id,scope){
 const a=findArt(id)?.[1];if(!dlSupported(a))return;
 const c=dlContext(a,scope);if(DL_RECORDS.has(c.key)){dlOpen(id,scope);return}
 dlCreation={...c,type:dlFormat(a),recommended:dlFormat(a),name:c.title};
 dlDrawCreation();
}
function dlDrawCreation(){
 const c=dlCreation;if(!c)return;
 $('mod').innerHTML='<section class="mbox dl-create" role="dialog" aria-modal="true" aria-labelledby="dl-create-title"><div class="mhd"><h3 id="dl-create-title">创建在线文档</h3><button type="button" class="ib" onclick="closeMod()" aria-label="关闭">×</button></div><div class="mbd"><p class="dl-prototype">Demo：不实际生成文件，完成后可打开 SharePoint 示例。</p><div class="fld"><label for="dl-name">文档名称</label><input id="dl-name" maxlength="100" value="'+esc(c.name)+'" oninput="dlCreation.name=this.value"></div><div class="dl-create-type">'+dlTypePicker(c)+'</div><div class="dl-inherit"><span>来源任务</span><b>'+esc(c.task?.t||'当前任务')+'</b><span>项目</span><b>'+esc(dlProject(c.task))+'</b><span>负责人</span><b>'+esc(U[c.task?.own]?.n||dlActor())+'</b></div></div><div class="mft"><button type="button" class="btn" onclick="dlConfirmCreate()">创建</button><button type="button" class="btn ghost" onclick="closeMod()">取消</button></div></section>';
 $('mod').classList.add('on');$('dl-name').focus();
}
function dlTypePicker(c){
 return '<label for="dl-type">目标文件类型</label><select id="dl-type" onchange="dlSelectType(this.value)">'+['docx','xlsx','pptx'].map(type=>'<option value="'+type+'"'+(c.type===type?' selected':'')+'>'+dlType(type)+' · '+type.toUpperCase()+(c.recommended===type?'（推荐）':'')+'</option>').join('')+'</select>';
}
function dlSelectType(type){
 if(!dlCreation||dlCreation.running||dlCreation.done||!['docx','xlsx','pptx'].includes(type))return;
 dlCreation.type=type;
}
function dlConfirmCreate(){
 const c=dlCreation;if(!c||c.running||c.done||!$('mod').classList.contains('on'))return;
 c.name=c.name.trim();if(!c.name){toast('请填写文档名称');$('dl-name').focus();return}
 if(!['docx','xlsx','pptx'].includes(c.type)){toast('请选择文件类型');return}
 const a=findArt(c.aid)?.[1];if(!dlSupported(a))return;
 if(DL_RECORDS.has(c.key)){dlOpen(c.aid,c.scope);closeMod();return}
 c.running=true;c.phase=0;dlDrawProgress(true);
 function advance(){
  if(dlCreation!==c||!$('mod').classList.contains('on')||!document.querySelector('.dl-create'))return;
  c.phase++;
  if(c.phase<3){dlDrawProgress();c.timer=setTimeout(advance,[1000,1100,900][c.phase]);return}
  const source=findArt(c.aid)?.[1];
  if(!dlSupported(source)){closeMod();toast('原产出状态已变化，请重新创建。');return}
  DL_RECORDS.set(c.key,{key:c.key,aid:c.aid,scope:c.scope,taskId:c.task?.id,project:dlProject(c.task),owner:c.task?.own,name:c.name,type:c.type,url:DL_OFFICE_EXAMPLE,isExample:true});
  c.running=false;c.done=true;closeMod();render();
  if(S.aid===c.aid&&$('dw').classList.contains('on'))drawDw();
  dlAutoOpen(c.aid,c.scope);
 }
 c.timer=setTimeout(advance,1000);
}
function dlDrawProgress(initial=false){
 const c=dlCreation;if(!c)return;
 const steps=['生成文件','保存文件','关联任务'];
 if(initial){
  $('mod').innerHTML='<section class="mbox dl-create" role="dialog" aria-modal="true" aria-labelledby="dl-create-title"><div class="mhd"><h3 id="dl-create-title">正在创建在线文档</h3><button type="button" class="ib" onclick="closeMod()" aria-label="取消创建并关闭">×</button></div><div class="mbd"><p class="dl-progress-name">'+esc(c.name)+'</p><div id="dl-progress" role="status" aria-live="polite" aria-atomic="true"></div><p class="dl-prototype">演示进度，不实际生成或上传文件；完成后打开 SharePoint 示例。</p></div><div class="mft" id="dl-progress-actions"><button type="button" class="btn" disabled>正在创建…</button><button type="button" id="dl-progress-cancel" class="btn ghost" onclick="closeMod()">取消创建</button></div></section>';
  $('dl-progress-cancel').focus();
 }
 $('dl-progress').innerHTML='<p class="dl-progress-status">'+(c.done?'创建演示已完成':(c.phase+1)+'/3 · 正在'+steps[c.phase])+'</p><progress class="dl-progress-bar" max="3" value="'+c.phase+'" aria-label="在线文档创建演示进度"></progress>';
}
function dlAutoOpen(id,scope){
 const a=findArt(id)?.[1],doc=a&&dlRecord(a,scope);if(!doc)return;
 // A delayed popup may be blocked. Fall back to same-tab navigation, not another confirmation.
 let editor=null;
 try{
  editor=window.open('about:blank','_blank');
  if(editor){editor.opener=null;editor.location.replace(doc.url);return}
 }catch{try{editor?.close()}catch{}}
 window.location.assign(doc.url);
}
function dlOpen(id,scope){
 const a=findArt(id)?.[1],doc=a&&dlRecord(a,scope);if(!doc)return;
 try{window.open(doc.url,'_blank','noopener,noreferrer')}
 catch{toast('无法打开新窗口，请点击「编辑在线文档」重试。')}
}
// Earlier scripts perform the first render before this enhancement is loaded.
render();
