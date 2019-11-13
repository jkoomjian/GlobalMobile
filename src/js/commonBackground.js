/** Common function executed in the background context (access to browser, but not the page) */

/*----------- Code Shared Between background.js, options.js and popup.js ----------------*/

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
  var list = window.gmSync[listName];
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
