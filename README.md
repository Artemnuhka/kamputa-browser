<p align="center">
  <a href="README.md"><img src="https://img.shields.io/badge/English-aebee8?style=for-the-badge" alt="English"></a>
  <a href="README.ru.md"><img src="https://img.shields.io/badge/%D0%A0%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9-383b44?style=for-the-badge" alt="Русский"></a>
</p>

<p align="center">
  <img src="assets/app-icon-256.png" width="112" height="112" alt="kamputa browser logo">
</p>

<h1 align="center">kamputa browser</h1>

<p align="center"><strong>Firefox-based browser for Linux with a compact Chromium / Helium inspired interface and a local pixel pet.</strong></p>

<p align="center">This is a repack of the official Mozilla runtime with published interface customizations, not a separately compiled Gecko engine. It is an independent project, not endorsed by Mozilla.</p>

<p align="center">
  <img src="https://img.shields.io/badge/Linux%20%C2%B7%20x86_64-383b44?style=for-the-badge" alt="Linux x86_64">
  <a href="LICENSE"><img src="https://img.shields.io/badge/MPL%202.0-383b44?style=for-the-badge" alt="MPL 2.0"></a>
</p>

<p align="center">
  <a href="https://github.com/Artemnuhka/kamputa-browser/releases/latest"><img src="https://img.shields.io/badge/Download%20browser-aebee8?style=for-the-badge" alt="Download browser"></a>
</p>

<p align="center">
  <a href="#features">Features</a> · <a href="#build">Build</a> · <a href="#license">License</a>
</p>

---

## Install

Download the package for your system from [Releases](https://github.com/Artemnuhka/kamputa-browser/releases):

- **[RPM](https://github.com/Artemnuhka/kamputa-browser/releases/download/v0.7.0/kamputa-browser-0.7.0-1.x86_64.rpm) (x86_64):** Fedora and openSUSE. Install through your package manager, which resolves the shared-library dependencies.
- **[DEB](https://github.com/Artemnuhka/kamputa-browser/releases/download/v0.7.0/kamputa-browser_0.7.0_amd64.deb) (amd64):** Debian / Ubuntu. Use `sudo apt install ./kamputa-browser_0.7.0_amd64.deb`.
- **[AppImage](https://github.com/Artemnuhka/kamputa-browser/releases/download/v0.7.0/kamputa-browser-0.7.0-x86_64.AppImage) (x86_64):** make it executable, then run it. If FUSE is unavailable, use `./kamputa-browser-0.7.0-x86_64.AppImage --appimage-extract-and-run`.

**Dependencies:**

- Python 3
- Bash
- GTK 3
- DBus

<a id="features"></a>

## Features

- **Interface.** Compact dark tabs and toolbar; classic layout is also available.
- **Themes and palettes.** Native Firefox themes with presets and custom colors; Russian and English Kamputa strings follow the browser language.
- **First run.** First-run import, search, theme, optional Mozilla login and password-manager choices; the pet introduction requires a name.
- **Your pet.** A local Tamagotchi companion: hunger, energy, mood, grooming and friendship; two interactive games, daily care rewards, rooms, decorations, a journal and achievements. Existing names and progress carry over. Its state stays in the profile; it does not read websites or browsing history.
- **Memory saving.** Optional suggestions to deactivate inactive, memory-heavy tabs; memory values are estimates. Active, pinned and private tabs, media and calls are protected.
- **Privacy and ad blocking.** Signed, unmodified uBlock Origin included. Telemetry, studies and sponsored suggestions are disabled through policies. This does not claim to remove all Mozilla network services: Safe Browsing, extension updates, search and optional account sync may still use the network.
- **Updates.** Updates from this repository's stable GitHub Releases. Daily checking is opt-in; downloads and installation require user actions. Packages are verified against manifest size and SHA-256. The trust root is HTTPS plus this repository; there is no separate developer signing key yet.

<a id="build"></a>

## Build from source

<details>
<summary>Build instructions and requirements</summary>

Build requirements: Python 3.12 or newer, Bash, `rpmbuild`, `dpkg-deb`, `mksquashfs`, and an official `appimagetool` executable for AppImage generation.

```sh
python3 packaging/fetch-upstream.py --cache build/upstream
python3 build.py --firefox build/upstream/firefox
python3 packaging/build-packages.py --appimagetool /path/to/appimagetool.AppImage --runtime-file /path/to/runtime-x86_64
```

The AppImage tool and runtime downloads are pinned by SHA-256 in `packaging/TOOLCHAIN.json`; the packager rejects other binaries.

`BUILD.json` pins the exact Firefox, Russian language pack and uBlock versions and checksums. The build scripts normalize Mozilla's optimized JAR layout for standard Python ZIP tooling, regenerate branding overrides, and preserve the engine's legal notices. They do not compile Gecko. To build Gecko itself, use the exact upstream source and revision listed in [SOURCE-CODE.md](SOURCE-CODE.md).

</details>

<a id="license"></a>

## License and source availability

Kamputa's original code, build scripts, documentation and project assets are offered under [MPL 2.0](LICENSE). Existing upstream copyright and license notices are preserved. Third-party code keeps its own licenses: Mozilla / Gecko components, Apache-2.0 Material Color Utilities, GPL-3.0-or-later uBlock Origin, and AppImage runtime components. See [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) and [SOURCE-CODE.md](SOURCE-CODE.md).

Firefox source availability is provided by the version-specific official Mozilla archive linked in SOURCE-CODE.md, with the source SHA-512 recorded in BUILD.json. All Kamputa modifications and their preferred source forms are in this repository. Mozilla and Firefox names are used to identify the underlying engine and services; their trademarks are not granted by the MPL.
