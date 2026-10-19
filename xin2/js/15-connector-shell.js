/* Keep the embedded viewport stable; only change clipping for global overlays. */
(() => {
  const embedded=window.parent!==window&&new URLSearchParams(location.search).get('embedded')==='1';
  if(embedded){
    const notify=()=>window.parent.postMessage({type:'connector-overlay',open:document.body.classList.contains('overlay-open')},'*');
    new MutationObserver(notify).observe(document.body,{attributes:true,attributeFilter:['class']});
    window.addEventListener('message',event=>{
      if(event.source!==window.parent||event.data?.type!=='connector-geometry')return;
      for(const key of ['left','top','width','height']){
        const value=event.data[key];
        if(Number.isFinite(value))document.documentElement.style.setProperty('--connector-host-'+key,value+'px');
      }
      document.documentElement.classList.add('shell-mounted');
      window.parent.postMessage({type:'connector-ready'},'*');
    });
    notify();
    return;
  }
  let currentFrame=null;
  const layout=frame=>{
    const box=frame.parentElement.getBoundingClientRect();
    frame.style.setProperty('--connector-clip-top',box.top+'px');
    frame.style.setProperty('--connector-clip-left',box.left+'px');
    frame.style.setProperty('--connector-clip-right',Math.max(0,window.innerWidth-box.right)+'px');
    frame.style.setProperty('--connector-clip-bottom',Math.max(0,window.innerHeight-box.bottom)+'px');
    frame.classList.add('connector-mounted');
    frame.contentWindow.postMessage({type:'connector-geometry',left:box.left,top:box.top,width:box.width,height:box.height},'*');
    currentFrame=frame;
  };
  const getFrame=()=>document.querySelector('iframe.connector-frame');
  window.addEventListener('message',event=>{
    const frame=getFrame();
    if(!frame||event.source!==frame.contentWindow)return;
    if(event.data?.type==='connector-ready'){
      frame.classList.add('connector-ready');
      return;
    }
    if(event.data?.type!=='connector-overlay'||typeof event.data.open!=='boolean')return;
    if(currentFrame!==frame)layout(frame);
    // No width, height, position or background changes on open/close.
    frame.classList.toggle('connector-overlay-open',event.data.open);
  });
  document.addEventListener('load',event=>{
    if(event.target.matches?.('iframe.connector-frame'))layout(event.target);
  },true);
  window.addEventListener('resize',()=>{
    const frame=getFrame();
    if(frame)layout(frame);
  });
})();
