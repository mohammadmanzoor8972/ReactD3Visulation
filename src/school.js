import "./css/index.less";
import { doChart } from "./charts/doChart";





doChart(
  "#container1",
  [
    { measure: "below_per", label: "Not meeting expectations", colour: colours.pink[300] },
    {
      measure: "at_per",
      label: "Meeting expectation",
      colour: colours.deeppurple[300]
    },
    { measure: "above_per", label: "Exceeding expectations", colour:  colours.teal.a700 }
  ],
  [
    { title: "Year R", above: 8, at: 70, below: 12 },
    { title: "Year 1", above: 10, at: 70, below: 12 },
    { title: "Year 2", above: 13, at: 70, below: 12 },
    { title: "Year 3", above: 10, at: 70, below: 12 },
    { title: "Year 4", above: 8, at: 70, below: 12 },
    { title: "Year 5", above: 10, at: 70, below: 12 },
    { title: "Year 6", above: 13, at: 70, below: 12 }
  ]
);