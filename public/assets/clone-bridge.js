/* Local prototype adapters; no analytics or personal data leaves this page. */
(() => {
  const base=new URL('./',location.href);
  window.__CLONE_BASE=base.href;
  const nativeFetch=window.fetch.bind(window);
  const searchData=nativeFetch(new URL('assets/search-index.json',base)).then(r=>r.json());
  const resourcePaths=nativeFetch(new URL('assets/asset-paths.json',base)).then(r=>r.json());
  window.fetch=async function(input,options){
    const url=typeof input==='string'?input:input instanceof URL?input.href:input.url;
    if(url?.includes('all-editions.shopify.com/editions/')&&/search/.test(url)){
      const query=new URLSearchParams(options?.body||'').get('q')?.toLowerCase()||'';
      const rows=(await searchData).filter(x=>(x.title+' '+x.search).toLowerCase().includes(query));
      return new Response(JSON.stringify({predictiveSearch:{products:rows.slice(0,8),queries:[]},search:{winter2026:rows}}),{headers:{'Content-Type':'application/json'}});
    }
    if(/^https:\/\/(cdn\.shopify\.com|editions-winter-2026\.myshopify\.com)\//.test(url||'')){
      const file=(await resourcePaths)[url.split('?')[0]];
      if(file)return nativeFetch(new URL(file,base),options);
    }
    return nativeFetch(input,options);
  };
  let translations={};
  const norm=s=>s.replace(/\s+/g,' ').trim();
  fetch(new URL('assets/translations.json',base)).then(r=>r.json()).then(d=>{translations=Object.fromEntries(Object.entries(d).map(([k,v])=>[norm(k),v]));queue()});
  let queued=false;
  function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;adapt()})}
  function adapt(){
    if(!document.body)return;
    document.documentElement.lang='zh-CN';
    if(document.title!=='Shopify Editions｜2026 冬季版 · 商业文艺复兴')document.title='Shopify Editions｜2026 冬季版 · 商业文艺复兴';
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    let n;while(n=walker.nextNode()){
      if(n.parentElement?.closest('script,style,svg,[data-preacherman-english]'))continue;
      const tr=translations[norm(n.nodeValue)];if(tr&&norm(n.nodeValue)!==tr)n.nodeValue=n.nodeValue.replace(n.nodeValue.trim(),tr);
    }
    for(const el of document.querySelectorAll('[aria-label],[placeholder],[alt],[title]'))for(const attr of ['aria-label','placeholder','alt','title']){if(el.closest('[data-preacherman-english]'))continue;const a=el.getAttribute(attr);if(a&&translations[norm(a)]&&a!==translations[norm(a)])el.setAttribute(attr,translations[norm(a)])}
    document.querySelectorAll('section,header,aside,main,h1,h2,h3,button,input,a').forEach((el,i)=>{if(!el.dataset.odId)el.dataset.odId=(el.id||el.dataset.componentName||el.tagName.toLowerCase())+'-'+i});
    for(const link of document.querySelectorAll('a[href^="/editions/winter2026"]')){
      const u=new URL(link.getAttribute('href'),location.origin);
      if(!u.pathname.includes('/video/')&&u.pathname==='/editions/winter2026')link.setAttribute('href',location.pathname+u.hash);
    }
  }
  new MutationObserver(queue).observe(document,{childList:true,subtree:true,characterData:true});
  queue();
  document.addEventListener('submit',e=>{
    const form=e.target;if(!form.querySelector('input[type="email"]'))return;
    e.preventDefault();e.stopImmediatePropagation();
    if(!form.reportValidity())return;
    const email=form.querySelector('input[type="email"]').value;
    localStorage.setItem('shopify-winter2026-notify',email);
    const toast=document.createElement('div');toast.className='clone-toast';toast.setAttribute('role','status');toast.textContent='已在此设备保存提醒偏好。演示页面不会发送邮件。';document.body.append(toast);setTimeout(()=>toast.remove(),6000);
  },true);
})();

import("./preacherman-brand.js");
