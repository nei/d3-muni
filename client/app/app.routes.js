
// NOTE TO SELF
// $routeProvider templateUrl is relative to the 'index.html' file

angular
    .module('app')
    .config(config);

config.$inject = [ '$routeProvider', '$locationProvider', '$httpProvider' ];

function config($routeProvider, $locationProvider, $httpProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'app/components/map/map.view.html',
            controller: 'MapController',
            controllerAs: 'vm'
        })
        .otherwise({
            redirectTo: '/'
        });

    // use the HTML5 History API
    // also removed the hash from our URL path to clean things up
    // the require base is new as of angular 1.4.2 (circa July 2015)
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });

};