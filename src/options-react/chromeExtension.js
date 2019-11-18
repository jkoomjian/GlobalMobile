/** 
 * This file integrates the chrome extension api with options.
 * Only include it when testing with the extension.
 * When testing with extension, you will have to update the content security policy in manifet.json
 * each time the file is modified.
 */


// Pull in methods from background page
const gmbp = browser.extension.getBackgroundPage();

window.cExt = {
  async getInitialState(callback) {
    const getActiveEntries = (data) => (
      Object.fromEntries(
        Object.entries(data || {}).filter(([url, saveFlag]) => gmbp.isActiveDomain(saveFlag))
      )
    );

    const storage = await browser.storage.local.get(null);
    return {
      showAddNew: false,
      autoRun: !!storage['autoRun'],
      whitelist: getActiveEntries(storage['whitelist']),
      blacklist: getActiveEntries(storage['blacklist']),
    };
  },

  async saveAutoRun(val) {
    gmbp.gmState.autoRun = val;
    await browser.storage.local.set({ autoRun: val });
  },

  async addSite(siteUrl, shouldSkipHome, listName) {
    const saveFlag = shouldSkipHome ? 'nohome' : 'domain';
    await gmbp.saveChangeToList(listName, siteUrl, saveFlag);
  },

  async deleteSite(siteUrl, listName) {
    await gmbp.saveChangeToList(listName, siteUrl, 'deleted');
  }

};
