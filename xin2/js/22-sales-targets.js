/* Read-only sales-target presentation. Replace SALES_TARGET_FEED with API records.
   GMV = transaction value; NMV = value after refunds in these fixtures. CNY only. */
function salesTokyoDay(now=new Date()){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);}
function salesMonthShift(month,offset){const [y,m]=month.split('-').map(Number),d=new Date(Date.UTC(y,m-1+offset,1));return d.toISOString().slice(0,7);}
const SALES_TARGET_AS_OF=salesTokyoDay();
const SALES_TARGET_MONTH=SALES_TARGET_AS_OF.slice(0,7);
const SALES_TARGET_FEED=['tmall','douyin','jd'].flatMap((store,s)=>Array.from({length:6},(_,i)=>{
 const month=salesMonthShift(SALES_TARGET_MONTH,i-5),target=[1400000,500000,200000][s]*(1+(i-5)*.06),ratio=[1.15,1.04,.74,.87,1.08,.876][i]+[0,-.05,.03][s];
 const gmv={target:Math.round(target),actual:Math.round(target*ratio)};
 return {store,month,currency:'CNY',asOf:month===SALES_TARGET_MONTH?SALES_TARGET_AS_OF:month+'-'+new Date(Date.UTC(+month.slice(0,4),+month.slice(5),0)).getUTCDate(),gmv,nmv:{target:Math.round(gmv.target*.9),actual:Math.round(gmv.actual*.87)}};
}));
function salesTargetData(month,store,metric,feed=SALES_TARGET_FEED){
 const stores=store==='all'?['tmall','douyin','jd']:[store],rows=stores.map(id=>feed.find(r=>r.store===id&&r.month===month));
 if(rows.some(r=>!r||r.currency!=='CNY'||!r[metric]||!Number.isFinite(r[metric].actual)||r[metric].actual<0||!Number.isFinite(r[metric].target)||r[metric].target<=0))return null;
 return {target:rows.reduce((n,r)=>n+r[metric].target,0),actual:rows.reduce((n,r)=>n+r[metric].actual,0),asOf:rows.map(r=>r.asOf).sort()[0]};
}
function salesMoney(n){return '¥'+n.toLocaleString('zh-CN',{maximumFractionDigits:0});}
function salesSetMetric(value){if(!['gmv','nmv'].includes(value))return;S.salesMetric=value;render();}
function salesSetPeriod(value){if(!['day','month'].includes(value))return;S.salesPeriod=value;render();}
if(typeof document!=='undefined')document.addEventListener('click',event=>{
 document.querySelectorAll('.sales-formula[open]').forEach(panel=>{if(!panel.contains(event.target))panel.open=false;});
});
function salesProgressData(data,month,period){
 if(!data||period!=='day')return data;
 // Daily pace affects only the completion-rate denominator, never the monthly amounts.
 const days=new Date(Date.UTC(+month.slice(0,4),+month.slice(5),0)).getUTCDate();
 const elapsed=data.asOf.slice(0,7)===month?Math.min(days,Math.max(1,+data.asOf.slice(8,10))):days;
 return {...data,progressTarget:data.target*elapsed/days};
}
function salesSetMonth(value){if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(value)||value>SALES_TARGET_MONTH)return;S.salesMonth=value;render();}
function salesMonthChart(r,max){
 const d=r.data,rate=d?(d.actual/d.target*100).toFixed(1)+'%':'—';
 return `<div class="sales-chart-month" tabindex="0" aria-label="${r.month}，${d?'目标 '+salesMoney(d.target)+'，实际 '+salesMoney(d.actual)+'，完成率 '+rate:'暂无目标数据'}"><div class="sales-chart-bars">${d?`<div class="sales-stacked-bar" style="height:${Math.max(d.actual,d.target)/max*100}%"><span class="actual${d.actual/max<.16?' sales-bar-short':''}" style="height:${d.actual/Math.max(d.actual,d.target)*100}%"><b class="sales-bar-rate">${rate}</b></span>${d.actual<d.target?`<span class="remaining" style="height:${(d.target-d.actual)/d.target*100}%"></span>`:''}</div>`:''}</div><span class="sales-chart-label">${r.month.slice(2).replace('-','/')}</span><small>${r.month===SALES_TARGET_MONTH?'截至今日':''}</small><div class="sales-tooltip" aria-hidden="true"><b>${r.month}</b>${d?`<div><span class="actual">实际</span><strong>${salesMoney(d.actual)}</strong></div><div><span class="target">目标</span><strong>${salesMoney(d.target)}</strong></div><div><span>完成率</span><strong>${rate}</strong></div>`:'<div>暂无目标数据</div>'}</div></div>`;
}
function analyticsSalesTargets(){
 const metric=['gmv','nmv'].includes(S.salesMetric)?S.salesMetric:'gmv',month=S.salesMonth||SALES_TARGET_MONTH,store=S.anaStore||'all';
 const period=S.salesPeriod==='day'?'day':'month';
 const selected=ANALYTICS_STORES.find(r=>r.id===store)?.name||'全部店铺',data=salesProgressData(salesTargetData(month,store,metric),month,period);
 const months=Array.from({length:6},(_,i)=>salesMonthShift(month,i-5)),series=months.map(m=>({month:m,data:salesTargetData(m,store,metric)}));
 const max=Math.max(1,...series.flatMap(r=>r.data?[r.data.target,r.data.actual]:[])),pct=data?data.actual/(data.progressTarget??data.target)*100:0;
 return `<section class="sales-target-section" aria-labelledby="sales-target-title"><div class="sales-target-head"><div class="sales-target-title-group"><h2 id="sales-target-title">销售目标</h2><div class="seg" role="group" aria-label="销售口径">${['gmv','nmv'].map(m=>`<button type="button" class="${metric===m?'on':''}" aria-pressed="${metric===m}" onclick="salesSetMetric('${m}')">${m.toUpperCase()}</button>`).join('')}</div></div></div>
 <div class="sales-target-grid"><article class="card sales-progress-card"><div class="sales-progress-head"><h3>当月目标完成情况</h3><div class="sales-progress-controls"><select aria-label="目标统计方式" onchange="salesSetPeriod(this.value)" title="按日对比截至数据当日的累计目标；按月对比整月目标"><option value="day" ${period==='day'?'selected':''}>按日</option><option value="month" ${period==='month'?'selected':''}>按月</option></select><details class="sales-formula"><summary aria-label="查看完成率计算公式"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v2"/></svg></summary><div class="sales-formula-note"><b>完成率计算方式</b><p>按日：累计实际销售 ÷（月度目标 ÷ 当月天数 × 已过天数）× 100%。</p><p>按月：累计实际销售 ÷ 月度目标 × 100%。</p></div></details></div></div>${data?`<div class="sales-ring" style="--sales-progress:${Math.min(100,pct)}%" role="img" aria-label="目标完成率 ${pct.toFixed(1)}%"><div><strong class="num">${pct.toFixed(1)}<small>%</small></strong><span>目标完成率</span></div></div><dl class="sales-amounts"><div><dt>实际销售</dt><dd class="num">${salesMoney(data.actual)}</dd></div><div><dt>月度目标</dt><dd class="num">${salesMoney(data.target)}</dd></div><div><dt>${data.actual>=data.target?'超出目标':'距离目标'}</dt><dd class="num">${salesMoney(Math.abs(data.target-data.actual))}</dd></div></dl>`:'<div class="sales-empty">暂无目标数据<br><small>等待目标与销售数据同步</small></div>'}</article>
 <article class="card sales-history-card"><div class="sales-history-head"><h3>目标与实际</h3><div class="sales-legend"><span class="actual">实际</span><span class="remaining">距目标差额</span></div></div><div class="sales-chart" role="group" aria-label="${esc(selected)}近六个月 ${metric.toUpperCase()} 目标与实际对比">${series.map(r=>salesMonthChart(r,max)).join('')}</div></article></div>
 </section>`;
}
