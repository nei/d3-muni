(function () {
  'use strict';

  angular.module('app.d3')
    .factory('picasso', [function() {
        
        // Set dimensions of SVG element
        var map = {
            margin: { top: 30, right: 20, bottom: 50, left: 50 },
            sizes: {w: 760, h:600},
            center: [-122.5593367082541, 37.613752052748055],// centroid of neighborhoods
            scale: 259000
        }

        map.offset = [-150, map.sizes.h / 0.527];

        var tooltip = d3.select("body").append("div")
            .attr("class", "tooltip");

        // projection definition
        var projection = d3.geo.mercator()
            .scale(map.scale)
            .center(map.center)
            .translate(map.offset);

        // path
        var path = d3.geo.path()
            .projection(projection);

        return {
            map: map,
            path: path,
            projection: projection,
            tooltip: tooltip,
            drawBaseMap: drawBaseMap,
            drawRoutes: drawRoutes
        };
    }]);

function drawBaseMap(dataset) {

    var width = this.map.sizes.w;
    var height = this.map.sizes.h;
    var path = this.path;
    var centered;

    // Adds the svg canvas
    var canvas = d3.select("#chart-area")
        .append("div")
        .classed("svg-container", true)
        .append("svg")
            // .attr("preserveAspectRatio", "xMidYMid")
            // .attr("viewBox", '0 0 ' + Math.max(width, height) + ' ' + Math.min(width, height))
            // .classed("svg-content-responsive", true)
            .attr("width", width)
            .attr("height", height);

    var baseGroup = canvas.append('g').attr('id', 'base');
    

    // create a group for each type of element to avoid overlap
    canvas.append('g').attr('id', 'route');
    canvas.append('g').attr('id', 'busstop');
    canvas.append('g').attr('id', 'bus');

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

        
}

function drawRoutes(dataset, direction){

    var routes = _.where(dataset.routes, {selected: true});
    var path = this.path;
    var projection = this.projection;

    d3.selectAll('#route > path').remove();
    d3.selectAll('#bus > circle').remove();
    d3.selectAll('#busstop > circle').remove();

    _.each(routes, function(route){
        loadRoutesLine(route.tag, route, path);

        loadBusStops(route, direction, projection);

        var buses = _.filter(dataset.buses, {
            routeTag: route.tag
        });

        loadBuses(route, buses, direction, projection);
    });
}


function loadRoutesLine(currentRoute, routeData, path) {

    var canvas = d3.select('g#route');

    _.each(routeData.path, function(p) {
        _.each(p, function(d) {

            var paths = [];
            _.each(d, function(e) {
                paths.push([e.lon, e.lat]);
            });
            var links = [{
                type: "LineString",
                coordinates: paths
            }];

            canvas.selectAll(".line-" + currentRoute)
                .data(links)
                .enter()
                .append("path")
                .attr("d", path)
                .attr('class', 'route-path')
                .style({
                    'stroke': '#' + routeData.color
                });
        })
    });
}

function closeTooltip() {
    return d3.select('.tooltip')
        .transition()
        .duration(500)
        .style("opacity", 0)
        .attr("class", "tooltip");
}

function showTooltip(html, cssclass) {

    var tooltip = d3.select('.tooltip');

    tooltip.transition()
        .duration(200)
        .style("opacity", .9);

    tooltip.html(html)
        .style("left", (d3.event.pageX) + "px")
        .attr("class", function(d){
            return 'tooltip '+ cssclass;
        })
        .style("top", (d3.event.pageY - 28) + "px");
}

function loadBuses(route, jsonBuses, direction, projection) {

    var directionTitle = route.direction[direction].title || '';
    
    var numberOfBusesPlotted = d3.select('.g-route-' + route.tag)
        .selectAll('circle.circle-'+route.tag)
        .size();

    var gbuses = d3.select('g#bus');
    var buses = gbuses.selectAll('circle.circle-'+route.tag)
        .data(_.keys(jsonBuses));

    // Create new elements as needed.
    buses.enter().append("circle");

    var updateCoord = function(b, index) {
        var node = jsonBuses[b];
        return projection([node.lon, node.lat])[index];
    }

    if (numberOfBusesPlotted === 0) {
        buses.attr('class', 'circle-bus circle-'+route.tag)
            .attr('id', function(a) {
                return 'bus-' + a;
            })
            .attr('cx', function(d) {
                return updateCoord(d, 0)
            })
            .attr('cy', function(d) {
                return updateCoord(d, 1)
            })
            .attr('r', 7)
            .attr('fill', '#'+route.color)
            .attr('stroke', '#'+route.oppositeColor)
            .on("mouseover", function(busId) {
                var d = jsonBuses[busId];
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('r', 8);
                showTooltip('Bus id: ' + busId + '<br/>Route: ' + d.routeTag + '<br/>' + directionTitle + '<br/>Speed: ' + d.speedKmHr + ' Km/h', 'bus');
            })
            .on("mouseout", function(d) {
                closeTooltip();
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('r', 7);
            });
    } else {
        buses
            .transition()
            .duration(1500)
            .delay(function(d, i) {
                return i * 100;
            })
            .attr('fill', '#'+route.color)
            .attr('stroke', '#'+route.oppositeColor)
            .attr('cx', function(d) {
                return updateCoord(d, 0)
            })
            .attr('cy', function(d) {
                return updateCoord(d, 1)
            })
            .ease('linear');
    }

}

function loadBusStops(route, routeDirection, projection){

    // lets filter just the stops for the current route direction
    var validStops;
    if( route.direction[routeDirection].stop ){
        validStops = _.pluck(route.direction[routeDirection].stop, 'tag');
    }
    var directionTitle = route.direction[routeDirection].title || '';
    var stopsToDirection = _.filter(route.stop, function(o) {
        return _.contains(validStops, o.tag);
    });

    var canvas = d3.select('g#busstop');
    canvas
        .selectAll('.stop-' + route.tag)
        .data(stopsToDirection)
        .enter()
        .append('circle')
        .attr('cx', function(d) {
            return projection([d.lon, d.lat])[0];
        })
        .attr('cy', function(d) {
            return projection([d.lon, d.lat])[1];
        })
        .attr('fill', '#' + route.color)
        .attr('r', 3)
        .attr('stroke', '#' + route.oppositeColor)
        .attr('class', 'circle-busstop')
        .attr('id', function(d) {
            return 'stop-' + d.stopId
        })
        .on("mouseover", function(d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr('r', 6);
            showTooltip('<label>' + d.title + '</label><br/>' + d.tag + '<br/>' + directionTitle, 'stop');
        })
        .on("mouseout", function(d) {
            closeTooltip();
            d3.select(this)
                .transition()
                .duration(200)
                .attr('r', 3);
        });
}


}());