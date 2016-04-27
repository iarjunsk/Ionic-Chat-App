angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    
  

   .state('tabsController.dashboard', {
    url: '/page2',
    views: {
      'tab1': {
        templateUrl: 'templates/dashboard.html',
        controller: 'dashboardCtrl'
      }
    }
  })

  .state('tabsController.chats', {
    url: '/page3',
    views: {
      'tab2': {
        templateUrl: 'templates/chats.html',
        controller: 'chatsCtrl'
      }
    }
  })

  .state('tabsController.settings', {
    url: '/page4',
    views: {
      'tab3': {
        templateUrl: 'templates/settings.html',
        controller: 'settingsCtrl'
      }
    }
  })

  .state('tabsController', {
    url: '/page1',
    templateUrl: 'templates/tabsController.html',
    abstract:true
  })

  .state('login', {
    url: '/page5',
    templateUrl: 'templates/login.html',
    controller: 'loginCtrl'
  })

  .state('tabsController.chatDetails', {
    url: '/page6',
    views: {
      'tab2': {
        templateUrl: 'templates/chatDetails.html',
        controller: 'chatDetailsCtrl'
      }
    }
  })
  
  .state('register', {
    url: '/page7',
    templateUrl: 'templates/register.html',
    controller: 'registerCtrl'
  })

$urlRouterProvider.otherwise('/page5')

  

});