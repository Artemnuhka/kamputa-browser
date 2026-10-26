# kamputa browser

Firefox-based browser for Linux with a compact Chromium / Helium inspired interface and a local pixel pet. This is a repack of the official Mozilla runtime with published interface customizations, not a separately compiled Gecko engine. It is an independent project, not endorsed by Mozilla.

## Install

Download the package for your system from [Releases](https://github.com/Artemnuhka/kamputa-browser/releases):

- **RPM (x86_64):** Fedora and openSUSE. Install through your package manager, which resolves the shared-library dependencies.
- **DEB (amd64):** Debian / Ubuntu. Use `sudo apt install ./kamputa-browser_0.5.1_amd64.deb`.
- **AppImage (x86_64):** make it executable, then run it. If FUSE is unavailable, use `./kamputa-browser-0.5.1-x86_64.AppImage --appimage-extract-and-run`.

Python 3, Bash, GTK 3, DBus and the usual desktop/audio libraries are required. These are declared as RPM / DEB dependencies; AppImage users need them installed. The official runtime uses glibc 2.17 symbols; the packages target desktop distributions with glibc 2.28 or later. This release is Linux x86_64 only.

The immutable package payload deploys a private application copy under `$XDG_DATA_HOME/kamputa-browser/application` (default `~/.local/share/kamputa-browser/application`). This allows in-browser updates without running the browser as root. Profiles live separately under `$XDG_CONFIG_HOME/kamputa-browser/profile`. The initial deployment requires about 350 MB of additional disk space. Package upgrades do not downgrade a newer in-browser update.

## Features

- Compact dark tabs and toolbar; classic layout is also available.
- Native Firefox themes with presets and custom colors; Russian and English Kamputa strings follow the browser language.
- First-run import, search, theme, optional Mozilla login and password-manager choices; the pet introduction requires a name.
- A local pet with feeding, play, sleep, walking and laptop animations. Its state stays in the profile; it does not read websites or browsing history.
- Optional suggestions to deactivate inactive, memory-heavy tabs; memory values are estimates. Active, pinned and private tabs, media and calls are protected.
- Signed, unmodified uBlock Origin included. Telemetry, studies and sponsored suggestions are disabled through policies. This does not claim to remove all Mozilla network services: Safe Browsing, extension updates, search and optional account sync may still use the network.
- Updates from this repository's stable GitHub Releases. Daily checking is opt-in; downloads and installation require user actions. Packages are verified against manifest size and SHA-256. The trust root is HTTPS plus this repository; there is no separate developer signing key yet.

Settings are part of `about:preferences`: Appearance, Tabs and browsing, and a separate Updates section. The pet menu opens from the top toolbar. Engine updates are delivered as part of Kamputa releases, not by the system Firefox package or Mozilla's built-in updater.

## Build from source

Build requirements: Python 3.12 or newer, Bash, `rpmbuild`, `dpkg-deb`, `mksquashfs`, and an official `appimagetool` executable for AppImage generation.

```sh
python3 packaging/fetch-upstream.py --cache build/upstream
python3 build.py --firefox build/upstream/firefox
python3 packaging/build-packages.py --appimagetool /path/to/appimagetool.AppImage --runtime-file /path/to/runtime-x86_64
```

The AppImage tool and runtime downloads are pinned by SHA-256 in `packaging/TOOLCHAIN.json`; the packager rejects other binaries.

`BUILD.json` pins the exact Firefox, Russian language pack and uBlock versions and checksums. The build scripts normalize Mozilla's optimized JAR layout for standard Python ZIP tooling, regenerate branding overrides, and preserve the engine's legal notices. They do not compile Gecko. To build Gecko itself, use the exact upstream source and revision listed in [SOURCE-CODE.md](SOURCE-CODE.md).

The source release contains Kamputa code, assets, localization overrides, packaging scripts and licenses. It excludes developer test harnesses, test profiles, caches, browsing data and local logs. Build outputs are not committed to Git.

## License and source availability

Kamputa's original code, build scripts, documentation and project assets are offered under [MPL 2.0](LICENSE). Existing upstream copyright and license notices are preserved. Third-party code keeps its own licenses: Mozilla / Gecko components, Apache-2.0 Material Color Utilities, GPL-3.0-or-later uBlock Origin, and AppImage runtime components. See [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) and [SOURCE-CODE.md](SOURCE-CODE.md).

Firefox source availability is provided by the version-specific official Mozilla archive linked in SOURCE-CODE.md, with the source SHA-512 recorded in BUILD.json. All Kamputa modifications and their preferred source forms are in this repository. Mozilla and Firefox names are used to identify the underlying engine and services; their trademarks are not granted by the MPL.
