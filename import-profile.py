#!/usr/bin/env python3
# SPDX-License-Identifier: MPL-2.0
"""Apply a user-selected Firefox import with both browsers closed.
Only data is copied; Firefox settings, telemetry prefs and extensions are excluded.
"""
import datetime,fcntl,json,pathlib,shutil,sqlite3,sys,os

def apply(profile):
 profile=pathlib.Path(profile).resolve();pending=profile/'kamputa-import.json'
 if not pending.exists():return
 request=json.loads(pending.read_text());source=pathlib.Path(request['source']).resolve()
 try:
  if source==profile or source in profile.parents or profile in source.parents:raise ValueError('Нужен другой профиль Firefox')
  if not (source/'places.sqlite').is_file():raise ValueError('В выбранной папке нет places.sqlite')
  # Firefox uses a POSIX record lock on .parentlock on Linux.
  handles=[]
  for directory in [source,profile]:
   lock=directory/'.parentlock'
   if lock.exists():
    h=lock.open('r+');fcntl.lockf(h,fcntl.LOCK_EX|fcntl.LOCK_NB);handles.append(h)
  backup=profile/('backups/before-firefox-import-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S-%f'))
  backup.mkdir(parents=True,mode=0o700)
  stage=backup/'incoming';stage.mkdir(mode=0o700)
  names=[]
  for name in ['places.sqlite','favicons.sqlite','logins.json','key4.db','cert9.db']:
   src=source/name
   if not src.is_file():continue
   dst=stage/name
   if name.endswith(('.sqlite','.db')):
    with sqlite3.connect(src.as_uri()+'?mode=ro',uri=True) as db,sqlite3.connect(dst) as target:
     if hasattr(db,"backup"):db.backup(target)
     else:
      db.execute("BEGIN")
      for statement in db.iterdump():target.execute(statement)
     if target.execute('PRAGMA quick_check').fetchone()[0]!='ok':raise ValueError('Ошибка проверки '+name)
   else:
    json.loads(src.read_text());shutil.copy2(src,dst)
   os.chmod(dst,0o600);names.append(name)
  # Record rollback plan before replacing anything.
  (backup/'manifest.json').write_text(json.dumps({'source':str(source),'files':names},ensure_ascii=False))
  replaced=[]
  try:
   for name in names:
    dst=profile/name
    if dst.exists():shutil.copy2(dst,backup/name)
    for suffix in ['-wal','-shm']:
     side=profile/(name+suffix)
     if side.exists():shutil.move(side,backup/(name+suffix))
    os.replace(stage/name,dst);replaced.append(name)
  except Exception:
   for name in replaced:
    old=backup/name
    if old.exists():shutil.copy2(old,profile/name)
    elif (profile/name).exists():(profile/name).unlink()
   raise
  result={'ok':True,'message':'Импорт Firefox завершён: закладки, история и доступные пароли.','backup':str(backup),'files':names}
 except Exception as error:
  result={'ok':False,'message':'Импорт Firefox не выполнен. Закрой исходный Firefox и выбери папку профиля снова. '+str(error)}
 finally:
  for h in locals().get('handles',[]):h.close()
 (profile/'kamputa-import-result.json').write_text(json.dumps(result,ensure_ascii=False));pending.unlink()
 print(result['message'])
if __name__=='__main__':apply(sys.argv[1])
