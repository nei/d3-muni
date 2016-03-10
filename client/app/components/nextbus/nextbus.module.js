(function() {

    'use strict';

    angular
        .module('app.nextbus', [])
        .factory('xml2json', function ($window) {
        	return jQuery.xml2json; 
		});
})();