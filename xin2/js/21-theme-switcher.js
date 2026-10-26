/* A visual-only theme change: never rerender a form or reload the connector. */
(() => {
  const root=document.documentElement;
  const storageKey='xdigate-app-theme';
  try{
    const saved=localStorage.getItem(storageKey);
    if(saved==='default'||saved==='sensica')root.dataset.theme=saved;
  }catch(_){}
  function syncButton(){
    const sensica=root.dataset.theme==='sensica';
    const button=document.getElementById('theme-switch');
    const label=document.getElementById('theme-label');
    if(label)label.textContent=sensica?'Sensica 配色':'原版配色';
    if(button){
      button.setAttribute('aria-pressed',String(sensica));
      button.setAttribute('aria-label',sensica?'切换为原版紫色配色':'切换为 Sensica 配色');
      button.title=sensica?'当前：Sensica · 点击切换为原版':'当前：原版 · 点击切换为 Sensica';
    }
  }
  window.toggleAppTheme=function(){
    const theme=root.dataset.theme==='sensica'?'default':'sensica';
    root.dataset.theme=theme;
    try{localStorage.setItem(storageKey,theme);}catch(_){}
    const frame=document.querySelector('iframe.connector-frame');
    const child=frame?.contentDocument;
    if(child){
      if(!child.querySelector('link[href*="sensica-theme.css"]')){
        const link=child.createElement('link');
        link.rel='stylesheet';link.href='css/sensica-theme.css?v=2';child.head.appendChild(link);
      }
      child.documentElement.dataset.theme=theme;
    }
    syncButton();
  };
  document.addEventListener('DOMContentLoaded',syncButton,{once:true});
})();
