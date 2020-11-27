import { Component, RefType } from "hecs";

export class RenderableRef extends Component {
  static props = {
    value: {
      type: RefType,
    },
  };
}
