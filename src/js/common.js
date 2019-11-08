/*----------- Code Shared Between background.js and options.js ----------------*/

/**
 * Save the domain to the given list
 * Save flag can be;
 * domain - run on entire domain
 * nohome - run on all pages in domain except homepage
 * deleted - do not run on domain
 */
function saveChangeToList(listName, siteUrl, callback, saveFlag) {
  var domain = getDomain(siteUrl);
  if (saveFlag === undefined) saveFlag = 'domain';
  if (['deleted', 'domain', 'nohome'].indexOf(saveFlag) < 0) throw 'Invalid save flag';

  // Update local cache (in window, not chrome.sync)
  var list = window.gmSync[listName];
  list[domain] = saveFlag;

  //Update persistent storage
  chrome.storage.local.get({ [listName]: {} }, function(items) {
    console.log('at save', listName, items);
    let currList = items[listName];
    currList[domain] = saveFlag;

    chrome.storage.local.set({[listName]: currList}, function() {
      if (callback) callback();
    });

  });
}

function isOnList(listName, url, callback) {
  var domain = getDomain(url), toGet = {};
  toGet[listName] = {};
  chrome.storage.local.get(toGet, function(items) {
    callback( isActiveDomain(items[listName][domain]) );
  });
}

function isActiveDomain(domainValue) {
  return domainValue == 'domain' || domainValue == 'nohome';
}

function getDomain(url) {
  if (url.indexOf('http') !== 0) {
    url = 'http://' + url;
  }
  var a = document.createElement('a');
  a.href = url;
  var domain = a.hostname;

  // Remove subdomain, if present
  if (domain.split('.').length === 3) {
    let splits = domain.split('.');
    domain = splits[ splits.length - 2 ] + '.' + splits[ splits.length - 1 ];
  }

  return domain;
}
