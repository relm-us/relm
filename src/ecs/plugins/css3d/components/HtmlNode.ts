import { Component, RefType, JSONType, BooleanType, NumberType } from "hecs";

export class HtmlNode extends Component {
  static props = {
    node: {
      type: RefType,
      editor: {
        label: "HTML Element",
      },
    },

    specification: {
      type: JSONType,
      editor: {
        label: "Specification",
      },
    },

    scale: {
      type: NumberType,
      default: 0.005,
    },

    billboard: {
      type: BooleanType,
      default: false,
      editor: {
        label: "Billboard (always face camera)",
      },
    },
  };
}
