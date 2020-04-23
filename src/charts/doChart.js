import * as d3 from "d3";
import { transformData } from "./transformData";
import { wrap } from "./wrap";

export function doChart(container, config, data) {
  const transformedData = transformData(config, data.columns);

  d3.selectAll(`${container} > *`).remove();

  const width =   105+ 50+ (data.columns.length * 55),
    height = 270,
    margin = { top: 20, right: 110, bottom: 40, left: 50 },
    chartWidth = width - margin.left - margin.right,
    chartHeight = height - margin.top - margin.bottom,
    defaultTextLength = 50;

    const textWrapSize = 90;

  const formatPercent = d => d3.format(".0%")(Math.abs(d));
  const formatNumber = d => d3.format(",")(Math.abs(d));
  const barMinValueForDisplayingLabel = 7;

  const getPercentage = (val, d) => val / d.data.total;
  const getTitle = d => d.data.title;
  const getColour = d => colourScale(d.key);
  const getPercentageLabel = d => d.data[`${d.key}_per_label`];

  const stack = d3
    .stack()
    .keys(config.map(d => d.measure))
    .offset(d3.stackOffsetDiverging)(transformedData);

  const countMax = d3.max(stack, layer => d3.max(layer, d => d[1])) + 10;
  const countMin = d3.min(stack, layer => d3.min(layer, d => d[0])) - 10;

  const perMax = Math.max(
    d3.max(stack, layer => d3.max(layer, d => getPercentage(d[1], d))),
    1
  );

  const perMin =
    d3.min(stack, layer => d3.min(layer, d => getPercentage(d[0], d))) - 0.1;

  const xScale = d3
    .scaleBand()
    .domain(data.columns.map(d => d.title))
    .padding(0.2)
    .rangeRound([0, chartWidth]);

  const xAxis = d3.axisBottom().scale(xScale);

  const baselineAxis = d3 //setup the middle axis
    .axisBottom()
    .scale(xScale)
    .tickSize(0)
    .tickPadding(0)
    .tickFormat("");

  const yScale = d3
    .scaleLinear()
    .range([chartHeight, 0])
    .domain([countMin, countMax]);

  const yAxis = d3
    .axisLeft()
    .scale(yScale)
    .ticks(6)
    .tickFormat(formatNumber);

  const colourScale = d3
    .scaleOrdinal()
    .range(config.map(d => d.colour))
    .domain(config.map(d => d.measure));

  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const chart = svg
    .append("g")
    .attr("class", "chart")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  chart
    .append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0, ${chartHeight})`)
    .call(xAxis);

  chart
    .append("g")
    .attr("class", "x axis title")
    .append("text")
    .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 40})`)
    .style("text-anchor", "middle")
    .text(data.title);

  const yyAxis = chart
    .append("g")
    .attr("class", "y axis")
    .call(yAxis);

  yyAxis.selectAll(".tick").each(function(d, i) {
    if (d == 0) {
      d3.select(this)
        .selectAll("text")
        .attr("class", "highlight");
    }
  });

  const layer = chart
    .selectAll(".layer")
    .data(stack)
    .enter()
    .append("g")
    .attr("class", "layer")
    .attr("fill", getColour);

  const bar = layer
    .selectAll(".bar")
    .data(d => d)
    .enter()
    .append("g")
    .attr("class", "bar");

  const rect = bar

    .append("rect")
    .style("stroke", "#fff")
    .attr("x", d => xScale(getTitle(d)))
    .attr("width", xScale.bandwidth())
    .attr("y", function(d) {
      return yScale(d[1]);
    })
    .attr("height", d => yScale(d[0]) - yScale(d[1]));

  const text = bar
    .data(function(d) {
      return d.map(function(d1) {
        d1.key = d.key;
        d1.index = d.index;
        return d1;
      });
    })
    .append("text")
    .attr("x", d => xScale(getTitle(d)) + xScale.bandwidth() / 2)
    .attr("y", d => yScale(d[1]) + (yScale(d[0]) - yScale(d[1])) / 2)
    .attr("dy", "0.33em")
    .attr("text-anchor", "middle")
    .attr("fill", "#fff")
    .text(d => {
      const n = Math.abs(d[0] - d[1]);
      return n > barMinValueForDisplayingLabel ? `${n.toFixed(0)}` : "";
    });

  const legend = layer.append("g").attr("class", "legend");



  const legendText = legend
    .append("text")
    .attr("class", "legend-text")
    .attr("x", 0)
    .attr("y", 0)
    .attr("transform", d => {
     console.log(d)
      const last = d[d.length - 1];
      return `translate(${xScale(getTitle(last)) +
        xScale.bandwidth() +
        30}, ${yScale(last[1]) +
        (yScale(last[0]) - yScale(last[1])) / 2 +
        13})`;
    })
    .attr("dy", "0.35em")
    .attr("fill", getColour)
    .text(d => {
      const v = (d[d.length - 1] && d[d.length - 1].data[d.key]) || 0;
      if (v === 0) return "";
      const s = config.find(da => da.measure === d.key);
     
      if(s.label.length > defaultTextLength){
       // return s.label.substr(0,45)+"...";
      }
      return s ? s.label : "";
    })
    .on("click", function(d){
      const s = config.find(da => da.measure === d.key);
      debugger;
      alert(s.label)})
    .call(wrap, textWrapSize);

  function diagonal(s, d) {
    return `M ${s.x} ${s.y}
  C ${(s.x + d.x) / 2} ${s.y},
    ${(s.x + d.x) / 2} ${d.y},
    ${d.x} ${d.y}`;
  }

  const legendPath = legend
    .insert("path", "g")
    .attr("class", "link")
    .attr("stroke", getColour)
    .style("stroke-width", 2)
    .attr("fill", "none")
    .attr("x", 0)
    .attr("y", 0)
    .attr("d", d => {
      const last = d[d.length - 1];
      const source = {
        x: xScale(getTitle(last)) + xScale.bandwidth(),
        y: yScale(last[1]) + (yScale(last[0]) - yScale(last[1])) / 2
      };
      const dest = {
        x: xScale(getTitle(last)) + xScale.bandwidth() + 28,
        y: yScale(last[1]) + (yScale(last[0]) - yScale(last[1])) / 2 + 13
      };
      return diagonal(source, dest);
    });

  const zzAxis = chart // Add 0 baseline. Called last to ensure is on top
    .append("g")
    .attr("class", "z axis")
    .attr("transform", `translate(0, ${yScale(0)})`)
    .call(baselineAxis);

  const hitTarget = chart
    .selectAll(".hit")
    .data(transformedData.map(d => d))
    .enter()
    .append("g")
    .attr("class", "hit")
    .attr("fill", "transparent");

  hitTarget
    .append("rect")
    .attr("x", d => xScale(d.title))
    .attr("width", xScale.bandwidth())
    .attr("y", 0)
    .attr("height", chartHeight)
    .style("cursor", "pointer")
    .on("click", click);

  function click(d) {
    alert(JSON.stringify(d, null, 4));
  }

  //debugger;
  svg.select(".legend-text").on("click",function(){
    //alert('te');
  });

  /**
   * Set to percentage
   */
  function updatePercentage() {
    yScale.domain([perMin, perMax]);

    rect
      .transition()
      .attr("y", function(d) {
        return yScale(getPercentage(d[1], d));
      })
      .attr("height", function(d) {
        return Math.abs(
          yScale(getPercentage(d[1], d)) - yScale(getPercentage(d[0], d))
        );
      });

    text
      .transition()
      .attr(
        "y",
        d =>
          yScale(getPercentage(d[1], d)) +
          (yScale(getPercentage(d[0], d)) - yScale(getPercentage(d[1], d))) / 2
      )
      .text(function(d) {
        const n = getPercentageLabel(d);
        return n > barMinValueForDisplayingLabel ? `${n.toFixed(0)}%` : "";
      });

    yAxis.tickFormat(formatPercent);

    yyAxis.transition().call(yAxis);

    zzAxis
      .transition()
      .attr("transform", `translate(0, ${yScale(0)})`)
      .call(baselineAxis);

    legendText.transition().attr("transform", d => {
      const last = d[d.length - 1];
      return `translate(${xScale(getTitle(last)) +
        xScale.bandwidth() +
        30}, ${yScale(getPercentage(last[1], last)) +
        (yScale(getPercentage(last[0], last)) -
          yScale(getPercentage(last[1], last))) /
          2 -
        13})`;
    });

    legendPath.transition().attr("d", d => {
      const last = d[d.length - 1];

      const source = {
        x: xScale(getTitle(last)) + xScale.bandwidth(),
        y:
          yScale(getPercentage(last[1], last)) +
          (yScale(getPercentage(last[0], last)) -
            yScale(getPercentage(last[1], last))) /
            2
      };
      const dest = {
        x: xScale(getTitle(last)) + xScale.bandwidth() + 28,
        y:
          yScale(getPercentage(last[1], last)) +
          (yScale(getPercentage(last[0], last)) -
            yScale(getPercentage(last[1], last))) /
            2 -
          13
      };
      return diagonal(source, dest);
    });
  }

  /**
   * Set to counts
   */
  function updateCount() {
    yScale.domain([countMin, countMax]);

    rect
      .transition()
      .attr("y", function(d) {
        return yScale(d[1]);
      })
      .attr("height", d => yScale(d[0]) - yScale(d[1]));

    text
      .transition()
      .attr("y", d => yScale(d[1]) + (yScale(d[0]) - yScale(d[1])) / 2)
      .text(d => {
        const n = Math.abs(d[0] - d[1]);
        return n > barMinValueForDisplayingLabel ? `${n.toFixed(0)}` : "";
      });

    yAxis.tickFormat(formatNumber);

    yyAxis.transition().call(yAxis);

    zzAxis
      .transition()
      .attr("transform", `translate(0, ${yScale(0)})`)
      .call(baselineAxis);

    legendText.transition().attr("transform", d => {
      const last = d[d.length - 1];
      return `translate(${xScale(getTitle(last)) +
        xScale.bandwidth() +
        30}, ${yScale(last[1]) +
        (yScale(last[0]) - yScale(last[1])) / 2 -
        13})`;
    });

    legendPath.transition().attr("d", d => {
      const last = d[d.length - 1];

      const source = {
        x: xScale(getTitle(last)) + xScale.bandwidth(),
        y: yScale(last[1]) + (yScale(last[0]) - yScale(last[1])) / 2
      };
      const dest = {
        x: xScale(getTitle(last)) + xScale.bandwidth() + 28,
        y: yScale(last[1]) + (yScale(last[0]) - yScale(last[1])) / 2 - 13
      };
      return diagonal(source, dest);
    });
  }

  /**
   * Add Switch
   */
  var ops = [
    { text: "% percentage", value: "per" },
    { text: "count", value: "count" }
  ];

  const drop = d3
    .select(`${container}`)
    .append("div")
    .append("select")
    .on("change", function(d) {
      switch (this.value) {
        case "per":
          updatePercentage();
          break;

        case "count":
          updateCount();
          break;
      }
    });

  drop
    .selectAll("option")
    .data(ops)
    .enter()
    .append("option")
    .text(d => d.text) // text showed in the menu
    .attr("value", d => d.value);

  updatePercentage();
}
