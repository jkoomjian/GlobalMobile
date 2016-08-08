/*----------- Helper ----------------*/
function isOnList(listName, callback) {
  chrome.tabs.query({active: true, currentWindow: true }, tabs => {
    if (!tabs.length) return;
    gmbp.isOnList(listName, tabs[0].url, callback);
  });
}

/*----------- Popup ----------------*/
function popupRunOnce() {
  gmbp.runOnce = true;
  _popupReload();
}

function popupDisableOnce() {
  gmbp.disableOnce = true;
  _popupReload();
}

function popupAddWhitelist() {
  _popupUpdateList('whitelist');
}

function popupAddBlacklist() {
  _popupUpdateList('blacklist');
}

function popupRemoveWhitelist() {
  _popupUpdateList('whitelist', true);
}

function popupRemoveBlacklist() {
  _popupUpdateList('blacklist', true);
}

function _popupUpdateList(listName, toDelete) {
  chrome.tabs.query({active: true, currentWindow: true }, tabs => {
    gmbp.saveChangeToList(listName, tabs[0].url, function() {
      _popupReload(window);
    }, toDelete ? "deleted" : "domain");
  });
}

function popupShowRelevantButtons() {
  var listName;
  if (gmbp.autoRunCache) {
    $(".whitelist").hide();
    listName = "blacklist";
  } else {
    $(".blacklist").hide();
    listName = "whitelist";
  }
  isOnList(listName, function(onList) {
    $( (onList ? ".off-" : ".on-") + listName).hide();
  });
}

function _popupReload() {
  window.close();
  chrome.tabs.reload();
}

/*----------- Run! ----------------*/
document.addEventListener('DOMContentLoaded', function() {
  [
    [".run-once", popupRunOnce],
    [".disable-once", popupDisableOnce],
    ["#whitelist-site", popupAddWhitelist],
    ["#unwhitelist-site", popupRemoveWhitelist],
    ["#blacklist-site", popupAddBlacklist],
    ["#unblacklist-site", popupRemoveBlacklist]
  ].forEach( params => {
    $(".content").on("click", params[0], params[1]);
  });
  popupShowRelevantButtons();
});

// Pull in methods from background page
// (but not jquery - else jquery will operate on the backgroundPage dom)
const gmbp = chrome.extension.getBackgroundPage();