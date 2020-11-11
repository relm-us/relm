import { Component, RefType } from "hecs";

export class OutlineApplied extends Component {
  static props = {
    originalMesh: {
      type: RefType,
    },
  };
}
