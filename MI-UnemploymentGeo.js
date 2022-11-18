// Gather the SVG data and throw them into variables
var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var toggle = 1;
var coloration = "white";

// Creates a template tag
var rateById = d3.map();
var nameById = d3.map();

// Creates 9 color buckets for the data to throw into. 
var color = d3.scaleThreshold()
    .domain([1, 10, 50, 200, 500, 1000, 2000, 4000])
    .range(d3.schemeBuPu[9]);

d3.selectAll("body")
    .style("background-color", "#333333")
    .style("color", "white");

// X scale for the legend.
var x = d3.scaleSqrt()
    .domain([0, 4500])
    .rangeRound([440, 950]);

// Creates and appends new SVG to existing svg
var g = svg.append("g")
    .attr("class", "key")
    .attr("transform", "translate(0,40)");

// Creates a empty square
g.selectAll("rect")
  .data(color.range().map(function(d) {
      d = color.invertExtent(d);
      if (d[0] == null) d[0] = x.domain()[0]; // Sets the top and bottom bars to not render
      if (d[1] == null) d[1] = x.domain()[1];
      return d;
    }))
    .enter().append("rect") // Sets the rectangle to the legend
    .attr("height", 8)
    .attr("x", function(d) { return x(d[0]); }) // moves the rectangle to line up with the first X plot
    .attr("width", function(d) { return x(d[1]) - x(d[0]); }) // Stretches the rectangle with the last X plot
    .attr("fill", function(d) { return color(d[0]); }); // Colors the buckets

// Appends the legend text to the legend
g.append("text")
    .attr("class", "caption")
    .attr("x", x.range()[0])
    .attr("y", -6)
    .attr("fill", "white")
    .attr("text-anchor", "start") 
    .attr("font-weight", "bold")
    .text("Population per square mile");

// Create a tooltip div
var div = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

// Calls the tick marks to be rendered in
g.call(d3.axisBottom(x)
    .tickSize(13)
    .tickValues(color.domain()))
  .select(".domain")
    .remove();

// Selects the geoAlber Map
var projection = d3.geoAlbersUsa()
    .scale(7000)
    .translate([-400,1300]);
var path = d3.geoPath()
    .projection(projection);

// Forces all X to be white
    d3.selectAll("text")
        .style("fill", "white");

// Parse data
d3.queue()
    .defer(d3.json, "mi-topodata.json")
    .defer(d3.csv, "mi-density.csv", function(d) { rateById.set(d.id, +d.density); }) //nameById
    .defer(d3.csv, "mi-density.csv", function(d) { nameById.set(d.id, d.name); })
    .await(ready);

// Render the map
function ready(error, us) {
  if (error) throw error;
    console.log(us);
    console.log(topojson.feature(us, us.objects.counties));
    
  svg.append("g")
      .attr("class", "counties")
    .selectAll("path")
      .data(topojson.feature(us, us.objects.counties).features)
    .enter().append("path")
      .attr("fill", function(d) { return color(rateById.get(d.id)); }) // Replace this with color
      .attr("d", path)
    // Tool Tip
    .on("mouseover", function(d) {		
        div.transition()		
        .duration(200)		
            .style("opacity", .9);		
        div	.html(nameById.get(d.id) + "<br/>Density: "  + rateById.get(d.id))	
                .style("left", (d3.event.pageX) + "px")		
                .style("top", (d3.event.pageY - 28) + "px");	
        })					
    .on("mouseout", function(d) {		
        div.transition()		
            .duration(500)		
            .style("opacity", 0);	
        });;
    
    
    
    // Tooltip
}

// Udpates graph color.
function updateData(mode){
    var timer = 500;
    coloration = "black";
    
    // Dark Mode
    if(mode == "dark"){
        color = d3.scaleThreshold()
            .domain([1, 10, 50, 200, 500, 1000, 2000, 4000])
            .range(d3.schemeBuPu[9]);
        
        // Select the body and then change the color
        d3.selectAll("body")
            .transition()
            .duration(timer)
            .style("background-color", "#333333")
            .style("color", "white");;
        
        // Select and change key text
        d3.selectAll("text")
            .transition()
            .duration(timer)
            .style("fill", "white");
        
        // Change stroke color
        var svg = d3.selectAll("#mi-map");
            svg.selectAll("path")
                .transition()
                .duration(timer)
                .attr("stroke", "white");
        coloration = "white";
    }
    
    // Light Mode
    if(mode == "light"){
        color = d3.scaleThreshold()
            .domain([1, 10, 50, 200, 500, 1000, 2000, 4000])
            .range(d3.schemeOrRd[9]);
        
        // Select the body and then change the color
        d3.selectAll("body")
            .transition()
            .duration(timer)
            .style("background-color", "white")
            .style("color", "black");
        
        // Select and change key text
        d3.selectAll("text")
            .transition()
            .duration(timer)
            .style("fill", "black");
        coloration = "black";
    }
    
    // Update the colors of the map. 
    var svg = d3.selectAll("#mi-map");
    svg.selectAll("path")
        .transition()
        .duration(timer)
        .attr("fill", function(d) { return color(rateById.get(d.id)); }) // Replace this with color
        .attr("d", path)
        .style("stroke", stroke());
    
    // Update the key
    d3.selectAll("rect")
        .transition()
        .duration(timer)
        .attr("fill", function(d) { return color(d[0]); });
    
}

// Keeps stroke as hidden toggle
function stroke(){
     if(toggle == -1){
         return "none";
    }
    if(toggle == 1){
         return coloration;
    }
}
// Updates the hide stroke 
function hideStroke(){
    var svg = d3.selectAll("svg");
    toggle = toggle * -1;
    if(toggle == -1){
        svg.selectAll("path")
            .style( "stroke", "none");
    }
    if(toggle == 1){
        svg.selectAll("path")
            .style("stroke", coloration);
    }

}