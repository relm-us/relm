import { Component, NumberType } from "hecs";

export class Outline extends Component {
  static props = {
    color: {
      type: NumberType,
      default: 0xff0000,
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

    strength: {
      type: NumberType,
      default: 15,
      editor: {
        label: "Strength",
      },
    },

    glow: {
      type: NumberType,
      default: 0,
      editor: {
        label: "Glow",
      },
    },
  };

  static editor = {
    label: "Outline",
  };
}
