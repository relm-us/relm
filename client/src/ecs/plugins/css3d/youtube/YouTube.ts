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
      },
    },

    alwaysOn: {
      type: BooleanType,
      default: false,
      editor: {
        label: "Force Embed",
      },
    },

    nativeControls: {
      type: BooleanType,
      default: false,
      editor: {
        label: "Native Controls"
      }
    }
  };

  static editor = {
    label: "YouTube",
  };
}
