#!/usr/bin/env python3
# SPDX-License-Identifier: MPL-2.0
"""Build one cross-distro RPM, a DEB and a type-2 AppImage from the same payload."""
from pathlib import Path
import argparse,hashlib,json,os,shutil,subprocess,tarfile
ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--appimagetool',required=True,type=Path);p.add_argument('--runtime-file',required=True,type=Path);p.add_argument('--output',type=Path,default=ROOT/'dist');args=p.parse_args()
toolchain=json.loads((ROOT/'packaging/TOOLCHAIN.json').read_text())
for path,key in [(args.appimagetool,'appimagetool_sha256'),(args.runtime_file,'runtime_sha256')]:
 if hashlib.sha256(path.read_bytes()).hexdigest()!=toolchain[key]:raise SystemExit('Unexpected AppImage tool/runtime checksum')
OUT=args.output.resolve();OUT.mkdir(parents=True,exist_ok=True);BUILD=ROOT/'build/packages';BUILD.mkdir(parents=True,exist_ok=True)
VERSION=json.loads((ROOT/'BUILD.json').read_text())['kamputa_version']
FILES=['runtime','src','assets','vendor','packaging','kamputa','build.py','brand-runtime.py','prepare-locales.py','normalize-jars.py','configure-runtime.py','import-profile.py','switch-runtime.py','update.py','build-release.py','BUILD.json','README.md','LICENSE','THIRD-PARTY-NOTICES.md','SOURCE-CODE.md','licenses']
PAYLOAD=BUILD/'payload'
if PAYLOAD.exists():shutil.rmtree(PAYLOAD)
PAYLOAD.mkdir()
for name in FILES:
 src=ROOT/name;dst=PAYLOAD/name
 if src.is_dir():shutil.copytree(src,dst,symlinks=False,ignore=shutil.ignore_patterns('__pycache__','*.pyc'))
 else:shutil.copy2(src,dst)
# Resolve paths at first launch, never publish a build-host path.
policy=PAYLOAD/'runtime/distribution/policies.json';data=json.loads(policy.read_text());data['policies']['DisableAppUpdate']=True;data['policies']['ExtensionSettings']['uBlock0@raymondhill.net']['install_url']='file:///kamputa-browser/runtime/distribution/ublock-origin.xpi';policy.write_text(json.dumps(data,indent=2)+'\n')
for f in PAYLOAD.rglob('*'):
 if f.is_dir():f.chmod(0o755)
 elif f.is_file():f.chmod(0o755 if f.stat().st_mode&0o111 else 0o644)
def layout(dest):
 if dest.exists():shutil.rmtree(dest)
 (dest/'opt').mkdir(parents=True);shutil.copytree(PAYLOAD,dest/'opt/kamputa-browser',symlinks=False)
 (dest/'usr/bin').mkdir(parents=True);shutil.copy2(ROOT/'packaging/kamputa-browser',dest/'usr/bin/kamputa-browser')
 (dest/'usr/share/applications').mkdir(parents=True);shutil.copy2(ROOT/'Kamputa.desktop',dest/'usr/share/applications/kamputa-browser.desktop')
 for size in [16,32,48,64,128,256,512]:
  icon=dest/f'usr/share/icons/hicolor/{size}x{size}/apps';icon.mkdir(parents=True);shutil.copy2(ROOT/f'assets/app-icon-{size}.png',icon/'kamputa-browser.png')
 docs=dest/'usr/share/doc/kamputa-browser';docs.mkdir(parents=True);shutil.copy2(ROOT/'SOURCE-CODE.md',docs/'SOURCE-CODE.md');shutil.copy2(ROOT/'THIRD-PARTY-NOTICES.md',docs/'THIRD-PARTY-NOTICES.md');shutil.copy2(ROOT/'LICENSE',docs/'LICENSE')
 return dest
DEB=layout(BUILD/'deb');(DEB/'DEBIAN').mkdir()
(DEB/'DEBIAN/control').write_text(f'''Package: kamputa-browser
Version: {VERSION}
Section: web
Priority: optional
Architecture: amd64
Maintainer: kamputa browser contributors <212835541+Artemnuhka@users.noreply.github.com>
Installed-Size: {sum(x.stat().st_size for x in DEB.rglob('*') if x.is_file())//1024}
Depends: python3, bash, ca-certificates, libc6 (>= 2.28), libstdc++6, libgtk-3-0 (>= 3.14) | libgtk-3-0t64, libdbus-1-3, libx11-6, libx11-xcb1, libxcomposite1, libxdamage1, libxext6, libxfixes3, libxrandr2, libxtst6, libxcb1, libasound2 | libasound2t64, libglib2.0-0 | libglib2.0-0t64
Homepage: https://github.com/Artemnuhka/kamputa-browser
Description: Firefox-based browser with a compact interface and pixel companion
 Independent browser repack with native themes, disabled telemetry,
 signed uBlock Origin and a local pet. See SOURCE-CODE.md for source availability.
''')
subprocess.run(['dpkg-deb','--root-owner-group','-Zxz','-z6','--build',str(DEB),str(OUT/f'kamputa-browser_{VERSION}_amd64.deb')],check=True)
RPMROOT=BUILD/'rpm';(RPMROOT/'SPECS').mkdir(parents=True,exist_ok=True);RPMFS=layout(BUILD/'rpm-files')
spec=RPMROOT/'SPECS/kamputa-browser.spec';spec.write_text(f'''Name: kamputa-browser
Version: {VERSION}
Release: 1
Summary: Firefox-based browser with a compact interface and pixel companion
License: MPL-2.0 AND Apache-2.0 AND GPL-3.0-or-later AND MIT
URL: https://github.com/Artemnuhka/kamputa-browser
BuildArch: x86_64
AutoReqProv: no
Requires: /usr/bin/python3
Requires: python3
Requires: /bin/bash
Requires: ca-certificates
Requires: libc.so.6(GLIBC_2.28)(64bit)
Requires: libstdc++.so.6()(64bit)
Requires: libgtk-3.so.0()(64bit)
Requires: libdbus-1.so.3()(64bit)
Requires: libX11.so.6()(64bit)
Requires: libX11-xcb.so.1()(64bit)
Requires: libXcomposite.so.1()(64bit)
Requires: libXdamage.so.1()(64bit)
Requires: libXfixes.so.3()(64bit)
Requires: libXrandr.so.2()(64bit)
Requires: libXtst.so.6()(64bit)
Requires: libasound.so.2()(64bit)
Requires: libxcb.so.1()(64bit)
%description
Independent browser repack using the official Mozilla runtime. The same RPM
uses shared-library dependencies available on Fedora and openSUSE.
Source availability and third-party notices are installed with the application.
%prep
%build
%install
mkdir -p %{{buildroot}}
cp -a {RPMFS}/. %{{buildroot}}/
%files
%defattr(-,root,root)
/opt/kamputa-browser
/usr/bin/kamputa-browser
/usr/share/applications/kamputa-browser.desktop
/usr/share/icons/hicolor/*/apps/kamputa-browser.png
/usr/share/doc/kamputa-browser
''')
subprocess.run(['rpmbuild','-bb',str(spec),'--define',f'_topdir {RPMROOT}','--define','_build_id_links none','--define','__os_install_post %{nil}','--define','_binary_payload w6.gzdio','--define','use_source_date_epoch_as_buildtime 1','--define','_buildhost reproducible.invalid'],check=True)
for f in (RPMROOT/'RPMS').rglob(f'kamputa-browser-{VERSION}-*.rpm'):shutil.copy2(f,OUT/f.name)
APPDIR=layout(BUILD/'kamputa-browser.AppDir');shutil.copy2(ROOT/'packaging/AppRun',APPDIR/'AppRun');shutil.copy2(ROOT/'Kamputa.desktop',APPDIR/'kamputa-browser.desktop');shutil.copy2(ROOT/'assets/app-icon-256.png',APPDIR/'kamputa-browser.png');(APPDIR/'.DirIcon').symlink_to('kamputa-browser.png')
env=os.environ.copy();env['ARCH']='x86_64';env['APPIMAGE_EXTRACT_AND_RUN']='1';env['APPIMAGELAUNCHER_DISABLE']='1';env['SOURCE_DATE_EPOCH']='1792972800'
for key in ['APPIMAGE','APPDIR','OWD','ARGV0']:env.pop(key,None)
subprocess.run([str(args.appimagetool.resolve()),'--runtime-file',str(args.runtime_file.resolve()),'--mksquashfs-opt','-no-xattrs',str(APPDIR),str(OUT/f'kamputa-browser-{VERSION}-x86_64.AppImage')],env=env,check=True)
# Portable updater package; no user or build directories enter this archive.
name=f'kamputa-browser-{VERSION}-linux-x86_64.tar.xz';archive=OUT/name
def public_metadata(info):
 info.uid=info.gid=0;info.uname=info.gname='root';info.mtime=1792972800;return info
with tarfile.open(archive,'w:xz',dereference=True,preset=6) as t:
 for f in sorted(PAYLOAD.iterdir()):t.add(f,arcname='kamputa-browser/'+f.name,filter=public_metadata)
sha=hashlib.sha256(archive.read_bytes()).hexdigest();(OUT/'kamputa-update.json').write_text(json.dumps({'schema':1,'app_id':'kamputa-browser','version':VERSION,'platforms':{'linux-x86_64':{'asset':name,'size':archive.stat().st_size,'sha256':sha}}},indent=2)+'\n')
print('Built packages:',OUT)
