let items;

describe('saveChangeToList', function() {

  beforeEach(function() {
    items = {
      whitelist: { },
      blacklist: { },
    };

    window.gmSync = {
      ...items
    };
    window.browser = window['browser'] || {};
    window.browser.storage = {
      local: {
        async get() { return items; },
        async set(arg1) {
          items = {
            ...items,
            ...arg1
          };
        }
      }
    };
    spyOn(browser.storage.local, 'get').and.callThrough();
    spyOn(browser.storage.local, 'set').and.callThrough();
  });

  it('calls chrome.storage.local correctly', async function(done) {

    await saveChangeToList('whitelist', jkUrl);
    expect(items.whitelist['jonathankoomjian.com']).toEqual('domain');
    expect(browser.storage.local.get).toHaveBeenCalled();
    expect(browser.storage.local.get.calls.argsFor(0)[0]).toEqual({'whitelist': {}});

    await saveChangeToList('blacklist', jkUrl, 'deleted');
    expect(items.blacklist['jonathankoomjian.com']).toEqual('deleted');
    
    done();
  });

  it('updates the cache', async function(done) {
    await saveChangeToList('whitelist', jkUrl);
    expect(window.gmSync.whitelist[jkDomain]).toEqual('domain');
    await saveChangeToList('blacklist', jkUrl);
    expect(window.gmSync.blacklist[jkDomain]).toEqual('domain');
    //delete
    await saveChangeToList('blacklist', jkUrl, 'deleted');
    expect(window.gmSync.blacklist[jkDomain]).toEqual('deleted');
    await saveChangeToList('whitelist', jkUrl, 'deleted');
    expect(window.gmSync.whitelist[jkDomain]).toEqual('deleted');
    done();
  });

});
