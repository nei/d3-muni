(function() {

    'use strict';

    angular
        .module('app.map')
        .controller('MapController', MapController);

    MapController.$inject = [ '$scope', '$http', 'd3', 'nextbus', 'picasso', '$interval', '$sce'];

    function MapController($scope, $http, d3, nextbus, picasso, $interval, $sce) {

        var vm = this;

        var dataset;

        vm.routes = [];
        vm.routesSelected = [];
        vm.directions = {0:'Inbound', 1:'Outbound'};
        vm.directionSelected = 0;
        vm.messages = {};
        vm.timer = 15;

        // functions called from buttons 
        vm.chooseRoute = chooseRoute;
        vm.toggleSelection = toggleSelection;
        vm.hasMessage = hasMessage;
        vm.cleanRoutes = cleanRoutes;

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
                        _.extend(vm.routes[d.tag], {color: d.color, selected: false});
                        _.defaults(data[d.tag], {selected: false});
                    });
                    dataset.routes = data;
                    dataset.buses = {};
                });

            nextbus.getMessages()
                .then(function(data){
                    dataset.messages = data;
                });

            $interval(function() {

                vm.timer = Math.floor(nextbus.getTimers());

                // get the route codes
                if( vm.timer <= 1){
                    var updates = nextbus.checkUpdate(getRouteTags(vm.routesSelected));
                    _.each(updates, function(r){
                        chooseRoute(r);
                    });
                }

            }, 1000);
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

            if(newValue.length == 0 && oldValue.length >= 1){
                cleanRoutes();
            }
        });

        function getRouteTags(dataset){
            // array to check which tags is selected
            var tags = [];
            _.each(dataset, function(r){
                tags.push(r.tag);
            });
            return tags;
        };

        function cleanRoutes(){

            // keep the atribute selected (bool) updated
            dataset.routes = _.mapObject(dataset.routes, function(obj, key) {
                obj.selected = false;
                return obj;
            });

            picasso.drawRoutes(dataset, vm.directionSelected);
        };

        function chooseRoute(routes) {

            updateMessages();

            // get the route codes
            nextbus
                .getVehicleLocations(routes, vm.directionSelected)
                .then(function(data){
                    
                    dataset.buses = _.extend(dataset.buses, data);

                    picasso.drawRoutes(dataset, vm.directionSelected);
                });
        };

        function hasMessage(){
            return _.keys(vm.messages).length;
        };

        function updateMessages(){
            var applyTo;
            var inter;
            var routes = getRouteTags(vm.routesSelected);

            // check which message we are going to display
            var msgs = [];
            _.each(routes, function(route) {
                _.each(_.keys(dataset.messages), function(msg) {
                    if (_.contains(dataset.messages[msg].tags, route)) {
                        msgs.push(msg);
                    }
                    if (_.contains(dataset.messages[msg].tags, route) || _.contains(dataset.messages[msg].tags, 'All')) {
                        msgs.push(msg);
                    }
                });
            });

            msgs = _.uniq(msgs);

            // here we want to display the tags that this message is related to and 
            // which route is visible on map
            _.each(msgs, function(id) {
                var msgObj = dataset.messages[id];

                var applyTo;
                if (msgObj.tags.length == 1 && msgObj.tags[0] == 'All') {
                    applyTo = '<span class="badge all">All</span>';
                } else if (msgObj.tags.length > 1) {
                    applyTo = _.reduce(_.intersection(msgObj.tags, routes), function(memo, tag) {
                        return memo + '<span class="badge r-' + tag + '" style="background-color:#' + dataset.routes[tag].color + '">' + tag + '</span>';
                    }, '');
                }
                
                _.extend(msgObj, {
                    content: $sce.trustAsHtml(applyTo + ' ' + msgObj.priority + ' - ' + msgObj.text)
                });
                
                vm.messages[msgObj.id] = msgObj;
            });
        };

        function toggleSelection(route) {
            var idx = vm.routesSelected.indexOf(route);

            // is currently selected
            if (idx > -1) {
              vm.routesSelected.splice(idx, 1);
              vm.routes[route.tag].selected = false;
            }
            // is newly selected
            else {
              vm.routesSelected.push(route);
              vm.routes[route.tag].selected = true;
            }
        };
    };

})();