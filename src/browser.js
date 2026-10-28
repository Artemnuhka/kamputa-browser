/* SPDX-License-Identifier: MPL-2.0
 * Trusted browser chrome only. No content-script bridge or remote code loading.
 */
(() => {
  const sheet = Cc['@mozilla.org/content/style-sheet-service;1'].getService(Ci.nsIStyleSheetService);
  const css = Services.io.newURI('resource://kamputa/browser.css');
  if (!sheet.sheetRegistered(css, sheet.AUTHOR_SHEET)) sheet.loadAndRegisterSheet(css, sheet.AUTHOR_SHEET);
  const omniboxCSS=Services.io.newURI('resource://kamputa/omnibox.css');
  if(!sheet.sheetRegistered(omniboxCSS,sheet.AUTHOR_SHEET))sheet.loadAndRegisterSheet(omniboxCSS,sheet.AUTHOR_SHEET);
  const paletteCSS=Services.io.newURI('resource://kamputa/palette.css');
  if(!sheet.sheetRegistered(paletteCSS,sheet.AUTHOR_SHEET))sheet.loadAndRegisterSheet(paletteCSS,sheet.AUTHOR_SHEET);
  const petCSS=Services.io.newURI('resource://kamputa/pet.css');
  if(!sheet.sheetRegistered(petCSS,sheet.AUTHOR_SHEET))sheet.loadAndRegisterSheet(petCSS,sheet.AUTHOR_SHEET);
  const {Pet,PetView}=ChromeUtils.importESModule('resource://kamputa/pet.sys.mjs');
  const {Updates}=ChromeUtils.importESModule('resource://kamputa/updates.sys.mjs');
  const verticalCSS=Services.io.newURI('resource://kamputa/vertical.css');
  if(!sheet.sheetRegistered(verticalCSS,sheet.AUTHOR_SHEET))sheet.loadAndRegisterSheet(verticalCSS,sheet.AUTHOR_SHEET);
  const {t}=ChromeUtils.importESModule('resource://kamputa/i18n.sys.mjs');
  const pref = Services.prefs;
  const {Theme}=ChromeUtils.importESModule('resource://kamputa/ui.sys.mjs');
  const SearchService = ChromeUtils.importESModule('moz-src:///toolkit/components/search/SearchService.sys.mjs').SearchService;
  const { PrivateBrowsingUtils } = ChromeUtils.importESModule('resource://gre/modules/PrivateBrowsingUtils.sys.mjs');
  const { webrtcUI } = ChromeUtils.importESModule('resource:///modules/webrtcUI.sys.mjs');
  const {SessionStore}=ChromeUtils.importESModule('moz-src:///browser/components/sessionstore/SessionStore.sys.mjs');
  function setup(win) {
    if (win.Kamputa || !win.gBrowser) return;
    const doc = win.document, gb = win.gBrowser;
    let uiDoc=doc, setupDocument=null;
    const productName=Services.locale.appLocaleAsBCP47.startsWith('ru')?'kamputa браузер':'kamputa browser';
    const html = (tag, attrs = {}, text) => {
      const node = uiDoc.createElementNS('http://www.w3.org/1999/xhtml', tag);
      for (const [k,v] of Object.entries(attrs)) node.setAttribute(k,['title','aria-label','placeholder'].includes(k)?t(v):v);
      if (text !== undefined) node.textContent = t(text);
      return node;
    };
    const button = (label, action, cls='k-secondary') => {
      const el = html('button',{type:'button',class:cls},label);
      el.addEventListener('click', async () => { try { if(el.ownerDocument.documentURI==='about:kamputa-setup'){uiDoc=el.ownerDocument;setupDocument=el.ownerDocument;mode='wizard';step=pref.getIntPref('kamputa.setup.step',0);} await action(); } catch(e) { status('Не получилось: '+e.message); Cu.reportError(e); } });
      return el;
    };
    function status(message) { const el = uiDoc.getElementById('k-status'); if(el) el.textContent = t(message); }
    let overlay, step=0, mode='wizard', previousFocus;
    const state = { search:'DuckDuckGo', theme:pref.getStringPref('kamputa.theme','chromium'), password:'skip' };
    let petView;
    const api = win.Kamputa = { html, state, Theme, Pet, Updates, get petView(){return petView;}, openCompanionMenu, mountSetup, searchFromPage, sampleMemory, scan, discard, eligible, openSettings:()=>win.openPreferences('appearance'), openWizard:()=>open('wizard'), memory:new Map(), cooldown:new WeakMap(), lastUsed:new WeakMap() };
    function applyTheme() {
      doc.documentElement.setAttribute('kamputa-theme',Theme.active?'chromium':'firefox');
      const current=Theme.getState();doc.documentElement.setAttribute('kamputa-palette',current.seeds[current.base]||'neutral');
      for(const [key,value] of Object.entries(current.colors))doc.documentElement.style.setProperty('--k-'+key,value);
      const json=JSON.stringify(current.colors);if(pref.getStringPref('kamputa.palette.tokens','')!==json)pref.setStringPref('kamputa.palette.tokens',json);
      petView?.refresh();
    }
    const observer={observe:applyTheme}; pref.addObserver('kamputa.',observer);pref.addObserver('extensions.activeThemeID',observer);
    const companion=html('button',{id:'kamputa-companion',title:'Питомец', 'aria-label':'Персонаж'});
    companion.addEventListener('click',openCompanionMenu);
    function openCompanionMenu(){petView.toggleMenu();}
    const toolbar=doc.getElementById('TabsToolbar');
    const controls=toolbar.querySelector('.titlebar-buttonbox-container');
    toolbar.insertBefore(companion,controls || null);
    petView=new PetView(win,companion);
    const menu=doc.createXULElement('menuitem'); menu.id='kamputa-settings-menu';menu.setAttribute('label',t('Настройки kamputa браузера'));
    menu.addEventListener('command',()=>open('settings'));doc.getElementById('menu_ToolsPopup')?.append(menu);
    const appButton=doc.createXULElement('toolbarbutton');appButton.id='kamputa-panel-settings';appButton.className='subviewbutton';appButton.setAttribute('label',t('Настройки Kamputa'));
    appButton.addEventListener('command',()=>{win.PanelUI.hide();open('settings');});doc.getElementById('appMenu-mainView')?.querySelector('.panel-subview-body')?.append(appButton);
    applyTheme();Theme.initialize().then(applyTheme).catch(Cu.reportError);
    const inputBox=win.gURLBar.querySelector('.urlbar-input-box');
    if(inputBox && !doc.getElementById('k-urlbar-search-icon')) {
      const searchIcon=html('img',{id:'k-urlbar-search-icon',src:'resource://kamputa/assets/search.svg',alt:'','aria-hidden':'true'});
      inputBox.parentNode.insertBefore(searchIcon,inputBox);
    }
    const nativeLock=gb.tabContainer._lockTabSizing;
    gb.tabContainer._lockTabSizing=function(...args){
      if(doc.documentElement.getAttribute('kamputa-theme')==='chromium'){this._unlockTabSizing();return;}
      return nativeLock.apply(this,args);
    };
    gb.tabContainer.addEventListener('TabClose',()=>win.requestAnimationFrame(()=>gb.tabContainer._unlockTabSizing()));
    const renameTitle=()=>{
      const uri=gb.selectedBrowser.currentURI.spec;
      let title=doc.title.replace(/(?:Mozilla )?Firefox(?=$)/,productName);
      if(uri==='about:kamputa-setup')title='Настройка — kamputa браузер';
      else if(uri==='about:kamputa')title=Services.locale.appLocaleAsBCP47.startsWith('ru')?'Новая вкладка — kamputa браузер':'New tab — kamputa browser';
      title=t(title);if(title!==doc.title)doc.title=title;
    };
    renameTitle();
    const titleObserver = new win.MutationObserver(()=>{
      renameTitle();
    });titleObserver.observe(doc.querySelector('title'),{childList:true});
    const contextItem=doc.createXULElement('menuitem');contextItem.id='kamputa-unload-tab';contextItem.setAttribute('label',t('Деактивировать вкладку'));
    contextItem.addEventListener('command',async()=>{const tab=win.TabContextMenu.contextTab; if(!await discard(tab)) win.alert(t('Вкладка сейчас используется или защищена от выгрузки.'));});
    const context=doc.getElementById('tabContextMenu');context.append(contextItem);
    context.addEventListener('popupshowing',()=>contextItem.disabled=!eligible(win.TabContextMenu.contextTab));
    function open(which) {
      if(which==='wizard') {
        doc.getElementById('k-overlay')?.remove();
        const existing=[...gb.tabs].find(t=>t.linkedBrowser.currentURI.spec==='about:kamputa-setup');
        if(existing){gb.selectedTab=existing;return;}
        gb.selectedTab=gb.addTrustedTab('about:kamputa-setup');return;
      }
      win.openPreferences('appearance');
    }
    let petGuide;
    function updatePetGuide(){
      const page=gb.selectedBrowser.contentDocument;
      const active=page?.documentURI==='about:kamputa-setup'&&!!page.querySelector('#k-setup-pet-name');
      if(!active){petGuide?.remove();petGuide=null;if(petView.intro)petView.setIntro(false);return;}
      if(!petView.intro)petView.setIntro(true);
      if(!petGuide){petGuide=doc.createElementNS('http://www.w3.org/2000/svg','svg');petGuide.id='k-pet-setup-guide';petGuide.setAttribute('aria-hidden','true');petGuide.append(doc.createElementNS('http://www.w3.org/2000/svg','path'));doc.documentElement.append(petGuide);}
      const card=page.querySelector('.k-card');if(!card)return;
      const b=gb.selectedBrowser.getBoundingClientRect(),r=card.getBoundingClientRect(),p=companion.getBoundingClientRect();
      const x=p.left+p.width/2,y=p.bottom+5,sx=Math.min(b.left+r.right-24,x-70),sy=Math.min(b.top+r.top+45,y+230);
      petGuide.firstChild.setAttribute('d',`M ${sx} ${sy} C ${sx+70} ${sy-50}, ${x} ${y+85}, ${x} ${y} M ${x-5} ${y+9} L ${x} ${y} L ${x+5} ${y+9}`);
    }
    win.addEventListener('resize',updatePetGuide);
    gb.tabContainer.addEventListener('TabSelect',updatePetGuide);
    gb.tabContainer.addEventListener('TabClose',()=>win.requestAnimationFrame(updatePetGuide));
    function mountSetup(pageDoc) {
      if(pageDoc.documentURI!=='about:kamputa-setup' || !pageDoc.nodePrincipal.isSystemPrincipal)throw new Error('Invalid setup document');
      if(![...gb.browsers].some(b=>b.contentDocument===pageDoc))throw new Error('Setup belongs to another browser');
      setupDocument=pageDoc;uiDoc=pageDoc;mode='wizard';step=Math.min(6,Math.max(0,pref.getIntPref('kamputa.setup.step',0)));render();
    }
    async function searchFromPage(pageDoc,text) {
      if(pageDoc.documentURI!=='about:kamputa' || !pageDoc.nodePrincipal.isSystemPrincipal)throw new Error('Invalid new tab document');
      const browser=[...gb.browsers].find(b=>b.contentDocument===pageDoc);if(!browser)throw new Error('Unknown browser');
      await SearchService.init();const engine=await SearchService.getDefault();const submission=engine.getSubmission(text,null,'newtab');
      browser.loadURI(submission.uri,{triggeringPrincipal:pageDoc.nodePrincipal,postData:submission.postData});
    }
    function close(){petGuide?.remove();petGuide=null;petView.setIntro(false);overlay?.remove();overlay=null;uiDoc=doc;previousFocus?.focus();}
    function frame(title, intro) {
      uiDoc.getElementById('k-overlay')?.remove(); overlay=html('div',{id:'k-overlay',role:'dialog','aria-modal':'true','aria-label':'Первый запуск Kamputa'});
      const card=html('section',{class:'k-card'});overlay.append(card);
      const brand=html('div',{class:'k-brand'}); brand.append(html('img',{src:'resource://kamputa/assets/kamputa.png',alt:''}),html('span',{},'kamputa браузер'));card.append(brand);
      card.append(html('div',{class:'k-kicker'},`НАЧНЁМ С ТВОЕГО · ${step+1} / 7`),html('h1',{},title),html('p',{},intro));
      const body=html('div',{class:'k-body'});card.append(body);
      card.append(html('div',{id:'k-status',class:'k-status',role:'status','aria-live':'polite'}));
      const footer=html('div',{class:'k-footer'});card.append(footer);
      overlay.style.top=uiDoc===doc?doc.getElementById('navigator-toolbox').getBoundingClientRect().bottom+'px':'0px';
      (uiDoc.body || uiDoc.documentElement).append(overlay);
      overlay.addEventListener('keydown', e=>{
        if(e.key==='Tab') {
          const nodes=[...overlay.querySelectorAll('button,input,select')].filter(n=>!n.disabled);
          if(!nodes.length)return;
          if(e.shiftKey && uiDoc.activeElement===nodes[0]){nodes.at(-1).focus();e.preventDefault();}
          else if(!e.shiftKey && uiDoc.activeElement===nodes.at(-1)){nodes[0].focus();e.preventDefault();}
        }
      });
      win.setTimeout(()=>overlay?.querySelector('button')?.focus(),0);
      return {body,footer};
    }
    function options(body, values, selected, action) {
      const grid=html('div',{class:'k-options'});body.append(grid);
      for (const [value,title,detail] of values) {
        const el=button('',async()=>{await action(value);for(const n of grid.children)n.setAttribute('aria-pressed',String(n===el));},'k-option');
        el.setAttribute('aria-pressed',String(value===selected));el.append(html('strong',{},title),html('small',{},detail));grid.append(el);
      }
    }
    async function search(name) {
      await SearchService.init(); const engines=await SearchService.getVisibleEngines();
      const engine=engines.find(e=>e.name.toLowerCase()===name.toLowerCase() || (name==='DuckDuckGo' && e.name.includes('DuckDuckGo')));
      if(!engine)throw new Error('Поисковик недоступен в этой сборке: '+name);
      await SearchService.setDefault(engine,SearchService.CHANGE_REASON.USER);
      pref.setStringPref('kamputa.search',engine.name);
    }
    async function importFirefox() {
      if(pref.getBoolPref('kamputa.onboarding.completed',false)) {
        status('Перенос профиля Firefox доступен при первом запуске. Для объединения закладок используй импорт файла в Библиотеке Firefox.');return;
      }
      const picker=Cc['@mozilla.org/filepicker;1'].createInstance(Ci.nsIFilePicker);
      picker.init(win.browsingContext,t('Закрой исходный Firefox и выбери его папку профиля'),Ci.nsIFilePicker.modeGetFolder);
      const result=await new Promise(resolve=>picker.open(resolve));if(result!==Ci.nsIFilePicker.returnOK)return;
      const source=picker.file;const places=source.clone();places.append('places.sqlite');
      if(!places.exists())throw new Error('Это не папка профиля Firefox. Открой about:profiles в Firefox и выбери папку своего профиля.');
      if(!win.confirm(t('Перенести закладки, историю и пароли из выбранного профиля? Закрой исходный Firefox. Kamputa перезапустится. Текущие данные Kamputa будут сохранены в резервной копии.')))return;
      const profile=Services.dirsvc.get('ProfD',Ci.nsIFile);profile.append('kamputa-import.json');
      await win.IOUtils.writeJSON(profile.path,{source:source.path});
      Services.startup.quit(Ci.nsIAppStartup.eAttemptQuit);
    }
    async function migrate(key) {
      if(key==='firefox')return importFirefox();
      const {MigrationUtils}=ChromeUtils.importESModule('resource:///modules/MigrationUtils.sys.mjs');
      // Separate native window keeps the Kamputa setup visible, and honours source selection.
      await MigrationUtils.showMigrationWizard(null,{entrypoint:MigrationUtils.MIGRATION_ENTRYPOINTS.UNKNOWN,migratorKey:key});
      status('Открылось окно импорта. Заверши перенос там, затем нажми «Далее». Доступность данных зависит от исходного браузера.');
    }
    function tab(url){gb.selectedTab=gb.addTrustedTab(url);}
    function render() {
      pref.setIntPref('kamputa.setup.step',step);
      const pages=[
        ['Всё своё — с собой','Перенеси закладки, историю и доступные пароли из другого браузера. Или начни с чистого листа.'],
        ['Где будем искать?','Выбери поиск для адресной строки и новой вкладки. Это можно поменять в любой момент.'],
        ['Твой браузер. Твой вид.','Компактные вкладки и спокойная панель в духе Chromium и Helium. Или привычное оформление Firefox.'],
        ['Закладки всегда рядом','Аккаунт Mozilla синхронизирует данные между твоими устройствами. Вход — только по желанию.'],
        ['Ключи под твоим контролем','Можно оставить встроенный менеджер, установить Bitwarden или выбрать другой сервис позже.'],
        ['Знакомься! Твой питомец','Дай ему имя'],
        ['Добро пожаловать домой.','Меньше шума. Больше твоего интернета.']
      ];
      const {body,footer}=frame(...pages[step]);
      updatePetGuide();win.setTimeout(updatePetGuide,180);
      if(step===0) {const resultFile=Services.dirsvc.get('ProfD',Ci.nsIFile);resultFile.append('kamputa-import-result.json');win.IOUtils.readJSON(resultFile.path).then(result=>status(result.message)).catch(()=>{});}
      if(step===0)options(body,[['firefox','Firefox','Выбор профиля и данных'],['chrome','Google Chrome','Закладки, история и другое'],['brave','Brave','Системный мастер импорта'],['chromium','Chromium','Доступные локальные профили']],null,migrate);
      if(step===1)options(body,[['Google','Google','google.com'],['DuckDuckGo','DuckDuckGo','duckduckgo.com'],['Bing','Bing','bing.com'],['Wikipedia (en)','Wikipedia','Свободная энциклопедия']],state.search,v=>state.search=v);
      if(step===2)options(body,[['chromium','Chromium / Helium','Компактная панель · по умолчанию'],['firefox','Стандартная','Классическое оформление']],state.theme,async v=>{await Theme.choose(v);state.theme=v;});
      if(step===3)body.append(button('Войти в Mozilla',async()=>{
        await win.gSync.openFxAEmailFirstPage('kamputa');
        status('Заверши вход в открывшейся вкладке и вернись на вкладку настройки.');
      }));
      if(step===4)options(body,[['builtin','Встроенный','Пароли хранятся в профиле браузера'],['bitwarden','Bitwarden','Открыть установку официального расширения']],state.password,v=>state.password=v);
      let nameInput;
      if(step===5){
        const description=html('p',{},'Он будет гулять по панели, дремать и сидеть за ноутбуком. Нажми на него, чтобы покормить или поиграть.');body.append(description);
        const label=html('label',{class:'k-pet-name-label',for:'k-setup-pet-name'},'Имя питомца');
        nameInput=html('input',{id:'k-setup-pet-name',type:'text',maxlength:28,required:'',placeholder:'Например, Пиксель',autocomplete:'off'});
        nameInput.value=pref.getStringPref('kamputa.setup.petName',Pet.getState().name||'');body.append(label,nameInput);
      }
      if(step>0)footer.append(button('Назад',()=>{step--;render();},'k-link'));
      const dots=html('div',{class:'k-dots'});for(let i=0;i<7;i++)dots.append(html('span',{class:'k-dot'+(step===i?' active':'')}));footer.append(dots,html('span',{class:'k-spacer'}));
      if([0,3,4].includes(step))footer.append(button('Пропустить',()=>{step++;render();},'k-link'));
      const next=button(step===6?'Открыть браузер':'Далее',async()=>{
        if(step===5){Pet.rename(nameInput.value);pref.clearUserPref('kamputa.setup.petName');}
        if(step===1)await search(state.search);
        if(step===3){} // Optional account login stays in Firefox's trusted account UI.
        if(step===4 && state.password==='bitwarden')tab('https://addons.mozilla.org/firefox/addon/bitwarden-password-manager/');
        if(step===6){
          pref.setBoolPref('kamputa.onboarding.completed',true);pref.clearUserPref('kamputa.setup.step');
          const setupTab=[...gb.tabs].find(t=>t.linkedBrowser.contentDocument===setupDocument);
          close();const home=[...gb.tabs].find(t=>t.linkedBrowser.currentURI.spec==='about:kamputa') || gb.addTrustedTab('about:kamputa');gb.selectedTab=home;
          if(setupTab)gb.removeTab(setupTab);return;
        }
        step++;render();
      },'k-primary');footer.append(next);
      if(nameInput){const validate=()=>{next.disabled=!Pet.cleanName(nameInput.value);pref.setStringPref('kamputa.setup.petName',nameInput.value);};nameInput.addEventListener('input',validate);nameInput.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();if(!next.disabled)next.click();}});validate();win.setTimeout(()=>nameInput.focus(),180);}
    }
    function eligible(t){
      if(!t || !t.isConnected || t.selected || t.pinned || t.closing || t.hasAttribute('pending') || t.undiscardable || t.soundPlaying || t.pictureinpicture || t.hasAttribute('busy'))return false;
      const browser=t.linkedBrowser;
      if(!browser?.isRemoteBrowser || PrivateBrowsingUtils.isBrowserPrivate(browser))return false;
      if(webrtcUI.browserHasStreams(browser) || browser.browsingContext?.currentWindowGlobal?.hasActivePeerConnections())return false;
      return /^https?:/.test(browser.currentURI.spec);
    }
    async function discard(t){
      if(!eligible(t))return false;
      await gb.prepareDiscardBrowser(t);
      if(!eligible(t))return false;
      // No force flag: preserve beforeunload protection and session state.
      const result=gb.discardBrowser(t);if(result)api.memory.delete(t);return result;
    }
    async function sampleMemory(){
      const processes=new Map(),owners=new Map(),tabs=[];
      function walk(bc,pids){if(!bc)return;const pid=bc.currentWindowGlobal?.osPid;if(pid)pids.add(pid);for(const child of bc.children)walk(child,pids);}
      for(const w of Services.wm.getEnumerator('navigator:browser'))for(const t of w.gBrowser.tabs){
        if(t.hasAttribute('pending'))continue;const pids=new Set();walk(t.linkedBrowser?.browsingContext,pids);tabs.push([t,pids]);
        for(const pid of pids){if(!owners.has(pid))owners.set(pid,new Set());owners.get(pid).add(t);}
      }
      const root=await ChromeUtils.requestProcInfo();for(const p of root.children)processes.set(p.pid,p.memory);
      const memory=new Map();for(const [t,pids] of tabs){let bytes=0,known=false;for(const pid of pids){if(processes.has(pid)){known=true;bytes+=processes.get(pid)/owners.get(pid).size;}}if(known)memory.set(t,bytes);}
      api.memory=memory;api.sampledAt=Date.now();return memory;
    }
    let scanning=false;
    const dismissedKey='kamputa.memory.dismissed';
    function dismissed(tab){return SessionStore.getCustomTabValue(tab,dismissedKey)==='1';}
    function memoryPrompt(candidate,bytes){
      const panel=doc.createXULElement('panel');panel.id='k-toast';panel.setAttribute('type','arrow');panel.setAttribute('role','dialog');panel.setAttribute('aria-label',t('Экономия памяти'));
      const el=(tag,cls,label)=>{const node=doc.createElementNS('http://www.w3.org/1999/xhtml',tag);if(cls)node.className=cls;if(label!==undefined)node.textContent=label;return node;};
      const card=el('div','k-memory-card'),header=el('div','k-memory-header'),title=el('strong','',t('Освободить память?'));
      const close=el('button','k-memory-close','×');close.type='button';close.title=t('Не предлагать для этой вкладки');close.setAttribute('aria-label',close.title);
      header.append(title,close);card.append(header,el('div','k-memory-tab',candidate.label),el('p','',t('Вкладка давно не используется и занимает около {memory} МБ.').replace('{memory}',String(Math.round(bytes/1048576)))));
      const actions=el('div','k-memory-actions'),decline=el('button','k-memory-decline',t('Не предлагать')),accept=el('button','k-memory-accept',t('Деактивировать'));decline.type=accept.type='button';actions.append(decline,accept);card.append(actions);panel.append(card);
      let accepted=false;
      const hide=()=>panel.hidePopup();
      close.addEventListener('click',hide);decline.addEventListener('click',hide);
      accept.addEventListener('click',async()=>{accepted=true;accept.disabled=true;api.cooldown.set(candidate,Date.now());const ok=await discard(candidate).catch(Cu.reportError);hide();if(!ok)win.alert(t('Вкладка сейчас используется или защищена от выгрузки.'));});
      panel.addEventListener('popuphiding',()=>{if(!accepted&&candidate.isConnected&&!candidate.closing)SessionStore.setCustomTabValue(candidate,dismissedKey,'1');},{once:true});
      panel.addEventListener('popuphidden',()=>panel.remove(),{once:true});
      doc.getElementById('mainPopupSet').append(panel);panel.openPopup(candidate,'after_start',0,4,false,false);
    }
    async function scan(){
      if(!pref.getBoolPref('kamputa.memory.enabled',true) || PrivateBrowsingUtils.isWindowPrivate(win))return;
      if(scanning || doc.getElementById('k-toast') || overlay)return;scanning=true;
      try{
      await sampleMemory();if(win.closed || doc.getElementById('k-toast') || overlay)return;
      const threshold=pref.getIntPref('kamputa.memory.thresholdMB',350)*1024*1024,idle=pref.getIntPref('kamputa.memory.idleMinutes',15)*60000,now=Date.now();
      const candidates=[...gb.tabs].filter(t=>eligible(t) && !dismissed(t) && now-Math.max(t.lastAccessed||now,api.lastUsed.get(t)||0)>=idle && (api.memory.get(t)||0)>=threshold && now-(api.cooldown.get(t)||0)>1800000).sort((a,b)=>api.memory.get(b)-api.memory.get(a));
      const candidate=candidates[0];if(!candidate)return;
      if(pref.getBoolPref('kamputa.memory.auto',false)){api.cooldown.set(candidate,now);await discard(candidate);return;}
      memoryPrompt(candidate,api.memory.get(candidate));
      }finally{scanning=false;}
    }
    // Extend Firefox's own preview so title, thumbnail and memory share one popup.
    pref.getDefaultBranch('').setBoolPref('browser.tabs.hoverPreview.enabled',true);
    gb.tabContainer.ensureTabPreviewPanelLoaded();
    const preview=doc.getElementById('tab-preview-panel');
    const tabPanel=gb.tabContainer.previewPanel.tabPanel;
    const memoryFooter=html('div',{id:'kamputa-tab-preview-memory','aria-label':'Приблизительное потребление памяти'});
    preview.querySelector('.tab-preview-content-main').append(memoryFooter);
    let previewTab=null,previewVersion=0,previewSample=null;
    function renderPreviewMemory(tab){
      const bytes=api.memory.get(tab);
      memoryFooter.textContent=tab.hasAttribute('pending')?t('Вкладка деактивирована'):
        bytes===undefined?t('Потребление памяти недоступно'):
        t('Память: ≈ ')+Math.round(bytes/1048576)+t(' МБ');
    }
    function updatePreviewMemory(tab){
      previewTab=tab;const version=++previewVersion;
      renderPreviewMemory(tab);
      if(api.sampledAt && Date.now()-api.sampledAt<=10000)return;
      previewSample ||= sampleMemory().finally(()=>{previewSample=null;});
      previewSample.then(()=>{
        if(!win.closed && version===previewVersion && previewTab===tab && tab.isConnected)renderPreviewMemory(tab);
      }).catch(Cu.reportError);
    }
    const activatePreview=tabPanel.activate;
    tabPanel.activate=function(tab){updatePreviewMemory(tab);return activatePreview.call(this,tab);};
    preview.addEventListener('popuphidden',()=>{previewTab=null;++previewVersion;});
    preview.addEventListener('TabPreviewUpdated',()=>{if(previewTab?.isConnected)renderPreviewMemory(previewTab);});
    gb.tabContainer.addEventListener('TabSelect',()=>api.lastUsed.set(gb.selectedTab,Date.now()));
    const updateTimer=win.setTimeout(()=>{if(!PrivateBrowsingUtils.isWindowPrivate(win))Updates.autoCheck();},15000);
    const timer=win.setInterval(()=>scan().catch(Cu.reportError),30000);
    win.addEventListener('unload',()=>{petGuide?.remove();win.removeEventListener('resize',updatePetGuide);gb.tabContainer.removeEventListener('TabSelect',updatePetGuide);petView.destroy();win.clearTimeout(updateTimer);win.clearInterval(timer);pref.removeObserver('kamputa.',observer);pref.removeObserver('extensions.activeThemeID',observer);titleObserver.disconnect();},{once:true});
    if(!pref.getBoolPref('kamputa.onboarding.completed',false) && !PrivateBrowsingUtils.isWindowPrivate(win)) {
      SessionStore.promiseAllWindowsRestored.then(async()=>{const initial=await win.gBrowserInit.uriToLoadPromise;const explicit=(Array.isArray(initial)?initial:[initial]).some(uri=>String(uri)==='about:kamputa-setup');if(!explicit&&!win.closed&&!pref.getBoolPref('kamputa.onboarding.completed',false))open('wizard');}).catch(Cu.reportError);
    }
    const defaults=pref.getDefaultBranch('');
    defaults.setBoolPref('browser.urlbar.suggest.bookmark',false);
    pref.setBoolPref('browser.urlbar.suggest.bookmark',false);
    defaults.setStringPref('browser.toolbars.bookmarks.visibility','never');
    for(const t of gb.tabs)if(['about:newtab','about:home'].includes(t.linkedBrowser.currentURI.spec))t.linkedBrowser.loadURI(Services.io.newURI('about:kamputa'),{triggeringPrincipal:Services.scriptSecurityManager.getSystemPrincipal()});
    Services.console.logStringMessage('Kamputa chrome ready');
  }
  const startup={observe(win){try{setup(win);}catch(e){Cu.reportError('Kamputa window: '+e.stack);}}};
  Services.obs.addObserver(startup,'browser-delayed-startup-finished');
  for(const win of Services.wm.getEnumerator('navigator:browser'))if(win.gBrowserInit?.delayedStartupFinished)setup(win);
})();
