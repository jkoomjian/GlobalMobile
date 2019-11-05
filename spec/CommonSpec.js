describe('GetDomain should', function() {
  it('return the right value', function() {
    expect( getDomain('http://www.jonathankoomjian.com/projects/') ).toBe(jkDomain);
    expect( getDomain('https://www.jonathankoomjian.com/projects/') ).toBe(jkDomain);
    expect( getDomain('http://www.jonathankoomjian.com/') ).toBe(jkDomain);
    expect( getDomain('http://www.jonathankoomjian.com') ).toBe(jkDomain);
    expect( getDomain('http://m.jonathankoomjian.com') ).toBe(jkDomain);
    expect(getDomain('http://127.0.0.1/GlobalMobile/test/external-css/test2.css')).toBe('127.0.0.1');
  });
  it('handle urls w/out http', function() {
    expect( getDomain('www.jonathankoomjian.com/projects/') ).toBe(jkDomain);
    expect( getDomain('jonathankoomjian.com/projects/') ).toBe('jonathankoomjian.com');
  });
});

describe('saveChangeToList', function() {

  beforeEach(function() {
    window.gmSync = {
      whitelist: {},
      blacklist: {},
    };
    window.myCallback = function() {};
    window.chrome = window['chrome'] || {};
    chrome.storage = {
      sync: {
        'get': function(arg1, arg2){},
        'set': function(arg1, arg2){}
      }
    };
    spyOn(chrome.storage.sync, 'get');
    spyOn(chrome.storage.sync, 'set');
  });

  it('calls sync correctly', function() {
    saveChangeToList('whitelist', jkUrl, myCallback);
    expect(chrome.storage.sync.get).toHaveBeenCalled();
    expect(chrome.storage.sync.get.calls.argsFor(0)[0]).toEqual({'whitelist': {}});
    //run callback, verify it calls set correctly
    let callback = chrome.storage.sync.get.calls.argsFor(0)[1];
    callback({'whitelist': {}});
    expect(chrome.storage.sync.set).toHaveBeenCalled();
    let toSet = {};
    toSet[jkDomain] = 'domain';
    expect(chrome.storage.sync.set.calls.argsFor(0)[0]).toEqual({'whitelist': toSet});
  });

  it('updates the cache', function() {
    saveChangeToList('whitelist', jkUrl, myCallback);
    expect(window.gmSync.whitelist[jkDomain]).toEqual('domain');
    saveChangeToList('whitelist', jkUrl, myCallback);
    expect(window.gmSync.whitelist[jkDomain]).toEqual('domain');
    saveChangeToList('blacklist', jkUrl, myCallback);
    expect(window.gmSync.blacklist[jkDomain]).toEqual('domain');
    //delete
    saveChangeToList('blacklist', jkUrl, myCallback, 'deleted');
    saveChangeToList('whitelist', jkUrl, myCallback, 'deleted');
    expect(window.gmSync.whitelist[jkDomain]).toEqual('deleted');
    expect(window.gmSync.blacklist[jkDomain]).toEqual('deleted');
  });

});
