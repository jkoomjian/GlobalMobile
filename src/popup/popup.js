/*----------- Helper ----------------*/
function isOnList(listName, callback) {
  chrome.tabs.query({active: true }, tabs => {
    if (!tabs.length) return;
    gmbp.isOnList(listName, tabs[0].url, callback);
  });
}

/*----------- Popup ----------------*/
function popupRunOnce() {
  gmbp.gmSync.runOnce = true;
  gmbp.runGMInternal();
  window.close();
}

function popupDisableOnce() {
  gmbp.gmSync.disableOnce = true;
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
  chrome.tabs.query({active: true }, tabs => {
    gmbp.saveChangeToList(listName, tabs[0].url, function() {
      if (!toDelete) {
        gmbp.runGMInternal();
        window.close();
      } else { 
        _popupReload();
      }
    }, toDelete ? 'deleted' : 'domain');
  });
}

function popupShowRelevantButtons() {
  var listName;
  if (gmbp.gmSync.autoRun) {
    $('.whitelist').hide();
    listName = 'blacklist';
  } else {
    $('.blacklist').hide();
    listName = 'whitelist';
  }
  isOnList(listName, function(onList) {
    $( (onList ? '.off-' : '.on-') + listName).hide();
  });
}

function _popupReload() {
  chrome.tabs.query({ active: true, windowType: 'normal' }, tabs => {
    chrome.tabs.reload(tabs[0].id);
    window.close();
  });
}

/*----------- Run! ----------------*/
document.addEventListener('DOMContentLoaded', function() {
  [
    ['.run-once', popupRunOnce],
    ['.disable-once', popupDisableOnce],
    ['#whitelist-site', popupAddWhitelist],
    ['#unwhitelist-site', popupRemoveWhitelist],
    ['#blacklist-site', popupAddBlacklist],
    ['#unblacklist-site', popupRemoveBlacklist]
  ].forEach( params => {
    $('.content').on('click', params[0], params[1]);
  });
  popupShowRelevantButtons();
});

// Pull in methods from background page
// (but not jquery - else jquery will operate on the backgroundPage dom)
const gmbp = chrome.extension.getBackgroundPage();
