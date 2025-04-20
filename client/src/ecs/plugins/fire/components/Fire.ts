import { Component, NumberType, StringType } from "~/ecs/base"

export class Fire extends Component {
  static props = {
    blaze: {
      type: NumberType,
      default: 15,
      editor: {
        label: "Blaze",
      },
    },

    octaves: {
      type: NumberType,
      default: 3,
      editor: {
        label: "Octaves",
      },
    },

    speed: {
      type: NumberType,
      default: 0.08,
      editor: {
        label: "Speed",
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

    colmix: {
      type: NumberType,
      default: 0.7,
      editor: {
        label: "Color Mix",
      },
    },
  }

  static editor = {
    label: "Fire",
  }
}
