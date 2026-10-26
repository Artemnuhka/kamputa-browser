# SPDX-License-Identifier: MPL-2.0
from pathlib import Path
import zipfile,re,json,sys
root=Path(__file__).resolve().parent;runtime=Path(sys.argv[1]) if len(sys.argv)>1 else root/'runtime';out=root/'src/locales';files={}
def collect(z,locale,prefix):
 for n in z.namelist():
  if not n.startswith(prefix) or not n.endswith('.ftl'):continue
  path=n[len(prefix):]
  if path.startswith('browser/preferences/') or path in ['browser/browser.ftl','browser/aboutDialog.ftl']:
   text=z.read(n).decode()
   if 'Firefox' in text:
    label='kamputa браузер' if locale.startswith('ru') else 'kamputa browser'
    # Keep names of Mozilla services, companion apps and mobile browsers intact.
    chunks=re.split(r'(?m)(?=^[a-zA-Z][a-zA-Z0-9-]*\s*=)',text)
    def product(chunk):
     if re.search(r'Firefox (?:Labs|View|Relay|Monitor|Focus|Send|Screenshots|Suggest|Private Network)|Mozilla VPN|^sync-mobile-promo',chunk):return chunk
     return chunk.replace('Mozilla Firefox',label).replace('Firefox',label)
    files[(locale,path)]=''.join(map(product,chunks))
with zipfile.ZipFile(runtime/'browser/omni.ja') as z:collect(z,'en-US','localization/en-US/')
for p in (runtime/'browser/extensions').glob('langpack-*.xpi'):
 with zipfile.ZipFile(p) as z:
  for n in z.namelist():
   if n.endswith('/branding/brand.ftl'):
    locale=n.split('/localization/')[1].split('/')[0];collect(z,locale,n.split('/localization/')[0]+'/localization/'+locale+'/')
for locale in [p.name for p in out.iterdir() if p.is_dir()]:
 label='kamputa браузер' if locale.startswith('ru') else 'kamputa browser'
 files[(locale,'branding/brand.ftl')]='\n'.join(f'{k} = {label}' for k in ['-brand-shorter-name','-brand-short-name','-brand-shortcut-name','-brand-full-name','-brand-product-name'])+'\n-vendor-short-name = Mozilla\n'
 files[(locale,'branding/brand.properties')]='\n'.join(k+'='+label for k in ['brandShortName','brandShorterName','brandFullName'])+'\n'
for (locale,name),text in files.items():
 p=out/locale/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(text)
print('Localized product resource overrides:',len(files))
index={}
for p in out.rglob('*.ftl'):
 locale=p.relative_to(out).parts[0];index.setdefault(locale,[]).append('/'.join(p.relative_to(out).parts[1:]))
(root/'src/locales-index.sys.mjs').write_text('export const LOCALES='+json.dumps(index,ensure_ascii=False)+';\n')
