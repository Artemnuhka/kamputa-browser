/* SPDX-License-Identifier: MPL-2.0 */
import {t} from './i18n.sys.mjs';
import {NativeSettings} from './preferences.sys.mjs';
/* Restricted to privileged browser UI; no styling or messaging on websites. */
const THEME_IDS=['helium-dark@kamputa.local','material-standard@kamputa.local'];
export class KamputaSurfaceChild extends JSWindowActorChild {
 handleEvent(event){
  if(event.type==='DOMDocElementInserted'){this._requestedUpdates=this.contentWindow.location.hash.toLowerCase()==='#kamputaupdates';return;}
  const doc=this.document;if(!doc?.nodePrincipal.isSystemPrincipal)return;
  if(!this._observer){
   this.contentWindow.windowUtils.loadSheetUsingURIString('resource://kamputa/internal.css',Ci.nsIDOMWindowUtils.AUTHOR_SHEET);
   this._observer={observe:()=>{this.update();if(this._card)this.refresh();this._settings?.refresh();}};
   Services.prefs.addObserver('extensions.activeThemeID',this._observer);Services.prefs.addObserver('kamputa.palette.',this._observer);for(const key of ['kamputa.memory.','kamputa.companion.','kamputa.updates.'])Services.prefs.addObserver(key,this._observer);
   if(/^(about:(preferences|addons)|chrome:\/\/mozapps\/content\/extensions\/aboutaddons\.html)/.test(doc.documentURI)){
    this._mutations=new this.contentWindow.MutationObserver(()=>{if(!this._mountTimer)this._mountTimer=this.contentWindow.setTimeout(()=>{this._mountTimer=null;this.mount();},70);});
    this._mutations.observe(doc,{childList:true,subtree:true});this.mount();
   }
  }
  this.update();
 }
 update(){
  const doc=this.document;if(!doc?.documentElement)return;
  const active=THEME_IDS.includes(Services.prefs.getStringPref('extensions.activeThemeID',''));
  doc.documentElement.setAttribute('kamputa-surface',active?'dark':'standard');
  let colors={};try{colors=JSON.parse(Services.prefs.getStringPref('kamputa.palette.tokens','{}'));}catch{}
  for(const [key,value] of Object.entries(colors))doc.documentElement.style.setProperty('--k-'+key,value);
 }
 node(tag,attrs={},text){const n=this.document.createElementNS('http://www.w3.org/1999/xhtml',tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,['title','aria-label','placeholder'].includes(k)?t(v):v);if(text!==undefined)n.textContent=t(text);return n;}
 mount(){
  const doc=this.document;if(doc.documentURI.startsWith('about:preferences')){this._settings??=new NativeSettings(this);this._settings.mount();}
  if(doc.getElementById('kamputa-palette-controls'))return;
  const chooser=doc.getElementById('web-appearance-chooser');const group=chooser?.closest('setting-group');
  const addonList=doc.querySelector('addon-list[type="theme"]');const target=group||addonList;if(!target)return;
  const section=this.node('section',{id:'kamputa-palette-controls',class:'k-palette-card','aria-label':'Тема и палитра Kamputa'});
  section.append(this.node('h2',{},'Тема и палитра'),this.node('p',{},'Выбери оформление и цвет.'));
  const bases=this.node('div',{class:'k-theme-bases'});section.append(bases);this._bases=new Map();
  for(const[base,title,detail]of [['chromium','Chromium / Helium','Компактные вкладки и панель'],['firefox','Классическая','Привычное расположение Firefox']]){
   const b=this.node('button',{type:'button','aria-pressed':'false',class:'k-theme-base'});b.append(this.node('strong',{},title),this.node('small',{},detail));b.addEventListener('click',()=>{this.contentWindow.clearTimeout(this._colorTimer);this.perform('Kamputa:Theme',{base});});bases.append(b);this._bases.set(base,b);
  }
  const swatches=this.node('div',{class:'k-palette-swatches','aria-label':'Готовые палитры'});section.append(swatches);this._swatches=new Map();
  for(const[name,color]of [['Нейтральная',null],['Синяя','#5f6fa6'],['Сиреневая','#6750a4'],['Зелёная','#4c6954'],['Розовая','#9b4055'],['Золотистая','#8d6400']]){
   const b=this.node('button',{type:'button',title:name,'aria-label':name,'aria-pressed':'false',class:'k-palette-swatch'});b.style.setProperty('--swatch',color||'#828896');b.addEventListener('click',()=>this.perform('Kamputa:Palette',{base:this._state.base,seed:color}));swatches.append(b);this._swatches.set(color,b);
  }
  const custom=this.node('label',{class:'k-palette-custom'},'Свой цвет');this._color=this.node('input',{type:'color',value:'#6750a4','aria-label':'Свой основной цвет'});this._hex=this.node('input',{type:'text',value:'#6750a4',maxlength:'7',spellcheck:'false','aria-label':'Цвет HEX'});custom.append(this._color,this._hex);section.append(custom);
  this._color.addEventListener('input',()=>{this._hex.value=this._color.value;const base=this._state.base,seed=this._color.value;this.contentWindow.clearTimeout(this._colorTimer);this._colorTimer=this.contentWindow.setTimeout(()=>this.perform('Kamputa:Palette',{base,seed}),350);});
  this._color.addEventListener('change',()=>{this.contentWindow.clearTimeout(this._colorTimer);this.perform('Kamputa:Palette',{base:this._state.base,seed:this._color.value});});
  this._hex.addEventListener('change',()=>{if(!/^#[\da-f]{6}$/i.test(this._hex.value)){this._status.textContent=t('Цвет нужен в формате #RRGGBB');return;}this._color.value=this._hex.value;this.perform('Kamputa:Palette',{base:this._state.base,seed:this._hex.value});});
  this._status=this.node('div',{class:'k-palette-status',role:'status','aria-live':'polite'});section.append(this._status);target.before(section);this._card=section;this.refresh();
 }
 async refresh(){try{this._state=await this.sendQuery('Kamputa:PaletteState');this.render();}catch(error){if(this._status)this._status.textContent=t(error.message);}}
 render(){
  if(!this._state||!this._card?.isConnected)return;
  const {base,seeds}=this._state;for(const[key,b]of this._bases)b.setAttribute('aria-pressed',String(key===base));
  for(const[color,b]of this._swatches)b.setAttribute('aria-pressed',String((seeds[base]||null)===color));
  const color=seeds[base]||'#6750a4';if(this.document.activeElement!==this._hex)this._hex.value=color;if(this.document.activeElement!==this._color)this._color.value=color;
 }
 async perform(name,data){
  if(!this._state)return;
  this._status.textContent='';try{this._state=await this.sendQuery(name,data);this.render();this._status.textContent=t('Сохранено');}catch(error){this._status.textContent=t(error.message);}
 }
 didDestroy(){
  if(this._observer){Services.prefs.removeObserver('extensions.activeThemeID',this._observer);Services.prefs.removeObserver('kamputa.palette.',this._observer);for(const key of ['kamputa.memory.','kamputa.companion.','kamputa.updates.'])Services.prefs.removeObserver(key,this._observer);}
  this._mutations?.disconnect();if(this._mountTimer)this.contentWindow.clearTimeout(this._mountTimer);if(this._colorTimer)this.contentWindow.clearTimeout(this._colorTimer);
 }
}
