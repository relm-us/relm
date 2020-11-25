import { Component, StringType, NumberType } from "hecs";

export class BallJoint extends Component {
  static props = {
    entity: {
      type: StringType,
      editor: {
        label: "Entity",
        input: "Entity",
      },
    },
    breakForce: {
      type: NumberType,
      default: 0,
      editor: {
        label: "Break Force",
      },
    },
    breakTorque: {
      type: NumberType,
      default: 0,
      editor: {
        label: "Break Torque",
      },
    },
  };
  static editor = {
    label: "Fixed Joint",
  };
}
