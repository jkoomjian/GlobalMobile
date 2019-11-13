/*----------- Helper ----------------*/
async function isOnList(listName, callback) {
  const tabs = await browser.tabs.query({active: true });
  if (!tabs.length) return;
  return await gmbp.isOnList(listName, tabs[0].url);
}

/*----------- Popup ----------------*/
async function popupRunOnce() {
  gmbp.gmSync.runOnce = true;
  await gmbp.runGMInternal();
  window.close();
}

async function popupDisableOnce() {
  gmbp.gmSync.disableOnce = true;
  await _popupReload();
}

async function popupAddWhitelist() {
  await _popupUpdateList('whitelist');
}

async function popupAddBlacklist() {
  await _popupUpdateList('blacklist');
}

async function popupRemoveWhitelist() {
  await _popupUpdateList('whitelist', true);
}

async function popupRemoveBlacklist() {
  await _popupUpdateList('blacklist', true);
}

async function _popupUpdateList(listName, toDelete) {
  const tabs = await browser.tabs.query({active: true });
  await gmbp.saveChangeToList(listName, tabs[0].url, toDelete ? 'deleted' : 'domain');
  if (!toDelete) {
    await gmbp.runGMInternal();
    window.close();
  } else { 
    await _popupReload();
  }
}

async function popupShowRelevantButtons() {
  var listName;
  if (gmbp.gmSync.autoRun) {
    $('.whitelist').hide();
    listName = 'blacklist';
  } else {
    $('.blacklist').hide();
    listName = 'whitelist';
  }
  const onList = await isOnList(listName);
  $( (onList ? '.off-' : '.on-') + listName).hide();
}

async function _popupReload() {
  const tabs = await browser.tabs.query({ active: true, windowType: 'normal' });
  browser.tabs.reload(tabs[0].id);
  window.close();
}

/*----------- Run! ----------------*/
// Pull in methods from background page
const gmbp = browser.extension.getBackgroundPage();

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
