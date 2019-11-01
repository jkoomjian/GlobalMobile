describe("isEnabled should", function() {

  beforeEach(function() {
    gmInit();
  });

  it("cache the return value", function() {
    // TODO
    // spyOn(window, '_isEnabled').and.returnValue(false);
    // expect( isEnabled(jkUrl) ).toBe(false);
    // expect(window._isEnabled).toHaveBeenCalledTimes(1);
    // //shouldn't call _isEnabled again
    // // expect( isEnabled(jkUrl) ).toBe(false);
    // // expect(window._isEnabled).toHaveBeenCalledTimes(1);
  });

  it("handle runOnce", function() {
    window.runOnce = true;
    expect( _isEnabled(jkUrl) ).toBe(true);
  });

  it("handle disableOnce", function() {
    window.disableOnce = true;
    expect( _isEnabled(jkUrl) ).toBe(false);
    window.autoRunCache = true;
    expect( _isEnabled(jkUrl) ).toBe(false);
  });

  it("returns the correct value from whitelist", function() {
    window.autoRunCache = false;
    expect( _isEnabled(jkUrl) ).toBe(false);
    window.whitelistCache[jkDomain] = "domain";
    expect( _isEnabled(jkUrl) ).toBe(true);
    window.whitelistCache[jkDomain] = "deleted";
    expect( _isEnabled(jkUrl) ).toBe(false);
  });

  it("returns the correct value from blacklist", function() {
    window.autoRunCache = true;
    expect( _isEnabled(jkUrl) ).toBe(true);
    window.blacklistCache[jkDomain] = "domain";
    expect( _isEnabled(jkUrl) ).toBe(false);
    window.blacklistCache[jkDomain] = "deleted";
    expect( _isEnabled(jkUrl) ).toBe(true);
  });

  it("ignores whitelist on autoRun", function() {
    window.autoRunCache = true;
    window.whitelistCache[jkDomain] = "domain";
    window.blacklistCache[jkDomain] = "domain";
    expect( _isEnabled(jkUrl) ).toBe(false);
  });

  it("ignores blacklist on autoRun=false", function() {
    window.whitelistCache[jkDomain] = "domain";
    window.blacklistCache[jkDomain] = "domain";
    expect( _isEnabled(jkUrl) ).toBe(true);
  });

  it("works on subdomains", function() {
    window.whitelistCache[getDomain("www.ebay.com")] = "domain";
    expect( _isEnabled("m.ebay.com/asdf") ).toBe(true);
  });

  it("handles nohome", function() {
    window.whitelistCache[getDomain("www.jk.com")] = "domain";
    window.whitelistCache[getDomain("www.jk2.com")] = "nohome";
    expect( _isEnabled("http://www.jk.com/asdf") ).toBe(true);
    expect( _isEnabled("http://www.jk2.com/asdf") ).toBe(true);
    expect( _isEnabled("http://www.jk2.com") ).toBe(false);
    expect( _isEnabled("http://www.jk2.com/") ).toBe(false);
    expect( _isEnabled("http://www.jk2.com/?safd") ).toBe(false);
  });

});

describe("Is Homepage should", function() {
  it("works on homepages and non-homepages", function() {
    expect( isHomepage(jkUrl) ).toBe(false);
    expect( isHomepage("http://www.jonathankoomjian.com/") ).toBe(true);
    expect( isHomepage("http://www.jonathankoomjian.com") ).toBe(true);
    expect( isHomepage("http://www.nytimes.com/?adsf") ).toBe(true);
  });
});
