import { BooleanType, NumberType, Component } from "~/ecs/base";

export class TranslucentOptions extends Component {
  opaque: boolean;
  twoSided: boolean;
  time: number;

  static props = {
    opaque: {
      type: BooleanType,
      default: false,
      editor: {
        label: "Opaque?",
      },
    },

    twoSided: {
      type: BooleanType,
      default: false,
      editor: {
        label: "Two-sided?",
      },
    },

    time: {
      type: NumberType,
      default: 500,
      editor: {
        label: "Transition Time (ms)",
      },
    },
  };

  static editor = {
    label: "Translucent Options",
  };
}
