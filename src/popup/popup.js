/*----------- Helper ----------------*/
async function isOnList(listName, callback) {
  const tabs = await browser.tabs.query({active: true, currentWindow: true});
  if (!tabs.length) return;
  return await browser.runtime.sendMessage({
    action: 'isOnList',
    data: {
      listName,
      url: tabs[0].url
    }
  });
}

/*----------- Popup ----------------*/
async function popupRunOnce() {
  const tab = await browser.tabs.getCurrent();
  await browser.runtime.sendMessage({
    action: 'updateGMState',
    data: {runOnce: true}
  });
  await browser.runtime.sendMessage({
    action: 'runGMInternal',
  });
  window.close();
}

async function popupDisableOnce() {
  await browser.runtime.sendMessage({
    action: 'updateGMState',
    data: {disableOnce: true}
  });
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
  const tabs = await browser.tabs.query({active: true, currentWindow: true});
  await browser.runtime.sendMessage({
    action: 'saveChangeToList',
    data: {
      listName,
      siteUrl: tabs[0].url,
      saveFlag: toDelete ? 'deleted' : 'domain'
    }
  });
  if (!toDelete) {
    await browser.runtime.sendMessage({
      action: 'runGMInternal',
    });
    window.close();
  } else { 
    await _popupReload();
  }
}

async function popupShowRelevantButtons() {
  var listName;

  const gmState = await browser.runtime.sendMessage({
    action: 'getGMState',
  });

  if (gmState.autoRun) {
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
  const tabs = await browser.tabs.query({ active: true, currentWindow: true, windowType: 'normal' });
  browser.tabs.reload(tabs[0].id);
  window.close();
}

/*----------- Run! ----------------*/
document.addEventListener('DOMContentLoaded', async function() {
  [
    ['.run-once', popupRunOnce],
    ['.disable-once', popupDisableOnce],
    ['#whitelist-site', popupAddWhitelist],
    ['#unwhitelist-site', popupRemoveWhitelist],
    ['#blacklist-site', popupAddBlacklist],
    ['#unblacklist-site', popupRemoveBlacklist]
  ].forEach( params => {
    $('.content').on('click', params[0], null, params[1]);
  });
  await popupShowRelevantButtons();
});
