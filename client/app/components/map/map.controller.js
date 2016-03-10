(function() {

    'use strict';

    angular
        .module('app.map')
        .controller('MapController', MapController);

    MapController.$inject = [ '$scope', '$http', 'd3', 'nextbus', 'drawGraph'];

    function MapController($scope, $http, d3, nextbus, drawGraph) {

        var vm = this;

        vm.routes = [];
        vm.routesSelected = [];
        vm.directions = {0:'Inbound', 1:'Outbound'};
        vm.directionSelected = 0;

        // functions called from buttons 
        vm.chooseRoute = chooseRoute;
        vm.resetGraph = resetGraph;
        vm.toggleSelection = toggleSelection;

        // function call upon controller instantiation
        activate();

        function activate() {

            //Hide the tooltip box until graph is drawn
            d3.select("#tooltip").classed("hidden", true);

            $http.get("/assets/json/all.json")
                .success(function(data, status, headers, config) {
                    drawGraph(data);
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
                    console.log(data)
                });

        };

        $scope.$watch('vm.directionSelected', function() {
            console.log('vm.directionSelected updated!', vm.directionSelected);
        });

        $scope.$watchCollection('vm.routesSelected', function(newValue, oldValue) {
            console.log('vm.routesSelected updated!', vm.routesSelected, newValue, oldValue);
        });

        function chooseRoute() {

            // get the route codes
            nextbus.getRouteConfig().then(function(data){
                //vm.routes = data;

                // remove the existing graph and replace it
                d3.select("div.svg-container").remove();

                // redraw graph with new data
                drawGraph(data);
            });

        };

        // this resets the graph to the defaults
        function resetGraph() {
            $http.get("/assets/json/all.json")
                .success(function(data, status, headers, config) {

                    // clear text input boxes
                    vm.routesSelected = [];
                    vm.direction = 0;

                    // remove the existing graph and replace it
                    d3.select("div.svg-container").remove();

                    // redraw graph with full data set
                    drawGraph(data);
                })
                // end $http.get request
                .error(function(data) {
                    console.log("API Error");
                });
        };

        function toggleSelection(route) {
            var idx = vm.routesSelected.indexOf(route);

            // is currently selected
            if (idx > -1) {
                console.log('toggleSelection remove '+route.tag)
              vm.routesSelected.splice(idx, 1);
            }
            // is newly selected
            else {
                console.log('toggleSelection add '+route.tag)
              vm.routesSelected.push(route);
            }
        };
    };

})();