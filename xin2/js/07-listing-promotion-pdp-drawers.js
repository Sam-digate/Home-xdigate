/* ---- SKU listing ---- */
/* Listing keeps its own editable snapshot; product-library records stay read-only. */
function listingProductFields(product){
 const cream=product.sku==='A8O-CRM-50';
 return {category:cream?'美容护肤 / 面霜':'美容护肤 / 精华',kind:cream?'面霜':'精华',spec:'正常规格',brand:'A8OPARIS',series:cream?'A8O 舒缓系列':'A8O 修护系列'};
}
function listingProductImage(product){
 return ASSETS.find(x=>x.type==='图片'&&x.prod===product.n)?.img||'';
}
function listingState(a){
 const l=a.listing;
 if(l.confirmed.length<4)l.confirmed=[...l.confirmed,null].slice(0,4);
 if(l.open.length<4)l.open=[...l.open,false].slice(0,4);
 if(!l.final)l.final={image:'',source:l.receipt?.source||l.receipt?.image||''};
 if(!l.fields){
  const product=PRODS.find(x=>x.sku===a.rows[0].sku)||a.rows[0];
  l.selected=product.sku;l.fields=listingProductFields(product);l.image=listingProductImage(product);
  l.productRows={[product.sku]:{...a.rows[0]}};
 }
 return l;
}
function listingStatus(a){
 const l=listingState(a),count=l.confirmed.filter(Boolean).length;
 return {count,label:l.rejected?'流程已退回':l.loading!==null?'AI 处理中':!l.confirmed[0]?'选择上架产品':!l.confirmed[1]?'商品字段验证':!l.confirmed[2]?'平台回执截图待确认':!l.confirmed[3]?'商品上架结果待确认':'商品上架已确认'};
}
function listingPeek(a){
 const l=listingState(a);
 return `<div class="pk" id="pk-${a.id}">
  <div class="pk-h"><span class="ty">产出 · 商品上架</span><span class="chip plat">天猫</span><span class="chip mut">1 个 SKU</span><span class="st ${a.st}">${STN[a.st]}</span>${artifactRunLink(a.by)}</div>
  <div class="pk-b" style="display:block">
   <div class="pk-t"><div class="tt">${esc(a.ttl)}</div><div class="ex">${esc(a.ex)}</div></div>
   <div class="listing-inline-workflow">${dListingWorkflow(a,'card')}</div>
   </div>
  <div class="pk-a">${listingCardFooter(a)}</div>
  ${a.nxt&&a.st==='done'?`<div class="nxt"><span class="lb">接下来</span>
   ${a.nxt.map(n=>`<button class="na" onclick="toast('${n==='同步到活动'?'已同步到活动':'已在同一线程中新增步骤：'+n}')">${n} →</button>`).join('')}</div>`:''}
  </div>`;
}
function listingCardFooter(a){
 const l=listingState(a),status=listingStatus(a),next=l.confirmed.findIndex(x=>!x);
 if(l.rejecting)return listingRejectEditor(a);
 const action=l.loading!==null?`<button class="btn sm" disabled><span class="listing-ai-spinner" style="width:14px;height:14px;border-width:2px;display:inline-block;vertical-align:-3px;margin-right:var(--sp-1)"></span>AI 处理中</button>`:status.count===4?'<span class="st done">商品上架已确认</span>':l.rejected?'<span style="color:var(--red);font-size:var(--fs-sm)">当前阶段已退回</span>':`<button class="btn sm" onclick="confirmListingStep('${a.id}',${next})">批准</button><button class="btn ghost sm" onclick="startListingReject('${a.id}')">退回</button>`;
 return `${action}<button class="btn ghost sm" onclick="openDw('${a.id}')">打开</button><button class="rvb" onclick="openReview('${a.id}')">评论 ${subCount(a.rows[0])?`<span class="n">${subCount(a.rows[0])}</span>`:''}</button><span class="v">v${a.v}</span>`;
}
function listingRejectEditor(a){
 const l=listingState(a);
 return `<div class="listing-reject-inline"><input type="text" aria-label="退回原因" placeholder="填写退回原因" value="${esc(l.rejectDraft||'')}" oninput="setListingRejectDraft('${a.id}',this.value)"><button class="btn sm" onclick="confirmListingReject('${a.id}')">确定</button><button class="btn ghost sm" onclick="cancelListingReject('${a.id}')">取消</button></div>`;
}
function listingStepMeta(a,i){
 if(a.listing.rejected?.stage===i){const r=a.listing.rejected;return `<span style="color:var(--red)">已退回</span><span>${esc(U[r.by]?.n||r.by)}</span><span>${esc(r.at)}</span>`;}
 const done=listingState(a).confirmed[i];
 return done?`<span style="color:#009975">已确认</span><span>${esc(U[done.by]?.n||nick(done.by)||done.by)}</span><span>${esc(done.at)}</span>`:'<span style="color:var(--primary)">待确认</span>';
}
function dListingWorkflow(a,scope='drawer'){
 const l=listingState(a),products=[...PRODS].sort((x,y)=>(y.sku==='A8O-AMP-15')-(x.sku==='A8O-AMP-15'));
 const prefix=scope==='card'?'listing-card':'listing';
 const productCards=`<div class="listing-products" role="group" aria-label="选择一个上架商品">${products.map(p=>`<button class="listing-product ${p.sku===l.selected?'selected':''}" ${l.confirmed[0]?'disabled':''} aria-pressed="${p.sku===l.selected}" title="${esc(p.n)}" onclick="selectListingProduct('${a.id}','${p.sku}')"><img src="${esc(listingProductImage(p))}" alt="${esc(p.n)}"><span class="listing-product-info"><span class="listing-product-name">${esc(p.n)}</span><span class="listing-product-spec">规格：${esc(p.n.match(/\d+ml/)?.[0]||'—')}</span><span class="listing-product-pick">${p.sku===l.selected?'✓ 已选择':'选择'}</span></span></button>`).join('')}</div>`;
 const fields=[['category','发布商品的所在类目'],['kind','商品品类',['精华','面霜','洁面','护肤套装']],['spec','规格类型',['正常规格','旅行装','组合装']],['brand','品牌'],['series','商品系列']];
 const fieldForm=`<div class="listing-fields">${fields.map(([key,label,options])=>`<div class="fld"><label for="${prefix}-${key}">${label}<span class="listing-required">*</span></label>${options?`<select id="${prefix}-${key}" ${l.confirmed[1]?'disabled':''} onchange="setListingField('${a.id}','${key}',this.value)">${options.map(v=>`<option ${l.fields[key]===v?'selected':''}>${v}</option>`).join('')}</select>`:`<input id="${prefix}-${key}" ${l.confirmed[1]?'readonly':''} required value="${esc(l.fields[key])}" oninput="setListingField('${a.id}','${key}',this.value)">`}</div>`).join('')}</div>
  <div class="listing-main-image"><label>1:1 主图<span class="listing-required">*</span></label><div class="listing-image-row">
   ${l.image?`<div class="listing-image-preview"><button onclick="previewListingImage('${a.id}')" title="查看主图"><img src="${esc(l.image)}" alt="商品主图"></button>${l.confirmed[1]?'':`<button class="listing-image-remove" onclick="setListingImage('${a.id}',null)" aria-label="移除主图">×</button>`}</div>`:''}
   <button class="listing-library" ${l.confirmed[1]?'disabled':''} onclick="openListingAssets('${a.id}')"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="1.5"/><path d="m4 18 5-5 4 3 3-4 5 6"/></svg>素材库</button>
  </div></div>`;
 const bodies=[productCards,l.loading===1?listingLoading('AI 正在生成商品字段…'):fieldForm,l.loading===2?listingLoading('AI 正在提交并等待平台回执…'):listingReceiptContent(a),l.loading===3?listingLoading('AI 正在执行上架并获取最终截图…'):listingFinalContent(a)];
 const next=l.confirmed.findIndex(x=>!x),visibleThrough=l.loading!==null?l.loading:next<0?3:next;
 return ['选择上架产品','商品字段验证','平台回执截图','商品上架结果'].slice(0,visibleThrough+1).map((name,i)=>`<section class="listing-step"><button class="listing-step-head" aria-expanded="${!!l.open[i]}" aria-controls="${prefix}-step-${i}" onclick="toggleListingStep('${a.id}',${i},'${scope}')"><span class="listing-step-dot ${l.confirmed[i]?'done':i>=2?'receipt':''}" data-listing-dot="${i}"></span><strong>${name}</strong><span class="listing-step-meta" data-listing-meta="${i}">${listingStepMeta(a,i)}</span><span class="listing-step-toggle" aria-hidden="true"><i data-lucide="${l.open[i]?'chevron-up':'chevron-down'}"></i></span></button><div id="${prefix}-step-${i}" class="listing-step-body" ${l.open[i]?'':'hidden'}>${bodies[i]}</div></section>`).join('');
}
function listingLoading(text){return `<div class="listing-ai-loading" role="status"><span class="listing-ai-spinner"></span><span>${text}</span></div>`;}
function listingFooter(a){
 const l=listingState(a),status=listingStatus(a),next=l.confirmed.findIndex(x=>!x);
 if(S.dtab===0&&l.rejecting)return listingRejectEditor(a);
 return `${S.dtab===0?(l.loading!==null?'<button class="btn" disabled><span class="listing-ai-spinner" style="width:14px;height:14px;border-width:2px;display:inline-block;vertical-align:-3px;margin-right:var(--sp-1)"></span>AI 处理中</button>':status.count===4?'<span class="st done">商品上架已确认</span>':l.rejected?'<span style="color:var(--red);font-size:var(--fs-sm)">当前阶段已退回</span>':`<button class="btn" onclick="confirmListingStep('${a.id}',${next})">批准</button><button class="btn ghost" onclick="startListingReject('${a.id}')">退回</button>`):''}<button class="rvb ${S.pc&&S.dtab===0?'on':''}" aria-expanded="${!!S.pc&&S.dtab===0}" aria-controls="listing-comments" onclick="toggleListingComment()">评论 ${subCount(a.rows[0])?`<span class="n">${subCount(a.rows[0])}</span>`:''} ${S.pc&&S.dtab===0?'▴':'▾'}</button>`;
}
function startListingReject(id){
 const [,a]=findArt(id);if(!a?.listing)return;
 const l=listingState(a),stage=l.confirmed.findIndex(x=>!x);if(stage<0||l.loading!==null||l.rejected)return;
 l.rejecting=true;l.rejectStage=stage;l.rejectDraft='';refreshListingCard(a);if(S.aid===id)drawDw();
 setTimeout(()=>{const inputs=[...document.querySelectorAll('.listing-reject-inline input')];inputs.at(-1)?.focus();},0);
}
function setListingRejectDraft(id,value){const [,a]=findArt(id);if(a?.listing)a.listing.rejectDraft=value;}
function cancelListingReject(id){const [,a]=findArt(id);if(!a?.listing)return;a.listing.rejecting=false;a.listing.rejectDraft='';refreshListingCard(a);if(S.aid===id)drawDw();}
function confirmListingReject(id){
 const [,a]=findArt(id);if(!a?.listing)return;
 const reason=(a.listing.rejectDraft||'').trim();if(!reason){toast('请填写退回原因');return;}
 rejectListingStage(id,reason);
}
function rejectListingStage(id,reason){
 const [,a]=findArt(id);if(!a?.listing)return;
 const l=listingState(a),stage=l.rejectStage??l.confirmed.findIndex(x=>!x);if(stage<0||l.loading!==null)return;
 const draft=$('si')?.value;
 const at=new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false});
 const names=['选择上架产品','商品字段验证','平台回执截图','商品上架结果'];
 l.rejected={stage,by:'du',at,reason};l.open[stage]=true;l.rejecting=false;l.rejectDraft='';
 a.ex=`${names[stage]}阶段已退回，等待调整后重新处理。`;
 a.vals=[{l:'当前阶段',v:'已退回',s:'bad'}];
 a.rows[0].sub.push({k:'sys',tx:`dudu 已退回「${names[stage]}」。原因：${reason}`,at});
 refreshListingCard(a);drawDw();if(draft!==undefined&&$('si'))$('si').value=draft;
 toast(`已退回「${names[stage]}」`);
}
function toggleListingComment(){
 const [,a]=findArt(S.aid);if(!a?.listing)return;
 const input=$('si');if(input)a.listing.commentDraft=input.value;
 S.pc=S.dtab!==0||!S.pc;S.dtab=0;drawDw();
 if(S.pc){if($('si'))$('si').value=a.listing.commentDraft||'';scrollDrawerToBottom();}
}
function refreshListingCard(a){
 const card=$('pk-'+a.id);if(card)card.outerHTML=listingPeek(a);
}
function refreshListingChrome(a){
 refreshListingCard(a);
 if(S.aid!==a.id)return;
 const footer=$('listing-footer');if(footer)footer.innerHTML=listingFooter(a);
 [0,1,2,3].forEach(i=>{
  const meta=document.querySelector(`[data-listing-meta="${i}"]`),dot=document.querySelector(`[data-listing-dot="${i}"]`);
  if(meta)meta.innerHTML=listingStepMeta(a,i);if(dot)dot.classList.toggle('done',!!a.listing.confirmed[i]);
 });
}
function toggleListingStep(id,i,scope='drawer'){
 const [,a]=findArt(id),l=listingState(a);l.open[i]=!l.open[i];
 // Keep the form and any entered text mounted while folding a step.
 const body=$((scope==='card'?'listing-card':'listing')+'-step-'+i),head=body.previousElementSibling;
 body.hidden=!l.open[i];head.setAttribute('aria-expanded',String(l.open[i]));
 const toggle=head.querySelector('.listing-step-toggle');toggle.innerHTML=`<i data-lucide="${l.open[i]?'chevron-up':'chevron-down'}"></i>`;
 if(window.lucide)lucide.createIcons({attrs:{width:16,height:16,'stroke-width':1.8}});
}
function selectListingProduct(id,sku){
 const [,a]=findArt(id),l=listingState(a),p=PRODS.find(x=>x.sku===sku);if(l.confirmed[0]||!p||l.selected===sku)return;
 l.selected=sku;l.fields=listingProductFields(p);l.image=listingProductImage(p);l.confirmed=[null,null,null,null];l.open=[true,false,false,false];l.loading=null;l.rejected=null;
 if(l.receipt)l.receipt.image='';if(l.final)l.final.image='';
 // Copy only into this task; selecting a candidate never edits PRODS.
 const previous=a.rows[0];
 l.productRows[previous.sku]={...previous};
 a.rows=[{...(l.productRows[p.sku]||{}),n:p.n,sku:p.sku,cat:l.fields.category,g:[...p.g],sub:previous.sub||[],s:'待确认'}];
 a.ttl='天猫上架回执 · '+p.n;
 refreshListingCard(a);drawDw();
}
function setListingField(id,key,value){
 const [,a]=findArt(id),l=listingState(a);if(l.confirmed[1]||!(key in l.fields)||l.fields[key]===value)return;
 l.fields[key]=value;l.confirmed[1]=null;refreshListingChrome(a);
}
function confirmListingStep(id,i){
 const [,a]=findArt(id),l=listingState(a);
 if(![0,1,2,3].includes(i)||l.confirmed[i]||l.loading!==null||l.rejected)return;
 if(i===0&&!PRODS.some(p=>p.sku===l.selected)){toast('请先选择上架商品');return;}
 if(i===1){
  if(!l.confirmed[0]){toast('请先确认上架产品');return;}
  for(const [key,value]of Object.entries(l.fields))if(!value.trim()){
   l.open[1]=true;refreshListingCard(a);if(S.aid===id)drawDw();($('listing-card-'+key)||$('listing-'+key))?.focus();toast('请填写完整的商品字段');return;
  }
  if(!l.image){toast('请选择商品主图');return;}
 }
 if(i===2){
  if(!l.confirmed[0]||!l.confirmed[1]){toast('请先确认上架产品与商品字段');return;}
  if(!l.receipt?.image||l.receipt.failed){toast('请先查看有效的平台回执截图');return;}
 }
 if(i===3){
  if(!l.confirmed[2]){toast('请先批准平台回执截图');return;}
  if(!l.final?.image||l.final.failed){toast('请先查看有效的商品上架结果截图');return;}
 }
 l.confirmed[i]={by:'du',at:new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false})};
 l.open[i]=false;
 if(i<3){
  l.loading=i+1;l.open[i+1]=true;refreshListingCard(a);if(S.aid===id)drawDw();
  const messages=['','AI 正在生成商品字段…','AI 正在提交并等待平台回执…','AI 正在执行商品上架…'];toast(messages[i+1]);
  setTimeout(()=>finishListingGeneration(id,i+1),2000);
  return;
 }
 if(i===3){
  const [task]=findArt(id);a.st='done';a.rows[0].s='回执已确认';
  a.ex='平台回执与商品上架结果均已确认，商品已完成发布。';a.vals=[{l:'商品字段',v:'已确认',s:'ok'},{l:'商品上架',v:'已完成',s:'ok'}];
  task.plan.steps[task.plan.steps.length-1]={l:'商品上架结果已确认',m:'最终截图 · 人工确认完成',s:'ok',r:'刚刚'};
  if(task.arts.every(x=>x.st==='done'))task.st='done';
  a.rows[0].sub.push({k:'sys',tx:'dudu 已确认商品上架结果截图。',at:'刚刚'});render();
 }
 refreshListingCard(a);drawDw();
 toast('商品上架结果已批准');
}
function finishListingGeneration(id,step){
 const [,a]=findArt(id);if(!a?.listing)return;const l=listingState(a);if(l.loading!==step)return;
 if(step===2){l.receipt.image=l.receipt.source;l.receipt.failed=false;}
 if(step===3){l.final.image=l.final.source||l.receipt.source;l.final.failed=false;}
 l.loading=null;l.open[step]=true;refreshListingCard(a);if(S.aid===id)drawDw();
 toast(step===1?'商品字段已生成':step===2?'平台回执已返回，请确认':'商品已上架，最终截图已返回');
}
function openListingReceipt(id){
 const [,a]=findArt(id);listingState(a).open=[false,false,true,false];openDw(id);
}
function listingReceiptContent(a){
 const receipt=listingState(a).receipt;
 if(!receipt?.image)return '<div class="listing-receipt-error">暂无平台回执截图</div>';
 return `<button class="listing-receipt" onclick="previewListingReceipt('${a.id}')" title="点击查看完整回执截图"><img src="${esc(receipt.image)}" alt="平台回执截图" onload="listingReceiptLoaded('${a.id}')" onerror="listingReceiptError(this,'${a.id}')"><span class="listing-receipt-error" hidden>回执截图暂时无法加载，点击重试查看</span></button><div class="listing-receipt-hint">点击查看大图</div>`;
}
function listingFinalContent(a){
 const final=listingState(a).final;
 if(!final?.image)return '<div class="listing-receipt-error">商品完成上架后，最终页面截图会显示在这里</div>';
 return `<button class="listing-receipt" onclick="previewListingResult('${a.id}')" title="点击查看完整上架结果"><img src="${esc(final.image)}" alt="商品上架结果截图" onload="listingFinalLoaded('${a.id}')" onerror="listingFinalError(this,'${a.id}')"><span class="listing-receipt-error" hidden>上架结果截图暂时无法加载</span></button><div class="listing-receipt-hint">商品已上架 · 点击查看大图</div>`;
}
function listingFinalError(img,id){const [,a]=findArt(id);a.listing.final.failed=true;img.hidden=true;const message=img.nextElementSibling;if(message)message.hidden=false;}
function listingFinalLoaded(id){const [,a]=findArt(id);a.listing.final.failed=false;}
function previewListingResult(id){
 const [,a]=findArt(id),final=listingState(a).final;if(!final?.image)return;
 $('mod').innerHTML=`<div class="mbox listing-receipt-modal"><div class="mhd" style="display:flex;align-items:center;justify-content:space-between"><h3>商品上架结果</h3><button class="ib" onclick="closeMod()" aria-label="关闭">×</button></div><div class="mbd"><img class="listing-receipt-full" src="${esc(final.image)}" alt="商品上架结果完整截图"></div><div class="mft"><button class="btn ghost" onclick="closeMod()">关闭</button></div></div>`;$('mod').classList.add('on');
}
function listingReceiptError(img,id){
 const [,a]=findArt(id);a.listing.receipt.failed=true;img.hidden=true;
 const message=img.nextElementSibling;if(message)message.hidden=false;
}
function listingReceiptLoaded(id){const [,a]=findArt(id);a.listing.receipt.failed=false;}
function previewListingReceipt(id){
 const [,a]=findArt(id),receipt=listingState(a).receipt;if(!receipt?.image)return;
 $('mod').innerHTML=`<div class="mbox listing-receipt-modal"><div class="mhd" style="display:flex;align-items:center;justify-content:space-between"><h3>平台回执截图</h3><button class="ib" onclick="closeMod()" aria-label="关闭">×</button></div><div class="mbd"><img class="listing-receipt-full" src="${esc(receipt.image)}" alt="平台回执完整截图" onload="listingReceiptLoaded('${id}')" onerror="listingReceiptError(this,'${id}')"><div class="listing-receipt-error" hidden>回执截图暂时无法加载，请稍后重试。</div></div><div class="mft"><button class="btn ghost" onclick="closeMod()">关闭</button></div></div>`;
 $('mod').classList.add('on');
}
function openListingAssets(id){
 const [,a]=findArt(id),l=listingState(a);
 if(l.confirmed[1])return;
 $('mod').innerHTML=`<div class="mbox"><div class="mhd" style="display:flex;align-items:center;justify-content:space-between"><h3>选择商品主图</h3><button class="ib" onclick="closeMod()" aria-label="关闭">×</button></div><div class="mbd"><div class="listing-assets">${ASSETS.map((x,i)=>x.type==='图片'?`<button class="listing-asset ${x.img===l.image?'selected':''}" onclick="setListingImage('${id}',${i});closeMod()"><img src="${esc(x.img)}" alt="${esc(x.n)}"><span>${esc(x.n)}</span></button>`:'').join('')}</div></div><div class="mft"><button class="btn ghost" onclick="closeMod()">取消</button></div></div>`;
 $('mod').classList.add('on');
}
function setListingImage(id,index){
 const [,a]=findArt(id),l=listingState(a);
 if(l.confirmed[1])return;
 if(index!==null&&ASSETS[index]?.type!=='图片')return;
 l.image=index===null?'':ASSETS[index].img;l.confirmed[1]=null;l.open[1]=true;
 refreshListingCard(a);drawDw();
}
function previewListingImage(id){
 const [,a]=findArt(id),l=listingState(a);if(!l.image)return;
 $('mod').innerHTML=`<div class="mbox"><div class="mhd" style="display:flex;align-items:center;justify-content:space-between"><h3>商品主图</h3><button class="ib" onclick="closeMod()" aria-label="关闭">×</button></div><div class="mbd" style="text-align:center"><img src="${esc(l.image)}" alt="商品主图预览" style="max-width:100%;max-height:60vh;object-fit:contain;border-radius:10px"></div></div>`;
 $('mod').classList.add('on');
}
function dItems(a){
 const okn=a.rows.filter(r=>r.s==='可提交').length;
 return `<div class="note" style="margin-bottom:var(--sp-3)">${a.rows.length===1?'1 个 SKU 一条线程，资质齐全并经人工确认后提交。':`${a.rows.length} 个 SKU 一条线程，有问题的 SKU 不影响其他商品——可以先提交 ${okn} 个。`}</div>
 ${a.rows.map((r,i)=>`<div class="pk" style="margin-bottom:var(--sp-2);${r.flag?'border-color:var(--danger-bd)':''}">
   <div style="display:flex;align-items:flex-start;gap:var(--sp-3);padding:var(--sp-3) 13px">
     <span class="pv sq" style="${grad(r.g[0],r.g[1])};width:44px;height:44px;flex:0 0 44px;border-radius:8px"></span>
     <div style="flex:1;min-width:0">
       <div style="display:flex;align-items:center;gap:var(--sp-2);flex-wrap:wrap">
         <b style="font-size:var(--fs-md)">${esc(r.n)}</b>
         <span class="st ${r.s==='可提交'?'done':'hold'}">${r.s}</span></div>
       <div style="font-size:var(--fs-xs);color:var(--t3);margin-top:var(--sp-1)">${r.sku} · ${r.cat}</div>
       <div style="font-size:var(--fs-xs);color:var(--t2);margin-top:var(--sp-1)">${r.price} · 库存 <span class="num">${r.stock}</span></div>
     </div>
     <button class="rvb ${S.or===i?'on':''}" onclick="toggleRow(${i})">评论 ${subCount(r)?`<span class="n">${subCount(r)}</span>`:''} ${S.or===i?'▴':'▾'}</button>
   </div>
   ${r.flag?`<div class="note" style="background:var(--danger-bg);border-color:var(--danger-bd);color:var(--danger-fg-strong);margin:0 13px 12px">⚠ ${esc(r.flag)}</div>`:''}
   <div class="pk-a" style="border-top:1px solid var(--hairline)">
     ${r.s==='可提交'?`<button class="btn sm" onclick="toast('${esc(r.n)} 已提交上架')">提交上架</button>`
      :`<button class="btn ghost sm" onclick="toast('已通知供应链补检测报告')">催资质</button>
        <button class="btn ghost sm" onclick="toast('已暂缓')">暂缓</button>`}
     <span style="margin-left:auto;font-size:var(--fs-xs);color:var(--t3)">L1 · 不可逆动作需确认</span></div>
   ${S.or===i?`<div style="padding:0 13px 12px">${subPane(a,i)}</div>`:''}
 </div>`).join('')}`;
}
/* Promotion demo owns its rows, images and revisions; no PDP data is referenced. */
function promotionNeedsReview(a){
 const [t]=findArt(a.id),busy=a.promotion.images.some(x=>x.generating);a.st=busy?'run':'review';
 t.st=a.st;t.up='刚刚';t.plan.steps[3].s=busy?'act':'ok';t.plan.steps[3].r=busy?'生成中':'已完成';
 t.plan.steps[t.plan.steps.length-1].s='act';t.plan.steps[t.plan.steps.length-1].r='待审批';
 promotionSync(a);
}
function promotionSync(a){
 const p=a.promotion,ready=p.images.filter(x=>!x.generating).length;
 const budget=p.rows.reduce((sum,r)=>sum+(Number(r.budget)||0),0).toLocaleString('zh-CN');
 a.vals=[{l:'规划表',v:p.rows.length+' 条计划',s:p.rows.length?'ok':'warn'},{l:'推广图片',v:ready+' / '+p.rows.length+' 张',s:ready===p.rows.length&&ready?'ok':'warn'}];
 a.ex=`已整理 ${p.rows.length} 条推广计划及对应创意，${ready} 张图片可供预览与确认，初始预算合计 ¥${budget}。`;
 const [t]=findArt(a.id);if(t){t.plan.steps[2].m=p.rows.length+' 条计划 · 13 个字段 · 初始预算合计 ¥'+budget;t.plan.steps[3].m='按推广计划生成创意图片 · '+p.images.length+' 张';}
}
function promotionRefresh(id){
 const [t]=findArt(id);if(!t)return;
 if((S.view==='thread'&&S.tid===t.id)||S.view==='work'||S.view==='agent')render();
 if(S.aid===id&&!S.ag&&!S.trace&&$('dw').classList.contains('on'))drawDw();
 const modal=document.querySelector('[data-promotion-image]');
 if($('mod').classList.contains('on')&&modal?.dataset.promotionImage===id)drawPromotionImage();
}
function promotionPeek(a){
 const p=a.promotion,x=p.images.find(x=>!x.generating)||p.images[0];
 return `<div class="pk" id="pk-${a.id}"><div class="pk-h"><span class="ty">产出 · 推广计划</span><span class="chip plat">${esc(a.plat)}</span>${artifactRunLink(a.by)}</div>
  <div style="padding:var(--sp-3)"><div class="pdp-card-grid">
   <button class="opt pdp-product-card" onclick="openDw('${a.id}')" style="width:100%">
    <div class="im" style="${x?.src?`background-image:url('${esc(x.src)}');background-size:cover;background-position:center`:'background:var(--hairline)'}"></div>
    <div class="bd"><div class="ot">${esc(a.ttl)}</div><div class="oe">${esc(a.ex)}</div>
     <div class="of"><span class="st ${a.st}">${a.st==='done'?'已批准':'待审批'}</span>
      ${subCount(a)?`<span class="chip mut" onclick="event.stopPropagation();openReview('${a.id}')">评论 ${subCount(a)}</span>`:''}</div></div>
   </button>
  </div></div>
  ${a.vals?.length?`<div class="vals">${a.vals.map(v=>`<span class="val ${v.s}">${v.s==='ok'?'✓':'!'} ${v.l} <span class="m">${v.v}</span></span>`).join('')}</div>`:''}
  <div class="pk-a">${a.promotionReturning
   ?`<div class="listing-reject-inline"><input id="promotion-return-${a.id}" type="text" aria-label="退回原因" placeholder="填写退回原因" value="${esc(a.promotionReturnDraft||'')}" oninput="setPromotionReturnDraft('${a.id}',this.value)"><button class="btn sm" onclick="confirmPromotionReturn('${a.id}')">确认</button><button class="btn ghost sm" onclick="cancelPromotionReturn('${a.id}')">取消</button></div>`
   :`${a.st==='review'?`<button class="btn sm" onclick="approvePromotion('${a.id}')">批准</button><button class="btn ghost sm" onclick="startPromotionReturn('${a.id}')">退回</button>`:''}<button class="btn ghost sm" onclick="openDw('${a.id}')">查看规划表</button><button class="btn ghost sm" onclick="openDw('${a.id}');dtab(1)">查看图片</button><button class="rvb" onclick="openPromotionComments('${a.id}')">评论 ${subCount(a)?`<span class="n">${subCount(a)}</span>`:''}</button><span class="v">v${a.v} · 刚刚</span>`}</div>
  ${a.nxt&&a.st==='done'?`<div class="nxt"><span class="lb">接下来</span>
   ${a.nxt.map(n=>`<button class="na" onclick="toast('${n==='同步到活动'?'已同步到活动':'已在同一线程中新增步骤：'+n}')">${n} →</button>`).join('')}</div>`:''}</div>`;
}
function dPromotionPlan(a){
 if(!a.promotion.rows.length)return '<div class="empty">暂无推广计划</div>';
 S.promotionPlanOpen=S.promotionPlanOpen||{};
 const fields=promotionPlanFields().filter(([field])=>!['screen','productName','planName'].includes(field)).sort(([a],[b])=>a==='slogan'?-1:b==='slogan'?1:0);
 return `<div class="pdp-plan-tools"><span class="count">共 ${a.promotion.rows.length} 条计划</span><button type="button" onclick="setAllPromotionPlans('${a.id}',true)">全部展开</button><button type="button" onclick="setAllPromotionPlans('${a.id}',false)">全部收起</button></div>${a.promotion.rows.map((r,i)=>{const key=a.id+':'+i,open=!!S.promotionPlanOpen[key];return `<div class="pdp-screen-card promotion-plan-preview ${open?'open':''}">
  <button type="button" class="pdp-screen-head" aria-expanded="${open}" onclick="togglePromotionPlan('${a.id}',${i})"><span class="screen">${esc(r.screen)}</span><span class="module">${esc(r.planName)}</span><span class="promotion-plan-stage">${esc(r.stage)}</span><span class="chevron"><i data-lucide="${open?'chevron-up':'chevron-down'}"></i></span></button>
  ${open?`<div class="pdp-screen-body">${fields.map(([field,label])=>{const primary=field==='planName'||field==='slogan',value=r[field]??'',control=field==='budget'?`<input type="number" min="0" step="1" value="${esc(value)}" onchange="setPromotionPlanField('${a.id}',${i},'${field}',this.value)">`:`<textarea rows="${['objective','timeSlot','customAudience','creativeDirection'].includes(field)?3:1}" onchange="setPromotionPlanField('${a.id}',${i},'${field}',this.value)">${esc(value)}</textarea>`;return `<div class="pdp-screen-field ${primary?'primary':''}"><span class="key">${label}</span>${control}</div>`;}).join('')}</div>`:''}</div>`;}).join('')}`;
}
function togglePromotionPlan(id,i){S.promotionPlanOpen=S.promotionPlanOpen||{};const key=id+':'+i;S.promotionPlanOpen[key]=!S.promotionPlanOpen[key];drawDw();}
function setAllPromotionPlans(id,open){const [,a]=findArt(id);if(!a?.promotion)return;S.promotionPlanOpen=S.promotionPlanOpen||{};a.promotion.rows.forEach((_,i)=>S.promotionPlanOpen[id+':'+i]=open);drawDw();}
function dPromotionImages(a){
 const images=a.promotion.images;
 return `<div style="font-size:var(--fs-sm);color:var(--t2);margin-bottom:var(--sp-3)">推广图片 · ${images.length} 张</div><div class="imgs">${images.map((x,i)=>`<button class="imgc ${x.generating?'generating':''}" onclick="openPromotionImage('${a.id}',${i})" style="${x.generating?'':`background-image:url('${esc(x.src)}');background-size:cover;background-position:center`}"><span class="lb">${esc(x.l)}</span>${x.generating?'<div class="detail-card-generating"><span class="spin"></span><span>图片生成中...</span></div>':''}</button>`).join('')}</div>${images.length?'':'<div class="empty">暂无图片</div>'}`;
}
function dPromotionVersions(a){return a.promotion.versions.map(v=>`<div class="vrow"><span class="vv">v${v.v}</span><span class="vt">${esc(v.label)}</span><span class="vd">${esc(v.at)}</span></div>`).join('');}
function promotionFooter(a){
 if(S.dtab>1)return '';
 return `${a.st==='review'?`<button class="btn" onclick="approvePromotion('${a.id}')">批准</button>`:''}${S.dtab===0?`<button class="btn ghost" onclick="downloadPromotionImages('${a.id}',null,this)" ${a.promotion.images.some(x=>!x.generating)?'':'disabled'}><i data-lucide="download"></i>批量下载</button>`:`<button class="btn ghost" onclick="downloadPromotionPlan('${a.id}')"><i data-lucide="download"></i>下载规划表</button>`}<button class="rvb ${S.pc?'on':''}" onclick="togglePromotionComment()">评论 ${subCount(a)?`<span class="n">${subCount(a)}</span>`:''} ${S.pc?'▴':'▾'}</button>`;
}
function approvePromotion(id){
 const [t,a]=findArt(id);if(!a?.promotion)return;
 if(!promotionPlanValid(a))return;
 if(!a.promotion.rows.length||a.promotion.images.length!==a.promotion.rows.length||a.promotion.images.some(x=>x.generating)){toast('请先完成所有规划对应的图片');return;}
 if(a.promotion.rows.some(r=>r.dirty)){toast('规划已调整，请先根据规划表重新生成图片');return;}
 a.st='done';t.st='done';t.up='刚刚';const last=t.plan.steps[t.plan.steps.length-1];last.s='ok';last.r='已批准';promotionSync(a);
 promotionRefresh(id);if(S.aid===id)closeDw();toast('推广计划已批准，规划表与图片已交付');
}
function startPromotionReturn(id){
 const [,a]=findArt(id);if(!a?.promotion)return;
 a.promotionReturning=true;a.promotionReturnDraft='';render();
 setTimeout(()=>$('promotion-return-'+id)?.focus(),0);
}
function setPromotionReturnDraft(id,value){const [,a]=findArt(id);if(a?.promotion)a.promotionReturnDraft=value;}
function cancelPromotionReturn(id){
 const [,a]=findArt(id);if(!a?.promotion)return;
 a.promotionReturning=false;a.promotionReturnDraft='';render();
}
function confirmPromotionReturn(id){
 const [t,a]=findArt(id);if(!t||!a?.promotion)return;
 const reason=(a.promotionReturnDraft||'').trim();
 if(!reason){toast('请填写退回原因');$('promotion-return-'+id)?.focus();return;}
 (a.sub=a.sub||[]).push({w:'du',k:'chg',tx:'退回原因：'+reason,at:'刚刚'});
 a.returnReason=reason;a.promotionReturning=false;a.promotionReturnDraft='';a.st='run';t.st='run';t.up='刚刚';
 render();renderNav();toast('推广计划已退回，原因已记录');
}
function openPromotionPlan(id){
 const [,a]=findArt(id);if(!a?.promotion)return;const rows=a.promotion.rows;
 $('mod').classList.remove('asset-mode');
 $('mod').innerHTML=`<div class="mbox direction-plan-modal promotion-plan-modal"><div class="direction-plan-head"><h3>推广计划表</h3><span class="chip plat">${esc(a.plat)}</span><span class="meta">${rows.length} 条计划</span><button class="ib close" onclick="finishPromotionPlan('${id}')" title="关闭"><i data-lucide="x"></i></button></div><div class="direction-plan-body"><div class="direction-plan-grid"><div class="direction-plan-row head">${[...promotionPlanFields().map(([,label])=>label),'操作'].map(label=>`<div class="direction-plan-cell">${label}</div>`).join('')}</div>${rows.map((r,i)=>promotionPlanRow(a,i,r)).join('')}</div></div><div class="mft direction-plan-foot"><button class="btn ghost" onclick="downloadPromotionPlan('${id}')"><i data-lucide="download"></i>下载</button><button class="btn ghost" onclick="finishPromotionPlan('${id}')">完成</button></div></div>`;
 $('mod').classList.add('on','plan-mode');kpIcons();
}
function promotionPlanRow(a,i,r){
 const cells=promotionPlanFields().map(([key,label])=>{
  const attrs=`aria-label="${esc(r.screen)} ${label}" oninput="setPromotionPlanField('${a.id}',${i},'${key}',this.value)"`;
  const field=key==='screen'?esc(r[key]):key==='budget'?`<input type="number" min="0" step="1" ${attrs} value="${esc(r[key])}">`:`<textarea rows="7" ${attrs}>${esc(r[key])}</textarea>`;
  return `<div class="direction-plan-cell ${key==='screen'?'screen':key==='planName'?'module':''}">${field}</div>`;
 });
 return `<div class="direction-plan-row">${cells.join('')}<div class="direction-plan-cell"><button class="delete" title="删除计划及对应图片" aria-label="删除计划及对应图片" onclick="deletePromotionRow('${a.id}',${i})"><i data-lucide="trash-2"></i></button></div></div>`;
}
function setPromotionPlanField(id,i,key,value){
 const [,a]=findArt(id);if(!a?.promotion.rows[i]||!promotionPlanFields().some(([k])=>k===key))return;
 if(a.promotion.rows[i][key]===value)return;
 const r=a.promotion.rows[i];r[key]=value;a.promotion.planDirty=true;
 if(['productName','customAudience','creativeDirection','slogan'].includes(key)){r.dirty=true;r.revision++;}
 const x=a.promotion.images.find(im=>im.rowId===r.id);if(x){x.l=promotionImageLabel(r);x.prompt=promotionPrompt(r);}
 promotionNeedsReview(a);
}
function addPromotionRow(id){
 const [,a]=findArt(id),p=a?.promotion;if(!p)return;
 const n=p.nextId++,base=p.rows[0]||promotionDemoData().rows[0];
 p.rows.push({...Object.fromEntries(promotionPlanFields().map(([key])=>[key,''])),id:'promo-row-'+n,screen:'计划'+n,productName:base.productName,stage:'新客拉新阶段',planName:'新推广计划',budget:'0',src:base.src,revision:0,dirty:true});p.planDirty=true;promotionNeedsReview(a);openPromotionPlan(id);promotionRefresh(id);
}
function deletePromotionRow(id,i){
 const [,a]=findArt(id),p=a?.promotion;if(!p||!p.rows[i]||!confirm('删除这条推广计划及其对应图片？'))return;
 const [row]=p.rows.splice(i,1);p.images=p.images.filter(x=>x.rowId!==row.id);p.planDirty=true;promotionNeedsReview(a);openPromotionPlan(id);promotionRefresh(id);
}
function promotionVersion(a,label){a.v++;a.promotion.versions.unshift({v:a.v,label,at:'刚刚'});}
function finishPromotionPlan(id){
 const [,a]=findArt(id);if(a?.promotion.planDirty){promotionVersion(a,'调整推广计划表');a.promotion.planDirty=false;}
 closeMod();promotionRefresh(id);
}
function downloadPromotionPlan(id){
 const [,a]=findArt(id);if(!a?.promotion)return;
 const fields=promotionPlanFields(),rows=[fields.map(([,label])=>label),...a.promotion.rows.map(r=>fields.map(([key])=>r[key]))];
 const csv='\uFEFF'+rows.map(row=>row.map(value=>'"'+String(value??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');
 const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');
 link.href=url;link.download=(a.ttl+'表').replace(/[\\/:*?"<>|]/g,'-')+'.csv';document.body.appendChild(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(url),10000);toast('推广计划表已下载');
}
function generatePromotionImages(id){
 const [,a]=findArt(id),p=a?.promotion;if(!p||p.images.some(x=>x.generating))return;
 if(!promotionPlanValid(a))return;
 const old=p.images;p.images=p.rows.map(r=>{const previous=old.find(x=>x.rowId===r.id);return {...promotionImageFromRow(r),...(previous?{refs:previous.refs.map(ref=>({...ref})),version:previous.version+1}:{}),generating:true};});
 const batch=p.images;p.planDirty=false;promotionNeedsReview(a);closeMod();if(S.aid===id)S.dtab=1;promotionRefresh(id);
 setTimeout(()=>{const remaining=batch.filter(x=>p.images.includes(x));if(!remaining.length)return;remaining.forEach(x=>{x.generating=false;const r=p.rows.find(row=>row.id===x.rowId);if(r&&r.revision===x.generatedRevision)r.dirty=false;});promotionVersion(a,'重新生成 · '+remaining.length+' 张推广图片');promotionNeedsReview(a);promotionRefresh(id);toast('推广图片模拟生成完成');},1800);
}
function promotionPlanValid(a){
 const rows=a.promotion.rows;
 if(!rows.length||rows.some(r=>!r.productName.trim()||!r.planName.trim()||!r.creativeDirection.trim()||!r.slogan.trim())){toast('请补齐产品名称、计划名称、广告创意方向和广告标语');return false;}
 if(rows.some(r=>r.budget.trim()===''||!Number.isFinite(Number(r.budget))||Number(r.budget)<0)){toast('初始预算需填写不小于 0 的金额');return false;}
 return true;
}
function openPromotionImage(id,index){
 const [,a]=findArt(id),x=a?.promotion.images[index];if(!x)return;
 S.promotionImage={aid:id,imageId:x.id};a.promotion.images.forEach(im=>{const pre=new Image();pre.src=im.src;});drawPromotionImage();
}
function promotionImageContext(){
 const ctx=S.promotionImage;if(!ctx)return null;const [,a]=findArt(ctx.aid),images=a?.promotion?.images;if(!images)return null;
 const i=images.findIndex(x=>x.id===ctx.imageId);if(i<0)return null;
 const r=a.promotion.rows.find(row=>row.id===images[i].rowId);return r?{a,images,i,x:images[i],r}:null;
}
function stepPromotionImage(step){
 const c=promotionImageContext();if(!c)return;S.promotionImage.imageId=c.images[(c.i+step+c.images.length)%c.images.length].id;drawPromotionImage();
}
function drawPromotionImage(){
 const c=promotionImageContext();if(!c){closeMod();return;}const {a,x,i,images,r}=c;
 $('mod').classList.remove('plan-mode','asset-mode');
 $('mod').innerHTML=`<div class="img-modal-wrap promotion-image-wrap" data-promotion-image="${a.id}">
  <button class="img-modal-nav prev" onclick="stepPromotionImage(-1)" title="上一张" ${images.length<2?'disabled':''}><i data-lucide="chevron-left"></i></button>
  <div class="mbox img-detail detail-view promotion-image-modal">
   <div class="img-stage ${x.generating?'is-generating':''}" style="--img-bg:url('${esc(x.src)}')"><span class="img-count">${i+1} / ${images.length}</span><img src="${esc(x.src)}" alt="${esc(r.planName)}"><div class="img-gen"><i></i><span>图片生成中…</span></div></div>
   <div class="img-side">
    <div class="img-side-h"><div class="detail-title-row"><div class="ey">${esc(r.screen)} · ${esc(r.planName)}</div></div><button class="ib" onclick="closeMod();promotionRefresh('${a.id}')" title="关闭"><i data-lucide="x"></i></button></div>
    <div class="img-side-b">
     <div class="fld"><label for="promotion-slogan">广告标语</label><input id="promotion-slogan" value="${esc(r.slogan)}" oninput="setPromotionImageField('slogan',this.value)"></div>
     <div class="fld"><label for="promotion-creative">广告创意方向</label><textarea class="promotion-creative" id="promotion-creative" oninput="setPromotionImageField('creativeDirection',this.value)">${esc(r.creativeDirection)}</textarea></div>
     <details class="promotion-audience" ${x.audienceOpen?'open':''} ontoggle="setPromotionAudienceOpen('${a.id}','${x.id}',this.open)"><summary>自定义人群摘要<i data-lucide="chevron-down"></i></summary><textarea aria-label="自定义人群摘要" oninput="setPromotionImageField('customAudience',this.value)">${esc(r.customAudience)}</textarea></details>
     <div class="fld"><label>参考图</label><div class="img-ref promotion-refs">${x.refs.map((ref,n)=>`<div class="thumb" title="${esc(ref.name)}" style="background-image:url('${esc(ref.url)}')"><button class="promotion-ref-remove" onclick="removePromotionReference(${n})" title="移除参考图"><i data-lucide="x"></i></button></div>`).join('')}<span class="ref-add-wrap"><button class="add" onclick="togglePromotionReferenceMenu(event)" title="添加参考图"><i data-lucide="plus"></i><span>Ref.</span></button>${S.refMenuOpen?referenceMenu():''}</span></div></div>
    </div>
    <div class="img-side-f"><button class="btn ghost sm" onclick="adjustPromotionImage()" ${x.generating?'disabled':''}>用作参考图</button><button class="btn ghost sm" onclick="downloadPromotionImages('${a.id}',${i},this)" ${x.generating?'disabled':''}>下载图片</button><button class="btn sm" style="margin-left:auto" onclick="regeneratePromotionImage()" ${x.generating?'disabled':''}>${x.generating?'生成中…':'重新生成'}</button></div>
   </div>
  </div>
  <button class="img-modal-nav next" onclick="stepPromotionImage(1)" title="下一张" ${images.length<2?'disabled':''}><i data-lucide="chevron-right"></i></button>
 </div>`;
 $('mod').classList.add('on');kpIcons();
}
function setPromotionImageField(key,value){
 const c=promotionImageContext();if(!c||!['slogan','creativeDirection','customAudience'].includes(key))return;
 setPromotionPlanField(c.a.id,c.a.promotion.rows.indexOf(c.r),key,value);
}
function setPromotionAudienceOpen(id,imageId,open){
 const [,a]=findArt(id),x=a?.promotion.images.find(im=>im.id===imageId);if(x)x.audienceOpen=open;
}
function promotionReferenceChanged(c){c.r.dirty=true;c.r.revision++;promotionNeedsReview(c.a);}
function adjustPromotionImage(){
 const c=promotionImageContext();if(!c)return;if(c.x.generating){toast('图片生成完成后可用作参考图');return;}
 if(!c.x.refs.some(ref=>ref.url===c.x.src)){c.x.refs.push({name:c.r.planName,url:c.x.src});promotionReferenceChanged(c);}
 drawPromotionImage();const input=$('promotion-creative');if(input){input.focus();input.setSelectionRange(input.value.length,input.value.length);}toast('当前图片已作为参考图');
}
function referenceMenu(handler='choosePromotionReference',extraArgs='',includeRestore=true){
 const choose=label=>`${handler}('${label}',event${extraArgs})`;
 return `<div class="ref-menu" role="menu" aria-label="添加参考图方式">
  <button role="menuitem" onclick="${choose('素材库')}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg><span>素材库</span></button>
  <button role="menuitem" onclick="${choose('本地上传')}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M5 20h14"/></svg><span>本地上传</span></button>
  ${includeRestore?`<button role="menuitem" onclick="${choose('恢复默认参考图')}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12a8 8 0 0 1 13.7-5.6"/><path d="M18 3v4h-4"/><path d="M20 12a8 8 0 0 1-13.7 5.6"/><path d="M6 21v-4h4"/></svg><span>恢复默认参考图</span></button>`:''}
 </div>`;
}
function redrawReferenceMenuHost(){
 if(S.promotionImage)drawPromotionImage();
 else drawPlanImage();
}
function togglePromotionReferenceMenu(event){
 if(event)event.stopPropagation();
 S.refMenuOpen=!S.refMenuOpen;
 redrawReferenceMenuHost();
}
function choosePromotionReference(label,event){
 if(event)event.stopPropagation();
 S.refMenuOpen=false;
 redrawReferenceMenuHost();
 toast(label+' · 展示菜单，暂未接入操作');
}
function removePromotionReference(i){const c=promotionImageContext();if(!c||!c.x.refs[i])return;c.x.refs.splice(i,1);promotionReferenceChanged(c);drawPromotionImage();}
function regeneratePromotionImage(){
 const c=promotionImageContext();if(!c||c.x.generating)return;if(!c.r.creativeDirection.trim()||!c.r.slogan.trim()){toast('请填写广告标语和广告创意方向');return;}
 const {a,x,r}=c,revision=r.revision;x.prompt=promotionPrompt(r);x.generating=true;promotionNeedsReview(a);promotionRefresh(a.id);
 setTimeout(()=>{if(!a.promotion.images.includes(x))return;x.generating=false;x.version++;x.generatedRevision=revision;if(r.revision===revision)r.dirty=false;promotionVersion(a,'重新生成 · '+x.l);promotionNeedsReview(a);promotionRefresh(a.id);toast('图片模拟生成完成');},1600);
}
async function downloadPromotionImages(id,index,button){
 const [,a]=findArt(id);if(!a?.promotion)return;const images=(index===null?a.promotion.images:[a.promotion.images[index]]).filter(x=>x&&!x.generating);if(!images.length){toast('暂无可下载的图片');return;}
 if(button)button.disabled=true;let count=0;
 for(const x of images){try{const response=await fetch(x.src);if(!response.ok)throw new Error('Image unavailable');const blob=await response.blob(),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='推广计划-'+x.l.replace(/[\\/:*?"<>|]/g,'-')+(blob.type.includes('png')?'.png':blob.type.includes('webp')?'.webp':'.jpg');document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);count++;}catch(e){/* Keep downloading the other images if one source fails. */}}
 if(button)button.disabled=false;toast(count===images.length?'已发起 '+count+' 张图片下载':`已发起 ${count} 张下载，${images.length-count} 张读取失败，请重试`);
}

/* ---- 详情页 as a sequence (Sam: 提需求 → 读产品品牌数据 → 规划详情表 → 图片) ---- */
const PDPROWS=[
 ['商品标题','A8OPARIS 修护安瓶精华 30ml 敏感肌屏障修护 11.11 会场','产品中心 + 主推方向二','ok'],
 ['核心卖点 1','真实修护感：第 3 周可见的细节变化','方向二 · 已批准','ok'],
 ['核心卖点 2','8 周实验对比数据支撑','知识库 · 成分实验','ok'],
 ['核心卖点 3','敏感肌可用，屏障受损期也能上','品牌智库 · 用户洞察','ok'],
 ['A+ 模块','品牌故事 / 成分实验 / 使用方法 / 敏感肌说明 / 会场利益点','模板 · 详情页 A+ 骨架','ok'],
 ['会场价','¥259 · 会场 ¥219','产品中心 · 会场价格表','ok'],
 ['配图','9 张 · 已生成 8 张','素材库 + AI 生成','warn']];
function dPdpTable(a){
 const [,directions]=findArt('a4-direction');
 const i=Number.isInteger(a.sourceDirection)?a.sourceDirection:1;
 const o=directions&&directions.opts?directions.opts[i]:null;
 const rows=a.planRows||(o&&o.plan?o.plan:directionPlanRows(i));
 return dPdpPlanRows(a.id,i,rows,false);
}
function dDirectionPlanPreview(a,i){
 const o=a.opts[i],rows=o&&o.plan?o.plan:directionPlanRows(i);
 return dPdpPlanRows(a.id,i,rows,true);
}
function dDirectionImages(){return `<div class="direction-image-grid">${dImgs({})}</div>`;}
function dPdpPlanRows(aid,i,rows,editable=false){
 const stateClass=x=>x==='包含产品'?'include':x==='产品作为辅助元素出现'?'assist':'exclude';
 const field=(rowIndex,key,label,value,primary=false,textRows=1)=>`<div class="pdp-screen-field ${primary?'primary':''}"><span class="key">${label}</span>${editable?`<textarea rows="${textRows}" onchange="setDirectionPlanField('${aid}',${i},${rowIndex},'${key}',this.value)">${esc(value||'')}</textarea>`:`<span class="value">${esc(value||'')}</span>`}</div>`;
 S.pdpPlanOpen=S.pdpPlanOpen||{};
 const rowKey=n=>`${aid}:${i}:${n}`;
 return `<div class="pdp-plan-tools"><span class="count">共 ${rows.length} 屏</span><button type="button" onclick="setPdpPlanRows('${aid}',${i},true)">全部展开</button><button type="button" onclick="setPdpPlanRows('${aid}',${i},false)">全部收起</button></div>${rows.map((r,n)=>{const open=!!S.pdpPlanOpen[rowKey(n)];return `<div class="pdp-screen-card ${open?'open':''}">
   <button type="button" class="pdp-screen-head" aria-expanded="${open}" onclick="togglePdpPlanRow('${aid}',${i},${n})"><span class="screen">${esc(r.screen)}</span><span class="module">${esc(r.module)}</span>
    <span class="detail-product-state ${stateClass(r.product)}">${esc(r.product)}</span><span class="chevron"><i data-lucide="${open?'chevron-up':'chevron-down'}"></i></span></button>
   ${open?`<div class="pdp-screen-body">
    ${field(n,'title','主标题',r.title,true)}
    ${field(n,'subtitle','副标题',r.subtitle)}
    ${field(n,'points','其他卖点',r.points)}
    ${field(n,'subject','画面主体',r.subject,false,2)}
    ${field(n,'assist','辅助元素',r.assist,false,2)}
    ${field(n,'style','色彩与风格',r.style,false,2)}
   </div>`:''}</div>`;}).join('')}`;
}
function togglePdpPlanRow(aid,directionIndex,rowIndex){
 S.pdpPlanOpen=S.pdpPlanOpen||{};
 const key=`${aid}:${directionIndex}:${rowIndex}`;
 S.pdpPlanOpen[key]=!S.pdpPlanOpen[key];
 drawDw();
}
function setPdpPlanRows(aid,directionIndex,open){
 const [,art]=findArt(aid);
 const [,directions]=findArt('a4-direction');
 const option=directions&&directions.opts?directions.opts[directionIndex]:null;
 const rows=art?.planRows||(art?.m1?(art.planRows||(art.planRows=directionPlanRows(Number.isInteger(art.sourceDirection)?art.sourceDirection:1))):(option&&option.plan?option.plan:directionPlanRows(directionIndex)));
 S.pdpPlanOpen=S.pdpPlanOpen||{};
 rows.forEach((_,rowIndex)=>{S.pdpPlanOpen[`${aid}:${directionIndex}:${rowIndex}`]=open;});
 drawDw();
}
/* ---- 推广计划 as one table (Sam: 表格形式，最终生成创意图片) ---- */
function dAdTable(a){
 const tot=a.plans.reduce((n,p)=>n+parseInt(p[2].replace(/\D/g,'')),0);
 return '<div class="note" style="margin-bottom:var(--sp-3)">策略和预算是<b>同一张表</b>，不是两份文档——每个计划的人群、预算、出价目标在一行里看完。'
  +'表定下来之后，产出是<b>创意图片</b>。</div>'
  +'<div class="adhead"><span style="flex:1.4">计划</span><span style="flex:1">渠道</span>'
  +'<span style="width:78px;text-align:right">预算</span><span style="width:46px;text-align:right">占比</span>'
  +'<span style="flex:1.2">出价目标</span></div>'
  +a.plans.map(p=>'<div class="adrow"><span style="flex:1.4;min-width:0"><b style="font-size:var(--fs-sm)">'+esc(p[0])+'</b>'
   +'<span style="display:block;font-size:var(--fs-xs);color:var(--t3)">'+esc(p[5])+'</span></span>'
   +'<span style="flex:1;font-size:var(--fs-xs);color:var(--t2)">'+esc(p[1])+'</span>'
   +'<span style="width:78px;text-align:right" class="num">'+p[2]+'</span>'
   +'<span style="width:46px;text-align:right"><span class="chip lv">'+p[3]+'</span></span>'
   +'<span style="flex:1.2;font-size:var(--fs-xs);color:var(--t2)">'+esc(p[4])+'</span></div>').join('')
  +'<div class="adrow" style="border-top:2px solid var(--border);font-weight:700">'
  +'<span style="flex:1.4">合计</span><span style="flex:1"></span>'
  +'<span style="width:78px;text-align:right" class="num">¥'+tot.toLocaleString()+'</span>'
  +'<span style="width:46px;text-align:right">100%</span><span style="flex:1.2"></span></div>'
  +'<div class="note" style="margin-top:var(--sp-3)">预算是 agent 的<b>硬约束</b>，不是建议。跑满自动停，不会悄悄超支。'
  +'下一步是 3 组创意图 —— 在同一条线程里。</div>';
}

/* ---- strategy doc ---- */
function dOut(a){
 return `<div class="ctx">${a.vals.map(v=>`<div class="ctxr"><span class="k">${v.l}</span><span class="v" style="${v.s==='bad'?'color:var(--danger-fg)':v.s==='warn'?'color:var(--warn-fg)':''}">${v.v}</span></div>`).join('')}</div>
 <div class="note" style="margin-top:var(--sp-3)">校验没过的 SKU 不能一键提交。上架是不可逆动作，L1 要求逐个确认。</div>`;
}
function dStrat(a){
 return `<div style="font-size:var(--fs-md);color:var(--t2);line-height:1.7;margin-bottom:var(--sp-4)">${esc(a.ex)}</div>
 ${a.sec.map(x=>`<div style="margin-bottom:var(--sp-3)"><div style="font-size:var(--fs-sm);font-weight:600;margin-bottom:var(--sp-1)">${esc(x[0])}</div>
   <div style="font-size:var(--fs-sm);color:var(--t2);line-height:1.7">${esc(x[1])}</div></div>`).join('')}`;
}
/* ---- budget table ---- */
function dBudget(a){
 return `<div class="ctx" style="margin-bottom:var(--sp-3)">
   <div class="ctxr"><span class="k">总预算</span><span class="v num">¥120,000</span></div>
   <div class="ctxr"><span class="k">计划数</span><span class="v num">4 + 机动</span></div>
   <div class="ctxr"><span class="k">超支保护</span><span class="v">达到 100% 自动暂停</span></div></div>
 ${a.budget.map(b=>`<div style="border:1px solid var(--border);border-radius:var(--r);padding:var(--sp-3) 13px;margin-bottom:var(--sp-2)">
   <div style="display:flex;align-items:center;gap:var(--sp-2)">
     <b style="font-size:var(--fs-sm);flex:1">${esc(b[0])}</b>
     <span class="num" style="font-size:var(--fs-md);font-weight:700">${b[1]}</span>
     <span class="chip lv">${b[2]}</span></div>
   <div style="height:5px;background:#EDE9FE;border-radius:3px;margin-top:var(--sp-2);overflow:hidden">
     <i style="display:block;height:100%;width:${b[2]};background:linear-gradient(90deg,var(--primary-lt),var(--primary));border-radius:3px"></i></div>
   <div style="font-size:var(--fs-xs);color:var(--t3);margin-top:var(--sp-1)">${esc(b[3])}</div></div>`).join('')}
 <div class="note">预算是 Agent 的硬约束，不是建议。跑满自动停，不会悄悄超支。</div>`;
}

/* ---- 达人 Brief (Sophie 4 / Sam 7203:35) ---- */
const BRIEFT={
 hook:'开场不要用产品，用你自己的场景。第一句话说清你为什么开始用修护类产品。',
 must:['必须出现：敏感肌可用 · 第 3 周的具体变化','不可协商：不要种草话术，用你自己的说法','必须标注：广告/合作标识'],
 avoid:['绝对化用语（最、第一、永久）','与竞品比价','未经检测支持的功效宣称'],
 deliver:['初稿 3 个工作日内','发布前 24 小时给我们过一眼','发布后 7 天回传数据']};
function briefTitle(r){return `11.11 ${r.n}合作内容 Brief`;}
function briefBody(r){
 return `# 一、本次合作与产品重点
你好，${r.n}。本次合作围绕 11.11 敏感肌修护活动展开，希望通过真实体验分享提升品牌认知与信任感。内容请保持自然、克制，重点呈现实际使用过程与第 3 周的具体变化。

# 二、内容方向建议
${BRIEFT.hook}

# 三、必须完成的内容
- ${BRIEFT.must.join('\n- ')}

# 四、创作与画面要求
- 画面保持自然生活感，避免过度精修和明显广告式摆拍
- 产品使用过程和肤感变化需要清晰可见

这里可以加入产品图片：

# 五、内容红线与互动
- ${BRIEFT.avoid.join('\n- ')}
- 评论区如遇产品功效问题，请使用品牌确认过的统一口径

# 六、品牌支持与交付
- ${BRIEFT.deliver.join('\n- ')}`;
}
function briefCommentPane(a,i){
 const r=a.rows[i],comments=r.briefSub||[],count=comments.filter(m=>m.k!=='sys').length;
 return `<div class="sub-w">
   <div class="note" style="margin-bottom:var(--sp-3);font-size:var(--fs-xs)">这些评论只针对「${esc(r.n)}」的当前 Brief，其他达人的 Brief 看不到，也不会被修改。</div>
   <div class="sub-h"><span class="t">评论</span><span class="chip mut">${esc(r.n)} · Brief</span>
     <span class="s">${count} 条 · 只属于这份 Brief</span></div>
   <div class="sub-l" id="brief-sl">${subMsgs(comments)}</div>
   <div class="sub-c">
     <div style="position:relative"><div id="m-brief-si"></div>
       <textarea id="brief-si" oninput="onKey(event,'brief-si')" placeholder="写给同事看 → 对同事说；写给 Ai 改 → 对Ai说。输入 @ 提到人。"></textarea></div>
     <div class="row2">
       <button class="btn sm" onclick="briefCommentSend('chg',${i})">对Ai说</button>
       <button class="btn ghost sm" onclick="briefCommentSend('note',${i})">对同事说</button>
       <button class="btn ghost sm" data-mention-toggle onclick="showMent('brief-si',false,this)" title="提到某人">@</button>
     </div></div></div>`;
}
function scrollBriefCommentIntoView(){
 const pane=$('brief-comment-pane');if(!pane)return;
 const body=pane.closest('.dw-b');
 if(body)body.scrollTo({top:body.scrollHeight,behavior:'smooth'});
}
function toggleBriefComment(i){
 const opening=!S.briefComment;S.briefComment=opening;openBrief(i,true);
 if(opening)requestAnimationFrame(()=>requestAnimationFrame(scrollBriefCommentIntoView));
}
function briefCommentSend(kind,i){
 const input=$('brief-si');if(!input||!input.value.trim()){toast('先写点什么');return;}
 const [,a]=findArt('a7'),r=a.rows[i];r.briefSub=r.briefSub||[];
 r.briefSub.push({w:'du',k:kind==='chg'?'chg':undefined,tx:input.value.trim(),at:'刚刚'});
 if(kind==='chg'){
  r.briefSub.push({w:'kol',k:'ag',tx:'收到。已按你的说明更新这份 Brief，其他达人 Brief 未改动。',at:'刚刚'});
  r.briefSub.push({k:'sys',tx:'已更新「'+r.n+'」的 Brief · 其他达人未动'});
  toast('已要求修改这份 Brief');
 }else toast('已留言');
 openBrief(i,true);const list=$('brief-sl');if(list)list.scrollTop=list.scrollHeight;
}
function openBrief(i,keepComment=false){
 const [,a]=findArt('a7');const r=a.rows[i];S.brief=i;if(!keepComment)S.briefComment=false;
 const briefCount=(r.briefSub||[]).filter(m=>m.k!=='sys').length;
 $('dw').innerHTML=`<div class="dw-h">
   <button class="ib" onclick="S.brief=null;drawDw()"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg></button>
   <div style="flex:1;min-width:0"><div class="ty">达人合作 Brief</div>
     <div class="brief-headline"><h3>${esc(r.n)}</h3><span class="chip mut">草稿</span><span class="chip lv">资料齐备</span><span style="font-family:'Sora';font-size:var(--fs-xs);color:var(--t3)">v5 · AI 生成</span></div></div>
   <button class="ib" onclick="closeDw()"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button></div>
  <div class="dw-b">
   <div class="fld"><label>简报标题</label><input value="${esc(briefTitle(r))}"></div>
   <div class="fld" style="margin-bottom:0"><label>达人可见正文 <span class="brief-help">Markdown · 合作与产品重点 / 内容方向建议 / 必须完成的内容 / 创作与画面要求 / 内容红线与互动 / 品牌支持与交付</span></label>
     <textarea class="brief-editor">${esc(briefBody(r))}</textarea></div>
   ${S.briefComment?`<div class="brief-comment-pane" id="brief-comment-pane">${briefCommentPane(a,i)}</div>`:''}
  </div>
  <div class="dw-f brief-footer">
   <button class="rvb ${S.briefComment?'on':''}" onclick="toggleBriefComment(${i})">评论 ${briefCount?`<span class="n">${briefCount}</span>`:''} ${S.briefComment?'▴':'▾'}</button>
   <select class="brief-foot-select" aria-label="内容类型"><option>图文</option><option>视频</option></select>
   <select class="brief-foot-select" aria-label="简报状态"><option>草稿</option><option selected>待发送</option><option>已发送</option></select>
   <span style="flex:1"></span>
   <button class="btn ghost" onclick="toast('已导出 CSV')">CSV</button>
   <button class="btn ghost" onclick="toast('已导出 PDF')">PDF</button>
  </div>`;
 $('dw').classList.add('on');$('scrim').classList.add('on');
}

/* ---- roster (KOL) drawer ---- */
const RST={'候选':'todo','洽谈中':'run','已确认':'done','合作中':'run','已完成':'done','已淘汰':'hold'};
function kolSet(i,st){
 const [,a]=findArt('a7');const r=a.rows[i];const old=r.s;r.s=st;
 (r.sub=r.sub||[]).push({k:'sys',tx:'状态：'+old+' → '+st+' · 由 dudu 操作'});
 drawDw();render();toast(r.n+' → '+st);
}
function toggleRow(i){S.or=(S.or===i?null:i);drawDw();}
const CSRC={xhs:{n:'小红书',c:'#E11D48'},dy:{n:'抖音',c:'#0891B2'}};
const CREATOR_RATES=[['¥480','¥1,600','¥480'],['¥450','¥800','¥450'],['¥600','¥2,000','¥600'],['¥380','¥700','¥380'],['¥1,200','¥3,200','¥1,200'],['¥800','¥2,400','¥800'],['¥1,500','¥3,600','¥1,500'],['¥1,000','¥2,800','¥1,000']];
function creatorRates(i){return CREATOR_RATES[i]||['¥480','¥1,600','¥480'];}
function creatorPriceBand(i){const n=Number(creatorRates(i)[0].replace(/[^0-9]/g,''));return n<=500?'low':n<1000?'mid':n<=2000?'high':'other';}
function dRoster(a){
 if(Number.isInteger(S.auditCreator))return dContentAudit(a,S.auditCreator,true);
 const by={};a.rows.forEach(r=>by[r.s]=(by[r.s]||0)+1);
 const tags=[...new Set(a.rows.flatMap(r=>r.tags||[]))];
 const ft=S.ktag&&tags.includes(S.ktag)?S.ktag:null;
 const fs=S.kstatus&&Object.prototype.hasOwnProperty.call(RST,S.kstatus)?S.kstatus:null;
 const fp=['low','mid','high'].includes(S.kprice)?S.kprice:null;
 const priceMeta=[['low','¥0–¥500',2],['mid','¥500–¥1,000',3],['high','¥1,000–¥2,000',3]];
 const priceStats=Object.fromEntries(priceMeta.map(([k,,target])=>{const list=a.rows.filter((r,i)=>creatorPriceBand(i)===k);return[k,{target,candidates:list.length,approved:list.filter(r=>['已确认','合作中','已完成'].includes(r.s)).length}]}));
 const rows=a.rows.filter((r,i)=>(!ft||(r.tags||[]).includes(ft))&&(!fs||r.s===fs)&&(!fp||creatorPriceBand(i)===fp));
 return `<div class="roster-statuses">
   <button class="status-filter all ${!fs?'on':''}" onclick="S.kstatus=null;S.kfilterOpen=null;drawDw()">全部 ${a.rows.length}</button>
   ${Object.keys(RST).map(k=>`<button class="status-filter ${RST[k]} ${fs===k?'on':''}" onclick="S.kstatus='${k}';S.kfilterOpen=null;drawDw()">${k} ${by[k]||0}</button>`).join('')}
 </div>
 <div class="roster-filterarea"><div class="roster-filterbar">
   <button class="filter-capsule ${S.kfilterOpen==='price'?'on':''}" onclick="S.kfilterOpen=S.kfilterOpen==='price'?null:'price';drawDw()"><span>图文报价：${fp?(priceMeta.find(x=>x[0]===fp)||[])[1]:'全部'}</span><i data-lucide="${S.kfilterOpen==='price'?'chevron-up':'chevron-down'}"></i></button>
   <button class="filter-capsule ${S.kfilterOpen==='tag'?'on':''}" onclick="S.kfilterOpen=S.kfilterOpen==='tag'?null:'tag';drawDw()"><span>标签：${ft||'全部'}</span><i data-lucide="${S.kfilterOpen==='tag'?'chevron-up':'chevron-down'}"></i></button>
 </div>
 ${S.kfilterOpen==='price'?`<div class="roster-filterpanel"><div class="roster-pricegrid">
   <button class="price-filter all ${!fp?'on':''}" onclick="S.kprice=null;S.kfilterOpen=null;drawDw()"><span class="t">全部</span><span class="s">${a.rows.length} 位候选</span></button>
   ${priceMeta.map(([k,label])=>{const x=priceStats[k],full=x.approved>=x.target;return `<button class="price-filter ${fp===k?'on':''}" onclick="S.kprice='${k}';S.kfilterOpen=null;drawDw()"><span class="t">${label}${full?' / 已满':''}</span><span class="s">目标 ${x.target} · 候选 ${x.candidates} · 已批 ${x.approved}</span></button>`}).join('')}
 </div></div>`:S.kfilterOpen==='tag'?`<div class="roster-filterpanel"><div class="roster-taglist open">
   <button class="tag ${!ft?'on':''}" onclick="S.ktag=null;S.kfilterOpen=null;drawDw()">全部</button>
   ${tags.map(t=>`<button class="tag ${ft===t?'on':''}" onclick="S.ktag='${t}';S.kfilterOpen=null;drawDw()">${t}</button>`).join('')}
 </div></div>`:''}
 </div>
 ${rows.length?rows.map((r)=>{const i=a.rows.indexOf(r),rates=creatorRates(i),quality=r.m>=90?'内容稳定':'一般契合',auditCount=contentAudits(a,i).length;return `<div class="pk" style="margin-bottom:var(--sp-2)">
   <div style="display:flex;align-items:flex-start;gap:var(--sp-3);padding:var(--sp-3) 13px">
     <span class="pv sq" style="${grad(r.g[0],r.g[1])};width:38px;height:38px;flex:0 0 38px;border-radius:50%;margin-top:var(--sp-1)"></span>
     <div style="flex:1;min-width:0">
       <div style="display:flex;align-items:center;gap:var(--sp-2);flex-wrap:wrap">
         <button style="font-size:var(--fs-md);font-weight:600" onclick="openCreator(${i})">${esc(r.n)} ↗</button>
        <span class="creator-quality">${quality}</span>
        <span class="st ${RST[r.s]||'todo'}">${r.s}</span></div>
       <div style="font-size:var(--fs-xs);color:var(--t3);margin-top:var(--sp-1)">
         <span style="color:${CSRC[r.src||'xhs'].c};font-weight:600">${CSRC[r.src||'xhs'].n}</span> · ${r.f}粉丝 · 契合评分 <span class="num" style="color:${r.m>=90?'#047857':r.m>=80?'#B45309':'#B91C1C'};font-weight:600">${r.m}</span> · 来源：系统</div>
       <div class="creator-rates"><span class="creator-rate">图文 ${rates[0]}</span><span class="creator-rate">视频 ${rates[1]}</span><span class="creator-rate">综合 ${rates[2]}</span></div>
       <div style="display:flex;gap:var(--sp-1);flex-wrap:wrap;margin-top:var(--sp-1)">${(r.tags||[]).map(t=>`<span class="tag">${t}</span>`).join('')}</div>
     </div>
     <button class="rvb ${S.or===i?'on':''}" onclick="toggleRow(${i})">评论
       ${rosterSubCount(r)?`<span class="n">${rosterSubCount(r)}</span>`:''} ${S.or===i?'▴':'▾'}</button>
   </div>
   <div class="pk-a" style="border-top:1px solid var(--hairline)">
     ${r.s==='候选'?`<button class="btn sm" onclick="kolSet(${i},'已确认')">入选</button>
       <button class="btn ghost sm" onclick="openBrief(${i})">生成 Brief</button>
       <button class="btn ghost sm" onclick="kolSet(${i},'已淘汰')">淘汰</button>`
      :r.s==='已淘汰'?`<span style="font-size:var(--fs-sm);color:var(--t3)">已淘汰</span>
       <button class="btn ghost sm" onclick="kolSet(${i},'候选')">放回候选</button>`
      :`<button class="btn ghost sm" onclick="openContentData(${i})">＋ 录入内容数据</button>
       <button class="btn ghost sm" onclick="openBrief(${i})">看 Brief ↗</button>`}
     <button class="btn ghost sm" style="margin-left:auto" onclick="${auditCount?`openCreatorAudit(${i})`:`openAuditSubmit(${i})`}">${auditCount?'内容审核 '+auditCount:'＋ 录入审核内容'}</button>
   </div>
   ${S.or===i?`<div style="padding:0 13px 12px">${subPane(a,i)}</div>`:''}
 </div>`;}).join(''):'<div class="empty" style="padding:var(--sp-5) 16px"><div class="h">没有符合当前筛选的达人</div><button class="btn ghost sm" onclick="S.ktag=null;S.kstatus=null;S.kprice=null;drawDw()">清除筛选</button></div>'}`;
}
function contentAudits(a,creatorIndex=0){
 const creator=a.rows[creatorIndex]||a.rows[0],name=creator?creator.n:'小鹿在成都';
 const base=creatorIndex===0?[
  {name,kind:'图文',v:2,at:'2026-08-11 05:42',status:'预审退回',gate:'Gate-3 已通过',words:158,current:1,
   copy:['娃鼻子闹脾气，挖到温和的益生菌鼻喷。','家里有鼻炎娃的宝妈真的太懂煎熬了。每到换季、吹空调，孩子就鼻子痒、揉鼻子、夜里鼻塞睡不踏实，翻来覆去，睡觉张口呼吸，老母亲跟着熬大夜。','之前试过不少洗鼻、缓解方法，每次操作都像打仗。被宝妈圈种草这个益生菌鼻喷，用了一段时间真心想分享。'],
   advice:'请避免使用暗示治疗效果的词汇，确保内容符合品牌定位与核心承诺。建议使用更温和的表达，避免引发负面情绪。',
   issues:[['违禁词','使用了带有治疗暗示的表述，可能违反广告法关于医疗或虚假功效的规定。'],['表达风险','部分措辞容易制造焦虑，建议改为对真实使用感受的客观描述。']]},
  {name,kind:'图文',v:1,at:'2026-08-10 19:18',status:'历史版本',gate:'Gate-3 已通过',words:143,current:0,
   copy:['换季时孩子鼻子不舒服，最近尝试了一款更温和的日常护理产品。','这篇记录一下我们的真实使用过程和感受，给同样关注日常鼻腔护理的家长做参考。'],
   advice:'整体表达较为克制，但产品体验细节不足，建议增加真实使用场景和过程。',
   issues:[['信息不足','缺少具体使用周期、频率以及使用前后的主观感受。']]}
 ]:[];
 const added=(S.creatorAudits&&S.creatorAudits[creatorIndex])||[];
 return added.length?[...added,...base.map(x=>({...x,current:0,status:'历史版本'}))]:base;
}
function openCreatorAudit(i){S.auditCreator=i;S.audit=null;S.kfilterOpen=null;drawDw();}
function closeCreatorAudit(){S.auditCreator=null;S.audit=null;drawDw();}
function creatorAuditFooter(a,i){
 const list=contentAudits(a,i),x=Number.isInteger(S.audit)?list[S.audit]:null;
 if(!x)return `<button class="btn" onclick="openAuditSubmit(${i})">＋ 录入新内容</button><button class="btn ghost" onclick="toast('内容提交已刷新')">刷新</button>`;
 if(x.pending)return `<span style="font-size:var(--fs-xs);color:var(--t3)">AI 正在预审，完成后可处理。</span>`;
 if(x.current)return `<button class="btn" onclick="toast('审核通过 · 已加入发布排期')">通过并排期</button><button class="btn ghost" onclick="toast('内容已退回')">退回</button>`;
 return `<span style="font-size:var(--fs-xs);color:var(--t3)">历史版本仅供查看</span>`;
}
function allContentAudits(a){
 return a.rows.flatMap((r,creatorIndex)=>contentAudits(a,creatorIndex).map((x,auditIndex)=>({...x,creatorIndex,auditIndex})));
}
function globalAuditFooter(a){
 const x=Number.isInteger(S.audit)?allContentAudits(a)[S.audit]:null;
 if(!x)return `<button class="btn" onclick="openAuditSubmit(undefined)">＋ 录入新内容</button><button class="btn ghost" onclick="toast('内容提交已刷新')">刷新</button>`;
 if(x.pending)return `<span style="font-size:var(--fs-xs);color:var(--t3)">AI 正在预审，完成后可处理。</span>`;
 if(x.current)return `<button class="btn" onclick="toast('审核通过 · 已加入发布排期')">通过并排期</button><button class="btn ghost" onclick="toast('内容已退回')">退回</button>`;
 return `<span style="font-size:var(--fs-xs);color:var(--t3)">历史版本仅供查看</span>`;
}
function dContentAudit(a,creatorIndex=0,embedded=false){
 const global=!embedded,list=global?allContentAudits(a):contentAudits(a,creatorIndex);
 const selected=Number.isInteger(S.audit)?list[S.audit]:null;
 const activeCreatorIndex=global&&selected?selected.creatorIndex:creatorIndex;
 const creator=a.rows[activeCreatorIndex]||a.rows[0];
 if(S.audit===null||S.audit===undefined)return `${embedded?`<button class="rvb" onclick="closeCreatorAudit()">← 返回达人名单</button>`:''}
  <div class="audit-toolbar" style="${embedded?'margin-top:var(--sp-3)':''}"><span class="ttl">${embedded?esc(creator.n)+' · ':''}内容审核</span></div>
  ${list.length?list.map((x,i)=>`<button class="audit-card ${x.current?'current':''}" onclick="S.audit=${i};drawDw()">
    <div class="audit-card-h"><span class="audit-dot ${x.current?'':'old'}"></span><b>${esc(x.name)}</b><span class="chip mut">${x.kind}</span><span class="chip mut">v${x.v}</span></div>
    <div class="audit-card-m"><span>提交于 ${x.at}</span><span class="spacer"></span><span class="st ${x.pending?'run':x.current?'hold':'todo'}">${x.status}</span><span class="st ${x.pending?'run':'done'}">${x.gate}</span></div>
   </button>`).join(''):`<div class="empty" style="padding:var(--sp-6) 16px"><div class="h">还没有内容提交</div><div class="s">录入第一篇内容后，会在这里单独审核和保留版本。</div></div>`}`;
 const x=list[S.audit]||list[0];
 return `<button class="rvb" onclick="S.audit=null;drawDw()">← 返回${embedded?esc(creator.n)+'的内容提交':'内容审核'}</button>
  <div style="display:flex;align-items:center;gap:var(--sp-2);flex-wrap:wrap;margin-top:var(--sp-3)">
   <b style="font-family:'Sora';font-size:var(--fs-md)">${esc(x.name)}</b><span class="chip mut">${x.kind}</span><span class="chip mut">第 ${x.v} 版</span>
   <span style="margin-left:auto" class="st ${x.pending?'run':x.current?'hold':'todo'}">${x.status}</span><span class="st ${x.pending?'run':'done'}">${x.gate}</span>
  </div>
  <div style="font-size:var(--fs-xs);color:var(--t3);margin-top:var(--sp-1)">提交于 ${x.at}</div>
  <div class="audit-section"><div class="audit-section-h">草稿文案 <span class="count">${x.words} 字</span></div>
   <div class="audit-copy">${x.copy.map(esc).join('<br><br>')}</div></div>
  <div class="audit-section"><div class="audit-section-h">草稿素材</div>
   <div class="audit-material">${x.links&&x.links.length?x.links.map((u,i)=>`素材 ${i+1} · ${esc(u)}`).join('<br>'):'本次提交未附素材链接，预审仅覆盖文案。画面需另行人工核验。'}</div></div>
  <div class="audit-section"><div class="audit-section-h">AI 预审意见 <span class="chip plat">${x.pending?'预审中':x.issues.length+' 项问题'}</span><span class="count">${x.at.slice(0,10)}</span></div>
   <div class="audit-ai"><b>${x.pending?'正在检查':'综合修改建议'}</b><br>${esc(x.advice)}</div>
   ${(x.issues||[]).map(y=>`<div class="audit-issue"><div class="t">${esc(y[0])}</div><div class="d">${esc(y[1])}</div></div>`).join('')}
  </div>
  ${x.current&&!x.pending?`<div class="audit-section" style="padding-top:var(--sp-4);border-top:1px solid var(--border)">
   <div class="fld"><label>审核意见（可选）</label><textarea id="auditOpinion" rows="3" placeholder="填写内联修改意见，会随决策一并留档"></textarea></div>
   <div class="fld" style="margin-bottom:0"><label>计划发布时间 <span class="brief-help">仅在“通过并排期”时生效</span></label><input id="auditSchedule" type="datetime-local"></div>
  </div>`:''}`;
}
function dEffectAnalysis(){
 return `<div class="card" style="min-height:230px;display:grid;place-items:center;text-align:center">
   <div><div style="width:42px;height:42px;border-radius:14px;background:var(--primary-bg);color:var(--primary);display:grid;place-items:center;margin:0 auto 12px;font-family:'Sora';font-weight:700">↗</div>
   <div style="font-size:var(--fs-md);font-weight:600;color:var(--t1)">暂无投放数据</div>
   <div style="font-size:var(--fs-sm);color:var(--t3);margin-top:var(--sp-1)">录入文章链接后可查看 EMV 与 ROI。</div></div>
  </div>`;
}
function openAuditSubmit(selectedCreator){
 const [,a]=findArt('a7');if(!a||!a.rows)return;
 S.auditFormat='图文';S.auditSubmitGlobal=!Number.isInteger(selectedCreator)&&S.dtab===1;
 $('mod').innerHTML=`<div class="mbox audit-submit-modal">
  <div class="audit-submit-head"><div class="main"><h3>录入内容提交</h3>
   <div class="sub">代达人录入草稿素材，提交后自动进入 AI 预审</div></div>
   <button class="ib" onclick="closeMod()" title="关闭">×</button></div>
  <div class="audit-submit-body">
   <div class="fld"><label>提交达人</label><select id="auditCreator">${a.rows.map((r,i)=>({r,i})).filter(x=>x.r.s!=='已淘汰').map(x=>`<option value="${x.i}" ${x.i===selectedCreator?'selected':''}>${esc(x.r.n)}（${x.r.s}）</option>`).join('')}</select></div>
   <div class="fld"><label>内容形式</label><div class="audit-format">${['图文','视频','纯文本'].map((x,i)=>`<button type="button" class="${i===0?'on':''}" data-audit-format="${x}" onclick="setAuditSubmitFormat('${x}')">${x}</button>`).join('')}</div></div>
   <div class="fld"><label>素材链接（可选）<span class="brief-help">一行一条 · 图片链接，可多张</span></label>
    <textarea id="auditLinks" rows="4" oninput="auditSubmitReady()" placeholder="https://example.com/draft-1.jpg&#10;https://example.com/draft-2.jpg"></textarea></div>
   <div class="fld copy"><label>草稿文案</label><textarea id="auditCopy" rows="4" oninput="auditSubmitReady()" placeholder="粘贴达人提供的文案，AI 预审会一并检查合规与简报一致性"></textarea></div>
   <div class="audit-submit-help">素材链接与草稿文案至少填写一项 —— 预审只能审到你提交的内容。</div>
  </div>
  <div class="mft audit-submit-foot"><button class="btn ghost" onclick="closeMod()">取消</button>
   <button class="btn" id="auditSubmitBtn" disabled onclick="submitAuditContent()">提交并预审</button></div>
 </div>`;
 $('mod').classList.add('on');
}
function setAuditSubmitFormat(v){
 S.auditFormat=v;document.querySelectorAll('[data-audit-format]').forEach(b=>b.classList.toggle('on',b.dataset.auditFormat===v));
}
function auditSubmitReady(){
 const b=$('auditSubmitBtn');if(b)b.disabled=!(($('auditLinks')?.value.trim())||($('auditCopy')?.value.trim()));
}
function submitAuditContent(){
 const links=$('auditLinks')?.value.trim()||'',copy=$('auditCopy')?.value.trim()||'';
 if(!links&&!copy){toast('请至少填写素材链接或草稿文案');return;}
 const [,a]=findArt('a7'),creatorIndex=Number($('auditCreator').value),creator=a&&a.rows&&a.rows[creatorIndex];if(!creator)return;
 const entry={name:creator.n,kind:S.auditFormat||'图文',v:contentAudits(a,creatorIndex).length+1,at:'刚刚',status:'AI 预审中',gate:'Gate-3 检查中',words:copy.length,current:1,pending:1,
  copy:copy?copy.split(/\n\s*\n/).filter(Boolean):['已提交素材，暂无草稿文案。'],links:links?links.split('\n').map(x=>x.trim()).filter(Boolean):[],
 advice:'AI 正在检查内容合规、素材完整性以及与达人 Brief 的一致性。',issues:[]};
 S.creatorAudits=S.creatorAudits||{};(S.creatorAudits[creatorIndex]=S.creatorAudits[creatorIndex]||[]).unshift(entry);
 const fromGlobal=S.auditSubmitGlobal;closeMod();
 if(fromGlobal){S.dtab=1;S.auditCreator=null;S.audit=allContentAudits(a).findIndex(x=>x.creatorIndex===creatorIndex&&x.auditIndex===0);}
 else{S.dtab=0;S.auditCreator=creatorIndex;S.audit=0;}
 S.auditSubmitGlobal=false;drawDw();toast('内容已提交 · 正在进行 AI 预审');
}
function dMatch(a){
 return `<div class="ctx"><div class="ctxr"><span class="k">画像来源</span><span class="v">方向二 · 低预算高信任感</span></div>
  <div class="ctxr"><span class="k">达人库</span><span class="v num">1,240 位</span></div>
  <div class="ctxr"><span class="k">评估</span><span class="v num">300 位</span></div>
  <div class="ctxr"><span class="k">输出</span><span class="v num">30 位</span></div>
  <div class="ctxr"><span class="k">黑名单规避</span><span class="v">3 位</span></div></div>
 <div style="margin-top:var(--sp-4)"><div style="font-size:var(--fs-xs);font-weight:600;color:var(--t2);margin-bottom:var(--sp-2)">打分权重</div>
 ${[['内容调性贴合真实测评','35%'],['受众重合度','25%'],['历史转化表现','20%'],['报价性价比','15%'],['独家冷却期合规','5%']].map(w=>
   `<div class="vrow"><span class="vt">${w[0]}</span><span class="vv">${w[1]}</span></div>`).join('')}</div>`;
}

function toggleOpt(i){S.oo=(S.oo===i?null:i);drawDw();}
function dCopy(a){
 const o=a.opts[1];
 return `<div class="fld"><label>标题 <span class="ct">18 / 20</span></label><input value="低预算，先把真实感做满"></div>
 <div class="fld"><label>正文 <span class="ct">412 / 1000</span></label>
   <textarea rows="9">${esc(o.e)}\n\n真实使用场景是这一版的全部意义：不追求完美光线，不追求一次见效，把有限预算里最值得被看见的部分放大。\n\n第 3 周开始的细节变化，比任何形容词都有说服力。</textarea></div>
 <div class="fld"><label>话题</label><div class="tags"><span class="tag">#双十一好物</span><span class="tag">#低预算护肤</span><span class="tag">#真实测评</span><span class="tag">#敏感肌可用</span></div></div>
 <div class="fld"><label>配图 <span class="ct">3 / 3</span></label>
   <div class="imgs"><div class="imgc" style="${grad('#FDA4AF','#E11D48')}"><span class="lb">封面</span></div>
     <div class="imgc" style="${grad('#FCD34D','#F59E0B')}"><span class="lb">2</span></div>
     <div class="imgc" style="${grad('#A78BFA','#7C3AED')}"><span class="lb">3</span></div></div></div>
 <div style="margin-top:var(--sp-4)"><div style="font-size:var(--fs-xs);font-weight:600;color:var(--t2);margin-bottom:var(--sp-2)">小红书预览</div>
 <div class="mock"><div class="mh"><span class="a"></span><span class="n">A8OPARIS 官方</span></div>
   <div class="mb"><div class="mt">低预算，先把真实感做满</div>
     <div class="mx">${esc(o.e.slice(0,86))}…</div>
     <div class="mg">#双十一好物 #低预算护肤 #真实测评</div></div>
   <div class="mf"><span>♡ 收藏</span><span>♡ 点赞</span><span>评论</span></div></div></div>`;
}
/* ---- video drawer ---- */
function dVid(a){
 return `<div class="player ${S.focus?'wide':''}" style="${grad(a.g[0],a.g[1])}">
   <div class="play"><i>▶</i></div>
   <div class="scrub"><div class="b"><i></i></div><div class="t"><span>0:11</span><span>0:30</span></div></div></div>
 <div class="note" style="margin-bottom:var(--sp-3)">渲染中 · 第 4/6 个镜头。可以先看已完成的部分，成片完成后会自动回到待审批。</div>
 <div class="ctx"><div class="ctxr"><span class="k">分辨率</span><span class="v num">1080 × 1920</span></div>
  <div class="ctxr"><span class="k">时长</span><span class="v num">0:30</span></div>
  <div class="ctxr"><span class="k">字幕</span><span class="v">已写入 · 简体中文</span></div>
  <div class="ctxr"><span class="k">配乐</span><span class="v" style="color:var(--warn-fg)">待核版权</span></div>
  <div class="ctxr"><span class="k">来源方向</span><span class="v">方向二 · 低预算高信任感</span></div></div>
 ${S.focus?`<div style="margin-top:var(--sp-4)"><div style="font-size:var(--fs-xs);font-weight:600;color:var(--t2);margin-bottom:var(--sp-2)">时间轴</div>
  <div style="display:flex;gap:var(--sp-1);height:44px">${a.shots.map((s,i)=>`<div style="flex:${i===1||i===3?2:1};border-radius:5px;${grad(a.g[0],a.g[1])};opacity:${i<4?1:.32};display:grid;place-items:center;color:#fff;font-family:'Sora';font-size:var(--fs-xs);font-weight:600">${s.n}</div>`).join('')}</div>
  <div style="display:flex;justify-content:space-between;font-family:'Sora';font-size:var(--fs-xs);color:var(--t3);margin-top:var(--sp-1)"><span>0:00</span><span>0:30</span></div></div>`:''}`;
}
function dShots(a){
 return `<div style="font-size:var(--fs-sm);color:var(--t2);margin-bottom:var(--sp-3)">6 个镜头 · 已确认，正在按顺序渲染。</div>
 ${a.shots.map((s,i)=>`<div class="shot"><span class="n num">${s.n}</span>
   <span class="th" style="${grad(a.g[0],a.g[1])};opacity:${i<4?1:.34}"></span>
   <span class="tx"><span class="l1">${esc(s.l)}</span><span class="l2 num">${s.d} · ${i<4?'已渲染':i===4?'渲染中':'排队中'}</span></span>
   <span class="st ${i<4?'done':i===4?'run':'todo'}" style="flex:0 0 auto">${i<4?'完成':i===4?'渲染中':'等待'}</span></div>`).join('')}`;
}
function dScript(a){
 return `<div class="fld"><label>脚本 · 30 秒 4 段</label><textarea rows="14">【0:00–0:04】真实场景开场
不用打光，不用滤镜。就是早上七点，洗手台前。

【0:04–0:11】痛点对比
"预算有限"不等于"只能将就"——问题从来不是钱少，是钱花在了看不见的地方。

【0:11–0:23】核心卖点 + 使用过程
30ml 足量装，日均低至 12 块。敏感肌可用，无香精。
第 3 周开始，细节会自己说话。

【0:23–0:30】效果 + 会场利益点
双十一会场专享装，正装 + 小样。
现在下单，把预算花在能看见的地方。</textarea></div>
 <div class="vals" style="border-radius:8px;border:1px solid var(--border)"><span class="val ok">✓ 禁用词</span><span class="val ok">✓ 时长匹配 <span class="m">30s</span></span><span class="val warn">! 音乐版权 <span class="m">待核</span></span></div>`;
}
/* ---- PDP drawer ---- */
function dFlds(a){
 return `<div class="seg" style="margin-bottom:var(--sp-4)"><button class="on">天猫</button><button onclick="toast('抖音版本尚未生成')">抖音</button><button onclick="toast('京东版本尚未生成')">京东</button></div>
 ${a.flds.map((f,i)=>`<div class="fld"><label>${f.k}${i>0?` <span class="ct">${f.v.length} / 20</span>`:''}</label>
   ${i===0?`<textarea rows="2">${esc(f.v)}</textarea>`:`<input value="${esc(f.v)}">`}</div>`).join('')}
 <div class="fld"><label>规格</label><input value="30ml · 会场专享装 + 正装小样 2ml×3"></div>
 <div class="fld"><label>价格</label><input value="¥389 · 会场价 ¥329"></div>
 <div class="note">类目规则校验通过。图片还差 1 张（9 张要求，当前 8 张）——上架前需要补齐。</div>`;
}

/* ---- 看整页 · the 9 tiles are one long page; show it that way ---- */
function openWholePage(){
 const imgs=detailImgs();
 $('mod').innerHTML='<div class="mbox whole-page" role="dialog" aria-modal="true" aria-label="整页预览">'
  +'<div class="kp-dialog-head"><h3>A8O 修护精华 30ml · 天猫详情页 · 整页</h3>'
  +'<span class="chip mut">'+imgs.length+' 屏 · 从上到下</span>'
  +'<button class="ib" onclick="closeMod()" title="关闭" aria-label="关闭"><i data-lucide="x"></i></button></div>'
  +'<div class="whole-page-stage">'+imgs.map((x,i)=>
    '<div class="wp-screen'+(x.generating?' gen':'')+'">'
     +(x.generating
       ? '<div class="wp-pending"><span class="spin"></span><span>第 '+(i+1)+' 屏还在生成</span></div>'
       : '<img src="'+x.src+'" alt="'+esc(x.l)+'" loading="lazy">')
     +'<span class="wp-lab">'+esc(x.l)+'</span></div>').join('')
  +'</div>'
  +'<div class="kp-dialog-foot"><span class="kp-preview-caption">这是买家实际滚动看到的顺序</span>'
  +'<span><button class="btn ghost sm" onclick="toast(\'已批量下载 9 张\')">批量下载</button>'
  +'<button class="btn sm" onclick="closeMod()">回到分屏</button></span></div></div>';
 $('mod').classList.add('on');
 if(window.lucide)lucide.createIcons({root:$('mod'),attrs:{width:16,height:16,'stroke-width':1.8}});
}

function dImgs(a){
 return `<div style="display:flex;align-items:center;gap:var(--sp-2);margin-bottom:var(--sp-3)">
   <span style="font-size:var(--fs-sm);color:var(--t2);flex:1">详情图 · 9 张 · 上下拼起来就是整张详情页</span>
   <button class="btn ghost sm" onclick="openWholePage()">看整页 ↗</button></div>
 <div class="imgs">${detailImgs().map((x,i)=>x.generating
   ?`<button class="imgc generating" onclick="openDetailImage(${i})"><span class="lb">${x.l}</span><div class="detail-card-generating"><span class="spin"></span><span>图片生成中...</span></div></button>`
   :`<button class="imgc" onclick="openDetailImage(${i})" style="background-image:url('${x.src}');background-size:cover;background-position:center"><span class="lb">${x.l}</span></button>`).join('')}</div>`;
}
function dAplus(a){
 const M=[['品牌故事','已沿用上一版'],['成分实验对比','本次新增 · 8 周数据'],['使用方法','已更新'],['敏感肌说明','已沿用'],['会场利益点','本次新增']];
 return `<div style="font-size:var(--fs-sm);color:var(--t2);margin-bottom:var(--sp-3)">5 个模块 · 按会场要求重排</div>
 ${M.map((m,i)=>`<div class="shot"><span class="n num">${i+1}</span>
   <span class="th" style="${grad('#67E8F9','#0891B2')};opacity:${i===1||i===4?1:.4}"></span>
   <span class="tx"><span class="l1">${m[0]}</span><span class="l2">${m[1]}</span></span></div>`).join('')}`;
}
/* ---- CS reply drawer ---- */
function dReply(a){
 return `<div class="note" style="background:var(--danger-bg);border-color:var(--danger-bd);color:var(--danger-fg-strong);margin-bottom:var(--sp-3)">
   自动发送已阻止：补偿金额 ¥12 超出规则上限 ¥10。需要人工确认或走特批。</div>
 <div class="fld"><label>回复内容 <span class="ct">L4 · 自动发送已阻止</span></label>
   <textarea rows="9">${esc(a.body)}</textarea></div>
 <div class="fld"><label>语气</label>
   <select><option>共情 · 主动担责（当前）</option><option>标准客服</option><option>简短高效</option></select></div>
 <div class="fld"><label>发送渠道</label><select><option>企微 · 原会话（当前）</option><option>短信</option><option>邮件</option></select></div>
 <div class="vals" style="border:1px solid var(--border);border-radius:8px">
   <span class="val bad">✕ 补偿上限 <span class="m">¥12 / ¥10</span></span><span class="val ok">✓ 合规话术</span><span class="val ok">✓ 语气匹配</span></div>`;
}
function dCtx(a){
 return `<div class="ctx">${a.ctx.map(c=>`<div class="ctxr"><span class="k">${c[0]}</span><span class="v">${c[1]}</span></div>`).join('')}</div>
 <div style="margin-top:var(--sp-4)"><div style="font-size:var(--fs-xs);font-weight:600;color:var(--t2);margin-bottom:var(--sp-2)">会话</div>
 <div class="bub" style="margin-bottom:var(--sp-2)"><div class="who"><span class="avs" style="background:#9490B8">LW</span><span class="nm">林薇</span><span class="tm">09:42</span></div>包裹破损，客户要求退款并补偿运费。</div>
 <div class="bub me"><div class="who"><span class="avs" style="background:${AG.cs.c}">客</span><span class="nm">AI 草稿</span><span class="tm">09:42</span></div>
   <span style="color:var(--t2)">${esc(a.body.slice(0,58))}…</span></div></div>`;
}
function dTpl(a){
 return `<div class="ctx"><div class="ctxr"><span class="k">模板</span><span class="v">${a.tpl}</span></div>
  <div class="ctxr"><span class="k">来源</span><span class="v">知识库 · 客服话术</span></div>
  <div class="ctxr"><span class="k">使用次数</span><span class="v num">1,284</span></div>
  <div class="ctxr"><span class="k">人工修改率</span><span class="v num">12%</span></div></div>
 <div style="margin-top:var(--sp-4)"><div style="font-size:var(--fs-xs);font-weight:600;color:var(--t2);margin-bottom:var(--sp-2)">槽位</div>
 ${[['{客户称呼}','林薇'],['{问题描述}','包裹在运输途中出现破损'],['{退款时效}','1–3 个工作日'],['{补偿金额}','¥12 ⚠']].map(s=>
   `<div class="vrow"><span class="vv">${s[0]}</span><span class="vt">${s[1]}</span></div>`).join('')}</div>
 <div class="note" style="margin-top:var(--sp-3)">这条回复如果批准，可以存为新模板变体「破损全额退 + 运费补偿」，供后续复用。</div>`;
}
/* ---- generic doc ---- */
function dDoc(a){
 if(a.inspection)return inspectionSummary(a);
 return `<div class="fld"><label>标题</label><input value="${esc(a.ttl)}"></div>
 <div class="fld"><label>正文</label><textarea rows="12">${esc(a.ex)}

一、目标
在有限预算与短周期内，用真实证据建立信任，再以话题动作放大扩散。

二、内容主线
以真实使用场景为核心，避免过度修饰。前三屏承担代入感，中段承担证据，结尾承担行动。

三、排期
预热期建立话题与真实测评基调；蓄水期铺开腰部 KOC；爆发期集中投放会场利益点；返场期复用方向一结构。

四、渠道分工
小红书承担信任建立，抖音承担扩散与转化。</textarea></div>`;
}
function dPlanDoc(a,p,i){
 if(!p)return '<div class="allclear">这份产出还没有内容。</div>';
 const body=p.body||`${p.e}\n\n一、目标\n在有限预算与短周期内，用真实证据建立信任，再以话题动作放大扩散。\n\n二、内容主线\n以真实使用场景为核心，避免过度修饰。前三屏承担代入感，中段承担证据，结尾承担行动。\n\n三、排期\n预热期建立话题与真实测评基调；蓄水期铺开腰部 KOC；爆发期集中投放会场利益点；返场期复用方向一结构。\n\n四、渠道分工\n小红书承担信任建立，抖音承担扩散与转化。`;
 if(a.id==='a2')return activityPlanAccordion(p);
 return `<div class="fld"><label>标题</label><input value="${esc(p.t.replace(/^方案[一二三]：/,''))}"></div>
 <div class="fld"><label>正文</label><textarea rows="12">${esc(body)}</textarea></div>`;
}
function activityPlanValue(key,fallback){return S.activityPlanDraft&&Object.prototype.hasOwnProperty.call(S.activityPlanDraft,key)?S.activityPlanDraft[key]:fallback;}
function setActivityPlanField(key,value){S.activityPlanDraft=S.activityPlanDraft||{};S.activityPlanDraft[key]=value;}
function activityPlanInfo(label,key,value,full,multiline){const v=activityPlanValue(key,value),area=full||multiline;return `<div class="plan-info ${full?'full':''}"><span class="label">${label}</span>${area?`<textarea rows="4" oninput="setActivityPlanField('${key}',this.value)">${esc(v)}</textarea>`:`<input value="${esc(v)}" oninput="setActivityPlanField('${key}',this.value)">`}</div>`;}
function activityPlanLines(prefix,rows){return `<div class="plan-doc-list">${rows.map((x,j)=>{const key=prefix+'.'+j,v=activityPlanValue(key,x[1]);return `<div class="plan-doc-line"><span class="key">${x[0]}</span><textarea rows="2" oninput="setActivityPlanField('${key}',this.value)">${esc(v)}</textarea></div>`;}).join('')}</div>`;}
function activityPlanColumnWidth(label,rows,column){
 const fixed={序号:52,层级:76,粉丝量级:90,占比:82,平台数:80,账号:88,平台:78,预算占比:90,预算金额:108,类别:158,分类:78,阶段:86,时间:176,角色:150,优先级:72,状态:76,负责人:102,交付类型:104,数量:62,周次:70,截止:118,开始:118,结束:118,内容类型:120,风格:118,调性:100,视觉:140,标题:178,钩子:190,大纲:190,标签:132,正文:440,关键词:430,任务名称:150,任务:178,详情:340,任务详情:360,交付物:132,依赖:180,风险提示:220,备注:180,说明:260,明细:620,目标:200,目的:250,目的说明:260,侧重:150};
 if(fixed[label])return fixed[label];
 const longest=Math.max(String(label).length,...rows.map(row=>Math.max(...String(row[column]??'').split('\n').map(line=>line.length))));
 return Math.max(72,Math.min(220,longest*14+26));
}
function activityPlanTable(prefix,title,head,rows){const wide=head.length>=7,mega=head.length>=10,demo=title==='内容 Demo',widths=head.map((label,c)=>activityPlanColumnWidth(label,rows,c)),total=widths.reduce((sum,width)=>sum+width,0);return `<section class="plan-map-block"><div class="plan-map-title">${esc(title)}</div><div class="camp-plan-table plan-map-table${wide?' wide':''}${mega?' mega':''}${demo?' demo':''}"><table style="width:max(100%,${total}px);min-width:${total}px"><colgroup>${widths.map(width=>`<col style="width:${width}px">`).join('')}</colgroup><thead><tr>${head.map(x=>`<th>${esc(x)}</th>`).join('')}</tr></thead><tbody>${rows.map((row,r)=>`<tr>${row.map((value,c)=>{const key=prefix+'.'+r+'.'+c,v=activityPlanValue(key,value);return `<td><textarea rows="${demo?8:2}" oninput="setActivityPlanField('${key}',this.value)">${esc(v)}</textarea></td>`;}).join('')}</tr>`).join('')}</tbody></table></div></section>`;}
function activityPlanList(prefix,title,items){return `<section class="plan-reminders"><div class="plan-map-title">${esc(title)}</div><ul>${items.map((value,i)=>{const key=prefix+'.'+i,v=activityPlanValue(key,value);return `<li><textarea rows="2" oninput="setActivityPlanField('${key}',this.value)">${esc(v)}</textarea></li>`;}).join('')}</ul></section>`;}
function activityPlanTimeline(prefix,phases,events){return `<section class="plan-timeline"><div class="plan-timeline-title">内容发布时间轴 <span>${events.length}个节点</span></div><div class="plan-timeline-scroll"><div class="plan-timeline-track">${phases.map((phase,i)=>{const nameKey=prefix+'.phase.'+i+'.0',dateKey=prefix+'.phase.'+i+'.1';return `<div class="plan-timeline-phase"><span class="dot"></span><input value="${esc(activityPlanValue(nameKey,phase[0]))}" oninput="setActivityPlanField('${nameKey}',this.value)"><input class="date" value="${esc(activityPlanValue(dateKey,phase[1]))}" oninput="setActivityPlanField('${dateKey}',this.value)"></div>`;}).join('')}</div><div class="plan-timeline-events">${events.map((event,i)=>{const dateKey=prefix+'.event.'+i+'.0',titleKey=prefix+'.event.'+i+'.1',detailKey=prefix+'.event.'+i+'.2';return `<div class="plan-timeline-event"><div><input class="date" value="${esc(activityPlanValue(dateKey,event[0]))}" oninput="setActivityPlanField('${dateKey}',this.value)"><input class="title" value="${esc(activityPlanValue(titleKey,event[1]))}" oninput="setActivityPlanField('${titleKey}',this.value)"></div><textarea rows="2" oninput="setActivityPlanField('${detailKey}',this.value)">${esc(activityPlanValue(detailKey,event[2]))}</textarea></div>`;}).join('')}</div></div></section>`;}
function activityPlanChapterBody(i,p){
 if(i===0)return `<div class="plan-overview-grid">
  ${activityPlanInfo('活动名称','overview.name','11.11 低预算高信任感内容计划')}${activityPlanInfo('活动周期','overview.period','2026-08-04 - 2026-08-31')}
  ${activityPlanInfo('预算','overview.budget','¥38,000')}${activityPlanInfo('内容总数','overview.count','小红书 3 篇')}
  ${activityPlanInfo('目标人群','overview.audience','24-32 岁、换季屏障不稳定的都市人群')}${activityPlanInfo('覆盖平台','overview.platform','小红书 · 抖音')}
  ${activityPlanInfo('活动摘要','overview.summary','围绕「低预算也能做出高信任感」展开，以真实使用场景为内容主线，用第 3 周的细节变化和自然光实拍建立可信证据。预热期先建立共鸣，爆发期集中放大会场权益，返场期复用可收藏的清单内容。',true)}</div>`;
 if(i===1)return activityPlanLines('creative',[['创意主题','低预算，先把真实感做满'],['核心创意','不承诺立刻变好，用第 3 周开始出现的细节变化建立信任。'],['承接原因','低预算决策 · 真实证据 · 生活方式共鸣'],['适合沉淀原因','把钱花在真正会坚持使用、也能看见变化的地方。']]);
 if(i===2)return activityPlanLines('summary',[['策略正文','整体策略采用“小内容量、强场景感、重习惯心智”的打法，在小红书由品牌官号完成三段式内容推进。第一阶段先用成年人熟悉的疲惫节点打开情绪共鸣，让用户迅速意识到自己需要的不是复杂养生，而是一个可以长期执行的简单动作；第二阶段把产品嵌入通勤、加班、熬夜后、训练后等高频场景，用连续生活片段强化“随手可做”的低门槛感；第三阶段再把关注点从单次使用推进到稳定状态管理，建立“每天一勺=长期自我照顾”的认知闭环。预算上以平台触达和内容制作为主，配合评论区运营承接收藏、提问与购买意向。由于总篇数有限，策略重点不是铺量，而是让每篇内容承担明确任务：共鸣、证明、转化，形成节奏起伏，提升单篇效率。'],['原因说明','本次预算与篇数都较集中，若分散表达会削弱记忆点，因此选择围绕一个核心动作反复强化。小红书用户更容易被真实生活方式内容打动，聚焦体感结果与可复制动作，能更自然地完成种草与转化衔接。']]);
 if(i===3)return `<div class="plan-overview-grid plan-map-overview">
  ${activityPlanInfo('传播目标','map.goal','在小红书建立“每天一勺=保状态底层动作”的种草认知并带动转化')}${activityPlanInfo('目标人群','map.audience','都市高压成年人、作息不稳人群、轻运动恢复需求人群')}
  ${activityPlanInfo('核心洞察','map.insight','用户不缺健康道理，缺的是忙碌生活里能长期坚持的简单动作')}${activityPlanInfo('平台角色','map.role','品牌不是说教者，而是帮用户把自我照顾变得更省事的状态搭子')}
 </div>
 ${activityPlanTable('map.platform','平台策略',['账号','平台','预算占比','预算金额','目标','说明'],[['品牌官号','小红书','100%','¥30000','种草转化','主阵地集中发力，保证内容与投放效率']])}
 ${activityPlanTable('map.channel','渠道分配',['账号','平台','占比','侧重','说明'],[['品牌官号','小红书','100%','内容+投放+互动','集中预算做高质量内容、精准加热与评论承接']])}
 ${activityPlanTable('map.matrix','内容矩阵',['账号','平台','内容类型','占比','目的'],[
  ['品牌官号','小红书','情绪共鸣帖','33%（1篇）','先打中疲惫情绪，建立停留与代入'],
  ['品牌官号','小红书','场景种草帖','33%（1篇）','把产品放进高频节点，强化可执行感'],
  ['品牌官号','小红书','习惯转化帖','34%（1篇）','从单次体验推进到长期状态管理']])}
 ${activityPlanTable('map.rhythm','传播节奏',['账号','平台','阶段','时间','渠道','篇数','主题','目的说明'],[
  ['品牌官号','小红书','筹备期','2026-08-04 - 2026-08-07','小红书','0篇','定调备稿','统一表达，避免后续内容分散'],
  ['品牌官号','小红书','蓄水期','2026-08-08 - 2026-08-14','小红书','1篇','疲惫共鸣','先抓情绪，提升停留收藏'],
  ['品牌官号','小红书','引爆期','2026-08-15 - 2026-08-21','小红书','1篇','节点植入','强化场景代入，形成讨论'],
  ['品牌官号','小红书','收割期','2026-08-22 - 2026-08-28','小红书','1篇','习惯养成','推动转化，沉淀长期认知'],
  ['品牌官号','小红书','复盘期','2026-08-29 - 2026-08-31','小红书','0篇','数据复盘','总结高效内容，为后续复用']])}`;
 if(i===4)return `<div class="plan-overview-grid">
  ${activityPlanInfo('整体 KV 视觉建议','content.kv','KV建议采用“同一人不同状态节点”的连续画面结构：早高峰通勤、深夜加班、训练结束三个场景并列，中间用“一勺”动作串联，整体色调从疲惫灰蓝过渡到稳定暖白，突出“状态被接住”的变化感。',true)}
  ${activityPlanInfo('视觉建议原因','content.reason','多场景并列能直接承接创意方向中的高频节点，一眼说明产品使用时机；色调过渡能强化体感改善的情绪认知，适合小红书封面快速抓眼。',true)}
 </div>
 ${activityPlanTable('content.style','风格统筹',['账号','平台','风格','调性','视觉','说明'],[
  ['品牌官号','小红书','通勤生活流','克制真实','勺子、杯子、通勤包','贴近用户日常，降低广告感'],
  ['品牌官号','小红书','轻功能日记感','直接有感','晨光、夜灯、运动后','突出状态变化，便于代入']])}
 ${activityPlanTable('content.demo','内容 Demo',['账号','平台','标题','钩子','大纲','标签','正文'],[
  ['品牌官号','小红书','我把养生改成了一勺','每天一勺，不折腾也能稳住状态','1.先说最近很累\n2.以前总想复杂补\n3.后来只留一个动作\n4.通勤前顺手完成\n5.状态更稳更能扛','#品牌 #每天一勺','以前我总把“照顾自己”想得太复杂，结果越忙越做不到。现在我只给自己留一个固定动作：出门前一勺。不是为了仪式感，是为了别让一天从昏沉开始。对成年人来说，能长期坚持的，从来不是最完整的方案，而是最不费力、最容易执行的那个动作。最近我更在意的不是突然变好，而是白天清醒一点，做事别总掉线。#品牌 #每天一勺'],
  ['品牌官号','小红书','加班熬夜后我只做这一步','忙到没空养生时，更要留住这一步','1.加班后最怕状态散\n2.不想再搞复杂搭配\n3.固定放包里随手用\n4.熬夜后也能接上\n5.省事才更能坚持','#品牌 #状态管理','加班、熬夜、第二天还要继续上班，这种节奏下最怕的不是忙，是整个人越来越散。后来我发现，越是这种时候，越不能把自我照顾做复杂。我现在会把产品直接放进包里，忙完、回家、第二天出门前，都能顺手接上。它最打动我的不是花哨，而是不用想太多，照着做就行。省去复杂搭配，反而更容易把状态慢慢稳住。#品牌 #状态管理'],
  ['品牌官号','小红书','训练后恢复，我开始固定一勺','恢复快一点，第二天才接得上生活','1.训练后不只看当下爽\n2.更在意第二天恢复\n3.固定一勺更省脑力\n4.动作简单不容易断\n5.慢慢变成长习惯','#品牌 #恢复状态','训练后我以前只在意当下有没有练到，现在更在意第二天还能不能正常上班、正常生活。真正适合长期坚持的，不是每次都做满一整套，而是留住那个最稳定的动作。我把产品固定在训练后这一勺，就够，不需要额外准备太多。对我来说，它不是偶尔想起来才做的补充，而是让我恢复更快、第二天状态别掉太多的日常方案。#品牌 #恢复状态']])}
 ${activityPlanTable('content.keywords','关键词云',['分类','关键词'],[
  ['活动','每天一勺、状态在线、保状态、固定动作、长期照顾'],
  ['人群','通勤族、加班人、熬夜党、健身人、都市白领'],
  ['促销','低门槛、可坚持、省步骤、随手做、日常化'],
  ['卖点','清醒感、睡稳点、恢复快、少折腾、易执行'],
  ['平台','小红书、通勤日记、生活方式、状态管理、种草笔记']])}`;
 if(i===5)return `<div class="plan-overview-grid">
  ${activityPlanInfo('执行说明','detail.summary','本次不含达人合作，执行重心放在品牌官号内容、投放加热与评论区承接三位一体联动。',true)}
  ${activityPlanInfo('达人分配方案','detail.creator','本项目不配置达人合作，全部资源回收至品牌官号内容生产、平台加热与社区运营。',true)}
  ${activityPlanInfo('分配原因','detail.reason','预算与篇数较少，集中资源更能保证单篇质量、封面点击率与评论承接效率。',true)}
  ${activityPlanInfo('资源主渠道','detail.channel','小红书')}
  ${activityPlanInfo('资源配置原因','detail.resourceReason','本次资源配置遵循“小篇数高效率”原则。内容制作占比最高，是因为小红书单篇笔记的封面、标题、前3句和生活感决定种草成败；平台投放紧随其后，用于把优质内容送到更匹配的人群面前；互动运营虽然预算较小，但承担评论承接与转化解释功能，能把浏览变收藏、提问与下单意向。',false,true)}
 </div>
 ${activityPlanTable('detail.creatorMatrix','达人矩阵',['层级','粉丝量级','占比','内容类型','平台数','任务','时间','目标'],[
  ['不适用','不适用','0%','无达人合作','小红书0','品牌自运营','全周期','集中资源保障品牌官号内容与投放效率']])}
 ${activityPlanTable('detail.resources','资源配置',['类别','明细'],[
  ['平台触达与投放','约￥12000；信息流加热、搜索词覆盖、笔记加热测试；人员：投放优化1人。原因：3篇内容需精准加热放大有效触达。'],
  ['内容制作与日常运营','约￥13500；含选题策划、文案、拍摄、修图、封面设计、发布排期；人员：策划1人、文案1人、设计/剪辑1人。原因：小红书封面与前3句决定停留，内容质量优先。'],
  ['社交互动与社区运营','约￥4500；评论区维护、私信答疑、收藏引导、舆情监控；人员：运营1人。原因：用户会在评论区问使用场景与体感，及时承接更利于转化。']])}
 ${activityPlanTable('detail.sop','指导 SOP',['阶段','时间','任务','角色','说明'],[
  ['预热期','2026-08-04 - 2026-08-07','统一主题与素材准备','策划、文案、设计、运营','先锁定三篇分工与视觉符号，避免发布后调性分裂'],
  ['引爆期','2026-08-08 - 2026-08-21','连续发布并投放加热','运营、投放、设计','前两篇承担共鸣与场景种草，形成节奏抬升'],
  ['发酵期','2026-08-22 - 2026-08-28','发布转化向内容并强化评论承接','运营、客服、投放','把讨论从“是什么”推进到“怎么用、值不值”'],
  ['延续期','2026-08-29 - 2026-08-30','整理高互动问答与二次沉淀','运营、文案','沉淀用户真实反馈，为后续复用做准备']])}
 ${activityPlanTable('detail.actions','行动清单',['序号','阶段','优先级','状态','任务名称','任务详情','负责人','交付类型','数量','周次','截止','交付物','依赖','风险提示'],[
  ['1','筹备期','P0','未开始','锁定传播主线','确认“每天一勺=保状态底层动作”为唯一传播主线，统一标题、封面、评论话术','策划','策略文件','1份','第1周','2026-08-04','传播主线说明','项目启动','若主线分散，后续内容记忆点不足'],
  ['2','筹备期','P0','未开始','完成内容排期','确定3篇笔记发布时间、主题分工与投放窗口','运营','排期表','1份','第1周','2026-08-05','月度发布排期','传播主线确认','排期延误会压缩制作时间'],
  ['3','筹备期','P0','未开始','封面与标题定稿','完成3篇封面样式与标题AB版本，确保前三句话直接进入实质内容','设计/文案','素材包','3套','第1周','2026-08-06','封面标题包','主题确认','封面弱会直接影响点击率'],
  ['4','筹备期','P1','未开始','拍摄场景准备','准备通勤、加班、夜晚、训练后四类场景素材','内容制作','拍摄素材','1批','第1周','2026-08-07','原始素材库','脚本确认','场景不真实会削弱代入感'],
  ['5','蓄水期','P0','未开始','发布第1篇共鸣帖','上线疲惫共鸣向内容，突出成年人不缺道理只缺能坚持的动作','运营','笔记','1篇','第2周','2026-08-08','共鸣帖上线','素材完成','若前3句不够直接，停留不足'],
  ['6','蓄水期','P1','未开始','首篇加热测试','对第1篇进行小额定向加热，测试封面点击与收藏表现','投放','投放计划','1轮','第2周','2026-08-10','测试数据表','第1篇发布','定向不准会浪费预算'],
  ['7','蓄水期','P1','未开始','评论区话术承接','围绕“什么时候吃、适合谁、为什么能坚持”设置回复口径','运营','话术库','1份','第2周','2026-08-11','评论回复SOP','首篇评论反馈','回复慢会错失转化窗口'],
  ['8','引爆期','P0','未开始','发布第2篇场景帖','围绕通勤、加班、熬夜后等节点强化产品植入与可执行感','运营','笔记','1篇','第3周','2026-08-16','场景帖上线','首篇数据复盘','场景过多会稀释重点'],
  ['9','引爆期','P1','未开始','放大高反馈评论','将用户真实评论整理进置顶回复，强化“我也是这样”的共鸣扩散','运营','互动优化','1轮','第3周','2026-08-18','置顶评论更新','评论积累','若评论冷清需补充提问引导'],
  ['10','引爆期','P1','未开始','优化投放素材','根据前两篇点击收藏数据调整封面、标题和投放人群标签','投放/设计','优化包','1版','第3周','2026-08-20','二轮投放素材','测试数据','优化过慢影响收割期效率'],
  ['11','收割期','P0','未开始','发布第3篇转化帖','强调长期习惯与稳定状态收益，推动收藏、咨询与购买意向','运营','笔记','1篇','第4周','2026-08-23','转化帖上线','前两篇数据沉淀','转化表达过硬会增加广告感'],
  ['12','收割期','P1','未开始','集中私信与评论答疑','重点回复使用频次、适用场景、坚持理由等问题','运营/客服','答疑记录','1份','第4周','2026-08-26','高频问答汇总','第3篇发布','答疑不一致会影响信任']])}
 ${activityPlanList('detail.reminders','执行提醒',[
  'P0事项需优先完成：传播主线、排期、首篇上线、第三篇转化帖、项目复盘。',
  '本次无达人合作，预算不得被分散到无关合作，优先保证内容质量与投放测试。',
  '评论区建议提前埋伏“你们最容易掉状态的是哪个时刻”“通勤前/加班后/训练后你会选哪一刻固定下来”等问题，原因是更容易引出真实场景讨论。'])}`;
 return `${activityPlanTable('execution.tasks','落地任务',['阶段','任务','详情','负责人','优先级','开始','结束','备注'],[
  ['筹备期','传播主线确认','统一活动主题、表达边界、评论口径与视觉符号','策划','高','2026-08-04','2026-08-04','避免内容跑偏'],
  ['筹备期','内容排期制定','确定3篇发布时间、主题分工、投放节点','运营','高','2026-08-04','2026-08-05','为制作留足时间'],
  ['筹备期','封面标题定稿','完成封面样式、标题AB版、前3句文案','文案/设计','高','2026-08-05','2026-08-05','直接影响点击'],
  ['筹备期','场景素材拍摄','完成通勤、加班、夜晚、训练后素材采集','内容制作','中','2026-08-06','2026-08-07','保证真实感'],
  ['蓄水期','发布共鸣帖','上线第1篇，聚焦成年人疲惫与低门槛动作','运营','高','2026-08-08','2026-08-08','打开情绪入口'],
  ['蓄水期','首轮投放测试','测试点击率、收藏率、停留表现','投放','中','2026-08-08','2026-08-10','为后续优化提供依据'],
  ['蓄水期','评论区承接','回复高频问题并整理用户表达','运营','中','2026-08-09','2026-08-14','沉淀真实洞察'],
  ['引爆期','发布场景帖','上线第2篇，集中呈现通勤、加班、熬夜后节点','运营','高','2026-08-16','2026-08-16','强化可复制感'],
  ['引爆期','优化投放与置顶评论','根据前两篇数据调整素材与互动引导','投放/运营','中','2026-08-17','2026-08-20','放大高反馈点'],
  ['收割期','发布转化帖','上线第3篇，强调长期习惯与稳定状态收益','运营','高','2026-08-23','2026-08-23','承接购买意向'],
  ['收割期','集中答疑','围绕使用场景、频次、坚持理由进行回复','运营/客服','中','2026-08-23','2026-08-28','提升信任感'],
  ['复盘期','数据复盘','汇总内容、投放、互动表现并输出结论','策划/运营','高','2026-08-29','2026-08-30','形成后续优化依据'],
  ['复盘期','资产沉淀','整理可复用标题、封面、评论问题与高效场景','策划/文案','中','2026-08-30','2026-08-31','支持后续延展']])}
 ${activityPlanTimeline('execution.timeline',[
  ['筹备期','8.04-8.07'],['蓄水期','8.08-8.14'],['引爆期','8.15-8.21'],['收割期','8.22-8.28'],['复盘期','8.29-8.31']],[
  ['8.08','第1篇发布','疲惫共鸣内容上线，打开情绪入口'],
  ['8.10','首轮测试复盘','查看点击、收藏、评论表现'],
  ['8.16','第2篇发布','场景植入内容上线，强化可执行感'],
  ['8.20','投放优化','根据前两篇反馈调整素材与定向'],
  ['8.23','第3篇发布','习惯转化内容上线，推动收藏咨询'],
  ['8.30','项目复盘','输出完整数据结论与资产沉淀']])}`;
}
function toggleActivityPlanSection(i){const open=!!(S.planSections&&S.planSections[i]);S.planSections={...(S.planSections||{}),[i]:!open};drawDw();}
function setAllActivityPlanSections(open){
 S.planSections=open?Object.fromEntries(Array.from({length:7},(_,i)=>[i,true])):{};
 drawDw();
}
function activityPlanAccordion(p){
 const chapters=[['活动概述','周期、预算、人群、平台与活动目标。'],['创意方向','方案主题和核心创意。'],['方案小结','策略说明与结果导向。'],['战略地图','传播重点、平台策略、渠道分配、内容矩阵与传播节奏。'],['内容制作建议','整体 KV 视觉、风格统筹与内容 Demo。'],['执行细则','达人匹配、资源配置、指导 SOP 与行动清单。'],['执行清单','分阶段落地任务与执行备注。']];
 return `<div class="plan-doc-tools" style="display:flex;justify-content:flex-end;gap:var(--sp-2);margin:0 0 10px"><button class="btn ghost sm" onclick="setAllActivityPlanSections(true)">全部展开</button><button class="btn ghost sm" onclick="setAllActivityPlanSections(false)">全部收起</button></div>
 <div class="plan-doc-accordion">${chapters.map((x,i)=>{const open=!!(S.planSections&&S.planSections[i]);return `<section class="plan-doc-section ${open?'open':''}"><button class="plan-doc-head" onclick="toggleActivityPlanSection(${i})"><span class="plan-doc-index">${String(i+1).padStart(2,'0')}</span><span class="plan-doc-copy"><span class="plan-doc-title">${x[0]}</span><span class="plan-doc-summary">${x[1]}</span></span><i class="plan-doc-chevron" data-lucide="chevron-down"></i></button>${open?`<div class="plan-doc-body">${activityPlanChapterBody(i,p)}</div>`:''}</section>`;}).join('')}</div>`;
}
function dPlanImgs(p){
 const imgs=planImgs();
 return `<div style="font-size:var(--fs-sm);color:var(--t2);margin-bottom:var(--sp-3)">图片素材 · 3 张</div>
 <div class="imgs">${imgs.map((x,i)=>`<button class="imgc" onclick="openPlanImage(${i})" style="background-image:url('${x.src}');background-size:cover;background-position:center"><span class="lb">${x.l}</span></button>`).join('')}</div>`;
}
function planImgs(){return [
  {l:'图片 1',src:'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=900&q=85'},
  {l:'图片 2',src:'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=85'},
  {l:'图片 3',src:'https://images.unsplash.com/photo-1611080541599-8c6dbde6ed28?auto=format&fit=crop&w=900&q=85'}
];}
function detailImgs(){return [
  {l:'第一屏 · 首屏 KV',ps:'包含产品',src:'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=1200&q=85'},
  {l:'第二屏 · 痛点引入',ps:'不包含产品',src:'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=85'},
  {l:'第三屏 · 核心卖点',ps:'产品作为辅助元素出现',src:'https://images.unsplash.com/photo-1611080541599-8c6dbde6ed28?auto=format&fit=crop&w=1200&q=85'},
  {l:'第四屏 · 技术机制',ps:'产品作为辅助元素出现',src:'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=1200&q=85'},
  {l:'第五屏 · 使用场景',ps:'包含产品',src:'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=85'},
  {l:'第六屏 · 成分解析',ps:'包含产品',src:'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1200&q=85'},
  {l:'第七屏 · 实测对比',ps:'不包含产品',src:'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=1200&q=85'},
  {l:'第八屏 · 使用方法',ps:'包含产品',src:'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=1200&q=85'},
  {l:'第九屏 · 规格与购买',ps:'产品作为辅助元素出现',generating:!S.detailImagesComplete,src:'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=1200&q=85'}
];}
function activeImageSet(){return S.piSet==='detail'?detailImgs():S.piSet==='seo'?planImgs().slice(0,1):planImgs();}
function activeImagePrompt(x){return (S.piSet==='detail'?'天猫详情页护肤精华产品图 ':S.piSet==='seo'?'SEO 文章配图 ':'小红书活动策划')+x.l+'，护肤精华真实使用场景，自然光，干净克制的生活方式画面。'+(x.ps?' '+x.ps+'。':'');}
function detailProductClass(s){return s==='包含产品'?'include':s==='不包含产品'?'exclude':'assist';}
function openPlanImage(i){S.piSet='plan';S.pi=i;drawPlanImage();}
function openSeoImage(i){S.piSet='seo';S.pi=i;drawPlanImage();}
function openDetailImage(i){S.piSet='detail';S.pi=i;drawPlanImage();}
function stepPlanImage(d){
 const n=activeImageSet().length;
 S.pi=(S.pi+d+n)%n;
 updatePlanImage();
}
function drawPlanImage(){
 const imgs=activeImageSet(),i=S.pi||0,x=imgs[i];
 const refSrc=x.generating&&S.piSet==='detail'?imgs[Math.max(0,i-1)].src:x.src;
 imgs.forEach(x=>{const pre=new Image();pre.src=x.src;});
 $('mod').innerHTML=`<div class="img-modal-wrap">
  <button class="img-modal-nav prev" onclick="stepPlanImage(-1)" title="上一张"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg></button>
  <div class="mbox img-detail ${S.piSet==='detail'?'detail-view':''}">
  <div class="img-stage ${x.generating?'is-generating':''}" id="pi-stage" style="--img-bg:url('${x.src}')">
   <span class="img-count" id="pi-count">${i+1} / ${imgs.length}</span>
   <img id="pi-preview" src="${x.src}" alt="${x.l}">
   <div class="img-gen"><i></i><span>图片生成中…</span></div>
  </div>
  <div class="img-side">
   <div class="img-side-h">${S.piSet==='detail'?`<div class="detail-title-row"><div class="ey" id="pi-ey">${x.l}</div><span id="pi-product" class="detail-product-state ${detailProductClass(x.ps)}">${x.ps}</span></div>`:`<div><div class="ey" id="pi-ey">调整素材</div></div>`}<button class="ib" onclick="closeMod()" title="关闭">×</button></div>
   <div class="img-side-b">
    <div class="fld"><label>图片生成提示词</label><textarea id="pi-use">${activeImagePrompt(x)}</textarea></div>
    ${S.piSet==='detail'?`<div class="detail-neg"><button class="detail-neg-head" onclick="toggleDetailNegative()"><span>禁止项提示词</span><span class="arrow" id="detail-neg-arrow">⌄</span></button>
      <div class="detail-neg-body" id="detail-neg-body" hidden><textarea>不要新增多余文字，不要生成乱码，不要改变产品包装、瓶身颜色与品牌标识，不要让文案遮挡产品，不要出现无关元素。</textarea></div></div>`:''}
    <div class="img-two"><div class="fld"><label>图片尺寸</label><select><option>1:1（800×800）</option><option>4:5（1080×1350）</option><option>9:16（1080×1920）</option></select></div><div class="fld"><label>生图模型</label><select><option>GPT Image 2</option><option>GPT Image 1</option></select></div></div>
    <div class="fld"><label>参考图</label><div class="img-ref"><div class="thumb" id="pi-ref" style="background-image:url('${refSrc}')"></div><span class="ref-add-wrap"><button class="add" onclick="togglePromotionReferenceMenu(event)" title="添加参考图"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14"/><path d="M5 12h14"/></svg></button>${S.refMenuOpen?referenceMenu():''}</span></div></div>
   </div>
   <div class="img-side-f"><button class="btn ghost sm" onclick="toast('已设为参考图')">用作参考图</button><button class="btn ghost sm" onclick="downloadPlanImage()">下载图片</button>${S.piSet==='detail'||S.piSet==='seo'?'':`<div class="img-more"><button class="btn ghost sm" onclick="toggleImgMore()">更多 ▾</button><div id="pi-more-menu" class="img-more-menu" hidden><button onclick="toast('已设为封面');toggleImgMore()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>设为封面</button><button class="danger" onclick="deletePlanImage()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2m-9 0 1 15h8l1-15"/></svg>删除图片</button></div></div>`}${x.generating?`<button id="pi-regen" class="btn sm" style="margin-left:auto" disabled>生成中...</button>`:`<button id="pi-regen" class="btn sm" style="margin-left:auto" onclick="regenPlanImage()">重新生成</button>`}</div>
  </div>
  <button class="img-modal-nav next" onclick="stepPlanImage(1)" title="下一张"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></button>
 </div>`;
 $('mod').classList.add('on');
}
function updatePlanImage(){
 const imgs=activeImageSet(),targetIndex=S.pi||0,x=imgs[targetIndex],img=$('pi-preview'),pre=new Image();
 pre.onload=()=>{
  if(targetIndex!==(S.pi||0)||!$('pi-preview'))return;
  const stage=$('pi-stage'),count=$('pi-count'),prompt=$('pi-use'),ref=$('pi-ref'),regen=$('pi-regen');
  img.src=x.src;img.alt=x.l;
  if(stage){stage.style.setProperty('--img-bg',"url('"+x.src+"')");stage.classList.toggle('is-generating',!!x.generating);}
  if(count)count.textContent=(targetIndex+1)+' / '+imgs.length;
  if(prompt)prompt.value=activeImagePrompt(x);
  if(ref){const refSrc=x.generating&&S.piSet==='detail'?imgs[Math.max(0,targetIndex-1)].src:x.src;ref.style.backgroundImage="url('"+refSrc+"')";}
  if(regen){regen.disabled=!!x.generating;regen.textContent=x.generating?'生成中...':'重新生成';regen.onclick=x.generating?null:regenPlanImage;}
  if(S.piSet==='detail'){
   const ey=$('pi-ey'),ps=$('pi-product');
   if(ey)ey.textContent=x.l;
   if(ps){ps.textContent=x.ps;ps.className='detail-product-state '+detailProductClass(x.ps);}
  }
 };
 pre.src=x.src;
}
function toggleDetailNegative(){
 const body=$('detail-neg-body'),arrow=$('detail-neg-arrow');if(!body)return;body.hidden=!body.hidden;if(arrow)arrow.textContent=body.hidden?'⌄':'⌃';
}
function downloadPlanImage(){
 const x=activeImageSet()[S.pi||0];if(x.generating){toast('图片生成完成后可下载');return;}
 const a=document.createElement('a');a.href=x.src;a.download=x.l+'.jpg';a.target='_blank';a.click();toast('已开始下载图片');
}
function toggleImgMore(){const m=$('pi-more-menu');m.hidden=!m.hidden;}
function deletePlanImage(){const m=$('pi-more-menu');m.hidden=true;toast('已删除当前图片');}
function downloadAllPlanImages(){
 planImgs().forEach((x,i)=>setTimeout(()=>{const a=document.createElement('a');a.href=x.src;a.download=x.l+'.jpg';a.target='_blank';a.click();},i*120));
 toast('已开始下载 3 张图片');
}
function downloadAllDetailImages(){
 const imgs=detailImgs().filter(x=>!x.generating);
 imgs.forEach((x,i)=>setTimeout(()=>{const a=document.createElement('a');a.href=x.src;a.download=x.l+'.jpg';a.target='_blank';a.click();},i*120));
 toast('已开始下载 '+imgs.length+' 张已完成详情图');
}
function regenPlanImage(){
 const stage=$('pi-stage'),btn=$('pi-regen');if(!stage||stage.classList.contains('is-generating'))return;
 stage.classList.add('is-generating');btn.disabled=true;btn.textContent='生成中…';
 setTimeout(()=>{stage.classList.remove('is-generating');btn.disabled=false;btn.textContent='重新生成';toast('图片已重新生成');},1600);
}
function inspectionActions(a,inDrawer=true){
 const isAnalysis=a.ty==='分析结论';
 const allowReturn=true;
 if(allowReturn&&a.drawerReturning)return drawerReturnEditor(a);
 if(isAnalysis)return `${a.st==='review'?`<button class="btn sm" onclick="inspectionAction('${a.id}','批准')">批准</button>${drawerReturnButton(a)}`:''}
  ${a.inspection.result?`<span class="st hold">${esc(a.inspection.result)}</span>`:''}
  ${inDrawer?'':`<button class="btn ghost sm" onclick="openReview('${a.id}')">打开</button>`}
  ${inDrawer
    ?`<button class="rvb ${S.pc?'on':''}" onclick="toggleInspectionComment()" aria-expanded="${!!S.pc}">评论 ${subCount(a)?`<span class="n">${subCount(a)}</span>`:''} ${S.pc?'▴':'▾'}</button>`
    :`<button class="rvb" onclick="openReview('${a.id}')">评论 ${subCount(a)?`<span class="n">${subCount(a)}</span>`:''}</button>`}`;
 if(S.inspectionReminderConfirm===a.id)return `<span style="font-size:var(--fs-sm);color:var(--t2)">隐藏 7 天。</span><button class="btn sm" onclick="confirmInspectionReminder('${a.id}')">确定</button><button class="btn ghost sm" onclick="cancelInspectionReminder('${a.id}')">取消</button>`;
 if(a.inspection.reminder)return `<span class="st todo">已设置 · 7 天后提醒</span><button class="btn ghost sm" onclick="cancelInspectionReminder('${a.id}',true)">取消提醒</button>`;
 return `${a.st==='review'?`<button class="btn sm" onclick="inspectionAction('${a.id}','批准')">批准</button>
  ${allowReturn?drawerReturnButton(a):''}<button class="btn ghost sm" onclick="inspectionAction('${a.id}','忽略')">忽略</button><button class="btn ghost sm" onclick="openInspectionReminder('${a.id}')">稍后提醒</button>`:''}
  ${a.inspection.result?`<span class="st hold">${esc(a.inspection.result)}</span>`:''}
  <button class="btn ghost sm" onclick="explainInspectionInChat('${a.id}')">在对话中解释</button>
  ${inDrawer
    ?`<button class="rvb ${S.pc?'on':''}" onclick="toggleInspectionComment()" aria-expanded="${!!S.pc}">评论 ${subCount(a)?`<span class="n">${subCount(a)}</span>`:''} ${S.pc?'▴':'▾'}</button>`
    :`<button class="rvb" onclick="openReview('${a.id}')">评论 ${subCount(a)?`<span class="n">${subCount(a)}</span>`:''}</button>`}`;
}
function refreshInspectionReminder(id){
 render();
 if($('dw').classList.contains('on')&&S.aid===id)drawDw();
}
function openInspectionReminder(id){S.inspectionReminderConfirm=id;refreshInspectionReminder(id);}
function confirmInspectionReminder(id){
 const [,a]=findArt(id);if(!a?.inspection)return;
 a.inspection.reminder='7天后';S.inspectionReminderConfirm=null;refreshInspectionReminder(id);toast('已隐藏 7 天，届时将再次提醒');
}
function cancelInspectionReminder(id,clearSaved=false){
 const [,a]=findArt(id);S.inspectionReminderConfirm=null;if(clearSaved&&a?.inspection)delete a.inspection.reminder;refreshInspectionReminder(id);
}
function inspectionAction(id,action){
 const drawerOpen=$('dw').classList.contains('on')&&S.aid===id;
 act(id,action);if(drawerOpen)drawDw();
}
function inspectionNextAction(id,action){
 const [t,a]=findArt(id);if(!a?.inspection&&!a?.sentiment)return;
 if(a.ty==='分析结论'&&action==='同步到活动'){toast('已同步到活动');return;}
 if(action==='标记为已处理'){
  if(a.inspection)a.inspection.result='已处理';
  if(a.sentiment)a.sentiment.result='已处理';
  a.st='done';if(t.arts.every(x=>x.st==='done'))t.st='done';render();toast('已标记为已处理');return;
 }
 toast('已在同一线程中新增步骤：'+action);
}
function toggleInspectionComment(){
 const opening=!S.pc;S.pc=opening;drawDw();
 if(opening)scrollDrawerToBottom();
}
function dPts(a){
 if(a.inspection){const d=a.inspection;return `<div class="ctx">${[['风险等级',d.severity],['巡检维度',d.category],['实际 '+(d.metric||'GMV'),d.actual],['预期范围',d.expected],['数据日期',d.date],['来源',d.source]].map(([k,v])=>`<div class="ctxr"><span class="k">${esc(k)}</span><span class="v">${esc(v)}</span></div>`).join('')}</div>`;}
 return `<div class="ctx">${(a.vals||[]).map(v=>`<div class="ctxr"><span class="k">${v.l}</span><span class="v">${v.v}</span></div>`).join('')}
  <div class="ctxr"><span class="k">关联活动</span><span class="v">11.11 大促</span></div>
  ${a.id==='a2-label-copy'?'':`<div class="ctxr"><span class="k">来源方向</span><span class="v">方向二</span></div>`}</div>`;
}
function dVer(a){
 if(a.mode==='pptoutline')return `<div class="vrow"><span class="vv">v${a.v}</span><span class="vt">当前版本 · 1 个创意方向 · ${a.pages.length+1} 页大纲</span><span class="vd">刚刚</span></div>`;
 if(a.mode==='pptfile')return `<div class="vrow"><span class="vv">v${a.v}</span><span class="vt">当前版本 · ${a.pageCount} 页 PPTX 文件</span><span class="vd">刚刚</span></div>`;
 if(a.mode==='items')return `<div class="vrow"><span class="vv">v${a.v}</span><span class="vt">当前版本 · ${a.rows.length} 个 SKU 上架资料</span></div>`;
 if(a.inspection)return `<div class="vrow"><span class="vv">v${a.v}</span><span class="vt">当前版本 · ${esc(a.inspection.versionLabel||'GMV 销售巡检')}</span><span class="vd">${esc(a.inspection.updated)}</span></div>`;
 const V=[[a.v,'当前版本 · 采纳方向二后重写','2小时前'],[a.v-1,'首轮生成 · 3 个方向','今天 09:13']].filter(x=>x[0]>0);
 return V.map(v=>`<div class="vrow"><span class="vv">v${v[0]}</span><span class="vt">${v[1]}</span><span class="vd">${v[2]}</span></div>`).join('');
}
