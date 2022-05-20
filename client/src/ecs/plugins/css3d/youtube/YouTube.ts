import { Component, StringType, BooleanType } from "~/ecs/base";

export class YouTube extends Component {
  embedId: string;
  alwaysOn: boolean;

  static props = {
    embedId: {
      type: StringType,
      default: "U_u91SjrEOE",
      editor: {
        label: "YouTube Embed ID",
        requires: [{ prop: "kind", value: "YOUTUBE" }],
      },
    },

    alwaysOn: {
      type: BooleanType,
      default: false,
      editor: {
        label: "Force Embed",
      },
    },
  };

  static editor = {
    label: "YouTube",
  };
}
