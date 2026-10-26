#!/usr/bin/env python3
# SPDX-License-Identifier: MPL-2.0
from pathlib import Path
import argparse,hashlib,json,shutil,tarfile,urllib.request
ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--cache',type=Path,default=ROOT/'build/upstream');args=p.parse_args();args.cache.mkdir(parents=True,exist_ok=True)
meta=json.loads((ROOT/'BUILD.json').read_text())
def download(url,path,digest):
 if not path.exists():
  with urllib.request.urlopen(url,timeout=60) as src,path.open('wb') as dst:shutil.copyfileobj(src,dst)
 sha=hashlib.sha512()
 with path.open('rb') as f:
  while chunk:=f.read(1024*1024):sha.update(chunk)
 if sha.hexdigest()!=digest:raise SystemExit('SHA-512 mismatch: '+path.name)
archive=args.cache/'firefox.tar.xz';download(meta['firefox_binary_url'],archive,meta['firefox_binary_sha512'])
if not (args.cache/'firefox').exists():
 with tarfile.open(archive) as t:t.extractall(args.cache,filter='data')
lang=args.cache/'ru.xpi';download('https://archive.mozilla.org/pub/firefox/releases/'+meta['firefox_version']+'/linux-x86_64/xpi/ru.xpi',lang,meta['ru_langpack_sha512'])
addons=args.cache/'firefox/browser/extensions';addons.mkdir(parents=True,exist_ok=True);shutil.copy2(lang,addons/'langpack-ru@firefox.mozilla.org.xpi')
print(args.cache/'firefox')
