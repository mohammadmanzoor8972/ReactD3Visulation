import "./css/index.less";
import { doChart } from "./charts/doChart";
import { colours } from "./charts/utils/colours";
import { doTab } from "./charts/doTab";
import data from "../data/eyfs.json";
doChart(
  "#container1",
  [
    {
      measure: "below",
      label: "Below Age Related Expectation (ARE)",
      colour: colours.pink[300]
    },
    {
      measure: "at",
      label: "Met Age Related Expectation (ARE)",
      colour: colours.deeppurple[300]
    },
    {
      measure: "above",
      label: "Exceeded Age Related Expectation (ARE)",
      colour: colours.teal.a700    }
  ],
  {
    title: "",
    columns: 
  [{ title: "Baseline", above: 7, at: 30, below: -13 }]}
);

doChart(
  "#container2",
  [
    {
      measure: "below",
      label: "Did not achieved a Good Level of Development (GLD)",
      colour: colours.pink[300]
    },

    {
      measure: "above",
      label: "Achieved a Good Level of Development (GLD)",
      colour:  colours.teal.a700
    }
  ],
  {
    title: "",
    columns: 
  [{ title: "EYFSP", above: 40, at: 0, below: -10 }]}
);


doChart(
  "#container2",
  [
    {
      measure: "below",
      label: "Behaviour Points",
      colour: colours.pink[300]
    },

    {
      measure: "above",
      label: "Achievements Points",
      colour:  colours.teal.a700
    }
  ],
  {
    title: "",
    columns: 
  [{ title: "Conduct", above: 30, at: 0, below: -16 }]}
);


doChart(
  "#container3",
  [
    {
      measure: "below",
      label: "Did not achieved expected standard in reading, writing and maths",
      colour: colours.pink[300]
    },

    {
      measure: "above",
      label: "Achieved expected standard in reading, writing and maths",
      colour:  colours.teal.a700
    }
  ],
  {
    title: "",
    columns: 
  [{ title: "Key Stage 1", above: 45, at: 0, below: -5 }]}
);

doChart(
  "#container4",
  [
    { measure: "below", label: "Did not achieved Expected Standard", colour: colours.pink[300] },
    {
      measure: "at",
      label: "Achieved Expected Standard",
      colour: colours.deeppurple[300]
    },
    { measure: "above", label: "Achieved Higher Expected Standard", colour:  colours.teal.a700 }
  ],
  {
 
    columns: 
  [
    { title: "Reading", above:7, at: 40, below: -3 },
    { title: "Writing", above: 7, at: 35, below: -8 },
    { title: "Maths", above: 4, at: 30, below: -6 },
  ]}
);
doChart(
  "#container4-5",
  [
    { measure: "below", label: "Did not achieved Expected Standard", colour: colours.pink[300] },

    { measure: "above", label: "Achieved Expected Standard", colour:  colours.teal.a700 }
  ],
  {

    columns: 
  [

    { title: "Science", above: 40, at: 0, below: -10 }
  ]}
);

doChart(
  "#container5",
  [
    { measure: "below", 
    label: "Did not meet the expected standard", 
    colour: colours.pink[300] 
    },

    { measure: "above", label: "Met or exceeded the expected standard", colour:  colours.teal.a700 }
  ],
  {
 
    columns: 
  [
    { title: "Year 1", above: 50, at: 0, below: -22 },
    { title: "Year 2", above: 78, at: 0, below: -2 }
  ]}
);

doChart(
  "#container6",
  [
    {
      measure: "below",
      label: "Not Achieved Expected Standard",
      colour: colours.pink[300]
    },
    {
      measure: "at",
      label: "Meeting expected standard in reading, writing and maths",
      colour: colours.deeppurple[300]
    },
    {
      measure: "above",
      label: "Achieving at a higher standard in reading, writing and maths",
      colour:  colours.teal.a700
    }
  ],  {
    title: "",
    columns: 
  [{ title: "Key Stage 2", above: 5, at: 40, below: -5 }]
  }
);

doChart(
  "#container7",
  [
    {
      measure: "below",
      label: "Not Achieved Expected Standard",
      colour: colours.pink[300]
    },
    {
      measure: "at",
      label: "Achieved expected standard",
      colour: colours.deeppurple[300]
    },
    {
      measure: "above",
      label: "Achieved Higher Standard",
      colour:  colours.teal.a700
    }
    ],
  {

    columns: 
  [
    { title: "Reading", above: 8, at: 70, below: -12 },
    { title: "GPS", above: 6, at: 70, below: -16 },
    { title: "Maths", above: 13, at: 70, below: -12 },
  ]}
);


doChart(
  "#container8",
  [
    {
      measure: "below",
      label: "Not Achieved Expected Standard",
      colour: colours.pink[300]
    },
    {
      measure: "at",
      label: "Achieved Expected Standard (EXS)",
      colour: colours.deeppurple[300]
    },
    {
      measure: "above",
      label: "Working at Greater Depth (GD)",
      colour:  colours.teal.a700
    }
    ],
  {

    columns: 
  [
    { title: "Reading", above: 8, at: 70, below: -12 },
    { title: "GPS", above: 6, at: 70, below: -16 },
    { title: "Maths", above: 13, at: 70, below: -12 },
    { title: "Writing", above: 8, at: 70, below: -12 },
  ]}
);


doChart(
  "#container9",
  [
    {
      measure: "below",
      label: "Not Achieved Expected Standard",
      colour: colours.pink[300]
    },

    {
      measure: "above",
      label: "Achieved Expected Standard",
      colour:  colours.teal.a700
    }
    ],
  {

    columns: 
  [
    { title: "Reading", above: 40, at: 0, below: -10 },
    { title: "Maths", above: 38, at: 0, below: -12 },
    { title: "Science", above: 36, at: 0, below: -4 },
  ]}
);

doTab(
  "#container10",
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
