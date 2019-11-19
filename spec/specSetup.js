// Common variables
var jkDomain = 'jonathankoomjian.com';
var jkUrl = 'http://www.jonathankoomjian.com/projects/';

window.browser = {
  runtime: {
    onMessage: {
      addListener: () => { }
    }
  },
  webRequest: {
    onBeforeSendHeaders: {
      addListener: () => {}
    }
  },
  webNavigation: {
    onCompleted: {
      addListener: () => {}
    }
  }
};