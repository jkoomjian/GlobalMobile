const mobileUserAgent = "Mozilla/5.0 (Linux; Android 6.0) AppleWebkit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.89 Mobile Safari/537.36";
var isRequestEnabledTmp = undefined;
var runOnce = false;
var disableOnce = false;
var whitelistCache = {};
var blacklistCache = {};
var autoRunCache = false;


/*-------------- On Extension Load ----------------*/

/* The whitelistCache and autoRunCache are loaded async.
  This causes problems with onBeforeSendHeaders - the headers will
  send before the async request finishes. Instead, load this
  data on extension load.
  */

function loadCachedData() {
  chrome.storage.sync.get(null, function(items) {
    whitelistCache = items['whitelist'] || {};
    blacklistCache = items['blacklist'] || {};
    autoRunCache = !!items['autoRun'];
  });
}

/*-------------- On Page Events ----------------*/

//Cache the isEnabled result - will be called many times per request
function isEnabled(url) {

  if (isRequestEnabledTmp !== undefined) {
    return isRequestEnabledTmp;
  }

  isRequestEnabledTmp = _isEnabled(url)
  return isRequestEnabledTmp;
}

// Run GM on this page?
function _isEnabled(url) {
  //console.log(`isRequestEnabledTmp ${isRequestEnabledTmp}`);
  //console.log(`runOnce ${runOnce}`);
  //console.log(whitelistCache);
  //console.log(`url: ${url} domain: ${getDomain(url)}`);

  //If runOnce is true, always run
  if (runOnce) {
    return true;
  }

  if (disableOnce) {
    return false;
  }

  var domain = getDomain(url);

  if (autoRunCache) {
    //run if domain is not on blacklist
    return blacklistCache[domain] != "domain";
  } else {
    //run if domain is on whitelist
    return whitelistCache[domain] == "domain";
  }

  return false;
}

function afterPageLoad(url) {
  // Update the icon once after page load
  updateIcon(url);
  //vars are scoped to extension, are persisted across pages, so unset
  isRequestEnabledTmp = undefined;
  disableOnce = runOnce = false;
}


function updateIcon(url) {
  var iconPath = 'img/' + (isEnabled(url) ? 'icon_active.png' : 'icon_inactive.png');
  chrome.browserAction.setIcon({path: iconPath});
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
}

// Called when the page loading is complete
// Running in Chrome Extension Env.
var updateQuerySelectors = function(details) {

  //ignore frames - tabId is important to keep - otherwise frames will break everything
  if (details.frameId !== 0) return;

  if (isEnabled(details.url)) {
    chrome.tabs.executeScript(details.tabId, {'file': "lib/mq.js"}, function () {
      chrome.tabs.executeScript(details.tabId, {'file': 'lib/uri.js'}, function () {
        chrome.tabs.executeScript(details.tabId, {'file': 'js/common.js'}, function () {
          chrome.tabs.executeScript(details.tabId, {'file': 'js/mobile-view.js'}, function () {
            chrome.tabs.executeScript(details.tabId, {'code': 'runMV()'});
          });
        });
      });
    });
  }

  // Should be finished loading now
  afterPageLoad(details.url);
}


/*-------------- Listeners ----------------*/

//Update headers before each http request
chrome.webRequest.onBeforeSendHeaders.addListener(updateHeaders,
                                                {urls: ["<all_urls>"], types: ["main_frame"]},
                                                ["blocking", "requestHeaders"]);

//Update media queries after page load completed
chrome.webNavigation.onCompleted.addListener(updateQuerySelectors);

//On Extension Load
loadCachedData();