import { Component } from "~/ecs/base";

export class KeepOnStage extends Component {
  static editor = {
    label: "Keep on Stage",
    description: "When this object is off stage, don't remove/recycle it.",
  };
}
