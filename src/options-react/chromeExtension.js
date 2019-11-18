/** 
 * This file integrates the chrome extension api with options.
 * When testing with extension, you will have to update the content security policy in manifet.json
 * each time the file is modified.
 */


// Pull in methods from background page
const getChromeExtensions = () => {

  const getInitialState = async (callback) => {
    const getActiveEntries = (data) => (
      Object.fromEntries(
        Object.entries(data || {}).filter(([url, saveFlag]) => isActiveDomain(saveFlag))
      )
    );

    const storage = await browser.storage.local.get(null);
    return {
      showAddNew: false,
      autoRun: !!storage['autoRun'],
      whitelist: getActiveEntries(storage['whitelist']),
      blacklist: getActiveEntries(storage['blacklist']),
    };
  };

  const saveAutoRun = async (val) => {
    await browser.runtime.sendMessage({
      action: 'updateGMState',
      data: {autoRun: val}
    });
    await browser.storage.local.set({ autoRun: val });
  };

  const addSite = async (siteUrl, shouldSkipHome, listName) => {
    await browser.runtime.sendMessage({
      action: 'saveChangeToList',
      data: {
        listName,
        siteUrl,
        saveFlag: shouldSkipHome ? 'nohome' : 'domain'
      }
    });
  };

  const deleteSite = async (siteUrl, listName) => {
    await browser.runtime.sendMessage({
      action: 'saveChangeToList',
      data: {
        listName,
        siteUrl,
        saveFlag: 'deleted'
      }
    });
  };

  return {getInitialState, saveAutoRun, addSite, deleteSite};
}


if (window.browser) window.cExt = getChromeExtensions();
