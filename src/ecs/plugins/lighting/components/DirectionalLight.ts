import { Component, StringType, BooleanType, NumberType } from "hecs";

export class DirectionalLight extends Component {
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
    shadowRadius: {
      type: NumberType,
      default: 2,
      editor: {
        label: "Shadow Blur Radius",
      },
    },
    shadowTop: {
      type: NumberType,
      default: 10,
      editor: {
        label: "Shadow Top",
      },
    },
    shadowBottom: {
      type: NumberType,
      default: -10,
      editor: {
        label: "Shadow Bottom",
      },
    },
    shadowLeft: {
      type: NumberType,
      default: -10,
      editor: {
        label: "Shadow Left",
      },
    },
    shadowRight: {
      type: NumberType,
      default: 10,
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
  };
  static editor = {
    label: "Follow",
  };
}
