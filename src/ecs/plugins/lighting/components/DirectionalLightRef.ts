import { Component, RefType } from "hecs";

export class DirectionalLightRef extends Component {
  static props = {
    value: {
      type: RefType,
    },
  };
}
