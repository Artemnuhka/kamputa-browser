#!/usr/bin/env python3
# SPDX-License-Identifier: MPL-2.0
import pathlib,fcntl,json,datetime,os,runpy
root=pathlib.Path(__file__).resolve().parent
next_runtime=root/'runtime-next';current=root/'runtime'
if not (next_runtime/'kamputa.cfg').exists():raise SystemExit('Сначала собери runtime-next')
handles=runpy.run_path(str(root/'update.py'))['closed_profiles']()
p=next_runtime/'distribution/policies.json';policies=json.loads(p.read_text());policies['policies']['ExtensionSettings']['uBlock0@raymondhill.net']['install_url']=(current/'distribution/ublock-origin.xpi').as_uri();p.write_text(json.dumps(policies,indent=2)+'\n')
backup=root/('runtime-previous-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S'))
os.rename(current,backup)
try:os.rename(next_runtime,current)
except Exception:os.rename(backup,current);raise
print('Runtime обновлён. Предыдущая версия:',backup)
