import { Component, BooleanType, NumberType } from "~/ecs/base"

export class Translucent extends Component {
  startOpacity: number
  endOpacity: number
  duration: number
  twoSided: boolean

  static props = {
    startOpacity: {
      type: NumberType,
      default: 1.0,
      editor: {
        label: "Start Opacity",
      },
    },

    endOpacity: {
      type: NumberType,
      default: 0.5,
      editor: {
        label: "End Opacity",
      },
    },

    duration: {
      type: NumberType,
      default: 300,
      editor: {
        label: "Transition Duration",
      },
    },

    twoSided: {
      type: BooleanType,
      default: false,
      editor: {
        label: "Two-sided?",
      },
    },
  }

  static editor = {
    label: "Translucent",
  }
}
