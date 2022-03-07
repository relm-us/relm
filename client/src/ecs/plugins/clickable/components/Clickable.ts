import { Component, StringType, JSONType, NumberType } from "~/ecs/base";

export class Clickable extends Component {
  action: string;
  link: string;
  cycle: any;
  axis: "X" | "Y" | "Z";
  rotate: number;
  idx: number;

  // deprecated
  toggle: any;

  static props = {
    action: {
      type: StringType,
      default: "TOGGLE",
      editor: {
        label: "Action",
        input: "Select",
        options: [
          { label: "Open URL", value: "OPEN" },
          { label: "Open URL (new tab)", value: "LINK" },
          { label: "Change Variables", value: "CHANGES" },
          { label: "Toggle Html2d", value: "TOGGLE" },
          { label: "Flip Over", value: "FLIP" },
        ],
      },
    },

    link: {
      type: StringType,
      editor: {
        label: "URL",
        requires: [
          { prop: "action", value: "LINK" },
          { prop: "action", value: "OPEN" },
        ],
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

    axis: {
      type: StringType,
      default: "Z",
      editor: {
        label: "Axis",
        requires: [{ prop: "action", value: "FLIP" }],
        input: "Select",
        options: [
          { label: "X-axis", value: "X" },
          { label: "Y-axis", value: "Y" },
          { label: "Z-axis", value: "Z" },
        ],
      },
    },

    rotate: {
      type: NumberType,
      default: 180,
      editor: {
        label: "Rotate (deg)",
        requires: [{ prop: "action", value: "FLIP" }],
      },
    },
  };

  static editor = {
    label: "Clickable",
  };
}
