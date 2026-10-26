#!/usr/bin/env python3
# SPDX-License-Identifier: MPL-2.0
"""GitHub Releases updater. Stage while running; install only with every profile closed."""
import argparse,contextlib,datetime,fcntl,hashlib,json,os,pathlib,platform,re,shutil,stat,sys,tarfile,urllib.error,urllib.parse,urllib.request
ROOT=pathlib.Path(__file__).resolve().parent
CACHE=ROOT/'updates'
MAX_PACKAGE=1024**3
ENTRIES={'runtime','src','assets','vendor','kamputa','build.py','brand-runtime.py','prepare-locales.py','import-profile.py','switch-runtime.py','update.py','build-release.py','README.md','THIRD-PARTY-NOTICES.md','BUILD.json','UPDATE-FORMAT.md','configure-runtime.py','normalize-jars.py','packaging','LICENSE','THIRD-PARTY-NOTICES.md','SOURCE-CODE.md','licenses'}
REQUIRED={'runtime','src','assets','kamputa','update.py','BUILD.json'}
def fail(message):raise ValueError(message)
def version(v):
 m=re.fullmatch(r'v?(\d+)\.(\d+)(?:\.(\d+))?',str(v))
 if not m:fail('Нужна стабильная версия вида 0.4.0')
 return tuple(int(x or 0) for x in m.groups())
def current():return json.loads((ROOT/'BUILD.json').read_text())['kamputa_version']
def repo_name(value):
 if not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9_.-]{0,99}/[A-Za-z0-9][A-Za-z0-9_.-]{0,99}',value or ''):fail('Укажи GitHub-репозиторий в формате владелец/репозиторий')
 if any(x in {'.','..'} or x.endswith('.git') for x in value.split('/')):fail('Нужен владелец/репозиторий без .git')
 return value
class NoPublishedRelease(Exception):pass
class RateLimited(Exception):pass
class HTTPSRedirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,req,fp,code,msg,headers,newurl):
  allowed_url(newurl)
  return super().redirect_request(req,fp,code,msg,headers,newurl)
def allowed_url(url):
 p=urllib.parse.urlsplit(url)
 if p.scheme!='https' or p.username or p.password or p.port not in (None,443) or p.hostname not in {'api.github.com','github.com','release-assets.githubusercontent.com','objects.githubusercontent.com','github-releases.githubusercontent.com'}:fail('Обновление разрешено только через HTTPS GitHub Releases')
 return url
OPENER=urllib.request.build_opener(HTTPSRedirect())
def request(url,limit,target=None,digest=None):
 allowed_url(url);req=urllib.request.Request(url,headers={'User-Agent':'kamputa-browser-updater/'+current(),'Accept':'application/vnd.github+json' if 'api.github.com' in url else 'application/octet-stream','X-GitHub-Api-Version':'2026-03-10'})
 count=0;sha=hashlib.sha256();chunks=[]
 try:
  with OPENER.open(req,timeout=45) as response:
   allowed_url(response.url)
   with (open(target,'wb') if target else contextlib.suppress()) as stream:
    while True:
     data=response.read(1024*256)
     if not data:break
     count+=len(data)
     if count>limit:fail('Файл обновления слишком большой')
     sha.update(data)
     if stream:stream.write(data)
     else:chunks.append(data)
 except urllib.error.HTTPError as e:
  if e.code==404:
   if url.endswith('/releases/latest'):raise NoPublishedRelease()
   fail('Не удалось найти файл обновления')
  if e.code in (403,429):raise RateLimited('GitHub временно ограничил запросы. Попробуй позже')
  raise
 if digest and sha.hexdigest()!=digest:fail('Контрольная сумма не совпала. Обновление отменено')
 return count if target else b''.join(chunks)
def asset_url(asset,repo):
 url=allowed_url(asset['browser_download_url']);p=urllib.parse.urlsplit(url)
 if p.hostname!='github.com' or not p.path.startswith('/'+repo+'/releases/download/'):fail('Файл релиза принадлежит другому репозиторию')
 return url
def latest_without_api(repo):
 # GitHub's public /latest redirect excludes draft and prerelease releases.
 url='https://github.com/'+repo+'/releases/latest'
 req=urllib.request.Request(url,method='HEAD',headers={'User-Agent':'kamputa-browser-updater/'+current()})
 try:
  with OPENER.open(req,timeout=45) as response:resolved=urllib.parse.urlsplit(allowed_url(response.url))
 except urllib.error.HTTPError as e:
  if e.code==404:raise NoPublishedRelease()
  raise
 prefix='/'+repo+'/releases/tag/'
 if resolved.hostname!='github.com' or not resolved.path.startswith(prefix):fail('Файл релиза принадлежит другому репозиторию')
 tag=resolved.path[len(prefix):];version(tag)
 base='https://github.com/'+repo+'/releases/download/'+tag+'/'
 return {'tag_name':tag,'assets':[{'name':'kamputa-update.json','browser_download_url':base+'kamputa-update.json'}],'without_api':True,'asset_base':base}
def check(repo):
 repo=repo_name(repo)
 try:
  try:release=json.loads(request('https://api.github.com/repos/'+repo+'/releases/latest',2*1024**2))
  except RateLimited:release=latest_without_api(repo)
 except NoPublishedRelease:return {'current':current(),'available':False,'repo':repo,'message':'Обновлений пока нет'}
 if release.get('draft') or release.get('prerelease'):fail('Этот релиз не является стабильным')
 target=release['tag_name'];newer=version(target)>version(current())
 result={'current':current(),'version':target,'available':newer,'repo':repo,'message':'Доступна версия '+target if newer else 'У тебя последняя версия'}
 if not newer:return result
 manifest_asset=next((a for a in release['assets'] if a['name']=='kamputa-update.json'),None)
 if not manifest_asset:fail('В релизе нет kamputa-update.json для обновления браузера')
 d=manifest_asset.get('digest','');digest=d[7:] if re.fullmatch(r'sha256:[0-9a-f]{64}',d) else None
 manifest=json.loads(request(asset_url(manifest_asset,repo),65536,digest=digest))
 if manifest.get('schema')!=1 or manifest.get('app_id')!='kamputa-browser' or version(manifest.get('version'))!=version(target):fail('Манифест не подходит этому браузеру')
 arch={'x86_64':'x86_64','aarch64':'aarch64'}.get(platform.machine())
 if not arch:fail('Для этой архитектуры нет механизма обновления')
 package=manifest.get('platforms',{}).get('linux-'+arch)
 if not package:fail('В релизе нет сборки для linux-'+arch)
 if not re.fullmatch(r'[A-Za-z0-9_.-]+\.tar\.xz',package.get('asset','')) or not re.fullmatch(r'[0-9a-f]{64}',package.get('sha256','')):fail('Некорректное описание файла обновления')
 asset=next((a for a in release['assets'] if a['name']==package['asset']),None)
 size=package.get('size')
 if release.get('without_api'):asset={'size':size,'browser_download_url':release['asset_base']+package['asset']}
 if not asset or type(size) is not int or not 0<size<=MAX_PACKAGE or size!=asset['size']:fail('Размер пакета обновления не совпадает с манифестом')
 d=asset.get('digest')
 if d and d!='sha256:'+package['sha256']:fail('Контрольные суммы GitHub и манифеста отличаются')
 result.update(package=package,url=asset_url(asset,repo));return result
def write_json(path,data):
 path.parent.mkdir(parents=True,exist_ok=True);temp=path.with_suffix('.tmp');temp.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');os.replace(temp,path)
def unpack(package,destination,target):
 if destination.exists():shutil.rmtree(destination)
 destination.mkdir(parents=True)
 total=0;seen=set()
 with tarfile.open(package,'r:xz') as archive:
  for member in archive:
   path=pathlib.PurePosixPath(member.name)
   if path.is_absolute() or '..' in path.parts or not path.parts or path.parts[0]!='kamputa-browser' or '\\' in member.name or member.name in seen:fail('Небезопасный путь в пакете обновления')
   seen.add(member.name)
   parts=path.parts[1:]
   if not parts:continue
   if parts[0] not in ENTRIES or not (member.isdir() or member.isfile()):fail('Недопустимый файл в обновлении')
   total+=member.size
   if total>4*MAX_PACKAGE or len(seen)>60000:fail('Распакованный пакет слишком большой')
   out=destination.joinpath(*parts)
   if member.isdir():out.mkdir(parents=True,exist_ok=True);continue
   out.parent.mkdir(parents=True,exist_ok=True)
   with archive.extractfile(member) as src,open(out,'wb') as dst:shutil.copyfileobj(src,dst)
   out.chmod(0o755 if member.mode&0o111 else 0o644)
 validate(destination,target)
def validate(staged,target):
 if not REQUIRED.issubset({p.name for p in staged.iterdir()}):fail('В обновлении не хватает файлов приложения')
 meta=json.loads((staged/'BUILD.json').read_text())
 if version(meta.get('kamputa_version'))!=version(target):fail('Версия внутри пакета не совпала с релизом')
 for f in ['runtime/firefox','runtime/kamputa.cfg','runtime/kamputa/browser.js','runtime/distribution/policies.json','runtime/distribution/ublock-origin.xpi','src/browser.js']:
  if not (staged/f).is_file():fail('Неполная сборка: '+f)
 if not os.access(staged/'runtime/firefox',os.X_OK) or not os.access(staged/'kamputa',os.X_OK):fail('Файлы запуска не исполняемые')
 policies=json.loads((staged/'runtime/distribution/policies.json').read_text())
 # Local extension path must resolve after runtime swap, not to the build machine.
 policies['policies']['ExtensionSettings']['uBlock0@raymondhill.net']['install_url']=(ROOT/'runtime/distribution/ublock-origin.xpi').as_uri()
 (staged/'runtime/distribution/policies.json').write_text(json.dumps(policies,indent=2)+'\n')
def stage(repo):
 release=check(repo)
 if not release['available']:return release
 CACHE.mkdir(parents=True,exist_ok=True);package=CACHE/'download.tar.xz.part';staged=CACHE/'staged-next'
 try:
  count=request(release['url'],release['package']['size'],package,release['package']['sha256'])
  if count!=release['package']['size']:fail('Загрузка не завершилась: неверный размер файла')
  unpack(package,staged,release['version'])
  final=CACHE/'staged'
  if final.exists():shutil.rmtree(final)
  os.replace(staged,final);write_json(CACHE/'pending.json',{'version':release['version'],'repo':repo,'sha256':release['package']['sha256'],'staged':True})
 finally:
  if package.exists():package.unlink()
  if staged.exists():shutil.rmtree(staged)
 return {'staged':True,'version':release['version'],'message':'Загружено. Можно обновить и перезапустить браузер'}
def closed_profiles():
 handles=[]
 try:
  # Also catch profiles launched outside the default application directories.
  executables={str(ROOT/'runtime/firefox').encode(),str(ROOT/'runtime/firefox-bin').encode()}
  for process in pathlib.Path('/proc').glob('[0-9]*/cmdline'):
   try:
    args=process.read_bytes().split(b'\0')
    if args and args[0] in executables and b'-contentproc' not in args:fail('Закрой все окна и профили Kamputa перед установкой обновления')
   except (PermissionError,FileNotFoundError,ProcessLookupError):pass
  profiles={ROOT/'profile',*(ROOT/'profiles').glob('*')}
  if os.environ.get('KAMPUTA_PROFILE'):profiles.add(pathlib.Path(os.environ['KAMPUTA_PROFILE']))
  for profile in profiles:
   lock=profile/'.parentlock'
   if lock.exists():
    h=lock.open('r+');handles.append(h)
    try:fcntl.lockf(h,fcntl.LOCK_EX|fcntl.LOCK_NB)
    except OSError:fail('Закрой все окна и профили Kamputa перед установкой обновления')
  return handles
 except:
  for h in handles:h.close()
  raise
# Write journal before any rename. Recovery runs before starting the browser.
def rollback(journal):
 data=json.loads(journal.read_text());backup=ROOT/data['backup']
 for name in reversed(data['entries']):
  saved=backup/name
  if saved.exists():
   live=ROOT/name
   if live.is_dir():shutil.rmtree(live)
   elif live.exists():live.unlink()
   os.replace(saved,live)
  elif name in data.get('new_entries',[]):
   live=ROOT/name
   if live.is_dir():shutil.rmtree(live)
   elif live.exists():live.unlink()
 journal.unlink();write_json(CACHE/'result.json',{'ok':False,'message':'Незавершённое обновление отменено. Восстановлена предыдущая версия'})
def apply():
 CACHE.mkdir(parents=True,exist_ok=True)
 if not (CACHE/'pending.json').exists() and not (CACHE/'transaction.json').exists():return {'message':'Нет загруженного обновления'}
 handles=closed_profiles()
 try:
  journal=CACHE/'transaction.json'
  if journal.exists():rollback(journal)
  pending=CACHE/'pending.json'
  if not pending.exists():return {'message':'Нет загруженного обновления'}
  info=json.loads(pending.read_text());staged=CACHE/'staged';validate(staged,info['version'])
  if version(info['version'])<=version(current()):fail('Установка старой версии отменена')
  entries=sorted(p.name for p in staged.iterdir())
  if not set(entries).issubset(ENTRIES):fail('Неизвестные файлы в обновлении')
  backup=ROOT/'backups'/('release-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S-%f'));backup.mkdir(parents=True)
  write_json(journal,{'backup':str(backup.relative_to(ROOT)),'entries':entries,'new_entries':[n for n in entries if not (ROOT/n).exists()]})
  try:
   for name in entries:
    if (ROOT/name).exists():os.replace(ROOT/name,backup/name)
    os.replace(staged/name,ROOT/name)
   journal.unlink()
  except:
   rollback(journal);raise
  pending.unlink();shutil.rmtree(staged);write_json(CACHE/'result.json',{'ok':True,'version':info['version'],'message':'Обновлено до '+info['version']})
  return {'ok':True,'version':info['version'],'message':'Обновление установлено'}
 finally:
  for h in handles:h.close()
def status():
 result={'current':current(),'staged':False}
 for name in ['result','pending']:
  p=CACHE/(name+'.json')
  if p.exists():result.update(json.loads(p.read_text()))
 return result
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('command',choices=['check','download','apply','status']);parser.add_argument('--repo');args=parser.parse_args()
 try:
  if args.command!='status':
   CACHE.mkdir(parents=True,exist_ok=True)
   with open(CACHE/'updater.lock','a') as lock:
    try:fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
    except OSError:fail('Обновление уже выполняется в другом окне')
    result=check(args.repo) if args.command=='check' else stage(args.repo) if args.command=='download' else apply()
  else:result=status()
  print(json.dumps(result,ensure_ascii=False))
 except Exception as e:
  if args.command=='apply':write_json(CACHE/'result.json',{'ok':False,'message':str(e)})
  print(json.dumps({'error':str(e)},ensure_ascii=False));sys.exit(1)
