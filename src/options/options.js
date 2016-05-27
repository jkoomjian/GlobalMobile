// Pull in methods from background page
// (but not jquery - else jquery will operate on the backgroundPage dom)
const gmbp = chrome.extension.getBackgroundPage();

var optionsApp = angular.module('optionsApp', ['ngRoute']);


/*----------- Routes ----------------*/
optionsApp.config(function($routeProvider){
  $routeProvider.when('/add-site', {
    templateUrl: '_add_site.html'
  });
  $routeProvider.otherwise({});
});


/*----------- Services ----------------*/
optionsApp.factory('chromeSync', function() {
  return {
    get: function(callback) {
      chrome.storage.sync.get('whitelist', callback);
    },
    saveToSync: function(siteUrl, callback, toDelete) {
      gmbp.saveChangeToList('whitelist', siteUrl, callback, toDelete);
    }
  };
});


/*----------- Controllers ----------------*/
optionsApp.controller('optionsController', function($scope, $route, $routeParams, $location, chromeSync, $timeout, $document) {
  $scope.sites = loadSites();
  $scope.autoRun = loadAutoRun();
  $scope.deleteSite = deleteSite;
  $scope.addSite = addSite;
  $scope.saveAutoRun = saveAutoRun;
  $scope.showAddNew = showAddNew;
  $scope.closeAddNew = closeAddNew;
  $scope.closeOptions = closeOptions;

  $document.bind("keyup", function(event) {
    if (event.keyCode == 27) {
      closeAddNew();
    }
  });

  function loadSites() {
    var sites = [];
    chromeSync.get(function(items) {
      items = items['whitelist'] || {};
      for (key in items) {
        if (items[key] == "domain") {
          sites.push(key);
        }
      }
      $scope.$digest(); //Force ang to check $scope for changes
    });
    return sites;
  }

  function deleteSite() {
    var siteUrl = this.site;
    var index = $scope.sites.findIndex( elem => elem === siteUrl );
    $scope.sites.splice(index, 1);
    chromeSync.saveToSync(siteUrl, null, true);
  }

  function addSite() {
    var siteUrl = document.getElementById("new-site").value;
    chromeSync.saveToSync(siteUrl, function() {
      $scope.sites = loadSites();
      document.getElementById("new-site").value = "";
    });
    closeAddNew();
  }

  function loadAutoRun() {
    chrome.storage.sync.get("autoRun", function(items) {
      $scope.autoRun = !!items["autoRun"];
      $scope.$digest();
    });
    return false;
  }

  function saveAutoRun() {
    var checkbox = document.getElementById("autoRunCheckbox");
    gmbp.autoRunCache = checkbox.checked;
    chrome.storage.sync.set({autoRun: checkbox.checked ? "true" : ""});
  }

  function showAddNew() {
    $location.path("/add-site"); //same as window.location
    $timeout(function () {
      //Supposedly this runs on ondomready when no timer arg is given - seems like it works
      document.getElementById("new-site").focus();
    });
  }

  function closeAddNew(event) {
    //Prevent bubbling - really difficult in angular :(
    if (!event || $(event.target).hasClass("lightbox") || $(event.target).hasClass("close") ) {
      window.location = "#";
    }
  }

  function closeOptions() {
    chrome.tabs.getCurrent( tab => {
      chrome.tabs.remove(tab.id);
    });
  }

});