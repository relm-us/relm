import { Component } from "hecs";
import { Vector3Type, Vector3 } from "hecs-plugin-core";

export class LocalPortal extends Component {
  static props = {
    destination: {
      type: Vector3Type,
      default: new Vector3(),
      editor: {
        label: "Destination",
      },
    },
  };

  static editor = {
    label: "LocalPortal",
  };
}
