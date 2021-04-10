import { Component, NumberType, StringType } from "~/ecs/base";

export class Animation extends Component {
  static props = {
    clipName: {
      type: StringType,
      default: null,
      editor: {
        label: "Clip Name",
      },
    },

    transition: {
      type: NumberType,
      default: 0.2,
      editor: {
        label: "Transition Time"
      }
    },

    timeScale: {
      type: NumberType,
      default: 1,
      editor: {
        label: "Time Scale",
      },
    },
  };

  static editor = {
    label: "Animation",
  };
}
