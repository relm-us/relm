import { LocalComponent, NumberType } from "hecs";

export class Outline extends LocalComponent {
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
