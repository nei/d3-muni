

// IIFE to not pollute global scope
(function() {

    // enforce variable declarations and others
    'use strict';

    // controller for about view
    angular
        .module('app.demo')
        .controller('DemoController', DemoController);

    DemoController.$inject = [ '$scope', '$http', 'd3', 'drawGraph' ];

    function DemoController($scope, $http, d3, drawGraph) {

        // bindables up top
        var vm = this;
        // two dates the user enters on 'demo.view.html'
        vm.userDate1;
        vm.userDate2;
        // functions called from buttons on 'demo.view.html'
        vm.generateGraph = generateGraph;
        vm.resetGraph = resetGraph;

        // function call upon controller instantiation
        activate();

        /////////////////////////////////////////////////

        function activate() {

            //Hide the tooltip box until graph is drawn
            d3.select("#tooltip").classed("hidden", true);

            // INITIAL GRAPH DRAW WITH FULL API DATA
            // =======================================================================
            $http.get("https://www.quandl.com/api/v1/datasets/FRED/GDP.json?auth_token=hnqzyDsDyLFLY8yW5Yr5&collapse=annual")
                .success(function(data, status, headers, config) {

                    drawGraph(data);

                // end $http.get success
                })
                // end $http.get request
                .error(function(data) {
                    console.log("API Error");
                });
        };

        /////////////////////////////////////////////////

        // watch for updates to the two date fields
        $scope.$watch('vm.userDate1', function() {
            console.log('vm.userDate1 updated!');
        });

        $scope.$watch('vm.userDate2', function() {
            console.log('vm.userDate2 updated!');
        });

        // function to generate dynamic chart based on user inputted dates
        // =======================================================================
        function generateGraph() {

            // angular async call to Quandl API using user input data
            $http.get("https://www.quandl.com/api/v1/datasets/FRED/GDP.json?auth_token=hnqzyDsDyLFLY8yW5Yr5&collapse=annual&trim_start=" + vm.userDate1 + "-12-31&trim_end=" + vm.userDate2 + "-12-31")

                // on success of API call...
                .success(function(data, status, headers, config) {

                    // remove the existing graph and replace it
                    d3.select("div.svg-container").remove();

                    // redraw graph with new data
                    drawGraph(data);

                // end $http.get success
                })
                // end $http.get request
                .error(function(data) {
                    console.log("API Error");
                });

        // end generateGraph() function
        };

        // this resets the graph to the default 1949-2014 date range
        // this function is called from the 'demo.view.html' page 'reset' button
        // =======================================================================
        function resetGraph() {
            $http.get("https://www.quandl.com/api/v1/datasets/FRED/GDP.json?auth_token=hnqzyDsDyLFLY8yW5Yr5&collapse=annual")
                .success(function(data, status, headers, config) {

                    // clear text input boxes
                    vm.userDate1 = null;
                    vm.userDate2 = null;

                    // remove the existing graph and replace it
                    d3.select("div.svg-container").remove();

                    // redraw graph with full data set
                    drawGraph(data);

                // end $http.get success
                })
                // end $http.get request
                .error(function(data) {
                    console.log("API Error");
                });

        // END RESET GRAPH FUNCTION
        };
    // end 'demoController'
    };

})();