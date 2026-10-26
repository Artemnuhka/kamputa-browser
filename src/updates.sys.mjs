/* SPDX-License-Identifier: MPL-2.0 */
import {Subprocess} from 'resource://gre/modules/Subprocess.sys.mjs';
const root=Services.dirsvc.get('GreD',Ci.nsIFile).parent;
let busy=null,latest=null;
const REPOSITORY='Artemnuhka/kamputa-browser';
function repo(){return REPOSITORY;}
export const Updates={
 get repo(){return REPOSITORY;},
 async run(command){
  if(busy)throw Error('Обновление уже выполняется');
  if(['check','download'].includes(command)&&!repo())throw Error('Репозиторий ещё не настроен');
  busy=(async()=>{
   const helper=root.clone();helper.append('update.py');
   const args=[helper.path,command];if(['check','download'].includes(command))args.push('--repo',repo());
   const child=await Subprocess.call({command:'/usr/bin/python3',arguments:args,stderr:'stdout'});
   const output=await child.stdout.readString();const result=await child.wait();
   let data;try{data=JSON.parse(output);}catch{throw Error('Не удалось прочитать ответ службы обновления');}
   if(result.exitCode||data.error)throw Error(data.error||'Не удалось обновить браузер');
   if(command==='check'){latest=data;Services.prefs.setStringPref('kamputa.updates.lastCheck',String(Date.now()));}
   return data;
  })();try{return await busy;}finally{busy=null;}
 },
 async status(){const result=await this.run('status');return {...result,repo:repo(),available:latest?.available||false,latest:latest?.version};},
 async restart(){const status=await this.status();if(!status.staged)throw Error('Сначала скачай обновление');const marker=Services.dirsvc.get('ProfD',Ci.nsIFile);marker.append('kamputa-restart-update');await IOUtils.writeUTF8(marker.path,'restart');Services.startup.quit(Ci.nsIAppStartup.eAttemptQuit);},
 async autoCheck(){
  if(!repo()||!Services.prefs.getBoolPref('kamputa.updates.auto',false))return;
  if(Date.now()-Number(Services.prefs.getStringPref('kamputa.updates.lastCheck','0'))<86400000)return;
  Services.prefs.setStringPref('kamputa.updates.lastCheck',String(Date.now()));
  try{const result=await this.run('check');if(result.available)Services.prefs.setStringPref('kamputa.updates.available',result.version);}catch(error){Services.console.logStringMessage('Kamputa updates: '+error.message);}
 }
};
