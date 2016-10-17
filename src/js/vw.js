/*
 * Vw units mess up everything - they reference the real viewport with, not the
 * fake width.
 * Replace them with px
 */
const vwRe = new RegExp(/([\w-]+):\s*(-?\d+(\.\d+)?vw);/g);

// Passes rules with vw units to _convertVwToPx, applies the updated styles
function replaceVwWithPx(css) {
  let rules = css.rules || css.cssRules;
  for (let i=0; i<rules.length; i++) {
    if (rules[i] instanceof CSSStyleRule) {
      if (rules[i].cssText.match(/\d+vw[;\s]/)) {
        let [selector, vwProps] = _convertVwToPx(rules[i].cssText, rules[i]);
        // apply new px value to elem
        $(selector).css(vwProps);
      }
    }
  }
}

function _convertVwToPx(cssText) {
  try {
    // get the values to update
    let selector = cssText.match(/^(.+?)\s*\{/)[1];
    let r, vwProps = {};
    while((r = vwRe.exec(cssText)) != null) {
      vwProps[ r[1] ] = r[2];
    }

    // convert vw to px - the new body will be 800px
    // let pxPerVw = Math.floor( document.body.offsetWidth / 100 );
    let pxPerVw = Math.floor(800 / 100);

    Object.keys(vwProps).forEach( key => {
      let vwVal = parseFloat(vwProps[key].replace('vw', ''));
      let pxVal = Math.floor(vwVal * pxPerVw);
      vwProps[key] = pxVal + "px";
    });

    return [selector, vwProps];
  } catch (ex) {
    console.table(ex);
  }
}