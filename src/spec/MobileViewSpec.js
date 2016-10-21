var customMatchers = {
  toMatchCss: function(util, customEqualityTesters) {
    return {
      compare: function(actual, expected) {
        var result = {};
        result.pass = false;

        if (expected !== undefined) {
          //expects css in the form [selector, {cssProp: cssVal}]
          result.pass = util.equals(actual[0], expected[0], customEqualityTesters) &&
                          util.equals(actual[1], expected[1], customEqualityTesters);
        }

        if (result.pass) {
          result.message = "Css matches!";
        } else {
          result.message = "Css doesn't match!";
          console.log("Css doesn't match: Expected: ");
          console.table(expected);
          console.log("Got:");
          console.table(actual);
        }
        return result;
      }
    };
  }
};


describe("VW units should be replaced with px for", function() {

  beforeEach(function() {
    jasmine.addMatchers(customMatchers);
  });

  it("basic vw units", function() {
    expect( _convertVwToPx("body {width: 100vw;}") ).toMatchCss( ["body", {width: '800px'}] );
    expect( _convertVwToPx("body {transform: translate(2vw, 0);}") ).toMatchCss( ["body", {transform: 'translate(16px, 0)'}] );
  });
  it("vw units in a larger set of css properties", function() {
    expect( _convertVwToPx("body {border: 1px dotted green; width: 100vw; color: red;}") ).toMatchCss( ["body", {width: '800px'}] );
  });
  it("vw units with a decimal, negative sign", function() {
    expect( _convertVwToPx("body {font-size: 1.66vw;}") ).toMatchCss( ["body", {'font-size': '13px'}] );
    expect( _convertVwToPx("body {left: -33vw;}") ).toMatchCss( ["body", {left: '-264px'}] );
  });
  it("not for content w/vw in it", function() {
    expect( _convertVwToPx("body {content: 'adsf234vwasdf'}") ).toMatchCss( ["body", {}] );
  });
  it("multiple vws in statement", function() {
    expect( _convertVwToPx("body {width: 2vw; height: 4vw;}") ).toMatchCss( ["body", {width: '16px', height: '32px'}] );
  });
  it("css rules w/multiple values", function() {
    expect( _convertVwToPx("body {text-shadow: rgb(0, 0, 0) 1vw 0px 12vw;}") ).toMatchCss( ["body", {'text-shadow': 'rgb(0, 0, 0) 8px 0px 96px'}] );
  });
});
