/*
 * Vw units mess up everything - they reference the real viewport with, not the
 * fake width.
 * Replace them with px
 */
const cssStmtRe = new RegExp(/([\w-]+):\s*(.*?)[;\}]/g);
const vwRe = /(-?\d+(\.\d+)?vw)($|;|\s|,|\))/g;

// convert vw to px - the new body will be 800px
const pxPerVw = Math.floor(800 / 100);

// Checks for vw units, converts to px units, applies the updated styles
function replaceVwWithPx(css) {
  let rules = css.rules || css.cssRules;
  for (let i=0; i<rules.length; i++) {
    if (rules[i] instanceof CSSStyleRule && rules[i].cssText.match(vwRe)) {
      let [selector, vwProps] = _convertVwToPx(rules[i].cssText, rules[i]);
      // apply new px value to elem
      $(selector).css(vwProps);
    }
  }
}

function _convertVwToPx(cssText) {
  try {
    // get the values to update
    let selector = cssText.match(/^(.+?)\s*\{/)[1];
    let r, vwProps = {};
    while((r = cssStmtRe.exec(cssText)) != null) {
      if (r[2].match(vwRe)) vwProps[ r[1] ] = r[2];
    }

    Object.keys(vwProps).forEach( key => {
      let vwValStmt = vwProps[key];
      vwProps[key] = vwValStmt.replace(vwRe, (match, m1, m2, m3, m4, matchingStmt) => {
        let vwVal = parseFloat(m1.replace('vw', ''));
        let pxVal = Math.floor(vwVal * pxPerVw) + 'px';
        return match.replace(m1, pxVal);
      });
    });

    return [selector, vwProps];
  } catch (ex) {
    console.table(ex);
    return ['', {}];
  }
}