'use strict';

(function() {
    angular
        .module('app', [
            'ngRoute',
            'ngResource',
            'app.map',
            'app.nextbus',
            'app.d3'
        ]);
})();