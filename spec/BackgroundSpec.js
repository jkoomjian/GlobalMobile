describe('isEnabled should', function() {

  beforeEach(function() {
    gmInit();
  });

  it('cache the return value', function() {
    spyOn(window, '_isEnabled').and.returnValue(false);
    expect( isEnabled(jkUrl) ).toBe(false);
    expect(window._isEnabled).toHaveBeenCalledTimes(1);
    // shouldn't call _isEnabled again
    expect( isEnabled(jkUrl) ).toBe(false);
    expect(window._isEnabled).toHaveBeenCalledTimes(1);
  });

  it('handle runOnce', function() {
    window.gmState.runOnce = true;
    expect( _isEnabled(jkUrl) ).toBe(true);
  });

  it('handle disableOnce', function() {
    window.gmState.disableOnce = true;
    expect( _isEnabled(jkUrl) ).toBe(false);
    window.gmState.autoRun = true;
    expect( _isEnabled(jkUrl) ).toBe(false);
  });

  it('returns the correct value from whitelist', function() {
    window.gmState.autoRun = false;
    expect( _isEnabled(jkUrl) ).toBe(false);
    window.gmState.whitelist[jkDomain] = 'domain';
    expect( _isEnabled(jkUrl) ).toBe(true);
    window.gmState.whitelist[jkDomain] = 'deleted';
    expect( _isEnabled(jkUrl) ).toBe(false);
  });

  it('returns the correct value from blacklist', function() {
    window.gmState.autoRun = true;
    expect( _isEnabled(jkUrl) ).toBe(true);
    window.gmState.blacklist[jkDomain] = 'domain';
    expect( _isEnabled(jkUrl) ).toBe(false);
    window.gmState.blacklist[jkDomain] = 'deleted';
    expect( _isEnabled(jkUrl) ).toBe(true);
  });

  it('ignores whitelist on autoRun', function() {
    window.gmState.autoRun = true;
    window.gmState.whitelist[jkDomain] = 'domain';
    window.gmState.blacklist[jkDomain] = 'domain';
    expect( _isEnabled(jkUrl) ).toBe(false);
  });

  it('ignores blacklist on autoRun=false', function() {
    window.gmState.whitelist[jkDomain] = 'domain';
    window.gmState.blacklist[jkDomain] = 'domain';
    expect( _isEnabled(jkUrl) ).toBe(true);
  });

  it('works on subdomains', function() {
    window.gmState.whitelist[getDomain('www.ebay.com')] = 'domain';
    expect( _isEnabled('m.ebay.com/asdf') ).toBe(true);
  });

  it('handles nohome', function() {
    window.gmState.whitelist[getDomain('www.jk.com')] = 'domain';
    window.gmState.whitelist[getDomain('www.jk2.com')] = 'nohome';
    expect( _isEnabled('http://www.jk.com/asdf') ).toBe(true);
    expect( _isEnabled('http://www.jk2.com/asdf') ).toBe(true);
    expect( _isEnabled('http://www.jk2.com') ).toBe(false);
    expect( _isEnabled('http://www.jk2.com/') ).toBe(false);
    expect( _isEnabled('http://www.jk2.com/?safd') ).toBe(false);
  });

});

describe('Is Homepage should', function() {
  it('works on homepages and non-homepages', function() {
    expect( isHomepage(jkUrl) ).toBe(false);
    expect( isHomepage('http://www.jonathankoomjian.com/') ).toBe(true);
    expect( isHomepage('http://www.jonathankoomjian.com') ).toBe(true);
    expect( isHomepage('http://www.nytimes.com/?adsf') ).toBe(true);
  });
});
