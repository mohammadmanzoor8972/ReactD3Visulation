import * as d3 from "d3";

export function doTab(container, data) {
  d3.selectAll(`${container} > *`).remove();

  const barPadding = 3,
    width = 700,
    height = 160 + data.length * 24,
    margin = {
      top: 20,
      right: 80,
      bottom: 100,
      left: 180
    },
    chartWidth = 400 - margin.left - margin.right,
    chartHeight = height - margin.top - margin.bottom;

  const rangeBands = [];
  let cumm = 0;
  data.forEach(function(val, i) {
    val.cummulative = cumm;
    cumm += val.values.length;
    val.values.forEach(function(values) {
      rangeBands.push(i);
    });
  });

  const yGroupScale = d3.scaleLinear().range([0, chartHeight]);

  const yScale = d3
    .scaleBand()
    .domain(rangeBands)
    .padding(0.4)
    .rangeRound([0, chartHeight]);

  const y_category_domain = yScale.bandwidth() * rangeBands.length;

  yGroupScale.domain([0, y_category_domain]);

  const xMax = d3.max(data, function(cat) {
    return d3.max(cat.values, function(def) {
      return def.value;
    });
  });

  const xScale = d3
    .scaleLinear()
    .domain([0, Math.max(xMax, 100)])
    .range([0, chartWidth])
    .nice();

  const xAxis = d3
    .axisTop()
    .scale(xScale)
    .tickFormat(d3.format(","));

  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", chartWidth + margin.left + margin.right)
    .attr("height", chartHeight + margin.top + margin.bottom);

  const chart = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

    /*
  chart
    .append("g")
    .attr("class", "x axis")
    .call(xAxis);
*/
  const bars = chart.append("g").attr("class", "bars");

  function yGroupPosition(d, i) {
    return (i + 1) * 20 + yGroupScale(d.cummulative * yScale.bandwidth());
  }

  const barGroup = bars
    .selectAll(".bargroup")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "bargroup")
    .attr("transform", function(d, i) {
      const y = yGroupPosition(d, i);
      return `translate(0, ${y})`;
    })
    .attr("fill", function(d) {
      return "#E0E0E0";
    });

  const bar = barGroup
    .selectAll(".bar")
    .data(function(d) {
      return d.values;
    })
    .enter()
    .append("g")
    .attr("class", "bar")
    .attr("transform", function(d, i) {
      const y = yGroupScale(i * yScale.bandwidth());
      return `translate(0 ,${y})`;
    });

  bar
    .selectAll(".rect")
    .data(function(d) {
      return [d];
    })
    .enter()
    .append("rect")
    .attr("height", yGroupScale(yScale.bandwidth() - barPadding))
    .attr("width", function(d) {
      return xScale(d.value);
    });

  barGroup
    .selectAll(".group-label")
    .data(function(d) {
      return [d];
    })
    .enter()
    .append("text")
    .attr("class", "group-label")
    .attr("transform", function(d) {
      const y_label = yGroupScale(
        (d.values.length * yScale.bandwidth() + barPadding) / 2
      );
      const x_label = chartHeight + 30;
      return `translate(${-10},${-5})`;
    })
    .text(function(d) {
      return d.key;
    })
    .attr("text-anchor", "end");

  bar
    .selectAll(".bar-label")
    .data(function(d) {
      return [d];
    })
    .enter()
    .append("text")
    .attr("class", "bar-label")
    .attr("transform", function(d) {
      const y_label = yGroupScale((yScale.bandwidth() + barPadding) / 2);
      const x_label = chartHeight + 10;
      return `translate(${-10},${y_label})`;
    })
    .text(function(d) {
      return d.key;
    })
    .attr("text-anchor", "end");

    bar
    .selectAll(".bar-value")
    .data(function(d) {
      return [d];
    })
    .enter()
    .append("text")
    .attr("class", "bar-value")
    .attr("y", 13)
    .attr("x", 3 )
    .text(function(d) {
      return `${d.value}%`;
    })
    .attr("text-anchor", "start")
    .attr("fill", "#000");

    /*

  bar
    .selectAll(".bar-value")
    .data(function(d) {
      return d;
    })
    .enter()
    .append("text")
    .attr("class", "bar-label")
    .attr("x", d => xScale(d.value) / 2)
    //    .attr("y", d => yScale(d[1]) + (yScale(d[0]) - yScale(d[1])) / 2)
   // .attr("dy", "0.33em")
    //.attr("text-anchor", "middle")
    .attr("fill", "#fff")
    .text(function(d) {
      return d.value;
    });*/
}
