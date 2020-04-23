import {
  wrapText,
  getReports,
  getTextForDepartment,
  getCursorForNode
} from "../utils";
import renderLines from "./render-lines";
import onClick from "./on-click";
import iconLink from "./components/icon-link";

const CHART_NODE_CLASS = "org-chart-node";
const PERSON_LINK_CLASS = "org-chart-person-link";
const PERSON_NAME_CLASS = "org-chart-person-name";
const PERSON_TITLE_CLASS = "org-chart-person-title";
const PERSON_DEPARTMENT_CLASS = "org-chart-person-dept";
const PERSON_REPORTS_CLASS = "org-chart-person-reports";

function render(parentNode, config) {
  const {
    root,
    chart,
    treemap,
    animationDuration,
    nodeWidth,
    nodeHeight,
    nodePaddingX,
    nodePaddingY,
    nodeBorderRadius,
    backgroundColor,
    nameColor,
    titleColor,
    reportsColor,
    borderColor,
    avatarWidth,
    lineDepthY,
    onPersonLinkClick
  } = config;




  var treeData = treemap(root);
  // nodes
  const nodes = treeData.descendants();
  // links
  const links = treeData.links();
  // Compute the new tree layout.

  config.links = links;
  config.nodes = nodes;

  treemap
  .separation(function separation(a, b) {
    return a.parent == b.parent ? 1 : 1;
});

  // Normalize for fixed-depth.
  nodes.forEach(function(d) {
    d.y = d.depth * lineDepthY ;
 /* 
    if (d.parent && d.parent.parent) {
      d.y = d.depth * lineDepthY + lineDepthY * d.parent.children.indexOf(d);
      d.x = d.parent.x = d.parent.x0;
    }

    // d.y = d.depth * 180;
    if (d.parent != null) {
        d.x =  d.parent.x - (d.parent.children.length-1)*30/2
        + (d.parent.children.indexOf(d))*30;
    }
    // if the node has too many children, go in and fix their positions to two columns.
    if (d.children != null && d.children.length > 4) {
        d.children.forEach(function (d, i) {
            d.y = (d.depth * 180 + i % 2 * 300);
            d.x =  d.parent.x - (d.parent.children.length-1)*30/4
            + (d.parent.children.indexOf(d))*30/2 - i % 2 * 15;
        });
    }*/
  });

  // Update the nodes
  const node = chart
    .selectAll("g.node")
    .data(nodes, d => d.data.id);


  // Enter any new nodes at the parent's previous position.
  const nodeEnter = node
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", `translate(${parentNode.x0}, ${parentNode.y0})`)
    .on("click", onClick(config));

  // Person Card Shadow
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
    .attr("filter", "url(#boxShadow)");

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
    .style("cursor", getCursorForNode)
    .attr("class", "box");

  const namePos = {
    x: nodePaddingX * 1.4 + avatarWidth,
    y: nodePaddingY * 1.8
  };

  // Person's Name
  nodeEnter
    .append("text")
    .attr("class", PERSON_NAME_CLASS)
    .attr("x", namePos.x)
    .attr("y", namePos.y)
    .attr("dy", ".3em")
    .style("cursor", "pointer")
    .style("fill", nameColor)
    .style("font-size", 16)
    .text(d => d.data.person.name);
/*
  // Person's Title
  nodeEnter
    .append("text")
    .attr("class", PERSON_TITLE_CLASS + " unedited")
    .attr("x", namePos.x)
    .attr("y", namePos.y + nodePaddingY * 1.2)
    .attr("dy", "0.1em")
    .style("font-size", 14)
    .style("cursor", "pointer")
    .style("fill", titleColor)
    .text(d => d.data.person.title);

  const heightForTitle = 45; // getHeightForText(d.person.title)

  // Person's Reports
  nodeEnter
    .append("text")
    .attr("class", PERSON_REPORTS_CLASS)
    .attr("x", namePos.x)
    .attr("y", namePos.y + nodePaddingY + heightForTitle)
    .attr("dy", ".9em")
    .style("font-size", 14)
    .style("font-weight", 500)
    .style("cursor", "pointer")
    .style("fill", reportsColor)
    .text(getTextForTitle);

  // Person's Avatar
  nodeEnter
    .append("image")
    .attr("width", avatarWidth)
    .attr("height", avatarWidth)
    .attr("x", 10)
    .attr("y", 10)
    .attr("src", d => d.data.person.avatar)
    .attr("xlink:href", d => d.data.person.avatar)
    .attr("clip-path", "url(#avatarClip)");

  nodeEnter
    .append("circle")
    .attr("cx", 35)
    .attr("cy", 35)
    .attr("r", 25)

    .attr("stroke", borderColor)
    .attr("stroke-width", 1)
    .attr("fill", "none");

  // Person's Department
  nodeEnter
    .append("text")
    .attr("class", getDepartmentClass)
    .attr("x", 34)
    .attr("y", avatarWidth + nodePaddingY * 1.2)
    .attr("dy", ".9em")
    .style("cursor", "pointer")
    .style("fill", titleColor)
    .style("font-weight", 600)
    .style("font-size", 8)
    .attr("text-anchor", "middle")
    .text(getTextForDepartment);

  // Person's Link
  const nodeLink = nodeEnter
    .append("a")
    .attr("class", PERSON_LINK_CLASS)
    .attr("xlink:href", d => d.data.person.link || "alert()")
    .on("click", datum => {
      d3.event.stopPropagation();
      // TODO: fire link click handler
      if (onPersonLinkClick) {
        onPersonLinkClick(datum, d3.event);
      }
    });

  iconLink({
    svg: nodeLink,
    x: nodeWidth - 28,
    y: nodeHeight - 28
  });
*/
  const nodeUpdate = nodeEnter.merge(node);

   nodeUpdate 
    .transition()
    .duration(animationDuration)
    .attr("transform", d => `translate(${d.x},${d.y})`);

  nodeUpdate
    .select("rect.box")
    .attr("fill", backgroundColor)
    .attr("stroke", borderColor);

  // Transition exiting nodes to the parent's new position.
  const nodeExit = node
    .exit()
    .transition()
    .duration(animationDuration)
    .attr("transform", d => `translate(${parentNode.x},${parentNode.y})`)
    .remove();

  // Update the links
  const link = chart.selectAll("path.link").data(links, d => d.target.id);

  // Wrap the title texts
  const wrapWidth = 140;

  chart
    .selectAll("text.unedited." + PERSON_TITLE_CLASS)
    .call(wrapText, wrapWidth);

  // Render lines connecting nodes
//  renderLines(config);

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

function getDepartmentClass(d) {
  const { person } = d.data;
  const deptClass = person.department ? person.department.toLowerCase() : "";

  return [PERSON_DEPARTMENT_CLASS, deptClass].join(" ");
}

export default render;
