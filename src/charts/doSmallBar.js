import {d3Scale,d3Axis,d3Selection, d3Array, d3Color} from "d3";
import "d3-transition";
import * as d3Color from "d3-color";
import { measureText, wrapLabels } from "@sims/utils/dom-helper";
import DataNotFound from './DataNotFound';

export default function module() {

  let margin = {
    top: 10,
    right: 26,
    bottom: 39,
    left: 20,
  },
    width = 280,
    height = 140,
    svg,
    chartWidth,
    chartHeight,
    xScale,
    yScale,
    xAxis,
    theme = "#6aedc7",
    categoryLabel = 'category',
    valueLabel = 'value',
    ticksCount = 4,
    countMin = 0,
    maxLabelLength = 90,
    labelRightMargin = 7,
    maxDataLabelLength = 10,
    bandMarginPixels = 4,
    barHeightPixel = 20,
    bandCount = 0,
    labHeightMax = bandMarginPixels + barHeightPixel,
    data,

    barPaddingPixel,

    // extractors
    getValue = ({ value }) => value,
    getCategory = ({ category }) => category
var flag=true;
var count =0;
  function exports(_selection) {
    _selection.each(function (_data) {

      if (_data && _data.length == 0) {
        DataNotFound(this);
        return;
      }

      data = [..._data];
      chartWidth = width - margin.left - margin.right;
      chartHeight = height - margin.top - margin.bottom;

      if(data.length>0){
        maxDataLabelLength = Math.max.apply(
          Math,
          data.map(d => measureText(d.name, 14))
        );

        const marginLeftMax = Math.min(maxDataLabelLength, maxLabelLength) + labelRightMargin;
        margin.left = marginLeftMax;
        var chart= svg;

        buildSVG(this);
        drawTicks();
        getSizes();
        setSvgSize();
        buildScales();
        buildAxis();
        drawAxis();
        drawChart();
    
     
    }
    });
  }

  function getSizes() {


    bandCount = data.length;

    const bandHeight = labHeightMax + bandMarginPixels;
    barPaddingPixel = bandHeight - barHeightPixel;
    const barsTotalHeightPixel = bandCount * barHeightPixel;
    const paddingTotalHeightPixel = (bandCount * barPaddingPixel) - barPaddingPixel;


    const ifMultipleBarsAddOnePixelForRoundingDown = bandCount > 1 ? 1 : 0;

    chartHeight = barsTotalHeightPixel + paddingTotalHeightPixel + ifMultipleBarsAddOnePixelForRoundingDown;

    height = chartHeight + (margin.top + margin.bottom),
      chartWidth = width - margin.left - margin.right;
  }

  function buildScales() {

    let countMax = d3Array.max(data, d => Math.max(d.value));

    countMax = countMax ==0 ? 10 : countMax

    const barPaddingProportion =
      bandCount > 1 ? barPaddingPixel / (barHeightPixel + barPaddingPixel) : 0;

    yScale = d3Scale
      .scaleBand()
      .domain(data.map(d => d.name))
      .rangeRound([0, chartHeight])
      .paddingInner(barPaddingProportion);

    xScale = d3Scale
      .scaleLinear()
      .domain([0,  Math.ceil(countMax/5)*5])
      .rangeRound([0, chartWidth])
      .nice();

  }

  function buildSVG(container) {
    if (!svg) {
      svg = d3Selection.select(container)
        .append('svg')
        .classed('bar-charts', true);

      buildContainerGroups();
    }


  }

  function setSvgSize() {
    svg
      .attr('width', width)
      .attr('height', height);
  }

  function buildContainerGroups() {
    let container = svg
      .append('g')
      .classed('small-bar-chart', true)
      .attr('transform', `translate(${margin.left},${margin.top})`);

    container
      .append("g")
      .attr("class", "labs")
      .attr("text-anchor", "end");

    container
      .append("g")
      .attr("class", "x axis");

    const barbase = container.append("g").attr("class", "bars-base");

    barbase.append("g")
      .attr("class", "bar-background-lines")
      .style("stroke", "#fff")

    container.append("g").attr("class", "bars");


  }


  function buildAxis() {
    xAxis = d3Axis.axisBottom(xScale).ticks(ticksCount);
  }

  function drawTicks() {


    const customYAxis = svg.select(".labs");


    let ticks = customYAxis
      .selectAll(".tick")
      .data(data)


      ticks.enter()
      .append("g")
      .merge(ticks)
      .attr("class", "tick")

    const tickText = ticks
      .append("text")
      .attr("class", "labs-label")
      .attr("x", -labelRightMargin)
      .text(function (d) {
        return d.name;
      });


    tickText.each(function () {
      const text = d3Selection.select(this);

      wrapLabels(text, {
        maxWidth: margin.left - labelRightMargin, // the left margin
        maxHeight: 100 // the bar height
      });

      labHeightMax = Math.max(
        Math.ceil(text.node().getBBox().height),
        labHeightMax
      );
    });

    ticks.exit().remove();
  }

  function drawAxis() {

    const xxAxis = svg
      .selectAll(".small-bar-chart .x.axis")
      .attr("transform", `translate(0, ${chartHeight + 7})`)
      .call(xAxis);



    const last = xScale.ticks(ticksCount).length - 1;

    xxAxis.selectAll(".tick").each(function (d, i) {
      const ele = d3Selection.select(this);
      const t = ele.selectAll("text");

      if (d === countMin || i === last) {
        t.attr("class", "highlight");
      }
    });




    svg.select(".labs")
      .selectAll(".tick").attr("transform", (d) => `translate(0, ${yScale(d.name) + yScale.bandwidth() / 2 + 3})`);

  }


  function drawChart() {

    const barsBase = svg.selectAll('.small-bar-chart .bars-base');

    barsBase
      .selectAll(".bar-background")
      .data(data)
      .enter()
      .append("rect")
      .style("fill", "#eee")
      .attr("class", "bar-background")
      .attr("x", 0)
      .attr("y", (d) => yScale(d.name))
      .attr("width", chartWidth)
      .attr("height", yScale.bandwidth());

    barsBase.select(".bar-background-lines")
      .call(xAxis.tickSize(chartHeight).tickFormat(""));

    const bars = svg.select(".bars");
    
   // bars
    //.selectAll(".bar").remove();
    
    var bar = bars
      .selectAll(".bar")
      .data(data);

    const newBar = bar
      .enter()
      .append("g")
      .attr("class", "bar")
      .attr("transform", d => `translate(0, ${yScale(d.name)})`);

    const actual = newBar
      .append("rect")
      .style("fill", theme)
      .style("stroke", d3Color.rgb(theme).darker(0.5))
      .attr("class", "actual")
      .data(data)
      .attr("rx", 4)
      .attr("x", 0)
      .attr("width", 0)
      .attr("height", yScale.bandwidth());

    bars
      .selectAll(".actual")
      .transition()
      .delay(500)
      .duration(2000)
      // .ease(d3Ease.easeBackInOut)
      .attr("width", d => xScale(d.value));

    const actualLabel = newBar
      .append("text")
      .attr("class", "actual-text")
      .style("fill", d3Color.rgb(theme).darker(1.4))
      .style("opacity", 0)
      .attr("y", yScale.bandwidth() / 2)
      .attr("dy", ".35em") //vertical align middle
      .attr("x", (d) => xScale(d.value) + 6)
      .text(function (d) {
        return d.value;
      });

    bars
      .selectAll(".actual-text")
      .transition()
      .delay(3500)
      .duration(1000)
      .style("opacity", 1);
     
  }


  // API
  exports.theme = function (_x) {
    if (!arguments.length) {
      return theme;
    }
    theme = _x;

    return this;
  };

  exports.valueLabel = function (_x) {
    if (!arguments.length) {
      return valueLabel;
    }
    valueLabel = _x;

    return this;
  };

  exports.categoryLabel = function (_x) {
    if (!arguments.length) {
      return categoryLabel;
    }
    categoryLabel = _x;

    return this;
  };


  return exports;
}
