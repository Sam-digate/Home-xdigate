/* Brand updates prototype: session-only records, no API writes. */
const BU_RECOMMEND_DURATION=1600;
const BU_CATEGORIES=[['sales','销售','Sales'],['product','产品','Product'],['price','价格','Price'],['stock','库存','Inventory'],['demand','客户需求','Customer needs'],['issue','问题','Issues'],['campaign','活动','Campaigns'],['competitor','竞品','Competitors'],['people','人员','People'],['other','其他','Other']];
const BU_TYPES=[['rule','规则','Rule'],['background','背景','Background'],['fact','事实','Fact']];
const BU_RECORDS=[];
const buText=(zh,en)=>typeof LANG!=='undefined'&&LANG==='en'?en:zh;
const buLang=value=>typeof value==='object'?buText(value.zh,value.en):value;
const buActor=()=>U[currentUser()]?.n||currentUser();
function buToday(){return new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Tokyo'});}
function buRecordType(record){return record.type||(record.expires?'background':'fact');}
function buTypeLabel(record){const [,zh,en]=BU_TYPES.find(([key])=>key===buRecordType(record));return buText(zh,en);}
function buIsExpired(record,today=buToday()){return buRecordType(record)==='background'&&Boolean(record.expires&&record.expires<today);}
function buCardLabel(entry){const key=entry.id.match(/k\d+$/)?.[0];return buText(entry.n,({k1:'Brand overview',k2:'Core positioning',k3:'Restricted terms',k4:'Audience insights',k5:'Brand expression',k6:'Competitor analysis',k7:'Product value',k8:'Brand positioning'})[key]||entry.n);}
function buSlackDemoSources(brandId, index, date, speaker, text, extra){
 const baseUrl='https://example.com/brand-updates/'+brandId+'/';
 const channel=['channel-ops','customer-feedback','channel-ops','warehouse','market-watch','campaigns','campaigns','campaigns','campaigns'][index];
 const messages=[
  {speaker:speaker==='Sophie'?'Ariel':'Sophie',time:'10:10',text:index===0
   ?{zh:'11 月渠道复盘结束了吗？下一轮准备怎么跟踪各店铺的表现？',en:'Is the November channel review complete? How will we track each store next time?'}
   :{zh:'把这条更新留在线程里吧，方便大家回看原话。',en:'Please leave the update in this thread so the team can refer to the original message.'}},
  {speaker,time:'10:14',text,quoted:true}
 ];
 if(index===0)messages.push({speaker:'Ariel',time:'10:18',text:{zh:'收到。我会把退货原因也记在对应店铺下，方便下次复盘核对。',en:'Got it. I’ll record return reasons under each store so we can review them next time.'}});
 const sources=[{url:baseUrl+index,slack:{channel,date,messages}}];
 if(extra)sources.push({url:baseUrl+'review',slack:{channel:'sales-review',date,messages:[
  {speaker:'Ariel',time:'14:21',text:{zh:'退货数据要不要合在一起看？',en:'Should we roll up the return data across stores?'}},
  {speaker:'Sophie',time:'14:25',text:{zh:'先按店铺分别记录销售和退货，出现异常再对照退货原因。',en:'Track sales and returns separately by store, then check return reasons when anything looks unusual.'},quoted:true}
 ]}});
 return sources;
}
function buInit(){
 if(!KNOWLEDGE_BRANDS.some(b=>b.id==='tn'))KNOWLEDGE_BRANDS.push({id:'tn',name:'Tru Niagen',short:'TN',kind:'project',status:'active',entries:makeSubBrandKnowledge('tn','Tru Niagen',4)});
 if(typeof DICT!=='undefined')DICT['品牌动态']='Brand updates';
 if(BU_RECORDS.length)return;
 const titles=[
  {zh:'11 月渠道复盘完成，分店铺跟踪销售与退货',en:'November channel review complete, with sales and returns tracked by store'},
  {zh:'客户频繁询问使用时间和产品规格',en:'Customers frequently ask about usage timing and pack sizes'},
  {zh:'渠道预计 11 月 26 日补货，待仓库确认',en:'Channel team expects a November 26 restock, pending warehouse confirmation'},
  {zh:'仓库周报的补货日期与渠道排期不一致',en:'Warehouse restock date differs from the channel schedule'},
  {zh:'竞品增加组合装展示，促销意图尚未核实',en:'Competitor features more bundles, with promotion plans unconfirmed'},
  {zh:'活动折扣以新版简报为准',en:'Updated campaign brief replaces earlier discount wording'}
 ];
 const seeds=[
  ['sales','2026-11-23','Kai','agent','direct','11 月渠道复盘已完成，后续将分店铺记录销售表现和退货变化，并结合退货原因核对异常波动。这些变化将作为下一轮渠道复盘的参考。','The November channel review is complete. Track sales and returns by store, and review the reasons behind unusual changes in returns. Use these findings in the next channel review.',{extra:true,type:'background',expires:'2026-11-30'}],
  ['demand','2026-11-23','Vera','agent','direct','客户咨询中多次出现服用时间与产品规格问题，建议补充到常见问题资料。','Customers repeatedly asked about usage timing and pack sizes. Consider adding these topics to the FAQ.',{suggested:true}],
  ['stock','2026-11-23','Dave','agent','hearsay','渠道团队转述：主推规格预计在 11 月 26 日补货，需等待仓库确认。','The channel team reports a restock on November 26, pending warehouse confirmation.',{conflictGroup:'november-restock',type:'background',expires:'2026-11-30'}],
  ['stock','2026-11-21','Otis','agent','direct','仓库周报记录主推规格预计在 11 月 28 日补货，与渠道排期存在差异。','The warehouse report lists a November 28 restock, which differs from the channel schedule.',{conflictGroup:'november-restock',type:'background',expires:'2026-11-30'}],
  ['competitor','2026-11-20','Neil','agent','speculation','竞品近期增加组合装露出，可能在测试新的促销组合，尚未得到官方确认。','A competitor is featuring more bundles and may be testing a promotion. This is not officially confirmed.',{}],
  ['price','2026-11-19','Sophie','human','direct','本次活动不再使用早期拟定的折扣口径，以更新后的活动简报为准。','The earlier discount wording is superseded by the updated campaign brief.',{type:'rule'}],
  ['price','2026-11-18','Ariel','human','hearsay','早期排期曾考虑增加折扣，具体优惠尚待确认。','An earlier plan considered an additional discount, pending confirmation.',{correctedIndex:5}],
  ['campaign','2026-11-10','Kai','agent','direct','活动预热期间优先使用已审核的产品资料，背景安排有效至 11 月 15 日。','Use reviewed product materials during the warm-up campaign. This context expires on November 15.',{type:'background',expires:'2026-11-15'}],
  ['campaign','2026-11-22','Sophie','human','direct','11 月末活动期间，店铺首页和渠道推广优先展示节日礼盒，并使用已审核的礼盒素材。活动结束后恢复日常陈列。','During the end-of-November campaign, feature holiday gift sets on storefronts and in channel promotions using approved assets. Restore the standard display after the campaign.',{type:'background',expires:'2026-11-30'}]
 ];
 const [channelReview,customerNeeds,...otherSeeds]=seeds.entries();
 for(const brand of KNOWLEDGE_BRANDS.filter(b=>['tn','a8oparis'].includes(b.id))){
  for(const [index,[category,date,author,writer,confidence,zh,en,extra]] of [customerNeeds,channelReview,...otherSeeds]){
   const id='bu-'+brand.id+'-'+index;
   BU_RECORDS.push({id,brandId:brand.id,date,category,title:titles[index],text:{zh,en},author,owner:writer==='human'?(author==='Sophie'?'so':'ar'):null,writer,sponsor:writer==='agent'?'Sophie':null,confidence,type:extra.type||'fact',suggested:!!extra.suggested,expires:extra.expires,conflictGroup:extra.conflictGroup,correctedBy:extra.correctedIndex!==undefined?'bu-'+brand.id+'-'+extra.correctedIndex:null,sources:buSlackDemoSources(brand.id,index,date,writer==='agent'&&index===0?'Sophie':author,{zh,en},extra.extra),history:[{at:date,actor:author,action:'created'},...(extra.conflictGroup?[{at:date,actor:'Vera',action:'conflict'}]:[]),...(extra.correctedIndex!==undefined?[{at:'2026-11-19',actor:'Sophie',action:'corrected'}]:[])]});
  }
 }
}
function buState(){
 S.brandUpdates=S.brandUpdates||{};
 const id=knowledgeActiveBrand().id;
 return S.brandUpdates[id]||(S.brandUpdates[id]={days:'30',type:'all',categories:BU_CATEGORIES.map(([key])=>key),status:'all',writer:'all',query:'',expired:false,selected:[]});
}
function buAccess(){return permissionHasPage('know.src')&&knowledgeActiveBrand().status!=='disabled';}
function buRows(){return BU_RECORDS.filter(r=>r.brandId===knowledgeActiveBrand().id&&!r.deletedAt);}
function buFind(id){return buAccess()?buRows().find(r=>r.id===id):null;}
function buCanDelete(record){return !!record&&buAccess()&&((record.writer==='human'&&record.owner===currentUser())||permissionCurrentMember()?.role==='admin');}
function buCanEdit(record){return buCanDelete(record)&&!record.correctedBy;}
function buHasCorrectedUpdates(ids){return ids.some(id=>BU_RECORDS.some(record=>record.id===id&&record.correctedBy));}
function buHasBackgroundUpdates(ids){return BU_RECORDS.some(record=>ids.includes(record.id)&&buRecordType(record)==='background');}
function buOriginalText(record){const text=esc(buLang(record.text));return record.correctedBy?`<s>${text}</s>`:text;}
function buLog(record,action,detail=''){record.history.push({at:new Date().toISOString(),actor:buActor(),action,detail});}
function buStatus(record){
 if(record.suggestion){
  const target=knowledgeBrandEntries().find(e=>e.id===record.suggestion.target);
  if(target?.pendingUpdate?.brandUpdateIds?.includes(record.id))return 'pending';
  if(target?.updateReviews?.some(review=>review.brandUpdateIds?.includes(record.id)&&review.decision==='approved'))return 'stored';
 }
 return record.suggested?'suggested':'';
}
function buPromotionBlock(records){
 if(records.some(record=>record?.correctedBy))return buText('已被更正的动态不能存入知识库','Corrected updates cannot be saved to the knowledge base');
 if(records.some(record=>record&&buRecordType(record)==='background'))return buText('背景类动态不能存入知识库','Background updates cannot be saved to the knowledge base');
 if(records.some(record=>record&&['pending','stored'].includes(buStatus(record))))return buText('所选动态中已有待审核或已入库的条目','Some selected updates are already pending review or in the knowledge base');
 return '';
}
function buVisible(){
 const today=buToday(),f=buState(),cutoff=new Date(today+'T12:00:00Z');cutoff.setUTCDate(cutoff.getUTCDate()-Number(f.days));
 return buRows().filter(r=>(f.expired||!buIsExpired(r,today))&&(f.type==='all'||buRecordType(r)===f.type)&&(f.days==='all'||r.date>=cutoff.toISOString().slice(0,10))&&f.categories.includes(r.category)&&(f.status==='all'||(f.status==='conflict'?buConflictRecords(r).length>1:buStatus(r)===f.status))&&(f.writer==='all'||r.writer===f.writer)&&(!f.query||[buRecordTitle(r),buLang(r.text),r.author,r.sponsor,...r.sources.map(x=>x.url)].join(' ').toLowerCase().includes(f.query.toLowerCase()))).sort((a,b)=>b.date.localeCompare(a.date));
}
function buFilter(key,value){if(!buAccess())return;buState()[key]=value;buState().selected=[];render();}
function buCategory(value,on){const f=buState();f.categoryOpen=true;buFilter('categories',on?[...new Set([...f.categories,value])]:f.categories.filter(v=>v!==value));}
function buSetAllCategories(checked){
 buState().categoryOpen=true;
 buFilter('categories',checked?BU_CATEGORIES.map(([key])=>key):[]);
}
function buCategoryMenuToggled(menu){
 if(!menu.isConnected)return;
 const state=buState();
 state.categoryOpen=menu.open;
 const count=state.categories.length;
 menu.querySelector('.bu-category-all input').indeterminate=count>0&&count<BU_CATEGORIES.length;
}
document.addEventListener('pointerdown',event=>{
 const menu=document.querySelector('.bu-category-filter[open]');
 if(!menu||menu.contains(event.target))return;
 buState().categoryOpen=false;
 menu.open=false;
},true);
function buSearch(input){const cursor=input.selectionStart;buFilter('query',input.value);const next=$('bu-search');next?.focus();next?.setSelectionRange?.(cursor,cursor);}
function buSelect(id,selected){if(!buFind(id))return;const f=buState();f.selected=selected?[...new Set([...f.selected,id])]:f.selected.filter(x=>x!==id);render();}
function buSelectAll(selected){
 if(!buAccess())return;
 buState().selected=selected?buVisible().map(record=>record.id):[];
 render();
}
function buSelectionHTML(rows, selected){
 if(!rows.length||!selected.length)return '';
 const allSelected=rows.every(record=>selected.includes(record.id));
 const records=selected.map(buFind);
 const canDelete=records.every(buCanDelete);
 const blocked=buPromotionBlock(records);
 return `<div class="bu-selection">
  <label class="bu-select-all"><input type="checkbox" ${allSelected?'checked':''} onchange="buSelectAll(this.checked)">${buText('全选','Select all')}</label>
  <b>${buText('已选','Selected')} ${selected.length}</b>
  <button type="button" class="btn sm bu-promote-btn" onclick="buPromotePrompt()" ${blocked?`disabled title="${esc(blocked)}"`:''}>${buText('加入知识库','Add to knowledge')}</button>
  <button type="button" class="btn ghost sm bu-delete-btn" onclick="buDeletePrompt()" ${canDelete?'':`disabled title="${buText('所选动态中包含无权删除的条目','Some selected updates cannot be deleted')}"`}>${buText('删除所选','Delete selected')}</button>
  <button type="button" class="btn ghost sm" onclick="buSelectAll(false)">${buText('取消选择','Clear selection')}</button>
 </div>`;
}
function buConfidence(record){return ({direct:buText('明确说过','Direct statement'),hearsay:buText('转述','Second-hand'),speculation:buText('推测 · 未核实','Inference · Unverified')})[record.confidence];}
function buStatusHTML(record){
 const status=buStatus(record),labels={suggested:buText('Vera 建议入库','Vera recommends adding'),pending:buText('入库待审核','Pending knowledge review'),stored:buText('已入库','Added to knowledge')};
 const showProposal=status&&!(status==='suggested'&&(record.correctedBy||buRecordType(record)==='background'));
 const conflictStatus=buConflictRecords(record).length>1?`<span class="chip bu-conflict">${buText('有冲突','Conflict')}</span>`:record.history.some(event=>event.action==='resolved')?`<span class="chip bu-stored">${buText('以此为准','Confirmed')}</span>`:'';
 return `${conflictStatus}${showProposal?`<button class="${status==='pending'?'kb-update-badge':'chip bu-stored'}" onclick="${status==='suggested'?`buPromotePrompt(['${record.id}'])`:`buOpenSuggestion('${record.id}')`}">${labels[status]}</button>`:''}`;
}
function buSourceHTML(source,index,action=''){
 const slack=source.slack;
 if(slack){
  const linkLabel=buText('打开示例来源','Open demo source');
  return `<div class="kb-update-source bu-detail-source">
   <div class="kb-source-line bu-conflict-heading"><b>Slack · #${esc(slack.channel)}</b><time datetime="${esc(slack.date)}">${esc(slack.date)}</time>${action}</div>
   <div class="kb-source-links">
    <a class="kb-source-link" href="${esc(source.url)}" target="_blank" rel="noopener noreferrer" title="${linkLabel}">${buText('打开来源','Open source')}</a>
    <button type="button" class="kb-source-more-toggle" aria-expanded="true" onclick="kbToggleSourceMore(this)">
     <span class="kb-more-closed">${buText('查看消息上下文','View thread context')} · ${slack.messages.length}</span>
     <span class="kb-more-open">${buText('收起消息上下文','Collapse thread context')} · ${slack.messages.length}</span>
     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
    </button>
   </div>
   <div class="kb-update-source-content bu-slack-thread"><ol>${slack.messages.map(message=>`<li class="${message.quoted?'bu-slack-quoted':''}"><div class="bu-slack-header"><b>${esc(message.speaker)}</b><time datetime="${esc(slack.date+'T'+message.time)}">${esc(message.time)}</time></div><p>${esc(buLang(message.text))}</p></li>`).join('')}</ol></div>
  </div>`;
 }
 return `<div class="kb-update-source bu-detail-source"><div class="kb-source-line bu-conflict-heading"><span>${buText('来源','Source')} ${index+1}</span><span>${esc(new URL(source.url).hostname)}</span>${action}</div><div class="kb-source-links"><a class="kb-source-link" href="${esc(source.url)}" title="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${buText('打开来源','Open source')}</a></div></div>`;
}
function buSourcesHTML(record){return `<details class="bu-sources" open><summary>${record.sources.length} ${buText('个来源','sources')}</summary><div>${record.sources.map((source,index)=>buSourceHTML(source,index)).join('')}</div></details>`;}
function buHistoryHTML(record){
 const actions={created:buText('创建动态','Created update'),edited:buText('编辑动态','Edited update'),merged:buText('合并来源','Merged sources'),promoted:buText('提交入库审核','Submitted for knowledge review'),deleted:buText('删除动态','Deleted update'),conflict:buText('标记冲突','Flagged conflict'),resolved:buText('确认以此条为准','Confirmed as authoritative'),corrected:buText('标记更正','Marked as corrected'),approved:buText('批准入库','Approved knowledge update'),ignored:buText('忽略建议','Dismissed proposal')};
 const target=record.suggestion&&knowledgeBrandEntries().find(e=>e.id===record.suggestion.target);
 const history=[...record.history,...(target?.updateReviews||[]).filter(review=>review.brandUpdateIds?.includes(record.id)).map(review=>({at:review.approvedAt||review.ignoredAt||review.rejectedAt,actor:review.reviewer,action:review.decision==='approved'?'approved':'ignored'}))];
 const isVersion=event=>event.action==='created'||event.action==='edited';
 const latest=history.filter(isVersion).length;
 let version=latest;
 let versionText=buLang(record.text);
 const entries=history.reverse().map(event=>{
  const versionEvent=isVersion(event);
  const label=[actions[event.action]||event.action,event.actor];
  let content='';
  let badge='';
  if(versionEvent){
   badge=`<span class="vv">v${version}</span>`;
   if(version===latest)label.unshift(buText('当前版本','Current version'));
   content=versionText;
   if(event.action==='edited')versionText=event.before?.text?buLang(event.before.text):event.detail;
   version--;
  }else if(event.target){
   const entry=knowledgeBrandEntries().find(card=>card.id===event.target);
   label.push(entry?buCardLabel(entry):event.target);
  }else{
   content=event.detail;
  }
  const time=event.at?`<time class="vd" datetime="${esc(event.at)}">${esc(kbHistoryTime(event.at))}</time>`:'';
  const arrow=content?'<svg class="bu-history-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>':'';
  const row=`${badge}<span class="vt">${esc(label.filter(Boolean).join(' · '))}${arrow}</span>${time}`;
  return content?`<details><summary class="vrow">${row}</summary><p class="bu-history-copy">${esc(content)}</p></details>`:`<div class="vrow">${row}</div>`;
 });
 return `<div class="bu-history">${entries.join('')}</div>`;
}
function buConflictRecords(record){
 if(!record?.conflictGroup)return [];
 return buRows().filter(candidate=>candidate.conflictGroup===record.conflictGroup&&!candidate.correctedBy);
}
function buConflictAction(record,group){
 const args=esc(JSON.stringify([record.id,group.map(candidate=>candidate.id)]));
 return `<button type="button" class="btn ghost sm" onclick="buResolveConflictPrompt(...${args})">${buText('以此为准','Use this update')}</button>`;
}
function buRelatedConflictHTML(record, group, canResolve){
 const other=group.find(candidate=>candidate.id!==record.id);
 return `<section class="bu-related-conflict" aria-labelledby="bu-conflict-title">
  <h4 id="bu-conflict-title">${buText('冲突条目','Conflicting update')}</h4>
  <div class="bu-conflict-card"><div class="bu-conflict-heading"><b>${esc(buRecordTitle(other))}</b>${canResolve?buConflictAction(other,group):''}</div>
   <div class="bu-meta">${esc(other.date)} · ${esc(other.author)} · ${buConfidence(other)}</div>
   <p class="bu-body">${esc(buLang(other.text))}</p>
   <div class="bu-detail-sources">${other.sources.map((source,index)=>buSourceHTML(source,index)).join('')}</div>
  </div>
 </section>`;
}
function buConflictDecision(winnerId, expectedIds){
 const winner=buFind(winnerId);
 const records=buConflictRecords(winner);
 if(records.length<2||records.length!==expectedIds.length||!records.every(record=>expectedIds.includes(record.id)&&buCanEdit(record)))return;
 return {winner,others:records.filter(record=>record!==winner)};
}
function buResolveConflictPrompt(winnerId, expectedIds){
 const decision=buConflictDecision(winnerId,expectedIds);
 if(!decision)return;
 const title=buText('确认采用这条动态？','Confirm the selected update?');
 const count=decision.others.length;
 const note=buText(`其余 ${count} 条将标为「已被更正」，原文和来源都会保留。`,`${count} other ${count===1?'update will':'updates will'} be marked as corrected. Their original text and sources will be kept.`);
 const args=esc(JSON.stringify([winnerId,expectedIds]));
 kpDialog(title,`<p><b>${esc(buRecordTitle(decision.winner))}</b></p><p>${note}</p>`,`<button type="button" class="btn ghost" onclick="closeMod()">${buText('取消','Cancel')}</button><button type="button" class="btn" onclick="buResolveConflict(...${args})">${buText('确认','Confirm')}</button>`);
}
function buResolveConflict(winnerId, expectedIds){
 const decision=buConflictDecision(winnerId,expectedIds);
 if(!decision){closeMod();toast(buText('冲突条目已变化，请重新打开详情核对。','These conflicting updates changed. Reopen the details to review them.'));return;}
 const {winner,others}=decision;
 buLog(winner,'resolved',others.map(buRecordTitle).join('\n'));
 winner.conflictGroup=null;
 for(const previous of others){
  previous.conflictGroup=null;
  previous.correctedBy=winner.id;
  buLog(previous,'corrected',buRecordTitle(winner));
 }
 const visibleIds=new Set(buVisible().map(record=>record.id));
 buState().selected=buState().selected.filter(id=>visibleIds.has(id));
 closeMod();render();buOpenDetails(winner.id);
 toast(buText('已确认采用的动态','Authoritative update confirmed'));
}
function buOpenDetails(id, tab='details'){
 const record=buFind(id);
 if(!record)return;
 if(buHandleClose())return;
 const drawer=$('dw');
 if(!drawer.querySelector('.bu-detail-drawer'))closeDw();
 const tabs=[['details',buText('详情','Details')],['versions',buText('版本','Versions')]];
 const group=buConflictRecords(record);
 const canResolve=group.length===2&&group.every(buCanEdit);
 const details=record.correctedBy?buCorrectionHTML(record):`<p class="bu-body bu-detail-body">${buOriginalText(record)}</p>${buReadonlyMetadata(record,canResolve?buConflictAction(record,group):'')}${group.length===2?buRelatedConflictHTML(record,group,canResolve):''}`;
 const hasProposal=['pending','stored'].includes(buStatus(record));
 const isBackground=buRecordType(record)==='background';
 drawer.innerHTML=`<section class="bu-editor bu-detail-drawer" data-record-id="${esc(record.id)}" data-tab="${esc(tab)}" role="dialog" aria-modal="true" aria-labelledby="bu-detail-title" data-i18n-skip>
  <header class="dw-h"><button class="ib" aria-label="${buText('关闭','Close')}" onclick="closeDw()"><i data-lucide="x" aria-hidden="true"></i></button><div><div class="ty">${esc(knowledgeActiveBrand().name)}</div><h3 id="bu-detail-title">${esc(buRecordTitle(record))}</h3></div></header>
  <div class="dw-tabs" role="group" aria-label="${buText('动态视图','Update views')}">${tabs.map(([key,label])=>`<button type="button" class="${tab===key?'on':''}" aria-pressed="${tab===key}" onclick="buOpenDetails('${record.id}','${key}')">${label}</button>`).join('')}</div>
  <div class="dw-b">${tab==='versions'?buHistoryHTML(record):details}</div>
  <footer class="dw-f">
   ${hasProposal?`<button type="button" class="btn ghost" onclick="buOpenSuggestion('${record.id}')">${buText('查看入库建议','View knowledge proposal')}</button>`:record.correctedBy?'':isBackground?`<button type="button" class="btn bu-promote-btn" disabled title="${esc(buPromotionBlock([record]))}">${buText('存入知识库','Save to knowledge base')}</button>`:`<button type="button" class="btn" onclick="buPromotePrompt(['${record.id}'])">${buText('存入知识库','Save to knowledge base')}</button>`}
   ${buCanEdit(record)?`<button type="button" class="btn ghost" onclick="buOpenEditor('${record.id}')">${buText('编辑','Edit')}</button>`:''}
   ${buCanDelete(record)?`<button type="button" class="btn ghost bu-delete-btn" onclick="buDeletePrompt('${record.id}')">${buText('删除','Delete')}</button>`:''}
  </footer>
 </section>`;
 drawer.classList.add('on');$('scrim').classList.add('on');kpIcons();
 drawer.querySelector('.dw-tabs .on')?.focus();
}
function buRecordTitle(record){
 if(record.correctedBy)return buText('已更正的动态','Corrected update');
 if(record.title)return buLang(record.title);
 const text=buLang(record.text);
 const firstSentence=text.match(/^.+?(?=[。！？]|[.!?](?:\s|$)|\n|$)/u)?.[0]||text;
 const characters=Array.from(firstSentence);
 return characters.length>72?characters.slice(0,72).join('')+'…':firstSentence;
}
function buRecordHTML(record){
 const category=BU_CATEGORIES.find(c=>c[0]===record.category),expired=buIsExpired(record);
 const sourceCount=record.sources.length;
 const author=record.sponsor?`${record.author} · ${buText('代','for')} ${record.sponsor}`:record.author;
 const metadata=[author,buConfidence(record),buText(`${sourceCount} 个来源`,`${sourceCount} ${sourceCount===1?'source':'sources'}`)];
 const validity=record.expires?`<time class="chip ${expired?'mut':'dom'}" datetime="${esc(record.expires)}">${buText('有效至','Valid until')} ${esc(record.expires)}</time>`:'';
 const body=`<p class="bu-body">${buOriginalText(record)}</p><div class="bu-meta">${esc(metadata.join(' · '))}</div>`;
 return `<article class="bu-record ${expired?'bu-expired':''}"><div class="bu-record-top"><label class="bu-select"><input type="checkbox" aria-label="${buText('选择动态','Select update')} ${record.date}" ${buState().selected.includes(record.id)?'checked':''} onchange="buSelect('${record.id}',this.checked)"></label><h3 class="bu-record-title"><button type="button" onclick="buOpenDetails('${record.id}')">${esc(buRecordTitle(record))}</button></h3>${category?`<span class="chip dom">${buText(category[1],category[2])}</span>`:''}<span class="chip mut">${buTypeLabel(record)}</span>${validity}<div class="bu-badges">${buStatusHTML(record)}</div></div>${record.correctedBy?`<details class="bu-corrected"><summary>${buText('已被更正 · 展开原记录','Corrected · Show original')}</summary>${body}</details>`:body}</article>`;
}
function kBrandUpdates(){
 buInit();const f=buState(),rows=buVisible(),dates=[...new Set(rows.map(r=>r.date))];
 // TODO: Remove this demo notice before production launch.
 const intakeNote=`<p class="note bu-intake-note">${buText('仅事实和规则可提交入库审核，背景仅供参考。','Only facts and rules can be submitted for knowledge base review. Background updates are for reference.')}</p>`;
 return `<div class="brand-updates" data-i18n-skip><div class="bar bu-filters"><label class="kc-search"><i data-lucide="search" aria-hidden="true"></i><input id="bu-search" type="search" value="${esc(f.query)}" placeholder="${buText('搜索动态或来源','Search updates or sources')}" aria-label="${buText('搜索品牌动态','Search brand updates')}" oninput="if(!event.isComposing)buSearch(this)" oncompositionend="buSearch(this)"></label><select aria-label="${buText('时间范围','Date range')}" onchange="buFilter('days',this.value)">${[['7','近 7 天','Last 7 days'],['30','近 30 天','Last 30 days'],['90','近 90 天','Last 90 days'],['all','全部时间','All time']].map(([value,zh,en])=>`<option value="${value}" ${f.days===value?'selected':''}>${buText(zh,en)}</option>`).join('')}</select><select aria-label="${buText('动态类型','Update type')}" onchange="buFilter('type',this.value)"><option value="all">${buText('全部类型','All types')}</option>${BU_TYPES.map(([key,zh,en])=>`<option value="${key}" ${f.type===key?'selected':''}>${buText(zh,en)}</option>`).join('')}</select><details class="bu-category-filter" ${f.categoryOpen?'open':''} ontoggle="buCategoryMenuToggled(this)"><summary>${f.categories.length===BU_CATEGORIES.length?buText('全部分类','All categories'):buText('分类','Category')+' · '+f.categories.length}</summary><div><label class="bu-category-all"><input type="checkbox" ${f.categories.length===BU_CATEGORIES.length?'checked':''} onchange="buSetAllCategories(this.checked)">${buText('全部分类','All categories')}</label>${BU_CATEGORIES.map(([key,zh,en])=>`<label><input type="checkbox" ${f.categories.includes(key)?'checked':''} onchange="buCategory('${key}',this.checked)">${buText(zh,en)}</label>`).join('')}</div></details><select aria-label="${buText('动态状态','Update status')}" onchange="buFilter('status',this.value)">${[['all','全部状态','All statuses'],['conflict','有冲突','Conflicts'],['suggested','Vera 建议入库','Vera recommendations'],['pending','入库待审核','Pending knowledge review'],['stored','已入库','Added to knowledge']].map(([value,zh,en])=>`<option value="${value}" ${f.status===value?'selected':''}>${buText(zh,en)}</option>`).join('')}</select><select aria-label="${buText('写入者','Author type')}" onchange="buFilter('writer',this.value)">${[['all','全部写入者','All authors'],['agent','Agent','Agent'],['human','人','Human']].map(([value,zh,en])=>`<option value="${value}" ${f.writer===value?'selected':''}>${buText(zh,en)}</option>`).join('')}</select><label class="bu-expired-toggle"><input type="checkbox" ${f.expired?'checked':''} onchange="buFilter('expired',this.checked)">${buText('显示已到期','Show expired')}</label><span class="spacer"></span><button class="btn sm" onclick="buOpenEditor()"><i data-lucide="plus" aria-hidden="true"></i>${buText('新增一条','Add update')}</button></div>${intakeNote}${buSelectionHTML(rows,f.selected)}${dates.map(date=>`<section class="bu-date-group"><h2>${date}<span>${rows.filter(r=>r.date===date).length} ${buText('条','updates')}</span></h2>${rows.filter(r=>r.date===date).map(buRecordHTML).join('')}</section>`).join('')||`<div class="allclear">${buText('没有符合条件的品牌动态。','No brand updates match these filters.')}</div>`}</div>`;
}
function buReadonlyMetadata(record,sourceAction=''){
 const category=BU_CATEGORIES.find(c=>c[0]===record.category);
 const fields=[[buText('发生日期','Event date'),record.date],[buText('分类','Category'),category?buText(category[1],category[2]):record.category],[buText('类型','Type'),buTypeLabel(record)],[buText('信息性质','Statement type'),buConfidence(record)]];
 if(record.expires)fields.push([buText('有效至','Valid until'),record.expires]);
 return `<section class="bu-detail-meta">${fields.map(([label,value])=>`<div><span>${label}</span><span>${esc(value)}</span></div>`).join('')}</section><section class="bu-detail-sources"><b>${buText('来源','Sources')}</b>${record.sources.map((source,index)=>buSourceHTML(source,index,index===0?sourceAction:'')).join('')}</section>`;
}
function buEditorTypeFields(){
 return `<div class="bu-editor-grid">
  <div class="fld"><label for="bu-type">${buText('类型','Type')}</label><select id="bu-type" onchange="buSyncExpiryField()">${BU_TYPES.map(([key,zh,en])=>`<option value="${key}" ${key==='fact'?'selected':''}>${buText(zh,en)}</option>`).join('')}</select></div>
  <div id="bu-expiry-field" class="fld" hidden><label for="bu-expiry">${buText('有效至','Valid until')}</label><input id="bu-expiry" type="date" disabled></div>
 </div>`;
}
function buSyncExpiryField(){
 const background=$('bu-type').value==='background',expiry=$('bu-expiry');
 $('bu-expiry-field').hidden=!background;
 expiry.disabled=!background;
 expiry.required=background;
 expiry.min=$('bu-date').value;
}
function buOpenEditor(id=null){
 if(!buAccess())return;const record=id?buFind(id):null;if(id&&!buCanEdit(record))return;
 if(S.buDraft){buCloseEditor();return;}
 const fromDetails=id&&$('dw').classList.contains('on')&&$('dw').querySelector('.bu-detail-drawer')?.dataset.recordId===id;
 if(!fromDetails)closeDw();
 const defaultDate=buToday();
 S.buDraft={brandId:knowledgeActiveBrand().id,id,owner:currentUser(),fromDetails,defaultDate};
 $('dw').innerHTML=`<section class="bu-editor" data-i18n-skip role="dialog" aria-modal="true" aria-label="${buText('品牌动态','Brand update')}"><header class="dw-h"><button class="ib" aria-label="${buText('关闭','Close')}" onclick="buCloseEditor()"><i data-lucide="x" aria-hidden="true"></i></button><div><div class="ty">${esc(knowledgeActiveBrand().name)}</div><h3>${record?buText('编辑动态','Edit update'):buText('新增一条','Add update')}</h3></div></header><div class="dw-b"><div class="fld"><label for="bu-content">${buText('内容','Content')}</label><textarea id="bu-content" maxlength="500" rows="6" placeholder="${buText('记录发生的事，最多 500 字','Describe the event in up to 500 characters')}">${esc(record?buLang(record.text):'')}</textarea></div>${record?buReadonlyMetadata(record):`<div class="bu-editor-grid"><div class="fld"><label for="bu-date">${buText('发生日期','Event date')}</label><input id="bu-date" type="date" value="${defaultDate}" onchange="buSyncExpiryField()"></div><div class="fld"><label for="bu-category">${buText('分类','Category')}</label><select id="bu-category">${BU_CATEGORIES.map(([key,zh,en])=>`<option value="${key}" ${record?.category===key?'selected':''}>${buText(zh,en)}</option>`).join('')}</select></div></div>${buEditorTypeFields()}<div class="fld"><label for="bu-confidence">${buText('信息性质','Statement type')}</label><select id="bu-confidence">${[['direct','明确说过','Direct statement'],['hearsay','转述','Second-hand'],['speculation','推测','Inference']].map(([key,zh,en])=>`<option value="${key}" ${record?.confidence===key?'selected':''}>${buText(zh,en)}</option>`).join('')}</select></div><div class="fld"><label for="bu-links">${buText('来源链接','Source links')}</label><textarea id="bu-links" rows="3" placeholder="${buText('每行一个 http 或 https 链接','One http or https URL per line')}">${esc(record?record.sources.map(s=>s.url).join('\n'):'')}</textarea></div>`}<p id="bu-error" class="bu-error" role="alert"></p></div><footer class="dw-f"><button class="btn" onclick="buSave()">${buText('保存','Save')}</button><button class="btn ghost" onclick="buCloseEditor(true)">${buText('取消','Cancel')}</button></footer></section>`;
 $('dw').classList.add('on');$('scrim').classList.add('on');kpIcons();$('bu-content')?.focus();
}
function buHandleClose(){if(!S.buDraft||!$('dw').querySelector?.('.bu-editor'))return false;buCloseEditor();return true;}
function buFinishEditor(returnToDetails){
 const draft=S.buDraft;
 S.buDraft=null;
 if(returnToDetails&&draft?.fromDetails&&buFind(draft.id))buOpenDetails(draft.id);
 else closeDw();
}
function buCloseEditor(returnToDetails=false){
 const d=S.buDraft;if(!d){closeDw();return;}
 const old=d.id?buFind(d.id):null;
 const dirty=$('bu-content')&&($('bu-content').value!==(old?buLang(old.text):'')||(!d.id&&($('bu-date').value!==d.defaultDate||$('bu-category').value!=='sales'||$('bu-confidence').value!=='direct'||$('bu-type').value!=='fact'||$('bu-links').value!=='')));
 if(!dirty){buFinishEditor(returnToDetails);return;}
 kpDialog(buText('放弃未保存的修改？','Discard unsaved changes?'),buText('本次修改不会保存。','Your unsaved changes will be lost.'),`<button class="btn ghost" onclick="closeMod()">${buText('继续编辑','Continue editing')}</button><button class="btn" onclick="closeMod();buFinishEditor(${returnToDetails})">${buText('放弃修改','Discard changes')}</button>`);
}
function buValidDate(date){return /^\d{4}-\d{2}-\d{2}$/.test(date)&&!Number.isNaN(Date.parse(date))&&new Date(date).toISOString().slice(0,10)===date;}
function buSave(){
 const d=S.buDraft;if(!d||d.owner!==currentUser()||d.brandId!==knowledgeActiveBrand().id||!buAccess())return;
 const old=d.id?buFind(d.id):null;if(d.id&&!buCanEdit(old))return;
 const content=$('bu-content').value.trim(),date=old?old.date:$('bu-date').value,category=old?old.category:$('bu-category').value,confidence=old?old.confidence:$('bu-confidence').value;
 const type=old?buRecordType(old):$('bu-type').value;
 const expires=type==='background'?(old?old.expires:$('bu-expiry').value):undefined;
 if(!BU_TYPES.some(([key])=>key===type)){$('bu-error').textContent=buText('请选择动态类型。','Choose an update type.');return;}
 if(!old&&type==='background'&&(!buValidDate(expires)||expires<date)){$('bu-error').textContent=buText('请选择有效期，日期不能早于发生日期。','Choose a valid expiry date on or after the event date.');return;}
 let links;try{links=old?old.sources.map(source=>({...source})):[...new Set($('bu-links').value.split('\n').map(x=>x.trim()).filter(Boolean))].map(value=>{const url=new URL(value);if(!['http:','https:'].includes(url.protocol)||url.username||url.password)throw new Error();return {url:url.href};});}catch{$('bu-error').textContent=buText('请输入有效的来源链接。','Enter valid source URLs.');return;}
 if(!content||Array.from(content).length>500||!buValidDate(date)||!BU_CATEGORIES.some(c=>c[0]===category)||!['direct','hearsay','speculation'].includes(confidence)||!links.length||links.length>10){$('bu-error').textContent=buText('请填写内容、有效日期、分类及 1–10 个来源链接。','Provide content, a valid date, a category and 1–10 source URLs.');return;}
 const duplicate=!old&&buRows().find(r=>r.date===date&&buRecordType(r)===type&&r.expires===expires&&buLang(r.text).replace(/\s/g,'')===content.replace(/\s/g,''));
 if(duplicate){duplicate.sources=[...new Map([...duplicate.sources,...links].map(s=>[s.url,s])).values()];buLog(duplicate,'merged');}
 else if(old){buLog(old,'edited',buLang(old.text));old.history.at(-1).before={text:old.text,date:old.date,category:old.category,confidence:old.confidence,sources:old.sources.map(source=>({...source}))};if(content!==buLang(old.text))delete old.title;Object.assign(old,{text:{zh:content,en:content},date,category,confidence,sources:links});}
 else BU_RECORDS.unshift({id:'bu-user-'+Date.now(),brandId:d.brandId,date,category,confidence,type,expires,text:{zh:content,en:content},author:buActor(),owner:currentUser(),writer:'human',sources:links,history:[{at:new Date().toISOString(),actor:buActor(),action:'created'}]});
 buFinishEditor(true);render();toast(buText('品牌动态已保存','Brand update saved'));
}
function buDeletePrompt(id){
 const ids=id?[id]:[...buState().selected];
 if(!ids.length||!ids.every(value=>buCanDelete(buFind(value))))return;
 const title=id?buText('删除动态？','Delete update?'):buText(`删除所选 ${ids.length} 条动态？`,`Delete ${ids.length} selected updates?`);
 const body=buText('删除后将从列表中隐藏，原内容和操作历史仍会保留。','Deleted updates are hidden from the list. Their content and history are retained.');
 kpDialog(title,body,`<button class="btn ghost" onclick="closeMod()">${buText('取消','Cancel')}</button><button class="btn danger" onclick="buDelete(${esc(JSON.stringify(ids))})">${buText('删除','Delete')}</button>`);
}
function buDelete(ids){
 const targets=Array.isArray(ids)?ids:[ids];
 const records=targets.map(buFind);
 if(!records.length||!records.every(buCanDelete))return;
 const deletedAt=new Date().toISOString();
 for(const record of records){
  record.deletedAt=deletedAt;
  buLog(record,'deleted',buLang(record.text));
 }
 buState().selected=buState().selected.filter(id=>!targets.includes(id));
 closeMod();
 const drawerRecord=$('dw').querySelector('.bu-detail-drawer')?.dataset.recordId;
 if(targets.includes(drawerRecord))closeDw();
 render();
}
function buCorrectionHTML(original){
 const replacement=buFind(original.correctedBy);
 const records=replacement?[original,replacement]:[original];
 return records.map((record,index)=>`<section class="bu-conflict-detail">
   <div class="bu-correction-header"><span class="chip ${index?'bu-stored':'mut'}">${index?buText('以此为准','Confirmed'):buText('已被更正','Corrected')}</span><time datetime="${esc(record.date)}">${esc(record.date)}</time><span>${esc(record.author)}</span></div>
   <p class="bu-body">${buOriginalText(record)}</p>${buSourcesHTML(record)}
  </section>`).join('');
}
function buPromotePrompt(ids=buState().selected){
 if(!buAccess())return;const records=ids.map(buFind).filter(Boolean);if(!records.length||records.length!==ids.length)return;
 const blocked=buPromotionBlock(records);
 if(blocked){toast(blocked);return;}
 clearTimeout(S.buPromotion?.recommendRun?.timer);
 kbBrandUpdatesEnsure();
 const draft={brandId:knowledgeActiveBrand().id,ids:[...ids],owner:currentUser(),recommendRun:{}};
 S.buPromotion=draft;
 const title=buText('正在匹配知识库卡片','Finding a knowledge base card');
 const modal=$('mod');
 modal.classList.remove('asset-mode','plan-mode');
 modal.innerHTML=`<section class="mbox bu-progress-dialog" role="dialog" aria-modal="true" aria-labelledby="bu-progress-title" aria-describedby="bu-progress-note" data-i18n-skip>
  <div class="bu-progress-heading"><h3 id="bu-progress-title">${title}</h3><button id="bu-progress-cancel" type="button" class="btn ghost sm" onclick="closeMod()">${buText('取消','Cancel')}</button></div>
  <p id="bu-progress-note" class="bu-caption">${buText('匹配完成后，将自动提交审核。','Once a card is matched, the update will be submitted for review automatically.')}</p>
  <div class="bu-recommend-progress" role="progressbar" aria-labelledby="bu-progress-title" style="--bu-recommend-duration:${BU_RECOMMEND_DURATION}ms"><span></span></div>
 </section>`;
 modal.classList.add('on');
 $('bu-progress-cancel')?.focus({preventScroll:true});
 draft.recommendRun.timer=setTimeout(()=>buFinishRecommendation(draft),BU_RECOMMEND_DURATION);
}
function buTargetBusy(entry){return Boolean(entry.pendingUpdate||entry.sections?.some(section=>section.pendingUpdate));}
function buRecommendedTargets(record){
 const byCategory={
  sales:['k1','k2'],product:['k7','k2'],price:['k8','k2'],stock:['k7','k1'],
  demand:['k4','k7'],issue:['k4','k7'],campaign:['k5','k2'],competitor:['k6','k8'],
  people:['k1','k2'],other:['k1']
 };
 return byCategory[record.category]||byCategory.other;
}
function buFindRecommendedTarget(records,cards){
 const matches=records.map(buRecommendedTargets);
 const common=matches[0].filter(key=>matches.every(keys=>keys.includes(key)));
 const ranked=[...new Set([...common,'k1','k2','k8','k5'])];
 return ranked.map(key=>cards.find(card=>card.id.endsWith(key))).find(card=>card&&!buTargetBusy(card));
}
function buFinishRecommendation(draft){
 if(S.buPromotion!==draft||!draft.recommendRun||!$('mod').classList.contains('on')||!$('mod').querySelector('.bu-recommend-progress'))return;
 draft.recommendRun=null;
 if(draft.owner!==currentUser()||draft.brandId!==knowledgeActiveBrand().id||!buAccess()){
  closeMod();return;
 }
 const records=draft.ids.map(buFind);
 if(records.some(record=>!record||record.correctedBy)){
  buPromotionError(buText('所选动态已变化，请重新选择。','The selected updates have changed. Select them again.'));return;
 }
 const entry=buFindRecommendedTarget(records,knowledgeBrandEntries());
 if(entry){buPromote(entry.id);return;}
 buPromotionError(buText('推荐的卡片均有建议待审核，请处理后重试。','Recommended cards have pending reviews. Try again after they are reviewed.'));
}
function buPromotionError(message){closeMod();toast(message);}
function buPromote(recommendedId){
 const draft=S.buPromotion;if(!draft||!buAccess()||draft.owner!==currentUser()||draft.brandId!==knowledgeActiveBrand().id)return;
 const records=draft.ids.map(buFind).filter(Boolean);
 const entry=knowledgeBrandEntries().find(e=>e.id===recommendedId);
 if(!records.length||records.length!==draft.ids.length){buPromotionError(buText('所选动态已变化，请重新选择。','The selected updates have changed. Select them again.'));return;}
 if(!entry){buPromotionError(buText('暂未找到合适的目标卡片。','No suitable target card was found.'));return;}
 const blocked=buPromotionBlock(records);
 if(blocked){buPromotionError(blocked);return;}
 if(buTargetBusy(entry)){buPromotionError(buText('目标卡片已有待审核建议，请待处理后重试。','The target card has a pending review. Try again after it is reviewed.'));return;}
 kbEnsureEntryVersions(entry);const at=new Date().toISOString();
 const addition=records.map(r=>r.date+' · '+buLang(r.text)).join('\n\n');
 entry.pendingUpdate={baseVersion:entry.version,version:entry.version+1,baseText:entry.tx,nextText:[entry.tx,addition].filter(Boolean).join('\n\n'),brandUpdateAddition:addition,sourceLabel:buText('品牌动态','Brand updates'),internalSource:true,agent:'Vera',generatedAt:at,detectedAt:at,brandUpdateIds:records.map(r=>r.id),evidence:records.map(r=>({summary:buLang(r.text),quote:buLang(r.text),location:r.date+' · '+r.author})),changeSummary:buText('根据所选品牌动态补充知识内容。','Add knowledge from the selected brand updates.'),reason:buText('需人工核对来源与内容后批准。','Human approval is required after checking sources and content.')};
 records.forEach(record=>{record.suggestion={target:entry.id};buLog(record,'promoted');record.history.at(-1).target=entry.id;});
 buState().selected=[];clearTimeout(draft.recommendRun?.timer);S.buPromotion=null;closeMod();render();
 const detail=$('dw').querySelector('.bu-detail-drawer');
 if($('dw').classList.contains('on')&&detail&&draft.ids.includes(detail.dataset.recordId))buOpenDetails(detail.dataset.recordId,detail.dataset.tab);
 const name=buCardLabel(entry);
 toast(buText(`已提交审核 · ${name}`,`Submitted for review · ${name}`));
}
function buOpenSuggestion(id){const record=buFind(id);if(!record?.suggestion)return;kbOpenBrandUpdate(record.suggestion.target);}
buInit();
