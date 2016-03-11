(function() {

    'use strict';

    angular
        .module('app.map')
        .controller('MapController', MapController);

    MapController.$inject = [ '$scope', '$http', 'd3', 'nextbus', 'picasso', '$interval'];

    function MapController($scope, $http, d3, nextbus, picasso, $interval) {

        var vm = this;

        var dataset;

        vm.routes = [];
        vm.routesSelected = [];
        vm.directions = {0:'Inbound', 1:'Outbound'};
        vm.directionSelected = 0;
        vm.timer = 15;

        // functions called from buttons 
        vm.chooseRoute = chooseRoute;
        vm.toggleSelection = toggleSelection;

        // function call upon controller instantiation
        activate();

        function activate() {

            //Hide the tooltip box until graph is drawn
            d3.select("#tooltip").classed("hidden", true);

            $http.get("/assets/json/all.json")
                .success(function(data, status, headers, config) {
                    dataset = data;
                    picasso.drawBaseMap(dataset);
                })
                .error(function(data) {
                    console.log("API Error");
                });

            // get the route codes
            nextbus.getRouteList()
                .then(function(data){
                    vm.routes = data;
                });

            nextbus.getRouteConfig()
                .then(function(data){
                    // copy the color to routeList
                    _.each(data, function(d){
                        _.extend(vm.routes[d.tag], {color: d.color});
                        _.defaults(data[d.tag], {selected: false});
                    });
                    dataset.routes = data;
                    dataset.buses = {};
                });

            $interval(function() {

                vm.timer = Math.floor(nextbus.getTimers() );

                // get the route codes
                if( vm.timer <= 1){
                    var updates = nextbus.checkUpdate(getRouteTags(vm.routesSelected));
                            
                    _.each(updates, function(r){
                        chooseRoute(r);
                    });
                }

            }, 900);
        };

        $scope.$watch('vm.directionSelected', function(newValue, oldValue) {
            if(newValue && dataset){
                picasso.drawRoutes(dataset, vm.directionSelected);
            }
        });

        $scope.$watchCollection('vm.routesSelected', function(newValue, oldValue) {
            if(vm.routesSelected.length){

                // array to check which tags is selected
                var tagsSelected = getRouteTags(newValue);
                var tagsToLoad = _.difference(tagsSelected, getRouteTags(oldValue));

                // keep the atribute selected (bool) updated
                dataset.routes = _.mapObject(dataset.routes, function(obj, key) {
                    obj.selected = _.contains(tagsSelected, key) ? true : false;
                    return obj;
                });

                chooseRoute(tagsToLoad[0]);
            }
        });

        function getRouteTags(dataset){
            // array to check which tags is selected
            var tags = [];
            _.each(dataset, function(r){
                tags.push(r.tag);
            });
            return tags;
        }

        function chooseRoute(routes) {

            // get the route codes
            nextbus
                .getVehicleLocations(routes, vm.directionSelected)
                .then(function(data){
                    
                    dataset.buses = _.extend(dataset.buses, data);

                    picasso.drawRoutes(dataset, vm.directionSelected);
                });

        };

        function toggleSelection(route) {
            var idx = vm.routesSelected.indexOf(route);

            // is currently selected
            if (idx > -1) {
              vm.routesSelected.splice(idx, 1);
            }
            // is newly selected
            else {
              vm.routesSelected.push(route);
            }
        };
    };

})();