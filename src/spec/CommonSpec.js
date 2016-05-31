var jkDomain = "www.jonathankoomjian.com";
var jkUrl = "http://www.jonathankoomjian.com/projects/"

describe("GetDomain should", function() {
  it("return the right value", function() {
    expect( getDomain("http://www.jonathankoomjian.com/projects/") ).toBe(jkDomain)
    expect( getDomain("https://www.jonathankoomjian.com/projects/") ).toBe(jkDomain)
    expect( getDomain("http://www.jonathankoomjian.com/") ).toBe(jkDomain)
    expect( getDomain("http://www.jonathankoomjian.com") ).toBe(jkDomain)
  });
  it("handle urls w/out http", function() {
    expect( getDomain("www.jonathankoomjian.com/projects/") ).toBe(jkDomain)
    expect( getDomain("jonathankoomjian.com/projects/") ).toBe("jonathankoomjian.com")
  });
});

describe("saveChangeToList", function() {

  beforeEach(function() {
    window.whitelistCache = {};
    window.blacklistCache = {};
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

  it("calls sync correctly", function() {
    saveChangeToList("whitelist", jkUrl, myCallback);
    expect(chrome.storage.sync.get).toHaveBeenCalled();
    expect(chrome.storage.sync.get.calls.argsFor(0)[0]).toEqual({"whitelist": {}});
    //run callback, verify it calls set correctly
    let callback = chrome.storage.sync.get.calls.argsFor(0)[1];
    callback({"whitelist": {}});
    expect(chrome.storage.sync.set).toHaveBeenCalled();
    let toSet = {}
    toSet[jkDomain] = "domain";
    expect(chrome.storage.sync.set.calls.argsFor(0)[0]).toEqual({"whitelist": toSet});
  });

  it("updates the cache", function() {
    saveChangeToList("whitelist", jkUrl, myCallback);
    expect(whitelistCache[jkDomain]).toEqual("domain");
    saveChangeToList("whitelist", jkUrl, myCallback);
    expect(whitelistCache[jkDomain]).toEqual("domain");
    saveChangeToList("blacklist", jkUrl, myCallback);
    expect(blacklistCache[jkDomain]).toEqual("domain");
    //delete
    saveChangeToList("blacklist", jkUrl, myCallback, true);
    saveChangeToList("whitelist", jkUrl, myCallback, true);
    expect(whitelistCache[jkDomain]).toEqual("deleted");
    expect(blacklistCache[jkDomain]).toEqual("deleted");
  });

});