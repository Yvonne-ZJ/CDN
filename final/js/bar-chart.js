// tooltip
var tooltip2 = d3.select('body')
				.append('div')
    			.attr('class', 'hidden tooltip')
    			.style("visibility", "hidden");

// selection button
var selectionBtn = $( "#country-select" );

// selected country
var selectedCountry;

// margin
var margin = { left:80, right:10, top:10, bottom:150 };

// width and height
var width = 1100 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom;

// parse the date / time
var parseTime = d3.timeParse("%m/%d/%y");
var formatDay = d3.timeFormat("%B %d");

// transition
var t = d3.transition().duration(1000);

// svg
var svg2 = d3.select("#bar-chart")
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)

var g = svg2.append("g")
	.attr("transform", "translate(" + margin.left + ", "
			+ margin.top + ")")
	.attr("class", "bars")

// tool line
var toolline = g.append("line")
	.attr("class", "toolline")
    .style("visibility", "hidden");

g.append("text")
	.attr("class", "y axis-label")
	.attr("x", -(height / 2))
	.attr("y", -70)
	.attr("font-size", "12px")
	.attr("text-anchor", "middle")
	.attr("transform", "rotate(-90)")
	.attr("fill", "white")
	.text("Confirmed Cases");

d3.json("https://cdn.jsdelivr.net/gh/Yvonne-ZJ/CDN@1.0/final/con1.json").then(function(data){
//	https://github.com/Yvonne-ZJ/YvonneZhao/blob/master/con1.json
//https://github.com/robinson911/robinson911/blob/master/ljweibo.json

//https://raw.githubusercontent.com/robinson911/robinson911/master/ljweibo.json
//d3.json("https://raw.githubusercontent.com/Yvonne-ZJ/YvonneZhao/master/con1.json").then(function(data){
//d3.json("con1.json",function(data) {
//d3.json("https://corona.lmao.ninja/v2/historical?lastdays=400").then(function(data){
	// initiate country selection values:
	data.forEach(function(d, i){
		if(d.province == null){
			selectionBtn.append(`<option value="${d.country}">${d.country}</option>`); 
		} else{
			selectionBtn.append(`<option value="${d.country + "-" + d.province}">${d.country + "-" + d.province}</option>`); 
		}
	});

	var timeline = Object.keys(data[0].timeline.cases);

	// x and y
	var x = d3.scaleTime()
		.domain(d3.extent(timeline, function(d){
			return parseTime(d);
		}))
		.range([0, width])
		// .paddingInner(0.2)
		// .paddingOuter(0.2);

	var y = d3.scaleLinear()
		.domain([0, 10000])
		.range([height, 0]);

	var xAxisCall = d3.axisBottom(x)
		.ticks(10)
		.tickFormat(function(d){
			return formatDay(d);
		});
	g.append("g")
		.attr("class", "x-axis")
		.attr("transform", "translate(0, " + height + ")")
		.call(xAxisCall)
		.selectAll("text")
			.attr("y", 12)
			.attr("x", 3)
			.attr("font-size", "8px")
			.attr("fill", "white")
    		.style("text-anchor", "middle");

	var yAxisCall = d3.axisLeft(y)
		.ticks(5)
		.tickFormat(function(d){
			return d;
		});
	g.append("g")
		.attr("class", "y-axis")
		.call(yAxisCall)
		.selectAll("text")
		.attr("fill", "white");

	// grid lines
	// add the X gridlines
    g.append("g")			
        .attr("class", "grid")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxisCall
            .tickSize(-height)
            .tickFormat("")
        )

  // add the Y gridlines
    g.append("g")			
        .attr("class", "grid")
        .call(yAxisCall
            .tickSize(-width)
            .tickFormat("")
        )

	// update(data, x, y, xAxisCall, yAxisCall, selectedCountry);

	$(document).ready(function(){
	    $(selectionBtn).change(function(){
	        selectedCountry = $(this).children("option:selected").val();
	        update(data, x, y,xAxisCall, yAxisCall, selectedCountry);
	    });
	});
});


function update(data, x, y, xAxisCall, yAxisCall, selectedCountry){

	// ENTER new elements present in new data.
    if(selectedCountry != null && selectedCountry != "Select a country"){
    	var country = selectedCountry.split("-");
    	var filteredData;
    	if(country.length == 2){
    		filteredData = data.filter(obj => {
			  return obj.country === country[0] && obj.province === country[1];
			});
    	} else{
    		filteredData = data.filter(obj => {
			  return obj.country === country[0];
			});
    	}

    	filteredData = filteredData[0].timeline.cases;

    	var dataForChart = [];
    	for(date in filteredData){
    		dataForChart.push({"date": date, "case": +filteredData[date]});
    	}


    	y.domain([0, d3.max(Object.values(filteredData))]);

		x.domain(d3.extent(Object.keys(filteredData), function(d){
			return parseTime(d);
		}));

		// JOIN new data with old elements.
	    var rects = g.selectAll("rect")
        .data(dataForChart);

		// // EXIT old elements not present in new data.
	    rects.exit()
	        .attr("fill", "red")
	    .transition(t)
	        .attr("y", y(0))
	        .attr("height", 0)
	        .remove();
	    d3.select(".x-axis").remove();
	    d3.select(".y-axis").remove();

		xAxisCall = d3.axisBottom(x)
		.ticks(10)
		.tickFormat(function(d){
			return formatDay(d);
		});
		g.append("g")
			.attr("class", "x-axis")
			.attr("transform", "translate(0, " + height + ")")
			.call(xAxisCall)
			.selectAll("text")
				.attr("y", 12)
				.attr("x", 3)
				.attr("font-size", "8px")
				.attr("fill", "white")
	    		.style("text-anchor", "middle");

		yAxisCall = d3.axisLeft(y)
		g.append("g")
			.attr("class", "y-axis")
			.call(yAxisCall)
			.selectAll("text")
			.attr("fill", "white");

		rects.enter()
    		.append("rect")
    			.attr("fill", "grey")
	            .attr("y", y(0))
	            .attr("height", 0)
	            .attr("x", function(d){ return x(parseTime(d.date)); })
            	.attr("width", 8)
            	.on("mouseover", function(d){
            		d3.select(this).style("fill", "white");
			    	tooltip2.style("visibility", "visible")
			    			.html("<span>" + d.date + ":" + "</span>"
		                		+ "<br/>" + parseInt(d.case) + " cases");
			    	toolline.attr("x1", 0) 
					    .attr("y1", y(parseInt(d.case))) 
					    .attr("x2", x(parseTime(d.date)))    
					    .attr("y2", y(parseInt(d.case)))
					    .style("visibility", "visible"); 
			    })
			    .on("mousemove", function(d) {
		            tooltip2.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");
		        })
		        .on("mouseout", function() {
		        	d3.select(this).style("fill", "grey");
		            tooltip2.style("visibility", "hidden");
		            toolline.style("visibility", "hidden");
		        })
            // AND UPDATE old elements present in new data.
            .merge(rects)
            .transition(t)
				.attr("y", function(d){ return y(parseInt(d.case)); })
				.attr("x", function(d){ 
					return x(parseTime(d.date)); })
				.attr("width", 8)
				.attr("height", function(d){ 
					return height - y(parseInt(d.case)); });
    }
}






