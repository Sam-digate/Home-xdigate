/* ============ 知识库 · 来源与产出 ============ */
const GOV={ok:{n:'已审阅',c:'done'},pend:{n:'待审阅',c:'review'},none:{n:'未审阅',c:'todo'}};
const KB=[
 {id:'k1',n:'品牌整体理解',cat:'战略规划数据',filled:1,at:'2026/06/12',stale:0,reads:142,
  ags:['gen','plan','seo'],gov:'ok',by:'Sophie',
  tx:'A8OPARIS 定位在敏感肌可用的专业修护，价格带 300–600 元。核心矛盾是「专业感」与「可负担」之间的张力——本季选择用真实证据而非价格话术来化解。'},
 {id:'k2',n:'品牌核心定位',cat:'战略规划数据',filled:1,at:'2026/06/12',stale:0,reads:118,
  ags:['gen','plan','pdp','seo'],gov:'ok',by:'Sophie',
  tx:'一句话：把钱花在看得见的地方。不主打成分堆料，主打可验证的变化。'},
 {id:'k3',n:'品牌禁用词规则',cat:'战略规划数据',filled:1,at:'2026/07/28',stale:0,reads:412,
  ags:['gen','vid','pdp','cs','msg','seo'],gov:'ok',by:'法务 · Shlomi',
  tx:'142 条规则。功效宣称类需检测报告支撑；「修护」在精华类目允许，在面霜类目需加限定；禁止绝对化用语与比价表述。'},
 {id:'k4',n:'用户洞察',cat:'战略规划数据',filled:1,at:'2026/05/30',stale:0,reads:64,
  ags:['gen','kol','cs'],gov:'ok',by:'dudu',
  tx:'核心人群 24–32 岁，屏障受损后进入长期修护，决策链路长、复购率高，对「见效快」的话术免疫。'},
 {id:'k5',n:'品牌表达系统',cat:'战略规划数据',filled:1,at:'2026/02/14',stale:1,reads:31,
  ags:['gen','vid'],gov:'pend',by:'Sophie',
  tx:'语气、视觉、排版规范。（半年未更新——本季主推方向已变，建议复核。）'},
 {id:'k6',n:'竞争对手分析',cat:'竞争对手分析',filled:1,at:'2026/03/02',stale:1,reads:23,
  ags:['comp','gen'],gov:'pend',by:'竞品分析',
  tx:'上次盘点为 3 月。近期两个直接竞品已把主推词切到「屏障修护」——这份还没反映。'},
 {id:'k7',n:'产品结构与价值点',cat:'战略规划数据',filled:0,at:null,stale:0,reads:0,ags:[],gov:'none',by:null,tx:''},
 {id:'k8',n:'品牌生态位分析',cat:'品牌生态位分析',filled:0,at:null,stale:0,reads:0,ags:[],gov:'none',by:null,tx:''}];
const KCATS=['全部','战略规划数据','竞争对手分析','品牌生态位分析'];
const PRODS=[
 {n:'A8O 修护精华 30ml',sku:'A8O-SER-30',need:{电商:1,报关:1},miss:[],st:'ok',g:['#C4B5FD','#7C3AED']},
 {n:'A8O 修护安瓶精华 15ml',sku:'A8O-AMP-15',need:{电商:0,报关:1},miss:['功效检测报告'],st:'bad',g:['#FCA5A5','#DC2626']},
 {n:'A8O 舒缓面霜 50ml',sku:'A8O-CRM-50',need:{电商:1,报关:0},miss:['成分中英对照'],st:'warn',g:['#A7F3D0','#059669']}];
const PFIELDS=['产品图','包装图','商品申报名称','净重','类目','规格','成分','卖点','AI 补充卖点'];
const ASSETS=[
 {n:'修护精华主视觉',type:'图片',src:'agent',by:'gen',prod:'A8O 修护精华 30ml',tags:['电商推广','关键词推广'],used:12,img:'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=720&q=84'},
 {n:'真实护肤使用场景',type:'图片',src:'upload',by:'dudu',prod:'A8O 修护精华 30ml',tags:['场景氛围','小红书'],used:8,img:'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=720&q=84'},
 {n:'双十一笔记封面',type:'图片',src:'promo',by:'gen',prod:'A8O 修护精华 30ml',tags:['Hook','小红书'],used:3,img:'https://images.unsplash.com/photo-1611080541599-8c6dbde6ed28?auto=format&fit=crop&w=720&q=84'},
 {n:'安瓶产品展示图',type:'图片',src:'upload',by:'br',prod:'A8O 修护安瓶精华 15ml',tags:['产品展示','电商推广'],used:5,img:'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=720&q=84'},
 {n:'精华质地特写',type:'图片',src:'agent',by:'gen',prod:'A8O 修护精华 30ml',tags:['产品展示','功效表达'],used:9,img:'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=720&q=84'},
 {n:'敏感肌实测记录',type:'视频',src:'upload',by:'dudu',prod:null,tags:['AI 视频','功效表达'],used:6,img:'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=720&q=84'},
 {n:'舒缓面霜使用步骤',type:'图片',src:'upload',by:'br',prod:'A8O 舒缓面霜 50ml',tags:['场景氛围','产品展示'],used:7,img:'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=720&q=84'},
 {n:'成分实验对比图',type:'图片',src:'agent',by:'gen',prod:'A8O 修护精华 30ml',tags:['功效表达','内容引擎'],used:14,img:'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=720&q=84'},
 {n:'晨间护肤组合',type:'图片',src:'promo',by:'gen',prod:'A8O 舒缓面霜 50ml',tags:['电商推广','内容引擎'],used:10,img:'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=720&q=84'},
 {n:'精华吸收过程',type:'视频',src:'agent',by:'vid',prod:'A8O 修护安瓶精华 15ml',tags:['AI 视频','产品展示'],used:4,img:'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=720&q=76&sat=-15'},
 {n:'修护套装陈列',type:'图片',src:'upload',by:'dudu',prod:null,tags:['产品展示','电商推广'],used:2,img:'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=720&q=76&crop=edges'},
 {n:'夜间修护氛围图',type:'图片',src:'promo',by:'gen',prod:'A8O 修护精华 30ml',tags:['场景氛围','小红书'],used:11,img:'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=720&q=76&sat=-10'}];
const ASRC={upload:{n:'人工上传',c:'mut'},agent:{n:'Agent 生成',c:'dom'},promo:{n:'已批准产出晋升',c:'lv'}};
const DEFAULT_ASSET_TAGS=['通用素材','Hook','AI 视频','产品展示','场景氛围','功效表达','电商推广','小红书'];
let CUSTOM_ASSET_TAGS=['抖音','微信公众号','包装','生活方式','前后对比','节日活动','卖点证明','使用流程','纯净配方','高端氛围','案例分享','测试','测试标签','测试图片','产品解析','产品介绍','产品评测','产品推广','产品种草','成分解析','成分解析长文','促销活动','促销转化','短视频','短视频开箱','关键词推广','健康科普','健康知识分享','角色三视图','京东','科普文章','内容引擎','品牌互动','品牌人设','热搜借势','人群推广','人物','社交渠道','深度解析','生活方式推荐','生活方式指南','生活共鸣','时尚健康趋势分析','天猫','图文','推广文章','微博','详情图','小红书文章','一张图片','硬核种草','用户故事','用户体验','育儿知识分享','长文','长文科普','直播带货预热','专家访谈','专业文章','UGC 合集','UGC 分享','article-cover','content-engine','detailImage','promotionPlan','seo','wechat_mp','weibo'];
const SAVED_OUTPUTS=[
 {n:'低预算，先把真实感做满',dom:'内容',cat:'活动策划',v:'v1',summary:'围绕真实使用场景建立信任，以有限预算覆盖预热、爆发与返场阶段，并通过小红书内容放大真实体验。',tags:['小红书','11.11','低预算','真实体验'],related:'11.11 大促',agent:'活动策划 Agent',owner:'du',saved:'今天 11:03',from:'内容 Brief 2111',reads:18,using:2,last:'2小时前',tid:'t1',aid:'a2'},
 {n:'敏感肌精华怎么选：成分、浓度与耐受',dom:'B2B',cat:'SEO 文章',v:'v2',summary:'从敏感肌选购决策切入，梳理耐受判断、成分浓度与四周建立耐受节奏，并提供按预算选择的清单。',tags:['敏感肌','成分科普','SEO','选购指南'],related:'A8O 修护精华 30ml',agent:'B2B SEO Agent',owner:'so',saved:'昨天',from:'9 月 SEO 第 3 批',reads:42,using:3,last:'4小时前',tid:'t13',aid:'a8'},
 {n:'蓄水期预算分配建议',dom:'电商',cat:'分析结论',v:'v1',summary:'基于近 90 天四个计划的数据对比，建议提高老客召回预算占比，并控制相似人群拓展的成本波动。',tags:['预算分配','蓄水期','数据分析','A80PARIS'],related:'11.11 大促',agent:'数据分析 Agent',owner:'du',saved:'昨天 17:02',from:'数据分析 · A80PARIS',reads:11,using:2,last:'昨天',tid:'t19',aid:'a14'}];

const KGRP={src:{n:'来源',d:'Agent 读的东西',tabs:['品牌','产品','素材','品牌文件','达人','热点']},
 out:{n:'产出',d:'Agent 写的东西',tabs:['已保存产出','模板']}};
function kComplete(){const f=KB.filter(x=>x.filled).length;return {f,t:KB.length,p:Math.round(f/KB.length*100)};}
function vKnow(){
 if(S.kgrp===undefined)S.kgrp='src';
 if(S.ktab===undefined)S.ktab=0;
 if(S.kdom===undefined)S.kdom='全部';
 const G=KGRP[S.kgrp],c=kComplete(),stale=KB.filter(x=>x.stale).length;
 return `<div class="wrap">
  <div class="eyebrow">平台 · 知识库</div><h1>知识库</h1>
  <div class="sub">Agent 读的（来源）和 Agent 写的（产出）分开放。保存后的产出可以在这里查看、检索和复用。</div>
  <div class="bar">
    <div class="seg">${Object.keys(KGRP).map(k=>`<button class="${S.kgrp===k?'on':''}" onclick="S.kgrp='${k}';S.ktab=0;S.kdom='全部';render()">${KGRP[k].n} · ${KGRP[k].d}</button>`).join('')}</div>
  </div>
  ${S.kgrp==='src'?`<div class="kcomp">
    <div style="flex:1;min-width:220px">
      <div style="display:flex;align-items:baseline;gap:var(--sp-2);margin-bottom:var(--sp-1)">
        <span class="num" style="font-size:var(--fs-2xl);font-weight:800">${c.p}%</span>
        <span style="font-size:var(--fs-sm);color:var(--t2)">品牌来源完整度 · ${c.f}/${c.t} 条已填</span></div>
      <div class="rbar"><i style="width:${c.p}%;background:${c.p>=80?'var(--green)':c.p>=50?'var(--gold)':'var(--red)'}"></i></div>
      <div style="font-size:var(--fs-xs);color:var(--t2);margin-top:var(--sp-2)">
        ${c.t-c.f} 条还是空的，${stale} 条超过 3 个月没更新。<b>Agent 会照样跑</b>——它不知道自己缺东西，只有你知道。</div>
    </div>
    <div style="display:flex;gap:var(--sp-2);flex-wrap:wrap">
      ${KB.filter(x=>!x.filled).map(x=>`<button class="gapchip" onclick="openKB('${x.id}')">缺 ${x.n} ↗</button>`).join('')}
      ${KB.filter(x=>x.stale).map(x=>`<button class="gapchip warn" onclick="openKB('${x.id}')">${x.n} 已过期 ↗</button>`).join('')}
    </div></div>`:''}
  <div class="bar" style="margin:var(--sp-4) 0 14px;gap:var(--sp-2);flex-wrap:wrap">
    <div class="seg">${G.tabs.map((t,i)=>`<button class="${S.ktab===i?'on':''}" onclick="S.ktab=${i};render()">${t}</button>`).join('')}</div>
    ${S.kgrp==='out'?`<div class="seg">${KDOMS.map(d=>`<button class="${S.kdom===d?'on':''}" onclick="S.kdom='${d}';render()">${d}</button>`).join('')}</div>`:''}
  </div>
  ${kBody()}
 </div>`;
}
function kBody(){
 const t=KGRP[S.kgrp].tabs[S.ktab];
 if(t==='品牌')return kBrand();
 if(t==='产品')return kProductSources();
 if(t==='素材')return kAssets();
 if(t==='品牌文件')return kBrandFiles();
 if(t==='达人')return kCreators(T.find(x=>x.id==='t5').arts[0].rows);
 if(t==='热点')return kHots();
 if(t==='已保存产出')return kSavedOutputs();
 if(t==='模板')return kTpl();
 return `<div class="allclear">「${t}」不在本次原型范围内。</div>`;
}
function kProductSources(){
 if(S.kpSource===undefined)S.kpSource='goods';
 if(S.kpPlatform===undefined)S.kpPlatform='全部';
 const tabs=[['goods','商品'],['inventory','货品'],['manual','手工表单']];
 const platforms=['全部','天猫','抖音','京东'];
 const tertiary=S.kpSource==='manual'?kpManualViewNav():`<div class="kp-platform-nav" role="tablist" aria-label="平台筛选">${platforms.map(platform=>`<button type="button" role="tab" aria-selected="${S.kpPlatform===platform}" class="${S.kpPlatform===platform?'on':''}" onclick="S.kpPlatform='${platform}';render()">${platform}</button>`).join('')}</div>`;
 const content=S.kpSource==='manual'?kProds():kpSyncedTable(S.kpSource,S.kpPlatform);
 return `<div class="kp-source-nav"><div class="seg" role="tablist" aria-label="产品二级分类">${tabs.map(([key,label])=>`<button type="button" role="tab" aria-selected="${S.kpSource===key}" class="${S.kpSource===key?'on':''}" onclick="S.kpSource='${key}';render()">${label}</button>`).join('')}</div>${tertiary}${S.kpSource==='manual'?`<span class="kp-source-spacer"></span>${kpManualTools()}`:''}</div>${content}`;
}
function kpManualViewNav(){
 const view=S.productCols||'all';
 return `<div class="kp-views" aria-label="产品字段分组">${[['all','全部列'],['required','必填信息'],['commerce','电商运营'],['customs','海关申报']].map(([key,label])=>`<button type="button" data-kp-view="${key}" class="${view===key?'on':''}" aria-pressed="${view===key}" onclick="kpSetView('${key}')">${label}</button>`).join('')}</div>`;
}
function kpManualTools(){
 return `<div class="kp-tools"><div class="kp-import"><button class="btn ghost sm" aria-haspopup="true" aria-expanded="false" onclick="kpToggleImport(this)"><i data-lucide="upload"></i>导入</button><div class="kp-import-menu" hidden><button onclick="kpStartImport()"><i data-lucide="file-up"></i>导入 Excel / CSV</button><button onclick="kpDownloadTemplate()"><i data-lucide="download"></i>下载导入模板</button></div></div><button class="btn sm" onclick="kpAddProduct()"><i data-lucide="circle-plus"></i>新增产品</button></div>`;
}
const KP_SYNC_SCHEMAS={
 goods:{
  天猫:[['platform','平台名称',100],['customerId','客户ID',110],['storeId','店铺ID',110],['name','商品名称',280],['numericId','商品数字编号',180],['categoryId','类目ID',130],['mainImageUrl','主图 URL',150]],
  抖音:[['platform','平台名称',100],['customerId','客户ID',110],['storeId','店铺ID',110],['name','商品名称',280],['numericId','商品数字编号',180],['categoryId','类目ID',130],['mainImageUrl','主图 URL',150]],
  京东:[['platform','平台名称',100],['customerId','客户ID',110],['storeId','店铺ID',110],['name','商品名称',280],['numericId','商品数字编号',180],['categoryId','类目ID',130],['mainImageUrl','主图 URL',150]]
 },
 inventory:{
  天猫:[['platform','平台名称',100],['customerId','客户ID',100],['storeId','店铺ID',100],['itemId','货品ID',140],['itemCode','货品编码',150],['itemTitle','货品名称',220],['itemTitleEn','货品英文名称',220],['barcode','条码',150],['warehouseCode','仓库编码',130],['batchCode','库存批次号',140],['quantity','正品库存',100],['lockQuantity','锁定库存',100],['dueDate','失效日期',120],['produceDate','生产日期',120],['updatedAt','更新日期',150],['action','操作',80]],
  抖音:[['platform','平台名称',100],['customerId','客户ID',100],['storeId','店铺ID',100],['itemId','货品ID',140],['itemCode','货品编码',150],['itemTitle','货品名称',220],['itemTitleEn','货品英文名称',220],['barcode','条码',150],['warehouseCode','仓库编码',130],['batchCode','库存批次号',140],['quantity','正品库存',100],['lockQuantity','锁定库存',100],['dueDate','失效日期',120],['produceDate','生产日期',120],['updatedAt','更新日期',150],['action','操作',80]],
  京东:[['platform','平台名称',100],['customerId','客户ID',100],['storeId','店铺ID',100],['itemId','货品ID',140],['itemCode','货品编码',150],['itemTitle','货品名称',220],['itemTitleEn','货品英文名称',220],['barcode','条码',150],['warehouseCode','仓库编码',130],['batchCode','库存批次号',140],['quantity','正品库存',100],['lockQuantity','锁定库存',100],['dueDate','失效日期',120],['produceDate','生产日期',120],['updatedAt','更新日期',150],['action','操作',80]]
 }
};
function kpSyncValue(p,i,kind,platform,key){
 const d=p.details,prefix={天猫:'TM',抖音:'DY',京东:'JD'}[platform],factor={天猫:1,抖音:.72,京东:.84}[platform];
 const values={
  platform:esc(platform),
  select:'<input class="kp-sync-check" type="checkbox" disabled aria-label="选择货品">',
  image:`<img src="${esc(kpImageUrl(d.productImage?.[0],'productImage',0,i))}" alt="${esc(d.declarationName||p.n)}" loading="lazy">`,
  product:`<div class="kp-sync-product"><img src="${esc(kpImageUrl(d.productImage?.[0],'productImage',0,i))}" alt="" loading="lazy"><span>${esc(d.declarationName||p.n)}</span></div>`,
  name:esc(d.declarationName||p.n),id:esc(`${kind==='goods'?prefix:prefix+'-W'}-${p.sku}`),category:esc(d.category||'—'),
  price:'¥'+esc(platform==='抖音'?(d.livePrice||d.dailyPrice||'—'):d.dailyPrice||'—'),promo:'¥'+esc(platform==='京东'?(d.activityB||d.floorPrice||'—'):d.activityA||'—'),
  stock:Math.round(Number(d.stock||0)*factor),locked:Math.round(Number(d.stock||0)*(i+1)*.035),
  barcode:esc(d.barcode||'—'),brand:'A8OPARIS',itemType:i===1?'组合货品':'普通货品',platformMerchant:'A8OPARIS 官方旗舰店',tradeMode:'一般贸易',
  auditStatus:'<span class="kp-sync-status">审核通过</span>',boundProduct:(i+1)+' 个',shop:'A8OPARIS 官方旗舰店',commission:(12+i*3)+'%',model:i===1?'POP':'自营',linked:(i+1)+' 个',
  createdAt:['2026-09-10 14:22','2026-09-08 10:16','2026-09-05 17:40'][i%3],directMailMode:'非直邮',action:`<button class="kp-sync-link kp-sync-action" onclick="toast('已打开${kind==='goods'?'商品':'货品'}详情 · 展示功能')">查看</button>`,
  customerId:'10001',storeId:'20001',numericId:['8657900018421','8657900018422','8657900018423'][i%3],itemCode:`${kind==='goods'?prefix:prefix+'-W'}-${p.sku}`,
  categoryId:platform==='天猫'?['50012032','50012032','50011990'][i%3]:'-',pmdCategory:esc(d.category||'—'),tmallStock:Math.round(Number(d.stock||0)*factor),hasSku:'1 · 有 SKU',
  stockUpdated:['2026-09-11 09:42','2026-09-11 09:36','2026-09-11 09:28'][i%3],mainImageUrl:platform==='天猫'?`<a class="kp-sync-link" href="${esc(kpImageUrl(d.productImage?.[0],'productImage',0,i))}" target="_blank" rel="noopener noreferrer">查看主图 ↗</a>`:'-',
  itemId:`${prefix}-ITEM-${String(i+1).padStart(4,'0')}`,itemTitle:esc(d.declarationName||p.n),itemTitleEn:['A80PARIS Barrier Repair Serum','A80PARIS Repair Ampoule Serum','A80PARIS Soothing Repair Cream'][i%3],
  warehouseCode:({天猫:'TM-HZ-01',抖音:'DY-HD-01',京东:'JD-SH-01'})[platform],batchCode:`B202609${String(i+1).padStart(2,'0')}`,quantity:Math.round(Number(d.stock||0)*factor),lockQuantity:Math.round(Number(d.stock||0)*(i+1)*.035),
  dueDate:['2028-08-31','2028-07-15','2028-06-30'][i%3],produceDate:['2026-09-01','2026-08-18','2026-08-02'][i%3],updatedAt:['2026-09-11 09:42','2026-09-11 09:36','2026-09-11 09:28'][i%3],
  spec:esc(`${d.netWeight||'—'} kg · ${d.length||'—'} × ${d.width||'—'} × ${d.height||'—'} cm`),
  warehouse:platform==='京东'?(i===1?'商家配送':'京东物流'):(platform==='抖音'?'华东云仓':'杭州电商仓'),
  synced:['刚刚','5 分钟前','12 分钟前'][i%3],status:'<span class="kp-sync-status">销售中</span>',
  url:`<a class="kp-sync-link" href="https://example.com/${prefix.toLowerCase()}/${encodeURIComponent(p.sku)}" target="_blank" rel="noopener noreferrer">查看 ↗</a>`
 };
 return values[key]??'—';
}
function kpSyncedTable(kind,platform,showNote=true){
 if(platform==='全部'){
  kpPrepareProducts();const label=kind==='goods'?'商品':'货品',schema=KP_SYNC_SCHEMAS[kind].天猫,rows=['天猫','抖音','京东'].flatMap(source=>kind==='inventory'&&source==='京东'?[]:PRODS.map((p,i)=>({source,p,i}))),width=schema.reduce((sum,col)=>sum+col[2],0);
  return `<section class="kp-sync-section"><div class="kp-sync-summary"><div class="kp-sync-summary-main"><span>${rows.length} 条${label}</span><span class="kp-sync-readonly"><i></i>数据来自全部平台 · 只读</span></div><span>最近更新：刚刚</span></div>
   <div class="kp-sync-scroll" tabindex="0" aria-label="全部平台${label}只读表格"><table class="kp-sync-table" style="width:${width}px"><colgroup>${schema.map(col=>`<col style="width:${col[2]}px">`).join('')}</colgroup>
    <thead><tr>${schema.map(col=>`<th scope="col">${col[1]}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${schema.map(col=>`<td>${kpSyncValue(row.p,row.i,kind,row.source,col[0])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${kpFieldNote()}</section>`;
 }
 kpPrepareProducts();const schema=KP_SYNC_SCHEMAS[kind][platform],rows=kind==='inventory'&&platform==='京东'?[]:PRODS,width=schema.reduce((sum,col)=>sum+col[2],0),updated={天猫:'刚刚',抖音:'3 分钟前',京东:'8 分钟前'}[platform];
 return `<section class="kp-sync-section"><div class="kp-sync-summary"><div class="kp-sync-summary-main"><span>${rows.length} 条${kind==='goods'?'商品':'货品'}</span><span class="kp-sync-readonly"><i></i>数据来自 ${platform} · 只读</span></div><span>最近更新：${updated}</span></div>
  <div class="kp-sync-scroll" tabindex="0" aria-label="${platform}${kind==='goods'?'商品':'货品'}只读表格"><table class="kp-sync-table" style="width:${width}px"><colgroup>${schema.map(col=>`<col style="width:${col[2]}px">`).join('')}</colgroup>
   <thead><tr>${schema.map(col=>`<th scope="col">${col[1]}</th>`).join('')}</tr></thead><tbody>${rows.length?rows.map((p,i)=>`<tr>${schema.map(col=>`<td class="${col[0]==='image'?'kp-sync-image':col[0]==='product'?'kp-sync-product-cell':col[0]==='select'?'kp-sync-select':''}">${kpSyncValue(p,i,kind,platform,col[0])}</td>`).join('')}</tr>`).join(''):`<tr><td class="kp-sync-empty" colspan="${schema.length}">暂无货品数据</td></tr>`}</tbody></table></div>${showNote?kpFieldNote():''}</section>`;
}
function kpFieldNote(){return `<div class="kp-field-note" role="note"><span class="kp-field-note-mark" aria-hidden="true">!</span><span>说明：商品和货品的列表字段以实际读取的为准。</span></div>`;}
const KDOMS=['全部','内容','电商','用户运营','KOL','B2B'];
const TTYPES=['社媒内容','视频','详情页','客服回复','广告计划','活动策划','SEO 文章','达人清单','文档'];
function kDomFromType(ty){return ty==='客服回复'?'用户运营':ty==='详情页'||ty==='广告计划'?'电商':ty==='SEO 文章'?'B2B':ty==='达人清单'?'KOL':'内容';}
const TPLS=[
 {id:'tp1',n:'退款话术模板 v3',dom:'用户运营',ty:'客服回复',used:1284,edit:12,by:'Ariel',at:'2026/07/20',
  from:'C-1048 包裹破损回复',fromT:'t4',sup:'替代 v2（补偿金额写死的那版）',slots:['{客户称呼}','{问题描述}','{退款时效}','{补偿金额}'],
  d:'破损、错发、物流延误三类场景的退款话术。补偿金额走槽位，不写死。'},
 {id:'tp2',n:'小红书真实测评结构',dom:'内容',ty:'社媒内容',used:64,edit:22,by:'dudu',at:'2026/08/14',
  from:'方向二 · 低预算高信任感',fromT:'t1',sup:'——',slots:['{场景}','{痛点}','{证据}','{利益点}'],
  d:'方向二沉淀下来的结构：场景开场 → 痛点对比 → 证据 → 利益点。'},
 {id:'tp3',n:'详情页 A+ 模块骨架',dom:'电商',ty:'详情页',used:31,edit:41,by:'Brooks',at:'2026/06/02',
  from:'A8O 精华详情页 v2',fromT:'t3',sup:'——',slots:['{品牌故事}','{成分实验}','{使用方法}','{敏感肌说明}'],
  d:'品牌故事 / 成分实验 / 使用方法 / 敏感肌说明 / 会场利益点，五段式。'},
 {id:'tp4',n:'达人 Brief 基础版',dom:'KOL',ty:'文档',used:9,edit:38,by:'Sophie',at:'2026/05/18',
  from:'小鹿在成都 · 合作 Brief',fromT:'t5',sup:'——',slots:['{达人名}','{不可协商项}','{交付节点}'],
  d:'合作要求、不可协商项、交付与复盘节点。'}];
function kTpl(){
 const list=S.kdom==='全部'?TPLS:TPLS.filter(t=>t.dom===S.kdom);
 return `
 <div class="note" style="margin-bottom:var(--sp-3)">
   模板是<b>某个产出类型的起手结构</b>，不是新的产出类型。<b>它从已经成立的产出里来</b>——不是先写模板再套内容。
   <b>人工修改率</b>是模板好不好用最直接的信号——改得越多，说明它离现实越远。</div>
  <div class="bar" style="margin:0 0 13px"><span class="chip mut">${list.length} 个模板</span>
   <span class="chip mut">${list.filter(t=>t.from).length} 个来自真实产出</span>
   <span class="spacer"></span>
   <span style="font-size:var(--fs-xs);color:var(--t3)">模板从产出里来 —— 在任务的产出上点「存为模板」</span>
   <button class="btn ghost sm" onclick="toast('从空白建模板通常撑不过两次使用 · 建议从一个已批准的产出开始')">从空白新建</button></div>
  ${list.map(t=>`<div class="pcard" style="${t.edit>=30?'border-left:3px solid var(--gold)':''}">
    <div style="display:flex;align-items:flex-start;gap:var(--sp-3);padding:var(--sp-3) 16px">
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:var(--sp-2);flex-wrap:wrap">
          <b style="font-size:var(--fs-md)">${esc(t.n)}</b><span class="chip dom">${t.ty}</span>
          ${t.edit>=30?'<span class="chip" style="background:var(--warn-bg);color:var(--warn-fg);border:1px solid var(--warn-bd)">改得太多</span>':''}</div>
        <div style="font-size:var(--fs-sm);color:var(--t2);margin-top:var(--sp-1);line-height:1.6">${esc(t.d)}</div>
        <div style="font-size:var(--fs-xs);color:var(--t3);margin-top:var(--sp-1)">${t.by} · 更新于 ${t.at}</div>
        ${t.from?`<div style="font-size:var(--fs-xs);color:var(--t2);margin-top:var(--sp-1);padding-top:var(--sp-1);border-top:1px dashed var(--border)">
          来自 <button style="color:var(--primary);font-weight:600" onclick="go('thread','${t.fromT}')">${esc(t.from)} ↗</button>
          ${t.sup&&t.sup!=='——'?` · ${esc(t.sup)}`:''}</div>`:''}
        ${(t.slots||[]).length?`<div style="display:flex;gap:var(--sp-1);flex-wrap:wrap;margin-top:var(--sp-2)">
          ${t.slots.map(sl=>`<span class="tag">${sl}</span>`).join('')}</div>`:''}</div>
      <div style="text-align:right;flex:0 0 auto">
        <div class="num" style="font-size:var(--fs-xl);font-weight:700">${t.used}</div>
        <div style="font-size:var(--fs-xs);color:var(--t3)">次使用</div>
        <div class="num" style="font-size:var(--fs-sm);font-weight:600;margin-top:var(--sp-1);color:${t.edit>=30?'#B45309':'var(--t2)'}">${t.edit}%</div>
        <div style="font-size:var(--fs-xs);color:var(--t3)">人工修改率</div></div>
    </div>
    ${t.edit>=30?`<div class="note" style="background:var(--warn-bg);border-color:var(--warn-bd);color:#92400E;margin:0 16px 12px">
      每 10 次用有 ${Math.round(t.edit/10)} 次被改。要么模板过时了，要么它根本不该是模板。</div>`:''}
  </div>`).join('')}${list.length?'':'<div class="allclear">当前领域还没有模板。</div>'}`;
}
function kBrand(){
 if(S.kcat===undefined)S.kcat='全部';
 const L=KB.filter(x=>S.kcat==='全部'||x.cat===S.kcat);
 return `<div class="bar" style="margin:0 0 13px">
   <div class="seg">${KCATS.map(c=>`<button class="${S.kcat===c?'on':''}" onclick="S.kcat='${c}';render()">${c}</button>`).join('')}</div>
   <span class="spacer"></span><span class="chip mut">${L.length} 条</span></div>
  ${L.map(x=>`<button class="row" onclick="openKB('${x.id}')" style="align-items:flex-start;padding:var(--sp-3) 14px;${!x.filled?'opacity:.72;border-style:dashed':''}">
    <span style="flex:1;min-width:0">
      <span style="display:flex;align-items:center;gap:var(--sp-2);flex-wrap:wrap">
        <b style="font-size:var(--fs-md)">${esc(x.n)}</b>
        <span class="chip dom">${x.cat}</span>
        ${!x.filled?'<span class="st hold">空的</span>':x.stale?'<span class="st review">已过期</span>':`<span class="st ${GOV[x.gov].c}">${GOV[x.gov].n}</span>`}</span>
      <span style="display:block;font-size:var(--fs-sm);color:var(--t2);margin-top:var(--sp-1);line-height:1.55">${x.filled?esc(x.tx.slice(0,64))+'…':'还没有内容。Agent 读不到，但不会因此停下来。'}</span>
      <span style="display:block;font-size:var(--fs-xs);color:var(--t3);margin-top:var(--sp-1)">
        ${x.filled?`更新于 ${x.at} · ${x.by} · 被读 ${x.reads} 次 · ${x.ags.length} 个 agent 在用`:'从未填写'}</span></span>
    ${x.filled?`<span class="chip lv">${x.reads}</span>`:'<span class="chip mut">—</span>'}</button>`).join('')}`;
}
function openKB(id,tab){
 const x=KB.find(y=>y.id===id);
 if(S.kb!==id)S.kbtab=0;
 if(tab!==undefined)S.kbtab=tab;
 if(S.kbtab===undefined)S.kbtab=0;
 S.kb=id;
 $('dw').innerHTML=`<div class="dw-h">
   <button class="ib" onclick="closeDw()"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
   <div style="flex:1;min-width:0"><div class="ty">来源 · ${x.cat}</div><h3>${esc(x.n)}</h3></div>
   ${!x.filled?'<span class="st hold">空的</span>':x.stale?'<span class="st review">已过期</span>':`<span class="st ${GOV[x.gov].c}">${GOV[x.gov].n}</span>`}</div>
  <div class="dw-tabs"><button class="${S.kbtab===0?'on':''}" onclick="openKB('${id}',0)">内容</button>
   <button class="${S.kbtab===1?'on':''}" onclick="openKB('${id}',1)">使用情况</button></div>
  <div class="dw-b">
   ${S.kbtab===0?`${!x.filled?`<div class="note" style="background:var(--danger-bg);border-color:var(--danger-bd);color:var(--danger-fg-strong);margin-bottom:var(--sp-3)">
     这条是空的。<b>Agent 不会因为缺这条就停下来</b>——它会照跑，只是少了一块依据。缺口只有你看得见。</div>`
    :x.stale?`<div class="note" style="margin-bottom:var(--sp-3)">
     最后更新 ${x.at}，已超过 3 个月。知识会过期——<b>过期的来源照样在给 agent 打底</b>，而且不会有人提醒。</div>`:''}
   <textarea class="kb-content-editor" id="kb-content-editor" placeholder="填写这条知识内容…">${esc(x.tx||'')}</textarea>`
   :`<div class="ctx" style="margin-bottom:var(--sp-3)">
     <div class="ctxr"><span class="k">被读次数</span><span class="v num">${x.reads}</span></div>
     <div class="ctxr"><span class="k">在用的 agent</span><span class="v">${x.ags.length?x.ags.map(a=>nick(a)).join(' · '):'没有 agent 在用'}</span></div>
     <div class="ctxr"><span class="k">审阅状态</span><span class="v">${GOV[x.gov].n}</span></div>
     <div class="ctxr"><span class="k">最后更新</span><span class="v">${x.at||'从未'}</span></div>
     <div class="ctxr"><span class="k">更新人</span><span class="v">${x.by||'—'}</span></div></div>`}
  </div>
  <div class="dw-f">
   ${S.kbtab===0?`<button class="btn" onclick="saveKBContent('${id}')">保存</button>
     <button class="btn ghost" onclick="cancelKBContent('${id}')">取消</button>`:''}
   <span style="margin-left:auto;font-size:var(--fs-xs);color:var(--t3)">${x.reads} 次被读</span>
  </div>`;
 $('dw').classList.add('on');$('scrim').classList.add('on');
}
function saveKBContent(id){
 const x=KB.find(y=>y.id===id),editor=$('kb-content-editor');if(!x||!editor)return;
 const value=editor.value.trim();if(!value){toast('内容不能为空');return;}
 x.tx=value;x.filled=1;x.stale=0;x.at='刚刚';x.by='dudu';closeDw();render();toast('内容已保存');
}
function cancelKBContent(id){openKB(id,0);toast('已取消修改');}
function productSeed(p,i){
 const seeds=[
  {productImage:'A8O 修护精华主图.jpg',declarationName:'A8OPARIS 屏障修护精华液',packageImage:'A8O 修护精华包装图.jpg',netWeight:'0.03',ingredients:'水、甘油、丁二醇、泛醇、神经酰胺 NP、透明质酸钠等。',length:'4.2',width:'4.2',height:'12.8',category:'面部精华',sellingPoints:'敏感肌可用；8 周修护实测；无香精配方。',aiSellingPoints:'轻盈肤感适合早晚高频使用，以真实使用周期建立专业修护信任。',dailyPrice:'469',activityA:'389',activityB:'369',activityC:'349',livePrice:'359',floorPrice:'329',storeUrl:'https://shop.example.com/a8o-ser-30',stock:'1280',detailPage:'A8O 修护精华 30ml · 详情页 v4',tags:'敏感肌、屏障修护、无香精',avgSales:'860',avgRevenue:'328000',customsLedger:'A8O-SER-30-CN',englishName:'A8OPARIS Barrier Repair Serum',hsCode:'3304990099',barcode:'6970000000018',originCountry:'法国',declarationUnit:'瓶'},
  {productImage:'A8O 安瓶精华主图.jpg',declarationName:'A8OPARIS 修护安瓶精华液',packageImage:'A8O 安瓶包装图.jpg',netWeight:'0.015',ingredients:'水、甘油、泛醇、积雪草提取物、神经酰胺 NP 等。',length:'3.5',width:'3.5',height:'10.6',category:'面部精华',sellingPoints:'15ml 集中修护；便携安瓶设计；敏感期精简护理。',aiSellingPoints:'小容量降低尝试门槛，适合差旅和换季阶段的集中修护场景。',dailyPrice:'299',activityA:'259',activityB:'239',activityC:'229',livePrice:'239',floorPrice:'209',storeUrl:'',stock:'640',detailPage:'',tags:'安瓶、集中修护、便携',avgSales:'420',avgRevenue:'98000',customsLedger:'',englishName:'A8OPARIS Repair Ampoule Serum',hsCode:'3304990099',barcode:'6970000000025',originCountry:'法国',declarationUnit:'瓶'},
  {productImage:'A8O 舒缓面霜主图.jpg',declarationName:'A8OPARIS 舒缓修护面霜',packageImage:'A8O 面霜包装图.jpg',netWeight:'0.05',ingredients:'水、角鲨烷、甘油、乳木果脂、神经酰胺 NP 等。',length:'6.1',width:'6.1',height:'5.4',category:'面霜',sellingPoints:'长效保湿；舒缓干燥紧绷；无香精配方。',aiSellingPoints:'适合夜间厚涂与秋冬干燥场景，与修护精华组成精简屏障护理组合。',dailyPrice:'399',activityA:'349',activityB:'329',activityC:'309',livePrice:'319',floorPrice:'289',storeUrl:'https://shop.example.com/a8o-crm-50',stock:'920',detailPage:'A8O 舒缓面霜 50ml · 详情页 v2',tags:'舒缓、保湿、屏障护理',avgSales:'610',avgRevenue:'186000',customsLedger:'A8O-CRM-50-CN',englishName:'A8OPARIS Soothing Repair Cream',hsCode:'3304990099',barcode:'6970000000032',originCountry:'法国',declarationUnit:'瓶'}
 ];
 const data=JSON.parse(JSON.stringify({...(!p._blank?(seeds[p._seedIndex??i]||seeds[0]):{}),...(p.details||{})}));
 ['productImage','packageImage'].forEach(k=>{if(!Array.isArray(data[k]))data[k]=productHas(data[k])?[data[k]]:[];});
 return data;
}
function productHas(v){if(Array.isArray(v))return v.length>0;return typeof v==='boolean'?v:v!==null&&v!==undefined&&String(v).trim()!=='';}
function productStats(d){
 const base=[d.productImage,d.declarationName,d.packageImage,d.netWeight,d.ingredients,productHas(d.length)&&productHas(d.width)&&productHas(d.height),d.category,d.sellingPoints,d.aiSellingPoints];
 const commerce=['dailyPrice','activityA','activityB','activityC','livePrice','floorPrice','storeUrl','stock','detailPage','tags','avgSales','avgRevenue'].map(k=>d[k]);
 const customs=['customsLedger','englishName','hsCode','barcode','originCountry','declarationUnit'].map(k=>d[k]);
 return {base:base.filter(productHas).length,commerce:commerce.filter(productHas).length,customs:customs.filter(productHas).length};
}
function productField(label,key,opt={}){
 const d=S.productDraft||{},required=!!opt.required,missing=S.productValidate&&required&&!productHas(d[key]);
 const cls=`product-field ${opt.full?'full':''} ${missing?'missing':''}`;
 const lab=`<label>${label}${required?'<span class="req">*</span>':''}</label>`;
 if(opt.type==='textarea')return `<div class="${cls}">${opt.ai?`<div class="product-ai-head">${lab}<button onclick="regenerateProductSellingPoint()">重新生成</button></div>`:lab}<textarea rows="${opt.rows||3}" oninput="setProductDraftField('${key}',this.value)">${esc(d[key]||'')}</textarea></div>`;
 if(opt.type==='select')return `<div class="${cls}">${lab}<select onchange="setProductDraftField('${key}',this.value)">${!opt.options.includes(d[key])?`<option value="${esc(d[key]||'')}" selected>${esc(d[key]||'请选择')}</option>`:''}${opt.options.map(x=>`<option ${x===d[key]?'selected':''}>${x}</option>`).join('')}</select></div>`;
 if(opt.prefix)return `<div class="${cls}">${lab}<div class="product-input-prefix"><span>${opt.prefix}</span><input type="${opt.inputType||'text'}" value="${esc(d[key]||'')}" oninput="setProductDraftField('${key}',this.value)"></div></div>`;
 return `<div class="${cls}">${lab}<input type="${opt.inputType||'text'}" value="${esc(d[key]||'')}" placeholder="${opt.placeholder||''}" oninput="setProductDraftField('${key}',this.value)"></div>`;
}
function productUpload(label,key,inputId,color){
 const d=S.productDraft||{},files=Array.isArray(d[key])?d[key]:(productHas(d[key])?[d[key]]:[]),missing=S.productValidate&&!files.length;
 return `<div class="product-upload ${missing?'missing':''}">
   <div class="product-upload-head"><b style="font-size:var(--fs-sm)">${label}<span style="color:var(--red)">*</span></b></div>
   <div class="product-file-list">${files.map((file,i)=>`<div class="product-file" title="${esc(kpImageName(file))}"><button class="thumb" onclick="kpOpenImage(${S.productIndex},'${key}',${i},true)" aria-label="预览${label}"><img src="${esc(kpImageUrl(file,key,i,S.productIndex))}" alt="${esc(label)}" style="width:100%;height:100%;object-fit:cover;border-radius:5px;display:block"></button>
     <button class="remove" onclick="removeProductUpload('${key}',${i})" title="移除">×</button></div>`).join('')}
     <button class="product-add-tile" onclick="$('${inputId}').click()" title="添加图片">＋</button></div>
   <input id="${inputId}" type="file" accept="image/*" multiple hidden onchange="setProductUpload('${key}',this)"></div>`;
}
function productUploadImage(key,index,productIndex){
 const images={
  productImage:['https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=240&q=82','https://images.unsplash.com/photo-1611080541599-8c6dbde6ed28?auto=format&fit=crop&w=240&q=82','https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=240&q=82'],
  packageImage:['https://images.unsplash.com/photo-1611080541599-8c6dbde6ed28?auto=format&fit=crop&w=240&q=82','https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=240&q=82','https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=240&q=82']
 };
 const list=images[key]||images.productImage;
 const requested=productIndex===undefined?(S.productIndex||0):productIndex,pi=PRODS[requested]?._seedIndex??requested;
 return list[(pi+index)%list.length];
}
function productBaseForm(p){
 const d=S.productDraft||{},dimMissing=S.productValidate&&!(productHas(d.length)&&productHas(d.width)&&productHas(d.height));
 return `<div class="product-upload-grid">${productUpload('产品图','productImage','product-main-file',p.g)}${productUpload('包装图','packageImage','product-pack-file',[p.g[1],p.g[0]])}</div>
  <div class="product-form-grid">
   ${productField('商品申报名称','declarationName',{required:true,full:true})}
   ${productField('净重 / kg','netWeight',{required:true,inputType:'number'})}
   ${productField('类目','category',{required:true,type:'select',options:['面部精华','面霜','洁面','面膜','其他']})}
   <div class="product-field full ${dimMissing?'missing':''}"><label>规格 cm（长 × 宽 × 高）<span class="req">*</span></label><div class="product-dims">
    <input type="number" placeholder="长" value="${esc(d.length||'')}" oninput="setProductDraftField('length',this.value)">
    <input type="number" placeholder="宽" value="${esc(d.width||'')}" oninput="setProductDraftField('width',this.value)">
    <input type="number" placeholder="高" value="${esc(d.height||'')}" oninput="setProductDraftField('height',this.value)"></div></div>
   ${productField('成分','ingredients',{required:true,type:'textarea',rows:4,full:true})}
   ${productField('卖点','sellingPoints',{required:true,type:'textarea',full:true})}
   ${productField('AI 补充卖点','aiSellingPoints',{required:true,type:'textarea',full:true})}
  </div>`;
}
function productCommerceForm(){
 return `<div class="product-form-grid">
   <div class="product-section-title">价格</div>
   ${productField('日常价','dailyPrice',{prefix:'¥',inputType:'number'})}${productField('活动价 - A 类','activityA',{prefix:'¥',inputType:'number'})}
   ${productField('活动价 - B 类','activityB',{prefix:'¥',inputType:'number'})}${productField('活动价 - C 类','activityC',{prefix:'¥',inputType:'number'})}
   ${productField('直播价','livePrice',{prefix:'¥',inputType:'number'})}${productField('红线价','floorPrice',{prefix:'¥',inputType:'number'})}
   <div class="product-section-title" style="margin-top:var(--sp-2)">商品信息</div>
   ${productField('店家商品链接','storeUrl',{full:true,placeholder:'https://'})}${productField('库存','stock',{inputType:'number'})}${productField('详情页','detailPage')}
   ${productField('商品标签','tags',{full:true,placeholder:'多个标签用逗号分隔'})}
   <div class="product-section-title" style="margin-top:var(--sp-2)">经营数据</div>
   ${productField('平均销量','avgSales',{inputType:'number'})}${productField('平均销售额','avgRevenue',{prefix:'¥',inputType:'number'})}
  </div>`;
}
function productCustomsForm(){
 return `<div class="product-form-grid">
   ${productField('海关账册料号','customsLedger')}${productField('商品 HS 编码','hsCode')}
   ${productField('英文原名','englishName',{full:true})}${productField('商品国际条形码','barcode')}
   ${productField('原产国','originCountry',{type:'select',options:['法国','中国','日本','韩国','美国','其他']})}
   ${productField('申报单位','declarationUnit',{type:'select',options:['瓶','盒','支','套','千克']})}
  </div>`;
}
function setProductDraftField(key,value){if(S.productDraft)S.productDraft[key]=value;}
async function setProductUpload(key,input){
 const draft=S.productDraft;if(!draft)return;
 const files=await kpReadImages(input.files);if(S.productDraft!==draft||!files.length)return;
 draft[key]=(draft[key]||[]).concat(files);drawProductDrawer();
}
function removeProductUpload(key,index){if(!S.productDraft||!Array.isArray(S.productDraft[key]))return;S.productDraft[key].splice(index,1);drawProductDrawer();}
function regenerateProductSellingPoint(){if(!S.productDraft)return;S.productDraft.aiSellingPoints='结合真实使用频率、肤感与适用场景，突出可长期坚持的产品价值，避免夸张功效表达。';drawProductDrawer();toast('已生成补充卖点');}
function openProduct(i,tab){
 kpPrepareProducts();
 const p=PRODS[i];if(!p)return;
 const continuing=$('dw').classList.contains('on')&&$('dw').querySelector('.product-form-grid');
 if(!continuing||S.productIndex!==i||!S.productDraft){S.productIndex=i;S.productDraft=productSeed(p,i);S.productTab=0;S.productValidate=false;}
 if(tab!==undefined)S.productTab=tab;
 drawProductDrawer();
}
function drawProductDrawer(){
 const i=S.productIndex,p=PRODS[i],d=S.productDraft;if(!p||!d)return;
 const st=productStats(d),tab=S.productTab||0,total=st.base+st.commerce+st.customs;
 const body=[productBaseForm(p),productCommerceForm(),productCustomsForm()][tab];
 $('dw').innerHTML=`<div class="dw-h">
   <button class="ib" onclick="closeProductDrawer()" title="关闭"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
   <div style="flex:1;min-width:0"><div class="ty">知识库 · 产品</div><h3>${esc(p.n)}</h3></div><span class="chip mut">${esc(p.sku)}</span></div>
  <div class="dw-tabs">
   <button class="${tab===0?'on':''}" onclick="openProduct(${i},0)">必填信息</button>
   <button class="${tab===1?'on':''}" onclick="openProduct(${i},1)">电商运营</button>
   <button class="${tab===2?'on':''}" onclick="openProduct(${i},2)">海关申报</button></div>
  <div class="dw-b">${body}</div>
  <div class="dw-f"><button class="btn" onclick="saveProductDrawer()">保存</button><button class="btn ghost" onclick="closeProductDrawer()">取消</button>
   <span style="margin-left:auto;font-size:var(--fs-xs);color:var(--t3)">已填写 ${total}/27</span></div>`;
 $('dw').classList.add('on');$('scrim').classList.add('on');
 kpIcons();
}
function saveProductDrawer(){
 const p=PRODS[S.productIndex],d=S.productDraft;if(!p||!d)return;
 const st=productStats(d);if(st.base<9){S.productValidate=true;S.productTab=0;drawProductDrawer();toast('请先补齐必填信息中的字段');return;}
 p.details=JSON.parse(JSON.stringify(d));if(p._blank)p.n=d.declarationName||'未命名产品';closeProductDrawer();kpRefresh();toast('产品信息已保存');
}
function closeProductDrawer(){S.productDraft=null;S.productIndex=null;S.productTab=0;S.productValidate=false;closeDw();}
function productRequiredFieldStatus(d,field){
 const keys={'产品图':'productImage','包装图':'packageImage','商品申报名称':'declarationName','净重':'netWeight','类目':'category','成分':'ingredients','卖点':'sellingPoints','AI 补充卖点':'aiSellingPoints'};
 if(field==='规格')return productHas(d.length)&&productHas(d.width)&&productHas(d.height);
 return productHas(d[keys[field]]);
}
const KP_FIELDS=[
 ['productImage','产品图片','required',138,'image'],['declarationName','商品申报名称','required',242,'text'],
 ['packageImage','包装图','required',138,'image'],['netWeight','净重/kg','required',96,'number'],
 ['ingredients','成分','required',220,'area'],['dimensions','规格 cm（长 × 宽 × 高）','required',188,'dimensions'],
 ['category','类目','required',116,'select'],['sellingPoints','卖点','required',220,'area'],['aiSellingPoints','AI 补充卖点','required',220,'area'],
 ['dailyPrice','日常价','commerce',96,'number'],['activityA','活动价-A类','commerce',110,'number'],
 ['activityB','活动价-B类','commerce',110,'number'],['activityC','活动价-C类','commerce',110,'number'],
 ['livePrice','直播价','commerce',96,'number'],['floorPrice','红线价','commerce',96,'number'],
 ['storeUrl','店家商品链接','commerce',220,'text'],['stock','库存','commerce',96,'number'],
 ['detailPage','详情页','commerce',220,'text'],['tags','商品标签','commerce',180,'text'],
 ['avgSales','平均销量','commerce',110,'number'],['avgRevenue','平均销售额','commerce',116,'number'],
 ['customsLedger','海关账册料号','customs',170,'text'],['englishName','英文原名','customs',220,'text'],
 ['hsCode','商品HS编码','customs',150,'text'],['barcode','商品国际条形码','customs',172,'text'],
 ['originCountry','原产国','customs',116,'select'],['declarationUnit','申报单位','customs',96,'select']
];
const KP_SELECTS={category:['面部精华','面霜','洁面','面膜','其他'],originCountry:['法国','中国','日本','韩国','美国','其他'],declarationUnit:['瓶','盒','支','套','千克']};
function kpIcons(){if(window.lucide)lucide.createIcons({attrs:{width:15,height:15,'stroke-width':1.8}});}
function kpPrepareProducts(){
 // Keep seed identity stable when rows are inserted or deleted; drafts remain independent.
 PRODS.forEach((p,i)=>{if(p._seedIndex===undefined)p._seedIndex=i;if(!p._tableReady){p.details=productSeed(p,i);p._tableReady=true;}});
}
function kpColumns(view=S.productCols||'all'){
 return KP_FIELDS.filter(f=>view==='all'||f[2]===view||f[0]==='productImage'||f[0]==='declarationName');
}
function kpValue(d,key){return key==='dimensions'?['length','width','height'].map(k=>d[k]??'').join(' × '):String(d[key]??'');}
function kpSummary(){
 const complete=PRODS.filter(p=>productStats(p.details).base===9).length;
 return `<span>${PRODS.length} 个 SKU</span><span class="kp-legend"><i class="kp-dot"></i>必填信息完整 ${complete}</span><span class="kp-legend"><i class="kp-dot missing"></i>必填信息待完善 ${PRODS.length-complete}</span>`;
}
function kpCellText(d,key){
 const value=key==='dimensions'&&!['length','width','height'].some(k=>productHas(d[k]))?'':kpValue(d,key);
 return {value,html:esc(value||'—'),blank:!value};
}
function kpShortStoreUrl(value){
 try{
  const url=new URL(value),path=(url.pathname==='/'?'':url.pathname)+url.search;
  const shortPath=path.length>22?path.slice(0,21)+'…':path;
  return url.hostname+(shortPath?' / '+shortPath.replace(/^\//,''):'');
 }catch(e){return value;}
}
function kpStoreUrlCell(p,i,label){
 const value=String(p.details.storeUrl||'').trim();
 if(!value)return `<div class="kp-cell kp-url-cell blank" role="button" tabindex="0" title="点击填写" aria-label="编辑${label}" onclick="kpEditCell(this,${i},'storeUrl')" onkeydown="if(event.target===this&&(event.key==='Enter'||event.key===' ')){event.preventDefault();kpEditCell(this,${i},'storeUrl')}">—</div>`;
 const safe=esc(value),short=esc(kpShortStoreUrl(value));
 return `<div class="kp-cell kp-url-wrap">
   <button type="button" class="kp-url-text" title="${safe}" aria-label="编辑${label}" onclick="kpEditCell(this.closest('.kp-url-wrap'),${i},'storeUrl')">${short}</button>
   <a class="kp-url-open" href="${safe}" target="_blank" rel="noopener noreferrer" title="访问链接" aria-label="在新窗口访问商品链接" onclick="event.stopPropagation()">↗</a>
  </div>`;
}
function kpImageName(file){return typeof file==='object'&&file?file.name||'图片':String(file||'图片');}
function kpSafeImageUrl(value){return /^(https?:\/\/|blob:|data:image\/)/i.test(String(value||''))?String(value):'';}
function kpImageUrl(file,key,index,productIndex){
 const url=typeof file==='object'&&file?file.url:kpSafeImageUrl(file);
 return kpSafeImageUrl(url)||productUploadImage(key,index,productIndex);
}
function kpImages(p,i,key){
 const files=p.details[key]||[],more=Math.max(0,files.length-2),menuKey=i+':'+key,menuOpen=S.kpImageMenu===menuKey;
 return `<div class="kp-images">${files.slice(0,2).map((file,n)=>`<button type="button" class="kp-thumb" title="${esc(kpImageName(file))}" aria-label="预览${key==='productImage'?'产品图片':'包装图'} ${n+1}" onclick="kpOpenImage(${i},'${key}',${n})"><img src="${esc(kpImageUrl(file,key,n,i))}" alt="${esc(kpImageName(file))}" loading="lazy">${n===1&&more?`<span class="kp-more">+${more}</span>`:''}</button>`).join('')}<button type="button" class="kp-upload" title="添加图片" aria-label="添加${key==='productImage'?'产品图片':'包装图'}" aria-haspopup="true" aria-expanded="${menuOpen}" onclick="kpToggleImageMenu(event,${i},'${key}')"><i data-lucide="upload"></i></button></div>`;
}
function kpTableCell(p,i,f){
 const [key,label,, ,type]=f,cls=key==='productImage'?'kp-main-image':key==='declarationName'?'kp-name':'';
 if(type==='image')return `<td class="${cls}">${kpImages(p,i,key)}</td>`;
 if(key==='storeUrl')return `<td class="${cls}">${kpStoreUrlCell(p,i,label)}</td>`;
 const value=kpCellText(p.details,key);
 return `<td class="${cls}"><div class="kp-cell ${value.blank?'blank':''}" role="button" tabindex="0" title="${esc(value.value||'点击填写')}" aria-label="编辑${label}" onclick="kpEditCell(this,${i},'${key}')" onkeydown="if(event.target===this&&(event.key==='Enter'||event.key===' ')){event.preventDefault();kpEditCell(this,${i},'${key}')}">${value.html}</div></td>`;
}
function kProds(){
 kpPrepareProducts();
 const view=S.productCols||'all',columns=kpColumns(view),width=columns.reduce((n,f)=>n+f[3],104);
 return `<section id="kp-products">
  <div class="kp-summary" id="kp-summary">${kpSummary()}</div>
  <div class="kp-scroll" tabindex="0" aria-label="产品信息表格"><table class="kp-table" style="width:${width}px"><colgroup><col style="width:48px">${columns.map(f=>`<col style="width:${f[3]}px">`).join('')}<col style="width:56px"></colgroup>
   <thead><tr><th scope="col" class="kp-status">状态</th>${columns.map(f=>`<th scope="col" class="${f[0]==='productImage'?'kp-main-image':f[0]==='declarationName'?'kp-name':''}">${f[1]}${f[2]==='required'?'<span class="req">*</span>':''}</th>`).join('')}<th scope="col" class="kp-ops">操作</th></tr></thead>
   <tbody>${PRODS.map((p,i)=>{const ok=productStats(p.details).base===9;return `<tr data-product-row="${i}"><td class="kp-status"><span class="kp-dot ${ok?'':'missing'}" role="img" aria-label="${ok?'必填信息完整':'必填信息待完善'}" title="${ok?'必填信息完整':'必填信息待完善'}"></span></td>${columns.map(f=>kpTableCell(p,i,f)).join('')}<td class="kp-ops"><div class="kp-row-actions"><button class="kp-icon danger" title="删除产品" aria-label="删除产品" onclick="kpAskDelete(${i})"><i data-lucide="trash-2"></i></button></div></td></tr>`;}).join('')}</tbody>
  </table>${!PRODS.length?'<div class="kp-empty">暂无产品</div>':''}</div>${kpFieldNote()}
 </section>`;
}
function kpRefresh(reset=false){
 if(S.kpFinishCellEdit){const finish=S.kpFinishCellEdit;S.kpFinishCellEdit=null;finish(true);}
 kpCloseImageMenu();
 const root=$('kp-products');if(!root)return;
 const scroll=root.querySelector('.kp-scroll'),left=reset?0:scroll?.scrollLeft||0,top=reset?0:scroll?.scrollTop||0;
 root.outerHTML=kProds();const next=$('kp-products').querySelector('.kp-scroll');next.scrollLeft=left;next.scrollTop=top;kpIcons();
}
function kpSetView(view){
 S.productCols=view;document.querySelectorAll('[data-kp-view]').forEach(button=>{const on=button.dataset.kpView===view;button.classList.toggle('on',on);button.setAttribute('aria-pressed',String(on));});kpRefresh(true);
}
function kpSyncStatus(i){
 const p=PRODS[i];if(!p)return;
 const ok=productStats(p.details).base===9,dot=document.querySelector(`[data-product-row="${i}"] .kp-dot`);
 if(dot){dot.classList.toggle('missing',!ok);dot.title=ok?'必填信息完整':'必填信息待完善';dot.setAttribute('aria-label',dot.title);}
 if($('kp-summary'))$('kp-summary').innerHTML=kpSummary();
}
function kpSetValue(p,key,value){
 if(key==='dimensions')['length','width','height'].forEach((k,i)=>p.details[k]=value[i]||'');else p.details[key]=value;
 if(p._blank&&key==='declarationName')p.n=value||'未命名产品';
}
function kpEditCell(el,i,key){
 if(el.classList.contains('editing'))return;
 if(S.kpFinishCellEdit&&S.kpFinishCellEdit(true)===false)return;
 const p=PRODS[i],field=KP_FIELDS.find(f=>f[0]===key);if(!p||!field)return;
 const type=field[4],d=p.details;el.classList.add('editing');el.removeAttribute('title');el.innerHTML='';
 let inputs=[];
 if(type==='dimensions'){
  const group=document.createElement('div');group.className='kp-dim-inputs';el.appendChild(group);
  ['length','width','height'].forEach((k,n)=>{const input=document.createElement('input');input.type='number';input.min='0';input.step='any';input.value=d[k]??'';input.placeholder=['长','宽','高'][n];input.setAttribute('aria-label',input.placeholder+' cm');group.appendChild(input);inputs.push(input);});
 }else{
  const input=document.createElement(type==='area'?'textarea':type==='select'?'select':'input');
  if(type==='select'){const choices=[...new Set(['',d[key]||'',...KP_SELECTS[key]])];choices.forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v||'请选择';input.appendChild(o);});}
  if(type==='number'){input.type='number';input.min='0';input.step=['stock','avgSales'].includes(key)?'1':'any';}
  if(key==='storeUrl'){input.type='text';input.placeholder='输入商品链接';input.autocomplete='url';}
  input.value=d[key]??'';input.setAttribute('aria-label',field[1]);el.appendChild(input);inputs=[input];
 }
 let finished=false;
 const finish=save=>{
  if(finished)return true;
  const nextValue=type==='dimensions'?inputs.map(input=>input.value.trim()):inputs[0].value.trim();
  const invalid=save&&inputs.some(input=>!input.checkValidity());
  if(invalid){toast('请输入有效的非负数值');inputs.find(input=>!input.checkValidity())?.focus();return false;}
  finished=true;if(save)kpSetValue(p,key,nextValue);
  if(S.kpFinishCellEdit===finish)S.kpFinishCellEdit=null;
  if(key==='storeUrl')el.outerHTML=kpStoreUrlCell(p,i,field[1]);
  else{const value=kpCellText(d,key);el.classList.remove('editing','invalid');el.classList.toggle('blank',value.blank);el.innerHTML=value.html;el.title=value.value||'点击填写';}
  kpSyncStatus(i);
  return true;
 };
 S.kpFinishCellEdit=finish;
 el.onfocusout=()=>setTimeout(()=>{if(!finished&&!el.contains(document.activeElement))finish(true);},0);
 inputs.forEach(input=>input.addEventListener('keydown',e=>{
  if(e.key==='Escape'){e.preventDefault();e.stopPropagation();finish(false);el.focus();}
  if(e.key==='Enter'&&!e.isComposing&&(type!=='area'||e.ctrlKey||e.metaKey)){e.preventDefault();e.stopPropagation();finish(true);el.focus();}
 }));
 inputs[0].focus();if(inputs[0].select)inputs[0].select();
}
if(!window.__kpCellOutsideDismiss){
 window.__kpCellOutsideDismiss=true;
 document.addEventListener('pointerdown',event=>{
  const editing=document.querySelector('.kp-cell.editing');
  if(editing&&!editing.contains(event.target)&&S.kpFinishCellEdit)S.kpFinishCellEdit(true);
 },true);
}
function kpBlankDetails(){
 const d={};KP_FIELDS.forEach(f=>{if(f[0]==='dimensions')Object.assign(d,{length:'',width:'',height:''});else d[f[0]]=f[4]==='image'?[]:'';});return d;
}
function kpNewSku(reserved=[]){let n=1;while([...PRODS,...reserved].some(p=>p.sku==='NEW-'+String(n).padStart(3,'0')))n++;return 'NEW-'+String(n).padStart(3,'0');}
function kpNewProduct(reserved=[]){return {n:'未命名产品',sku:kpNewSku(reserved),need:{电商:0,报关:0},miss:[],st:'bad',g:['#C4B5FD','#7C3AED'],_blank:true,_tableReady:true,_seedIndex:0,details:kpBlankDetails()};}
function kpAddProduct(){
 kpPrepareProducts();PRODS.unshift(kpNewProduct());kpRefresh(true);
 const cell=document.querySelector('[data-product-row="0"] .kp-name .kp-cell');if(cell)kpEditCell(cell,0,'declarationName');
}
function kpDialog(title,body,foot){
 $('mod').classList.remove('asset-mode','plan-mode');
 $('mod').innerHTML=`<div class="mbox kp-dialog" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="kp-dialog-head"><h3>${esc(title)}</h3><button class="ib" onclick="closeMod()" title="关闭" aria-label="关闭"><i data-lucide="x"></i></button></div><div class="kp-dialog-body">${body}</div><div class="kp-dialog-foot">${foot}</div></div>`;
 $('mod').classList.add('on');kpIcons();
}
function kpAskDelete(i){
 const p=PRODS[i];if(!p)return;S.kpDeleteProduct=p;
 kpDialog('删除产品',`确认删除 <strong>${esc(p.details.declarationName||p.n)}</strong>？<div>${esc(p.sku)}</div>`,`<button class="btn ghost" onclick="closeMod()">取消</button><button class="btn danger" onclick="kpConfirmDelete()">删除</button>`);
}
function kpConfirmDelete(){
 const i=PRODS.indexOf(S.kpDeleteProduct);if(i<0)return;
 PRODS.splice(i,1);S.kpDeleteProduct=null;closeMod();kpRefresh();toast('产品已删除');
}
async function kpReadImages(fileList){
 const files=Array.from(fileList||[]).filter(f=>f.type.startsWith('image/'));
 if(!files.length){toast('请选择图片文件');return [];}
 try{return await Promise.all(files.map(file=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve({name:file.name,url:reader.result});reader.onerror=()=>reject(reader.error);reader.readAsDataURL(file);})));
 }catch(e){toast('图片读取失败，请重新选择');return [];}
}
function kpToggleImageMenu(event,i,key){
 if(event)event.stopPropagation();
 const button=event?.currentTarget,menuKey=i+':'+key,wasOpen=S.kpImageMenu===menuKey;
 kpCloseImageMenu();if(wasOpen||!button)return;
 S.kpImageMenu=menuKey;button.setAttribute('aria-expanded','true');
 const host=document.createElement('div');host.innerHTML=referenceMenu('kpChooseImageSource',`,${i},'${key}'`,false).trim();
 const menu=host.firstElementChild;if(!menu)return;
 menu.id='kp-image-upload-menu';menu.classList.add('kp-image-upload-menu');document.body.appendChild(menu);
 const anchor=button.getBoundingClientRect(),box=menu.getBoundingClientRect(),gap=8;
 const left=Math.max(gap,Math.min(anchor.left,window.innerWidth-box.width-gap));
 const below=anchor.bottom+gap,top=below+box.height<=window.innerHeight-gap?below:Math.max(gap,anchor.top-box.height-gap);
 Object.assign(menu.style,{position:'fixed',left:left+'px',top:top+'px'});
}
function kpCloseImageMenu(){
 S.kpImageMenu=null;const menu=$('kp-image-upload-menu');if(menu)menu.remove();
 document.querySelectorAll('.kp-upload[aria-expanded="true"]').forEach(button=>button.setAttribute('aria-expanded','false'));
}
function kpChooseImageSource(label,event,i,key){
 if(event)event.stopPropagation();
 kpCloseImageMenu();
 if(label==='本地上传'){kpChooseImages(i,key);return;}
 toast(label+' · 展示菜单，暂未接入操作');
}
function kpChooseImages(i,key){
 const p=PRODS[i];if(!p)return;
 const input=document.createElement('input');input.type='file';input.accept='image/*';input.multiple=true;
 input.onchange=async()=>{const files=await kpReadImages(input.files);if(!PRODS.includes(p)||!files.length)return;p.details[key]=(p.details[key]||[]).concat(files);kpRefresh();toast(`已上传 ${files.length} 张图片`);};input.click();
}
function kpOpenImage(i,key,index=0,draft=false){
 const p=PRODS[i],d=draft?S.productDraft:p?.details;if(!p||!d||!d[key]?.length)return;
 S.kpImage={p,d,key,index:Math.max(0,Math.min(index,d[key].length-1)),draft};kpDrawImage();
}
function kpDrawImage(){
 const ctx=S.kpImage;if(!ctx)return;const {p,d,key,index}=ctx,files=d[key],file=files[index];if(!file)return;
 let url=kpImageUrl(file,key,index,PRODS.indexOf(p));
 if(url.startsWith('https://images.unsplash.com/')){const u=new URL(url);u.searchParams.set('w','1400');u.searchParams.set('q','90');url=u.href;}
 const label=key==='productImage'?'产品图片':'包装图';
 $('mod').classList.remove('asset-mode','plan-mode');
 $('mod').innerHTML=`<div class="mbox kp-preview" role="dialog" aria-modal="true" aria-label="${label}预览"><div class="kp-dialog-head"><h3>${esc(p.n)} · ${label}</h3><button class="ib" onclick="closeMod()" title="关闭" aria-label="关闭"><i data-lucide="x"></i></button></div>
  <div class="kp-preview-stage"><img src="${esc(url)}" alt="${esc(kpImageName(file))}">${files.length>1?`<button class="kp-preview-nav prev" title="上一张" aria-label="上一张" onclick="kpStepImage(-1)"><i data-lucide="chevron-left"></i></button><button class="kp-preview-nav next" title="下一张" aria-label="下一张" onclick="kpStepImage(1)"><i data-lucide="chevron-right"></i></button>`:''}</div>
  <div class="kp-dialog-foot"><span class="kp-preview-caption">${index+1} / ${files.length}</span><span id="kp-image-actions"><button class="btn ghost sm" onclick="kpAskRemoveImage()"><i data-lucide="trash-2"></i>删除图片</button></span></div></div>`;
 $('mod').classList.add('on');kpIcons();
}
function kpStepImage(step){const c=S.kpImage;if(!c)return;c.index=(c.index+step+c.d[c.key].length)%c.d[c.key].length;kpDrawImage();}
function kpAskRemoveImage(){
 $('kp-image-actions').innerHTML='<span class="kp-image-confirm">删除这张图片？<button class="btn ghost sm" onclick="kpDrawImage()">取消</button><button class="btn sm" onclick="kpRemoveImage()">删除</button></span>';
}
function kpRemoveImage(){
 const c=S.kpImage;if(!c)return;c.d[c.key].splice(c.index,1);
 if(c.draft)drawProductDrawer();else kpRefresh();
 if(!c.d[c.key].length){closeMod();return;}c.index=Math.min(c.index,c.d[c.key].length-1);kpDrawImage();
}
function kpToggleImport(button){const menu=button.nextElementSibling;menu.hidden=!menu.hidden;button.setAttribute('aria-expanded',String(!menu.hidden));}
function kpCloseImport(){document.querySelectorAll('.kp-import-menu').forEach(menu=>{menu.hidden=true;menu.previousElementSibling.setAttribute('aria-expanded','false');});}
document.addEventListener('click',e=>{
 if(!e.target.closest('.kp-import'))kpCloseImport();
 if(S.kpImageMenu&&!e.target.closest('#kp-image-upload-menu')&&!e.target.closest('.kp-upload'))kpCloseImageMenu();
 if($('asset-more-menu')&&!e.target.closest('#asset-more-menu')&&!e.target.closest('.ka-action[aria-label="更多"]'))closeAssetMoreMenu();
});
window.addEventListener('resize',()=>{kpCloseImageMenu();closeAssetMoreMenu();});
window.addEventListener('scroll',()=>{kpCloseImageMenu();closeAssetMoreMenu();},true);
let kpSpreadsheetPromise;
function kpSpreadsheet(){
 if(window.XLSX)return Promise.resolve(window.XLSX);
 if(!kpSpreadsheetPromise)kpSpreadsheetPromise=new Promise((resolve,reject)=>{
  const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
  script.onload=()=>window.XLSX?resolve(window.XLSX):reject(new Error('XLSX unavailable'));script.onerror=()=>{script.remove();reject(new Error('XLSX unavailable'));};document.head.appendChild(script);
 }).catch(error=>{kpSpreadsheetPromise=null;throw error;});
 return kpSpreadsheetPromise;
}
async function kpDownloadTemplate(){
 kpCloseImport();
 try{const xlsx=await kpSpreadsheet(),headers=['SKU',...KP_FIELDS.map(f=>f[1]+(f[2]==='required'?'*':''))],wb=xlsx.utils.book_new();xlsx.utils.book_append_sheet(wb,xlsx.utils.aoa_to_sheet([headers]),'产品');xlsx.writeFile(wb,'产品导入模板.xlsx');}
 catch(e){toast('导入工具加载失败，请检查网络后重试');}
}
function kpNormHeader(v){return String(v||'').replace(/[\s*\/\-_:：·.（）()×]/g,'').toLowerCase();}
function kpParseImport(rows){
 const map=new Map();KP_FIELDS.forEach(f=>{[f[0],f[1]].forEach(label=>map.set(kpNormHeader(label),f[0]));});
 Object.entries({产品图:'productImage',产品图片URL:'productImage',包装图URL:'packageImage',净重:'netWeight',规格:'dimensions','规格CM(长*宽*高)':'dimensions',SKU:'sku'}).forEach(([label,key])=>map.set(kpNormHeader(label),key));
 const products=[];let duplicates=0;
 rows.forEach(row=>{
  const p=kpNewProduct(products);let found=false;
  Object.entries(row).forEach(([header,raw])=>{
   const key=map.get(kpNormHeader(header)),value=String(raw??'').trim();if(!key||!value)return;found=true;
   if(key==='sku'){p.sku=value;return;}
   if(key==='productImage'||key==='packageImage'){p.details[key]=value.split(/[\n|]+/).map(v=>v.trim()).filter(kpSafeImageUrl).map((url,n)=>({name:`${key==='productImage'?'产品图':'包装图'}${n+1}`,url}));return;}
   if(key==='dimensions'){const dims=value.split(/[xX×*＊]/).map(v=>v.trim().replace(/\s*cm$/i,''));if(dims.length===3&&dims.every(v=>v!==''&&Number.isFinite(Number(v))&&Number(v)>=0))kpSetValue(p,key,dims);return;}
   p.details[key]=value;
  });
  if(!found)return;if([...PRODS,...products].some(x=>x.sku===p.sku)){duplicates++;return;}
  p.n=p.details.declarationName||'未命名产品';products.push(p);
 });
 return {products,duplicates};
}
function kpStartImport(){
 kpCloseImport();const input=document.createElement('input');input.type='file';input.accept='.xlsx,.xls,.csv';
 input.onchange=async()=>{
  const file=input.files?.[0];if(!file)return;
  try{const xlsx=await kpSpreadsheet(),book=xlsx.read(await file.arrayBuffer(),{type:'array'}),sheet=book.Sheets[book.SheetNames[0]],rows=xlsx.utils.sheet_to_json(sheet,{defval:'',raw:false});
   const result=kpParseImport(rows);if(!result.products.length){toast(result.duplicates?'导入的 SKU 已存在，未修改原有产品':'未识别到产品数据，请使用导入模板');return;}
   S.kpImportRows=result.products;const complete=result.products.filter(p=>productStats(p.details).base===9).length;
   kpDialog('导入产品',`<div>${esc(file.name)}</div><strong>${result.products.length} 个产品</strong> · 必填完整 ${complete} · 待完善 ${result.products.length-complete}${result.duplicates?`<div>已跳过 ${result.duplicates} 个重复 SKU</div>`:''}<div class="kp-import-results">${result.products.map(p=>`<div class="kp-import-result"><span>${esc(p.n)}</span><span>${esc(p.sku)}</span></div>`).join('')}</div>`,`<button class="btn ghost" onclick="closeMod()">取消</button><button class="btn" onclick="kpConfirmImport()">确认导入</button>`);
  }catch(e){toast('文件读取失败，请检查文件格式和网络后重试');}
 };input.click();
}
function kpConfirmImport(){
 const products=(S.kpImportRows||[]).filter(p=>!PRODS.some(old=>old.sku===p.sku));if(!products.length){closeMod();return;}
 kpPrepareProducts();PRODS.unshift(...products);S.kpImportRows=null;closeMod();kpRefresh(true);toast(`已导入 ${products.length} 个产品`);
}
const BRAND_FILES=[
 {id:'bf1',name:'品牌生态位分析源数据.pdf',type:'PDF',size:'2.4 MB',date:'2026-07-30',by:'S',color:'#F97316'},
 {id:'bf2',name:'竞品评论样本.xlsx',type:'表格',size:'860 KB',date:'2026-07-30',by:'S',color:'#10B981'},
 {id:'bf3',name:'用户访谈摘录.docx',type:'文档',size:'1.1 MB',date:'2026-07-29',by:'S',color:'#F97316'},
 {id:'bf4',name:'产品矩阵截图.png',type:'图片',size:'420 KB',date:'2026-07-29',by:'S',color:'#3B82F6'},
 {id:'bf5',name:'渠道资源分配表.csv',type:'表格',size:'188 KB',date:'2026-07-28',by:'S',color:'#10B981'},
 {id:'bf6',name:'USP 候选陈述.md',type:'文档',size:'96 KB',date:'2026-07-28',by:'S',color:'#F97316'},
 {id:'bf7',name:'SWOT 复核记录.pdf',type:'PDF',size:'1.8 MB',date:'2026-07-27',by:'S',color:'#3B82F6'},
 {id:'bf8',name:'定位锚点图.png',type:'图片',size:'516 KB',date:'2026-07-27',by:'S',color:'#10B981'},
 {id:'bf9',name:'行业趋势摘要.pdf',type:'PDF',size:'1.3 MB',date:'2026-07-26',by:'S',color:'#F97316'},
 {id:'bf10',name:'行业术语与品牌语言.docx',type:'文档',size:'740 KB',date:'2026-07-26',by:'S',color:'#3B82F6'}
];
function kBrandFiles(){
 const type=S.brandFileType||'全部',mode=S.brandFileMode||'grid';
 if(S.brandFileSearch===undefined)S.brandFileSearch='';
 const query=S.brandFileSearch.trim().toLowerCase();
 const list=BRAND_FILES.filter(f=>(type==='全部'||f.type===type)&&(!query||`${f.name} ${f.type}`.toLowerCase().includes(query)));
 const icons={PDF:['pdf','PDF'],文档:['doc','DOC'],表格:['sheet','XLS'],图片:['image','IMG']};
 return `<div class="bf-toolbar">
  <label class="kc-search bf-search"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></svg><input id="brand-file-search" type="text" aria-label="搜索品牌文件" placeholder="搜索文件名或类型" value="${esc(S.brandFileSearch)}" oninput="if(!event.isComposing)searchBrandFiles(this)" oncompositionend="searchBrandFiles(this)"></label>
  <div class="seg" role="group" aria-label="品牌文件类型">${['全部','PDF','文档','表格','图片'].map(t=>`<button class="${t===type?'on':''}" aria-pressed="${t===type}" onclick="S.brandFileType='${t}';render()">${t}</button>`).join('')}</div>
  <span class="spacer"></span>
  <div class="seg bf-view" role="group" aria-label="文件展示方式"><button class="${mode==='list'?'on':''}" onclick="S.brandFileMode='list';render()">列表</button><button class="${mode==='grid'?'on':''}" onclick="S.brandFileMode='grid';render()">图标</button></div>
  <button class="btn ghost sm" onclick="$('brand-file-upload').click()"><i data-lucide="upload"></i><span>上传文件</span></button>
  <input id="brand-file-upload" type="file" multiple hidden accept=".pdf,.doc,.docx,.md,.txt,.rtf,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.webp,.gif" onchange="uploadBrandFiles(this)">
 </div>
 <div class="bf-count">${list.length} / ${BRAND_FILES.length}</div>
 <div class="${mode==='grid'?'bf-grid':'bf-list'}">${list.map(f=>{const icon=icons[f.type];return `<article class="bf-card">
  <div class="bf-top"><span class="bf-kind ${icon[0]}">${icon[1]}</span><div class="bf-tools">
   <button class="bf-icon" onclick="downloadBrandFile('${f.id}')" title="下载 ${esc(f.name)}" aria-label="下载 ${esc(f.name)}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M12 3v12m-4-4 4 4 4-4M4 15v5h16v-5"/></svg></button>
   <button class="bf-icon" onclick="manageBrandFile('${f.id}')" title="更多操作" aria-label="${esc(f.name)}的更多操作">⋯</button>
  </div></div>
  <div class="bf-info"><button class="bf-title" onclick="previewBrandFile('${f.id}')">${esc(f.name)}</button><div class="bf-desc">${f.type} · ${esc(f.size)}</div></div>
  <div class="bf-bottom"><time>${esc(f.date)}</time><span class="bf-uploader" style="background:${f.color}" title="上传者 ${esc(f.by)}">${esc(f.by)}</span></div>
 </article>`;}).join('')}</div>
 ${list.length?'':'<div class="allclear">暂无此类型文件，可通过“上传文件”添加。</div>'}`;
}
function searchBrandFiles(input){
 const start=input.selectionStart,end=input.selectionEnd;
 S.brandFileSearch=input.value;render();
 const next=$('brand-file-search');if(next){next.focus({preventScroll:true});next.setSelectionRange(start,end);}
}
function uploadBrandFiles(input){
 const types={pdf:'PDF',doc:'文档',docx:'文档',md:'文档',txt:'文档',rtf:'文档',xls:'表格',xlsx:'表格',csv:'表格',png:'图片',jpg:'图片',jpeg:'图片',webp:'图片',gif:'图片'};
 const now=new Date(),date=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
 let added=0,skipped=0;
 for(const file of Array.from(input.files||[])){
  const type=types[file.name.split('.').pop().toLowerCase()];if(!type){skipped++;continue;}
  const size=file.size>=1048576?(file.size/1048576).toFixed(1)+' MB':file.size>=1024?Math.ceil(file.size/1024)+' KB':file.size+' B';
  BRAND_FILES.unshift({id:'bf-'+Date.now()+'-'+added,name:file.name,type,size,date,by:'DU',color:'#7C3AED',url:URL.createObjectURL(file)});added++;
 }
 input.value='';
 if(added){S.brandFileType='全部';render();}
 toast(added?`已添加 ${added} 个文件，仅保留在本次页面会话${skipped?'；已跳过不支持的格式':''}`:'请选择支持的文件格式');
}
function downloadBrandFile(id){
 const file=BRAND_FILES.find(f=>f.id===id);if(!file)return;
 if(!file.url){toast('这是示例文件记录，请上传原文件后下载');return;}
 const link=document.createElement('a');link.href=file.url;link.download=file.name;document.body.appendChild(link);link.click();link.remove();
}
function previewBrandFile(id){
 const file=BRAND_FILES.find(f=>f.id===id);if(!file)return;
 $('mod').innerHTML=`<div class="mbox"><div class="mhd"><div class="e">知识库 · 品牌文件</div><h3>${esc(file.name)}</h3></div>
  <div class="mbd"><div style="font-size:var(--fs-sm);color:var(--t3);margin-bottom:var(--sp-4)">${file.type} · ${esc(file.size)} · ${esc(file.date)}</div>
  ${file.url&&file.type==='图片'?`<img src="${file.url}" alt="${esc(file.name)}" style="display:block;max-width:100%;max-height:50vh;object-fit:contain;margin:auto">`:`<div class="allclear">${file.url?'此格式暂不支持在线预览，请下载查看。':'这是示例文件记录，尚未提供原文件。'}</div>`}</div>
  <div class="mft"><button class="btn ghost sm" onclick="closeMod()">关闭</button><button class="btn sm" onclick="downloadBrandFile('${id}')">下载文件</button></div></div>`;
 $('mod').classList.add('on');
}
function manageBrandFile(id){
 const file=BRAND_FILES.find(f=>f.id===id);if(!file)return;
 kpDialog('删除文件',`确认删除 <strong>${esc(file.name)}</strong>？删除后无法在本页恢复。`,`<button class="btn ghost" onclick="closeMod()">取消</button><button class="btn danger" onclick="removeBrandFile('${id}')">删除</button>`);
}
function removeBrandFile(id){
 const index=BRAND_FILES.findIndex(f=>f.id===id);if(index<0)return;
 const [file]=BRAND_FILES.splice(index,1);if(file.url)URL.revokeObjectURL(file.url);
 closeMod();render();toast('文件已删除');
}
function assetFilteredEntries(){
 const query=String(S.assetSearch||'').trim().toLowerCase();
 return ASSETS.map((a,i)=>({a,i})).filter(({a})=>{
  if(S.atype==='未关联产品'&&a.prod)return false;
  if(S.atype!=='全部'&&S.atype!=='未关联产品'&&a.type!==S.atype)return false;
  if(S.asrc!=='全部'&&ASRC[a.src].n!==S.asrc)return false;
  if(S.aprod!=='所有产品'&&a.prod!==S.aprod)return false;
  if(S.atag!=='全部'&&S.atag!=='通用素材'&&!a.tags.includes(S.atag))return false;
  return !query||`${a.n} ${a.prod||''} ${(a.tags||[]).join(' ')} ${ASRC[a.src]?.n||''}`.toLowerCase().includes(query);
 });
}
function kAssets(){
 closeAssetMoreMenu();
 if(S.atype===undefined)S.atype='全部';
 if(S.asrc===undefined)S.asrc='全部';
 if(S.aprod===undefined)S.aprod='所有产品';
 if(S.atag===undefined)S.atag='全部';
 if(S.assetSearch===undefined)S.assetSearch='';
 if(S.assetSelecting===undefined)S.assetSelecting=false;
 if(!Array.isArray(S.assetSelected))S.assetSelected=[];
 S.assetSelected=S.assetSelected.filter(i=>ASSETS[i]);
 const tags=S.atagsOpen?DEFAULT_ASSET_TAGS.concat(CUSTOM_ASSET_TAGS):DEFAULT_ASSET_TAGS;
 const products=[...new Set(ASSETS.filter(a=>a.prod).map(a=>a.prod))];
 const entries=assetFilteredEntries(),visibleIndices=entries.map(x=>x.i),selected=S.assetSelected.filter(i=>ASSETS[i]);
 const allVisible=visibleIndices.length>0&&visibleIndices.every(i=>selected.includes(i));
 return `<div class="asset-tools">
   <label class="kc-search asset-search"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></svg><input id="asset-search" type="text" aria-label="搜索素材名称或标签" placeholder="搜索素材名称或标签" value="${esc(S.assetSearch)}" oninput="if(!event.isComposing)searchKAssets(this)" oncompositionend="searchKAssets(this)"></label>
   <div class="seg" role="group" aria-label="素材类型">${['全部','图片','视频','未关联产品'].map(x=>`<button class="${S.atype===x?'on':''}" aria-pressed="${S.atype===x}" onclick="S.atype='${x}';render()">${x}</button>`).join('')}</div>
   <span class="spacer"></span>
   <select class="asset-select product" onchange="S.aprod=this.value;render()"><option>所有产品</option>${products.map(x=>`<option ${S.aprod===x?'selected':''}>${x}</option>`).join('')}</select>
   <select class="asset-select source" onchange="S.asrc=this.value;render()"><option value="全部">来源：全部</option>${Object.values(ASRC).map(x=>`<option value="${x.n}" ${S.asrc===x.n?'selected':''}>来源：${x.n}</option>`).join('')}</select>
   <button class="btn ghost sm" onclick="toast('上传素材')"><i data-lucide="upload"></i><span>上传素材</span></button></div>
  <div class="asset-tags ${S.atagsOpen?'open':''}"><span class="label">标签筛选：</span>${tags.map(x=>`<button class="asset-tag ${S.atag===x?'on':''}" onclick="S.atag=S.atag==='${x}'?'全部':'${x}';render()"><span>${x}</span>${S.atag===x?'<span class="tag-remove">×</span>':''}</button>`).join('')}<button class="asset-tag-more" onclick="S.atagsOpen=!S.atagsOpen;render()"><span>${S.atagsOpen?'收起':`更多 (${CUSTOM_ASSET_TAGS.length})`}</span><i data-lucide="${S.atagsOpen?'chevron-up':'chevron-down'}"></i></button><button class="asset-custom-tag" onclick="openAssetTagManager()">＋ 自定义标签</button></div>
  <div class="kagrid ${S.assetSelecting?'asset-selecting':''}">${entries.map(({a,i:ai})=>{const chosen=selected.includes(ai);return `<div class="kacard ${chosen?'asset-selected':''}">
    <div class="kaimg" role="button" tabindex="0" title="${S.assetSelecting?'选择素材':'查看素材详情'}" aria-pressed="${chosen}" onclick="${S.assetSelecting?`toggleAssetSelection(${ai},event)`:`openAssetImage(${ai})`}" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();${S.assetSelecting?`toggleAssetSelection(${ai},event)`:`openAssetImage(${ai})`}}" style="background-image:url('${a.img}');cursor:pointer">${S.assetSelecting?`<span class="asset-card-check ${chosen?'on':''}">${chosen?'✓':''}</span>`:''}${a.type==='视频'?'<span class="video-mark" aria-hidden="true"><i data-lucide="play"></i></span>':''}</div>
    <div style="padding:var(--sp-2) 10px 10px">
      <div style="display:flex;align-items:center;gap:var(--sp-1)">
       <div style="font-size:var(--fs-sm);font-weight:700;line-height:1.4;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1">${esc(a.n)}</div>
       <div class="ka-actions"><button class="ka-action" title="下载" aria-label="下载" onclick="downloadAsset(${ai},event)"><i data-lucide="download"></i></button><button class="ka-action" title="更多" aria-label="更多" aria-haspopup="true" aria-expanded="false" onclick="toggleAssetMore(event,${ai})"><i data-lucide="ellipsis"></i></button></div></div>
      <div style="font-size:var(--fs-xs);color:var(--t3);margin-top:var(--sp-1);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${a.prod||'未关联产品'}</div>
      <div style="display:flex;gap:var(--sp-1);flex-wrap:wrap;margin-top:var(--sp-1)">${a.src==='agent'?`<span class="chip ${ASRC[a.src].c}">${ASRC[a.src].n}</span>`:''}${a.tags.slice(0,2).map(t=>`<span class="chip dom">${t}</span>`).join('')}</div>
    </div></div>`;}).join('')}</div>
  ${S.assetSelecting?`<div class="asset-bulkbar" role="toolbar" aria-label="批量操作">
   <button class="asset-select-all ${allVisible?'on':''}" aria-pressed="${allVisible}" onclick="selectAllVisibleAssets()"><span>${allVisible?'✓':''}</span>全选</button>
   <strong>已选 ${selected.length} 项</strong><span class="spacer"></span>
   <button class="btn ghost sm" ${selected.length?'':'disabled'} onclick="openAssetProductDrawer()"><i data-lucide="box"></i>关联产品</button>
   <button class="btn ghost sm" ${selected.length?'':'disabled'} onclick="openAssetTagDrawer()"><i data-lucide="tag"></i>批量改标签</button>
   <button class="btn ghost sm" ${selected.length?'':'disabled'} onclick="downloadSelectedAssets()"><i data-lucide="download"></i>批量下载</button>
   <button class="btn ghost sm danger" ${selected.length?'':'disabled'} onclick="askDeleteAssets()"><i data-lucide="trash-2"></i>删除选中</button>
   <button class="btn ghost sm" onclick="exitAssetSelection()">退出选择</button></div>`:''}`;
}
function closeAssetMoreMenu(){
 const menu=$('asset-more-menu');if(menu)menu.remove();
 document.querySelectorAll('.ka-action[aria-expanded="true"]').forEach(button=>button.setAttribute('aria-expanded','false'));
}
function toggleAssetMore(event,i){
 if(event)event.stopPropagation();const button=event?.currentTarget;if(!button)return;
 const current=$('asset-more-menu');if(current&&Number(current.dataset.index)===i){closeAssetMoreMenu();return;}
 closeAssetMoreMenu();button.setAttribute('aria-expanded','true');
 const menu=document.createElement('div');menu.id='asset-more-menu';menu.className='asset-more-menu';menu.dataset.index=i;
 menu.innerHTML=`<button onclick="enterAssetSelection(${i})"><i data-lucide="files"></i><span>多选文件</span></button>
  <button onclick="openAssetTagDrawer([${i}])"><i data-lucide="tag"></i><span>关联标签</span></button>
  <button onclick="openAssetProductDrawer([${i}])"><i data-lucide="box"></i><span>关联产品</span></button>
  <button class="danger" onclick="askDeleteAssets([${i}])"><i data-lucide="trash-2"></i><span>删除文件</span></button>`;
 document.body.appendChild(menu);const anchor=button.getBoundingClientRect(),box=menu.getBoundingClientRect(),gap=6;
 const left=Math.max(8,Math.min(anchor.right-box.width,window.innerWidth-box.width-8));
 const below=anchor.bottom+gap,top=below+box.height<=window.innerHeight-8?below:Math.max(8,anchor.top-box.height-gap);
 Object.assign(menu.style,{left:left+'px',top:top+'px'});if(window.lucide)lucide.createIcons({root:menu,attrs:{width:15,height:15,'stroke-width':1.8}});
}
function enterAssetSelection(i){closeAssetMoreMenu();S.assetSelecting=true;S.assetSelected=ASSETS[i]?[i]:[];render();}
function exitAssetSelection(){closeAssetMoreMenu();S.assetSelecting=false;S.assetSelected=[];render();}
function toggleAssetSelection(i,event){
 if(event)event.stopPropagation();if(!ASSETS[i])return;
 const selected=new Set(S.assetSelected||[]);selected.has(i)?selected.delete(i):selected.add(i);S.assetSelected=[...selected];render();
}
function selectAllVisibleAssets(){
 const visible=assetFilteredEntries().map(x=>x.i),selected=new Set(S.assetSelected||[]),all=visible.length&&visible.every(i=>selected.has(i));
 visible.forEach(i=>all?selected.delete(i):selected.add(i));S.assetSelected=[...selected];render();
}
function assetFileName(a){return a.n.replace(/[·\s]+/g,'-')+(a.type==='视频'?'.mp4':'.jpg');}
function triggerAssetDownload(a){
 const link=document.createElement('a');link.href=a.img;link.download=assetFileName(a);link.target='_blank';link.rel='noopener';link.click();
}
function downloadAsset(i,event){if(event)event.stopPropagation();const a=ASSETS[i];if(!a)return;triggerAssetDownload(a);toast('已开始下载素材');}
function downloadSelectedAssets(){
 const items=(S.assetSelected||[]).map(i=>ASSETS[i]).filter(Boolean);if(!items.length)return;
 items.forEach((a,i)=>setTimeout(()=>triggerAssetDownload(a),i*120));S.assetSelected=[];S.assetSelecting=false;render();toast(`已开始下载 ${items.length} 个素材`);
}
function normalizeAssetIndices(indices){return [...new Set((indices||S.assetSelected||[]).map(Number).filter(i=>ASSETS[i]))];}
function askDeleteAssets(indices){
 closeAssetMoreMenu();const list=normalizeAssetIndices(indices);if(!list.length)return;S.assetDelete=list;
 const names=list.slice(0,3).map(i=>ASSETS[i].n),more=list.length>3?` 等 ${list.length} 个素材`:'';
 kpDialog(list.length===1?'删除素材':'删除选中素材',`确认删除 <strong>${esc(names.join('、'))}${esc(more)}</strong>？删除后无法在本页恢复。`,`<button class="btn ghost" onclick="closeMod()">取消</button><button class="btn danger" onclick="confirmDeleteAssets()">删除</button>`);
}
function confirmDeleteAssets(){
 const list=normalizeAssetIndices(S.assetDelete).sort((a,b)=>b-a);if(!list.length){closeMod();return;}
 list.forEach(i=>{const [a]=ASSETS.splice(i,1);if(a?.objectUrl)URL.revokeObjectURL(a.objectUrl);});
 S.assetDelete=[];S.assetSelected=[];S.assetSelecting=false;closeMod();render();toast(`已删除 ${list.length} 个素材`);
}
function openAssetProductDrawer(indices){
 closeAssetMoreMenu();const list=normalizeAssetIndices(indices);if(!list.length)return;
 S.assetAssociate=list;const products=list.map(i=>ASSETS[i].prod),same=products.every(x=>x===products[0]);S.assetAssociateProduct=same?products[0]||null:null;drawAssetProductDrawer();
}
function drawAssetProductDrawer(){
 const list=normalizeAssetIndices(S.assetAssociate),selected=S.assetAssociateProduct;
 $('dw').classList.remove('focus','expanded');$('dw').innerHTML=`<div class="dw-h"><button class="ib" onclick="closeDw()" title="关闭"><i data-lucide="x"></i></button><div style="flex:1;min-width:0"><div class="ty">素材库 · 关联产品</div><h3>${list.length===1?'关联产品':'批量关联产品'}</h3></div></div>
  <div class="dw-b"><p class="asset-associate-hint">为已选的 ${list.length} 个素材选择一个产品。每个素材只能关联一个产品。</p><div class="asset-product-list">${PRODS.map((p,i)=>`<button class="asset-product-option ${selected===p.n?'on':''}" onclick="selectAssetProduct(${i})"><span class="asset-product-thumb" style="background-image:url('${productUploadImage('productImage',0,i)}')"></span><span><b>${esc(p.n)}</b><small>${esc(p.sku)}</small></span><i data-lucide="check"></i></button>`).join('')}</div></div>
  <div class="dw-f"><button class="btn" ${selected?'':'disabled'} onclick="confirmAssetProductAssociation()">确认关联</button><button class="btn ghost" onclick="closeDw()">取消</button></div>`;
 $('dw').classList.add('on');$('scrim').classList.add('on');if(window.lucide)lucide.createIcons({root:$('dw'),attrs:{width:16,height:16,'stroke-width':1.8}});
}
function selectAssetProduct(i){if(!PRODS[i])return;S.assetAssociateProduct=PRODS[i].n;drawAssetProductDrawer();}
function confirmAssetProductAssociation(){
 const list=normalizeAssetIndices(S.assetAssociate),product=S.assetAssociateProduct;if(!list.length||!product)return;
 list.forEach(i=>ASSETS[i].prod=product);S.assetSelected=[];S.assetSelecting=false;closeDw();render();toast(`已将 ${list.length} 个素材关联到 ${product}`);
}
function allAssetTags(){return DEFAULT_ASSET_TAGS.concat(CUSTOM_ASSET_TAGS);}
function openAssetTagDrawer(indices){
 closeAssetMoreMenu();const list=normalizeAssetIndices(indices);if(!list.length)return;
 const tags=allAssetTags(),selected=[],mixed=[];
 tags.forEach(tag=>{const count=list.filter(i=>(ASSETS[i].tags||[]).includes(tag)).length;if(count===list.length)selected.push(tag);else if(count>0)mixed.push(tag);});
 S.assetTagTargets=list;S.assetLinkedTags=selected;S.assetMixedTags=mixed;drawAssetTagDrawer();
}
function assetTagOption(tag,index){
 const selected=(S.assetLinkedTags||[]).includes(tag),mixed=(S.assetMixedTags||[]).includes(tag);
 return `<button class="asset-link-tag-option ${selected?'on':mixed?'mixed':''}" aria-pressed="${selected}" onclick="toggleAssetLinkedTag(${index})"><span class="asset-link-tag-check">${selected?'✓':mixed?'−':''}</span><span>${esc(tag)}</span></button>`;
}
function drawAssetTagDrawer(scrollTop=null){
 const list=normalizeAssetIndices(S.assetTagTargets),tags=allAssetTags(),selected=S.assetLinkedTags||[];
 const options=tags.map((tag,index)=>({tag,index}));
 $('dw').classList.remove('focus','expanded');$('dw').innerHTML=`<div class="dw-h"><button class="ib" onclick="closeDw()" title="关闭"><i data-lucide="x"></i></button><div style="flex:1;min-width:0"><div class="ty">素材库 · 标签</div><h3>${list.length===1?'关联标签':'批量关联标签'}</h3></div></div>
  <div class="dw-b asset-link-tag-drawer"><p class="asset-associate-hint">可为素材关联多个标签。${list.length>1?'半选标签表示仅部分素材已关联，保持半选不会改变现有状态。':''}</p>
   <section class="asset-linked-tag-summary"><b>已选择标签</b><div class="asset-linked-tag-chips">${selected.map(tag=>{const index=tags.indexOf(tag);return `<button onclick="removeAssetLinkedTag(${index})"><span>${esc(tag)}</span><i data-lucide="x"></i></button>`;}).join('')||'<span class="asset-linked-tag-empty">暂未选择标签</span>'}</div></section>
   <section class="asset-link-tag-section"><div class="asset-link-tag-grid">${options.map(x=>assetTagOption(x.tag,x.index)).join('')||'<div class="asset-tag-empty">暂无标签</div>'}</div></section>
  </div><div class="dw-f"><button class="btn" onclick="confirmAssetTagAssociation()">确认关联</button><button class="btn ghost" onclick="closeDw()">取消</button></div>`;
 $('dw').classList.add('on');$('scrim').classList.add('on');if(window.lucide)lucide.createIcons({root:$('dw'),attrs:{width:16,height:16,'stroke-width':1.8}});
 if(scrollTop!==null){const body=document.querySelector('#dw .dw-b');if(body)body.scrollTop=scrollTop;}
}
function toggleAssetLinkedTag(index){
 const tag=allAssetTags()[index];if(!tag)return;
 const scrollTop=document.querySelector('#dw .dw-b')?.scrollTop||0;
 const selected=new Set(S.assetLinkedTags||[]),mixed=new Set(S.assetMixedTags||[]);
 if(selected.has(tag)){selected.delete(tag);mixed.delete(tag);}else{selected.add(tag);mixed.delete(tag);}
 S.assetLinkedTags=[...selected];S.assetMixedTags=[...mixed];drawAssetTagDrawer(scrollTop);
}
function removeAssetLinkedTag(index){const tag=allAssetTags()[index];if(!tag||(S.assetLinkedTags||[]).indexOf(tag)<0)return;toggleAssetLinkedTag(index);}
function confirmAssetTagAssociation(){
 const list=normalizeAssetIndices(S.assetTagTargets),tags=allAssetTags(),selected=new Set(S.assetLinkedTags||[]),mixed=new Set(S.assetMixedTags||[]);if(!list.length)return;
 list.forEach(i=>{const current=new Set(ASSETS[i].tags||[]);tags.forEach(tag=>{if(selected.has(tag))current.add(tag);else if(!mixed.has(tag))current.delete(tag);});ASSETS[i].tags=[...current];});
 S.assetSelected=[];S.assetSelecting=false;closeDw();render();toast(`已更新 ${list.length} 个素材的标签`);
}
function assetTagExists(name,except=''){
 const key=String(name).trim().toLowerCase(),skip=String(except).trim().toLowerCase();
 return DEFAULT_ASSET_TAGS.concat(CUSTOM_ASSET_TAGS).some(tag=>tag.toLowerCase()===key&&tag.toLowerCase()!==skip);
}
function openAssetTagManager(){
 closeAssetMoreMenu();S.assetTagSearch='';S.assetTagSearchDraft='';S.assetTagSearching=false;S.assetTagAdding=false;S.assetTagEditing=-1;drawAssetTagManager();
}
function drawAssetTagManager(focusId=''){
 const query=String(S.assetTagSearch||'').trim().toLowerCase();
 const defaults=DEFAULT_ASSET_TAGS.filter(tag=>!query||tag.toLowerCase().includes(query));
 const custom=CUSTOM_ASSET_TAGS.map((tag,index)=>({tag,index})).filter(x=>!query||x.tag.toLowerCase().includes(query));
 $('dw').classList.remove('focus','expanded');$('dw').innerHTML=`<div class="dw-h"><button class="ib" onclick="closeDw()" title="关闭"><i data-lucide="x"></i></button><div style="flex:1;min-width:0"><div class="ty">素材库</div><h3>标签管理</h3></div></div>
  <div class="dw-b asset-tag-manager">
   ${query?`<div class="asset-tag-search-state"><span>搜索：${esc(S.assetTagSearch)}</span><button onclick="clearAssetTagSearch()" title="清除搜索"><i data-lucide="x"></i></button></div>`:''}
   <section class="asset-tag-section"><div class="asset-tag-section-head"><div><b>默认标签</b><span>系统内置，不可编辑或删除</span></div><span class="chip mut">${DEFAULT_ASSET_TAGS.length} 个</span></div>
    <div class="asset-locked-tags">${defaults.map(tag=>`<span><i data-lucide="lock"></i>${esc(tag)}</span>`).join('')||'<div class="asset-tag-empty">没有匹配的默认标签</div>'}</div></section>
   <section class="asset-tag-section"><div class="asset-tag-section-head"><div><b>自定义标签</b><span>可新增、修改名称或删除</span></div></div>
    <div class="asset-custom-tag-list">${custom.map(({tag,index})=>S.assetTagEditing===index
      ?`<div class="asset-tag-edit-row"><input id="asset-tag-edit-input" maxlength="30" value="${esc(tag)}" onkeydown="if(event.key==='Enter')saveAssetTagRename(${index});if(event.key==='Escape')cancelAssetTagEdit()"><button title="保存" onclick="saveAssetTagRename(${index})"><i data-lucide="check"></i></button><button title="取消" onclick="cancelAssetTagEdit()"><i data-lucide="x"></i></button></div>`
      :`<div class="asset-custom-tag-row"><span>${esc(tag)}</span><button title="编辑标签" aria-label="编辑${esc(tag)}" onclick="startAssetTagRename(${index})"><i data-lucide="pencil"></i></button><button class="danger" title="删除标签" aria-label="删除${esc(tag)}" onclick="askDeleteCustomAssetTag(${index})"><i data-lucide="trash-2"></i></button></div>`).join('')||'<div class="asset-tag-empty">没有匹配的自定义标签</div>'}</div>
   </section>
  </div><div class="dw-f asset-tag-manager-foot">${S.assetTagAdding
    ?`<input id="asset-tag-new-input" maxlength="30" placeholder="输入标签名称" aria-label="新标签名称" onkeydown="if(event.key==='Enter')saveNewAssetTag();if(event.key==='Escape')cancelAssetTagEdit()"><button class="btn" onclick="saveNewAssetTag()">确定</button><button class="btn ghost" onclick="cancelAssetTagEdit()">取消</button>`
    :S.assetTagSearching
      ?`<input id="asset-tag-search-input" maxlength="30" placeholder="输入标签名称" aria-label="搜索标签" value="${esc(S.assetTagSearchDraft||'')}" onkeydown="if(event.key==='Enter')applyAssetTagSearch();if(event.key==='Escape')cancelAssetTagSearch()"><button class="btn" onclick="applyAssetTagSearch()">搜索</button><button class="btn ghost" onclick="cancelAssetTagSearch()">取消</button>`
      :`<button class="btn" onclick="startAssetTagAdd()">新增标签</button><button class="btn ghost" onclick="startAssetTagSearch()">搜索</button>`}</div>`;
 $('dw').classList.add('on');$('scrim').classList.add('on');if(window.lucide)lucide.createIcons({root:$('dw'),attrs:{width:16,height:16,'stroke-width':1.8}});
 if(focusId)requestAnimationFrame(()=>{const input=$(focusId);if(input){input.focus();input.select();}});
}
function startAssetTagAdd(){S.assetTagSearching=false;S.assetTagAdding=true;S.assetTagEditing=-1;drawAssetTagManager('asset-tag-new-input');}
function startAssetTagSearch(){S.assetTagAdding=false;S.assetTagEditing=-1;S.assetTagSearching=true;S.assetTagSearchDraft=S.assetTagSearch||'';drawAssetTagManager('asset-tag-search-input');}
function applyAssetTagSearch(){
 const input=$('asset-tag-search-input');S.assetTagSearch=String(input?.value||'').trim();S.assetTagSearchDraft=S.assetTagSearch;S.assetTagSearching=false;drawAssetTagManager();
}
function cancelAssetTagSearch(){S.assetTagSearching=false;S.assetTagSearchDraft=S.assetTagSearch||'';drawAssetTagManager();}
function clearAssetTagSearch(){S.assetTagSearch='';S.assetTagSearchDraft='';S.assetTagSearching=false;drawAssetTagManager();}
function startAssetTagRename(index){if(!CUSTOM_ASSET_TAGS[index])return;S.assetTagAdding=false;S.assetTagEditing=index;drawAssetTagManager('asset-tag-edit-input');}
function cancelAssetTagEdit(){S.assetTagAdding=false;S.assetTagEditing=-1;drawAssetTagManager();}
function validAssetTagName(value,except=''){
 const name=String(value||'').trim();
 if(!name){toast('请输入标签名称');return null;}
 if(name.length>30){toast('标签名称最多 30 个字符');return null;}
 if(assetTagExists(name,except)){toast('标签名称已存在');return null;}
 return name;
}
function saveNewAssetTag(){
 const input=$('asset-tag-new-input'),name=validAssetTagName(input?.value);if(!name){input?.focus();return;}
 CUSTOM_ASSET_TAGS.push(name);S.assetTagAdding=false;render();drawAssetTagManager();toast('标签已新增');
}
function saveAssetTagRename(index){
 const old=CUSTOM_ASSET_TAGS[index],input=$('asset-tag-edit-input');if(!old||!input)return;
 const name=validAssetTagName(input.value,old);if(!name){input.focus();return;}
 CUSTOM_ASSET_TAGS[index]=name;ASSETS.forEach(a=>a.tags=[...new Set((a.tags||[]).map(tag=>tag===old?name:tag))]);if(S.atag===old)S.atag=name;
 S.assetTagEditing=-1;render();drawAssetTagManager();toast('标签名称已更新');
}
function askDeleteCustomAssetTag(index){
 const tag=CUSTOM_ASSET_TAGS[index];if(!tag)return;S.assetTagDelete=tag;
 kpDialog('删除自定义标签',`确认删除标签 <strong>${esc(tag)}</strong>？删除后会从相关素材中移除此标签，不会删除素材。`,`<button class="btn ghost" onclick="closeMod()">取消</button><button class="btn danger" onclick="confirmDeleteCustomAssetTag()">删除</button>`);
}
function confirmDeleteCustomAssetTag(){
 const tag=S.assetTagDelete,index=CUSTOM_ASSET_TAGS.indexOf(tag);if(index<0){closeMod();return;}
 CUSTOM_ASSET_TAGS.splice(index,1);ASSETS.forEach(a=>a.tags=(a.tags||[]).filter(x=>x!==tag));if(S.atag===tag)S.atag='全部';
 S.assetTagDelete=null;S.assetTagEditing=-1;closeMod();render();drawAssetTagManager();toast('标签已删除');
}
function openAssetImage(i){S.assetImage=i;drawAssetImage();}
function stepAssetImage(d){S.assetImage=(S.assetImage+d+ASSETS.length)%ASSETS.length;drawAssetImage();}
function drawAssetImage(){
 const i=S.assetImage||0,a=ASSETS[i],file=assetFileName(a);
 ASSETS.forEach(x=>{const pre=new Image();pre.src=x.img;});
 $('mod').innerHTML=`<div class="asset-modal-wrap">
  <button class="img-modal-nav prev" onclick="stepAssetImage(-1)" title="上一张"><i data-lucide="chevron-left"></i></button>
  <div class="mbox asset-detail-modal">
   <div class="asset-preview"><img src="${a.img}" alt="${esc(a.n)}"></div>
   <aside class="asset-info">
    <div class="asset-info-head"><span class="asset-kind">${a.type.toUpperCase()}</span><span class="asset-origin">${a.src==='agent'?'AI 生成':ASRC[a.src].n}</span><button class="ib" onclick="closeMod()" title="关闭"><i data-lucide="x"></i></button></div>
    <div class="asset-info-body">
     <div class="asset-detail-card"><span class="asset-detail-icon"><i data-lucide="file-image"></i></span><div style="min-width:0"><div class="asset-detail-label">文件名</div><div class="asset-detail-value">${esc(file)}</div></div></div>
     <div class="asset-info-section" style="margin-top:var(--sp-5)"><div class="asset-info-title"><i data-lucide="box"></i><span>归属产品</span></div><div class="asset-detail-card"><span class="asset-detail-icon"><i data-lucide="package"></i></span><div style="min-width:0"><div class="asset-detail-label">产品</div><div class="asset-detail-value">${esc(a.prod||'未关联产品')}</div></div></div></div>
     <div class="asset-info-section"><div class="asset-info-title"><i data-lucide="tag"></i><span>业务标签</span></div><div class="asset-business-tags">${a.tags.map(t=>`<span class="chip dom">${t}</span>`).join('')}</div></div>
     <div class="asset-info-section"><div class="asset-info-title"><i data-lucide="info"></i><span>素材信息</span></div><div class="asset-meta-grid">
      <div><span class="asset-detail-label">类型</span><span class="value">${a.type}</span></div><div><span class="asset-detail-label">大小</span><span class="value">${a.type==='视频'?'18.4 MB':'1.2 MB'}</span></div>
      <div><span class="asset-detail-label">创建时间</span><span class="value">2026/8/24</span></div><div><span class="asset-detail-label">来源</span><span class="value">${a.src==='agent'?'AI 生成':ASRC[a.src].n}</span></div>
     </div></div>
    </div>
    <div class="asset-info-foot"><button class="btn asset-download" onclick="downloadAssetImage()"><i data-lucide="download"></i><span>下载素材</span></button></div>
   </aside>
  </div>
  <button class="img-modal-nav next" onclick="stepAssetImage(1)" title="下一张"><i data-lucide="chevron-right"></i></button>
 </div>`;
 $('mod').classList.add('on','asset-mode');
 if(window.lucide)lucide.createIcons({attrs:{width:16,height:16,'stroke-width':1.8}});
}
function downloadAssetImage(){
 const a=ASSETS[S.assetImage||0];if(!a)return;triggerAssetDownload(a);toast('已开始下载素材');
}
function kSavedOutputs(){
 const list=S.kdom==='全部'?SAVED_OUTPUTS:SAVED_OUTPUTS.filter(x=>x.dom===S.kdom);
 return list.map(x=>{
  const i=SAVED_OUTPUTS.indexOf(x),[source]=findArt(x.aid),t=source||T.find(item=>item.id===x.tid),creator=t?crInfo(t):null;
  return `<div class="pcard">
   <div class="saved-output-main">
    <div class="saved-output-head"><div class="saved-output-title"><b>${esc(x.n)}</b></div><span class="chip dom">${esc(x.agent)}</span><span class="chip mut">${x.v}</span></div>
    <div class="saved-output-summary">${esc(x.summary)}</div>
    <div class="saved-output-task-meta">
     ${t?.camp?`<span class="chip camp">${esc(t.camp)}</span>`:'<span class="chip mut">日常</span>'}
     <span class="chip dom">${esc(t?.dom||x.dom)}</span>${t?.lv?`<span class="chip lv">自主 ${esc(t.lv)}</span>`:''}
      <span class="chip mut">产品经理 ${esc(U[t?.own||x.owner]?.n||'待分配')}</span>
     ${creator?`<span class="crbadge ${creator.s}">${creator.av} 由 <b>${esc(creator.nm)}</b> 发起</span>`:''}
     ${t?`<span class="chip mut">${({manual:'手动',scheduled:'定时触发',event:'事件触发',proposal:'采纳提案'})[t.trig||'manual']||'手动'}</span>`:''}
    </div>
   </div>
   <div class="pca"><button class="btn sm" onclick="openSavedOutput(${i})">查看内容 ↗</button><button class="btn ghost sm" onclick="openSavedSourceTask(${i})">打开来源任务 ↗</button>
    <span class="saved-output-usage">被读 ${x.reads} 次 · ${x.using} 个 Agent 在用 · 最近使用 ${esc(x.last)}</span></div>
  </div>`}).join('')+(list.length?'':'<div class="allclear">当前领域还没有已保存产出。</div>');
}
function openSavedSourceTask(i){
 const x=SAVED_OUTPUTS[i];if(!x)return;
 const [source]=findArt(x.aid),t=source||T.find(item=>item.id===x.tid);
 if(!t){toast('来源任务不存在或已移除');return;}
 go('thread',t.id);
 const card=$('pk-'+x.aid);
 if(card)card.scrollIntoView({block:'start'});
}
function openSavedOutput(i){
 const x=SAVED_OUTPUTS[i],[,a]=findArt(x.aid);
 S.tid=x.tid;
 openDw(x.aid,a&&a.mode==='plans'?0:undefined);
}

const CPOOL={total:1240,xhs:{n:892,how:'开任务时按画像匹配'},dy:{n:348,how:'每天 06:00 自动采集入库'}};
const KCREATOR_FILTERS={
 fans:[['all','全部粉丝数'],['under1','1万以下'],['1to5','1万–5万'],['5to10','5万–10万'],['10to50','10万–50万'],['over50','50万及以上']],
 activity:[['all','全部活跃度'],['high','高活跃'],['medium','中活跃'],['low','低活跃'],['unknown','未标注']],
 format:[['all','全部合作形式'],['图文','图文'],['视频','视频'],['综合','综合']],
 favorite:[['all','全部收藏状态'],['yes','已收藏'],['no','未收藏']]
};
function kCreatorFans(value){
 const text=String(value||'').replace(/,/g,'').trim(),number=parseFloat(text);
 if(!Number.isFinite(number))return null;
 return number*(/亿/.test(text)?1e8:/万/.test(text)?1e4:/k/i.test(text)?1e3:/m/i.test(text)?1e6:1);
}
function kCreatorMatches(r){
 const f=S.kCreatorFilters||{},query=(S.kCreatorSearch||'').trim().toLocaleLowerCase();
 if(query&&![r.n,r.h,...(r.tags||[])].join(' ').toLocaleLowerCase().includes(query))return false;
 const ranges={under1:[0,1e4],'1to5':[1e4,5e4],'5to10':[5e4,1e5],'10to50':[1e5,5e5],over50:[5e5,Infinity]};
 if(ranges[f.fans]){const n=kCreatorFans(r.f),[min,max]=ranges[f.fans];if(n===null||n<min||n>=max)return false;}
 const rawActivity=r.activity||r.activityLevel;
 const activity=({'高活跃':'high','中活跃':'medium','低活跃':'low',high:'high',medium:'medium',low:'low'})[rawActivity]||'unknown';
 if(f.activity&&f.activity!=='all'&&activity!==f.activity)return false;
 const formats=Array.isArray(r.formats)?r.formats:(r.rates||[]).map(rate=>rate.trim().split(/\s/)[0]);
 if(f.format&&f.format!=='all'&&!formats.includes(f.format))return false;
 const favorite=r.favorite===true||r.favorite===1;
 if(f.favorite==='yes'&&!favorite||f.favorite==='no'&&favorite)return false;
 return true;
}
function kCreatorRate(r,kind){
 const hit=(r.rates||[]).find(x=>String(x).trim().startsWith(kind));
 return hit?String(hit).trim().slice(kind.length).trim():'—';
}
function setKCreatorFilter(key,value){
 if(!Object.hasOwn(KCREATOR_FILTERS,key))return;
 S.kCreatorFilters={...(S.kCreatorFilters||{}),[key]:value};render();
}
function searchKCreators(input){
 const start=input.selectionStart,end=input.selectionEnd;
 S.kCreatorSearch=input.value;render();
 const next=$('kc-search');if(next){next.focus({preventScroll:true});next.setSelectionRange(start,end);}
}
function searchKAssets(input){
 const start=input.selectionStart,end=input.selectionEnd;
 S.assetSearch=input.value;render();
 const next=$('asset-search');if(next){next.focus({preventScroll:true});next.setSelectionRange(start,end);}
}
function kCreators(rows){
 const platforms={xhs:'小红书',dy:'抖音',bili:'B站'};
 const selected=Object.hasOwn(platforms,S.kCreatorPlatform)?S.kCreatorPlatform:'xhs';
 const platformOf=r=>r.src==='bilibili'?'bili':r.src;
 const list=rows.map((r,i)=>({r,i})).filter(({r})=>platformOf(r)===selected&&kCreatorMatches(r));
 const filters=S.kCreatorFilters||{};
 return `<div class="bar" style="margin:0 0 14px">
  <div class="seg" role="group" aria-label="达人平台筛选">${Object.entries(platforms).map(([key,label])=>`<button class="${selected===key?'on':''}" aria-pressed="${selected===key}" onclick="S.kCreatorPlatform='${key}';render()">${label}</button>`).join('')}</div>
 </div>
 <div class="kc-filterbar">
  <label class="kc-search"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></svg><input id="kc-search" type="text" aria-label="搜索博主名或标签" placeholder="搜索博主名或标签" value="${esc(S.kCreatorSearch||'')}" oninput="if(!event.isComposing)searchKCreators(this)" oncompositionend="searchKCreators(this)"></label>
  ${Object.entries(KCREATOR_FILTERS).map(([key,options])=>`<select class="${filters[key]&&filters[key]!=='all'?'active':''}" aria-label="${options[0][1]}" onchange="setKCreatorFilter('${key}',this.value)">${options.map(([value,label])=>`<option value="${value}" ${value===(filters[key]||'all')?'selected':''}>${label}</option>`).join('')}</select>`).join('')}
  <button class="btn kc-column-btn" type="button" aria-label="设置达人库表格列"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 7h16"/><path d="M4 17h16"/><circle cx="9" cy="7" r="2"/><circle cx="15" cy="17" r="2"/></svg>设置列</button>
  <button class="btn kc-add" onclick="toast('添加达人表单待配置')">＋ 添加达人</button>
 </div>
 <div class="kc-result-count">当前名单显示 ${list.length} / ${rows.length} 位</div>
  ${list.length?`<div class="kc-table-wrap"><table class="kc-table">
   <colgroup><col style="width:190px"><col style="width:210px"><col style="width:72px"><col style="width:72px"><col style="width:76px"><col style="width:86px"><col style="width:86px"><col style="width:90px"><col style="width:112px"><col style="width:88px"><col style="width:76px"></colgroup>
   <thead><tr><th>达人</th><th>标签</th><th>平台</th><th>粉丝</th><th>互动率</th><th>图文报价</th><th>视频报价</th><th>合作状态</th><th>契合评分</th><th>AI 校验</th><th>操作</th></tr></thead>
   <tbody>${list.map(({r,i})=>{const platform=platformOf(r),check=r.flag?['需核实','bad']:r.cool&&r.cool!=='无限制'?['冷却期','warn']:['通过','ok'];return `<tr tabindex="0" onclick="openKCreator(${i})" onkeydown="if(event.key==='Enter'){openKCreator(${i})}">
    <td><span class="kc-person"><button class="creator-fav ${isCreatorFav(r,i)?'on':''}" onclick="toggleCreatorFav(${i},event)" aria-label="${isCreatorFav(r,i)?'取消收藏':'收藏'}${esc(r.n)}">★</button><span class="avatar" style="${grad(r.g[0],r.g[1])}"></span><span style="min-width:0"><span class="name">${esc(r.n)}</span><span class="handle">${esc(r.h||'')} · ${esc(r.quality||'内容稳定')}</span></span></span></td>
    <td><span class="kc-table-tags">${(r.tags||[]).map(x=>`<span class="kc-table-tag">${esc(x)}</span>`).join('')}</span></td>
    <td><span class="kc-table-platform ${platform}">${esc(platforms[platform]||r.src||'未设置')}</span></td>
    <td>${esc(r.f||'—')}</td><td>${esc(r.eng||(r.perf&&r.perf.eng)||'—')}</td>
    <td>${esc(kCreatorRate(r,'图文'))}</td><td>${esc(kCreatorRate(r,'视频'))}</td>
    <td><span class="st ${RST[r.s]}">${esc(r.s)}</span></td>
    <td><span class="kc-table-score"><span class="bar"><i style="width:${Math.max(0,Math.min(100,Number(r.m)||0))}%;background:${r.m>=90?'#10B981':r.m>=80?'#7C3AED':r.m>=70?'#F59E0B':'#EF4444'}"></i></span>${esc(r.m)}</span></td>
    <td><span class="kc-check ${check[1]}">${check[0]}</span></td>
    <td><button class="kc-table-action" onclick="event.stopPropagation();openKCreatorHomepage(${i})" aria-label="访问${esc(r.n)}的主页">主页 ↗</button></td>
   </tr>`;}).join('')}</tbody></table></div>`:'<div class="allclear">当前名单暂无符合筛选条件的达人</div>'}
 `;
}
function openKCreatorHomepage(i){
 const r=T.find(t=>t.id==='t5')?.arts.find(a=>a.id==='a7')?.rows[i];if(!r)return;
 const url=r.homepageUrl||r.profileUrl;
 if(!url){toast(r.n+'的主页链接待补充');return;}
 if(!/^https?:\/\//i.test(url)){toast('主页链接格式不正确');return;}
 window.open(url,'_blank','noopener,noreferrer');
}
function openKCreator(i){
 S.tid='t5';S.aid='a7';S.cr=i;S.crtab=0;S.dtab=0;
 drawDw();$('dw').classList.add('on');$('scrim').classList.add('on');
}

/* ============ work list ============ */
function fil(){
 const own={'我':'du','Sophie':'so','Brooks':'br','Ariel':'ar'};
 return T.filter(t=>{
  if(t.devHidden)return false;
  if(S.dom!=='全部'&&t.dom!==S.dom)return false;
  const fc=S.fcamp||'全部';
  if(fc==='日常'&&t.camp)return false;
  if(fc!=='全部'&&fc!=='日常'&&t.camp!==fc)return false;
  const fa=S.fag||'全部';
  if(fa!=='全部'&&nick(t.ag)!==fa)return false;
  const fo=S.fown||'全部';
  if(fo!=='全部'&&t.own!==own[fo])return false;
  const trg={'手动':'manual','定时':'scheduled','事件':'event','提案':'proposal'};
  const ft=S.ftrig||'全部';
  if(ft!=='全部'&&(t.trig||'manual')!==trg[ft])return false;
  return true;}).sort((a,b)=>(b.workTop||0)-(a.workTop||0)||(b.pin?1:0)-(a.pin?1:0));}
function vWork(){
 const L=fil();
 return `<div class="wrap">
  <div class="eyebrow">工作 · 任务</div>
  <h1>工作</h1>
  <div class="sub">每一条都是一个任务线程：一个意图、一次对话、一个最终产出。范围默认是你的领域，活动会跨范围。</div>
  <div class="bar">
    <div class="seg">${DOMS.map(d=>`<button class="${S.dom===d?'on':''}" onclick="setDom('${d}')">${d}</button>`).join('')}</div>
    ${fpill('fcamp','活动',['全部'].concat(CAMPS.map(c=>c.n)).concat(['日常']))}
    ${fpill('fag','Agent',['全部'].concat(REG.filter(a=>a.b==='live').map(a=>a.nick)))}
    ${fpill('fown','负责人',['全部','我','Sophie','Brooks','Ariel'])}
    ${fpill('ftrig','触发方式',['全部','手动','定时','提案'])}
    <span class="spacer"></span>
    <div class="spacer"></div>
    <div class="seg">
      <button class="${S.mode==='kanban'?'on':''}" onclick="setMode('kanban')">看板</button>
      <button class="${S.mode==='date'?'on':''}" onclick="setMode('date')">按日期</button>
    </div>
    <button class="btn ghost" onclick="openRecipeDrawer()">从配方开始</button>
    <button class="btn" onclick="openNew()">＋ 新建任务</button>
  </div>
  ${L.length?(S.mode==='kanban'?kanban(L):bydate(L)):
   `<div class="empty"><div class="h">这些条件下没有任务</div>
   <div style="font-size:var(--fs-md);margin-bottom:var(--sp-4)">放宽筛选，或者直接开一条新的。</div>
   <button class="btn ghost" onclick="S.fcamp='全部';S.fag='全部';S.fown='全部';S.ftrig='全部';S.dom='全部';render()">清除筛选</button>
   <button class="btn" onclick="openNew()">＋ 新建任务</button></div>`}
 </div>`;
}
function fpill(key,label,opts){
 const cur=S[key]||'全部';
 return `<span class="fwrap">
   <button class="fl ${cur!=='全部'?'on':''}" onclick="event.stopPropagation();S.fopen=S.fopen==='${key}'?null:'${key}';render()">
     ${label}${cur==='全部'?'':' · '+cur} <span style="opacity:.55">▾</span></button>
   ${S.fopen===key?`<span class="fmenu">${opts.map(o=>`<button class="${cur===o?'on':''}" onclick="event.stopPropagation();S['${key}']='${o}';S.fopen=null;render()">${o}</button>`).join('')}</span>`:''}
 </span>`;
}
function setDom(d){S.dom=d;render();}
function setMode(m){S.mode=m;render();}
function kanban(L){
 return `<div class="kb">${COLS.map(c=>{
  const it=L.filter(t=>t.st===c.k||(c.k==='review'&&t.st==='ask')).sort((a,b)=>a.id==='t-ppt-form-demo'?-1:b.id==='t-ppt-form-demo'?1:a.id==='t-seo-flow-demo'?-1:b.id==='t-seo-flow-demo'?1:0);
  return `<div class="kcol">
   <div class="kh"><span class="dot" style="background:${c.c}"></span><span class="t">${c.n}</span><span class="n num">${it.length}</span></div>
   ${it.map(kcard).join('')||'<div style="padding:var(--sp-3) 4px;font-size:var(--fs-sm);color:var(--t3)">空</div>'}
  </div>`;}).join('')}</div>`;
}
function kcard(t){
  const a=AG[t.ag]||{c:'#8B7FC7',s:'?',n:t.ag};
 return `<button class="kcard src${(t.cr||{s:'h'}).s} ${t.new?'hasnew':''}" onclick="go('thread','${t.id}')">
  <div class="tt">${t.new?'<span class="nd"></span>':''}${t.pin?'<span class="pinb">置顶</span>':''}${esc(t.t)}</div>
  <div class="meta">${t.camp?`<span class="chip camp">${t.camp}</span>`:'<span class="chip mut">日常</span>'}<span class="chip dom">${t.dom}</span><span class="chip lv">${t.lv}</span>${t.prestartDemo&&t.plan?.status==='rejected'?'<span class="chip" style="background:#FFF0F0;color:#C43232">计划未通过</span>':canAdjustPrestartPlan(t)?'<span class="chip mut">计划待确认</span>':''}</div>
  <div class="ft">
    ${t.new?`<span class="nchip">${t.new} 条新</span>`:''}
    <span class="byline">${crInfo(t).av} <b>${crInfo(t).nm}</b> 发起</span>
    <span style="margin-left:auto">${t.up}</span>
  </div>
 </button>`;
}
function bydate(L){
 return [0,1,2].map(d=>{
  const it=L.filter(t=>t.day===d);if(!it.length)return '';
  return `<div class="dgrp">
   <div class="dgh"><span class="d">${DAYN[d]}</span><span class="ln"></span><span class="n">${it.length}</span></div>
   ${it.map(t=>{const a=AG[t.ag];return `<button class="row src${(t.cr||{s:'h'}).s} ${t.new?'hasnew':''}" onclick="go('thread','${t.id}')">
     <span class="st ${t.st}">${STN[t.st]}</span>
     <span class="tt">${t.new?'<span class="nd"></span>':''}${t.pin?'<span class="pinb">置顶</span>':''}${esc(t.t)}</span>
     <span class="mt">${t.new?`<span class="nchip">${t.new} 条新</span>`:''}${t.camp?`<span class="chip camp">${t.camp}</span>`:''}<span class="chip dom">${t.dom}</span></span>
     <span class="ag byline">${crInfo(t).av} <b>${crInfo(t).nm}</b> 发起</span>
     <span class="avs" style="background:${U[t.own].c}">${U[t.own].s}</span>
     <span class="up">${t.up}</span></button>`;}).join('')}
  </div>`;}).join('');
}
