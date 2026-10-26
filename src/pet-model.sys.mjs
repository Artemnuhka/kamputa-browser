/* SPDX-License-Identifier: MPL-2.0 */
/* Pure pet simulation; no browser APIs, network, or browsing data. */
export const ROOMS=[{id:'cozy',price:0},{id:'garden',price:60},{id:'night',price:90}];
export const TOYS=[{id:'yarn',price:35},{id:'plant',price:25},{id:'lamp',price:45}];
export const FOODS={meal:{price:0,satiety:25,mood:2},fish:{price:8,satiety:38,mood:6},treat:{price:4,satiety:9,mood:12}};
const clamp=(v,min=0,max=100)=>Math.max(min,Math.min(max,v));
const number=(v,fallback=0)=>Number.isFinite(v)?v:fallback;
const timestamp=(v,at,fallback=0)=>clamp(number(v,fallback),0,at);
const day=t=>{const d=new Date(t);return Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/86400000);};
export const cleanName=value=>String(value??'').replace(/[\u0000-\u001f\u007f-\u009f]/g,'').trim().slice(0,28);
const event=(s,key,at,data={})=>{s.history.unshift({key,at,...data});s.history=s.history.slice(0,24);};
function daily(s,at){const today=day(at);if(s.daily.day!==today)s.daily={day:today,feed:false,clean:false,game:false,claimed:false};}
export function migratePet(raw,at=Date.now()){
 const r=raw&&typeof raw==='object'?raw:{};
 const s={schema:2,name:cleanName(r.name||''),named:!!cleanName(r.name)&&r.named!==false,
  satiety:clamp(number(r.satiety,85)),energy:clamp(number(r.energy,85)),mood:clamp(number(r.mood,85)),hygiene:clamp(number(r.hygiene,85)),bond:clamp(number(r.bond,15)),
  xp:Math.max(0,number(r.xp)),coins:Math.max(0,Math.floor(number(r.coins,30))),sleeping:!!r.sleeping,
  born:Math.min(at,number(r.born,number(r.updated,at))||at),updated:Math.min(at,number(r.updated,at)),sleepStarted:Math.min(at,number(r.sleepStarted,at)),
  last:{feed:timestamp(r.last?.feed,at,number(r.lastFeed)),pet:timestamp(r.last?.pet,at,number(r.lastPet)),clean:timestamp(r.last?.clean,at),game:timestamp(r.last?.game,at,number(r.lastPlay)),chat:timestamp(r.last?.chat,at)},
  games:Math.max(0,Math.floor(number(r.games))),best:{catch:clamp(number(r.best?.catch),0,100),memory:clamp(number(r.best?.memory),0,100)},
  owned:['cozy',...(Array.isArray(r.owned)?r.owned:[])].filter((v,i,a)=>['cozy','garden','night','yarn','plant','lamp'].includes(v)&&a.indexOf(v)===i),
  room:ROOMS.some(x=>x.id===r.room)?r.room:'cozy',toys:[],achievements:Array.isArray(r.achievements)?r.achievements.filter(x=>['named','care','gamer','friend','collector','week'].includes(x)):[],
  history:Array.isArray(r.history)?r.history.filter(x=>x&&typeof x.key==='string'&&Number.isFinite(x.at)).slice(0,24):[],
  daily:r.daily&&Number.isFinite(r.daily.day)?{day:r.daily.day,feed:!!r.daily.feed,clean:!!r.daily.clean,game:!!r.daily.game,claimed:!!r.daily.claimed}:{day:day(at),feed:false,clean:false,game:false,claimed:false},
  visitDay:number(r.visitDay,-1),streak:clamp(number(r.streak),0,100000)};
 s.toys=TOYS.filter(x=>s.owned.includes(x.id)).map(x=>x.id);if(!s.owned.includes(s.room))s.room='cozy';daily(s,at);return s;
}
function achievements(s,at){
 for(const [key,earned]of [['named',s.named],['care',Math.min(s.satiety,s.energy,s.mood,s.hygiene)>=80],['gamer',s.games>=10],['friend',s.bond>=75],['collector',s.owned.length>=4],['week',s.streak>=7]]){
  if(s.named&&earned&&!s.achievements.includes(key)){s.achievements.push(key);s.coins+=10;event(s,'achievement',at,{id:key});}
 }
}
export function advancePet(s,at=Date.now()){
 daily(s,at);if(at<s.updated){const shift=s.updated-at;for(const key of Object.keys(s.last))s.last[key]=Math.max(0,s.last[key]-shift);s.sleepStarted=Math.max(0,s.sleepStarted-shift);s.updated=at;}const hours=Math.min(8,Math.max(0,at-s.updated)/3600000);if(!hours)return s;
 // Absence is capped; the pet never dies and does not demand constant attention.
 s.satiety=clamp(s.satiety-hours*(s.sleeping?2:5),Math.min(15,s.satiety));s.energy=clamp(s.energy+hours*(s.sleeping?40:-5),s.sleeping?0:Math.min(10,s.energy));
 s.hygiene=clamp(s.hygiene-hours*3,Math.min(15,s.hygiene));s.mood=clamp(s.mood-hours*(s.satiety<30?5:2),Math.min(15,s.mood));
 if(s.sleeping&&s.energy>=98&&at-s.sleepStarted>=60000){s.sleeping=false;event(s,'rested',at);}
 s.updated=at;return s;
}
export function petSnapshot(s,at=Date.now()){
 return {...JSON.parse(JSON.stringify(s)),level:1+Math.floor(s.xp/40),xpProgress:s.xp%40,
  age:Math.max(0,Math.floor((at-s.born)/86400000)),health:Math.round((s.satiety+s.energy+s.hygiene)/3),
  stage:s.xp>=440?'veteran':s.xp>=200?'companion':s.xp>=80?'explorer':'kitten',
  need:s.sleeping?'sleeping':s.energy<25?'tired':s.satiety<35?'hungry':s.hygiene<35?'dirty':s.mood<40?'bored':s.bond>=75?'loved':'content'};
}
export function canPlay(s,at=Date.now()){
 if(!s.named)return 'nameFirst';if(s.sleeping)return 'sleepFirst';if(s.energy<20)return 'tiredGame';if(s.satiety<20)return 'hungryGame';if(at-s.last.game<60000)return 'gameRest';return null;
}
// admittedGame is supplied only after the adapter validates a live game token.
export function performPetAction(s,action,value,at=Date.now(),admittedGame=false){
 advancePet(s,at);if(action!=='visit'&&action!=='rename'&&!s.named)return {message:'nameFirst'};
 let message,animation='happy',reward=0;
 if(action==='rename'){
  const name=cleanName(value);if(!name)return {message:'nameRequired'};s.name=name;s.named=true;message='nameSaved';
 }else if(action==='visit'){
  if(s.named&&s.visitDay!==day(at)){s.streak=s.visitDay===day(at)-1?s.streak+1:1;s.visitDay=day(at);s.coins+=5;event(s,'visit',at);message='welcomeGift';}else message='hello';
 }else if(action==='feed'){
  if(s.sleeping)return {message:'sleepFirst'};if(at-s.last.feed<45000)return {message:'eating'};if(s.satiety>=94)return {message:'full'};
  const food=FOODS[value];if(!food)return {message:'unknown'};if(s.coins<food.price)return {message:'noCoins'};
  s.coins-=food.price;s.satiety=clamp(s.satiety+food.satiety);s.mood=clamp(s.mood+food.mood);s.last.feed=at;s.xp+=3;s.bond=clamp(s.bond+1);s.daily.feed=true;message='fed';animation='eat';event(s,'feed',at,{id:value});
 }else if(action==='clean'){
  if(s.sleeping)return {message:'sleepFirst'};if(at-s.last.clean<90000)return {message:'alreadyClean'};if(s.hygiene>=96)return {message:'alreadyClean'};
  s.hygiene=clamp(s.hygiene+40);s.mood=clamp(s.mood+5);s.last.clean=at;s.daily.clean=true;s.xp+=3;message='cleaned';event(s,'clean',at);
 }else if(action==='pet'){
  if(s.sleeping)return {message:'dreaming'};if(at-s.last.pet<15000)return {message:'purr'};
  s.mood=clamp(s.mood+8);s.bond=clamp(s.bond+3);s.last.pet=at;s.xp++;message='purr';
 }else if(action==='chat'){
  if(s.sleeping)return {message:'dreaming'};const need=petSnapshot(s,at).need;message='say_'+need;
  if(at-s.last.chat>=30000){s.bond=clamp(s.bond+1);s.last.chat=at;}
 }else if(action==='sleep'){
  s.sleeping=!s.sleeping;if(s.sleeping)s.sleepStarted=at;message=s.sleeping?'goodnight':'awake';animation=s.sleeping?'sleep':'idle';event(s,s.sleeping?'sleep':'wake',at);
 }else if(action==='game'){
  const blocked=admittedGame?null:canPlay(s,at);if(blocked)return {message:blocked};
  if(!value||!['catch','memory'].includes(value.kind))return {message:'unknown'};
  const score=Math.floor(clamp(number(value.score),0,100));if(score<1)return {message:'tryAgain'};
  reward=value.kind==='memory'?12:Math.min(15,4+Math.floor(score/2));
  s.coins+=reward;s.xp+=Math.min(12,4+Math.floor(score/3));s.mood=clamp(s.mood+18);s.energy=clamp(s.energy-8);s.satiety=clamp(s.satiety-4);s.hygiene=clamp(s.hygiene-2);s.bond=clamp(s.bond+2);s.games++;s.last.game=at;s.daily.game=true;s.best[value.kind]=Math.max(s.best[value.kind],score);message='gameReward';event(s,'game',at,{id:value.kind,coins:reward});
 }else if(action==='buy'){
  const item=[...ROOMS,...TOYS].find(x=>x.id===value);if(!item)return {message:'unknown'};
  if(s.owned.includes(item.id)){if(ROOMS.includes(item)){s.room=item.id;message='roomChanged';}else message='owned';}
  else{if(s.coins<item.price)return {message:'noCoins'};s.coins-=item.price;s.owned.push(item.id);if(ROOMS.includes(item))s.room=item.id;else s.toys.push(item.id);message='bought';event(s,'purchase',at,{id:item.id});}
 }else if(action==='claim'){
  if(s.daily.claimed)return {message:'claimed'};if(!s.daily.feed||!s.daily.clean||!s.daily.game)return {message:'notReady'};
  s.daily.claimed=true;s.coins+=20;s.xp+=10;reward=20;message='dailyReward';event(s,'daily',at);
 }else return {message:'unknown'};
 s.updated=at;achievements(s,at);return {message,animation,reward,state:petSnapshot(s,at)};
}
