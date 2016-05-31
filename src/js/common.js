/*----------- Shared ----------------*/

//Save the domain to the given list
function saveChangeToList(listName, siteUrl, callback, shouldDelete) {
  var domain = getDomain(siteUrl);
  var newVal = shouldDelete ? "deleted" : "domain";

  //Update local cache
  var listCache = window[ listName + "Cache"];
  listCache[domain] = newVal;

  //Update persistent storage
  var toGet = {};
  toGet[listName] = {};
  chrome.storage.sync.get(toGet, function(items) {
    let currList = items[listName];
    currList[domain] = newVal;

    var toSet = {};
    toSet[listName] = currList;
    chrome.storage.sync.set(toSet, function() {
      if (callback) callback();
    });

  });
}

function isOnList(listName, url, callback) {
  var domain = getDomain(url);
  chrome.storage.sync.get(listName, function(items) {
    callback( items[listName][domain] == "domain" );
  });
}

function getDomain(url) {
  if (url.indexOf("http") !== 0) {
    url = "http://" + url;
  }
  var a = document.createElement("a");
  a.href = url;
  domain = a.hostname;
  return domain;
}