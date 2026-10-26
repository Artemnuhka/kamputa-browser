#!/usr/bin/env python3
# SPDX-License-Identifier: MPL-2.0
"""Assemble a local Linux distribution using an installed Firefox runtime."""
import argparse,configparser,json,os,pathlib,shutil,zipfile,hashlib,subprocess,sys
ROOT=pathlib.Path(__file__).resolve().parent
p=argparse.ArgumentParser();p.add_argument('--firefox',default='/usr/lib64/firefox');p.add_argument('--output',default=str(ROOT/'runtime'));args=p.parse_args()
source=pathlib.Path(args.firefox).resolve();dest=pathlib.Path(args.output).resolve()
if source==dest or source in dest.parents:raise SystemExit('Output must be separate from Firefox')
if not (source/'firefox-bin').exists():raise SystemExit('Firefox runtime not found')
expected=json.loads((ROOT/'BUILD.json').read_text())['firefox_version']
ini=configparser.ConfigParser();ini.read(source/'application.ini')
if ini['App']['Version']!=expected:raise SystemExit('Use the pinned Firefox '+expected+' runtime')
if dest.exists():raise SystemExit('Output already exists; choose a new directory, then replace runtime with browser closed.')
xpi=ROOT/'vendor/ublock-origin.xpi'
with zipfile.ZipFile(xpi) as z:
 manifest=json.loads(z.read('manifest.json'));assert manifest.get('browser_specific_settings',manifest.get('applications'))['gecko']['id']=='uBlock0@raymondhill.net'
shutil.copytree(source,dest,symlinks=True)
subprocess.run([sys.executable,str(ROOT/'normalize-jars.py'),str(dest/'omni.ja'),str(dest/'browser/omni.ja')],check=True)
# Remove distribution-specific configuration, leaving the installed runtime untouched.
shutil.rmtree(dest/'distribution',ignore_errors=True);(dest/'distribution').mkdir()
(dest/'defaults/pref').mkdir(parents=True,exist_ok=True)
shutil.copy2(ROOT/'src/autoconfig.js',dest/'defaults/pref/kamputa.js');shutil.copy2(ROOT/'src/kamputa.cfg',dest/'kamputa.cfg')
subprocess.run([sys.executable,str(ROOT/'prepare-locales.py'),str(dest)],check=True)
shutil.copytree(ROOT/'src',dest/'kamputa');shutil.copytree(ROOT/'assets',dest/'kamputa/assets')
shutil.copy2(xpi,dest/'distribution/ublock-origin.xpi')
lang=source/'browser/extensions/langpack-ru@firefox.mozilla.org.xpi'
if lang.exists():
 (dest/'distribution/extensions').mkdir(parents=True,exist_ok=True);shutil.copy2(lang,dest/'distribution/extensions/langpack-ru@firefox.mozilla.org.xpi')
policies={'policies':{
 'DisableAppUpdate':True,'DisableTelemetry':True,'DisableFirefoxStudies':True,'DisablePocket':True,
 'DontCheckDefaultBrowser':True,'OverrideFirstRunPage':'','OverridePostUpdatePage':'',
 'ExtensionSettings':{'uBlock0@raymondhill.net':{'installation_mode':'force_installed','install_url':'file:///kamputa-browser/runtime/distribution/ublock-origin.xpi'}},
 'Preferences':{k:{'Value':v,'Status':'locked'} for k,v in {
  'datareporting.healthreport.uploadEnabled':False,'datareporting.policy.dataSubmissionEnabled':False,
  'toolkit.telemetry.enabled':False,'toolkit.telemetry.unified':False,'toolkit.telemetry.server':'',
  'toolkit.telemetry.archive.enabled':False,'toolkit.telemetry.newProfilePing.enabled':False,
  'toolkit.telemetry.shutdownPingSender.enabled':False,'toolkit.telemetry.updatePing.enabled':False,
  'toolkit.telemetry.bhrPing.enabled':False,'toolkit.telemetry.firstShutdownPing.enabled':False,
  'datareporting.usage.uploadEnabled':False,'browser.crashReports.unsubmittedCheck.autoSubmit2':False,
  'app.shield.optoutstudies.enabled':False,'app.normandy.enabled':False,'app.normandy.api_url':'',
  'browser.discovery.enabled':False,'browser.newtabpage.activity-stream.feeds.telemetry':False,
  'browser.newtabpage.activity-stream.telemetry':False,'browser.ping-centre.telemetry':False,
  'browser.newtabpage.activity-stream.showSponsored':False,'browser.newtabpage.activity-stream.showSponsoredTopSites':False,
  'browser.newtabpage.activity-stream.feeds.section.topstories':False,
  'browser.newtabpage.activity-stream.asrouter.userprefs.cfr.addons':False,
  'browser.newtabpage.activity-stream.asrouter.userprefs.cfr.features':False,
  'browser.urlbar.suggest.quicksuggest.sponsored':False,'browser.urlbar.suggest.quicksuggest.nonsponsored':False,
  'browser.aboutwelcome.enabled':False,'browser.shell.checkDefaultBrowser':False,
 }.items()}}}
(dest/'distribution/policies.json').write_text(json.dumps(policies,indent=2)+'\n')
defaults={'intl.locale.requested':'ru','browser.tabs.inTitlebar':1,'browser.uidensity':1,'browser.tabs.hoverPreview.enabled':True,
'browser.toolbars.bookmarks.visibility':'never','browser.startup.homepage':'about:kamputa',
'browser.urlbar.suggest.bookmark':False,'browser.urlbar.scotchBonnet.enableOverride':False,
'browser.startup.page':3,'browser.aboutwelcome.enabled':False,'browser.translations.automaticallyPopup':False,
'kamputa.theme':'chromium','kamputa.memory.enabled':True,'kamputa.memory.auto':False,
'kamputa.memory.thresholdMB':350,'kamputa.memory.idleMinutes':15}
(dest/'defaults/pref/kamputa-defaults.js').write_text('\n'.join(f'pref({json.dumps(k)}, {json.dumps(v)});' for k,v in defaults.items())+'\n')
meta=json.loads((ROOT/'BUILD.json').read_text());meta['ublock_sha256']=hashlib.sha256(xpi.read_bytes()).hexdigest()
(ROOT/'BUILD.json').write_text(json.dumps(meta,indent=2)+'\n')
import runpy
runpy.run_path(str(ROOT/'brand-runtime.py'))['brand'](dest)
print(f'Built Kamputa runtime: {dest}')
