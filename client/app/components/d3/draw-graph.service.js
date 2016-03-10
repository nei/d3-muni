(function () {
  'use strict';

  angular.module('app.d3')
    .factory('drawGraph', [function() {
        return function(dataset) {

            // Set dimensions of SVG element
            var margin = { top: 30, right: 20, bottom: 50, left: 50 },
                w = 800,
                h = 600;
                var barPadding = 1;

            // centroid of neighborhoods
            var center = [-122.5593367082541, 37.613752052748055];
            var scale = 259000;
            var offset = [-150, h / 0.527];

            // projection definition
            var projection = d3.geo.mercator()
                .scale(scale)
                .center(center)
                .translate(offset);

            // path
            var path = d3.geo.path()
                .projection(projection);

            // Adds the svg canvas
            var canvas = d3.select("#chart-area")
                .append("div")
                .classed("svg-container", true)
                .append("svg")
                    .attr("preserveAspectRatio", "xMidYMid")
                    .attr("viewBox", '0 0 ' + Math.max(w, h) + ' ' + Math.min(w, h))
                    .classed("svg-content-responsive", true)
                    .attr("width", '100%')
                    .attr("height", '100%')
                .append("g")
                    .attr("transform",
                          "translate(" + margin.left + "," + margin.top + ")");

            var baseGroup = canvas.append('g')
                .attr('id', 'base');

            baseGroup
                .selectAll('.neighborhood')
                .data(dataset.neighborhoods.features)
                .enter().append('path')
                .attr('class', 'neighborhood land')
                .attr('d', path);


            baseGroup
                .append('g').attr('id', 'streets')
                .selectAll('.street-path')
                .data(dataset.streets.features)
                .enter().append('svg:path')
                .attr('class', 'street-path')
                .attr('d', path);
            

            baseGroup
                .selectAll('.artery-path')
                .data(dataset.arteries.features)
                .enter().append('svg:path')
                .attr('class', 'artery-path')
                .attr('d', path);

            baseGroup
                .selectAll('.freeway-path')
                .data(dataset.freeways.features)
                .enter().append('svg:path')
                .attr('class', 'freeway-path')
                .attr('d', path);

            baseGroup
                .selectAll(".neighborhood-label")
                .data(dataset.neighborhoods.features)
                .enter().append("svg:text")
                .attr("class", "neighborhood-label")
                .attr("x", function(d) {
                    return path.centroid(d)[0];
                })
                .attr("y", function(d) {
                    return path.centroid(d)[1];
                })
                .attr("dy", "0.35em")
                .text(function(d) {
                    return d.properties.neighborho;
                });


            // svg.selectAll("rect")
            //     .data(dataset)
            //     .enter()
            //     .append("rect")
            //     .attr("x", function(d, i) {
            //         return i * (w / dataset.length);
            //     })
            //     .attr("y", function(d) {
            //         return y(d[1]);
            //     })
            //     .attr("width", w / dataset.length - barPadding)
            //     .transition().delay(function (d, i) {
            //         return i * 50;
            //     })
            //     .duration(50)
            //     .attr("height", function(d) {
            //         return h - y(d[1]);
            //     })
            //     .attr("y", function(d) {
            //         return y(d[1]);
            //     })
            //     .attr("fill", "#1C72FC");

            // populate the popups on mouse over
            // svg.selectAll("rect")
            //     .on("mouseover", function(d) {

            //         // change bar cover on hover
            //         d3.select(this)
            //         .transition()
            //         .duration(50)
            //         .attr("fill", "#333");

            //         //Get this bar's x/y values, then augment for the tooltip
            //         var xPosition = parseFloat(d3.select(this).attr("x")) + x / 2;
            //         var yPosition = parseFloat(d3.select(this).attr("y")) / 2 + h / 2;

            //         //Update the tooltip position and value
            //         d3.select("#tooltip")
            //             .style("left", "140px")
            //             .style("top", "160px")
            //             .select("#year")
            //             .text(d[0].getFullYear());

            //         d3.select("#tooltip")
            //             .select("#value")
            //             .text('$' + d[1].toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'));

            //         //Show the tooltip
            //         d3.select("#tooltip").classed("hidden", false);

            //     })
            //     .on("mouseout", function(d) {
            //         d3.select(this)
            //         .transition()
            //         .duration(50)
            //         .attr("fill", "#1C72FC");

            //         //Hide the tooltip
            //         d3.select("#tooltip").classed("hidden", true);
            //     });


            // // Add the X Axis
            // svg.append("g")
            //     .attr("class", "x axis")
            //     .attr("transform", "translate(0," + h + ")")
            //     .call(xAxis);

            // // Add the Y Axis
            // svg.append("g")
            //     .attr("class", "y axis")
            //     .call(yAxis);

            // // y-axis label
            // svg.append("text")
            //     .attr("class", "y label")
            //     .attr("text-anchor", "end")
            //     .attr("y", 6)
            //     .attr("dy", ".75em")
            //     .attr("transform", "rotate(-90)")
            //     .text("GDP (Billions USD)");
        };
    }])
    .factory('drawRoutes', [function() {
        return function(dataset) {

        };
    }]);

}());