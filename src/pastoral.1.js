import "./css/index.less";
import { doChart } from "./charts/doChart";
import { init } from "./charts/chart";
import data from "../data/file.json";
import * as d3 from "d3";
import { maxHeaderSize } from "http";

//init('#container1', data , { lineType: 'angle' })

var treeData = data;

const nodeWidth = 240;
const nodeHeight = 120;
const nodeSpacing = 12;
const nodePaddingX = 16;
const nodePaddingY = 16;
const avatarWidth = 50;
const nodeBorderRadius = 4;
const margin = {
  top: 20,
  right: 20,
  bottom: 20,
  left: 500
};

// Lines
const lineType = "angle";
const lineDepthY = 120; /* Height of the line for child nodes */

// Colors
const backgroundColor = "#fff";
const borderColor = "#aaa";
const nameColor = "#222d38";
const titleColor = "#617080";
const reportsColor = "#92A0AD";

// Set the dimensions and margins of the diagram
var width = 1000 - margin.left - margin.right,
  height = 1000 - margin.top - margin.bottom;

var colorScale = d3
  .scaleLinear()
  .domain([0, 1])
  .range(["red", "green"]);

var widthScale = d3
  .scaleLinear()
  .domain([1, 80])
  .range([1, 10]);
const eleId = "#container1";
const elem = document.querySelector(eleId);
elem.innerHTML = "";

const elemWidth = elem.offsetWidth;
const elemHeight = elem.offsetHeight;

// append the svg object to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3
  .select(eleId)
  .append("svg")
  .attr("width", elemWidth)
  .attr("height", elemHeight);

var chart = svg
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var i = 0,
  duration = 350,
  root;

// declares a tree layout and assigns the size
var treemap = d3
  .tree()
  //.size([width, height])
  //.nodeSize([250, 140]);
  .nodeSize([nodeWidth + nodeSpacing, nodeHeight + nodeSpacing]);

// Assigns parent, children, height, depth
root = d3.hierarchy(treeData, d => d.children);

root.x0 = elemWidth / 2;
root.y0 = elemHeight / 2;

// Collapse after the second level
root.children.forEach(collapse);

update(root);

// Collapse the node and all it's children
function collapse(d) {
  if (d.children) {
    d._children = d.children;
    d._children.forEach(collapse);
    d.children = null;
  }
}

function update(source) {
  // Assigns the x and y position for the nodes
  var treeData = treemap(root);
  // Compute the new tree layout.
  var nodes = treeData.descendants(),
    //links = treeData.links();
    links = treeData.descendants().slice(1);

  treemap.separation(function separation(a, b) {
    return a.parent == b.parent ? 1 : 1;
  });

  // Normalize for fixed-depth.
  nodes.forEach(function(d) {
    d.y = d.depth * 180;
  });

  // ****************** Nodes section ***************************

  // Update the nodes...
  var node = chart.selectAll("g.node").data(nodes, function(d) {
    return d.id || (d.id = ++i);
  });

  // Enter any new modes at the parent's previous position.
  var nodeEnter = node
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", function(d) {
      return "translate(" + source.x0 + "," + source.y0 + ")";
    })
    .on("click", click);

  nodeEnter
    .append("rect")
    .attr("width", nodeWidth)
    .attr("height", nodeHeight)
    .attr("fill", backgroundColor)
    .attr("stroke", borderColor)
    .attr("rx", nodeBorderRadius)
    .attr("ry", nodeBorderRadius)
   .attr("fill-opacity", 0.05)
  .attr("stroke-opacity", 0.025)
  //    .attr("filter", "url(#boxShadow)");

  // Person Card Container
  nodeEnter
    .append("rect")
    .attr("width", nodeWidth)
    .attr("height", nodeHeight)
    .attr("id", d => d.id)
    .attr("fill", backgroundColor)
    .attr("stroke", borderColor)
    .attr("rx", nodeBorderRadius)
    .attr("ry", nodeBorderRadius)
    //  .style("cursor", getCursorForNode)
    .attr("class", "box");

  const namePos = {
    x: nodePaddingX * 1.4 + avatarWidth,
    y: nodePaddingY * 1.8
  };

  // Person's Name
  nodeEnter
    .append("text")
    .attr("class", "PERSON_NAME_CLASS")
    .attr("x", namePos.x)
    .attr("y", namePos.y)
    .attr("dy", ".3em")
    .style("cursor", "pointer")
    .style("fill", nameColor)
    .style("font-size", 16)
    .text(d => d.data.person.name);

  // Add Circle for the nodes
  /*nodeEnter
    .append("circle")
    .attr("class", "node")
    .attr("r", 1e-6)
    .style("fill", function(d) {
      return d._children ? "lightsteelblue" : "#fff";
    });
*/
  /*
  // Add labels for the nodes
  nodeEnter
    .append("text")
    .attr("dy", ".35em")
    .attr("y", function(d) {
      return d.children || d._children ? -18 : 18;
    })
    .attr("text-anchor", "middle")
    .text(function(d) {
      return d.data.name;
    });
*/
  // UPDATE
  var nodeUpdate = nodeEnter.merge(node);

  // Transition to the proper position for the node
  nodeUpdate
    .transition()
    .duration(duration)
    .attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    });

  // Update the node attributes and style
  nodeUpdate
    .select("circle.node")
    .attr("r", 10)
    .style("fill", function(d) {
      return d._children ? "lightsteelblue" : "#fff";
    })
    .attr("cursor", "pointer");

  // Remove any exiting nodes
  var nodeExit = node
    .exit()
    .transition()
    .duration(duration)
    .attr("transform", function(d) {
      return "translate(" + source.x + "," + source.y + ")";
    })
    .remove();

  // On exit reduce the node circles size to 0
  nodeExit.select("circle").attr("r", 1e-6);

  // On exit reduce the opacity of text labels
  //nodeExit.select("text").style("fill-opacity", 1e-6);

  // ****************** links section ***************************

  // Update the links...
  var link = chart.selectAll("path.link").data(links, d => d.id);

  var linkEnter = link
    .enter()
    .insert("path", "g")
    .attr("class", "link")
    .attr("d", function(d) {
      var o = { x: source.x0, y: source.y0 };
      return diagonal(o, o);
    });

  const angle = d3
    .line()
    .x(d => d.x)
    .y(d => d.y)
    .curve(d3.curveLinear);

  // Enter any new links at the parent's previous position.
  /*
  const  linkEnter = link
  .enter()
  .insert('path', 'g')
  .attr('class', 'link')
  .attr('fill', 'none')
  .attr('stroke', borderColor)

  .attr('d', d => {
    const linePoints = [
      {
        x: d.parent.x + parseInt(nodeWidth / 2),
        y: d.parent.y + nodeHeight + 200
      },
      {
        x: d.parent.x + parseInt(nodeWidth / 2),
        y: d.parent.y + nodeHeight + 200
      },
      {
        x: d.parent.x + parseInt(nodeWidth / 2),
        y: d.parent.y + nodeHeight + 2
      },
      {
        x: d.parent.x + parseInt(nodeWidth / 2),
        y: d.parent.y + nodeHeight + 2
      },
    ]

    return angle(linePoints)
  })
*/

  // UPDATE
  var linkUpdate = linkEnter.merge(link);

  linkUpdate
    .transition()
    .duration(350)
    .attr("d", d => {
      const linePoints = [
          //bottom of parent
        {
          x: d.parent.x + parseInt(nodeWidth / 2),
          y: d.parent.y + nodeHeight + 2
        },

        {
          x: d.parent.x + parseInt(nodeWidth / 2),
          y: d.y - margin.top /2 -10
        },
        //second joint
        {
          x: d.x + parseInt(nodeWidth / 2),
          y: d.y - margin.top / 2 -10
        },
        //top of child
        {
          x: d.x + parseInt(nodeWidth / 2),
          y: d.y
        }
      ];

      return angle(linePoints);
    });

  // Transition back to the parent element position
  /*
  linkUpdate
    .transition()
    .duration(duration)
    .attr("d", function(d) {
      return diagonal(d, d.parent);
    });
    */
  // Remove any exiting links
  var linkExit = link
    .exit()
    .transition()
    .duration(100)
    /*   .attr("d", function(d) {
      var o = { x: source.x, y: source.y };
      return diagonal(o, o);
    })
*/
    .remove();

  // Store the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });

  // Creates a curved (diagonal) path from parent to the child nodes
  function diagonal(s, d) {
    return `M ${s.x} ${s.y}
C ${(s.x + d.x) / 2} ${s.y},
  ${(s.x + d.x) / 2} ${d.y},
  ${d.x} ${d.y}`;

    return `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`;
  }

  // Toggle children on click.
  function click(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    update(d);
  }
}
