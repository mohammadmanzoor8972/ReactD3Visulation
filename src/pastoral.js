import "./css/index.less";

import { doTree } from "./charts/chart/doTree";
import data from "../data/file.json";
import { colours } from "./charts/utils/colours";

doTree(
  "#container1",
  [
    {
      type: "school",
      label: "School",
      colour: colours.pink[300]
    },
    {
      type: "yeargroup",
      label: "Year Group",
      colour: colours.deeppurple[300]
    },
    { type: "class", label: "Class", colour:  colours.teal.a700 }
  ],
  data
);
