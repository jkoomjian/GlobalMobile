/*----------- Code Shared Between background.js, options.js, and content scripts ----------------*/
/** 
 * Common functions which do not depend on the addon's WebExtension API.
 * Can be used in both background.js context an page context.
 */
function isActiveDomain(domainValue) {
  return domainValue == 'domain' || domainValue == 'nohome';
}

function getDomain(url) {
  if (url.indexOf('http') !== 0) {
    url = 'http://' + url;
  }
  var a = document.createElement('a');
  a.href = url;
  var domain = a.hostname;

  // Remove subdomain, if present
  if (domain.split('.').length === 3) {
    let splits = domain.split('.');
    domain = splits[ splits.length - 2 ] + '.' + splits[ splits.length - 1 ];
  }

  return domain;
}
