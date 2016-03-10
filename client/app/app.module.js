(function() {
    'use strict';

    angular
        .module('app', [
            'ngRoute',
            'ngResource',
            'app.map',
            'app.nextbus',
            'app.d3'
        ]);
})();