/* New-task attachment sources. The task form stays mounted while choosing references. */
let taSourcePicker=null;
function taSourceMenuHTML(){return [['files','在线文档','documents'],['images','素材库','assets'],['upload','本地上传','upload']].map(([icon,label,source])=>`<button type="button" role="menuitem" onclick="taChooseSource('${source}')"><i data-lucide="${icon}" aria-hidden="true"></i><span>${label}</span></button>`).join('');}
function taToggleSourceMenu(event,trigger){caToggleMenu(event,trigger,taSourceMenuHTML());}
function taChooseSource(source){
 caCloseMenu(true);if(!document.querySelector('#mod .new-task-modal')||!$('mod').classList.contains('on'))return;
 if(source==='upload'){$('ta-input').click();return;}
 if(!['documents','assets'].includes(source))return;
 taCloseSourcePicker();
 taSourcePicker={source,draft:taDraft,selected:new Set(),query:'',type:'全部',error:''};
 const overlay=document.createElement('div');overlay.id='ta-source-overlay';overlay.className='ta-source-overlay';overlay.addEventListener('click',event=>{if(event.target===overlay)taCloseSourcePicker();});document.body.appendChild(overlay);
 $('mod').inert=true;CA_BY_ID.set('ta-new-task',taDraft);
 if(source==='documents')caOpenDocumentPicker('ta-new-task',{mount:'ta-source-overlay',onClose:taCloseSourcePicker,targetLabel:'本次任务'});
 else{taPaintAssetPicker();$('ta-asset-search')?.focus();}
}
function taCloseSourcePicker(){
 if(!taSourcePicker)return;
 if(caDocPicker?.mount==='ta-source-overlay'){caCloseDocumentPicker();return;}
 if(taSourcePicker.onClose){taSourcePicker.onClose();return;}
 taSourcePicker=null;CA_BY_ID.delete('ta-new-task');$('ta-source-overlay')?.remove();$('mod').inert=false;taRender();$('ta-source-trigger')?.focus();
}
function taAssetKey(asset){return asset.img+'|'+asset.n;}
function taVisibleAssets(){return permissionHasPage('know.src')&&knowledgeActiveBrand().id==='a8oparis'&&kbCanUpload()?ASSETS.filter(asset=>asset.img&&['图片','视频'].includes(asset.type)):[];}
function taAssetReferenceAllowed(reference){return reference.brand===knowledgeActiveBrand().id&&taVisibleAssets().some(asset=>taAssetKey(asset)===reference.assetId);}
function taPaintAssetPicker(){
 const p=taSourcePicker;if(!p||p.source!=='assets')return;
 const files=taVisibleAssets().filter(asset=>(p.type==='全部'||asset.type===p.type)&&(!p.query||`${asset.n} ${asset.prod||''} ${(asset.tags||[]).join(' ')}`.toLowerCase().includes(p.query.toLowerCase())));
 const focused=document.activeElement?.id,start=document.activeElement?.selectionStart,scroll=document.querySelector('#ta-source-overlay .ca-doc-body')?.scrollTop||0;
 $('ta-source-overlay').innerHTML=`<div class="mbox ca-doc-modal" role="dialog" aria-modal="true" aria-labelledby="ta-assets-title"><div class="mhd modal-titlebar"><div class="main"><h3 id="ta-assets-title">选择素材</h3><p>选择素材库中的图片或视频，添加到本次任务。</p></div><button type="button" class="ib" aria-label="关闭" onclick="taCloseSourcePicker()">×</button></div>
  <div class="ca-doc-body"><div class="bf-toolbar"><label class="kc-search bf-search"><input id="ta-asset-search" aria-label="搜索素材" placeholder="搜索素材名称、产品或标签" value="${esc(p.query)}" oninput="if(!event.isComposing)taSearchAssets(this.value)" oncompositionend="taSearchAssets(this.value)"></label><div class="seg">${['全部','图片','视频'].map(type=>`<button type="button" class="${type===p.type?'on':''}" onclick="taFilterAssets('${type}')">${type}</button>`).join('')}</div></div>
  <div class="bf-grid ca-doc-grid ta-asset-grid">${files.map(asset=>{const key=taAssetKey(asset),index=ASSETS.indexOf(asset),existing=p.draft.files.some(item=>item.reference?.assetId===key),checked=p.selected.has(key);return `<label class="bf-card ca-doc-card ta-asset-card ${checked?'selected':''} ${existing?'disabled':''}"><input id="ta-asset-pick-${index}" type="checkbox" aria-label="选择 ${esc(asset.n)}" ${existing||checked?'checked':''} ${existing?'disabled':''} onchange="taToggleAsset(${index},this.checked)"><img src="${esc(asset.img)}" alt="${esc(asset.n)}" loading="lazy"><span class="bf-title">${esc(asset.n)}</span><div class="bf-desc">${esc(asset.type)} · ${esc(asset.prod||'品牌素材')}${existing?' · 已添加':''}</div></label>`;}).join('')}</div>${files.length?'':'<div class="ca-doc-empty">没有符合条件的素材</div>'}</div><p class="ca-doc-error" role="alert">${esc(p.error)}</p>
  <div class="mft"><span class="ca-doc-count">已选择 ${p.selected.size} 个</span><span class="spacer"></span><button type="button" class="btn ghost sm" onclick="taCloseSourcePicker()">取消</button><button type="button" class="btn sm" ${p.selected.size?'':'disabled'} onclick="taConfirmAssets()">添加到任务${p.selected.size?'（'+p.selected.size+'）':''}</button></div></div>`;
 if(focused?.startsWith('ta-asset-')){$(focused)?.focus();if(focused==='ta-asset-search'&&typeof start==='number')$(focused)?.setSelectionRange(start,start);}
 const body=document.querySelector('#ta-source-overlay .ca-doc-body');if(body)body.scrollTop=scroll;
}
function taSearchAssets(value){if(taSourcePicker){taSourcePicker.query=value;taPaintAssetPicker();}}
function taFilterAssets(type){if(taSourcePicker&&['全部','图片','视频'].includes(type)){taSourcePicker.type=type;taPaintAssetPicker();}}
function taToggleAsset(index,checked){
 const p=taSourcePicker,asset=ASSETS[index];if(!p||!taVisibleAssets().includes(asset))return;
 const key=taAssetKey(asset);if(p.draft.files.some(item=>item.reference?.assetId===key))return;
 if(checked&&p.draft.files.length+p.selected.size>=TA_MAX_FILES){p.error='最多添加 '+TA_MAX_FILES+' 个附件';taPaintAssetPicker();return;}
 checked?p.selected.add(key):p.selected.delete(key);p.error='';taPaintAssetPicker();
}
function taConfirmAssets(){
 const p=taSourcePicker;if(!p||!p.selected.size||(!p.onClose&&p.draft!==taDraft))return;
 const assets=[...p.selected].map(key=>taVisibleAssets().find(asset=>taAssetKey(asset)===key));
 if(assets.some(asset=>!asset)||p.draft.files.length+assets.length>TA_MAX_FILES){p.error='素材不可用或附件数量超出限制，请重新选择';taPaintAssetPicker();return;}
 assets.forEach(asset=>p.draft.files.push({id:++taNextId,name:assetFileName(asset),size:0,extension:asset.type==='视频'?'mp4':'jpg',lastModified:0,status:'ready',progress:100,reference:{source:'assets',assetId:taAssetKey(asset),brand:knowledgeActiveBrand().id}}));
 taCloseSourcePicker();toast('已添加 '+assets.length+' 个素材引用');
}
document.addEventListener('keydown',event=>{
 if(!taSourcePicker||taSourcePicker.source!=='assets')return;
 if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();taCloseSourcePicker();return;}
 if(event.key==='Tab'){const items=[...document.querySelectorAll('#ta-source-overlay button:not([disabled]),#ta-source-overlay input:not([disabled])')];const first=items[0],last=items.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}}
},true);
