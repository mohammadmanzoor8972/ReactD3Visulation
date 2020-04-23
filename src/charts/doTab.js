import * as d3 from "d3";
import { largestRemainderRound } from "./utils/largestRemainderRound";
import { measureText } from "./utils/measureText";

export function doTab(container, config, data) {
  d3.selectAll(`${container} > *`).remove();

  data = transformData(config, data);

  const rowHeaders = data
    .reduce(function(accumulator, currentValue) {
      return [
        ...accumulator,
        currentValue.title,
        currentValue.values.map(d => d.title)
      ];
    }, [])
    .flat();

  const columnHeaders = config.subjects;
  const formatPercent = d => d3.format(".0%")(Math.abs(d));
  const formatNumber = d => d3.format(",")(Math.abs(d));
  const margin = {
      top: 20,
      right: 30,
      bottom: 20,
      left: 180
    },
    chartWidth = columnHeaders.length * 200,
    chartHeight = rowHeaders.length * 18;

  const xScale = d3
    .scaleBand()
    .domain(columnHeaders)
    .paddingInner(0.15)
    .paddingOuter(0.05)
    .rangeRound([0, chartWidth]);

  const barScale = d3
    .scaleLinear()
    .range([0, xScale.bandwidth()])
    .domain([0, 1]);

  const xAxis = d3
    .axisBottom()
    .scale(barScale)
    .ticks(2)
    .tickFormat(formatPercent);

  const colourScale = d3
    .scaleOrdinal()
    .range([    '#f866b9', //pink
        '#998ce3', //purple
         '#ffa71a', //orange
      
        '#39c2c9', //blue
        '#ffce00', //yellow
         '#6aedc7', //green
    
    ])
    .domain(columnHeaders);

  const yScale = d3
    .scaleBand()
    .domain(rowHeaders)
    .paddingOuter(0)
    .padding(0.15)
    .rangeRound([0, chartHeight]);

  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", chartWidth + margin.left + margin.right)
    .attr("height", chartHeight + margin.top + margin.bottom);

  const chart = svg
    .append("g")
    .attr("class", "tab-barchart")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const columns = chart //insert the left axis
    .append("g")
    .attr("class", "column-headers")
    .attr("transform", "translate(10, 0)");

  const column = columns
    .selectAll(".column")
    .data(columnHeaders)
    .enter()
    .append("g")
    .attr("class", "column");

  const columnAxis = column
    .append("g")
    .attr("class", "x axis")
    .attr("transform", d => `translate(${xScale(d)}, ${chartHeight})`)
    .call(xAxis);

  columnAxis.selectAll(".tick").each(function(d, i) {
    if (d === 1) {
      d3.select(this)
        .selectAll("text")
        .attr("text-anchor", "end"); //need to bring the 100% inside to avoid clash
    }
  });

  column
    .append("text")
    .attr("class", "column-header-text")
    .attr("x", d => xScale(d))
    .attr("y", 13)
    .text(d => d)
    .attr("fill", d => colourScale(d));

  const rows = chart //insert the left axis
    .append("g")
    .attr("transform", "translate(10, 0)")
    .attr("class", "blocks");

  const groupHeader = rows
    .selectAll(".group-header")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "group-header")
    .attr("transform", d => `translate(0, ${yScale(d.title)})`);

  groupHeader
    .append("text")
    .attr("class", "group-header-text")
    .attr("text-anchor", "end")
    .attr("dy", "1em") //push down a bit
    .attr("x", 0)
    .text(d => d.title);

  const block = rows
    .selectAll(".rows")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "rows");

  const row = block
    .selectAll(".row")
    .data(d => d.values)
    .enter()
    .append("g")
    .attr("class", " row")
    .attr("transform", d => `translate(0, ${yScale(d.title)})`);

  row
    .append("text")
    .attr("class", "title-header-text")
    .attr("text-anchor", "end")
    .attr("dy", "1em")
    .attr("x", 0)
    .text(d => d.title);

  const cells = row
    .selectAll(".cell")
    .data(d => d.values)
    .enter()
    .append("g")
    .attr("class", " cell")
    .attr("fill", d => colourScale(d.title));

  /*
  cells
    .append("rect")
    .attr("class", "bar-background")
    .attr("height", yScale.bandwidth())

    .style("fill", "#f1f1f1")
    .attr("width", d => xScale.bandwidth())
    .attr("x", d => xScale(d.title));
*/
  const bar = cells
    .append("rect")
    .attr("class", "bar")
    .attr("height", 11)

    .attr("width", function(d) {
      0;
    })
    .attr("y", d => 2)
    .attr("x", d => xScale(d.title));

  const barText = cells
    .append("text")
    .attr("class", "bar-text")
    .attr("text-anchor", "start")
    .style("fill", "#fff")
    .attr("dy", ".95em")
    .attr("x", 0);

  const spot = cells
    .data(function(d) {
      return d.values.filter(function(d1) {
        return d1.total !== 0 && d1.ranking === 0 ;
      });
    })
    .append("g")
    .attr("class", "spot")
    .style("fill", "#F06292");

  spot
    .append("circle")
    .attr("class", "spot")
    .style("fill", "#F06292")
    .attr("r", 4)
    .attr("cy", yScale.bandwidth() / 2)
    .attr("cx", yScale.bandwidth() / 2);

  spot
    .append("rect")
    .style("fill", "transparent")
    .attr("height", yScale.bandwidth())
    .attr("width", yScale.bandwidth())
    .on("click", click);

  function click(d) {
    alert("LOWEST VALUE");
  }

  function doBars(key) {
    function minBarWidth(d) {
      return ((getPercentage(d) || 0) * 100) > 95;
    }

    function getPercentage(d) {
      return d[key] / d.total || 0;
    }

    bar
      .transition()
      .delay((d, i) => i * 100)
      .attr("width", function(d) {
        return barScale(getPercentage(d));
      })
      .attr("x", d => xScale(d.title));

    function getText(d) {
      return d.total !== 0 ? `${d[key + "_per_label"]}%` : "N/A";
    }

    barText
      .transition()
      .delay((d, i) => i * 100)
      .text(d => getText(d, key))
      .style("fill", d => (minBarWidth(d) ? "#fff" : d3.rgb(colourScale(d.title)).darker(1)))
      .style("font-weight", d => (minBarWidth(d) ? "600" : "400"))
      .attr("text-anchor", d => (minBarWidth(d) ? "end" : "start"))
      .attr("x", d =>
        minBarWidth(d)
          ? xScale(d.title) + barScale(getPercentage(d)) - 3
          : xScale(d.title) + barScale(getPercentage(d)) + 3
      );

    spot
      .transition()
      .delay((d, i) => i * 100)
      .attr(
        "transform",
        d =>
          `translate(${
            minBarWidth(d)
              ? xScale(d.title) + barScale(getPercentage(d))
              : xScale(d.title) +
                barScale(getPercentage(d)) +
                measureText(getText(d)) +
                1
          }, 0)`
      );
  }

  function doCounts(key) {

     barScale
    .domain([0, 50]);

    xAxis.tickFormat(formatNumber);

    columnAxis.transition().call(xAxis);

    

    function minBarWidth(d) {
      return (d[key]  > 45);
    }

    function getPercentage(d) {
      return d[key] / d.total || 0;
    }

    bar
      .transition()
      .delay((d, i) => i * 100)
      .attr("width", function(d) {
        return barScale((d[key]));
      })
      .attr("x", d => xScale(d.title));

    function getText(d) {
      return d.total !== 0 ? `${d[key]}` : "N/A";
    }

    barText
      .transition()
      .delay((d, i) => i * 100)
      .text(d => getText(d, key))
      .style("fill", d => (minBarWidth(d) ? "#fff" : d3.rgb(colourScale(d.title)).darker(1)))
      .style("font-weight", d => (minBarWidth(d) ? "600" : "400"))
      .attr("text-anchor", d => (minBarWidth(d) ? "end" : "start"))
      .attr("x", d =>{
       return  minBarWidth(d)
          ? xScale(d.title) + barScale((d[key])) - 3
          : xScale(d.title) + barScale((d[key])) + 3
      });

    spot
      .transition()
      .delay((d, i) => i * 100)
      .style("opacity", 0)
      .attr(
        "transform",
        d =>
          `translate(${
            minBarWidth(d)
              ? xScale(d.title) + barScale((d))
              : xScale(d.title) +
                barScale((d)) +
                measureText(getText(d)) +
                1
          }, 0)`
      );
  }

  doCounts("meeting");

  const form = d3.select(`${container}`).insert("form", "svg");

  const labels = form
    .selectAll("label")
    .data(config.measures)
    .enter()
    .append("label");

  labels
    .append("input")
    .attr("type", "radio")
    .attr("class", "shape")
    .attr("name", "mode")
    .attr("value", d => d.measure)
    .property("checked", (d, i) => i === 0)
    .on("change", function(d) {
      doCounts(this.value);
    });

  labels.append("span").html(d => d.label + "&nbsp;&nbsp;");
}

function transformData(config, data) {
  const { measures, subjects } = config;

  function getTotal(d) {
    const a = getMeasures(d);
    return a.reduce(getSum);
  }

  function getSum(total, num) {
    return Math.abs(total) + Math.abs(num);
  }

  function getPercentage(val, t) {
    return Math.abs(val) / t || 0;
  }

  function getMeasures(d) {
    return measures.map(d1 => d[d1.measure]);
  }

  function getRoundedPercentage(d, i) {
    const a = getMeasures(d);
    const t = getTotal(d);

    if (t !== 0) {
      const p = a.map(d1 => Math.abs(getPercentage(d1, t) * 100));
      const pl = largestRemainderRound(p, 100);

      return pl[i];
    }
    return 0;
  }

  const o = {};

  data.forEach(d => {
    d.values.forEach(d1 => {
      d1.values.forEach(d2 => {
        d2.total = getTotal(d2);
        measures.forEach((element, i) => {
          d2[element.measure + "_per_label"] = getRoundedPercentage(d2, i);
        });
      });
    });
  });

  /*
  Not sure how best to do this. Want to know the lowest value so they can be highlighted
  */

  subjects.forEach(subject => {
    o[subject] = [];
    data.forEach(d =>
      d.values.forEach(d1 => {
        const e = d1.values.find(d2 => d2.title === subject);
        o[subject].push(e.total !==0 ? e["meeting_per_label"]:10000000);
      })
    );
  });

  subjects.forEach(subject => {
    data.forEach(d =>
      d.values.forEach(d1 => {
        const e = d1.values.find(d2 => d2.title === subject);
        const sorted = o[subject].concat().sort((a, b) => a - b);
        e["ranking"] =  sorted.indexOf(e["meeting_per_label"]);
      })
    );
  });

  return data;
}

/*

const minPer = d3.min(data, d =>
  d3.min(d.values, d1 =>
    d3.min(d1.values.filter(e => e.title === subject), d2 => d2[measure +"_per_label"])
  )
);
*/
