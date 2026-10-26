#!/usr/bin/env python3
# SPDX-License-Identifier: MPL-2.0
"""Patch presentation resources only. Engine identifiers and update/security code stay intact."""
from pathlib import Path
import base64,os,re,struct,sys,zipfile
ROOT=Path(__file__).resolve().parent

def brand(runtime):
 runtime=Path(runtime)
 encoded=base64.b64encode((ROOT/'assets/kamputa.png').read_bytes()).decode()
 logo_svg=('<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><image width="128" height="128" href="data:image/png;base64,'+encoded+'"/></svg>').encode()
 wordmark=b'<svg xmlns="http://www.w3.org/2000/svg" width="270" height="50" viewBox="0 0 270 50"><text x="0" y="36" font-family="sans-serif" font-size="32" fill="context-fill #e2e2ea">kamputa browser</text></svg>'
 def png(size):
  path=ROOT/f'assets/app-icon-{size}.png'
  return (path if path.exists() else ROOT/'assets/app-icon-128.png').read_bytes()
 count=0
 for archive in [runtime/'browser/omni.ja',runtime/'omni.ja']:
  temp=archive.with_name(archive.name+'.kamputa-next')
  with zipfile.ZipFile(archive) as source,zipfile.ZipFile(temp,'w',compression=zipfile.ZIP_DEFLATED) as target:
   for entry in source.infolist():
    data=source.read(entry.filename);name=entry.filename;updated=False
    if '/branding/' in name and name.endswith(('.ftl','.properties','.dtd')):
     text=data.decode('utf-8');ru='/ru/' in name or '/ru-' in name
     label='kamputa браузер' if ru else 'kamputa browser'
     # Only brand resource values, never Fluent identifiers or external-source import labels.
     if name.endswith('.ftl'):
      lines=[]
      for line in text.splitlines():
       if line.startswith(('-brand-',)) and '=' in line:line=line.split('=',1)[0]+'= '+label
       if line.startswith('-vendor-short-name') and '=' in line:line='-vendor-short-name = Mozilla'
       lines.append(line)
      text='\n'.join(lines)+'\n'
     elif name.endswith('.properties'):
      text=re.sub(r'(?m)^(brand\w+Name)=.*$',lambda m:m[1]+'='+label,text)
     else:
      text=text.replace('Mozilla Firefox',label).replace('Firefox',label)
     data=text.encode();updated=True
    # Literal in URL-bar group title (other names use the brand Fluent terms).
    elif name.endswith('.ftl') and ('/browser/' in name or '/toolkit/' in name):
     text=data.decode('utf-8');fixed=re.sub(r'(?m)^(urlbar-group-firefox-suggest\s*=).*$',r'\1 Firefox Suggest',text)
     if fixed!=text:data=fixed.encode();updated=True
    if name.endswith(('/sidebar/firefox.svg','/preferences/fox-ai.svg','/br-set-default-fox-heart.svg')):
     data=logo_svg;updated=True
    if name.startswith('chrome/browser/content/branding'):
     leaf=Path(name).name
     if leaf in ['about-logo.svg']:data=logo_svg;updated=True
     elif leaf in ['about-wordmark.svg','firefox-wordmark.svg']:data=wordmark;updated=True
     elif leaf.endswith('.png') and (leaf.startswith(('icon','about-logo')) or leaf=='about.png'):
      try:size=struct.unpack('>I',data[16:20])[0]
      except Exception:size=128
      data=png(size);updated=True
    # Native GTK/X11 application icons can also be archived.
    if name.endswith('.png') and ('icons/default/' in name or name.endswith('/mozicon128.png')):
     try:size=struct.unpack('>I',data[16:20])[0]
     except Exception:size=128
     data=png(size);updated=True
    if updated:count+=1
    target.writestr(entry,data)
  os.chmod(temp,archive.stat().st_mode & 0o777);os.replace(temp,archive)
 for directory in [runtime/'browser/chrome/icons/default',runtime/'chrome/icons/default']:
  directory.mkdir(parents=True,exist_ok=True)
  for size in [16,32,48,64,128]:
   (directory/f'default{size}.png').write_bytes(png(size))
  (directory/'default.png').write_bytes(png(128))
 # Some Linux builds look up this icon directly outside omni.ja.
 (runtime/'browser/icons').mkdir(parents=True,exist_ok=True);(runtime/'browser/icons/mozicon128.png').write_bytes(png(128))
 print('Rebranded presentation resources:',count)

if __name__=='__main__':brand(sys.argv[1])
