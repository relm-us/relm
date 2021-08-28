import { Component, NumberType, StringType } from "~/ecs/base";

export class Diamond extends Component {
  static props = {
    speed: {
      type: NumberType,
      default: 1.0,
      editor: {
        label: "Speed",
      },
    },
  };

  static editor = {
    label: "Diamond",
  };
}
