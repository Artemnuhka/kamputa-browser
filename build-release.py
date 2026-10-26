#!/usr/bin/env python3
# SPDX-License-Identifier: MPL-2.0
"""Package the already-built Linux distribution for GitHub Releases."""
from pathlib import Path
import argparse,hashlib,importlib.util,json,platform,tarfile
root=Path(__file__).resolve().parent
p=argparse.ArgumentParser();p.add_argument('--output',type=Path,default=root/'dist');args=p.parse_args()
spec=importlib.util.spec_from_file_location('updater',root/'update.py');updater=importlib.util.module_from_spec(spec);spec.loader.exec_module(updater)
version=json.loads((root/'BUILD.json').read_text())['kamputa_version'];updater.version(version)
arch=platform.machine()
if arch not in ['x86_64','aarch64']:raise SystemExit('Unsupported architecture')
args.output.mkdir(parents=True,exist_ok=True);name=f'kamputa-browser-{version}-linux-{arch}.tar.xz';dest=args.output/name
def public_metadata(info):
 info.uid=info.gid=0;info.uname=info.gname='root';return info
with tarfile.open(dest,'w:xz',dereference=True) as archive:
 for entry in sorted(updater.ENTRIES):
  if (root/entry).exists():archive.add(root/entry,arcname='kamputa-browser/'+entry,filter=public_metadata)
sha=hashlib.sha256()
with dest.open('rb') as f:
 while chunk:=f.read(1024*1024):sha.update(chunk)
manifest={'schema':1,'app_id':'kamputa-browser','version':version,'platforms':{'linux-'+arch:{'asset':name,'size':dest.stat().st_size,'sha256':sha.hexdigest()}}}
(args.output/'kamputa-update.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(dest);print(args.output/'kamputa-update.json')
