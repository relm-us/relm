import { Component, StringType, NumberType } from "hecs";

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
        requires: [{ prop: "kind", value: "YOUTUBE" }], // TODO: fix and re-test as it is broken
      },
    },

    url: {
      type: StringType,
      default: "https://google.com?igu=1",
      editor: {
        label: "Web Page URL",
        requires: [{ prop: "kind", value: "WEB_PAGE" }], // TODO: fix and re-test as it is broken
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
