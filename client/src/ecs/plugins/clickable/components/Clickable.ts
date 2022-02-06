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
      default: "CHANGES",
      editor: {
        label: "Action",
        input: "Select",
        options: [
          { label: "Open URL", value: "OPEN" },
          { label: "Open URL (new tab)", value: "LINK" },
          { label: "Change Variables", value: "CHANGES" },
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

    changes: {
      type: JSONType,
      default: {},
      editor: {
        label: "Changes",
        requires: [{ prop: "action", value: "CHANGES" }],
      },
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
