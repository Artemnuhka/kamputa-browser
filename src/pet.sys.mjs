/* SPDX-License-Identifier: MPL-2.0 */
import {t} from './i18n.sys.mjs';
import {FRAMES} from './pet-frames.sys.mjs';
/* Local, shared-per-profile pet state. No network, tabs or page data. */
const KEY='kamputa.pet.state';
const clamp=n=>Math.max(0,Math.min(100,n));
const now=()=>Date.now();
let state;
function load(){
 try{state=JSON.parse(Services.prefs.getStringPref(KEY,''));}catch{}
 if(!state||state.schema!==1)state={schema:1,name:'',named:false,satiety:85,energy:85,mood:85,xp:0,sleeping:false,updated:now(),lastFeed:0,lastPlay:0,lastPet:0};
 if(typeof state.named!=='boolean')state.named=!!state.name;
 if(Services.prefs.prefHasUserValue('kamputa.companion.uri'))Services.prefs.clearUserPref('kamputa.companion.uri');
 for(const k of ['satiety','energy','mood'])state[k]=Number.isFinite(state[k])?clamp(state[k]):85;
 state.updated=Math.min(now(),Number(state.updated)||now());
}
function save(){Services.prefs.setStringPref(KEY,JSON.stringify(state));}
function advance(){
 if(!state)load();const t=now(),hours=Math.min(12,Math.max(0,t-state.updated)/3600000);
 if(hours<1/60)return;
 state.satiety=clamp(state.satiety-hours*(state.sleeping?1:2));state.energy=clamp(state.energy+hours*(state.sleeping?18:-4));state.mood=clamp(state.mood-hours*(state.satiety<25?5:2));state.updated=t;save();
}
export const Pet={
 getState(){advance();return {...state,level:1+Math.floor(state.xp/40)};},
 cleanName(name){return String(name).replace(/[\u0000-\u001f\u007f-\u009f]/g,'').trim().slice(0,28);},
 rename(name){advance();name=this.cleanName(name);if(!name)throw Error('Придумай имя питомцу');state.name=name;state.named=true;save();return this.getState();},
 act(action){advance();if(!state.named)throw Error('Сначала дай питомцу имя');const t=now();
  if(action==='feed'){if(t-state.lastFeed<60000)return {message:'Он ещё доедает. Покормить снова можно через минутку.'};state.satiety=clamp(state.satiety+22);state.mood=clamp(state.mood+3);state.lastFeed=t;state.sleeping=false;state.xp+=3;}
  else if(action==='play'){if(t-state.lastPlay<15000)return {message:'Дай ему немного перевести дух.'};if(state.energy<15)return {message:'Сначала пусть немного поспит.'};state.mood=clamp(state.mood+15);state.energy=clamp(state.energy-7);state.satiety=clamp(state.satiety-3);state.sleeping=false;state.lastPlay=t;state.xp+=4;}
  else if(action==='pet'){if(t-state.lastPet<4000)return {message:'Мур-р…'};state.mood=clamp(state.mood+7);state.lastPet=t;state.xp++;}
  else if(action==='sleep'){state.sleeping=!state.sleeping;}
  else throw Error('Неизвестное действие');
  state.updated=t;save();return {state:this.getState(),animation:action==='feed'?'eat':action==='sleep'?(state.sleeping?'sleep':'happy'):'happy',message:action==='feed'?'Хрум-хрум. Спасибо за еду!':action==='play'?'Поймал пиксель!':action==='pet'?'Мур-р…':state.sleeping?'Тихо, он отдыхает…':'Доброе утро!'};
 }
};
const rows={idle:0,walk:1,sleep:2,laptop:3,eat:4,happy:5};
export class PetView {
 constructor(win,button){
  this.win=win;this.doc=win.document;this.button=button;this.mode='idle';this.until=now()+7000;this.nextFrame=0;this.frame=0;
  button.replaceChildren();this.sprite=this.el('span',{class:'k-pet-sprite','aria-hidden':'true'});this.frameNode=this.el('span',{class:'k-pet-frame'});this.sprite.append(this.frameNode);button.append(this.sprite);
  this.observer={observe:()=>this.refresh()};for(const key of [KEY,'kamputa.companion.enabled','sidebar.verticalTabs'])Services.prefs.addObserver(key,this.observer);
  this.timer=win.setInterval(()=>this.tick(),180);this.refresh();
 }
 el(tag,attrs={},text){const n=this.doc.createElementNS('http://www.w3.org/1999/xhtml',tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,['title','aria-label','placeholder'].includes(k)?t(v):v);if(text!==undefined)n.textContent=t(text);return n;}
 refresh(){
  this.position();
  const s=Pet.getState();
  this.button.hidden=!this.intro&&!Services.prefs.getBoolPref('kamputa.companion.enabled',true);this.button.title=(s.name||t('Питомец'))+' · '+t(s.sleeping?'спит':s.satiety<25?'проголодался':'твой питомец');this.button.setAttribute('aria-label',(s.name||t('Питомец'))+t(' · открыть питомца'));
  if(this.intro)this.animate('idle',60000);else if(s.sleeping)this.animate('sleep',60000);else if(this.mode==='sleep')this.animate('idle',12000);
  if(this.panel?.state==='open')this.renderState(s);
 }
 position(){
  const vertical=Services.prefs.getBoolPref('sidebar.verticalTabs',false);
  const parent=this.doc.getElementById(vertical?'nav-bar-customization-target':'TabsToolbar');
  if(!parent||this.button.parentElement===parent)return;
  if(vertical)parent.append(this.button);else parent.insertBefore(this.button,parent.querySelector('.titlebar-buttonbox-container'));
 }
 animate(mode,duration){if(this.mode!==mode){this.mode=mode;this.frame=0;}this.until=now()+duration;this.button.setAttribute('data-pet-mode',mode);this.paint();}
 setIntro(active){this.intro=active;this.button.toggleAttribute('data-pet-intro',active);this.refresh();}
 paint(){
  const row=rows[this.mode]||0,frames=FRAMES[row],box=frames[this.frame];
  const left=Math.min(...frames.map(b=>b[0])),right=Math.max(...frames.map(b=>b[2])),top=Math.min(...frames.map(b=>b[1])),bottom=Math.max(...frames.map(b=>b[3]));
  const draw=(node,width,height,target)=>{
   const desired=this.mode==='sleep'?target*.72:target;
   const scale=Math.min(desired/(bottom-top),(width-4)/(right-left)),cell=256*scale;
   node.style.width=cell+'px';node.style.height=cell+'px';node.style.backgroundSize=(4*cell)+'px '+(6*cell)+'px';node.style.backgroundPosition=(-this.frame*cell)+'px '+(-row*cell)+'px';
   node.style.clipPath=`inset(${Math.max(0,box[1]-2)*scale}px ${Math.max(0,256-box[2]-2)*scale}px ${Math.max(0,256-box[3]-2)*scale}px ${Math.max(0,box[0]-2)*scale}px)`;
   node.style.left=(width/2-(left+right)/2*scale)+'px';node.style.top=(height-1-box[3]*scale)+'px';
  };
  draw(this.frameNode,56,32,30);
  if(this.previewFrame)draw(this.previewFrame,80,80,68);
 }
 tick(){
  if(this.win.closed||this.button.hidden||this.doc.hidden||this.win.windowState===this.win.STATE_MINIMIZED)return;
  const t=now();if(t-(this.lastCare||0)>60000){this.lastCare=t;this.refresh();}
  if(!this.intro&&t>this.until){let s=Pet.getState();if(s.energy<20&&!s.sleeping){Pet.act('sleep');s=Pet.getState();}const mode=s.sleeping?'sleep':s.energy<20?'sleep':['idle','idle','walk','laptop'][Math.floor(Math.random()*4)];this.animate(mode,mode==='walk'?9000:mode==='laptop'?35000:mode==='sleep'?60000:18000);}
  const pace=this.mode==='sleep'?1000:this.mode==='idle'?1800:this.mode==='laptop'?380:240;
  if(this.win.matchMedia('(prefers-reduced-motion: reduce)').matches){this.frame=0;this.paint();return;}
  if(t>=this.nextFrame){this.frame=(this.frame+1)%4;this.nextFrame=t+pace;this.paint();}
 }
 action(key){const result=Pet.act(key);if(result.animation)this.animate(result.animation,key==='sleep'?60000:5500);this.refresh();this.message.textContent=t(result.message);}
 toggleMenu(){
  if(!this.panel)this.buildMenu();
  if(this.panel.state==='open'){this.panel.hidePopup();return;}
  this.message.textContent='';this.renderState(Pet.getState());this.panel.openPopup(this.button,'after_end',0,4,false,false);
 }
 buildMenu(){
  const p=this.doc.createXULElement('panel');p.id='kamputa-companion-menu';p.setAttribute('type','arrow');p.setAttribute('role','dialog');p.setAttribute('aria-label',t('Питомец Kamputa'));this.panel=p;
  const card=this.el('div',{class:'k-pet-card'});p.append(card);const head=this.el('div',{class:'k-pet-head'});this.preview=this.el('span',{class:'k-pet-preview','aria-hidden':'true'});this.previewFrame=this.el('span',{class:'k-pet-frame'});this.preview.append(this.previewFrame);this.title=this.el('strong');this.level=this.el('small');const heading=this.el('div');heading.append(this.title,this.level);head.append(this.preview,heading);card.append(head);
  this.meters={};for(const[key,label]of [['satiety','Сытость'],['energy','Энергия'],['mood','Настроение']]){
   const row=this.el('label',{class:'k-pet-meter'});const text=this.el('span',{},label),meter=this.el('meter',{min:0,max:100,'aria-label':label}),value=this.el('small');row.append(text,meter,value);card.append(row);this.meters[key]={meter,value};
  }
  const actions=this.el('div',{class:'k-pet-actions'});this.careButtons=[];this.sleepButton=null;
  for(const[key,label]of [['feed','Покормить'],['pet','Погладить'],['play','Поиграть'],['sleep','Уложить спать']]){const b=this.el('button',{type:'button'},label);b.addEventListener('click',()=>this.action(key));actions.append(b);this.careButtons.push(b);if(key==='sleep')this.sleepButton=b;}card.append(actions);
  this.message=this.el('div',{class:'k-pet-message',role:'status','aria-live':'polite'});card.append(this.message);
  const details=this.el('details');details.open=!Pet.getState().named;details.append(this.el('summary',{},'Изменить имя'));
  const form=this.el('form',{class:'k-pet-rename'});this.nameInput=this.el('input',{type:'text',maxlength:28,'aria-label':'Имя питомца',placeholder:'Имя питомца'});const save=this.el('button',{type:'submit'},'Сохранить');form.append(this.nameInput,save);form.addEventListener('submit',e=>{e.preventDefault();try{Pet.rename(this.nameInput.value);this.message.textContent=t('Имя сохранено');}catch(error){this.message.textContent=t(error.message);}});details.append(form);
  details.append(this.el('small',{},'Питомец живёт только в этом профиле. Состояние сохраняется автоматически.'));card.append(details);this.doc.getElementById('mainPopupSet').append(p);
 }
 renderState(s){
  this.title.textContent=s.name||t('Дай ему имя');for(const b of this.careButtons)b.disabled=!s.named;this.level.textContent=t('Уровень ')+s.level+' · '+t(s.sleeping?'спит':'рядом');if(this.doc.activeElement!==this.nameInput)this.nameInput.value=s.name;
  for(const[key,{meter,value}]of Object.entries(this.meters)){meter.value=Math.round(s[key]);value.textContent=Math.round(s[key])+'%';}this.sleepButton.textContent=t(s.sleeping?'Разбудить':'Уложить спать');this.paint();
 }
 destroy(){this.win.clearInterval(this.timer);for(const key of [KEY,'kamputa.companion.enabled','sidebar.verticalTabs'])Services.prefs.removeObserver(key,this.observer);this.panel?.remove();}
}
