/* Session-only soft deletion. Original artifacts and attachments stay intact. */
function taskDeleteAllowed(t,restoring=false){
 if(!t||t.devHidden||(!restoring&&(t.deletedAt||t.st==='done')))return false;
 if(typeof permissionCanAccessView==='function'&&!permissionCanAccessView('work'))return false;
 const member=typeof permissionCurrentMember==='function'?permissionCurrentMember():null;
 if(member?.status==='disabled')return false;
 const creator=t.cr||{s:'h',w:'du'};
 return member?.role==='admin'||member?.role==='super'||(creator.s==='h'&&creator.w===currentUser());
}
function taskMenuHTML(t,detail=false){
 if(!taskDeleteAllowed(t))return '';
 const arg=esc(JSON.stringify(t.id));
 return `<span class="task-more ${detail?'task-more-detail':''}" onclick="event.stopPropagation()" onkeydown="event.stopPropagation()"><button type="button" class="task-more-button" aria-label="${esc(t.t)}：更多操作" aria-haspopup="menu" aria-expanded="${S.taskMenu===t.id}" onclick="toggleTaskMenu(${arg},event)"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg></button>${S.taskMenu===t.id?`<span class="task-more-menu" role="menu"><button type="button" role="menuitem" class="task-delete-action" onclick="openTaskDelete(${arg},event)">删除任务</button></span>`:''}</span>`;
}
function toggleTaskMenu(id,event){event?.stopPropagation();S.taskWorkMenu=false;S.taskMenu=S.taskMenu===id?null:id;render();}
function taskWorkMenuHTML(){
 return `<span class="task-work-more"><button type="button" class="btn ghost" aria-label="更多任务操作" aria-haspopup="menu" aria-expanded="${!!S.taskWorkMenu}" onclick="event.stopPropagation();S.taskMenu=null;S.taskWorkMenu=!S.taskWorkMenu;render()">⋯</button>${S.taskWorkMenu?'<span class="task-more-menu" role="menu"><button type="button" role="menuitem" onclick="event.stopPropagation();openDeletedTasks()">已删除任务</button></span>':''}</span>`;
}
function taskDeleteModal(html){
 $('mod').innerHTML=html;$('mod').classList.add('on');
 $('mod').querySelector('[data-task-cancel]')?.focus();
}
function openTaskDelete(id,event){
 event?.stopPropagation();const t=T.find(x=>x.id===id);
 if(!taskDeleteAllowed(t)){toast('该任务已交付、已删除或你没有删除权限');return;}
 S.taskMenu=null;S.taskDeleteId=id;render();
 const warning=t.st==='run'?'删除后将停止当前运行，已消耗的资源不会退回。':t.st==='review'?'删除后将撤销该任务的待审批事项。':'删除后，该任务将从工作列表中移除。';
 taskDeleteModal(`<section class="mbox task-delete-modal" role="dialog" aria-modal="true" aria-labelledby="task-delete-title"><div class="mhd"><h3 id="task-delete-title">删除任务？</h3><button type="button" class="ib" aria-label="关闭" onclick="closeMod()">×</button></div><div class="mbd"><div class="task-delete-name">${esc(t.t)}</div><p class="task-delete-warning">${warning}</p></div><div class="mft"><button type="button" class="btn ghost" data-task-cancel onclick="closeMod()">取消</button><button type="button" class="btn task-delete-confirm" onclick="confirmTaskDelete()">确认删除</button></div></section>`);
}
function confirmTaskDelete(){
 if(!$('mod').classList.contains('on')||!S.taskDeleteId)return;
 const t=T.find(x=>x.id===S.taskDeleteId);
 if(!taskDeleteAllowed(t)){closeMod();S.taskDeleteId=null;toast('任务状态或权限已变更，未执行删除');return;}
 const time=new Date().toISOString(),actor=currentUser();
 t.deletedAt=time;t.deletedBy=actor;t.deletedStatus=t.st;t.executionCancelled=true;
 t.taskAudit=t.taskAudit||[];t.taskAudit.push({action:'删除任务',actor,time,previousStatus:t.st});
 S.taskDeleteId=null;S.taskMenu=null;
 if(S.tid===t.id){if(S.liveT){clearInterval(S.liveT);S.liveT=null;}S.tid=null;S.view='work';S.hist=[];}
 closeDw();closeMod();renderNav();render();toast('任务已删除');
}
function taskDeletedTime(value){return new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(value));}
function openDeletedTasks(){
 S.taskMenu=null;S.taskWorkMenu=false;render();
 const list=T.filter(t=>t.deletedAt&&taskDeleteAllowed(t,true)).sort((a,b)=>b.deletedAt.localeCompare(a.deletedAt));
 taskDeleteModal(`<section class="mbox task-deleted-modal" role="dialog" aria-modal="true" aria-labelledby="task-deleted-title"><div class="mhd"><h3 id="task-deleted-title">已删除任务 <span class="num">${list.length}</span></h3><button type="button" class="ib" aria-label="关闭" data-task-cancel onclick="closeMod()">×</button></div><div class="mbd"><p class="task-delete-help">仅保留本次演示会话。恢复进行中或待审批任务后，将回到待开始，不会自动运行或重新发起审批。</p><div class="task-deleted-list">${list.length?list.map(t=>`<article><div><b>${esc(t.t)}</b><p>${esc(U[t.deletedBy]?.n||t.deletedBy)} · ${esc(taskDeletedTime(t.deletedAt))}（东京时间）</p></div><button type="button" class="btn ghost" onclick="restoreDeletedTask(${esc(JSON.stringify(t.id))})">恢复任务</button></article>`).join(''):'<div class="task-deleted-empty">暂无已删除任务</div>'}</div></div></section>`);
}
function restoreDeletedTask(id){
 const t=T.find(x=>x.id===id);
 if(!t?.deletedAt||!taskDeleteAllowed(t,true)){toast('任务不存在或你没有恢复权限');return;}
 const previous=t.deletedStatus;t.st=['run','review'].includes(previous)?'todo':previous;
 // A restored task must be explicitly restarted; old callbacks remain invalid.
 t.restoredPending=['run','review'].includes(previous);
 delete t.deletedAt;delete t.deletedBy;delete t.deletedStatus;
 t.taskAudit.push({action:'恢复任务',actor:currentUser(),time:new Date().toISOString(),status:t.st});
 renderNav();openDeletedTasks();toast('任务已恢复'+(t.restoredPending?'，请重新开始任务':''));
}
document.addEventListener('click',event=>{
 if((S.taskMenu||S.taskWorkMenu)&&!event.target.closest('.task-more,.task-work-more')){S.taskMenu=null;S.taskWorkMenu=false;render();}
});
document.addEventListener('keydown',event=>{
 if(event.key==='Escape'&&(S.taskMenu||S.taskWorkMenu)){S.taskMenu=null;S.taskWorkMenu=false;render();}
});
