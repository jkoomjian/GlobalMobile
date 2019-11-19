const mobileUserAgent = 'Mozilla/5.0 (Linux; Android 6.0) AppleWebkit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.89 Mobile Safari/537.36';
window.gmState = {};


/*-------------- On Extension Load ----------------*/

// Load gm data from browser.local
async function gmInit() {
  window.gmState = {
    // cache isEnabled return value since it is called many times per requests
    isRequestEnabled: undefined,
    runOnce: false,
    disableOnce: false,
    whitelist: {},
    blacklist: {},
    autoRun: false
  };

  // Save all loaded data to gmState

  // The whitelist, blacklist and autoRun are loaded async.
  // This causes problems with onBeforeSendHeaders - the headers will
  // send before the async request finishes. 
  // To fix this, load this data on extension load.
  if (browser.storage) {
    const items = await browser.storage.local.get(null);
    window.gmState.whitelist = items['whitelist'] || {};
    window.gmState.blacklist = items['blacklist'] || {};
    window.gmState.autoRun = !!items['autoRun'];
  }

  // Add Listeners

  //Update headers before each http request
  browser.webRequest.onBeforeSendHeaders.addListener(
    updateHeaders,
    {
      urls: ['<all_urls>'],
      types: ['main_frame']
    },
    ['blocking', 'requestHeaders']
  );

  //Update media queries after page load completed
  browser.webNavigation.onCompleted.addListener(onPageLoad);
}


/*-------------- Start! ----------------*/
function runGM(url, tabId) {
  if (isEnabled(url)) {
    updateQuerySelectors(tabId);
    // Update the icon once after page load
    updateIcon(tabId);
  }
  
  // window vars are scoped to extension, are persisted across pages, so unset
  window.gmState.isRequestEnabled = undefined;
  window.gmState.disableOnce = false;
  window.gmState.runOnce = false;
}

async function runGMInternal() {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  const { url, id } = tabs[0];
  runGM(url, id);
}

// Called when the page loading is complete
// Running in Chrome Extension Env.
async function updateQuerySelectors(tabId) {
  await browser.tabs.executeScript(tabId, { 'file': '/lib/mq.js' });
  await browser.tabs.executeScript(tabId, { 'file': '/lib/uri.js' });
  await browser.tabs.executeScript(tabId, { 'file': '/js/common.js' });
  await browser.tabs.executeScript(tabId, { 'file': '/js/mobile-view.js' });
  await browser.tabs.executeScript(tabId, { 'file': '/js/vw.js' });
  await browser.tabs.executeScript(tabId, { 'code': 'runMV()' });
}

function updateIcon(tabId) {
  // var iconPath = 'img/' + (isEnabled(url) ? 'icon_active.png' : 'icon_inactive.png');
  // browser.browserAction.setIcon({path: iconPath, tabId: tabId});
  browser.browserAction.setBadgeText({ text: 'On', tabId });
  browser.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255], tabId });
  // FF Only
  try {
    browser.browserAction.setBadgeTextColor({ color: 'white', tabId });
  } catch(e) {
    //
  }
}


/*-------------- Is GM Enabled ----------------*/

//Cache the isEnabled result - will be called many times per request
function isEnabled(url) {

  // console.log(`at isEnabled: cached: ${window.gmState.isRequestEnabled !== undefined} callee: ${arguments.callee.caller.name}`, window.gmState);

  if (window.gmState.isRequestEnabled !== undefined) {
    return window.gmState.isRequestEnabled;
  }

  window.gmState.isRequestEnabled = _isEnabled(url);
  return window.gmState.isRequestEnabled;
}

// Run GM on this page?
function _isEnabled(url) {
  // console.log('At _isEnabled', {gmState: window.gmState, url, domain: getDomain(url), isHomepage: isHomepage(url)});

  // If runOnce is true, run gm - set in popup.js
  if (window.gmState.runOnce) {
    return true;
  }

  if (window.gmState.disableOnce) {
    return false;
  }

  if (window.gmState.autoRun) {
    //run if domain is not on blacklist
    return !isInList(window.gmState.blacklist, url);
  } else {
    //run if domain is on whitelist
    return isInList(window.gmState.whitelist, url);
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

function onPageLoad(details) {

  //ignore frames - only run if this is the main frame
  if (details.frameId !== 0) return;

  runGM(details.url, details.tabId);
}


/*-------------- Run! ----------------*/
//On Extension Load
gmInit();
