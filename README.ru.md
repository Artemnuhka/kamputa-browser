<p align="center">
  <a href="README.md"><img src="https://img.shields.io/badge/English-383b44?style=for-the-badge" alt="English"></a>
  <a href="README.ru.md"><img src="https://img.shields.io/badge/%D0%A0%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9-aebee8?style=for-the-badge" alt="Русский"></a>
</p>

<p align="center">
  <img src="assets/app-icon-256.png" width="112" height="112" alt="kamputa browser logo">
</p>

<h1 align="center">kamputa browser</h1>

<p align="center"><strong>Браузер для Linux на основе Firefox с компактным интерфейсом в духе Chromium / Helium и локальным пиксельным питомцем.</strong></p>

<p align="center">Это перепакованная официальная сборка Mozilla с опубликованными изменениями интерфейса, а не отдельно скомпилированный движок Gecko. Проект независимый и не поддерживается Mozilla.</p>

<p align="center">
  <img src="https://img.shields.io/badge/Linux%20%C2%B7%20x86_64-383b44?style=for-the-badge" alt="Linux x86_64">
  <a href="LICENSE"><img src="https://img.shields.io/badge/MPL%202.0-383b44?style=for-the-badge" alt="MPL 2.0"></a>
</p>

<p align="center">
  <a href="https://github.com/Artemnuhka/kamputa-browser/releases/latest"><img src="https://img.shields.io/badge/%D0%A1%D0%BA%D0%B0%D1%87%D0%B0%D1%82%D1%8C%20%D0%B1%D1%80%D0%B0%D1%83%D0%B7%D0%B5%D1%80-aebee8?style=for-the-badge" alt="Скачать браузер"></a>
</p>

<p align="center">
  <a href="#features">Возможности</a> · <a href="#build">Сборка</a> · <a href="#license">Лицензия</a>
</p>

---

## Установка

Скачай пакет для своей системы в разделе [Releases](https://github.com/Artemnuhka/kamputa-browser/releases):

- **[RPM](https://github.com/Artemnuhka/kamputa-browser/releases/download/v0.6.1/kamputa-browser-0.6.1-1.x86_64.rpm) (x86_64):** для Fedora и openSUSE. Установи через пакетный менеджер — он подтянет необходимые библиотеки.
- **[DEB](https://github.com/Artemnuhka/kamputa-browser/releases/download/v0.6.1/kamputa-browser_0.6.1_amd64.deb) (amd64):** для Debian / Ubuntu. Команда установки: `sudo apt install ./kamputa-browser_0.6.1_amd64.deb`.
- **[AppImage](https://github.com/Artemnuhka/kamputa-browser/releases/download/v0.6.1/kamputa-browser-0.6.1-x86_64.AppImage) (x86_64):** разреши выполнение файла и запусти его. Если FUSE недоступен, используй `./kamputa-browser-0.6.1-x86_64.AppImage --appimage-extract-and-run`.

**Зависимости:**

- Python 3
- Bash
- GTK 3
- DBus

<a id="features"></a>

## Возможности

- **Оформление.** Компактные тёмные вкладки и панель инструментов; также доступно классическое оформление.
- **Темы и палитры.** Нативные темы Firefox с готовыми палитрами и собственными цветами. Русский и английский текст Kamputa подстраивается под язык браузера.
- **Первый запуск.** При первом запуске — импорт данных, выбор поиска, темы, необязательный вход в Mozilla и выбор менеджера паролей. При знакомстве с питомцем ему нужно дать имя.
- **Твой питомец.** Локальный тамагочи: сытость, энергия, настроение, уход за шёрсткой и дружба; две интерактивные игры, награды за заботу, комнаты, украшения, дневник и достижения. Имя и прежний прогресс сохраняются. Его состояние хранится в профиле; он не читает сайты и историю посещений.
- **Экономия памяти.** По желанию — предложения деактивировать неиспользуемые вкладки с большим потреблением памяти. Значения памяти приблизительные. Активные, закреплённые и приватные вкладки, воспроизведение медиа и звонки защищены от выгрузки.
- **Приватность и блокировка рекламы.** Встроенный подписанный uBlock Origin без изменений. Телеметрия, исследования и рекламные предложения отключены политиками. Это не означает отключение всех сетевых сервисов Mozilla: Safe Browsing, обновления расширений, поиск и необязательная синхронизация аккаунта могут обращаться к сети.
- **Обновления.** Обновления из стабильных GitHub Releases этого репозитория. Ежедневная проверка включается по желанию; загрузку и установку запускает пользователь. Пакеты проверяются по размеру и SHA-256 из манифеста. Доверие основано на HTTPS и этом репозитории; отдельного ключа подписи разработчика пока нет.

<a id="build"></a>

## Сборка из исходников

<details>
<summary>Инструкция и требования к сборке</summary>

Для сборки нужны Python 3.12 или новее, Bash, `rpmbuild`, `dpkg-deb`, `mksquashfs` и официальный исполняемый файл `appimagetool` для создания AppImage.

```sh
python3 packaging/fetch-upstream.py --cache build/upstream
python3 build.py --firefox build/upstream/firefox
python3 packaging/build-packages.py --appimagetool /path/to/appimagetool.AppImage --runtime-file /path/to/runtime-x86_64
```

SHA-256 инструмента AppImage и его runtime зафиксированы в `packaging/TOOLCHAIN.json`; скрипт упаковки отклоняет другие бинарные файлы.

В `BUILD.json` зафиксированы точные версии и контрольные суммы Firefox, русского языкового пакета и uBlock. Скрипты сборки приводят оптимизированную структуру JAR Mozilla к виду, совместимому со стандартными ZIP-инструментами Python, заново применяют изменения оформления и сохраняют юридические уведомления движка. Gecko они не компилируют. Для самостоятельной сборки Gecko используй точные исходники и ревизию, указанные в [SOURCE-CODE.md](SOURCE-CODE.md).

</details>

<a id="license"></a>

## Лицензия и доступность исходников

Оригинальный код Kamputa, скрипты сборки, документация и ресурсы проекта распространяются под [MPL 2.0](LICENSE). Существующие уведомления об авторских правах и лицензиях сохранены. Сторонний код сохраняет собственные лицензии: компоненты Mozilla / Gecko, Material Color Utilities под Apache-2.0, uBlock Origin под GPL-3.0-or-later и компоненты runtime AppImage. Подробнее — в [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) и [SOURCE-CODE.md](SOURCE-CODE.md).

Точные исходники Firefox доступны в официальном архиве Mozilla для этой версии, ссылка на который приведена в SOURCE-CODE.md; SHA-512 архива указан в BUILD.json. Все изменения Kamputa и их предпочтительные для редактирования исходные формы находятся в этом репозитории. Названия Mozilla и Firefox используются для обозначения движка и сервисов; MPL не предоставляет прав на их товарные знаки.
