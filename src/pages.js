/* SPDX-License-Identifier: MPL-2.0 */
/* Trusted local about pages. No URI_SAFE_FOR_UNTRUSTED_CONTENT flag, no web bridge. */
(() => {
  const registrar=Components.manager.QueryInterface(Ci.nsIComponentRegistrar);
  for(const [name,file,id] of [
    ['kamputa','newtab.html','{4a293b23-3404-4b13-9b72-098938ec6ced}'],
    ['kamputa-setup','setup.html','{4a293b23-3404-4b13-9b72-098938ec6cee}']
  ]) {
    const module={
      QueryInterface:ChromeUtils.generateQI(['nsIAboutModule']),
      getURIFlags(){return Ci.nsIAboutModule.ALLOW_SCRIPT;},
      newChannel(uri,loadInfo){
        const channel=Services.io.newChannelFromURIWithLoadInfo(Services.io.newURI('resource://kamputa/'+file),loadInfo);
        channel.originalURI=uri;channel.owner=Services.scriptSecurityManager.getSystemPrincipal();return channel;
      }
    };
    const factory={QueryInterface:ChromeUtils.generateQI(['nsIFactory']),createInstance(iid){return module.QueryInterface(iid);}};
    registrar.registerFactory(Components.ID(id),'kamputa browser '+name,'@mozilla.org/network/protocol/about;1?what='+name,factory);
  }
  Services.prefs.getDefaultBranch('').setStringPref('browser.startup.homepage','about:kamputa');
  ChromeUtils.importESModule('resource:///modules/AboutNewTab.sys.mjs').AboutNewTab.newTabURL='about:kamputa';
})();
