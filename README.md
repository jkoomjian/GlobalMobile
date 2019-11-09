-------------------- GlobalMobile ---------------------

--------- __@      __@       __@       __@      __~@
------- _`\<,_    _`\<,_    _`\<,_     _`\<,_    _`\<,_
------ (*)/ (*)  (*)/ (*)  (*)/ (*)  (*)/ (*)  (*)/ (*)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


# Browse the internet without getting ADD

Some websites have an overwhelming number of images and headlines and ads
all screaming for your attention simultaneously. Our poor brains spin into
overdrive just to interpret all these distractions.

GlobalMobile aims to restore your sanity by reducing and simplifying the
content on these websites. It does this with a simple hack: Many of the
worst offending websites actually have nice mobile versions, with just a
single column of content to scroll through. Global Mobile displays this
mobile version of a site in your browser (It doesn't change the size of
your browser window, just the content).

How it works: By default Global Mobile will not change anything- As you
encounter overly complicated pages, click 'Add To Whitelist' in the
GlobalMobile menu. From then on, GlobalMobile will display the mobile
version for all pages on the site. To undo this change, select 'Remove From
Whitelist' in the GlobalMobile menu.


~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
GlobalMobileGlobalMobileGlobalMobileGlobalMobileGlobalMobileGlobalMobileGlo
balMobileGlobalMobileGlobalMobileGlobalMobileGlobalMobileGlobalMobileGlobal
MobileGlobalMobileGlobalMobileGlobalMobileGlobalMobileGlobalMobileGlobalMob
ileGlobalMobileGlobalMobileGlobalMobileGlobalMobileGlobalMobileGlobalMobile
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


Documentation Links:
https://developer.chrome.com/extensions/api_index
https://developer.chrome.com/extensions/webRequest
https://developer.chrome.com/extensions/webNavigation

Permissions:
  activeTab:                    get active tab details (url)
  webRequest,                   webRequestBlocking: modify http headers
  webNavigation:                on page load event
  http://*/*", "https://*/*:    ajax requests
  storage:                      storage for options
  tabs:                         close current tab


--------------

options.html uses react with JSX, but this is very complicated in the addon. 
JSX is interpreted with in-browser babel, there is no build script.
But babel uses unsafe inline scripting, and the Chrome content security policy makes this difficult.
In manifest.json you have to update the content security policy with the hash of the js code each time you change the js:
"content_security_policy": "script-src 'self' 'sha256-l6W+m5yTEAvuVkdmv4f9jb3hBjWaLts2SFwwvrT1RTo='",
Also, ES6 modules don't currently work with the in-browser babel.
For testing, just use test/react/index.html to avoid this.

--------------

Chrome currently doesn't support the promise based window.browser api. When it does add support, switch to promises.
https://bugs.chromium.org/p/chromium/issues/detail?id=328932