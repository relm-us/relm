import { Component, RefType, BooleanType } from "hecs";

export class HtmlNode extends Component {
  static props = {
    node: {
      type: RefType,
      editor: {
        label: "HTML Element",
      },
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
