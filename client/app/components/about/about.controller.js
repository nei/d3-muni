
// IIFE to not pollute global scope
(function() {

    'use strict';

    // controller for about view
    angular
        .module('app.about')
        .controller('AboutController', AboutController);

    AboutController.$inject = ['$scope'];

    function AboutController($scope) {

    };

})();