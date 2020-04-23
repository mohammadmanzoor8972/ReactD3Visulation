import * as d3 from "d3";

function doTree(eleId, config, data) {
  const treeData = data;

  const nodeWidth = 13 * 18;
  const nodeHeight = 110;
  const nodeVerticalSpacing = 52;
  const nodeHorizontalSpacing = 13;
  const nodePaddingX = 13;
  const nodePaddingY = 13;
  const avatarWidth = 52;
  const avatarPosition = avatarWidth / 2 + 10;
  const nodeBorderRadius = 4;
  const duration = 350;

  const margin = {
    top: 13,
    right: 13,
    bottom: 13,
    left: 13
  };
  const elem = document.querySelector(eleId);

  const elemWidth = elem.offsetWidth;
  const elemHeight = elem.offsetHeight;
  const treeStart = { x: elemWidth / 2 - nodeWidth / 2, y: margin.top };

  const colourScale = d3
    .scaleOrdinal()
    .range(config.map(d => d.colour))
    .domain(config.map(d => d.type));

  const getColour = d => colourScale(d.data.type);

  const treemap = d3
    .tree()
    .nodeSize([
      nodeWidth + nodeHorizontalSpacing,
      nodeHeight + nodeVerticalSpacing
    ]);

  const root = d3.hierarchy(treeData, d => d.children);

  root.x0 = treeStart.x;
  root.y0 = treeStart.y;

  root.children.forEach(collapse);

  const svg = d3
    .select(eleId)
    .append("svg")
    .attr("width", elemWidth)
    .attr("height", elemHeight);

  const chart = svg
    .append("g")
    .attr("class", "chart")
    .attr("transform", `translate(${treeStart.x},${treeStart.y})`);

  chart
    .append("rect")
    .attr("class", "dragger")
    .attr("x", -10000)
    .attr("y", -10000)
    .style("opacity", 0)
    .attr("height", 100000)
    .attr("width", 100000);

  chart.datum(treeStart).call(
    d3
      .drag()
      .on("start", function() {
        return d3
          .select(this)
          .raise()
          .classed("active", true);
      })
      .on("drag", function(d) {
        return d3
          .select(this)
          .attr(
            "transform",
            `translate(${(d.x = d3.event.x)},${(d.y = d3.event.y)})`
          );
      })
      .on("end", function() {
        d3.select(this).classed("active", false);
      })
  );

  let i = 0;

  update(root);

 function update(source) {
    const treeData = treemap(root);

    const nodes = treeData.descendants();

    const links = treeData.descendants().slice(1);

    treemap.separation((a, b) => {
      if (a.parent === b.parent) {
        if (!(a.children || a._children) && !(b.children || b._children)) {
          return (
            (nodeWidth * 2 + nodeHorizontalSpacing * 2) /
              a.parent.children.length -
            nodeHorizontalSpacing * 2
          );
        }
      }
      return nodeWidth + nodeHorizontalSpacing;
    });

    nodes.forEach(
      node => (node.y = node.depth * (nodeHeight + nodeVerticalSpacing))
    );

    nodes.forEach(node => {
      if (node.children) {
        const childrenHaveChildren = node.children.every(
          r => r.children || r._children
        );
        if (!childrenHaveChildren) {
          const space = (nodeWidth + nodeHorizontalSpacing * 2) / 2;
          const rows = node.children
            .filter((v, i) => i % 2 == 0)
            .map((v, i) => [node.children[i * 2], node.children[i * 2 + 1]]);

          rows.forEach((row, rowCount) => {
            row.forEach((col, colCount) => {
              if (col) {
                col.y =
                  col.depth * (nodeHeight + nodeVerticalSpacing) +
                  rowCount * (nodeHeight + nodeVerticalSpacing);
                col.x =
                  colCount % 2 == 0
                    ? col.parent.x - space
                    : col.parent.x + space;
              }
            });
          });
        }
      }
    });

    // ****************** Nodes section ***************************

    const node = chart
      .selectAll(".node")
      .data(nodes, d => d.id || (d.id = ++i));

    const nodeEnter = node
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", () => `translate(${source.x0},${source.y0})`)
      .on("click", click);

    nodeEnter
      .append("rect")
      .attr("class", "card")
      .attr("width", nodeWidth)
      .attr("height", nodeHeight)
      .attr("id", d => d.id)
      .attr("fill", "#fff")
      .attr("stroke", getColour)
      .attr("rx", nodeBorderRadius)
      .attr("ry", nodeBorderRadius);

    const namePos = {
      x: nodePaddingX + avatarWidth + 10,
      y: nodePaddingY
    };

    nodeEnter
      .append("text")
      .attr("class", "card-title")
      .attr("x", namePos.x)
      .attr("y", namePos.y)
      .attr("alignment-baseline", "hanging")
      .style("fill", getColour)
      .text(d => d.data.title);

    const people = nodeEnter
      .append("g")
      .attr("class", "card-people")
      .style("fill", getColour)
      .attr("transform", `translate(${namePos.x},${namePos.y + 21})`);

    people
      .selectAll("card-person")
      .data(d => d.data.people)
      .enter()
      .append("text")
      .attr("class", "card-person")
      .attr("alignment-baseline", "hanging")
      .attr("dy", (d, i) => i * 21)
      .style("cursor", "pointer")
      .text(d => d.name);

    nodeEnter
      .append("text")
      .attr("class", "card-links")
      .attr("x", nodeWidth - nodePaddingX)
      .attr("y", nodeHeight - nodePaddingY)
      .attr("text-anchor", "end")
      .style("fill", getColour)
      .text(getReports);

    const avatarNode = nodeEnter
      .selectAll(".avatar")
      .data(d => d.data.people)
      .enter()
      .append("g")
      .attr("class", "avatar")
      .attr(
        "transform",
        (d, i) =>
          `translate(${avatarPosition},${avatarPosition + i * avatarPosition})`
      );

    avatarNode
      .append("clipPath")
      .attr("id", (d, i) => "clip" + i)
      .append("circle")
      .attr("class", "clip-path")
      .attr("r", avatarWidth / 2);

    avatarNode
      .append("image")
      .attr("src", d => d.avatar)
      .attr("xlink:href", d => d.avatar)
      .attr("clip-path", (d, i) => "url(#clip" + i + ")")
      .attr("x", -(avatarWidth / 2))
      .attr("y", -(avatarWidth / 2))
      .attr("width", (avatarWidth / 2) * 2)
      .attr("height", (avatarWidth / 2) * 2);

    avatarNode
      .append("circle")
      .attr("r", avatarWidth / 2)
      .style("fill", "transparent")
      .style("stroke", "#aaa")
      .style("stroke-width", 0.5);

    const nodeUpdate = nodeEnter.merge(node);

    nodeUpdate
      .transition()
      .duration(duration)
      .attr("transform", d => `translate(${d.x},${d.y})`);

    node
      .exit()
      .transition()
      .attr("transform", `translate(${source.x},${source.y})`)
      .remove();

    // ****************** links section ***************************

    const link = chart.selectAll(".node-link").data(links, d => d.id);

    const angle = d3
      .line()
      .x(d => d.x)
      .y(d => d.y)
      .curve(d3.curveLinear);

    // Enter any new links at the parent's previous position.

    const linkEnter = link
      .enter()
      .insert("path", "g")
      .attr("class", "node-link")
      .attr("fill", "none")
      .attr("stroke", getColour)
      .attr("d", d =>
        angle([
          // start at the bottom of parent
          {
            x: d.parent.x + parseInt(nodeWidth / 2),
            y: d.parent.y + nodeHeight + 2
          },
          {
            x: d.parent.x + parseInt(nodeWidth / 2),
            y: d.parent.y + nodeHeight + 2
          },
          {
            x: d.parent.x + parseInt(nodeWidth / 2),
            y: d.parent.y + nodeHeight + 2
          },
          {
            x: d.parent.x + parseInt(nodeWidth / 2),
            y: d.parent.y + nodeHeight + 2
          }
        ])
      );

    const linkUpdate = linkEnter.merge(link);

    linkUpdate
      .transition()
      .duration(duration)
      .attr("d", d =>
        angle([
          //bottom of parent
          {
            x: d.parent.x + parseInt(nodeWidth / 2),
            y: d.parent.y + nodeHeight + 2
          },
          // first joint
          {
            x: d.parent.x + parseInt(nodeWidth / 2),
            y: d.y - margin.top / 2 - 10
          },
          //second joint
          {
            x: d.x + parseInt(nodeWidth / 2),
            y: d.y - margin.top / 2 - 10
          },
          //top of child
          {
            x: d.x + parseInt(nodeWidth / 2),
            y: d.y
          }
        ])
      );

    link
      .exit()
      .transition()
      .duration(100)
      .remove();

    nodes.forEach(d => {
      d.x0 = d.x;
      d.y0 = d.y;
    });

    treemap.nodeSize([1, nodeHeight + nodeVerticalSpacing]);
  };

  function collapse(d) {
    if (d.children) {
      d._children = d.children;
      d._children.forEach(collapse);
      d.children = null;
    }
  }

  function click(d) {
    // Toggle children on click.
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    update(d);
  }

  function getReports(datum) {
    const children = datum.children || datum._children;

    if (children) {
      const totalReports = children.length;
      const pluralEnding = totalReports > 1 ? "s" : "";

      return `${totalReports} report${pluralEnding}`;
    } else {
      return "";
    }
  }
}

export { doTree };
