/* SPDX-License-Identifier: MPL-2.0 */
import {Updates} from './updates.sys.mjs';
const bools=new Set(['kamputa.companion.enabled','kamputa.memory.enabled','kamputa.memory.auto','kamputa.updates.auto']);
const numbers={'kamputa.memory.thresholdMB':[50,16384],'kamputa.memory.idleMinutes':[1,1440]};
export function settingsState(){return {petEnabled:Services.prefs.getBoolPref('kamputa.companion.enabled',true),memoryEnabled:Services.prefs.getBoolPref('kamputa.memory.enabled',true),memoryAuto:Services.prefs.getBoolPref('kamputa.memory.auto',false),thresholdMB:Services.prefs.getIntPref('kamputa.memory.thresholdMB',350),idleMinutes:Services.prefs.getIntPref('kamputa.memory.idleMinutes',15),repo:Updates.repo,updateAuto:Services.prefs.getBoolPref('kamputa.updates.auto',false)};}
export function setSetting(key,value){
 if(bools.has(key)){if(typeof value!=='boolean')throw Error('Нужно значение да/нет');Services.prefs.setBoolPref(key,value);}
 else if(Object.hasOwn(numbers,key)){const[min,max]=numbers[key];if(!Number.isFinite(value)||!Number.isInteger(value)||value<min||value>max)throw Error('Значение от '+min+' до '+max);Services.prefs.setIntPref(key,value);}
 else throw Error('Эта настройка недоступна');
 return settingsState();
}
