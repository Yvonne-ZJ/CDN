var width = 700,
	height = 400;
var svg = d3.select("#my_dataviz")
	.append("svg")
	.attr("width", width)
	.attr("height", height);

// Tooltip
var tooltip = d3.select('body')
				.append('div')
    			.attr('class', 'hidden tooltip')
    			.style("visibility", "hidden");

// Projection
const projection = d3
	.geoEckert4()
	.scale(130)
    .translate([0.5 * width, 0.5 * height]);

// Path and Graticule
const path = d3.geoPath().projection(projection);
var graticule = d3.geoGraticule10();

// Color Scale
var colorScaleCases = d3.scaleThreshold()
  .domain([0, 100, 400, 800, 5000, 10000, 30000, 50000])
  .range(d3.schemeReds[9]);
var colorScaleDeath = d3.scaleThreshold()
  .domain([0, 50, 100, 200, 500, 1000, 5000, 10000])
  .range(d3.schemeBlues[9]);
var colorScaleTodayCases = d3.scaleThreshold()
	.domain([0, 5, 10, 50, 100, 200, 500, 1000])
	.range(d3.schemeGreens[9]);
var colorScales = d3.map()
	.set("cases", colorScaleCases)
	.set("deaths", colorScaleDeath)
	.set("todayCases", colorScaleTodayCases);

// Load External Data
var dataForMap = d3.map();
var promises = [
	d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
	d3.json("https://corona.lmao.ninja/v2/countries"),
	//d3.json("https://corona.lmao.ninja/v2/historical?lastdays=30")
];

// countries map
var countries;

Promise.all(promises).then(function(allData){
	var topo = allData[0];
	var example = allData[1];
	example.forEach(function(d){
		dataForMap.set(d.countryInfo.iso3, 
			{"flag": d.countryInfo.flag, "cases": +d.cases, "deaths": +d.deaths, "todayCases": +d.todayCases});
	});

	countries = ready(topo, countries);
});

// Data Toggle
var value = "cases";
function dataToggle(v){
	value = v;
	countries
		.attr("fill", function (d) {
      		d.total = 0;
      		if(dataForMap.has(d.id))
	        	d.total = +dataForMap.get(d.id)[value];
	        return colorScales.get(value)(d.total);
	    });
	    d3.select(".title-word").text(value.toUpperCase());
}

function ready(topo, countries) {
	svg
		.append("g")
		.attr("class", "grid")
		.append("path")
		.datum(graticule)
		.attr("class", "graticule")
		.attr("d", path)
		.attr("opacity", 0.8)
		.attr('stroke-width', '0.5px')
	    .attr('stroke', '#ccc')
	    .attr("fill", "none");


	var countries = svg
		.append("g")
		.attr("class", "geomap")
	    .selectAll(".country")
	    .data(topo.features)
	    .enter()
	    .append("path")
	    .attr("class", function(d){
	    	return "country " + d.id;
	    })
	    .attr("d", path)
	    // set the color of each country
      	.attr("fill", function (d) {
      		d.total = 0;
      		if(dataForMap.has(d.id))
	        	d.total = +dataForMap.get(d.id)[value];
	        return colorScaleCases(d.total);
	    })
	    .on("mouseover", function(d){
	    	if(dataForMap.has(d.id))
	    		tooltip.style("visibility", "visible")
	    			.html("<img class='flag' src='" + dataForMap.get(d.id)?.flag + "' alt=' '>"
                		+ "<span>" + d.properties.name + "</span>"
                		+ ":<br/>" + dataForMap.get(d.id)[value] + " cases");
	    })
	    .on("mousemove", function(d) {
            tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");
        })
        .on("mouseout", function() {
            return tooltip.style("visibility", "hidden");
        });
    return countries;
}
