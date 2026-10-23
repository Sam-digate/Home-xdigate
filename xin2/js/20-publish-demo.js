/* Local social publishing demo. No platform API calls or persistent scheduling. */
const PUB_ACCOUNTS=[
 {id:'xhs-brand',name:'A8OPARIS · 官方品牌账号',handle:'A8OPARIS 官方',status:'ready'},
 {id:'xhs-content',name:'A8OPARIS · 内容账号',handle:'A8OPARIS 护肤日记',status:'ready'},
 {id:'xhs-expired',name:'A8OPARIS · 活动账号',handle:'A8OPARIS 活动',status:'expired'}
];
const PUB_RECORDS=[];
let pubDraft=null,pubSerial=0;
function pubEsc(value){return esc(String(value??'')).replace(/'/g,'&#39;');}
function pubSource(id,index=0){
 const [task,artifact]=findArt(id),unit=artifact?.plans?.[index];
 if(!task||task.deletedAt||task.devHidden||artifact?.ty!=='社媒内容'||artifact?.mode!=='plans'||!unit)return null;
 return {task,artifact,unit,index};
}
function pubCanAccess(source){
 if(!source)return false;
 if(typeof permissionCanAccessView==='function'&&!permissionCanAccessView('work'))return false;
 const member=typeof permissionCurrentMember==='function'?permissionCurrentMember():null;
 if(member?.status==='disabled')return false;
 return member?.role==='admin'||member?.role==='super'||source.task.own===currentUser();
}
function pubAllowed(source){return !!source&&source.unit.s==='done'&&source.artifact.st!=='run'&&!source.task.executionCancelled&&pubCanAccess(source);}
function pubSnapshot(source){
 const p=source.unit;
 const first=p.images?.[0],rawImage=(typeof first==='string'?first:first?.src||first?.url)||p.img||'';
 let image='';try{const url=new URL(rawImage);if(url.protocol==='https:')image=url.href;}catch{}
 const tags=[...new Set((Array.isArray(p.tags)?p.tags:[]).map(x=>String(x).replace(/^#+/,'').trim()).filter(Boolean))];
 return {title:String(p.t||''),body:String(p.body||''),image,tags,version:source.artifact.v};
}
function pubFingerprint(source){return JSON.stringify(pubSnapshot(source));}
function pubCurrentSource(d=pubDraft){
 if(!d)return null;const source=pubSource(d.aid,d.index);
 return pubAllowed(source)&&pubFingerprint(source)===d.fingerprint?source:null;
}
function pubTime(value){return new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(value));}
function pubDateInput(time){
 return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(time)).replace(' ','T');
}
function pubDefaultTime(){return pubDateInput(Date.now()+3600000);}
function pubScheduleBounds(){
 const now=Date.now(),min=Math.floor(now/60000)*60000+60000,max=Math.floor((now+10*86400000)/60000)*60000;
 return {min:pubDateInput(min),max:pubDateInput(max),maxTime:max};
}
function pubRefreshScheduleBounds(){
 const input=$('pub-when');if(!input)return;const bounds=pubScheduleBounds();input.min=bounds.min;input.max=bounds.max;
}
function pubScheduledTime(value){
 if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value))return NaN;
 const time=Date.parse(value+':00+09:00');
 if(!Number.isFinite(time))return NaN;
 const parts=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(time)).replace(' ','T');
 return parts===value?time:NaN;
}
function pubRecordStatus(record){return record.status||(record.mode==='scheduled'?'scheduled':'published');}
function pubLatestRecord(aid,index=0){return [...PUB_RECORDS].reverse().find(r=>r.aid===aid&&r.index===index);}
function pubRecordLabel(record){return {scheduled:'已定时',published:'已发布',cancelled:'已取消定时'}[pubRecordStatus(record)]||'已发布';}
function pubActionHTML(a){
 const record=pubLatestRecord(a.id);
 const label=record?(pubRecordStatus(record)==='scheduled'?'查看排期':pubRecordStatus(record)==='cancelled'?'查看记录':'查看发布'):'发布';
 const status=record?pubRecordLabel(record)+(pubRecordStatus(record)==='scheduled'?' · '+record.when.replace('T',' '):''):'';
 return '<button type="button" class="na" onclick="pubOpen('+pubEsc(JSON.stringify(a.id))+')">'+label+' →</button>'+(record?'<span class="pub-card-status">'+pubEsc(status)+'</span>':'');
}
function pubOpen(id,index=0){
 const source=pubSource(id,index),record=pubLatestRecord(id,index);
 const showRecord=!!record;
 if(!pubCanAccess(source)||(!showRecord&&!pubAllowed(source))){toast('请先批准内容，并确认你有当前任务的操作权限');return;}
 pubDispose();const snapshot=showRecord&&record.snapshot?record.snapshot:pubSnapshot(source);
 pubDraft={aid:id,index,snapshot,fingerprint:showRecord?record.fingerprint:pubFingerprint(source),account:showRecord?record.account:PUB_ACCOUNTS.find(x=>x.status==='ready')?.id||'',mode:showRecord?record.mode:'now',when:showRecord?record.when:pubDefaultTime(),stage:showRecord?'detail':'settings',result:showRecord?record:null,error:'',records:false};
 S.aid=id;S.tid=source.task.id;S.focus=false;S.pc=false;
 $('dw').classList.remove('focus','expanded');$('dw').classList.add('on','dw-publish');$('scrim').classList.add('on');
 pubPaint();$('pub-preview-button')?.focus();
}
function pubDispose(){
 clearTimeout(pubDraft?.timer);if(pubDraft?.preview&&$('mod').classList.contains('on'))closeMod();
 pubDraft=null;$('dw').classList.remove('dw-publish');
}
function pubSet(key,value){
 const d=pubDraft;if(!d)return;
 if(d.stage!=='settings'||!['account','mode','when'].includes(key))return;
 if(key==='account'&&!PUB_ACCOUNTS.some(x=>x.id===value&&x.status==='ready'))return;
 if(key==='mode'&&!['now','scheduled'].includes(value))return;
 d[key]=value;d.error='';
 if(key==='mode')pubPaint();
}
function pubValidation(d){
 if(!pubCurrentSource(d))return '内容、审批状态或操作权限已变化，请关闭后重新打开发布。';
 if(!d.snapshot.title.trim()||!d.snapshot.body.trim())return '标题或正文为空，请先完善内容并重新审批。';
 if(!d.snapshot.image)return '缺少可用的第一张图片，请先补充图片并重新审批。';
 if(!PUB_ACCOUNTS.some(x=>x.id===d.account&&x.status==='ready'))return '请选择可用的发布账号。';
 if(d.mode==='scheduled'){
  const when=pubScheduledTime(d.when),bounds=pubScheduleBounds();
  if(!Number.isFinite(when)||when<=Date.now()||when>bounds.maxTime)return '请选择当前时间起未来 10 天内的发布时间（东京时间 UTC+9）。';
 }
 return '';
}
function pubBack(){
 const d=pubDraft;if(!d||d.stage!=='failed')return;d.stage='settings';d.error='';pubPaint();
}
function pubTiming(d){return d.mode==='scheduled'?d.when.replace('T',' ')+'（东京时间 UTC+9）':'立即发布';}
function pubSubmit(){
 const d=pubDraft;if(!d||d.stage!=='settings')return;
 d.error=pubValidation(d);if(d.error){d.stage='settings';pubPaint();return;}
 // Double clicks and returning to an already completed version cannot send twice.
 if(PUB_RECORDS.some(r=>r.aid===d.aid&&r.index===d.index&&r.fingerprint===d.fingerprint&&r.account===d.account&&pubRecordStatus(r)!=='cancelled')){
  d.error='这个版本已发布或已加入排期，无需重复提交。';d.stage='settings';pubPaint();return;
 }
 const publisherId=currentUser(),member=typeof permissionCurrentMember==='function'?permissionCurrentMember():null;
 d.publisherId=publisherId;d.publisherName=String((member?.id===publisherId?member.name:null)||U[publisherId]?.n||publisherId||'未记录');
 d.stage='running';pubPaint();
 d.timer=setTimeout(()=>{
  if(pubDraft!==d||!$('dw').classList.contains('on')||!$('dw').classList.contains('dw-publish'))return;
  d.error=pubValidation(d);if(d.error){d.stage='failed';pubPaint();return;}
  const account=PUB_ACCOUNTS.find(x=>x.id===d.account);
  const record={id:'PUB-'+String(++pubSerial).padStart(4,'0'),aid:d.aid,index:d.index,fingerprint:d.fingerprint,account:d.account,accountName:account.name,publisherId:d.publisherId,publisherName:d.publisherName,title:d.snapshot.title,version:d.snapshot.version,mode:d.mode,status:d.mode==='scheduled'?'scheduled':'published',snapshot:{...d.snapshot,tags:[...d.snapshot.tags]},when:d.mode==='scheduled'?d.when:null,created:new Date().toISOString(),events:[]};
  PUB_RECORDS.push(record);d.result=record;d.stage='detail';render();pubPaint();
 },1100);
}
function pubFail(){
 const d=pubDraft;if(!d||d.stage!=='running')return;clearTimeout(d.timer);d.stage='failed';d.error='平台暂时未响应，发布未完成。请返回设置后重试。';pubPaint();
}
function pubOpenRecord(id){
 const d=pubDraft;if(!d||d.stage==='running'||!pubCanAccess(pubSource(d.aid,d.index)))return;
 const record=PUB_RECORDS.find(r=>r.id===id&&r.aid===d.aid&&r.index===d.index);if(!record)return;
 d.result=record;d.snapshot=record.snapshot||d.snapshot;d.fingerprint=record.fingerprint;d.account=record.account;d.mode=record.mode;d.when=record.when;d.stage='detail';d.records=false;d.error='';pubPaint();
}
function pubDetailHTML(d){
 const r=d.result,status=pubRecordStatus(r);
 return '<section class="pub-section pub-detail"><div class="pub-detail-status '+status+'"><span>'+pubRecordLabel(r)+'</span><h4>'+(status==='scheduled'?'内容已安排发布':status==='cancelled'?'定时发布已取消':'内容已发布')+'</h4><p>'+(status==='scheduled'?'如需修改内容、调整发布时间或取消定时发布，请前往小红书平台后台操作。':status==='cancelled'?'定时发布已取消，后续操作请前往小红书平台后台处理。':'如需修改或删除已发布内容，请前往小红书平台后台操作。')+'</p></div>'+pubSummary(d)+'<dl class="pub-kv"><div><dt>发布账号</dt><dd>'+pubEsc(r.accountName)+'</dd></div><div><dt>'+(r.mode==='scheduled'?'计划时间':'发布时间')+'</dt><dd>'+pubEsc(r.mode==='scheduled'?r.when.replace('T',' '):pubTime(r.created))+'（东京时间 UTC+9）</dd></div><div><dt>内容版本</dt><dd>v'+pubEsc(r.version)+'</dd></div><div><dt>发布单号</dt><dd>'+pubEsc(r.id)+'</dd></div><div><dt>发布者</dt><dd>'+pubEsc(r.publisherName||'未记录')+'</dd></div>'+(r.cancelledAt?'<div><dt>取消时间</dt><dd>'+pubEsc(pubTime(r.cancelledAt))+'</dd></div>':'')+'</dl></section>';
}
function pubShowRecords(on){
 if(!pubDraft||pubDraft.stage==='running')return;
 pubDraft.records=on;pubPaint();
}
function pubSummary(d){
 const p=d.snapshot;
 return '<button type="button" class="pub-content-summary" id="pub-preview-button" onclick="pubOpenPreview()"><img src="'+pubEsc(p.image)+'" alt="第一张图片"><span><b>'+pubEsc(p.title)+'</b><small>已批准 · v'+pubEsc(p.version)+' · 小红书图文</small><em>预览发布效果 ↗</em></span></button>';
}
function pubSettings(d){
 const bounds=pubScheduleBounds();
 return '<section class="pub-section"><div class="pub-section-head"><h4>发布内容</h4><span>使用已批准版本，不改动原稿</span></div>'+pubSummary(d)+'</section>'+
 '<section class="pub-section"><h4>发布账号</h4><label class="pub-field" for="pub-account">小红书账号<select id="pub-account" onchange="pubSet(\'account\',this.value)">'+PUB_ACCOUNTS.map(a=>'<option value="'+a.id+'" '+(d.account===a.id?'selected ':'')+(a.status!=='ready'?'disabled':'')+'>'+pubEsc(a.name)+(a.status!=='ready'?' · 授权失效':' · 可用')+'</option>').join('')+'</select></label></section>'+
 '<section class="pub-section"><h4>发布时间</h4><div class="pub-modes">'+[['now','立即发布','准备好后立即发布'],['scheduled','定时发布','选择一个未来时间']].map(([key,label,help])=>'<label class="'+(d.mode===key?'selected':'')+'"><input type="radio" name="pub-mode" value="'+key+'" '+(d.mode===key?'checked':'')+' onchange="pubSet(\'mode\',this.value)"><span><b>'+label+'</b><small>'+help+'</small></span></label>').join('')+'</div>'+
 (d.mode==='scheduled'?'<label class="pub-field pub-date" for="pub-when">发布时间 · 东京时间（UTC+9）<input type="datetime-local" id="pub-when" min="'+bounds.min+'" max="'+bounds.max+'" onfocus="pubRefreshScheduleBounds()" value="'+pubEsc(d.when)+'" onchange="pubSet(\'when\',this.value)"></label><p class="pub-help">仅可选择当前时间起未来 10 天内的时间。</p>':'')+'</section>';
}
function pubRecordsHTML(d){
 const records=PUB_RECORDS.filter(x=>x.aid===d.aid).slice().reverse();
 return '<div class="pub-records"><h4>发布记录 <span>'+records.length+'</span></h4>'+(!records.length?'<div class="pub-empty">暂无发布记录<br><small>发布或创建排期后，记录会显示在这里。</small></div>':records.map(r=>'<article><div><b>'+pubEsc(r.title)+'</b><span class="pub-record-state">'+pubRecordLabel(r)+'</span></div><p>'+pubEsc(r.accountName)+' · v'+pubEsc(r.version)+'</p><p>'+pubEsc(r.mode==='scheduled'?'排期：'+r.when.replace('T',' '):'完成：'+pubTime(r.created))+' · 东京时间</p><small>'+r.id+'</small>'+((r.events||[]).map(e=>'<p class="pub-help">'+pubEsc(e.action)+' · '+pubEsc(pubTime(e.at))+(e.when?' · '+pubEsc(e.when.replace('T',' ')):'')+'</p>').join(''))+'<button class="btn ghost sm" onclick="pubOpenRecord('+pubEsc(JSON.stringify(r.id))+')">查看详情</button></article>').join(''))+'</div>';
}
function pubPaint(){
 const d=pubDraft;if(!d)return;
 let body='',footer='';
 if(d.records){body=pubRecordsHTML(d);footer='<button class="btn ghost" onclick="pubShowRecords(false)">'+(d.result?'返回发布详情':'返回发布设置')+'</button>';}
 else if(d.stage==='settings'){body=pubSettings(d);footer='<button class="btn ghost" onclick="closeDw()">取消</button><button class="btn" onclick="pubSubmit()">'+(d.mode==='scheduled'?'定时发布':'发布')+'</button>';}
 else if(d.stage==='running'){body='<div class="pub-outcome" role="status" aria-live="polite"><span class="pub-loading"></span><h4>'+(d.mode==='scheduled'?'正在创建排期':'正在发布')+'</h4><p>正在核对账号与内容版本，请稍候…</p></div>';footer='<button class="btn ghost" onclick="closeDw()">取消发布</button><button class="btn" disabled>处理中…</button>';}
 else if(d.stage==='failed'){body='<div class="pub-outcome"><span class="pub-result-symbol failed">!</span><h4>发布未完成</h4></div>';footer='<button class="btn ghost" onclick="closeDw()">关闭</button><button class="btn" onclick="pubBack()">返回设置，重试</button>';}
 else if(d.stage==='detail'){body=pubDetailHTML(d);footer='<button class="btn ghost" onclick="closeDw()">关闭</button>';}
 const step=d.stage==='settings'?0:1,detail=!!d.result;
 $('dw').innerHTML='<div class="dw-h"><button class="ib" onclick="closeDw()" aria-label="关闭发布抽屉">×</button><div style="flex:1;min-width:0"><div class="ty">内容发布 · 小红书</div><h3>'+pubEsc(d.snapshot.title)+'</h3></div></div>'+
 '<div class="pub-tabs"><button type="button" class="'+(!d.records?'on':'')+'" aria-pressed="'+!d.records+'" onclick="pubShowRecords(false)" '+(d.stage==='running'?'disabled':'')+'>'+(detail?(pubRecordStatus(d.result)==='scheduled'?'排期详情':'发布详情'):'发布内容')+'</button></div>'+
 '<div class="dw-b pub-body">'+(!d.records&&!detail?'<ol class="pub-steps">'+['发布设置','发布结果'].map((name,i)=>'<li class="'+(i===step?'current':i<step?'complete':'')+'"><span>'+(i<step?'✓':i+1)+'</span>'+name+'</li>').join('')+'</ol>':'')+body+(d.error?'<p class="pub-error" role="alert">'+pubEsc(d.error)+'</p>':'')+'</div><div class="dw-f">'+footer+'</div>';
 syncDrawerExpandControl();
}
function pubOpenPreview(){
 const d=pubDraft;if(!d||d.stage==='running')return;
 const p=d.snapshot,account=PUB_ACCOUNTS.find(x=>x.id===d.account);
 d.preview=true;d.previewFocus=document.activeElement;
 $('mod').innerHTML='<section class="mbox pub-preview" role="dialog" aria-modal="true" aria-labelledby="pub-preview-title"><div class="pub-preview-head"><div><h3 id="pub-preview-title">预览发布效果</h3><p>小红书 · 图文阅读预览</p></div><button class="ib" onclick="closeMod()" aria-label="关闭发布预览">×</button></div><div class="pub-preview-stage"><article class="pub-note"><div class="pub-note-author"><span>A8</span><div><b>'+pubEsc(account?.handle||'品牌账号')+'</b><small>小红书 · 图文</small></div></div>'+
 (p.image?'<img class="pub-note-cover" src="'+pubEsc(p.image)+'" alt="发布内容的第一张图片">':'<div class="pub-no-cover">尚未设置第一张图片</div>')+
 '<div class="pub-note-copy"><h2>'+pubEsc(p.title)+'</h2><div class="pub-note-body">'+pubEsc(p.body)+'</div><div class="pub-note-tags" aria-label="内容标签">'+(p.tags.length?p.tags.map(tag=>'<span>#'+pubEsc(tag)+'</span>').join(''):'<span class="pub-no-tags">暂未设置标签</span>')+'</div></div></article></div><div class="pub-preview-footer"><button class="btn ghost" onclick="closeMod()">'+(d.result?'返回发布详情':'返回发布设置')+'</button><span>只读预览 · 不修改已批准内容</span></div></section>';
 $('mod').classList.add('on');document.querySelector('.pub-preview .ib')?.focus();
}
const pubOriginalCloseMod=closeMod;
closeMod=function(){const preview=pubDraft?.preview;pubOriginalCloseMod();if(preview&&pubDraft){pubDraft.preview=false;pubDraft.previewFocus?.focus();}};
const pubOriginalCloseDw=closeDw;
closeDw=function(){pubDispose();pubOriginalCloseDw();};
const pubOriginalOpenDw=openDw;
openDw=function(...args){pubDispose();return pubOriginalOpenDw(...args);};
document.addEventListener('keydown',event=>{
 if(!pubDraft)return;
 const preview=pubDraft.preview&&$('mod').classList.contains('on');
 if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();if(preview)closeMod();else closeDw();return;}
 if(event.key!=='Tab')return;
 const root=preview?document.querySelector('.pub-preview'):$('dw');
 if(!root)return;const items=[...root.querySelectorAll('button:not(:disabled),select:not(:disabled),input:not(:disabled)')].filter(x=>x.getClientRects().length);
 const first=items[0],last=items.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
},true);
