import { Component, StringType, BooleanType, NumberType } from "~/ecs/base"

export class DirectionalLight extends Component {
  target: string
  color: string
  intensity: number
  shadow: boolean
  shadowTop: number
  shadowBottom: number
  shadowLeft: number
  shadowRight: number
  shadowNear: number
  shadowFar: number
  shadowWidth: number
  shadowHeight: number
  shadowRadius: number

  static props = {
    target: {
      type: StringType,
      editor: {
        label: "Target Entity",
        input: "Entity",
      },
    },
    color: {
      type: StringType,
      default: "#ffffff",
      editor: {
        label: "Light Color",
        input: "Color",
      },
    },
    intensity: {
      type: NumberType,
      default: 4.0,
      editor: {
        label: "Light Intensity",
      },
    },
    shadow: {
      type: BooleanType,
      default: true,
      editor: {
        label: "Cast Shadow?",
      },
    },
    shadowTop: {
      type: NumberType,
      default: 24,
      editor: {
        label: "Shadow Top",
      },
    },
    shadowBottom: {
      type: NumberType,
      default: -24,
      editor: {
        label: "Shadow Bottom",
      },
    },
    shadowLeft: {
      type: NumberType,
      default: -24,
      editor: {
        label: "Shadow Left",
      },
    },
    shadowRight: {
      type: NumberType,
      default: 24,
      editor: {
        label: "Shadow Right",
      },
    },
    shadowNear: {
      type: NumberType,
      default: 2,
      editor: {
        label: "Shadow Near",
      },
    },
    shadowFar: {
      type: NumberType,
      default: 40,
      editor: {
        label: "Shadow Far",
      },
    },
    shadowWidth: {
      type: NumberType,
      default: 1024,
      editor: {
        label: "Shadow Width",
      },
    },
    shadowHeight: {
      type: NumberType,
      default: 1024,
      editor: {
        label: "Shadow Height",
      },
    },
    shadowRadius: {
      type: NumberType,
      default: 2,
      editor: {
        label: "Shadow Blur Radius",
      },
    },
  }

  static editor = {
    label: "Directional Light",
  }
}
