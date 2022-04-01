import { Component, StringType, NumberType, BooleanType } from "~/ecs/base";

export class Renderable extends Component {
  kind: string;
  embedId: string;
  url: string;
  text: string;
  fontSize: string;
  fontColor: string;
  bgColor: string;
  borderColor: string;
  scale: number;
  editable: boolean;
  alwaysOn: boolean;
  visible: boolean;

  static props = {
    kind: {
      type: StringType,
      default: "AVATAR_HEAD",
      editor: {
        label: "Type",
        input: "Select",
        options: [
          { label: "Avatar Head", value: "AVATAR_HEAD" },
          { label: "Billboard", value: "LABEL" },
          { label: "Web Page", value: "WEB_PAGE" },
          { label: "YouTube", value: "YOUTUBE" },
        ],
      },
    },

    embedId: {
      type: StringType,
      default: "U_u91SjrEOE",
      editor: {
        label: "YouTube Embed ID",
        requires: [{ prop: "kind", value: "YOUTUBE" }],
      },
    },

    url: {
      type: StringType,
      default: "https://google.com?igu=1",
      editor: {
        label: "Web Page URL",
        requires: [{ prop: "kind", value: "WEB_PAGE" }],
      },
    },

    text: {
      type: StringType,
      default: "hello",
      editor: {
        label: "Text",
        requires: [{ prop: "kind", value: "LABEL" }],
      },
    },

    fontSize: {
      type: StringType,
      default: 32,
      editor: {
        label: "Font Size",
        requires: [{ prop: "kind", value: "LABEL" }],
      },
    },

    fontColor: {
      type: StringType,
      default: "#151515",
      editor: {
        label: "Font Color",
        input: "Color",
        requires: [{ prop: "kind", value: "LABEL" }],
      },
    },

    bgColor: {
      type: StringType,
      default: "#fbfbfb",
      editor: {
        label: "Background Color",
        input: "Color",
        requires: [{ prop: "kind", value: "LABEL" }],
      },
    },

    borderColor: {
      type: StringType,
      default: "#8b8b8b",
      editor: {
        label: "Border Color",
        input: "Color",
        requires: [{ prop: "kind", value: "LABEL" }],
      },
    },

    scale: {
      type: NumberType,
      default: 0.005,
      editor: {
        label: "Scale",
      },
    },

    editable: {
      type: BooleanType,
      default: false,
      editor: {
        label: "Editable",
        requires: [{ prop: "kind", value: "LABEL" }],
      },
    },

    alwaysOn: {
      type: BooleanType,
      default: false,
      editor: {
        label: "Force Embed",
      },
    },

    visible: {
      type: BooleanType,
      default: true,
      editor: {
        label: "Visible",
      },
    },
  };

  static editor = {
    label: "Renderable",
  };
}
