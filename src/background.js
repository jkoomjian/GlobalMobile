const mobileUserAgent = 'Mozilla/5.0 (Linux; Android 6.0) AppleWebkit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.89 Mobile Safari/537.36';


/*-------------- On Extension Load ----------------*/

// Load gm data from chrome.sync
function gmInit() {
  // Save all loaded data to gmSync
  window.gmSync = {
    // cache isEnabled return value since it is called many times per requests
    isRequestEnabled: undefined,
    runOnce: false,
    disableOnce: false,
    whitelist: {},
    blacklist: {},
    autoRun: false
  };

  // The whitelist, blacklist and autoRun are loaded async.
  // This causes problems with onBeforeSendHeaders - the headers will
  // send before the async request finishes. 
  // To fix this, load this data on extension load.
  chrome.storage && chrome.storage.sync.get(null, function (items) {
    window.gmSync.whitelist = items['whitelist'] || {};
    window.gmSync.blacklist = items['blacklist'] || {};
    window.gmSync.autoRun = !!items['autoRun'];
  });
}



/*-------------- On Page Load ----------------*/
function onPageLoad(details) {
  updateQuerySelectors(details);
  // Update the icon once after page load
  updateIcon(details.url, details.tabId);
  // window vars are scoped to extension, are persisted across pages, so unset
  window.gmSync.isRequestEnabled = undefined;
  window.gmSync.disableOnce = false;
  window.gmSync.runOnce = false;
}

// Called when the page loading is complete
// Running in Chrome Extension Env.
var updateQuerySelectors = function (details) {

  //ignore frames - tabId is important to keep - otherwise frames will break everything
  if (details.frameId !== 0) return;

  if (isEnabled(details.url)) {
    chrome.tabs.executeScript(details.tabId, { 'file': 'lib/jquery.js' }, function () {
      chrome.tabs.executeScript(details.tabId, { 'file': 'lib/mq.js' }, function () {
        chrome.tabs.executeScript(details.tabId, { 'file': 'lib/uri.js' }, function () {
          chrome.tabs.executeScript(details.tabId, { 'file': 'js/common.js' }, function () {
            chrome.tabs.executeScript(details.tabId, { 'file': 'js/mobile-view.js' }, function () {
              chrome.tabs.executeScript(details.tabId, { 'file': 'js/vw.js' }, function () {
                chrome.tabs.executeScript(details.tabId, { 'code': 'runMV()' });
              });
            });
          });
        });
      });
    });
  }
};

function updateIcon(url, tabId) {
  // var iconPath = 'img/' + (isEnabled(url) ? 'icon_active.png' : 'icon_inactive.png');
  // chrome.browserAction.setIcon({path: iconPath, tabId: tabId});
  if (isEnabled(url)) {
    chrome.browserAction.setBadgeText({ text: 'On', tabId: tabId });
    chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 1], tabId: tabId });
  }
}


/*-------------- Is GM Enabled ----------------*/

//Cache the isEnabled result - will be called many times per request
function isEnabled(url) {

  // console.log(`GM is enabled: ${_isEnabled(url)} cached: ${window.gmSync.isRequestEnabled !== undefined} callee: ${arguments.callee.caller.name}`);

  if (window.gmSync.isRequestEnabled !== undefined) {
    return window.gmSync.isRequestEnabled;
  }

  window.gmSync.isRequestEnabled = _isEnabled(url);
  return window.gmSync.isRequestEnabled;
}

// Run GM on this page?
function _isEnabled(url) {
  console.log({gmSync: window.gmSync, url, domain: getDomain(url), isHomepage: isHomepage(url)});

  // If runOnce is true, run gm - set in popup.js
  if (window.gmSync.runOnce) {
    return true;
  }

  if (window.gmSync.disableOnce) {
    return false;
  }

  if (window.gmSync.autoRun) {
    //run if domain is not on blacklist
    return !isInList(window.gmSync.blacklist, url);
  } else {
    //run if domain is on whitelist
    return isInList(window.gmSync.whitelist, url);
  }
}

function isHomepage(url) {
  return URI.parse(url).path == '/';
}

function isInList(list, url) {
  var domain = getDomain(url);
  return list[domain] == 'domain' || (list[domain] == 'nohome' && !isHomepage(url));
}


/*-------------- Callbacks ----------------*/

var updateHeaders = function(details) {
  if (isEnabled(details.url)) {
    details.requestHeaders.forEach( requestHeader => {
      if (requestHeader.name === 'User-Agent') {
        requestHeader.value = mobileUserAgent;
      }
    });
    return {requestHeaders: details.requestHeaders};
  }
};



/*-------------- Listeners ----------------*/

//Update headers before each http request
chrome.webRequest.onBeforeSendHeaders.addListener(
  updateHeaders, 
  {
    urls: ['<all_urls>'],
    types: ['main_frame']
  },
  ['blocking', 'requestHeaders']
);

//Update media queries after page load completed
chrome.webNavigation.onCompleted.addListener(onPageLoad);

//On Extension Load
gmInit();
