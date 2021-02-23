import { Component, StringType, NumberType, BooleanType } from "~/ecs/base";

export class Renderable extends Component {
  static props = {
    kind: {
      type: StringType,
      default: "AVATAR_HEAD",
      editor: {
        label: "Renderable Type",
        input: "Select",
        options: [
          { label: "Avatar Head", value: "AVATAR_HEAD" },
          { label: "Label", value: "LABEL" },
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

    editable: {
      type: BooleanType,
      default: false,
      editor: {
        label: "Editable",
        requires: [{ prop: "kind", value: "LABEL" }],
      },
    },

    width: {
      type: NumberType,
      default: 560,
      editor: {
        label: "Width",
      },
    },

    height: {
      type: NumberType,
      default: 315,
      editor: {
        label: "Height",
      },
    },

    scale: {
      type: NumberType,
      default: 0.005,
      editor: {
        label: "Scale",
      },
    },
  };

  static editor = {
    name: "Renderable",
  };
}
