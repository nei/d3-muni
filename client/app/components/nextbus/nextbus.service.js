(function () {
  'use strict';

  angular.module('app.nextbus')
    .factory('nextbus', ['$http', '$q', 'xml2json', function($http, $q, xml2json) {

    	var deferred = $q.defer();
    	var endpoint = 'http://webservices.nextbus.com/service/publicXMLFeed';
	    var agency = 'sf-muni';
	    var busTimer = [];
	    var routeBuses = [];
	    var directions = {0:'Inbound',1:'Outbound'};

	    var getRouteList = function () {
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

	    var vehicleLocations = function (route, direction, callback) {

	        var t = (busTimer[route]) ? busTimer[route] : 0;
	        var dir = ( direction === 0 )?'I':'O';
	        if(!routeBuses[route]){
	            routeBuses[route] = {};
	        }

	        $.ajax({
	            url: endpoint+'?command=vehicleLocations&a='+agency+'&r='+route+'&t='+t,
	            dataType: 'xml',
	            success: function(response) {
	                var data = $.xml2json(response);
	                busTimer[route] = data.lastTime.time;

	                 _.each(data.vehicle, function(n){
	                    if(n.id>0){
	                        var busOb = {
	                            id: n.id,
	                            lat: n.lat,
	                            lon: n.lon,
	                            routeTag: n.routeTag,
	                            dirTag: n.dirTag,
	                            speedKmHr: n.speedKmHr                                
	                        };
	                        routeBuses[route][n.id] = busOb;
	                    }
	                });

	                // lets plot just the buses that are on the right direction
	                var re = /[_]+(.)_.*/;
	                var filteredBuses = _.filter(routeBuses[route], function(b){
	                    var testDir = re.exec(b.dirTag);
	                    return (testDir !== null && testDir[1] === dir);
	                });
	                callback(null, filteredBuses);
	            }
	        });
	    };

	    return {
	        getRouteList: getRouteList,
	        getRouteConfig: getRouteConfig,
	        messages: messages,
	        vehicleLocations: vehicleLocations
	    };

    }]);

}());