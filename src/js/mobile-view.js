/*

   -------------------- Mobile View ---------------------

*/


/* ---------- Helpers ----------------*/
function _isCss(stylesheetObj) {
  return (typeof stylesheetObj === "object" && (stylesheetObj.rules || stylesheetObj.cssRules));
}

//Given an array of css selectors, and a media query rule, set the selectors to use the rule
function _applyMediaQuery(mQueries, mediaQueryText) {
  mQueries.forEach( mQuery => {
    try {
        mQuery.media.mediaText = mediaQueryText;
    } catch (err) {
        mQuery.conditionText = mediaQueryText;
    }
  });
}

function isStyleSheetFromSameOrigin(cssStyleSheet) {
  return !(cssStyleSheet.rules === null && cssStyleSheet.href);
}

//Apply some css to help style the mobile content
function applyBaseStyles() {
  var cssStr = "body {max-width: 800px !important; width: 66% !important; margin: 0 auto !important;}";
  var styleElem = document.createElement("style");
  document.querySelector("head").appendChild(styleElem);
  styleElem.innerHTML = cssStr;
}

//Run callback(cssRule) on each @import statement in css's rules
//@imports must be at the top of the file
function _applyToImports(css, callback) {
  rules = css.rules || css.cssRules;
  for (var i=0; i<rules.length; i++) {
    if (rules[i] instanceof CSSImportRule) {
      callback(rules[i]);
    } else {
      break;
    }
  }
}

//Given the source url of a css import, and the import url, return an
//absolute url pointing to the import file
function getAbsoluteUrl(relativeUrl, rootUrl) {
  return URI(relativeUrl).absoluteTo(rootUrl).toString();
}

function isUrlAbsolute(url) {
  return URI(url).is("absolute");
}

//Given a raw string of css containing @imports with relative urls,
//like @import url('./style.css') or @import "/style/main.css", and the base url,
//update all the urls to be correct and fully qualified.
function absolutizeAllRelativeUrlsInCss(baseUrl, cssStr) {
  var importRegex = /@import (["'])([^"']+)\1|@import url\((["']?)([^"')]+)\3\)/gi;
  // console.log("re baseUrl: " + baseUrl);
  // console.log(`input:\n ${cssStr}`);
  cssStr = cssStr.replace(importRegex, function(importRule){
    // console.log("re importRule: " + importRule);
    var url = arguments[2] || arguments[4];
    // console.log('re url: ' + url);
    var absUrl = getAbsoluteUrl(url, baseUrl);
    var absImportRule = importRule.replace(url, absUrl);
    // console.log(`absolute importRule: ${absImportRule}`);
    return absImportRule;
  });
  // console.log(`output:\n ${cssStr}`);
  return cssStr;
}


/* ---------- Main ----------------*/

/* Return an array of each stylesheet object in the page.
 * Must include files added with @import
 * Any Css file can @import multiple other csses, but the @imports must
 * be the first lines in the file.
 */
function runMV() {
  var docCsses = document.styleSheets;

  // loop through each stylesheet
  for (var i=0; i<docCsses.length; i++) {

    var parent = docCsses[i].ownerNode;
    var desc = parent.tagName.toUpperCase() == "STYLE" ? "inline style" : parent.href;
    console.log(`processing css: ${desc}`);
    console.dir(docCsses[i]);

    if (isStyleSheetFromSameOrigin(docCsses[i])) {
      processSameDomainCss(docCsses[i]);
    } else {
      processExternalDomainCss(docCsses[i]);
      i--; //processExternalDomainCss removes a stylesheet node from the dom
    }
  }

  applyBaseStyles();

  //force repaint
  var a = document.body.style.backgroundColor;
}

// Will need to be an asynchronous depth first recursion
function processSameDomainCss(css) {

    try {
        if ( _isCss(css) ) {

            //handle @imports in css
            _applyToImports(css, function(rule){
              //check for domain of @import
              if (rule.href && isUrlAbsolute(rule.href)) {
                //external domain
                processExternalDomainCssFromUrl(rule.href);
              } else {
                processSameDomainCss(rule.styleSheet);
              }
            });

            //Apply the new styling
            let queries = getMediaQueries(css);
            let seperatedQueries = seperateMQueriesToShowAndHide(queries);
            show(seperatedQueries[0]);
            hide(seperatedQueries[1]);
        }
    } catch (err) {
        console.dir(err);
        //FF doesn't let you inspect css loaded from other domains
    }
}

// Due to same domain policy, JS can't access the css rules of stylesheets loaded from external domains
// Insteas use cross-domain ajax to load the file, and inject it into the page as an inline style element
function processExternalDomainCss(css) {
  if (!css.href) return;
  processExternalDomainCssFromUrl(css.href);
  //remove the old css, so the stylesheet isn't loaded twice
  css.ownerNode.remove();
}

function processExternalDomainCssFromUrl(url) {
  console.log("requesting: " + url);
  var xhr = new XMLHttpRequest();
  xhr.addEventListener('load', _processExternalStylesheetOnLoad);
  xhr.open("GET", url, true);
  xhr.send();
}

function _processExternalStylesheetOnLoad(xhr) {
  xhr = xhr.target;
  var cssStr, styleElem;
  if (xhr.readyState == 4) {
    cssStr = xhr.response;

    //update all the @import urls - any relative url will point to the local site, instead of
    //the site where the css came from
    cssStr = absolutizeAllRelativeUrlsInCss(xhr.responseURL, cssStr);

    styleElem = document.createElement("style");
    document.querySelector("head").appendChild(styleElem);
    styleElem.innerHTML = cssStr;
    var css = styleElem.sheet;

    //can treat this as a same domain css, now that we have loaded it inline
    processSameDomainCss(css);
  }
}


/* Given a css, return an array of media rules in all the given csses */
function getMediaQueries(css) {
    var rules, mediaRules = [];

    try {
      rules = css.rules || css.cssRules;

      // loop through each rule
      for (let j in rules) {
        if (rules[j] instanceof CSSMediaRule) {
          mediaRules.push(rules[j]);
        }
      }
    } catch (err) {
        console.dir(err);
        //FF doesn't let you inspect css loaded from other domains
    }

    return mediaRules;
}

//Return [[Queries to show], [Queries to hide]]
function seperateMQueriesToShowAndHide(mQueries) {
  var show = [], hide = [], mediaText, appearsInMobile;

  for (let i=0; i<mQueries.length; i++) {

    //get the media query text
    try {
        mediaText = mQueries[i].media.mediaText; //doesn't work on FF
    } catch(err) {
        mediaText = mQueries[i].conditionText; //works in FF
    }

    //Test if this mediaquery is valid for mobile
    appearsInMobile = matchQuery(mediaText, {type : 'screen', width: '299px'});
    console.log( (appearsInMobile ? 'show' : 'hide') + ": " + mediaText );
    (appearsInMobile ? show : hide).push(mQueries[i]);
  }
  return [show, hide];
}

function show(mQueries) {
  _applyMediaQuery(mQueries, "(min-width: 1px)");
}

function hide(mQueries) {
  _applyMediaQuery(mQueries, "(max-width: 1px)");
}

// alert("hello world");
// chrome.browserAction.onClicked.addListener(function(tab) {
//     alert("mobile view loaded");
//     chrome.tabs.executeScript(tab.id, {'code': 'runMV()'});
//     // run()
// });

// document.addEventListener("DOMContentLoaded", function(event) {
  // console.log( matchQuery("(min-width: 1px)", {type : 'all', width: '300px'}) );
  // console.log( matchQuery("(max-width: 1px)", {type : 'all', width: '300px'}) );
// });