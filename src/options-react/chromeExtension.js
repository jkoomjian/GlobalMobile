/** 
 * This file integrates the chrome extension api with options.
 * Only include it when testing with the extension.
 * When testing with extension, you will have to update the content security policy in manifet.json
 * each time the file is modified.
 */


 // Pull in methods from background page
// (but not jquery - else jquery will operate on the backgroundPage dom)
const gmbp = chrome.extension.getBackgroundPage();

window.cExt = {
  getInitialState(callback) {
    const getActiveEntries = (data) => (
      Object.fromEntries(
        Object.entries(data || {}).filter(([url, saveFlag]) => gmbp.isActiveDomain(saveFlag))
      )
    )

    chrome.storage.sync.get(null, function (storage) {
      const initialState = {
        showAddNew: false,
        autoRun: !!storage['autoRun'],
        whitelist: getActiveEntries(storage['whitelist']),
        blacklist: getActiveEntries(storage['blacklist']),
      }
      callback(initialState);
    });
  },

  saveAutoRun(val) {
    gmbp.autoRunCache = val;
    chrome.storage.sync.set({ autoRun: val });
  },

  addSite(siteUrl, shouldSkipHome, listName) {
    var saveFlag = "domain";
    if (shouldSkipHome) {
      saveFlag = "nohome";
    }
    gmbp.saveChangeToList(listName, siteUrl, null, saveFlag);
  },

  deleteSite(siteUrl, listName) {
    gmbp.saveChangeToList(listName, siteUrl, null, "deleted");
  }

}