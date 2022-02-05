import { Component, StringType, JSONType, NumberType } from "~/ecs/base";

export class Clickable extends Component {
  action: string;
  link: string;
  cycle: any;
  idx: number;

  // deprecated
  toggle: any;

  static props = {
    action: {
      type: StringType,
      default: "CYCLE",
      editor: {
        label: "Action",
        input: "Select",
        options: [
          { label: "Open URL", value: "OPEN" },
          { label: "Open URL (other tab)", value: "LINK" },
          { label: "Cycle Property", value: "CYCLE" },
        ],
      },
    },

    link: {
      type: StringType,
      editor: {
        label: "URL",
        requires: [{ prop: "action", value: "LINK" }],
      },
    },

    cycle: {
      type: JSONType,
      default: { states: [] },
      editor: {
        label: "Cycle Script",
        requires: [{ prop: "action", value: "CYCLE" }],
      },
    },

    idx: {
      type: NumberType,
      default: 0,
    },

    // deprecated
    toggle: {
      type: JSONType,
      default: {},
      editor: {
        label: "Toggle Script",
        requires: [{ prop: "action", value: "TOGGLE" }],
      },
    },
  };

  static editor = {
    label: "Clickable",
  };
}
