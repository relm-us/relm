import { Component, StringType, JSONType } from "~/ecs/base";

export class Clickable extends Component {
  action: string;
  link: string;
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
          { label: "Open URL (other tab)", value: "LINK" },
          { label: "Toggle Property", value: "TOGGLE" },
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
    label: "Clickable"
  }
}
