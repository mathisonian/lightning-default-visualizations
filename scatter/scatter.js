var d3 = require('d3');

var inherits = require('inherits');
var utils = require('lightning-client-utils');

var margin = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 45
};


var ScatterPlot = function(selector, data, images, opts) {

    if(!opts) {
        opts = {};
    }

    var width = (opts.width || $(selector).width()) - margin.left - margin.right;
    var height = (opts.height || (width * 0.6)) - margin.top - margin.bottom;

    var self = this;

    if (data.hasOwnProperty('points')) {
        points = data.points

        if (data.hasOwnProperty('labels')) {
            var mn = d3.min(data.labels, function(d) {
                return d.k;
            });
            var mx = d3.max(data.labels, function(d) {
                return d.k;
            });
            var n = mx - mn + 1
            var colors = utils.getColors(n);
            points.map(function(d, i) {
                rgb = d3.rgb(colors[data.labels[i].k - mn])
                d.r = rgb.r
                d.g = rgb.g
                d.b = rgb.b
                return d})
        } else if (data.hasOwnProperty('colors')) {
            points.map(function(d, i) {
                d.r = data.colors[i].r
                d.g = data.colors[i].g
                d.b = data.colors[i].b
            })
        } else {
            points.map(function(d) {
                rgb = d3.rgb('#deebfa')
                d.r = rgb.r
                d.g = rgb.g
                d.b = rgb.b
            })
        }

    } else {

        points = data
        points.map(function(d) {
                rgb = d3.rgb('#deebfa')
                d.r = rgb.r
                d.g = rgb.g
                d.b = rgb.b
            })
    
    }

    var xDomain = d3.extent(points, function(d) {
            return d.x;
        });

    var yDomain = d3.extent(points, function(d) {
            return d.y;
        });

    var x = d3.scale.linear()
        .domain([xDomain[0] - 1, xDomain[1] + 1])
        .range([0, width]);

    var y = d3.scale.linear()
        .domain([yDomain[0] - 1, yDomain[1] + 1])
        .range([height, 0]);


    var zoom = d3.behavior.zoom()
        .x(x)
        .y(y)
        .on('zoom', zoomed);

    var svg = d3.select(selector)
        .append('svg')
        .attr('class', 'scatter-plot')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('svg:g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .call(zoom);

    svg.append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('class', 'plot');


    var makeXAxis = function () {
        return d3.svg.axis()
            .scale(x)
            .orient('bottom')
            .ticks(5);
    };

    var makeYAxis = function () {
        return d3.svg.axis()
            .scale(y)
            .orient('left')
            .ticks(5);
    };

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom')
        .ticks(5);

    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0, ' + height + ')')
        .call(xAxis);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left')
        .ticks(5);

    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);

    svg.append('g')
        .attr('class', 'x grid')
        .attr('transform', 'translate(0,' + height + ')')
        .call(makeXAxis()
                .tickSize(-height, 0, 0)
                .tickFormat(''));

    svg.append('g')
        .attr('class', 'y grid')
        .call(makeYAxis()
                .tickSize(-width, 0, 0)
                .tickFormat(''));

    // var clip = svg.append('svg:clipPath')
    //     .attr('id', 'clip')
    //     .append('svg:rect')
    //     .attr('x', 0)
    //     .attr('y', 0)
    //     .attr('width', width)
    //     .attr('height', height);

    // var chartBody = svg.append('g')
    //     .attr('clip-path', 'url(#clip)');

    // // chartBody.append('svg:path')
    // //     .datum(data)
    // //     .attr('class', 'line')
    // //     .attr('d', line);

    // draw dots
    
    svg.selectAll('.dot')
        .data(points)
        .enter().append('circle')
        .attr('class', 'dot')
        .attr('r', 6)
        //.style('fill',function(d) { return (d3.rgb(d.r, d.g, d.b));})
        //.style('stroke',function(d) { return (d3.rgb(d.r, d.g, d.b).darker(0.75));})
        .attr('transform', function(d) {
            return 'translate(' + x(d.x) + ',' + y(d.y) + ')';
        })
        
    function zoomed() {
        svg.select('.x.axis').call(xAxis);
        svg.select('.y.axis').call(yAxis);
        svg.select('.x.grid')
            .call(makeXAxis()
                .tickSize(-height, 0, 0)
                .tickFormat(''));
        svg.select('.y.grid')
            .call(makeYAxis()
                    .tickSize(-width, 0, 0)
                    .tickFormat(''));

        svg.selectAll('circle')
            .attr('transform', function(d) {
                return 'translate(' + x(d.x) + ',' + y(d.y) + ')';
            });
    }
    
    this.svg = svg;
    this.x = x;
    this.y = y;
    this.points = points;
};

inherits(ScatterPlot, require('events').EventEmitter);

module.exports = ScatterPlot;

ScatterPlot.prototype.updateData = function(data) {
    
    // update existing points, add new ones
    // and delete old ones
   
    var x = this.x
    var y = this.y
    
    var newdat = this.svg.selectAll('circle')
        .data(data.points)
        
    newdat.transition().ease('linear')
        .attr('class', 'dot')
        .attr('r',6)
        .attr('fill','black')
        .attr('transform', function(d) {
            return 'translate(' + x(d.x) + ',' + y(d.y) + ')';
        })
    
    newdat.enter()
        .append('circle')
        .transition().ease('linear')
        .style('opacity', 1.0)
        .attr('class','dot')
        .attr('r',6)
        .attr('transform', function(d) {
            return 'translate(' + x(d.x) + ',' + y(d.y) + ')';
        })
    
    newdat.exit().transition().ease('linear')
        .style('opacity', 0.0).remove()
    
}    

ScatterPlot.prototype.appendData = function(data) {
    
    // add new points to existing points
   
    this.points = this.points.concat(data.points)
    
    var x = this.x
    var y = this.y
    
    this.svg.selectAll('circle')
        .data(this.points)
        .enter().append('circle')
        .transition()
        .ease('linear')
        .style('opacity', 1.0)
        .attr('class', 'dot')
        .attr('r',6)
        .attr('fill','black')
        .attr('transform', function(d) {
            return 'translate(' + x(d.x) + ',' + y(d.y) + ')';
        })
};