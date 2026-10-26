# SPDX-License-Identifier: MPL-2.0

browser-main-window-default-title = { -brand-full-name }

browser-main-private-window-title = { PLATFORM() ->
      [macos] { -brand-full-name } — Private Browsing
     *[other] { -brand-full-name } Private Browsing
  }

browser-main-private-suffix-for-content = Private Browsing

private-browsing-shortcut-text-2 = { -brand-shortcut-name } Private Browsing

browser-shortcut-description = Fast and private web browsing


urlbar-identity-button2 =
    .aria-label =
        { $count ->
            [0] View site information
            [1] View site information (1 tracker blocked)
           *[other] View site information ({ $count } trackers blocked)
        }


urlbar-services-notification-anchor =
    .tooltiptext = Open install message panel
urlbar-web-notification-anchor =
    .tooltiptext = Change whether you can receive notifications from the site
urlbar-midi-notification-anchor =
    .tooltiptext = Open MIDI panel
urlbar-serial-notification-anchor =
    .tooltiptext = Open Serial panel
urlbar-eme-notification-anchor =
    .tooltiptext = Manage use of DRM software
urlbar-web-authn-anchor =
    .tooltiptext = Open Web Authentication panel
urlbar-canvas-notification-anchor =
    .tooltiptext = Manage canvas extraction permission
urlbar-web-rtc-share-microphone-notification-anchor =
    .tooltiptext = Manage sharing your microphone with the site
urlbar-default-notification-anchor =
    .tooltiptext = Open message panel
urlbar-geolocation-notification-anchor =
    .tooltiptext = Open location request panel
urlbar-localhost-notification-anchor =
    .tooltiptext = Manage local device access for this site
urlbar-local-network-notification-anchor =
    .tooltiptext = Manage sharing your local network access with this site
urlbar-xr-notification-anchor =
    .tooltiptext = Open virtual reality permission panel
urlbar-storage-access-anchor =
    .tooltiptext = Open browsing activity permission panel
urlbar-web-rtc-share-screen-notification-anchor =
    .tooltiptext = Manage sharing your windows or screen with the site
urlbar-indexed-db-notification-anchor =
    .tooltiptext = Open offline storage message panel
urlbar-password-notification-anchor =
    .tooltiptext = Open save password message panel
urlbar-web-rtc-share-devices-notification-anchor =
    .tooltiptext = Manage sharing your camera and/or microphone with the site
urlbar-web-rtc-share-speaker-notification-anchor =
    .tooltiptext = Manage sharing other speakers with the site
urlbar-autoplay-notification-anchor =
    .tooltiptext = Open autoplay panel
urlbar-persistent-storage-notification-anchor =
    .tooltiptext = Store data in Persistent Storage
urlbar-addons-notification-anchor =
    .tooltiptext = Open add-on installation message panel
urlbar-search-tips-confirm = Okay, Got It
urlbar-search-tips-confirm-short = Got it

urlbar-result-menu-button =
    .title = Open menu
urlbar-result-menu-button-feedback = Feedback
    .title = Open menu
urlbar-result-menu-learn-more2 = Learn more
    .accesskey = L
urlbar-result-menu-remove-from-history2 = Remove from history
    .accesskey = R
urlbar-result-menu-tip-get-help2 = Get help
    .accesskey = h
urlbar-result-menu-dismiss-suggestion2 = Dismiss this suggestion
    .accesskey = D
urlbar-result-menu-manage-firefox-suggest2 = Manage { -firefox-suggest-brand-name }
    .accesskey = M
urlbar-result-menu-report-inaccurate-location2 = Report inaccurate location
urlbar-result-menu-show-less-frequently2 = Show less frequently
urlbar-result-menu-dont-show-weather-suggestions2 = Don’t show weather suggestions

urlbar-input-dismiss-autofill =
    .label = Dismiss this suggestion
    .accesskey = i
urlbar-input-remove-from-history =
    .label = Remove from history
    .accesskey = e

urlbar-splitbutton-dropmarker =
    .title = Open menu

urlbar-feedback-acknowledgment = Thanks for your feedback

urlbar-dismissal-acknowledgment-weather = Thanks for your feedback. You won’t see weather suggestions anymore.


urlbar-search-tips-onboard = Type less, find more: Search { $engineName } right from your address bar.
urlbar-search-tips-redirect-2 = Start your search in the address bar to see suggestions from { $engineName } and your browsing history.

urlbar-tabtosearch-onboard = Select this shortcut to find what you need faster.


urlbar-search-mode-bookmarks = Bookmarks
urlbar-search-mode-tabs = Tabs
urlbar-search-mode-history = History
urlbar-search-mode-actions = Actions


urlbar-geolocation-blocked =
    .tooltiptext = You have blocked location information for this website.
urlbar-localhost-blocked =
    .tooltiptext = You have blocked local device connections for this website.
urlbar-local-network-blocked =
    .tooltiptext = You have blocked local network connections for this website.
urlbar-xr-blocked =
    .tooltiptext = You have blocked virtual reality device access for this website.
urlbar-web-notifications-blocked =
    .tooltiptext = You have blocked notifications for this website.
urlbar-camera-blocked =
    .tooltiptext = You have blocked your camera for this website.
urlbar-microphone-blocked =
    .tooltiptext = You have blocked your microphone for this website.
urlbar-screen-blocked =
    .tooltiptext = You have blocked this website from sharing your screen.
urlbar-persistent-storage-blocked =
    .tooltiptext = You have blocked persistent storage for this website.
urlbar-popup-blocked2 =
    .tooltiptext = You have blocked pop-ups and third-party redirects for this website.
urlbar-autoplay-media-blocked =
    .tooltiptext = You have blocked autoplay media with sound for this website.
urlbar-canvas-blocked =
    .tooltiptext = You have blocked canvas data extraction for this website.
urlbar-midi-blocked =
    .tooltiptext = You have blocked MIDI access for this website.
urlbar-serial-blocked =
    .tooltiptext = You have blocked serial port access for this website.
urlbar-install-blocked =
    .tooltiptext = You have blocked add-on installation for this website.

urlbar-star-edit-bookmark =
    .tooltiptext = Edit this bookmark ({ $shortcut })

urlbar-star-add-bookmark =
    .tooltiptext = Bookmark this page ({ $shortcut })

urlbar-split-view-button =
    .tooltiptext = Split view
    .aria-label = Split view


clear-search-history =
    .label = Clear Search History
    .accesskey = H


page-action-manage-extension2 =
    .label = Manage Extension…
    .accesskey = E
page-action-remove-extension2 =
    .label = Remove Extension
    .accesskey = v


full-screen-autohide =
    .label = Hide Toolbars
    .accesskey = H
full-screen-exit =
    .label = Exit Full Screen Mode
    .accesskey = F


search-one-offs-with-title = This time, search with:

search-one-offs-change-settings-compact-button =
    .tooltiptext = Change search settings

search-one-offs-context-open-new-tab =
    .label = Search in New Tab
    .accesskey = T
search-one-offs-context-set-as-default =
    .label = Set as Default Search Engine
    .accesskey = D
search-one-offs-context-set-as-default-private =
    .label = Set as Default Search Engine for Private Windows
    .accesskey = P

search-one-offs-engine-with-alias =
    .tooltiptext = { $engineName } ({ $alias })

search-one-offs-add-engine =
    .label = Add “{ $engineName }”
    .tooltiptext = Add search engine “{ $engineName }”
    .aria-label = Add search engine “{ $engineName }”
search-one-offs-add-engine-menu =
    .label = Add search engine


search-one-offs-bookmarks =
    .tooltiptext = Bookmarks ({ $restrict })
search-one-offs-tabs =
    .tooltiptext = Tabs ({ $restrict })
search-one-offs-history =
    .tooltiptext = History ({ $restrict })
search-one-offs-actions =
    .tooltiptext = Actions ({ $restrict })


quickactions-addons = View add-ons
quickactions-cmd-addons3 = extensions, themes, addons, add-ons

quickactions-manageai = Manage AI controls
quickactions-cmd-manageai = disable ai, off ai, manage ai

quickactions-bookmarks2 = Manage bookmarks
quickactions-cmd-bookmarks = bookmarks

quickactions-clearrecenthistory = Clear recent history
quickactions-cmd-clearrecenthistory2 = cookies, clear cookies, cache, clear cache, browsing data, clear browsing data, history, clear recent history

quickactions-downloads2 = View downloads
quickactions-cmd-downloads = downloads

quickactions-extensions = Manage extensions
quickactions-cmd-extensions2 = extensions, addons, add-ons

quickactions-firefoxview = Open { -firefoxview-brand-name }
quickactions-cmd-firefoxview = open { -firefoxview-brand-name }, { -firefoxview-brand-name }, open view, view

quickactions-help = { -brand-product-name } help
quickactions-cmd-help = help, support

quickactions-inspector2 = Open Developer Tools
quickactions-cmd-inspector2 = inspector, devtools, dev tools

quickactions-colorpicker = Pick a color
quickactions-cmd-colorpicker = color picker, eyedropper, pick color

quickactions-cmd-library = library
quickactions-library = Open Library

quickactions-logins2 = Manage passwords
quickactions-cmd-logins = logins, passwords

quickactions-mute = Mute tabs playing audio
quickactions-cmd-mute = mute, shush, sssssh

quickactions-print2 = Print page
quickactions-cmd-print = print

quickactions-savepdf = Save page as PDF
quickactions-cmd-savepdf2 = pdf, save page

quickactions-editpdf = Open PDF editor
quickactions-cmd-editpdf = pdf

quickactions-private2 = Open private window
quickactions-cmd-private = private browsing

quickactions-refresh = Refresh { -brand-short-name }
quickactions-cmd-refresh = refresh

quickactions-restart = Restart { -brand-short-name }
quickactions-cmd-restart = restart

quickactions-screenshot3 = Take a screenshot
quickactions-cmd-screenshot2 = screenshot, take a screenshot

quickactions-translate = Translate
quickactions-cmd-translate = translate

quickactions-settings2 = Manage settings
quickactions-cmd-settings2 = settings, preferences, options, manage

quickactions-themes = Manage themes
quickactions-cmd-themes2 = themes, add-ons, addons

quickactions-update = Update { -brand-short-name }
quickactions-cmd-update = update

quickactions-viewsource2 = View page source
quickactions-cmd-viewsource2 = view source, source, page source

quickactions-labs = Open { -firefoxlabs-brand-name }
quickactions-cmd-labs = labs, experiment

quickactions-learn-more =
    .title = Learn more about Quick actions

press-tab-label = Press tab to select:


bookmarks-add-bookmark = Add bookmark
bookmarks-edit-bookmark = Edit bookmark
bookmark-panel-cancel =
    .label = Cancel
    .accesskey = C
bookmark-panel-remove =
    .label =
        { $count ->
            [1] Remove bookmark
           *[other] Remove { $count } bookmarks
        }
    .accesskey = R
bookmark-panel-show-editor-checkbox =
    .label = Show editor when saving
    .accesskey = S
bookmark-panel-save-button =
    .label = Save

bookmark-panel =
    .style = min-width: 23em


identity-site-information = Site information for { $host }
identity-header-security-with-host =
    .title = Connection security for { $host }
identity-connection-not-secure = Connection not secure
identity-connection-secure = Connection secure
identity-connection-failure = Connection failure
identity-connection-internal = This is a secure { -brand-short-name } page.
identity-connection-file = This page is stored on your computer.
identity-connection-associated = This page is loaded from another page.
identity-extension-page = This page is loaded from an extension.
identity-active-blocked = { -brand-short-name } has blocked parts of this page that are not secure.
identity-custom-root = Connection verified by a certificate issuer that is not recognized by Mozilla.
identity-passive-loaded = Parts of this page are not secure (such as images).
identity-active-loaded = You have disabled protection on this page.
identity-weak-encryption = This page uses weak encryption.

identity-https-only-connection-upgraded = (upgraded to HTTPS)
identity-https-only-label2 = Automatically upgrade this site to a secure connection
identity-https-only-dropdown-on =
    .label = On
identity-https-only-dropdown-off =
    .label = Off
identity-https-only-dropdown-off-temporarily =
    .label = Off temporarily
identity-https-only-info-turn-on3 = Turn on HTTPS upgrades for this site if you want { -brand-short-name } to upgrade the connection when possible.
identity-https-only-info-turn-off3 = If the page seems broken, you may want to turn off HTTPS upgrades for this site to reload using insecure HTTP.
identity-https-only-info-no-upgrade = Unable to upgrade connection from HTTP.

identity-permissions-storage-access-header = Cross-site cookies
identity-permissions-storage-access-hint = These parties can use cross-site cookies and site data while you are on this site.
identity-permissions-storage-access-learn-more = Learn more

identity-permissions-reload-hint = You may need to reload the page for changes to apply.
identity-clear-site-data =
    .label = Clear cookies and site data…
identity-connection-not-secure-security-view = You are not securely connected to this site.
identity-connection-verified = You are securely connected to this site.
identity-ev-owner-label2 = Certificate issued to
identity-verifier-label2 = Verified by
identity-etsi = Qualified as specified in Regulation (EU) 2024/1183.
identity-description-custom-root2 = Mozilla does not recognize this certificate issuer. It may have been added from your operating system or by an administrator.
identity-cert-exception-overridden = You have added a security exception for this site.
identity-remove-cert-exception =
    .label = Remove Exception
    .accesskey = R
identity-description-insecure = Your connection to this site is not private. Information you submit could be viewed by others (like passwords, messages, credit cards, etc.).
identity-description-weak-cipher-intro = Your connection to this website uses weak encryption and is not private.
identity-description-weak-cipher-risk = Other people can view your information or modify the website’s behavior.
identity-description-active-blocked2 = { -brand-short-name } has blocked parts of this page that are not secure.
identity-description-passive-loaded = Your connection is not private and information you share with the site could be viewed by others.
identity-description-passive-loaded-insecure2 = This website contains content that is not secure (such as images).
identity-description-passive-loaded-mixed2 = Although { -brand-short-name } has blocked some content, there is still content on the page that is not secure (such as images).
identity-description-active-loaded = This website contains content that is not secure (such as scripts) and your connection to it is not private.
identity-description-active-loaded-insecure = Information you share with this site could be viewed by others (like passwords, messages, credit cards, etc.).
identity-description-tls-key-logging-heading = Your connection may not be private
identity-description-tls-key-logging-message = An app or service may see your encrypted traffic from this site.
identity-more-info-link-text =
    .label = More information


browser-window-minimize-button =
    .tooltiptext = Minimize
browser-window-maximize-button =
    .tooltiptext = Maximize
browser-window-restore-down-button =
    .tooltiptext = Restore Down
browser-window-close-button =
    .tooltiptext = Close
browser-window-return-to-opener =
    .tooltiptext = Return


browser-import-button2 =
    .label = Import bookmarks…
    .tooltiptext = Import bookmarks from another browser to { -brand-short-name }.

bookmarks-toolbar-empty-message = For quick access, place your bookmarks here on the bookmarks toolbar. <a data-l10n-name="manage-bookmarks">Manage bookmarks…</a>


popup-select-camera-device =
    .value = Camera:
    .accesskey = C
popup-select-camera-icon =
    .tooltiptext = Camera
popup-select-microphone-device =
    .value = Microphone:
    .accesskey = M
popup-select-microphone-icon =
    .tooltiptext = Microphone
popup-select-speaker-icon =
    .tooltiptext = Speakers
popup-select-window-or-screen =
    .label = Window or screen:
    .accesskey = W
popup-all-windows-shared = All visible windows on your screen will be shared.


sharing-warning-window = You are sharing { -brand-short-name }. Other people can see when you switch to a new tab.
sharing-warning-screen = You are sharing your entire screen. Other people can see when you switch to a new tab.
sharing-warning-proceed-to-tab =
  .label = Proceed to Tab
sharing-warning-disable-for-session =
  .label = Disable sharing protection for this session


webserial-select-port-label = Select a serial port:
webserial-no-ports-available = No serial ports available


urlbar-search-mode-indicator-close =
  .aria-label = Close

urlbar-placeholder =
  .placeholder = Search or enter address

urlbar-placeholder-keyword-disabled =
  .placeholder = Enter address

urlbar-placeholder-search-mode-web-2 =
  .placeholder = Search the Web
  .aria-label = Search with { $name }

urlbar-placeholder-search-mode-other-engine =
  .placeholder = Enter search terms
  .aria-label = Search { $name }

urlbar-placeholder-search-mode-other-bookmarks =
  .placeholder = Enter search terms
  .aria-label = Search bookmarks

urlbar-placeholder-search-mode-other-history =
  .placeholder = Enter search terms
  .aria-label = Search history

urlbar-placeholder-search-mode-other-tabs =
  .placeholder = Enter search terms
  .aria-label = Search tabs

urlbar-placeholder-search-mode-other-actions =
  .placeholder = Enter search terms
  .aria-label = Search actions

urlbar-placeholder-with-name =
  .placeholder = Search with { $name } or enter address

urlbar-remote-control-notification-anchor2 =
  .tooltiptext = Browser is under remote control (reason: { $component })
urlbar-permissions-granted =
  .tooltiptext = You have granted this website additional permissions.
urlbar-switch-to-tab =
  .value = Switch to tab:

urlbar-extension =
  .value = Extension:

urlbar-go-button2 =
  .title = Go to the address in the Location Bar
urlbar-page-action-button =
  .tooltiptext = Page actions
urlbar-revert-button =
  .tooltiptext = Show the address in the Location Bar


urlbar-result-action-ai-chat = Ask
urlbar-result-action-search-in-private-w-engine = Search with { $engine } in a Private Window
urlbar-result-action-search-in-private = Search in a Private Window
urlbar-result-action-search-w-engine = Search with { $engine }
urlbar-result-action-sponsored = Sponsored
urlbar-result-action-switch-tab = Switch to Tab
urlbar-result-action-move-tab-to-split-view = Move Tab to Split View
urlbar-result-action-visit = Visit
urlbar-result-action-switch-tab-with-container = Switch to Tab · <span>{ $container }</span>
urlbar-result-action-tab-group-unnamed = Unnamed group
urlbar-result-action-visit-from-clipboard = Visit from clipboard
urlbar-result-action-before-tabtosearch-web = Press Tab to search with { $engine }
urlbar-result-action-before-tabtosearch-other = Press Tab to search { $engine }
urlbar-result-action-tabtosearch-web = Search with { $engine } directly from the address bar
urlbar-result-action-tabtosearch-other-engine = Search { $engine } directly from the address bar
urlbar-result-action-copy-to-clipboard = Copy
urlbar-result-action-undefined-calculator-result = undefined


urlbar-result-explanation-last-visited-relative-2 = Last visited { $date }

urlbar-result-explanation-last-visited-days-weeks-months-ago = Last visited { $date }

urlbar-result-explanation-last-visited-absolute-2 = Last visited { $date }

urlbar-result-explanation-bookmarked = Bookmarked { $date }

urlbar-result-addons-subtitle = { -brand-product-name } extension

urlbar-result-mdn-subtitle = { -mdn-brand-name }

urlbar-result-yelp-subtitle = { -yelp-brand-name }

urlbar-result-suggestion-recommended = Recommended

urlbar-result-weather-title = <strong>{ $temperature }°{ $unit }</strong> in { $city }, { $region }

urlbar-result-weather-title-with-country = <strong>{ $temperature }°{ $unit }</strong> in { $city }, { $region }, { $country }

urlbar-result-weather-title-city-only = <strong>{ $temperature }°{ $unit }</strong> in { $city }

urlbar-result-weather-provider-sponsored = { $provider } · Sponsored


urlbar-result-market-opt-in-title = Get stock market data right in your search bar

urlbar-result-market-opt-in-description = Show market updates and more from our partners when you share search query data with { -vendor-short-name }. <a data-l10n-name="learn-more-link">Learn more</a>

urlbar-result-realtime-opt-in-allow = Show suggestions

urlbar-result-realtime-opt-in-not-now = Not now
urlbar-result-realtime-opt-in-dismiss = Dismiss
urlbar-result-realtime-opt-in-dismiss-all2 = Don’t show these suggestions

urlbar-result-menu-dont-show-market2 = Don’t show market suggestions

urlbar-result-dismissal-acknowledgment-market = Thanks for your feedback. You won’t see market suggestions anymore.

urlbar-result-aria-group-market =
  .aria-label = Stock market suggestions

urlbar-result-dismissal-acknowledgment-all = Thanks for your feedback. You won’t see these suggestions anymore.


urlbar-result-dates-countdown =
    { $daysUntilStart ->
        [one] { $name } · In { $daysUntilStart } day
        *[other] { $name } · In { $daysUntilStart } days
    }

urlbar-result-dates-countdown-range =
    { $daysUntilStart ->
        [one] { $name } · Starts in { $daysUntilStart } day
        *[other] { $name } · Starts in { $daysUntilStart } days
    }

urlbar-result-dates-ongoing =
    { $daysUntilEnd ->
        [one] { $name } · Ends in { $daysUntilEnd } day
        *[other] { $name } · Ends in { $daysUntilEnd } days
    }

urlbar-result-dates-today = { $name } · Today

urlbar-result-dates-ends-today = { $name } · Ends today


urlbar-searchmode-button3 =
    .title = { $engine }, pick a search engine
urlbar-searchmode-button-no-engine2 =
    .title = No shortcut selected, pick a shortcut

urlbar-searchmode-no-keyword2 =
    .title = Keyword search is disabled

urlbar-searchmode-dropmarker2 =
    .title = Pick a search engine
urlbar-searchmode-bookmarks4 = Bookmarks
urlbar-searchmode-tabs4 = Tabs
urlbar-searchmode-history4 = History
urlbar-searchmode-actions4 = Actions
urlbar-searchmode-exit-button2 =
    .title = Close
urlbar-searchmode-default2 =
    .title = Default search engine

urlbar-searchmode-popup-add-engine = Add “{ $engineName }”
    .title = Add search engine “{ $engineName }”

urlbar-searchmode-popup-one-off-header = This time search with:
urlbar-searchmode-popup-header = Search with:
urlbar-searchmode-popup-search-settings2 = Search Settings
urlbar-searchmode-popup-settings2 = Settings

urlbar-result-search-with = Search with { $engine }

urlbar-result-search-with-local-search-mode = { $keywords } - Search { $localSearchMode }

urlbar-result-search-with-engine-keywords = {$keywords} - Search with { $engine }


urlbar-result-action-search-bookmarks = Search Bookmarks
urlbar-result-action-search-history = Search History
urlbar-result-action-search-tabs = Search Tabs
urlbar-result-action-search-actions = Search Actions

urlbar-result-action-switch-to-tabgroup = Switch to { $group }
urlbar-result-action-open-saved-tabgroup = Open { $group }


urlbar-view-context-menu-open-in-tab2 = Open in New Tab
    .accesskey = w
urlbar-view-context-menu-open-in-container-tab2 = Open in New Container Tab
    .accesskey = i
urlbar-view-context-menu-open-in-window2 = Open in New Window
    .accesskey = N
urlbar-view-context-menu-open-in-private-window2 = Open in New Private Window
    .accesskey = P


urlbar-group-firefox-suggest = Firefox Suggest
  .label = { -firefox-suggest-brand-name }

urlbar-group-search-suggestions =
  .label = { $engine } suggestions

urlbar-group-quickactions =
  .label = Quick Actions

urlbar-group-recent-searches =
  .label = Recent Searches

urlbar-group-trending =
  .label = Trending on { $engine }

urlbar-result-menu-trending-dont-show2 = Don’t show trending searches
  .accesskey = D

urlbar-trending-dismissal-acknowledgment = Thanks for your feedback. You won’t see trending searches anymore.


reader-view-enter-button =
    .aria-label = Enter Reader View
reader-view-close-button =
    .aria-label = Close Reader View


picture-in-picture-urlbar-button-open =
 .tooltiptext = Open Picture-in-Picture ({ $shortcut })

picture-in-picture-urlbar-button-close =
 .tooltiptext = Close Picture-in-Picture ({ $shortcut })

picture-in-picture-panel-header = Picture-in-Picture
picture-in-picture-panel-headline = This website does not recommend Picture-in-Picture
picture-in-picture-panel-body = Videos might not display as the developer intended while Picture-in-Picture is enabled.
picture-in-picture-enable-toggle =
  .label = Enable anyway


fullscreen-warning-domain = <span data-l10n-name="domain">{ $domain }</span> is now full screen
fullscreen-warning-no-domain = This document is now full screen


fullscreen-exit-button = Exit Full Screen (Esc)
fullscreen-exit-mac-button = Exit Full Screen (esc)

fullscreen-keyboardlock-exit-button = Exit Full Screen (Press and hold Esc)
fullscreen-keyboardlock-exit-mac-button = Exit Full Screen (Press and hold esc)

pointerlock-warning-domain = <span data-l10n-name="domain">{ $domain }</span> has control of your pointer. Press Esc to take back control.
pointerlock-warning-no-domain = This document has control of your pointer. Press Esc to take back control.


bookmarks-manage-bookmarks =
  .label = Manage bookmarks
bookmarks-recent-bookmarks-panel-subheader = Recent bookmarks
bookmarks-toolbar-chevron =
  .tooltiptext = Show more bookmarks
bookmarks-sidebar-content =
  .aria-label = Bookmarks
bookmarks-menu-button =
  .label = Bookmarks menu
bookmarks-other-bookmarks-menu =
  .label = Other bookmarks
bookmarks-mobile-bookmarks-menu =
  .label = Mobile bookmarks


bookmarks-tools-sidebar-visibility =
  .label = { $isVisible ->
     [true] Hide bookmarks sidebar
    *[other] View bookmarks sidebar
  }
bookmarks-tools-toolbar-visibility-menuitem =
  .label = { $isVisible ->
     [true] Hide Bookmarks Toolbar
    *[other] View Bookmarks Toolbar
  }
bookmarks-tools-toolbar-visibility-panel =
  .label = { $isVisible ->
     [true] Hide bookmarks toolbar
    *[other] Show bookmarks toolbar
  }


bookmarks-search =
  .label = Search bookmarks
bookmarks-tools =
  .label = Bookmarking Tools
bookmarks-subview-edit-bookmark =
  .label = Edit this bookmark…

bookmarks-toolbar =
  .toolbarname = Bookmarks Toolbar
  .accesskey = B
  .aria-label = Bookmarks
bookmarks-toolbar-menu =
  .label = Bookmarks toolbar
bookmarks-toolbar-placeholder =
  .title = Bookmarks toolbar items
bookmarks-toolbar-placeholder-button =
  .label = Bookmarks toolbar items

bookmarks-subview-bookmark-tab =
  .label = Bookmark current tab…


library-bookmarks-menu =
  .label = Bookmarks


repair-text-encoding-button =
  .label = Repair text encoding
  .tooltiptext = Guess correct text encoding from page content


toolbar-settings-button =
  .label = Settings
  .tooltiptext = { PLATFORM() ->
      [macos] Open settings ({ $shortcut })
     *[other] Open settings
  }

toolbar-overflow-customize-button =
  .label = Customize toolbar…
  .accesskey = C

toolbar-button-email-link =
  .label = Email link
  .tooltiptext = Email a link to this page

toolbar-button-logins =
  .label = Passwords
  .tooltiptext = View and manage your saved passwords

qrcode-panel-error =
    .message = Failed to generate QR code. Please try again.

qrcode-copy-button =
    .label = Copy
qrcode-copy-success =
    .message = QR code copied to clipboard.
qrcode-copy-error =
    .message = Failed to copy QR code.

qrcode-save-button =
    .label = Save


qrcode-save-filename-base = qrcode
qrcode-save-filename-with-domain-base = qrcode-{ $domain }


qrcode-window-title = QR Code
qrcode-dialog-title = QR Code
qrcode-image =
    .aria-label = QR code
qrcode-close-button =
    .aria-label = Close

toolbar-button-save-page =
  .label = Save page
  .tooltiptext = Save this page ({ $shortcut })

toolbar-button-open-file =
  .label = Open file
  .tooltiptext = Open a file ({ $shortcut })

toolbar-button-synced-tabs =
  .label = Synced tabs
  .tooltiptext = Show tabs from other devices

toolbar-button-send-tab =
  .label = Send tab
  .tooltiptext = Send current tab to another device

toolbar-button-new-private-window =
  .label = New private window
  .tooltiptext = Open a new private browsing window ({ $shortcut })

toolbar-button-share-tab =
  .label = Share
  .tooltiptext = Share this page

toolbar-button-tab-groups =
  .label = Tab groups
  .tooltiptext = Show your tab groups


eme-notifications-drm-content-playing = Some audio or video on this site uses DRM software, which may limit what { -brand-short-name } can let you do with it.
eme-notifications-drm-content-playing-manage = Manage settings
eme-notifications-drm-content-playing-manage-accesskey = M
eme-notifications-drm-content-playing-dismiss = Dismiss
eme-notifications-drm-content-playing-dismiss-accesskey = D


panel-save-update-username-2 =
    .label = Username
panel-save-update-password-2 =
    .label = Password


menu-share-more =
    .label = More…
menu-share-windows =
    .label = More Options
menu-share-copy-links =
    .label =
        { $count ->
            [one] Copy Link
           *[other] Copy { $count } Links
        }
    .accesskey = L
ui-tour-info-panel-close =
    .tooltiptext = Close


popups-infobar-allow2 =
    .label = Allow pop-ups and third-party redirects for { $uriHost }
    .accesskey = p


popups-infobar-dont-show-message2 =
    .label = Don’t show this message when pop-ups or third-party redirects are blocked
    .accesskey = D

edit-popup-settings2 =
    .label = Manage pop-up and third-party redirect settings…
    .accesskey = M

picture-in-picture-hide-toggle =
    .label = Hide Picture-in-Picture Toggle
    .accesskey = H


picture-in-picture-move-toggle-right =
    .label = Move Picture-in-Picture Toggle to Right Side
    .accesskey = R

picture-in-picture-move-toggle-left =
    .label = Move Picture-in-Picture Toggle to Left Side
    .accesskey = L



navbar-accessible =
    .aria-label = Navigation

navbar-downloads =
    .label = Downloads

navbar-overflow-2 =
    .tooltiptext = More tools

navbar-print =
    .label = Print
    .tooltiptext = Print this page… ({ $shortcut })

navbar-home =
    .label = Home
    .tooltiptext = { -brand-short-name } Home Page

navbar-library =
    .label = Library
    .tooltiptext = View history, saved bookmarks, and more

navbar-search =
    .title = Search

tabs-toolbar =
    .aria-label = Browser tabs

tabs-toolbar-new-tab =
    .label = New Tab

tabs-toolbar-list-all-tabs =
    .label = List all tabs
    .tooltiptext = List all tabs


pinned-tabs-drop-indicator = Drop tab here to pin


restore-session-startup-suggestion-message = <strong>Open previous tabs?</strong> You can restore your previous session from the { -brand-short-name } application menu <img data-l10n-name="icon"/>, under History.
restore-session-startup-suggestion-button = Show me how


filepicker-blocked-infobar = Your organization has blocked access to local files on this computer


data-reporting-notification-message = { -brand-short-name } automatically sends some data to { -vendor-short-name } so that we can improve your experience.
data-reporting-notification-button =
    .label = Choose What I Share
    .accesskey = C

private-browsing-indicator-label = Private browsing

private-browsing-indicator-tooltip =
    .tooltiptext = Private browsing

private-browsing-indicator-button =
    .tooltiptext = Private browsing info

private-browsing-info-panel-title = You’re in a Private Window

private-browsing-info-panel-description = This helps keep your browsing hidden from others on this device, but doesn’t make you invisible online. <a data-l10n-name="learn-more">Who might be able to see my activity?</a>

content-analysis-indicator-tooltip =
    .tooltiptext = Data loss prevention (DLP) by { $agentName }. Click for more info.
content-analysis-panel-title = Data protection
content-analysis-panel-text-styled = Your organization uses <b>{ $agentName }</b> to protect against data loss. <a data-l10n-name="info">Learn more</a>


unified-extensions-button =
    .label = Extensions
    .tooltiptext = Extensions


unified-extensions-button-permissions-needed =
    .label = Extensions
    .tooltiptext =
        Extensions
        Permissions needed


unified-extensions-button-quarantined =
    .label = Extensions
    .tooltiptext =
        Extensions
        Some extensions are not allowed


unified-extensions-button-blocklisted =
    .label = Extensions
    .tooltiptext =
        Extensions
        Some extensions are disabled


reset-pbm-toolbar-button2 =
    .label = Clear private session
    .tooltiptext = Clear private session
reset-pbm-panel-heading2 = Clear data and start a fresh private session?
reset-pbm-panel-description2 = This deletes history, cookies, and all other site data without closing your Private Window.
reset-pbm-panel-always-ask-checkbox =
     .label = Always ask me
     .accesskey = A
reset-pbm-panel-cancel-button =
    .label = Cancel
    .accesskey = C
reset-pbm-panel-confirm-button2 =
    .label = Clear private session
    .accesskey = l
reset-pbm-panel-complete = Private session data deleted


refresh-blocked-refresh-label = { -brand-short-name } prevented this page from automatically reloading.
refresh-blocked-redirect-label = { -brand-short-name } prevented this page from automatically redirecting to another page.

refresh-blocked-allow =
    .label = Allow
    .accesskey = A


firefox-relay-offer-why-to-use-relay = Our secure, easy-to-use masks protect your identity and prevent spam by hiding your email address.

firefox-relay-offer-what-relay-provides = All emails sent to your email masks will be forwarded to <strong>{ $useremail }</strong> (unless you decide to block them).

firefox-relay-offer-legal-notice = By clicking “Use email mask”, you agree to the <label data-l10n-name="tos-url">Terms of Service</label> and <label data-l10n-name="privacy-url">Privacy Notice</label>.
firefox-relay-offer-legal-notice-1 = By signing up and creating an email mask, you agree to the <label data-l10n-name="tos-url">Terms of Service</label> and <label data-l10n-name="privacy-url">Privacy Notice</label>.


popup-notification-addon-install-unsigned =
    .value = (Unverified)
popup-notification-xpinstall-prompt-learn-more = Learn more about installing add-ons safely

popup-notification-xpinstall-prompt-block-url = See details

popup-notification-addon-privatebrowsing-checkbox2 =
    .label = Allow extension to run in private windows
    .accesskey = p

popup-notification-addon-technical-and-interaction-checkbox =
    .label = Share technical and interaction data with extension developer
    .accesskey = S


popup-warning-message =
    { $popupCount ->
        [1] { -brand-short-name } prevented this site from opening a pop-up window.
       *[other] { -brand-short-name } prevented this site from opening { $popupCount } pop-up windows.
    }

redirect-warning-with-popup-message =
    { $popupCount ->
        [0] { -brand-short-name } prevented this site from redirecting.
        [1] { -brand-short-name } prevented this site from opening a pop-up window and redirecting.
       *[other] { -brand-short-name } prevented this site from opening { $popupCount } pop-up windows and redirecting.
    }

popup-warning-exceeded-message =
    { $popupCount ->
       *[other] { -brand-short-name } prevented this site from opening more than { $popupCount } pop-up windows.
    }

popup-warning-exceeded-with-redirect-message =
    { $popupCount ->
       *[other] { -brand-short-name } prevented this site from opening more than { $popupCount } pop-up windows and redirecting.
    }

popup-warning-button =
    .label =
        { PLATFORM() ->
            [windows] Options
           *[other] Preferences
        }
    .accesskey =
        { PLATFORM() ->
            [windows] O
           *[other] P
        }

popup-show-popup-menuitem =
    .label = Show “{ $popupURI }”

popup-trigger-redirect-menuitem =
    .label = Show “{ $redirectURI }”


file-picker-failed-open = The Windows file-dialog could not be opened. No file or folder could be selected.
file-picker-failed-save-somewhere = The Windows file-dialog could not be opened. The file will be saved to { $path }.
file-picker-failed-save-nowhere = The Windows file-dialog could not be opened. No default folder could be found; the file will not be saved.

file-picker-crashed-open = The Windows file-dialog has crashed. No file or folder could be selected.
file-picker-crashed-save-somewhere = The Windows file-dialog has crashed. The file will be saved to { $path }.
file-picker-crashed-save-nowhere = The Windows file-dialog has crashed. No default folder could be found; the file will not be saved.


file-picker-crashed-show-in-folder =
    .label = Show in Folder
    .accessKey = F


onboarding-aw-finish-setup-button =
    .label = Finish setup
    .tooltiptext = Finish setting up { -brand-short-name }

onboarding-checklist-button-label = Finish setup


urlbar-trust-icon-notsecure-label = Not Secure

urlbar-trust-icon-trackers-blocked-longform-label = { $count ->
  [one] { $count } tracker blocked
  *[other] { $count } trackers blocked
}

trustpanel-etp-label-enabled = Enhanced Tracking Protection is on
trustpanel-etp-label-disabled = Enhanced Tracking Protection is off

trustpanel-etp-toggle-on =
  .aria-label = Enhanced Tracking Protection: On for { $host }
trustpanel-etp-toggle-off =
  .aria-label = Enhanced Tracking Protection: Off for { $host }

trustpanel-etp-description-enabled = If something looks broken on this site, try turning off protections.
trustpanel-etp-description-disabled = { -brand-product-name } thinks companies should follow you less. We block as many trackers as we can when you turn on protections.

trustpanel-connection-label-secure = Connection secure
trustpanel-connection-label-insecure = Connection not secure

trustpanel-header-enabled = { -brand-product-name } is on guard
trustpanel-description-enabled2 = You’re protected. If we spot something, we’ll let you know.
trustpanel-header-enabled-insecure = Be careful on this site
trustpanel-description-enabled-insecure = { -brand-product-name } noticed something suspicious.

trustpanel-header-disabled = You turned off protections
trustpanel-description-disabled = { -brand-product-name } is off-duty. We suggest turning protections back on.

trustpanel-clear-cookies-button = Clear cookies and site data
trustpanel-privacy-link = Privacy Settings

trustpanel-clear-cookies-header =
    .title = Clear cookies and site data for { $host }

trustpanel-clear-cookies-description = Removing cookies and site data might log you out of websites and clear shopping carts.

trustpanel-clear-cookies-subview-button-clear = Clear
trustpanel-clear-cookies-subview-button-cancel = Cancel

trustpanel-site-information-header =
    .title = Connection protections for { $host }

trustpanel-siteinformation-morelink = More site information

trustpanel-blocker-see-all = See All

trustpanel-blocker-header =
    .title = Tracking protections for { $host }


trustpanel-blocker-section-header2 = { $count ->
  [one] <span data-l10n-name="count">{ $count }</span> Tracker blocked on this site
  *[other] <span data-l10n-name="count">{ $count }</span> Trackers blocked on this site
}
trustpanel-blocker-description = { -brand-product-name } thinks companies should follow you less. So we block as many as we can.
trustpanel-blocked-header = { -brand-product-name } blocked these things for you:
trustpanel-tracking-header = { -brand-product-name } allowed these things so sites don’t break:
trustpanel-tracking-description = Without trackers, some buttons, forms, and login fields might not work.
trustpanel-insecure-section-header = Your connection isn’t secure
trustpanel-insecure-description = The data you’re sending to this site isn’t encrypted. It could be viewed, stolen, or altered.

trustpanel-list-label-tracking-cookies = { $count ->
  [one] { $count } Cross-site tracking cookie
  *[other] { $count } Cross-site tracking cookies
}
trustpanel-list-label-tracking-content = Tracking content
trustpanel-list-label-fingerprinter =  { $count ->
  [one] { $count } Fingerprinters
  *[other] { $count } Fingerprinters
}
trustpanel-list-label-social-tracking = { $count ->
  [one] { $count } Social media tracker
  *[other] { $count } Social media trackers
}
trustpanel-list-label-cryptominer = { $count ->
  [one] { $count } Cryptominer
  *[other] { $count } Cryptominers
}
trustpanel-social-tracking-blocking-tab-header = { $count ->
  [one] { -brand-product-name } blocked { $count } social media tracker
  *[other] { -brand-product-name } blocked { $count } social media trackers
}
trustpanel-social-tracking-not-blocking-tab-header = { $count ->
  [one] { -brand-product-name } allowed { $count } social media tracker
  *[other] { -brand-product-name } allowed { $count } social media trackers
}

trustpanel-tracking-cookies-blocking-tab-header = { $count ->
  [one] { -brand-product-name } blocked { $count } cross-site tracking cookie
  *[other] { -brand-product-name } blocked { $count } cross-site tracking cookies
}
trustpanel-tracking-cookies-not-blocking-tab-header = { $count ->
  [one] { -brand-product-name } allowed { $count } cross-site tracking cookie
  *[other] { -brand-product-name } allowed { $count } cross-site tracking cookies
}

trustpanel-tracking-content-blocking-tab-header = { $count ->
  [one] { -brand-product-name } blocked { $count } tracker
  *[other] { -brand-product-name } blocked { $count } trackers
}
trustpanel-tracking-content-not-blocking-tab-header = { $count ->
  [one] { -brand-product-name } allowed { $count } tracker
  *[other] { -brand-product-name } allowed { $count } trackers
}
trustpanel-tracking-content-tab-list-header = These sites are trying to track you:

trustpanel-fingerprinter-blocking-tab-header = { $count ->
  [one] { -brand-product-name } blocked { $count } fingerprinter
  *[other] { -brand-product-name } blocked { $count } fingerprinters
}
trustpanel-fingerprinter-not-blocking-tab-header = { $count ->
  [one] { -brand-product-name } allowed { $count } fingerprinter
  *[other] { -brand-product-name } allowed { $count } fingerprinters
}
trustpanel-fingerprinter-list-header = These sites are trying to fingerprint you:

trustpanel-cryptominer-blocking-tab-header = { $count ->
  [one] { -brand-product-name } blocked { $count } cryptominer
  *[other] { -brand-product-name } blocked { $count } cryptominers
}
trustpanel-cryptominer-not-blocking-tab-header = { $count ->
  [one] { -brand-product-name } allowed { $count } cryptominer
  *[other] { -brand-product-name } allowed { $count } cryptominers
}
trustpanel-cryptominer-tab-list-header = These sites are trying to cryptomine:
trustpanel-breachalerts-anonymous-breached-header = Have an account on this site?
trustpanel-breachalerts-anonymous-breached-description = { -brand-product-name } found that this site had a data breach in the last 12 months. Find out if you were affected.
trustpanel-breachalerts-anonymous-breached-button-dismiss = Dismiss
trustpanel-breachalerts-anonymous-breached-button-check-monitor = Start free scan


reduced-protection-infobar-message = <strong>Site looks broken?</strong> Reload the page to temporarily lower your tracking protection.
reduced-protection-infobar-reload-button = Reload
  .accesskey = R
reduced-protection-infobar-never-show-button = Don’t show again
  .accesskey = D
