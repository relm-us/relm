import { Component, NumberType } from "hecs";

export class Outline extends Component {
  static props = {
    color: {
      type: NumberType,
      default: "white",
      editor: {
        label: "Color",
      },
    },

    thickness: {
      type: NumberType,
      default: 2,
      editor: {
        label: "Thickness",
      },
    },
  };
}
