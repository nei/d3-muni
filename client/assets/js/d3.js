

// Dynamic, random dataset
var dataset = [];
var numDataPoints = 50;
var xRange = Math.random() * 1000;
var yRange = Math.random() * 1000;
for (var i = 0; i < numDataPoints; i++) {
    var newNumber1 = Math.round(Math.random() * xRange);
    var newNumber2 = Math.round(Math.random() * yRange);
    dataset.push([newNumber1, newNumber2]);
}

// width and height of inserted SVG element
var w = 500;
var h = 300;

var padding = 30;

var svg = d3.select("body")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

            
// ================================================================================
// SCALES
// ================================================================================

var xScale = d3.scale.linear()
                     .domain([0, d3.max(dataset, function(d) { return d[0]; })])
                     .range([padding, w - padding * 3]);


var yScale = d3.scale.linear()
                     .domain([0, d3.max(dataset, function(d) { return d[1]; })])
                     .range([h - padding, padding]);

var rScale = d3.scale.linear()
                     .domain([0, d3.max(dataset, function(d) { return d[1]; })])
                     .range([2, 5]);


// ================================================================================
// AXES
// ================================================================================

// x axis
var xAxis = d3.svg.axis()
            // tell the axis what scale to use (if there is one)
            .scale(xScale)
            // bottom is the default, but we can explicitly define other starting locations
            .orient("bottom")
            // set the number of ticks on our axis
            .ticks(5);

// Define Y axis
var yAxis = d3.svg.axis()
            // use our existing y scale function
            .scale(yScale)
            // orientation
            .orient("left")
            // ticks consistent with x axis
            .ticks(5);



// ================================================================================
// GRAPH
// ================================================================================

svg.selectAll("circle")
    .data(dataset)
    .enter()
    .append("circle")
    .attr("cx", function(d) {
        return xScale(d[0]);
    })
    .attr("cy", function(d) {
        return yScale(d[1]);
    })
    .attr("r", function(d) {
        return rScale(d[1]);
    })
    .transition()
    .delay(3000)
    .each("start", function() { d3.select(this).style("color", "green"); })
    .style("color", "red");


// here we call our axis in at the END so that it will be 'on top' of the other elements
svg.append("g")
    // here we attach a class of "axis" to the 'g' axis we just created so we can
    // style it with CSS
    .attr("class", "axis")  //Assign "axis" class
    // here we push the axis down to the bottom
    .attr("transform", "translate(0," + (h - padding) + ")")
    .call(xAxis);

//Create Y axis
svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + padding + ",0)")
    .call(yAxis);

d3.select("body").transition()
    .delay(3000)
    .each("start", function() { d3.select(this).style("color", "green"); })
    .style("color", "red");