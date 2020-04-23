import * as d3 from "d3";
import { colours } from "./utils/colours";

export function doLine(container, config, data) {
  d3.selectAll(`${container} > *`).remove();

  data.forEach(d => (d.show = true));

  const margin = { top: 20, right: 50, bottom: 20, left: 50 };
  const width = 450;
  const height = 260;
  const chartWidth = width - margin.left - margin.right;

  const chartHeight = height - margin.top - margin.bottom;
  const formatNumber = d => d3.format(",")(Math.abs(d));
  const formatPercent = d => d3.format(".0%")(Math.abs(d));
  const colourScale = d3
    .scaleOrdinal()
    .range([
      "#39c2c9", //blue'#555',
      "#f866b9", //pink
      colours.deeppurple[300], //purple
      "#ffa71a", //orange

      "#ffce00", //yellow
      "#6aedc7" //green
    ])
    .domain(["Overall", "Reading", "Writing", "Maths"]);

  // Define the scales and tell D3 how to draw the line
  const xScale = d3
    .scaleBand()
    .domain(["Term 1", "Term 2", "Term 3", "Term 4"])
    .rangeRound([-26, chartWidth]);

  const yScale = d3
    .scaleLinear()
   
    .domain([0.72, 0.84])
    .range([chartHeight-20, 0]);

  const line = d3
    .line()
    .curve(d3.curveMonotoneX)
    .x(d => xScale(d.period))
    .y(d => yScale(d.meeting));

  // Create areas for the chart and user input
  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const chart = svg
    .append("g")
    .attr("class", "line-chart")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const form = d3.select(container).append("form").attr("style", "margin:10px 13px");

  // Add the axes and a title
  const xAxis = d3.axisBottom(xScale);

  const yAxis = d3
    .axisLeft()
    .scale(yScale)
    .tickFormat(formatPercent)
    .ticks(5);
  




  const yyAxis = chart
    .append("g")
    .attr("class", "y axis")
    .call(yAxis);

  yyAxis.selectAll(".tick").each(function(d, i) {
    if (d == .72) {
      d3.select(this)
        .selectAll("text")
        .attr("class", "highlight");
    }
  });

  const xxAxis = chart
    .append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0, ${chartHeight})`)
    .call(xAxis);

    xxAxis.selectAll(".tick").each(function(d, i) {
     
        d3.select(this)
          .selectAll("text")
          .attr("class", "highlight")
          
      
    });
  const lines = chart
    .append("g")
    .attr("class", "lines")
    .attr("transform", `translate(${xScale.bandwidth() / 2}, 0)`);

  function drawChart() {
    const visibleStates = data.filter(s => s.show);

    const paths = lines.selectAll(".line").data(visibleStates, d => d.title);

    const path = paths
      .enter()
      .append("g")
      .attr("class", "line")
      .style("fill", d => colourScale(d.title));

    paths.exit().remove();

    path
      .append("path")
      .style("fill", "none")
      .style("stroke", d => colourScale(d.title))
      .style("stroke-width", 3)
      .datum(function(d) {
        return d.history;
      })
      .attr("d", line);

    path
      .selectAll("circle")
      .data(function(d) {
        return d.history;
      })
      .enter()
      .append("circle")
      .style("stroke", "#fff")
      .style("stroke-width", 2)
      .attr("class", "circle")
      .attr("cx", function(d) {
        return xScale(d.period);
      })
      .attr("cy", function(d) {
        return yScale(d.meeting);
      })
      .attr("r", 5);

    drawLegend();
  }

  function drawLegend() {
    const visibleStates = data.filter(s => s.show);

    const labelHeight = 20;

    // Create some nodes
    const labels = visibleStates.map(s => {
      return {
        title: s.title,
        fx:
          xScale(s.history[s.history.length - 1].period) +
          xScale.bandwidth() / 2,
        targetY: yScale(s.history[s.history.length - 1].meeting)
        /*    targetX:
          xScale(s.history[s.history.length - 1].period) +
          xScale.bandwidth() / 2*/
      };
    });

    // Set up the force simulation
    const force = d3
      .forceSimulation()
      .nodes(labels)
      .force("collide", d3.forceCollide(labelHeight / 2))
      .force("y", d3.forceY(d => d.targetY).strength(1))
      //.force("x", d3.forceX(d => d.targetX).strength(0.7))
      .stop();

    // Execute the simulation
    for (let i = 0; i < 300; i++) {
      force.tick();
    }

    // Assign values to the appropriate marker
    labels.sort((a, b) => a.y - b.y);

    visibleStates.sort(function(a, b) {
      //more robust solution needed
     // if (b.history.length === a.history.length) {
        const lastB = b.history[b.history.length - 1].meeting;
        const lastA = a.history[a.history.length - 1].meeting;
        if (lastA === lastB) {
          const nextLastB = b.history[b.history.length - 2].meeting;
          const nextLastA = a.history[a.history.length - 2].meeting;
          return nextLastB - nextLastA;
        }

        return lastB - lastA;
     // }
      //return 1;
    });

    visibleStates.forEach((state, i) => {
      //const x = labels.find(d => d.title === state.title);
    //  state.y = x.y;
     // state.x = x.x;
      state.y = labels[i].y;
      state.x = labels[i].x;
    });

    // Add labels
    const legendItems = chart
      .selectAll(".legend-item")
      .data(visibleStates, d => d.title);

    legendItems.exit().remove();

    legendItems.attr("y", d => d.y);
    legendItems.attr("x", d => d.x);

    legendItems
      .enter()
      .append("text")
      .attr("class", "legend-item")
      .text(d => d.title)
      .style("fill", d => colourScale(d.title))
      .attr("x", d => d.x)
      .attr("dx", ".5em")
      .attr("dy", ".35em")
      .attr("y", d => d.y);
  }

  function doFormInputs() {
    const labels = form
      .selectAll("label")
      .data(data)
      .enter()
      .append("label");

    labels
      .append("input")
      .attr("type", "checkbox")
      .property("checked", d => {
        return "checked";
      })
      .on("change", checked);

    labels
      .append("span")
      .style("color", d => colourScale(d.title))
      .html(d => d.title + "&nbsp;&nbsp;");

    function checked(d) {
      d.show = this.checked;
      drawChart();
    }
  }

  doFormInputs();
  drawChart();
}
