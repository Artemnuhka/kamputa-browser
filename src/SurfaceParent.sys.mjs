/* SPDX-License-Identifier: MPL-2.0 */
import {Updates} from './updates.sys.mjs';
import {settingsState,setSetting} from './settings.sys.mjs';
import {Theme} from './ui.sys.mjs';
export class KamputaSurfaceParent extends JSWindowActorParent {
 receiveMessage(message){
  const uri=this.manager.documentURI?.spec||'';
  if(!/^(about:(preferences|addons)|chrome:\/\/mozapps\/content\/extensions\/aboutaddons\.html)/.test(uri))throw new Error('Palette controls are restricted to browser settings');
  if(message.name==='Kamputa:PaletteState')return Theme.getState();
  if(message.name==='Kamputa:Theme')return Theme.choose(message.data.base);
  if(message.name==='Kamputa:Palette')return Theme.setPalette(message.data.base,message.data.seed);
  if(message.name==='Kamputa:Settings')return settingsState();
  if(message.name==='Kamputa:SetSetting')return setSetting(message.data.key,message.data.value);
  if(message.name==='Kamputa:Update'){
   const action=message.data.action;if(!['check','download','status','restart'].includes(action))throw Error('Неизвестная команда обновления');
   return action==='restart'?Updates.restart():action==='status'?Updates.status():Updates.run(action);
  }
  if(message.name==='Kamputa:OpenPet'){
   const win=this.browsingContext.top.embedderElement?.ownerGlobal;if(!win?.Kamputa)throw Error('Окно браузера недоступно');win.Kamputa.openCompanionMenu();return true;
  }
  throw new Error('Unknown Kamputa settings command');
 }
}
