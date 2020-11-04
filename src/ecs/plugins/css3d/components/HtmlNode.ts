import { Component, RefType, BooleanType, NumberType } from "hecs";

export class HtmlNode extends Component {
  static props = {
    node: {
      type: RefType,
      editor: {
        label: "HTML Element",
      },
    },

    scale: {
      type: NumberType,
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
