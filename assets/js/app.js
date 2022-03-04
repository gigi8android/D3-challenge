/* ************************************************************************ */
// Call main parent makeResponsive function upon html page load and resize
/* ************************************************************************ */
makeResponsive();
d3.select(window).on("resize", makeResponsive);
/* ************************************************************************ */


/* ****************************************************************** */
// Wrap up all functions into one parent/main makeResponsive function to create a responsive sizable chart
/* ****************************************************************** */
function makeResponsive() {

    // Select SVG component in the html body
    var svgArea = d3.select("body").select("svg");

    // Remove all the previous SVG graphics if the SVG canvas area is not empty upon page load/refresh
    if (!svgArea.empty()) {
        svgArea.remove();
    }

    /* ****************************************************************** */
    // Set up SVG canvas size, location and margins
    /* ****************************************************************** */
    var svgWidth = 900;
    var svgHeight = 600;

    var margin = {
        top: 40,
        right: 40,
        bottom: 90,
        left: 110
    };

    /* ****************************************************************** */
    // Set up the dimensions of the chart area
    /* ****************************************************************** */
    var width = (svgWidth - margin.left - margin.right);
    var height = (svgHeight - margin.top - margin.bottom);

    /* ****************************************************************** */
    // Create an SVG wrapper, append an SVG group that will hold the chart, 
    // and shift it by left and top margins
    /* ****************************************************************** */
    var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

    // Append an SVG group that will hold the chart
    var chartGroup = svg.append("g")
    .attr("height", height)
    .attr("width", width)
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

    /* ****************************************************************** */
    // Set default graph values (upon page load/ refresh) for x-axis and y-axis
    /* ****************************************************************** */
    var chosenXAxis = "poverty";
    var chosenYAxis = "obesity";

    /* ****************************************************************** */
    // Function for updating xScale by using built-in scaleLinear function
    /* ****************************************************************** */
    function xScale(graphData, chosenXAxis) {
    
        // create scales
        var xLinearScale = d3.scaleLinear()
            .domain([d3.min(graphData, d => d[chosenXAxis]) * 0.8,
            d3.max(graphData, d => d[chosenXAxis]) * 1.2 ])
            .range([0, width]);

        return xLinearScale;
    }

    /* ****************************************************************** */
    // Function for rendering xAxis var upon click on axis xlabel
    /* ****************************************************************** */
    function renderXAxis(newXScale, xAxis) {
        var bottomAxis = d3.axisBottom(newXScale);
        xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
        return xAxis;
    }
    
    /* ****************************************************************** */
    // Function for updating yScale by using built-in scaleLinear function
    /* ****************************************************************** */
    function yScale(graphData, chosenYAxis) {
        // create scales
        var yLinearScale = d3.scaleLinear()
        .domain([d3.min(graphData, d => d[chosenYAxis]) * 0.8,
            d3.max(graphData, d => d[chosenYAxis]) * 1.2 ])
        .range([height, 0]);
    
        return yLinearScale;
    }

    /* ****************************************************************** */
    // Function for rendering yAxis var upon click on axis ylabel
    /* ****************************************************************** */
    function renderYAxis(newYScale, yAxis) {
        var leftAxis = d3.axisLeft(newYScale); 
        yAxis.transition()
        .duration(1000)
        .call(leftAxis);
        return yAxis;
    }
    
    /* ****************************************************************** */
    // Function for updating circlesGroup with a transition to new circles
    /* ****************************************************************** */
    function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

        circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));
        return circlesGroup;
    }

    /* ****************************************************************** */
    // Function for updating text in the circleText
    /* ****************************************************************** */
    function updateText(circleText, newXScale, chosenXAxis, newYScale, chosenYAxis) {
        circleText.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]));
        return circleText;
    }

    /* ****************************************************************** */
    // function used for updating circles group with new tooltip
    /* ****************************************************************** */
    function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
        var xlabel;
        var ylabel;
    
        // Conditionally getting x values based on xaxis label selection
        if (chosenXAxis === "poverty") {
            xlabel = "Poverty:";
        }
        else if (chosenXAxis === "age") {
            xlabel = "Age: "  
        }
        else {
            xlabel = "Income:";
        }
    
        // Conditionally getting y values based on yaxis label selection
        if (chosenYAxis === "obesity") {
            ylabel = "Obesity:";
        }
        else if (chosenYAxis === "smokes") {
            ylabel = "Smokes: "  
        }
        else {
            ylabel = "Healthcare:";
        }

        // Check to see which x & y axis had been selected
        console.log("chosenXAxis:", chosenXAxis, "chosenYAxis:", chosenYAxis)

        // Setup tooltip var with formatted values, tooltip text and location of the tooltip box relatively to the circle (i.e. offset)
        var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-10, 0])
        .html(function(d) {
            if (chosenXAxis === "age")
                {   
                    return (`${d.state}<br><hr>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}%`) 
                }
            else if (chosenXAxis === "income")
                {   
                    let format = d3.format('$,');
                    let formattedX = format(d[chosenXAxis]);
                    return (`${d.state}<br><hr>${xlabel} ${formattedX}<br>${ylabel} ${d[chosenYAxis]}%`) 
                }
            else
                {   
                    return (`${d.state}<br><hr>${xlabel} ${d[chosenXAxis]}%<br>${ylabel} ${d[chosenYAxis]}%`) 
                }
            })

        // Call toolTip var
        circlesGroup.call(toolTip);
    
        // On mouseover event: show toolTip; on mouseout event: hide toolTip
        circlesGroup.on("mouseover", function(data) { 
                                        d3.select(this).attr("style", "fill: red");
                                        toolTip.show(data, this); })
                    .on("mouseout", function(data) { 
                                        d3.select(this).attr("style", "stroke: #000"); 
                                        toolTip.hide(data); });
    
        return circlesGroup;
    }

    /* ****************************************************************** */
    // Retrieve data from the CSV file and execute all functions below
    /* ****************************************************************** */
    d3.csv("assets/data/data.csv").then(function(graphData, err) {
        if (err) throw err;
    
        // Parse the required graphData's fields/columns as integer
        graphData.forEach(data => {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
        data.healthcare = +data.healthcare;     
        });
        
        // Check whether ALL the data had been read appropriately for the default axes values: Poverty (x-axis) and Obese (y-axis)
        console.log("graphData: ", graphData)

        // Create xLinearScale & yLinearScale functions from csv import graphData for the chart
        var xLinearScale = xScale(graphData, chosenXAxis);
        var yLinearScale = yScale(graphData, chosenYAxis);

        // Define x and y axis for the chart
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // Draw horizontal line as x axis to the chart with the position from the height of the chart from location 0,0 (i.e. upside down)
        var xAxis = chartGroup.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);

        // Draw vertical line as y axis to the chart
        var yAxis = chartGroup.append("g")
            .call(leftAxis);

        // Set area where xaxis and yaxis labels can be marked
        var labelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${width / 2}, ${height + 20})`);

        // Display x-axis label: poverty
        var povertyLabel = labelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 15)
            .attr("value", "poverty") // value to grab for event listener
            .classed("active", true)
            .text("In Poverty (%)");

        // Display x-axis label: age
        var ageLabel = labelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 35)
            .attr("value", "age") 
            .classed("inactive", true)
            .text("Age (Median)");

        // Display x-axis label: income
        var incomeLabel = labelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 55)
            .attr("value", "income") 
            .classed("inactive", true)
            .text("Household Income (Median)");
        
        // Display y-axis label: obesity
        var obesityLabel = labelsGroup.append("text")
            .attr("transform","rotate(-90)")
            .attr("x", (margin.left) * 2.5)
            .attr("y", 0 - (height - 60))
            .attr("value", "obesity") 
            .classed("active", true)
            .text("Obese (%)");

        // Display y-axis label: smokes
        var smokesLabel = labelsGroup.append("text")
            .attr("transform","rotate(-90)")
            .attr("x", (margin.left) * 2.5)
            .attr("y", 0 - (height - 40))
            .attr("value", "smokes") 
            .classed("inactive", true)
            .text("Smokes (%)");
        
        // Display y-axis label: healthcare
        var healthcareLabel = labelsGroup.append("text")
            .attr("transform","rotate(-90)")
            .attr("x", (margin.left) * 2.5)
            .attr("y", 0 - (height -20))
            .attr("value", "healthcare") 
            .classed("inactive", true)
            .text("Lack Healthcare (%)");

        // Append circles to the chart based on the selected x-axis and y-axis
        var circlesGroup = chartGroup.selectAll("circle")
            .data(graphData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d[chosenYAxis]))
            .attr("r", 10)
            .attr("class", "stateCircle")
            .attr("opacity", "0.5");

        // Append text to the circle
        var circleText = chartGroup.selectAll()
            .data(graphData)
            .enter()
            .append("text")
            .attr("x", d => xLinearScale(d[chosenXAxis])) 
            .attr("y", d => yLinearScale(d[chosenYAxis])) 
            .text(d => d.abbr)
            .attr("dy", ".35em")
            .attr("class", "stateText") 
            .attr("font-weight", "bold")
            .attr("font-size", "10");


        // Calling updateToolTip function
        var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);


        // X & Y labels event listener
        labelsGroup.selectAll("text").on("click", function() {
            
            // Get value of the selection
            var value = d3.select(this).attr("value");

            // If the xaxis has been clicked
            if(true)
            {   
                // Highlight the chosen xaxis in bold and call xLinearScale function to display the relevant data
                if (value == "poverty" || value=="income" || value=="age") 
                { 
                    // Check which data (column) has been selected
                    console.log("x-axis value: ", value)

                    // Update chosenXAxis with new value of the selected x-axis
                    chosenXAxis = value;

                    // Updates xScale with new data for the selected axis
                    xLinearScale = xScale(graphData, chosenXAxis);

                    // Render xaxis with ticks, values and transition
                    xAxis = renderXAxis(xLinearScale, xAxis);

                    // Changes class of the selected axis to "active" with css bold text
                    if (chosenXAxis === "poverty") {
                        povertyLabel.classed("active", true).classed("inactive", false);
                        ageLabel.classed("active", false).classed("inactive", true);
                        incomeLabel.classed("active", false).classed("inactive", true);
                    }
                    else if (chosenXAxis === "age") {
                        povertyLabel.classed("active", false).classed("inactive", true);
                        ageLabel.classed("active", true).classed("inactive", false);
                        incomeLabel.classed("active", false).classed("inactive",true);
                    } 
                    else {
                        povertyLabel.classed("active", false).classed("inactive", true);
                        ageLabel.classed("active", false).classed("inactive", true);
                        incomeLabel.classed("active", true).classed("inactive",false);
                    }
                }

                // Else if the selected values are from the y-axis
                else 
                {
                    // Update chosenYAxis with values of the selected y-axis
                    chosenYAxis = value;

                    // Check which data (column) has been selected
                    console.log("y-axis value: ", value);

                    // Updates yScale for new data
                    yLinearScale = yScale(graphData, chosenYAxis);

                    // Render yaxis with ticks, values and transition
                    yAxis = renderYAxis(yLinearScale, yAxis);

                    // Changes class of the selected axis to "active" with css bold text as defined in d3style.css
                    if  (chosenYAxis === "obesity") {
                        obesityLabel.classed("active", true).classed("inactive", false);
                        healthcareLabel.classed("active", false).classed("inactive", true);
                        smokesLabel.classed("active", false).classed("inactive", true); 
                    }
                    else if(chosenYAxis == "healthcare") {
                        healthcareLabel.classed("active", true).classed("inactive", false);  
                        obesityLabel.classed("active", false).classed("inactive", true);
                        smokesLabel.classed("active", false).classed("inactive", true);
                    }
                    else {
                        smokesLabel.classed("active", true).classed("inactive", false);
                        healthcareLabel.classed("active", false).classed("inactive", true);
                        obesityLabel.classed("active", false).classed("inactive", true); 
                    }
                }
            }

                // Draw circles with new x & y values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // Updates tooltips text with new info
                circleText = updateText(circleText, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // Updates toolTip with new x & y values
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            });

        }).catch(function(error) {
        
        // Display error in the console if there is any
        console.log(error);

    });
    /* ************************************************************************ */

}


// /* ************************************************************************ */
// // Call main parent makeResponsive function upon html page load and resize
// /* ************************************************************************ */
// makeResponsive();
// d3.select(window).on("resize", makeResponsive);
// /* ************************************************************************ */
