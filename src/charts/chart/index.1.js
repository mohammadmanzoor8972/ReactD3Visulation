import * as d3 from "d3";
import { hierarchy } from "d3";
import { collapse } from "../utils";
import defineBoxShadow from "../defs/box-shadow";
import defineAvatarClip from "../defs/avatar-clip";
import render from "./render";
import renderUpdate from "./render-update";
import defaultConfig from "./config";

function init(eleId, data, options) {
  // Merge options with the default config
  const config = {
    ...defaultConfig,
    ...options
  };

  if (!eleId) {
    console.error("react-org-chart: missing id for svg root");
    return;
  }

  const {

    lineType,
    margin,
    nodeWidth,
    nodeHeight,
    nodeSpacing,
    shouldResize
  } = config;

  // Calculate how many pixel nodes to be spaced based on the
  // type of line that needs to be rendered
  if (lineType == "angle") {
    config.lineDepthY = nodeHeight + 40;
  } else {
    config.lineDepthY = nodeHeight + 60;
  }

  // Get the root element
  const elem = document.querySelector(eleId);

  if (!elem) {
    console.error(`react-org-chart: svg root DOM node not found (id: ${eleId})`);
    return;
  }

  // Reset in case there's any existing DOM
  elem.innerHTML = "";

  const elemWidth = elem.offsetWidth;
  const elemHeight = elem.offsetHeight;

  // Setup the d3 tree layout
  config.treemap = d3
    .tree()
    .nodeSize([nodeWidth + nodeSpacing, nodeHeight + nodeSpacing]);
  //.size([400, 200]);

  const root = hierarchy(data, d => d.children);

  root.x0 = root.x;
  root.y0 = root.y;// / 2;

  // Collapse all of the children on initial load
  root.children.forEach(collapse);

  // Calculate width of a node with expanded children
  const childrenWidth = parseInt((root.children.length * nodeWidth) / 2);

  // Add svg root for d3
  const svg = d3
    .select(eleId)
    .append("svg")
    .attr("width", elemWidth)
    .attr("height", elemHeight);

  // Add our base svg group to transform when a user zooms/pans
  const xStart = parseInt(
    childrenWidth + (elemWidth - childrenWidth * 2) / 2 - margin.left / 2
  );

  const chart = svg.append("g").attr("transform", `translate(${xStart},20)`);

  // Define box shadow and avatar border radius
  defineBoxShadow(svg, "boxShadow");
  defineAvatarClip(svg, "avatarClip", {
    borderRadius: 40
  });

  // Center the viewport on initial load

  // Connect core variables to config so that they can be
  // used in internal rendering functions
 config.root = root;
  config.chart = chart;
 
  config.render = render;

  // Defined zoom behavior
  const zoom = d3
    .zoom()
    //   Define the [zoomOutBound, zoomInBound]
    .scaleExtent([1, 8])
    .on("zoom", renderUpdate(svg));

  // Attach zoom behavior to the svg root
  //svg.call(zoom);

  // Define the point of origin for zoom transformations
  //zoom.translate([
  // parseInt(
  //   childrenWidth + (elemWidth - childrenWidth * 2) / 2 - margin.left / 2
  // ),
  // 20
  //])

  // Add listener for when the browser or parent node resizes
  const resize = () => {
    if (!elem) {
      global.removeEventListener("resize", resize);
      return;
    }

    svg.attr("width", elem.offsetWidth).attr("height", elem.offsetHeight);
  };

  if (shouldResize) {
    global.addEventListener("resize", resize);
  }

  // Start initial render
  render(root, config);

  // renderUpdate(config)
  // Update DOM root height
  d3.select(eleId).style("height", elemHeight + margin.top + margin.bottom);
}

export { init };
