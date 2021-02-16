import { Component, NumberType, StringType } from "~/ecs/base";

export class Fire extends Component {
  static props = {
    blaze: {
      type: NumberType,
      default: 0.0,
      editor: {
        label: "Blaze",
      },
    },

    color: {
      type: StringType,
      default: "#F69753",
      editor: {
        label: "Color",
        input: "Color",
      },
    },
  };

  static editor = {
    label: "Fire",
  };
}
