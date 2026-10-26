/* SPDX-License-Identifier: MPL-2.0 */
import {FRAMES} from './pet-frames.sys.mjs';
import {petText as text} from './pet-strings.sys.mjs';
import {migratePet,advancePet,performPetAction,petSnapshot,cleanName,canPlay,ROOMS,TOYS,FOODS} from './pet-model.sys.mjs';
const KEY='kamputa.pet.state',now=()=>Date.now();
let state,lease,serial=0;
function save(){Services.prefs.setStringPref(KEY,JSON.stringify(state));}
function advance(){
 if(!state){let raw;try{raw=JSON.parse(Services.prefs.getStringPref(KEY,''));}catch{}state=migratePet(raw,now());advancePet(state,now());save();}
 else if(now()-state.updated>=60000||now()<state.updated||new Date(now()).toDateString()!==new Date(state.updated).toDateString()){advancePet(state,now());save();}
}
function act(action,value,admittedGame=false){advance();if(lease&&now()-lease.started>=130000)lease=null;if(lease&&['feed','clean','pet','chat','sleep','game'].includes(action))return {message:text('gameBusy')};const result=performPetAction(state,action,value,now(),admittedGame);save();return {...result,message:text(result.message,{coins:result.reward||0})};}
export const Pet={
 getState(){advance();return petSnapshot(state,now());},cleanName,
 rename(name){const result=act('rename',name);if(result.message===text('nameRequired'))throw Error(result.message);return this.getState();},
 act(action,value){if(action==='game')return {message:text('stopped')};return act(action,value??(action==='feed'?'meal':undefined));},
 beginGame(kind){
  advance();advancePet(state,now());const blocked=canPlay(state,now());if(blocked)throw Error(text(blocked));if(lease&&now()-lease.started<130000)throw Error(text('gameBusy'));
  if(!['catch','memory'].includes(kind))throw Error(text('unknown'));
  lease={token:++serial,kind,started:now()};return {...lease};
 },
 finishGame(token,score){
  if(!lease||lease.token!==token||now()-lease.started>=130000)throw Error(text('stopped'));const game=lease;lease=null;
  if(now()-game.started<(game.kind==='catch'?18000:1000))throw Error(text('tryAgain'));
  return act('game',{kind:game.kind,score},true);
 },
 cancelGame(token){if(lease?.token===token)lease=null;}
};
const rows={idle:0,walk:1,sleep:2,laptop:3,eat:4,happy:5};
export class PetView{
 constructor(win,button){
  this.win=win;this.doc=win.document;this.button=button;this.mode='idle';this.until=now()+7000;this.nextFrame=0;this.frame=0;this.section='home';this.gameTimers=new Set();
  button.replaceChildren();this.sprite=this.el('span',{class:'k-pet-sprite','aria-hidden':'true'});this.frameNode=this.el('span',{class:'k-pet-frame'});this.sprite.append(this.frameNode);button.append(this.sprite);
  this.observer={observe:()=>this.refresh()};for(const k of [KEY,'kamputa.companion.enabled','sidebar.verticalTabs'])Services.prefs.addObserver(k,this.observer);
  this.timer=win.setInterval(()=>this.tick(),180);this.refresh();
 }
 el(tag,attrs={},label){const n=this.doc.createElementNS('http://www.w3.org/1999/xhtml',tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);if(label!==undefined)n.textContent=label;return n;}
 label(key,params){return text(key,params);}
 buttonEl(label,action,cls=''){const b=this.el('button',{type:'button',class:cls},label);b.addEventListener('click',()=>{try{action();}catch(e){this.say(e.message);}});return b;}
 say(message){if(this.message)this.message.textContent=message;}
 refresh(){
  this.position();const s=Pet.getState();this.button.hidden=!this.intro&&!Services.prefs.getBoolPref('kamputa.companion.enabled',true);
  this.button.title=(s.name||text('pet'))+' · '+text(s.need);this.button.setAttribute('aria-label',(s.name||text('pet'))+' · '+text('home'));this.button.toggleAttribute('data-pet-attention',!s.sleeping&&['hungry','tired','dirty'].includes(s.need));
  if(this.intro)this.animate('idle',60000);else if(s.sleeping)this.animate('sleep',60000);else if(this.mode==='sleep')this.animate('idle',12000);
  if(this.panel?.state==='open'){this.renderState(s);if(this.section==='shop')this.renderShop();if(this.section==='journal')this.renderJournal();}
 }
 position(){const vertical=Services.prefs.getBoolPref('sidebar.verticalTabs',false);const parent=this.doc.getElementById(vertical?'nav-bar-customization-target':'TabsToolbar');if(!parent||this.button.parentElement===parent)return;if(vertical)parent.append(this.button);else parent.insertBefore(this.button,parent.querySelector('.titlebar-buttonbox-container'));}
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
  if(this.previewFrame)draw(this.previewFrame,112,104,90);
 }
 tick(){
  if(this.win.closed)return;
  if(this.game&&(this.button.hidden||this.doc.hidden||this.win.windowState===this.win.STATE_MINIMIZED)){this.cancelGame();this.say(text('stopped'));}
  if(this.button.hidden||this.doc.hidden||this.win.windowState===this.win.STATE_MINIMIZED)return;
  const time=now();if(time-(this.lastCare||0)>1000){this.lastCare=time;if(this.panel?.state==='open')this.renderState(Pet.getState());else if(time-(this.lastRefresh||0)>60000){this.lastRefresh=time;this.refresh();}}
  if(!this.intro&&time>this.until){const s=Pet.getState();const mode=s.sleeping?'sleep':s.energy<20?'idle':['idle','idle','walk','laptop'][Math.floor(Math.random()*4)];this.animate(mode,mode==='walk'?9000:mode==='laptop'?35000:18000);}
  if(this.win.matchMedia('(prefers-reduced-motion: reduce)').matches){this.frame=0;this.paint();return;}
  const pace=this.mode==='sleep'?1000:this.mode==='idle'?1800:this.mode==='laptop'?380:240;if(time>=this.nextFrame){this.frame=(this.frame+1)%4;this.nextFrame=time+pace;this.paint();}
 }
 action(key,value){if(this.game){this.say(text('gameBusy'));return;}const r=Pet.act(key,value);if(r.animation)this.animate(r.animation,key==='sleep'?60000:4500);this.refresh();this.say(r.message);}
 toggleMenu(){
  if(!this.panel)this.buildMenu();if(this.panel.state==='open'){this.panel.hidePopup();return;}
  const visit=Pet.act('visit');this.say(visit.message);this.renderState(Pet.getState());this.showSection('home');this.panel.openPopup(this.button,'after_end',0,4,false,false);
 }
 buildMenu(){
  const p=this.doc.createXULElement('panel');p.id='kamputa-companion-menu';p.setAttribute('type','arrow');p.setAttribute('role','dialog');p.setAttribute('aria-label',text('pet'));this.panel=p;
  const card=this.el('div',{class:'k-pet-card'});this.card=card;p.append(card);
  const header=this.el('header',{class:'k-pet-head'}),heading=this.el('div');this.title=this.el('strong');this.level=this.el('small');this.xpBar=this.el('progress',{max:40,value:0,'aria-label':text('level')});heading.append(this.title,this.level,this.xpBar);this.wallet=this.el('span',{class:'k-pet-wallet','aria-label':text('coins')});header.append(heading,this.wallet);card.append(header);
  const nav=this.el('nav',{class:'k-pet-nav','aria-label':text('home')});this.navButtons={};this.sections={};for(const key of ['home','games','shop','journal']){const b=this.buttonEl(text(key),()=>this.showSection(key));b.setAttribute('aria-controls','k-pet-section-'+key);this.navButtons[key]=b;nav.append(b);}card.append(nav);
  for(const key of ['home','games','shop','journal']){const section=this.el('section',{id:'k-pet-section-'+key});section.hidden=key!=='home';this.sections[key]=section;card.append(section);}
  this.buildHome();this.buildGames();this.renderShop();this.renderJournal();
  this.message=this.el('p',{class:'k-pet-message',role:'status','aria-live':'polite'});card.append(this.message);
  const details=this.el('details',{class:'k-pet-identity'});details.open=!Pet.getState().named;details.append(this.el('summary',{},text('rename')));
  const form=this.el('form',{class:'k-pet-rename'});this.nameInput=this.el('input',{type:'text',maxlength:28,'aria-label':text('name'),placeholder:text('name')});const save=this.el('button',{type:'submit'},text('save'));form.append(this.nameInput,save);form.addEventListener('submit',e=>{e.preventDefault();try{Pet.rename(this.nameInput.value);this.say(text('nameSaved'));}catch(error){this.say(error.message);}});details.append(form);card.append(details);
  p.addEventListener('popuphiding',()=>this.cancelGame());this.doc.getElementById('mainPopupSet').append(p);
 }
 buildHome(){
  const home=this.sections.home;this.room=this.el('div',{class:'k-pet-room'});this.roomWindow=this.el('span',{class:'k-pet-window','aria-hidden':'true'});this.room.append(this.roomWindow);
  this.preview=this.buttonEl('',()=>this.action('pet'),'k-pet-preview');this.preview.title=text('stroke');this.preview.setAttribute('aria-label',text('stroke'));this.previewFrame=this.el('span',{class:'k-pet-frame','aria-hidden':'true'});this.preview.append(this.previewFrame);this.room.append(this.preview);
  this.decor=this.el('div',{class:'k-pet-decor','aria-hidden':'true'});this.room.append(this.decor);home.append(this.room);this.thought=this.el('p',{class:'k-pet-thought'});home.append(this.thought);
  this.meters={};const needs=this.el('div',{class:'k-pet-needs'});for(const[key,label]of [['satiety','satiety'],['energy','energy'],['mood','mood'],['hygiene','hygiene']]){const row=this.el('label',{class:'k-pet-meter'}),meter=this.el('meter',{min:0,max:100,'aria-label':text(label)}),v=this.el('small');row.append(this.el('span',{},text(label)),meter,v);needs.append(row);this.meters[key]={meter,value:v};}home.append(needs);
  this.food=this.el('details',{class:'k-pet-food'});this.food.append(this.el('summary',{},text('food')));const menu=this.el('div',{class:'k-pet-food-options'});for(const[key,item]of Object.entries(FOODS)){const b=this.buttonEl('',()=>this.action('feed',key));b.append(this.el('strong',{},text(key)),this.el('small',{},text(key+'Info')),this.el('span',{},item.price?item.price+' ◈':text('free')));menu.append(b);}this.food.append(menu);home.append(this.food);
  const actions=this.el('div',{class:'k-pet-actions'});this.careButtons=[];for(const[key,label]of [['pet','stroke'],['clean','clean'],['chat','chat'],['sleep','sleep']]){const b=this.buttonEl(text(label),()=>this.action(key));actions.append(b);this.careButtons.push(b);if(key==='sleep')this.sleepButton=b;}home.append(actions);
  this.daily=this.el('div',{class:'k-pet-daily'});this.daily.append(this.el('strong',{},text('daily')));this.tasks={};for(const[key,label]of [['feed','dailyFeed'],['clean','dailyClean'],['game','dailyGame']]){this.tasks[key]=this.el('span');this.daily.append(this.tasks[key]);this.tasks[key].dataset.label=label;}this.claim=this.buttonEl(text('claim'),()=>this.action('claim'));this.daily.append(this.claim);home.append(this.daily);
 }
 showSection(key){
  if(this.game&&key!=='games'){this.cancelGame();this.say(text('stopped'));}this.section=key;
  for(const[name,section]of Object.entries(this.sections))section.hidden=name!==key;
  for(const[name,b]of Object.entries(this.navButtons))b.setAttribute('aria-pressed',String(name===key));
  if(key==='shop')this.renderShop();if(key==='journal')this.renderJournal();this.renderState(Pet.getState());
 }
 buildGames(){
  const section=this.sections.games;this.gameRecords={};this.gameChoice=this.el('div',{class:'k-pet-game-choice'});for(const kind of ['catch','memory']){const tile=this.el('div',{class:'k-pet-game-tile'});tile.append(this.el('strong',{},text(kind)),this.el('p',{},text(kind+'Info')));const b=this.buttonEl(text('start'),()=>this.startGame(kind),'k-pet-primary');const record=this.el('small');this.gameRecords[kind]=record;tile.append(b,record);this.gameChoice.append(tile);}section.append(this.gameChoice);this.gameArea=this.el('div',{class:'k-pet-game-area'});section.append(this.gameArea);
 }
 later(fn,ms){const id=this.win.setTimeout(()=>{this.gameTimers.delete(id);fn();},ms);this.gameTimers.add(id);return id;}
 cancelGame(){if(this.game)Pet.cancelGame(this.game.token);this.game=null;for(const id of this.gameTimers)this.win.clearTimeout(id);this.gameTimers.clear();if(this.gameChoice)this.gameChoice.hidden=false;if(this.gameArea)this.gameArea.replaceChildren();}
 startGame(kind){
  this.cancelGame();const game=Pet.beginGame(kind);this.game={...game,score:0,moves:0};this.gameChoice.hidden=true;this.gameArea.replaceChildren();this.say('');
  this.gameArea.append(this.el('h3',{},text(kind)));this.gameInfo=this.el('p',{class:'k-pet-game-info'});this.gameArea.append(this.gameInfo);
  const grid=this.el('div',{class:'k-pet-game-grid '+(kind==='catch'?'k-pet-catch':'k-pet-memory')});this.gameArea.append(grid);
  const token=game.token;
  if(kind==='catch'){
   const cells=[];let target=-1;const ends=now()+20000;
   const next=()=>{if(this.game?.token!==token)return;const old=target;do{target=Math.floor(Math.random()*9);}while(target===old);cells.forEach((b,i)=>{b.textContent=i===target?'✦':'·';b.classList.toggle('is-target',i===target);b.setAttribute('aria-label',text(i===target?'star':'empty'));});};
   for(let i=0;i<9;i++){const b=this.buttonEl('·',()=>{if(this.game?.token===token&&now()<ends&&i===target){this.game.score++;next();}});cells.push(b);grid.append(b);}
   const clock=()=>{if(this.game?.token!==token)return;const left=Math.ceil((ends-now())/1000);this.gameInfo.textContent=text('score')+': '+this.game.score+' · '+text('seconds')+': '+Math.max(0,left)+' s';if(left<=0){this.finishGame();return;}this.later(clock,200);};
   const hop=()=>{if(this.game?.token!==token)return;next();this.later(hop,1100);};hop();clock();this.animate('happy',21000);
  }else{
   const values=['◆','●','★','♥','◆','●','★','♥'];for(let i=values.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[values[i],values[j]]=[values[j],values[i]];}
   let first=null,locked=false,pairs=0;const buttons=[];
   const info=()=>{this.gameInfo.textContent=text('pairs')+': '+pairs+'/4 · '+text('moves')+': '+this.game.moves;};
   values.forEach((v,i)=>{const b=this.buttonEl('?',()=>{
    if(this.game?.token!==token||locked||b.dataset.matched||first===i)return;
    b.textContent=v;b.setAttribute('aria-label',text('card')+' '+v);
    if(first===null){first=i;return;}this.game.moves++;info();const previous=first;first=null;
    if(values[previous]===v){b.dataset.matched='true';buttons[previous].dataset.matched='true';pairs++;info();if(pairs===4){this.game.score=Math.max(4,20-this.game.moves);this.later(()=>{if(this.game?.token===token)this.finishGame();},650);}}
    else{locked=true;this.later(()=>{if(this.game?.token!==token)return;for(const k of [previous,i]){buttons[k].textContent='?';buttons[k].setAttribute('aria-label',text('hiddenCard'));}locked=false;},700);}
   });b.setAttribute('aria-label',text('hiddenCard'));buttons.push(b);grid.append(b);});info();this.later(()=>{if(this.game?.token===token){this.cancelGame();this.say(text('stopped'));}},120000);
  }
  this.gameArea.append(this.buttonEl(text('cancel'),()=>{this.cancelGame();this.say(text('stopped'));},'k-pet-game-cancel'));
 }
 finishGame(){
  if(!this.game)return;const {token,score}=this.game;let result;try{result=Pet.finishGame(token,score);}catch(e){this.cancelGame();this.say(e.message);return;}this.cancelGame();if(result.animation)this.animate(result.animation,5000);this.refresh();this.say(result.message);
 }
 renderShop(){
  if(!this.sections?.shop)return;const s=Pet.getState(),section=this.sections.shop;section.replaceChildren(this.el('h3',{},text('roomTitle')),this.el('p',{class:'k-pet-muted'},text('roomInfo')));
  for(const[group,items]of [['rooms',ROOMS],['things',TOYS]]){section.append(this.el('h4',{},text(group)));const list=this.el('div',{class:'k-pet-shop'});for(const item of items){const owned=s.owned.includes(item.id),row=this.el('div',{class:'k-pet-shop-item'}),name=this.el('div');name.append(this.el('strong',{},text(item.id)),this.el('small',{},owned?text('owned'):item.price+' ◈'));const selected=s.room===item.id;const b=this.buttonEl(text(selected?'selected':owned?(group==='rooms'?'use':'owned'):'buy'),()=>this.action('buy',item.id));b.disabled=selected||(owned&&group==='things')||(!owned&&s.coins<item.price)||!s.named;row.append(name,b);list.append(row);}section.append(list);}
 }
 renderJournal(){
  if(!this.sections?.journal)return;const s=Pet.getState(),section=this.sections.journal;section.replaceChildren();const summary=this.el('div',{class:'k-pet-friendship'});for(const[label,value]of [['bond',Math.round(s.bond)+'%'],['health',s.health+'%'],['age',s.age],['streak',s.streak]]){const c=this.el('div');c.append(this.el('strong',{},String(value)),this.el('small',{},text(label)));summary.append(c);}section.append(summary,this.el('h3',{},text('achievements')));
  const badges=this.el('div',{class:'k-pet-badges'});for(const id of ['named','care','gamer','friend','collector','week']){const unlocked=s.achievements.includes(id),badge=this.el('span',{class:unlocked?'is-unlocked':'',title:unlocked?text('achievement_'+id):text('locked')},(unlocked?'★ ':'☆ ')+text('achievement_'+id));badges.append(badge);}section.append(badges,this.el('h3',{},text('memories')));
  const list=this.el('ol',{class:'k-pet-history'});for(const item of s.history){const li=this.el('li');let label=text('history_'+item.key);if(item.key==='achievement')label+=' · '+text('achievement_'+item.id);else if(item.id)label+=' · '+text(item.id);li.append(this.el('span',{},label),this.el('small',{},new Date(item.at).toLocaleDateString(Services.locale.appLocaleAsBCP47,{month:'short',day:'numeric'})));list.append(li);}if(!s.history.length)section.append(this.el('p',{},text('emptyJournal')));section.append(list);
 }
 renderState(s){
  this.title.textContent=s.name||text('nameFirst');this.level.textContent=text('level')+' '+s.level+' · '+text(s.stage);this.wallet.textContent=s.coins+' ◈';this.wallet.title=text('coins');this.xpBar.value=s.xpProgress;this.xpBar.title=s.xpProgress+'/40 XP';for(const[k,n]of Object.entries(this.gameRecords))n.textContent=text('record')+': '+s.best[k];
  this.room.dataset.room=s.room;this.room.toggleAttribute('data-sleeping',s.sleeping);this.thought.textContent=text(s.need);
  this.decor.replaceChildren();for(const id of s.toys){const n=this.el('span',{class:'k-pet-decoration k-pet-decoration-'+id,title:text(id)},id==='yarn'?'◉':id==='plant'?'♧':'☼');this.decor.append(n);}
  for(const[key,{meter,value}]of Object.entries(this.meters)){meter.value=Math.round(s[key]);value.textContent=Math.round(s[key])+'%';meter.dataset.low=String(s[key]<30);}
  for(const b of this.careButtons)b.disabled=!s.named;this.sleepButton.textContent=text(s.sleeping?'wake':'sleep');
  for(const[key,n]of Object.entries(this.tasks))n.textContent=(s.daily[key]?'✓ ':'○ ')+text(n.dataset.label);
  this.claim.disabled=!s.named||s.daily.claimed||!s.daily.feed||!s.daily.clean||!s.daily.game;this.claim.textContent=text(s.daily.claimed?'claimed':'claim');
  if(this.doc.activeElement!==this.nameInput)this.nameInput.value=s.name;
  this.paint();
 }
 destroy(){this.cancelGame();this.win.clearInterval(this.timer);for(const k of [KEY,'kamputa.companion.enabled','sidebar.verticalTabs'])Services.prefs.removeObserver(k,this.observer);this.panel?.remove();}
}
