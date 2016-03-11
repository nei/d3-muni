/* jshint latedef: false, unused: false */

'use strict';

(function() {

    angular
        .module('app.nextbus', [])
        .factory('xml2json', function ($window) {
        	return (jQuery) ? jQuery.xml2json : $window.jQuery; 
		});
})();