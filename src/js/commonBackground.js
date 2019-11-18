/** Helpers + Messaging for background page */

/**
 * Save the domain to the given list
 * Save flag can be;
 * domain - run on entire domain
 * nohome - run on all pages in domain except homepage
 * deleted - do not run on domain
 */
async function saveChangeToList(listName, siteUrl, saveFlag = 'domain') {
  var domain = getDomain(siteUrl);
  if (['deleted', 'domain', 'nohome'].indexOf(saveFlag) < 0) throw 'Invalid save flag';

  // Update local cache (in window, not chrome.sync)
  var list = window.gmState[listName];
  list[domain] = saveFlag;

  //Update persistent storage
  const items = await browser.storage.local.get({ [listName]: {} });
  let currList = items[listName];
  currList[domain] = saveFlag;
  await browser.storage.local.set({ [listName]: currList });
}

async function isOnList(listName, url) {
  const domain = getDomain(url);
  const items = await browser.storage.local.get({ [listName]: {} });
  return isActiveDomain(items[listName][domain]);
}

function updateGMState(updateData) {
  Object.keys(updateData).forEach(key => gmState[key] = updateData[key]);
}

/*-------------- Messaging ----------------*/

browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log('at runtime on message!', msg, sender);
  switch (msg.action) {
    case 'getGMState': {
      sendResponse(gmState);  // sendResponse tells browser to return promise
      break;
    }
    case 'updateGMState': {
      updateGMState(msg.data);
      console.log('updated gmstate', gmState, msg.data);
      sendResponse();
      break;
    }
    case 'runGMInternal': {
      runGMInternal().then(() => {
        console.log('ran gm internal', gmState);
        sendResponse();
      });
      break;
    }
    case 'saveChangeToList': {
      const {listName, siteUrl, saveFlag = 'domain'} = msg.data;
      saveChangeToList(listName, siteUrl, saveFlag).then(() => {
        sendResponse();
      });
      break;
    }
    case 'isOnList': {
      const {listName, url} = msg.data;
      isOnList(listName, url).then(r => {
        sendResponse(r);
      })
      break;
    }
  }

});
