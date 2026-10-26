/* SPDX-License-Identifier: MPL-2.0 */
import {t} from './i18n.sys.mjs';
/* Extends the native about:preferences document. No standalone settings overlay. */
export class NativeSettings {
 constructor(actor){this.actor=actor;this.doc=actor.document;this.win=actor.contentWindow;this.inputs=new Map();this.errors=[];}
 node(tag,attrs={},text){return this.actor.node(tag,attrs,text);}
 query(name,data){return this.actor.sendQuery(name,data);}
 card(title,description){const n=this.node('section',{class:'k-native-card'});if(title)n.append(this.node('h2',{},title));if(description)n.append(this.node('p',{},description));return n;}
 button(label,action){const n=this.node('button',{type:'button'},label);n.addEventListener('click',async()=>{try{await action();}catch(e){this.showError(e.message);}});return n;}
 showError(message){if(this.notice)this.notice.textContent=t(message);for(const n of this.errors)n.textContent=t(message);}
 checkbox(parent,label,key,field){const row=this.node('label',{class:'k-native-option'}),n=this.node('input',{type:'checkbox'});row.append(n,this.node('span',{},label));parent.append(row);this.inputs.set(field,n);n.addEventListener('change',()=>this.set(key,n.checked));}
 async set(key,value){try{this.state=await this.query('Kamputa:SetSetting',{key,value});for(const n of this.errors)n.textContent='';this.render();}catch(error){this.showError(error.message);await this.refresh();}}
 async refresh(){try{this.state=await this.query('Kamputa:Settings');this.render();}catch(error){this.showError(error.message);}}
 render(){
  if(!this.state)return;for(const[field,n]of this.inputs){if(this.doc.activeElement===n)continue;if(n.type==='checkbox')n.checked=this.state[field];else n.value=this.state[field];}
  if(this.check&&!this.busy)this.check.disabled=false;
 }
 mount(){
  const doc=this.doc;if(!doc.documentURI.startsWith('about:preferences'))return;
  const appearance=doc.querySelector('setting-pane[data-category="paneAppearance"] section');
  if(appearance&&!doc.getElementById('kamputa-pet-settings')){
   const c=this.card('Питомец','Он живёт в верхней панели. Нажми на него, чтобы покормить, поиграть, уложить спать или поменять имя.');c.id='kamputa-pet-settings';
   this.checkbox(c,'Показывать питомца','kamputa.companion.enabled','petEnabled');c.append(this.button('Открыть питомца',()=>this.query('Kamputa:OpenPet')));appearance.append(c);
  }
  const tabs=doc.querySelector('setting-pane[data-category="paneTabsBrowsing"] section');
  if(tabs&&!doc.getElementById('kamputa-memory-settings')){
   const c=this.card('Экономия памяти','Неиспользуемую тяжёлую вкладку можно деактивировать. При возвращении страница загрузится заново.');c.id='kamputa-memory-settings';
   this.checkbox(c,'Предлагать деактивацию неактивных вкладок','kamputa.memory.enabled','memoryEnabled');this.checkbox(c,'Деактивировать автоматически','kamputa.memory.auto','memoryAuto');
   for(const[key,field,label,min,max]of [['kamputa.memory.thresholdMB','thresholdMB','Порог памяти, МБ',50,16384],['kamputa.memory.idleMinutes','idleMinutes','Неактивность, минут',1,1440]]){
    const row=this.node('label',{class:'k-native-option'},label),n=this.node('input',{type:'number',min,max});row.append(n);c.append(row);this.inputs.set(field,n);n.addEventListener('change',()=>this.set(key,Number(n.value)));
   }
   c.append(this.node('small',{},'Показано приблизительное потребление памяти. Текущие, закреплённые и приватные вкладки, музыка, видео и звонки защищены.'));const error=this.node('div',{class:'k-native-status',role:'status'});c.append(error);this.errors.push(error);tabs.append(c);
  }
  if(doc.getElementById('categories')&&typeof this.win.register_module==='function'&&!doc.getElementById('category-kamputa-updates'))this.mountUpdates();
  if(this.inputs.size&&!this.state)this.refresh();else this.render();
 }
 mountUpdates(){
  const doc=this.doc,nav=this.node('moz-page-nav-button',{id:'category-kamputa-updates',view:'paneKamputaUpdates',iconsrc:'chrome://global/skin/icons/reload.svg'},'Обновления');
  doc.getElementById('category-about-firefox')?.before(nav);if(!nav.isConnected)doc.getElementById('categories').append(nav);
  const pane=this.node('section',{'data-category':'paneKamputaUpdates',id:'kamputa-updates-pane'});pane.hidden=true;
  pane.append(this.node('h1',{},'Обновления'));const c=this.card('Обновления kamputa браузера','Проверяй новые версии kamputa браузера.');pane.append(c);
  this.version=this.node('p',{class:'k-native-version'},'Версия браузера');c.append(this.version);
  this.notice=this.node('div',{role:'status','aria-live':'polite',class:'k-native-status'},'Нажми «Проверить», чтобы найти новую версию.');c.append(this.notice);
  const actions=this.node('div',{class:'k-native-actions'});this.check=this.button('Проверить',()=>this.updateAction('check'));this.download=this.button('Скачать',()=>this.updateAction('download'));this.restart=this.button('Обновить и перезапустить',()=>this.updateAction('restart'));this.check.disabled=false;this.download.disabled=true;this.restart.hidden=true;actions.append(this.check,this.download,this.restart);c.append(actions);
  this.checkbox(c,'Проверять обновления раз в день','kamputa.updates.auto','updateAuto');
  const help=this.card('После обновления','Для установки потребуется перезапуск браузера.');pane.append(help);doc.getElementById('mainPrefPane').append(pane);
  this.win.register_module('paneKamputaUpdates',{init(){}});this.refresh();this.readUpdateStatus();
  if(this.actor._requestedUpdates)this.win.gotoPref('paneKamputaUpdates');
 }
 async readUpdateStatus(){try{const data=await this.query('Kamputa:Update',{action:'status'});this.applyUpdateState(data);}catch(error){this.showError(error.message);}}
 applyUpdateState(data){
  if(!this.version)return;
  if(data.current)this.version.textContent=t('Текущая версия: ')+data.current;
  this.staged=!!data.staged;this.available=!!data.available;this.download.disabled=!this.available;this.restart.hidden=!this.staged;
  if(data.staged)this.notice.textContent=t('Версия ')+data.version+t(' загружена. Можно обновить и перезапустить.');
  else if(data.message)this.notice.textContent=t(data.message);
  else if(data.repo)this.notice.textContent=t('Нажми «Проверить», чтобы найти новую версию.');
 }
 async updateAction(action){
  this.busy=true;for(const b of [this.check,this.download,this.restart])b.disabled=true;
  try{
   this.notice.textContent=t(action==='download'?'Загружаю обновление…':action==='check'?'Проверяю обновления…':'Подготавливаю перезапуск…');
   const data=await this.query('Kamputa:Update',{action});this.applyUpdateState(data);if(action==='download')this.staged=!!data.staged;if(action==='check')this.available=!!data.available;
  }catch(error){this.showError(error.message);}
  finally{this.busy=false;this.check.disabled=false;this.download.disabled=!this.available;this.restart.disabled=false;this.restart.hidden=!this.staged;}
 }
}
