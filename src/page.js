/* SPDX-License-Identifier: MPL-2.0 */
/* Only loaded by the registered local, privileged about pages. */
(() => {
  if(!document.nodePrincipal.isSystemPrincipal || !['about:kamputa','about:kamputa-setup'].includes(document.documentURI))throw new Error('Unexpected kamputa page principal');
  const browser=window.docShell.chromeEventHandler;
  const owner=browser.ownerDocument.defaultView;
  const ready=()=>{
    if(!owner.Kamputa){window.setTimeout(ready,30);return;}
    const ru=Services.locale.appLocaleAsBCP47.startsWith('ru');document.documentElement.lang=ru?'ru':'en';const fallback=document.querySelector('noscript');if(fallback)fallback.textContent=ru?'Для настройки нужен JavaScript.':'JavaScript is required for setup.';
    if(document.body.dataset.kamputaPage==='setup'){document.title=ru?'Настройка':'Setup';owner.Kamputa.mountSetup(document);}
    else {
      document.documentElement.lang=ru?'ru':'en';
      document.title=ru?'Новая вкладка':'New tab';
      document.getElementById('brand-name').textContent=ru?'kamputa браузер':'kamputa browser';
      const query=document.getElementById('newtab-query');query.placeholder=ru?'Поиск в интернете':'Search the web';query.setAttribute('aria-label',query.placeholder);
      document.getElementById('newtab-settings').textContent=ru?'Настройки':'Settings';
      document.getElementById('newtab-settings').addEventListener('click',()=>owner.Kamputa.openSettings());
      document.getElementById('newtab-search').addEventListener('submit',async event=>{
        event.preventDefault();const text=query.value.trim();if(!text)return;
        try{await owner.Kamputa.searchFromPage(document,text);}catch(error){document.getElementById('newtab-status').textContent=error.message;}
      });
    }
  };
  ready();
})();
