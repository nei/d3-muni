$(function() {

    var gNeighborhoods;
    var gArteries;
    var gStreets;
    var gRoutes;
    var live = false;
    var refreshBus;

    try {

        var dataMapping = {
            messages: [],
            routes: [],
            routesConfig: []
        };
        var tooltip;
        var endpoint = 'http://webservices.nextbus.com/service/publicXMLFeed';

        var width = '800',
            height = '600';

        // centroid of neighborhoods
        var center = [-122.5593367082541, 37.613752052748055];
        var scale = 259000;
        var offset = [-150, height / 0.527];

        // projection definition
        var projection = d3.geo.mercator()
            .scale(scale)
            .center(center)
            .translate(offset);

        // path
        var path = d3.geo.path()
            .projection(projection);

        var canvas = d3.select('#map')
            .append('svg')
            .attr("width", '100%')
            .attr("height", '100%')
            .attr('preserveAspectRatio', 'xMidYMid')
            .attr('viewBox', '0 0 ' + Math.max(width, height) + ' ' + Math.min(width, height));

        canvas.append("rect")
            .attr("height", height)
            .attr("width", width)
            .attr('class', 'ocean');

        // Define the div for the tooltip
        tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        async.series({
            routes: function(callback) {

                nextbusWebservice.routeList(function(err, json) {
                    _.extend(dataMapping, {
                        routes: json
                    });
                    updateRouteFilters();
                    callback();
                });

            },
            neighborhoods: function(callback) {
                d3.json('./sfmaps/neighborhoods.json', function(err, data) {
                    canvas.append('g').attr('id', 'neighborhoods')
                        .selectAll('.neighborhood')
                        .data(data.features)
                        .enter().append('path')
                        .attr('class', 'neighborhood land')
                        .attr('d', path);
                    canvas.append('g').attr('id', 'neighborhood-labels')
                        .selectAll(".neighborhood-label")
                        .data(data.features)
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
                    callback(err);
                });
            },
            arteries: function(callback) {
                d3.json('./sfmaps/arteries.json', function(err, data) {
                    var ga = canvas.append('g').attr('id', 'arteries')
                        .selectAll('.artery-path')
                        .data(data.features)
                        .enter().append('svg:path')
                        .attr('class', 'artery-path')
                        .attr('d', path);
                    callback(err);
                });
            },
            freeways: function(callback) {
                d3.json('./sfmaps/freeways.json', function(err, data) {

                    var gf = canvas.append('g').attr('id', 'freeways')
                        .attr("height", height)
                        .attr("width", width)
                        .attr('id', 'freeways');

                    gf.selectAll('.freeway-path')
                        .data(data.features)
                        .enter().append('svg:path')
                        .attr('class', 'freeway-path')
                        .attr('d', path);

                    callback(err);
                });
            },
            streets: function(callback) {
                d3.json('./sfmaps/streets.json', function(err, data) {
                    // streets
                    var gs = canvas.append('g').attr('id', 'streets')
                        .selectAll('.street-path')
                        .data(data.features)
                        .enter().append('svg:path')
                        .attr('class', 'street-path')
                        .attr('d', path);

                    callback(err);
                });
            },
            routeConfig: function(callback) {
                var gr = canvas.append('g').attr('id', 'routes');
                nextbusWebservice.routeConfig(function(err, json) {
                    _.extend(dataMapping, {
                        routesConfig: json
                    });

                    _.each(json, function(r) {
                        $('label[for=route-' + r.tag + ']').css('background-color', '#' + r.color);
                        gr.append('g').attr('class', 'g-route-' + r.tag);
                    });

                    callback();
                });

            },
            messages: function(callback) {
                nextbusWebservice.messages(function(err, json) {
                    _.extend(dataMapping, {
                        messages: json
                    });
                    callback(null);
                });
            }
        }, function(err) {

            if (err) console.log(err)

            $('input[name=route]').change(function() {
                $(this).parent().toggleClass("badge-selected");
                if (false === $(this).prop("checked")) {
                    $(document).trigger('removeRoute', [$(this).val()]);
                } else {
                    $(document).trigger('updateRoutes');
                }
            });

            $('input[name=direction]').change(function() {
                $('.filter-by-direction > label').removeClass('badge-selected');
                $(this).parent().toggleClass("badge-selected");
                $(document).trigger('updateRoutes');
            });

            $('.loading').hide();
        });

        // events
        $(document).on("updateRoutes", function(event) {
            updateRoute();
            updateMessageTable();
        });

        $(document).on("removeRoute", function(event, route) {

            // remove all the elements grouped by the route
            setTimeout(function() {
                canvas.select('.g-route-' + route).selectAll('*').remove();
            }, 600);

            // remove notifications for this route
            $('.notification tr.msg-' + route).remove();

            // delete messages for the routes
            updateMessageTable();

            // remove interval with no more buses exists
            if (d3.selectAll('.circle-bus').size() <= 0) {
                window.clearInterval(refreshBus);
            }
        });

        function closeTooltip() {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0)
                .attr("class", "tooltip");
        }

        function showTooltip(html, cssclass) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(html)
                .style("left", (d3.event.pageX) + "px")
                .attr("class", cssclass)
                .style("top", (d3.event.pageY - 28) + "px");
        }

        function loadRoutesLine(g, currentRoute, routeData) {
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

                    g.selectAll(".line-" + currentRoute)
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

        function updateRouteFilters() {
            //lets group the stops numbers and letters
            var RouteTags = _.groupBy(_.pluck(dataMapping.routes, 'tag'), function(n) {
                return (/[^\d+]/.exec(n)) ? true : false;
            });

            $(RouteTags.true).each(function(i, route) {
                $('.filter-by-routes').append("<label class='badge' for='route-" + route + "'><input type='checkbox' value='" + route + "' name='route' id='route-" + route + "'>" + route + "</label>");
            });

            $(RouteTags.false).each(function(i, route) {
                $('.filter-by-routes').append("<label class='badge' for='route-" + route + "'><input type='checkbox' value='" + route + "' name='route' id='route-" + route + "'>" + route + "</label>");
            });
        }

        function getDirection() {
            return $('input[name=direction]:checked').val();
        }

        function updateRoute() {

            var routeDirection = getDirection();
            var routes = getSelectedRoutes();
            _.each(routes, function(currentRoute) {

                var routeData = dataMapping.routesConfig[currentRoute];

                // lets filter just the stops for the current route direction
                var validStops = _.pluck(routeData.direction[routeDirection].stop, 'tag');
                var directionTitle = routeData.direction[routeDirection].title || '';
                var stopsToDirection = _.filter(routeData.stop, function(o) {
                    return _.contains(validStops, o.tag);
                });

                var gstop = canvas.select('.g-route-' + currentRoute);

                loadRoutesLine(gstop, currentRoute, routeData);

                gstop
                    .selectAll('.stop-' + currentRoute)
                    .data(stopsToDirection)
                    .enter()
                    .append('circle')
                    .attr('cx', function(d) {
                        return projection([d.lon, d.lat])[0];
                    })
                    .attr('cy', function(d) {
                        return projection([d.lon, d.lat])[1];
                    })
                    .attr('fill', '#' + routeData.color)
                    .attr('r', 3)
                    .style("opacity", 0.8)
                    .attr('stroke', '#' + routeData.oppositeColor)
                    .attr('stroke-width', '2px')
                    .attr('id', function(d) {
                        return 'stop-' + d.stopId
                    })
                    .on("mouseover", function(d) {
                        d3.select(this)
                            .transition()
                            .duration(200)
                            .attr('r', 6);
                        showTooltip('<label>' + d.title + '</label><br/>' + d.tag + '<br/>' + directionTitle, 'tooltip');
                    })
                    .on("mouseout", function(d) {
                        tooltip.transition()
                            .duration(500)
                            .style("opacity", 0);
                        d3.select(this)
                            .transition()
                            .duration(200)
                            .attr('r', 3);
                    });

                loadRouteBuses(currentRoute);
            });
        }

        function getSelectedRoutes() {
            return $(':checkbox[name=route]:checked').map(function() {
                return this.value;
            });
        }

        function checkAndUpdate() {
            _.each(getSelectedRoutes(), function(r) {
                loadRouteBuses(r)
            });
        }

        function updateMessageTable() {

            var routes = getSelectedRoutes();
            $('.notification tr.route').remove();

            if (routes.length == 0) {
                $('.notification tbody tr').first().show();
            } else {
                $('.notification tbody tr').first().hide();
            }

            var msgs = [];
            _.each(routes, function(route) {
                _.each(_.keys(dataMapping.messages), function(msg) {
                    if (_.contains(dataMapping.messages[msg].tags, route)) {
                        msgs.push(msg);
                    }
                    if (_.contains(dataMapping.messages[msg].tags, route) || _.contains(dataMapping.messages[msg].tags, 'All')) {
                        msgs.push(msg);
                    }
                });
            });

            msgs = _.uniq(msgs);

            _.each(msgs, function(id) {
                var msg = dataMapping.messages[id];

                var applyTo;
                if (msg.tags.length == 1 && msg.tags[0] == 'All') {
                    applyTo = '<span class="badge all">All</span>';
                } else if (msg.tags.length > 1) {
                    applyTo = _.reduce(_.intersection(msg.tags, routes), function(memo, tag) {
                        return memo + '<span class="badge r-' + tag + '" style="background-color:#' + dataMapping.routesConfig[tag].color + '">' + tag + '</span>';
                    }, '');
                }
                $('.notification > tbody').append('<tr class="route"><td class="' + msg.class + '">' + applyTo + ' ' + msg.priority + ' - ' + msg.text + '</td></tr>');
            });
        }

        function countBusPlottedForRoute(route) {
            return d3.select('.g-route-' + route)
                .selectAll('circle.circle-bus')
                .size();
        }

        function loadRouteBuses(route) {

            var busRadio = 7;
            var direction = getDirection();
            var directionTitle = dataMapping.routesConfig[route].direction[direction].title || '';
            var numberOfBusesPlotted = countBusPlottedForRoute(route);

            nextbusWebservice.vehicleLocations(route, direction, function(err, jsonBuses) {

                var gbuses = canvas.select('.g-route-' + route);
                var buses = gbuses.selectAll('circle.circle-bus')
                    .data(_.keys(jsonBuses));

                // Create new elements as needed.
                buses.enter().append("circle");

                moving = function() {
                    //Move to bottom
                    d3.select(this)
                        .transition()
                        .duration(1200)
                        .each("end", function() {
                            //Move to top
                            d3.select(this)
                                .transition()
                                .duration(1200)
                                .attr('fill', 'yellow')
                                .attr("r", busRadio);
                        });
                };

                var updateCoord = function(b, index) {
                    var node = jsonBuses[b];
                    return projection([node.lon, node.lat])[index];
                }

                if (numberOfBusesPlotted === 0) {
                    buses.attr('class', 'circle-bus')
                        .attr('id', function(a) {
                            return 'bus-' + a;
                        })
                        .attr('cx', function(d) {
                            return updateCoord(d, 0)
                        })
                        .attr('cy', function(d) {
                            return updateCoord(d, 1)
                        })
                        .attr('r', busRadio)
                        .attr('fill', 'yellow')
                        .style("opacity", 0.7)
                        .on("mouseover", function(busId) {
                            var d = jsonBuses[busId];
                            d3.select(this)
                                .transition()
                                .duration(200)
                                .attr('r', busRadio + 1);
                            showTooltip('Bus id: ' + busId + '<br/>Route: ' + d.routeTag + '<br/>' + directionTitle + '<br/>Speed: ' + d.speedKmHr + ' Km/h', 'tooltip-bus');
                        })
                        .on("mouseout", function(d) {
                            closeTooltip();

                            d3.select(this)
                                .transition()
                                .duration(200)
                                .attr('r', busRadio);
                        });
                } else {
                    buses
                        .transition()
                        .duration(1500)
                        .delay(function(d, i) {
                            return i * 10;
                        })
                        .attr('fill', 'white')
                        .attr('cx', function(d) {
                            return updateCoord(d, 0)
                        })
                        .attr('cy', function(d) {
                            return updateCoord(d, 1)
                        })
                        .attr('r', busRadio + 1)
                        .each("end", moving)
                        .ease('linear');
                }
            });

            if (false === live) {
                refreshBus = setInterval(function() {
                    checkAndUpdate();
                }, 15000);
                live = true;
            }
        }

    } catch (err) {
        console.log(err)
    }

});