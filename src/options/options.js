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
    get: function(listName, callback) {
      chrome.storage.sync.get(listName, function(items) {
        items = items[listName] || {};
        callback(items);
      });
    },
    saveToSync: function(listName, siteUrl, callback, toDelete) {
      gmbp.saveChangeToList(listName, siteUrl, callback, toDelete);
    }
  };
});


/*----------- Controllers ----------------*/
optionsApp.controller('optionsController', function($scope, $route, $routeParams, $location, chromeSync, $timeout, $document) {
  $scope.whitelist = loadList('whitelist');
  $scope.blacklist = loadList('blacklist');
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

  function loadList(listName) {
    var sites = [];
    chromeSync.get(listName, function(items) {
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
    var listName = ($scope.autoRun ? 'black' : 'white') + 'list';
    var index = $scope[listName].findIndex( elem => elem === siteUrl );
    $scope[listName].splice(index, 1);
    chromeSync.saveToSync(listName, siteUrl, null, true);
  }

  function addSite() {
    var siteUrl = this.newSiteBox;
    var listName = ($scope.autoRun ? 'black' : 'white') + 'list';
    chromeSync.saveToSync(listName, siteUrl, function() {
      $scope[listName] = loadList(listName);
    });
    $("#new-site").value = "";
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
      $("#new-site").focus();
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