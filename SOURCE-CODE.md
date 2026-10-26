# Corresponding source and modifications

## kamputa browser 0.5.2

All Kamputa modifications are available in preferred source form under MPL 2.0 at:
https://github.com/Artemnuhka/kamputa-browser/tree/v0.5.2

The release also includes `kamputa-browser-0.5.2-source.tar.xz`. Source files are not minified. `src/` contains the privileged browser UI and localization modifications. `assets/` contains the original project PNG / SVG resources used to generate branding; `brand-runtime.py`, `normalize-jars.py`, `prepare-locales.py`, `build.py` and `packaging/` describe the transformations and packaging. No developer profiles or local test harnesses are included.

## Mozilla Firefox / Gecko 158.0.1

The engine executables are the unmodified official Mozilla Linux x86_64 binaries. No openSUSE engine build or distro-specific binary patch is distributed. The presentation archives are modified by the published scripts and localization overrides.

Exact upstream source (MPL 2.0 and the component licenses included there):
https://archive.mozilla.org/pub/firefox/releases/158.0.1/source/firefox-158.0.1.source.tar.xz

Exact source revision: `48a735cc74a7e6d730f9bf59c3de58f750287a23` in Mozilla's release repository. `BUILD.json` records the upstream source archive's SHA-512, binary URL / checksum, and Russian language-pack checksum. Mozilla's full license notices remain accessible in the browser through `about:license`.

## uBlock Origin 1.75.0

The signed XPI is unmodified and separately licensed GPL-3.0-or-later with its included third-party notices. Complete corresponding upstream source:
https://github.com/gorhill/uBlock/archive/refs/tags/1.75.0.tar.gz

An identical copy is provided alongside the browser binaries as `ublock-origin-1.75.0-source.tar.gz`; its SHA-256 is in BUILD.json. Build instructions are in the upstream archive. The GPL license is included in `licenses/GPL-3.0.txt` and in the XPI itself.

## Material Color Utilities 0.4.0

`src/material/` contains the Apache-2.0 JavaScript distribution, LICENSE, README and package metadata. Relative import extensions were made explicit for Gecko's module loader. Upstream preferred sources and build instructions:
https://github.com/material-foundation/material-color-utilities
https://www.npmjs.com/package/@material/material-color-utilities/v/0.4.0

## AppImage runtime

The AppImage includes the upstream type-2 runtime under the licenses reproduced in `licenses/appimage-runtime.txt`. The exact runtime commit is `fedfad51acc2860b2916a1eef32ba4a500ff31ef`. Its source and rebuild instructions, the libfuse 3.15.0 source and patch, and squashfuse 0.5.2 source are included in `appimage-runtime-corresponding-source.tar.xz` beside the binary. This permits rebuilding and relinking the runtime with a modified libfuse; use that runtime with the published AppDir and `appimagetool --runtime-file`. Runtime build instructions are also available at https://github.com/AppImage/type2-runtime/tree/fedfad51acc2860b2916a1eef32ba4a500ff31ef . Full component notices (musl, libfuse, squashfuse, zstd, zlib and mimalloc) are retained in `licenses/`. AppDir and packaging scripts used for Kamputa are in this repository. AppImage tooling is not part of the browser's MPL-covered code.
