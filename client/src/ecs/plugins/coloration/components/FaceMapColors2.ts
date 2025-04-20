import { Component, JSONType } from "~/ecs/base"

export class FaceMapColors2 extends Component {
  colors: any

  static props = {
    colors: {
      type: JSONType,
      default: null,
      editor: {
        label: "Color Weights",
        // This is a very specific input type designed just for this Component
        input: "FaceMapColors",
      },
    },
  }

  static editor = {
    label: "Model Colors",
  }
}
