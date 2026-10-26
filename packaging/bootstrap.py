#!/usr/bin/env python3
# SPDX-License-Identifier: MPL-2.0
"""Deploy immutable RPM/DEB/AppImage payloads into a private, updateable app copy."""
from pathlib import Path
import fcntl,json,os,re,shutil,sys,tempfile

def version(root):
 try:return tuple(int(n) for n in json.loads((root/'BUILD.json').read_text())['kamputa_version'].split('.'))
 except (FileNotFoundError,KeyError,ValueError):return (0,)
def main():
 base=Path(sys.argv[1]).resolve();data=Path(os.environ.get('XDG_DATA_HOME',str(Path.home()/'.local/share')))/'kamputa-browser';data.mkdir(parents=True,exist_ok=True,mode=0o700)
 config=Path(os.environ.get('XDG_CONFIG_HOME',str(Path.home()/'.config')))/'kamputa-browser/profile';config.mkdir(parents=True,exist_ok=True,mode=0o700)
 app=data/'application';old=data/'application-previous'
 with (data/'deployment.lock').open('a') as lock:
  fcntl.flock(lock,fcntl.LOCK_EX)
  if not app.exists() and old.exists():old.rename(app)
  if version(base)>version(app):
   profile_lock=(config/'.parentlock').open('a+')
   try:
    fcntl.lockf(profile_lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
   except OSError:
    if not app.exists():raise SystemExit('Close other kamputa browser windows and try again.')
   else:
    tmp=Path(tempfile.mkdtemp(prefix='application-next-',dir=data))
    try:
     tmp.rmdir();shutil.copytree(base,tmp,symlinks=False)
     if old.exists():shutil.rmtree(old)
     if app.exists():app.rename(old)
     try:tmp.rename(app)
     except Exception:
      if not app.exists() and old.exists():old.rename(app)
      raise
    finally:
     if tmp.exists():shutil.rmtree(tmp)
   finally:profile_lock.close()
 env=os.environ.copy();env.setdefault('KAMPUTA_PROFILE',str(config));os.execve(str(app/'kamputa'),[str(app/'kamputa'),*sys.argv[2:]],env)
if __name__=='__main__':main()
