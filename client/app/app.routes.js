/* jshint latedef: false, unused: false */

'use strict';

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
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });

}