var jkDomain = "www.jonathankoomjian.com";

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

describe("_saveToSync", function() {

  beforeEach(function() {
    window.whitelist = {};
    window.myCallback = function() {};
    if (!window['chrome']) window.chrome = {};
    chrome.storage = {
      sync: {
        'set': function(v1, v2){}
      }
    };
    spyOn(chrome.storage.sync, 'set');
  });

  it("calls sync correctly", function() {
    _saveToSync("http://www.jonathankoomjian.com/projects/", "domain", myCallback);
    var ar = {};
    ar[jkDomain] = "domain";
    expect(chrome.storage.sync.set).toHaveBeenCalled();
    expect(chrome.storage.sync.set.calls.argsFor(0)[0]).toEqual(ar);
  });

  it("updates the whitelist", function() {
    _saveToSync("http://www.jonathankoomjian.com/projects/", "domain", myCallback);
    expect(whitelist[jkDomain]).toEqual("domain");
  });

});