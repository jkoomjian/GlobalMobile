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