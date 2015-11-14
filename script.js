console.log("Assignment 5");

var margin = {t:50,r:100,b:50,l:50};
var width = document.getElementById('map').clientWidth - margin.r - margin.l,
    height = document.getElementById('map').clientHeight - margin.t - margin.b;

var canvas = d3.select('.canvas');
var map = canvas
    .append('svg')
    .attr('width',width+margin.r+margin.l)
    .attr('height',height + margin.t + margin.b)
    .append('g')
    .attr('class','canvas')
    .attr('transform','translate('+margin.l+','+margin.t+')');

//TODO: set up a mercator projection, and a d3.geo.path() generator
//Center the projection at the center of Boston
var bostonLngLat = [-71.088066,42.315520]; //from http://itouchmap.com/latlong.html
var MerProjection = d3.geo.mercator()
    .scale(190000)
    .center(bostonLngLat)
    .translate([width/2,height/2])
    //...

var path = d3.geo.path().projection(MerProjection);

//TODO: create a color scale
var colorScale = d3.scale.linear().domain([0,100000]).range(['rgb(255, 255, 255)','rgb(255, 102, 0)'])

var ScaleR = d3.scale.linear().domain([3000,30000]).range([width,height])

//TODO: create a d3.map() to store the value of median HH income per block group
var incomeById = d3.map()

//TODO: import data, parse, and draw
queue()
    .defer(d3.json,"data/bos_census_blk_group.geojson")
    .defer(d3.json,"data/bos_neighborhoods.geojson")
    .defer(d3.csv,'data/acs2013_median_hh_income.csv',parseData)
    .await(function(err,census,neighbors){
        console.log(census);
        console.log(neighbors);

        draw(census,neighbors)

            });
function draw(census,neighbors) {
    var chunk = map.selectAll('.blk')
            .data(census.features)
            .enter()
            .append('g')
            .attr('class', 'boston')
        chunk.append('path')
            .attr('class', 'blk')
            .attr('d', path)
        .   style('fill', function (d) {

            var blkrate = incomeById.get(d.properties.geoid)
            //console.log(blkrate);
            return colorScale(blkrate);

        })
        chunk.on('mouseenter',mouseEnter)
            .on('mouseleave',mouseLeave)

    var node = map.selectAll('.neighbors')
        .data(neighbors.features)
        .enter()
        .append('g')
        .attr('class', 'boston')

    node.append('circle')
        .attr('class', 'neighbors')
        .attr('cx',function(d){
                return path.centroid(d)[0]
            })
        .attr('cy',function(d){
                return path.centroid(d)[1]
            })
        .attr('r', 10)
        .style('fill-opacity',0)

    node.append('text')
        .attr('class','neighbor name')
        .attr('transform',function(d){
            var xy = path.centroid(d) ;
            return 'translate('+xy[0]+','+xy[1]+')';
        })
        .text(function(d){
            return d.properties.Name
        })
        .attr('text-anchor','middle')
        .attr('font-family','sans-serif')
        .style('font-size',function(d){
            return Math.min(2 * ScaleR(+d.properties.SHAPE_area), (2 * ScaleR(+d.properties.SHAPE_area) - 8)/ this.getComputedTextLength() * 24 ) + "px"
        })

}

function parseData(d){
    incomeById.set(d.geoid,+d.B19013001)
    //console.log(incomeById);
}

function mouseEnter(d){
    console.log(d)
    var tooltip = d3.select('.custom-tooltip')
        .style('opacity',1)

    var position = d3.mouse(canvas.node())

    var income = incomeById.get(d.properties.geoid)

    tooltip.style('left', (position[0]+10)+'px')
            .style('top', (position[1]+10)+'px')

    tooltip.select('#value')
        .html(income)
}

function mouseLeave(d){
    var tooltip =d3.select('.custom-tooltip')
        .style('opacity',0)

}


