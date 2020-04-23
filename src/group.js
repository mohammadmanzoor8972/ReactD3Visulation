import "./css/index.less";
import { doChart } from "./charts/doChart";
import { doTab } from "./charts/doTab";
import { doLine } from "./charts/doLine";
import trend from "../data/trend.json";
import data from "../data/keygroups.json";
import { colours } from "./charts/utils/colours";

doLine("#container4", {}, trend);


doTab(
  "#container3",
  {
    measures: [
      {
        id: "meeting",
        measure: "meeting",
        label: "Meeting or exceeding expectations",
        colour:  colours.teal.a700
      },
      {
        id: "below",
        measure: "below",
        label: "Not meeting expectations",
        colour: colours.pink[300]
      }
    ],
    subjects: ["Reading", "Writing", "Maths"]
  },
  data.data
);

doChart(
  "#container1",
  [
    {
      measure: "below",
      label: "Not meeting or exceeding expectation",
      colour: colours.pink[300]
    },

    {
      measure: "above",
      label: "Meeting or exceeding expectation",
      colour:  colours.teal.a700
    }
  ],
  {
    title: "",
    columns: [{ title: "Year 2", above: 43, at: 0, below: -7 }]
  }
);

doChart(
  "#container2",
  [
    {
      id: "below",
      measure: "below",
      label: "Not meeting expectations Australi is best place to case the universe",
      colour: colours.pink[300]
    },
    {
      id: "at",
      measure: "at",
      label: "Meeting expectation London Dream is beauty",
      colour: colours.deeppurple[300]
    },
    {
      id: "above",
      measure: "above",
      label: "Exceeding expectations I would like to go JAPAN. Which is realy a beautyfull",
      colour:  colours.teal.a700
    }
  ],

  {
    title: "Subjects",
    columns: [
      { title: "Reading", above: 3, at: 40, below: -7 },
      { title: "Writing", above: 5, at: 33, below: -12 },
      { title: "Maths", above: 6, at: 30, below: -14 }
    ]
  }
);
