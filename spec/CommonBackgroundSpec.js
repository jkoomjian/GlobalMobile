describe('saveChangeToList', function() {

  beforeEach(function() {
    window.gmSync = {
      whitelist: {},
      blacklist: {},
    };
    window.myCallback = function() {};
    window.browser = window['browser'] || {};
    window.browser.storage = {
      local: {
        'get': function(arg1, arg2){},
        'set': function(arg1, arg2){}
      }
    };
    spyOn(browser.storage.local, 'get');
    spyOn(browser.storage.local, 'set');
  });

  it('calls chrome.storage.local correctly', async function() {
    const r = await saveChangeToList('whitelist', jkUrl);
    console.log('at return val', r);
    expect(browser.storage.local.get).toHaveBeenCalled();
    expect(browser.storage.local.get.calls.argsFor(0)[0]).toEqual({'whitelist': {}});
    //run callback, verify it calls set correctly
    // let callback = browser.storage.local.get.calls.argsFor(0)[1];
    // callback({'whitelist': {}});
    expect(browser.storage.local.set).toHaveBeenCalled();
    expect(browser.storage.local.set.calls.argsFor(0)[0]).toEqual({ 'whitelist': { [jkDomain]: 'domain' }});
  });

  // it('updates the cache', function() {
  //   saveChangeToList('whitelist', jkUrl, myCallback);
  //   expect(window.gmSync.whitelist[jkDomain]).toEqual('domain');
  //   saveChangeToList('whitelist', jkUrl, myCallback);
  //   expect(window.gmSync.whitelist[jkDomain]).toEqual('domain');
  //   saveChangeToList('blacklist', jkUrl, myCallback);
  //   expect(window.gmSync.blacklist[jkDomain]).toEqual('domain');
  //   //delete
  //   saveChangeToList('blacklist', jkUrl, myCallback, 'deleted');
  //   saveChangeToList('whitelist', jkUrl, myCallback, 'deleted');
  //   expect(window.gmSync.whitelist[jkDomain]).toEqual('deleted');
  //   expect(window.gmSync.blacklist[jkDomain]).toEqual('deleted');
  // });

});
