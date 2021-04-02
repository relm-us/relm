import { Component, JSONType } from "~/ecs/base";

export class Morph extends Component {
  static props = {
    influences: {
      type: JSONType,
      default: null,
      editor: {
        label: "Influence Weights",
      },
    },
  };

  static editor = {
    label: "Morph Targets",
  };
}
