import * as d3 from "d3";

export function doTab(container, config, data) {
  d3.selectAll(`${container} > *`).remove();

  const margin = {
      top: 20,
      right: 80,
      bottom: 60,
      left: 40
    },
    width = 500 - margin.left - margin.right,
    height = 360 - margin.top - margin.bottom;

  const color = {
    Mechanical: "#4A7B9D",
    Electrical: "#54577C",
    Hydraulic: "#ED6A5A"
  };
  const barPadding = 10;
  var data = [
    {
        key: "Overall",
        values: [
          {
            key: "School",
            value: 89
          }
          
        ]
      },
    {
      key: "Gender",
      values: [
        {
          key: "Female",
          value: 87
        },
        {
          key: "Male",
          value: 78
        }
      ]
    },
    {
      key: "Free School Meals",
      values: [
        {
          key: "FSM",
          value: 78
        },
        {
          key: "Not FSM",
          value: 80
        }
      ]
    },
    {
      key: "Special Educational Needs",
      values: [
        {
          key: "SEN",
          value: 77
        },
        {
          key: "Not SEN",
          value: 89
        }
      ]
    }
  ];
  const rangeBands = [];
  let cummulative = 0;
  data.forEach(function(val, i) {
    val.cummulative = cummulative;
    cummulative += val.values.length;
    val.values.forEach(function(values) {
      values.parentKey = val.key;
      rangeBands.push(i);
    });
  });


  const x_category = d3.scaleLinear().range([0, width]);

  const x_defect = d3
    .scaleBand()
    .domain(rangeBands)
    .rangeRound([0, width])
    .padding(0.1);

  const x_category_domain = x_defect.bandwidth() * rangeBands.length;

  x_category.domain([0, x_category_domain]);

  const y = d3.scaleLinear().range([height, 0]);

  y.domain([
    0,
    d3.max(data, function(cat) {
      return d3.max(cat.values, function(def) {
        return def.value;
      });
    })
  ]);

  const category_axis = d3.axisBottom().scale(x_category);

  const yAxis = d3
    .axisLeft()
    .scale(y)

    .tickFormat(d3.format(".2s"));

  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)

    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  svg
    .append("g")
    .attr("class", "y axis")
    .call(yAxis);

  const category_g = svg
    .selectAll(".category")
    .data(data)
    .enter()
    .append("g")

    .attr("transform", function(d, i) {
      const x = i * 20 + x_category(d.cummulative * x_defect.bandwidth());
      return `translate(${x},0)`;
    })
    .attr("fill", function(d) {
      return color[d.key];
    });

  const category_label = category_g
    .selectAll(".category-label")
    .data(function(d) {
      return [d];
    })
    .enter()
    .append("text")

    .attr("transform", function(d) {
      const x_label = x_category(
        (d.values.length * x_defect.bandwidth() + barPadding) / 2
      );
      const y_label = height + 30;
      return `translate(${x_label},${y_label})`;
    })
    .text(function(d) {
      return d.key;
    })
    .attr("text-anchor", "middle");

  const defect_g = category_g
    .selectAll(".defect")
    .data(function(d) {
      return d.values;
    })
    .enter()
    .append("g")

    .attr("transform", function(d, i) {
      const x = x_category(i * x_defect.bandwidth());

      return `translate(${x},0)`;
    });

  const defect_label = defect_g
    .selectAll(".defect-label")
    .data(function(d) {
      return [d];
    })
    .enter()
    .append("text")
    .attr("class", function(d) {
      console.log(d);
      return "defect-label defect-label-" + d.key;
    })
    .attr("transform", function(d) {
      const x_label = x_category((x_defect.bandwidth() + barPadding) / 2);
      const y_label = height + 10;
      return `translate(${x_label},${y_label})`;
    })
    .text(function(d) {
      return d.key;
    })
    .attr("text-anchor", "middle");

  const rects = defect_g
    .selectAll(".rect")
    .data(function(d) {
      return [d];
    })
    .enter()
    .append("rect")

    .attr("width", x_category(x_defect.bandwidth() - barPadding))
    .attr("x", function(d) {
      return x_category(barPadding);
    })
    .attr("y", function(d) {
      return y(d.value);
    })
    .attr("height", function(d) {
      return height - y(d.value);
    });
}
