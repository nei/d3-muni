

// IIFE to not pollute global scope
(function() {

    'use strict';

    // controller for about view
    angular
        .module('app.landing')
        .controller('LandingController', LandingController);

    LandingController.$inject = ['$scope'];

    function LandingController($scope) {

        var vm = this;

    };

})();