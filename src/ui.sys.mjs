/* SPDX-License-Identifier: MPL-2.0 */
import {AddonManager} from 'resource://gre/modules/AddonManager.sys.mjs';
import {BuiltInThemeConfig} from 'resource:///modules/BuiltInThemeConfig.sys.mjs';
import {palette,themeColors} from './palettes.sys.mjs';
import {LOCALES} from './locales-index.sys.mjs';
export const THEME_ID='helium-dark@kamputa.local';
export const STANDARD_ID='material-standard@kamputa.local';
const ids={chromium:THEME_ID,firefox:STANDARD_ID};
const protocol=Services.io.getProtocolHandler('resource').QueryInterface(Ci.nsIResProtocolHandler);
function directory(base){const dir=Services.dirsvc.get('ProfD',Ci.nsIFile);dir.append('kamputa-themes');dir.append(base);return dir;}
for(const base of ['chromium','firefox']){
 const dir=directory(base);protocol.setSubstitution('kamputa-theme-'+base,Services.io.newURI(Services.io.newFileURI(dir).spec+'/'));
 const file=dir.clone();file.append('manifest.json');
 BuiltInThemeConfig.set(ids[base],file.exists()?{version:'0.3.'+Services.prefs.getIntPref('kamputa.palette.version.'+base,1),path:'resource://kamputa-theme-'+base+'/'}:{version:'0.3',path:'resource://kamputa/'+(base==='chromium'?'theme/':'theme-standard/')});
}
let installPromise,chain=Promise.resolve();
function seed(base){return Services.prefs.getStringPref('kamputa.palette.'+base,'')||null;}
export const Theme={
 get active(){return Services.prefs.getStringPref('extensions.activeThemeID','')===THEME_ID;},
 get materialActive(){return Object.values(ids).includes(Services.prefs.getStringPref('extensions.activeThemeID',''));},
 getState(){
  const current=Services.prefs.getStringPref('extensions.activeThemeID','');const base=current===THEME_ID?'chromium':'firefox';
  return {base,seeds:{chromium:seed('chromium'),firefox:seed('firefox')},colors:palette(seed(base)),custom:this.materialActive,native:current};
 },
 initialize(){
  if(!installPromise)installPromise=(async()=>{
   for(const id of Object.values(ids)){const config=BuiltInThemeConfig.get(id);await AddonManager.maybeInstallBuiltinAddon(id,config.version,config.path);}
   if(!Services.prefs.getBoolPref('kamputa.native-theme.migrated',false)){
    if(Services.prefs.getStringPref('kamputa.theme','chromium')==='chromium')await (await AddonManager.getAddonByID(THEME_ID)).enable();
    Services.prefs.setBoolPref('kamputa.native-theme.migrated',true);
   }
  })();return installPromise;
 },
 choose(base){
  if(!Object.hasOwn(ids,base))return Promise.reject(new Error('Неизвестная тема'));
  chain=chain.catch(()=>{}).then(async()=>{await this.initialize();const id=base==='firefox'&&!seed(base)?'default-theme@mozilla.org':ids[base];await (await AddonManager.getAddonByID(id)).enable();Services.prefs.setStringPref('kamputa.theme',base);return this.getState();});return chain;
 },
 setPalette(base,value){
  if(!Object.hasOwn(ids,base) || (value!==null&&!/^#[0-9a-f]{6}$/i.test(value)))return Promise.reject(new Error('Некорректная палитра'));
  chain=chain.catch(()=>{}).then(async()=>{
   await this.initialize();const p=palette(value),dir=directory(base);await IOUtils.makeDirectory(dir.path,{ignoreExisting:true,permissions:0o700});
   const revision=Services.prefs.getIntPref('kamputa.palette.version.'+base,0)+1;
   const manifest={manifest_version:2,name:base==='chromium'?'kamputa browser — Helium Dark':'kamputa browser — Classic Material',version:'0.3.'+revision,browser_specific_settings:{gecko:{id:ids[base]}},theme:{colors:themeColors(p),properties:{color_scheme:'dark',content_color_scheme:'dark'}}};
   const path=dir.clone();path.append('manifest.json');await IOUtils.writeJSON(path.path,manifest);
   const config={version:manifest.version,path:'resource://kamputa-theme-'+base+'/'};BuiltInThemeConfig.set(ids[base],config);
   await AddonManager.maybeInstallBuiltinAddon(ids[base],config.version,config.path);
   Services.prefs.setIntPref('kamputa.palette.version.'+base,revision);Services.prefs.setStringPref('kamputa.palette.'+base,value||'');
   await (await AddonManager.getAddonByID(base==='firefox'&&!value?'default-theme@mozilla.org':ids[base])).enable();Services.prefs.setStringPref('kamputa.theme',base);
   return this.getState();
  });return chain;
 }
};
let chromeHandle;
function registerBranding(){
 const registry=L10nRegistry.getInstance(),sources=[];
 const groups=[['app',Object.keys(LOCALES)]];
 for(const name of registry.getSourceNames())if(name.startsWith('browser-langpack-')){
  const group=name.slice('browser-'.length),locale=group.replace(/^langpack-/,'').replace(/-browser$/,'');
  if(LOCALES[locale])groups.push([group,[locale]]);
 }
 for(const [group,locales] of groups){
  const name='kamputa-brand-'+group;if(registry.hasSource(name))continue;
  const index=locales.flatMap(locale=>LOCALES[locale].map(file=>'resource://kamputa/locales/'+locale+'/'+file));
  sources.push(new L10nFileSource(name,group,locales,'resource://kamputa/locales/{locale}/',{allowOverrides:true},index));
 }
 if(sources.length)registry.registerSources(sources);
 const locale=Services.locale.appLocaleAsBCP47;const selected=LOCALES[locale]?locale:'en-US';
 chromeHandle?.destruct();
 chromeHandle=Cc['@mozilla.org/addons/addon-manager-startup;1'].getService(Ci.amIAddonManagerStartup).registerChrome(Services.io.newURI('resource://kamputa/kamputa.cfg'),[['override','chrome://branding/locale/brand.properties','resource://kamputa/locales/'+selected+'/branding/brand.properties']]);
}
registerBranding();
Services.obs.addObserver({observe:registerBranding},'webextension-langpack-startup');
Services.obs.addObserver({observe:registerBranding},'intl:app-locales-changed');
ChromeUtils.registerWindowActor('KamputaSurface',{
 parent:{esModuleURI:'resource://kamputa/SurfaceParent.sys.mjs'},
 child:{esModuleURI:'resource://kamputa/SurfaceChild.sys.mjs',events:{DOMDocElementInserted:{},DOMContentLoaded:{}}},
 matches:['about:preferences*','about:addons*','about:config*','about:downloads*','about:logins*','about:protections*','about:support*','about:kamputa*','chrome://mozapps/content/extensions/aboutaddons.html'],allFrames:true,includeChrome:true
});
