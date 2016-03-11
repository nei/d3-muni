(function () {
  'use strict';

  angular.module('app.nextbus')
    .factory('nextbus', ['$http', '$q', 'xml2json', '$interval', function($http, $q, xml2json, $interval) {

    	var endpoint = 'http://webservices.nextbus.com/service/publicXMLFeed';
	    var agency = 'sf-muni';
	    var busTimer = [];
	    var routeBuses = [];
	    var directions = {0:'Inbound',1:'Outbound'};

	    var getRouteList = function () {
	    	var deferred = $q.defer();
	        $http({
	             url: endpoint + '?command=routeList&a='+agency,
	             method: 'GET',
	             dataType: 'xml',
	             cache: true
	        }).then(function successCallback(response) {
			    return deferred.resolve(_.indexBy(xml2json(response.data).route,'tag'));
			}, function errorCallback(response) {
			    deferred.reject(response);
			});
			return deferred.promise;
	    };

	    var getRouteConfig = function () {
	    	var deferred = $q.defer();
	        $http({
	             url: endpoint + '?command=routeConfig&a='+agency,
	             method: 'GET',
	             dataType: 'xml',
	             cache: true
	        }).then(function successCallback(response) {
			    return deferred.resolve(_.indexBy(xml2json(response.data).route,'tag'));
			}, function errorCallback(response) {
			    deferred.reject(response);
			});
			return deferred.promise;
	    };

	    var messages = function (callback) {
	        $.ajax({
	            url: endpoint+'?command=messages&a='+agency,
	            dataType: 'xml',
	            success: function(response) {
	                var data = $.xml2json(response);
	                var routeMessages = (_.isArray(data.route)) ? data.route : [data.route];
	                var messages = [];

	                var priorityClasses = {
	                    Low: 'bg-info',
	                    Normal: 'bg-warning',
	                    High: 'bg-danger'
	                };

	                // lets standardize the message structure
	                _.each(routeMessages, function(m){
	                    if(m.message.id){
	                        var tags = _.filter(_.pluck(m.message.routeConfiguredForMessage, 'tag'), function(f){ return f !== undefined});
	                        messages[m.message.id] = {
	                            id: m.message.id,
	                            class: priorityClasses[m.message.priority],
	                            tags: (tags.length > 0) ? tags : ['All'],
	                            priority: m.message.priority,
	                            text: m.message.text
	                        };
	                    }else{
	                        _.each(m.message, function(m){
	                            if(m.id){
	                                messages[m.id] = {
	                                    id: m.id,
	                                    class: priorityClasses[m.priority],
	                                    tags: [m.tag] || ['All'],
	                                    priority: m.priority,
	                                    text: m.text
	                                };
	                            }
	                        });
	                    }
	                });

	                callback(null, messages);
	            }
	        });
	    };

	    var getVehicleLocations = function (route, direction) {
	    	var deferred = $q.defer();

	        var t = (busTimer[route]) ? busTimer[route] : 0;
	        var dir = ( direction === 0 )?'I':'O';
	        if(!routeBuses[route]){
	            routeBuses[route] = {};
	        }

	        $http({
	            url: endpoint+'?command=vehicleLocations&a='+agency+'&r='+route+'&t='+t,
	            dataType: 'xml',
	            method: 'GET',
	            cache: false
	        }).then(function(response) {
                var data = xml2json(response.data);
                busTimer[route] = data.lastTime.time;

                 _.each(data.vehicle, function(n){
                    if(n.id>0){
                        routeBuses[route][n.id] = n;
                    }
                });

                // lets plot just the buses that are on the right direction
                var re = /[_]+(.)_.*/;
                var filteredBuses = _.filter(routeBuses[route], function(b){
                    var testDir = re.exec(b.dirTag);
                    return (testDir !== null && testDir[1] === dir);
                });

                filteredBuses = _.indexBy(filteredBuses, 'id');

                return deferred.resolve(filteredBuses);
            }, function errorCallback(response) {
			    deferred.reject(response);
			});

	        return deferred.promise;
	    };

	    // check the hash of timers and return the routes that needs update
	    var checkUpdate = function (routes, time) {
	    	var updates = [];
	    	var inter = _.intersection(routes, _.keys(busTimer));
	    	_.each(inter, function(t){

    			var last = busTimer[t];
        		var now = new Date().getTime();
        		var diff = (now-last)/1000;

        		if( diff > 13){
        			updates.push(t);
        		}
            });
            return updates;
	    };

	    // return the min timer
	    var getTimers = function (time) {
	    	var time = time || 15;
	    	var timers = [];
	    	_.each(_.keys(busTimer), function(last){

        		var now = new Date().getTime();
        		var diff = (now-busTimer[last])/1000;

        		timers.push(diff);
            });

            return (timers.length) ? (time-_.min(timers)) : 0;
	    };

	    return {
	        getRouteList: getRouteList,
	        getRouteConfig: getRouteConfig,
	        messages: messages,
	        getVehicleLocations: getVehicleLocations,
	        checkUpdate: checkUpdate,
	        getTimers: getTimers
	    };

    }]);

}());