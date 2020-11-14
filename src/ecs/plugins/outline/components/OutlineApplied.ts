import { Component, RefType } from "hecs";

export class OutlineApplied extends Component {
  static props = {
    object: {
      type: RefType,
    },
  };
}
