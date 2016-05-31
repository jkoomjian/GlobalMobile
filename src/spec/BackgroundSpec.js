describe("isEnabled should", function() {

  beforeEach(function() {
    gmInit();
  });

  it("cache the return value", function() {
    spyOn(window, '_isEnabled').and.returnValue(false);
    expect( isEnabled(jkUrl) ).toBe(false);
    expect(window._isEnabled).toHaveBeenCalledTimes(1);
    //shouldn't call _isEnabled again
    expect( isEnabled(jkUrl) ).toBe(false);
    expect(window._isEnabled).toHaveBeenCalledTimes(1);
  });

  it("handle runOnce", function() {
    window.runOnce = true;
    expect( isEnabled() ).toBe(true);
  });

  it("handle disableOnce", function() {
    window.disableOnce = true;
    expect( isEnabled() ).toBe(false);
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

});