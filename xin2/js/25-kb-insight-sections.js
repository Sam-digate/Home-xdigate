/* Section decisions are submitted together as one whole-document version. */
function kbEnsureInsightSections(){
 const parent=KNOWLEDGE_BRANDS.find(b=>b.id==='a8oparis')?.entries.find(e=>e.id==='k4');if(!parent||parent.sections)return;
 const seeds=[
  {key:'profiles',n:'用户画像',format:'profiles',tx:'用户画像 1\n年龄：24–28 岁\n城市：一二线城市\n消费能力：中等\n心理特征：换季时关注肤感与使用便利，倾向精简护理。\n人群特质：初入职场，愿意先尝试小规格产品。\n\n用户画像 2\n年龄：28–32 岁\n城市：一二线城市\n消费能力：中等偏高\n心理特征：关注长期修护，希望产品适合日常持续使用。\n人群特质：工作节奏快，偏好信息清晰、步骤简单的方案。\n\n用户画像 3\n年龄：30–40 岁\n城市：二三线及以上城市\n消费能力：中等及以上\n心理特征：重视品牌信任与成分信息，购买前会查阅资料。\n人群特质：倾向长期使用熟悉的产品，关注真实口碑。'},
  {key:'motives',n:'核心购买动机',format:'chips',tx:'换季护理、精简步骤、长期修护、肤感体验、成分信任、口碑推荐'},
  {key:'needs',n:'深层需求洞察',format:'text',tx:'这类用户关注的不只是某一个短期问题，而是日常护理能否长期坚持。工作与生活节奏加快，让她们更希望选择肤感舒适、步骤简明、产品信息透明的方案，在稳定的使用习惯中获得安心感。购买决策通常较长，对“见效快”的话术保持谨慎，更看重有依据的介绍与真实使用反馈。'},
  {key:'barriers',n:'决策阻力',format:'rows',tx:'价格｜首次尝试的成本较高，希望先了解规格与使用周期。\n信任｜关注是否正品、产品资料是否完整。\n效果理解｜不了解多久能观察到变化，预期不清晰。\n使用门槛｜对用量、步骤和搭配方式存在疑问。\n适用人群｜不确定当前肤质与使用场景是否适合。'},
 ];
 parent.sections=seeds.map(seed=>{const section={...seed,id:'k4-'+seed.key,parentId:parent.id,cat:'用户洞察',filled:1,gov:'ok',stale:0,version:1,by:parent.by,at:parent.at,reads:parent.reads,ags:[...parent.ags],updateReviews:[]};kbEnsureEntryVersions(section);return section;});
 for(const section of parent.sections.filter(s=>['profiles','barriers'].includes(s.key))){
  const nextText=section.key==='profiles'?section.tx.replace('年龄：24–28 岁','年龄：25–30 岁').replace('消费能力：中等\n','消费能力：理性消费，优先考虑单次使用成本\n').replace('心理特征：换季时关注肤感与使用便利，倾向精简护理。','心理特征：关注换季期间的舒适肤感，希望护理步骤精简、使用说明清晰。').replace('愿意先尝试小规格产品。','偏好先试用再决定长期购买，并关注试用后的持续使用体验。').replace('城市：一二线城市\n消费能力：中等偏高','城市：一线及新一线城市\n消费能力：中等偏高').replace('步骤简单的方案。','步骤简单、用量说明明确的方案。').replace('人群特质：倾向长期使用熟悉的产品，关注真实口碑。','购买习惯：会对比官方产品资料与真实口碑，优先选择可查询来源的渠道。\n内容偏好：希望看到连续使用记录、适用条件及护理搭配建议。')+'\n\n用户画像 4\n年龄：35–45 岁\n城市：二线及以上城市\n消费能力：中等偏高，重视长期使用价值\n心理特征：希望建立稳定的日常护理习惯，关注产品信息透明度。\n人群特质：为自己及家人选购，重视官方渠道与售后服务。':section.tx.replace('希望先了解规格与使用周期。','希望先了解单次用量、规格与预计使用周期。').replace('产品资料是否完整。','产品资料与使用依据是否清晰可查。')+'\n购买渠道｜希望了解官方渠道及售后服务。';
  section.pendingUpdate={baseVersion:1,version:2,baseText:section.tx,nextText,agent:'用户洞察 Agent',changeSummary:section.key==='profiles'?'补充用户对持续使用体验和明确用量说明的关注。':'补充购买成本、信息可信度与官方渠道方面的顾虑。',reason:'根据用户反馈整理新的洞察，待人工确认后更新对应子板块。',...KB_UPDATE_SOURCE,detectedAt:new Date().toISOString(),evidence:[{summary:'当前已审阅资料中的相关用户描述。',quote:section.tx,location:'用户洞察 · '+section.n}]};
 }
 parent.tx=parent.sections.map(s=>s.n+'\n'+s.tx).join('\n\n');
 parent.knowledgeVersions=[{version:parent.version,text:parent.tx,sections:kbInsightSnapshot(parent),at:parent.at,by:parent.by,kind:'initial'}];
}
function kbInsightSnapshot(parent){return parent.sections.map(s=>({id:s.id,tx:s.tx}));}
function kbRecordInsightDocument(parent,before,at,actor,kind,decisions=[]){
 if(parent.tx===before){
  if(decisions.length){parent.updateReviews=parent.updateReviews||[];parent.updateReviews.push({baseVersion:parent.version,version:parent.version+1,baseText:before,nextText:before,decision:'ignored',ignoredAt:at,reviewer:actor,internalSource:true,sourceLabel:'用户洞察更新',sectionDecisions:decisions.map(x=>({id:x.section.id,name:x.section.n,decision:x.decision}))});}
  return;
 }
 const baseVersion=parent.version;
 parent.version++;parent.by=actor;parent.at=new Date(at).toLocaleDateString('sv-SE',{timeZone:'Asia/Tokyo'}).replace(/-/g,'/');
 parent.updateReviews=parent.updateReviews||[];
 parent.updateReviews.push({baseVersion,version:parent.version,baseText:before,nextText:parent.tx,decision:'approved',kind,reviewer:actor,approvedAt:at,generatedAt:at,sourceLabel:kind==='manual'?'人工编辑':'用户洞察更新',internalSource:true,changeSummary:decisions.map(x=>x.section.n+'：'+(x.decision==='approve'?'通过':'忽略')).join('；'),sectionDecisions:decisions.map(x=>({id:x.section.id,name:x.section.n,decision:x.decision}))});
 kbAppendEntryVersion(parent,at,actor,kind);parent.knowledgeVersions.at(-1).sections=kbInsightSnapshot(parent);
}
function kbInsightParent(section){return knowledgeBrandEntries().find(e=>e.id===(section.parentId||section.id)&&e.sections);}
function kbSyncInsightParent(section){
 const parent=kbInsightParent(section);if(!parent)return;
 parent.tx=parent.sections.map(s=>s.n+'\n'+s.tx).join('\n\n');
 if(section.parentId){parent.by=section.by;parent.at=section.at;}
}
function kbInsightBreadcrumbHTML(entry){return entry.parentId?`<button class="kb-insight-back" onclick="openKB('${entry.parentId}',0)">← 返回用户洞察</button>`:'';}
function kbInsightContentHTML(section){
 if(section.format==='chips')return `<div class="kb-insight-chips">${section.tx.split('、').map(x=>`<span>${esc(x)}</span>`).join('')}</div>`;
 if(section.format==='profiles')return `<div class="kb-insight-profiles">${section.tx.split('\n\n').map(block=>{const [title,...lines]=block.split('\n');return `<article><b>${esc(title)}</b>${lines.map(l=>`<p>${esc(l)}</p>`).join('')}</article>`;}).join('')}</div>`;
 if(section.format==='rows')return `<div class="kb-insight-rows">${section.tx.split('\n').map(line=>{const [label,...rest]=line.split('｜');return `<div><b>${esc(label)}</b><span>${esc(rest.join('｜'))}</span></div>`;}).join('')}</div>`;
 return `<p class="kb-insight-paragraph">${esc(section.tx)}</p>`;
}
function kbInsightSectionCardHTML(section,onlyPending=false){
 return `<section class="kb-insight-section"><header><h3>${esc(section.n)}</h3>${section.pendingUpdate?'<span class="kb-update-badge">更新待审批</span>':'<span class="st done">已审阅</span>'}<button class="btn ghost sm" onclick="openKB('${section.id}',${section.pendingUpdate?2:0})">${section.pendingUpdate?'查看更新':'查看内容'}</button></header>${onlyPending?`<p class="kb-insight-pending-summary">${esc(section.pendingUpdate.changeSummary)}</p>`:kbInsightContentHTML(section)}</section>`;
}
function kbInsightEditorHTML(section){
 return `<section class="kb-insight-section kb-insight-editor-section"><h3><label for="kb-insight-edit-${section.id}">${esc(section.n)}</label></h3><textarea id="kb-insight-edit-${section.id}" class="kb-content-editor kb-insight-editor" rows="${section.format==='profiles'?14:section.format==='chips'?3:6}" aria-label="${esc(section.n)}正文">${esc(section.tx)}</textarea></section>`;
}
function kbSaveInsightContent(id){
 const entry=kbBrandReviewEntry(id);if(!entry||(!entry.sections&&!entry.parentId))return;
 const sections=entry.sections||[entry],values=sections.map(section=>({section,editor:$('kb-insight-edit-'+section.id)}));
 if(values.some(x=>!x.editor))return;
 if(values.some(x=>!x.editor.value.trim())){toast('子板块正文不能为空');return;}
 const actor=U[currentUser()]?.n||currentUser(),at=new Date().toISOString(),document=entry.sections?entry:kbInsightParent(entry),before=document.tx;let saved=0,ignored=0;
 for(const {section,editor} of values){const text=editor.value.trim();if(text===section.tx)continue;
  if(section.pendingUpdate){section.updateReviews.push({...section.pendingUpdate,beforeText:section.tx,decision:'ignored',kind:'superseded',ignoredAt:at,reviewer:actor,reason:'手动编辑对应子板块后，旧更新建议已失效。'});section.pendingUpdate=null;ignored++;}
  section.tx=text;section.by=actor;section.at=new Date(at).toLocaleDateString('sv-SE',{timeZone:'Asia/Tokyo'}).replace(/-/g,'/');section.gov='ok';section.stale=0;kbSyncInsightParent(section);saved++;
 }
 const parent=entry.sections?entry:kbInsightParent(entry);if(saved&&S.kbInsightBatchDrafts)delete S.kbInsightBatchDrafts[parent.id];
 if(saved)kbRecordInsightDocument(parent,before,at,actor,'manual');
 render();kbDrawInsightPage(entry,0);toast(saved?(ignored?'正文已保存，对应的旧更新建议已忽略':'正文已保存'):'内容未变化');
}
function kbOpenInsightRoute(id,tab){
 const entry=kbFindKnowledgeItem(id);if(!entry||(!entry.sections&&!entry.parentId))return false;
 if(!permissionHasPage('know.src')){toast('没有访问权限');return true;}
 if(entry.parentId){
  const active=tab===undefined?(entry.pendingUpdate?2:0):tab;
  if(active===2&&entry.pendingUpdate){kbDrawInsightBatchReview(kbInsightParent(entry));return true;}
  if(active===3){kbShowBrandHistory(entry.parentId);return true;}
  kbDrawInsightPage(entry,active===1?1:0);return true;
 }
 if(tab===3){kbShowBrandHistory(entry.id);return true;}
 kbDrawInsightPage(entry,tab===undefined?(entry.sections.some(s=>s.pendingUpdate)?2:0):tab);return true;
}
function kbDrawInsightPage(entry,tab){
 if(tab===3){kbShowBrandHistory(entry.parentId||entry.id);return;}
 if(entry.sections&&tab===2){kbDrawInsightBatchReview(entry);return;}
 const parent=entry.sections?entry:kbInsightParent(entry),sections=parent.sections,pending=sections.filter(s=>s.pendingUpdate),brand=knowledgeActiveBrand();
 const expanded=$('dw').classList.contains('expanded');closeDw();S.kb=entry.id;S.kbtab=tab;
 const drawer=$('dw');if(expanded)drawer.classList.add('expanded');
 let content='';
 if(tab===1)content=`<div class="ctx">${[['被读次数',entry.reads],['在用的 Agent',entry.ags.map(nick).join(' · ')],['最后更新',entry.at],['更新人',entry.by]].map(([k,v])=>`<div class="ctxr"><span class="k">${k}</span><span class="v">${esc(v)}</span></div>`).join('')}</div>`;
 else if(entry.sections)content=sections.map(kbInsightEditorHTML).join('');
 else content=kbInsightEditorHTML(entry);
 drawer.innerHTML=`<section class="kb-update-drawer" role="dialog" aria-modal="true" aria-label="用户洞察"><header class="dw-h"><button class="ib" aria-label="关闭用户洞察" onclick="closeDw()"><i data-lucide="x"></i></button><div style="flex:1;min-width:0"><div class="ty">${esc(brand.name)} · ${entry.parentId?'用户洞察':esc(entry.cat)}</div><h3>${esc(entry.n)}</h3></div><span class="chip mut">v${parent.version}</span></header>${kbBrandTabsHTML(entry.id,tab)}<div class="dw-b">${kbInsightBreadcrumbHTML(entry)}${content}</div><footer class="dw-f">${tab===0?`<button class="btn" onclick="kbSaveInsightContent('${entry.id}')">保存</button><button class="btn ghost" onclick="kbDrawInsightPage(kbFindKnowledgeItem('${entry.id}'),0)">取消</button>`:'<button class="btn ghost" onclick="closeDw()">完成</button>'}</footer></section>`;
 drawer.classList.add('on');$('scrim').classList.add('on');kpIcons();if(typeof syncDrawerExpandControl==='function')syncDrawerExpandControl();
}
function kbInsightUpdateStamp(section){const u=section.pendingUpdate;return u?JSON.stringify([section.id,u.baseVersion,u.version,u.baseText,u.nextText,u.detectedAt]):'';}
function kbInsightBatchDraft(parent){
 S.kbInsightBatchDrafts=S.kbInsightBatchDrafts||{};
 if(!S.kbInsightBatchDrafts[parent.id])S.kbInsightBatchDrafts[parent.id]={mode:'diff',choices:{},batch:Object.fromEntries(parent.sections.filter(s=>s.pendingUpdate).map(s=>[s.id,kbInsightUpdateStamp(s)]))};
 return S.kbInsightBatchDrafts[parent.id];
}
function kbInsightBatchParent(id){const parent=kbBrandReviewEntry(id);return parent?.sections?parent:null;}
function kbRedrawInsightBatch(parent,focusId){
 const body=$('dw').querySelector('.dw-b'),scroll=body?.scrollTop||0;kbDrawInsightBatchReview(parent);
 const next=$('dw').querySelector('.dw-b');if(next)next.scrollTop=scroll;
 if(focusId)$(focusId)?.focus({preventScroll:true});
}
function kbSetInsightDecision(parentId,sectionId,decision){
 const parent=kbInsightBatchParent(parentId),section=parent?.sections.find(s=>s.id===sectionId);if(!section?.pendingUpdate||!['approve','ignore'].includes(decision))return;
 const draft=kbInsightBatchDraft(parent);draft.choices[sectionId]=decision;kbRedrawInsightBatch(parent,'kb-choice-'+sectionId+'-'+decision);
}
function kbSetInsightBatchMode(parentId,mode){
 const parent=kbInsightBatchParent(parentId);if(!parent||!['diff','preview','parallel'].includes(mode))return;
 kbInsightBatchDraft(parent).mode=mode;kbRedrawInsightBatch(parent,'kb-batch-mode-'+mode);
}
function kbInsightBatchSectionHTML(parent,section,draft){
 const update={...section.pendingUpdate,baseVersion:parent.version,version:parent.version+1},ops=kbTextDiff(update.baseText,update.nextText),choice=draft.choices[section.id];
 const counts=kind=>ops.filter(o=>o.kind===kind).reduce((sum,o)=>sum+Array.from(o.text).length,0);
 const countsHTML=['diff','parallel'].includes(draft.mode)?`<span class="kb-merged-counts kb-batch-counts"><span class="added">+ 新增 ${counts('added')} 字</span><span class="removed">− 删除 ${counts('removed')} 字</span></span>`:'';
 const body=draft.mode==='preview'?kbInsightContentHTML({...section,tx:choice==='approve'?update.nextText:section.tx}):kbReviewBodyHTML(update,ops,draft.mode);
 return `<section class="kb-batch-section ${choice||''}"><header><h3>${esc(section.n)}</h3><div class="kb-batch-choices" role="group" aria-label="${esc(section.n)}审批选择">${[['approve','通过'],['ignore','忽略']].map(([value,label])=>`<label class="${value} ${choice===value?'selected':''}"><input type="radio" id="kb-choice-${section.id}-${value}" name="kb-choice-${section.id}" value="${value}" ${choice===value?'checked':''} onchange="kbSetInsightDecision('${parent.id}','${section.id}','${value}')">${label}</label>`).join('')}</div>${countsHTML}</header><div class="kb-batch-copy ${draft.mode==='parallel'?'kb-parallel-body':''}">${body}</div></section>`;
}
function kbDrawInsightBatchReview(parent){
 const pending=parent.sections.filter(s=>s.pendingUpdate),unchanged=parent.sections.filter(s=>!s.pendingUpdate),draft=kbInsightBatchDraft(parent),brand=knowledgeActiveBrand();
 const approved=pending.filter(s=>draft.choices[s.id]==='approve').length,ignored=pending.filter(s=>draft.choices[s.id]==='ignore').length,complete=approved+ignored===pending.length&&pending.length>0;
 const expanded=$('dw').classList.contains('expanded');closeDw();S.kb=parent.id;S.kbtab=2;
 const drawer=$('dw');if(expanded)drawer.classList.add('expanded');
 drawer.innerHTML=`<section class="kb-update-drawer ${draft.mode==='parallel'?'kb-review-parallel':''}" role="dialog" aria-modal="true" aria-label="用户洞察子板块审批"><header class="dw-h"><button class="ib" aria-label="关闭" onclick="closeDw()"><i data-lucide="x"></i></button><div style="flex:1;min-width:0"><div class="ty">${esc(brand.name)} · ${esc(parent.cat)}</div><h3>${esc(parent.n)}</h3></div><span class="chip mut">v${parent.version} &rarr; v${parent.version+1}</span><span class="st review">更新待审批</span></header>${kbBrandTabsHTML(parent.id,2)}<div class="dw-b">${pending.length?`<div class="kb-batch-toolbar"><div class="seg" role="tablist" aria-label="对比模式">${[['diff','对比'],['preview','预览'],['parallel','并列']].map(([value,label])=>`<button type="button" id="kb-batch-mode-${value}" role="tab" aria-selected="${draft.mode===value}" class="${draft.mode===value?'on':''}" onclick="kbSetInsightBatchMode('${parent.id}','${value}')">${label}</button>`).join('')}</div><span>共 ${pending.length} 个更新 · 已选择 ${approved+ignored}/${pending.length}</span></div>${pending.map(s=>kbInsightBatchSectionHTML(parent,s,draft)).join('')}${unchanged.length?`<details class="kb-batch-unchanged"><summary>未变更的子板块（${unchanged.length}）</summary>${unchanged.map(s=>kbInsightSectionCardHTML(s)).join('')}</details>`:''}${kbUpdateExplanationHTML(pending[0].pendingUpdate)}`:'<div class="allclear">暂无待审批的更新建议</div>'}</div><footer class="dw-f kb-batch-footer">${pending.length?`<button class="btn" ${complete?'':'disabled'} onclick="kbSubmitInsightBatch('${parent.id}','selected')">确认所选（通过 ${approved} · 忽略 ${ignored}）</button><button class="btn ghost" onclick="kbSubmitInsightBatch('${parent.id}','approve-all')">全部通过</button><button class="btn ghost" onclick="kbSubmitInsightBatch('${parent.id}','ignore-all')">全部忽略</button>`:'<button class="btn ghost" onclick="closeDw()">完成</button>'}</footer></section>`;
 drawer.classList.add('on');$('scrim').classList.add('on');kpIcons();if(typeof syncDrawerExpandControl==='function')syncDrawerExpandControl();
}
function kbSubmitInsightBatch(parentId,action){
 const parent=kbInsightBatchParent(parentId);if(!parent||!['selected','approve-all','ignore-all'].includes(action))return;
 const pending=parent.sections.filter(s=>s.pendingUpdate),draft=kbInsightBatchDraft(parent);if(!pending.length)return;
 // Validate the entire rendered batch before applying any section, including selected/ignored ones.
 if(Object.keys(draft.batch).length!==pending.length||pending.some(s=>draft.batch[s.id]!==kbInsightUpdateStamp(s)||s.version!==s.pendingUpdate.baseVersion||s.tx!==s.pendingUpdate.baseText)){
  delete S.kbInsightBatchDrafts[parent.id];toast('内容已变化，请重新核对全部更新');kbDrawInsightBatchReview(parent);return;
 }
 const decisions=pending.map(s=>({section:s,decision:action==='approve-all'?'approve':action==='ignore-all'?'ignore':draft.choices[s.id]}));
 if(decisions.some(x=>!['approve','ignore'].includes(x.decision))){toast('请为每个待更新子板块选择通过或忽略');return;}
 const actor=U[currentUser()]?.n||currentUser(),at=new Date().toISOString(),batchId='insight-'+at,before=parent.tx;
 let approved=0,ignored=0;
 for(const {section,decision} of decisions){
  const update=section.pendingUpdate;section.updateReviews=section.updateReviews||[];
  section.updateReviews.push({...update,beforeText:section.tx,decision:decision==='approve'?'approved':'ignored',...(decision==='approve'?{approvedAt:at}:{ignoredAt:at}),reviewer:actor,batchId});
  if(decision==='approve'){section.tx=update.nextText;section.by=actor;section.at=new Date(at).toLocaleDateString('sv-SE',{timeZone:'Asia/Tokyo'}).replace(/-/g,'/');section.gov='ok';section.stale=0;kbSyncInsightParent(section);approved++;}else ignored++;
  section.pendingUpdate=null;
 }
 kbRecordInsightDocument(parent,before,at,actor,'approved',decisions);
 delete S.kbInsightBatchDrafts[parent.id];parent.lastInsightBatch={approved,ignored,at};closeDw();render();toast(`已提交：通过 ${approved} 个，忽略 ${ignored} 个子板块更新`);
}
