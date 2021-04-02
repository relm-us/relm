import { Component, JSONType, NumberType, StringType } from "~/ecs/base";

export class FaceMapColors extends Component {
  static props = {
    colors: {
      type: JSONType,
      default: null,
      editor: {
        label: "Color Targets & Weights",
      },
    },
  };

  static editor = {
    label: "Face Map Colors",
  };
}
