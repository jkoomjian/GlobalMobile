describe('isEnabled should', function() {

  beforeEach(function() {
    gmInit();
  });

  it('cache the return value', function() {
    // TODO
    spyOn(window, '_isEnabled').and.returnValue(false);
    expect( isEnabled(jkUrl) ).toBe(false);
    expect(window._isEnabled).toHaveBeenCalledTimes(1);
    // shouldn't call _isEnabled again
    expect( isEnabled(jkUrl) ).toBe(false);
    expect(window._isEnabled).toHaveBeenCalledTimes(1);
  });

  it('handle runOnce', function() {
    window.gmSync.runOnce = true;
    expect( _isEnabled(jkUrl) ).toBe(true);
  });

  it('handle disableOnce', function() {
    window.gmSync.disableOnce = true;
    expect( _isEnabled(jkUrl) ).toBe(false);
    window.gmSync.autoRun = true;
    expect( _isEnabled(jkUrl) ).toBe(false);
  });

  it('returns the correct value from whitelist', function() {
    window.gmSync.autoRun = false;
    expect( _isEnabled(jkUrl) ).toBe(false);
    window.gmSync.whitelist[jkDomain] = 'domain';
    expect( _isEnabled(jkUrl) ).toBe(true);
    window.gmSync.whitelist[jkDomain] = 'deleted';
    expect( _isEnabled(jkUrl) ).toBe(false);
  });

  it('returns the correct value from blacklist', function() {
    window.gmSync.autoRun = true;
    expect( _isEnabled(jkUrl) ).toBe(true);
    window.gmSync.blacklist[jkDomain] = 'domain';
    expect( _isEnabled(jkUrl) ).toBe(false);
    window.gmSync.blacklist[jkDomain] = 'deleted';
    expect( _isEnabled(jkUrl) ).toBe(true);
  });

  it('ignores whitelist on autoRun', function() {
    window.gmSync.autoRun = true;
    window.gmSync.whitelist[jkDomain] = 'domain';
    window.gmSync.blacklist[jkDomain] = 'domain';
    expect( _isEnabled(jkUrl) ).toBe(false);
  });

  it('ignores blacklist on autoRun=false', function() {
    window.gmSync.whitelist[jkDomain] = 'domain';
    window.gmSync.blacklist[jkDomain] = 'domain';
    expect( _isEnabled(jkUrl) ).toBe(true);
  });

  it('works on subdomains', function() {
    window.gmSync.whitelist[getDomain('www.ebay.com')] = 'domain';
    expect( _isEnabled('m.ebay.com/asdf') ).toBe(true);
  });

  it('handles nohome', function() {
    window.gmSync.whitelist[getDomain('www.jk.com')] = 'domain';
    window.gmSync.whitelist[getDomain('www.jk2.com')] = 'nohome';
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
