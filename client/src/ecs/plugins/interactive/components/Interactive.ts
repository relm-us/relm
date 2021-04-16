import { BooleanType, LocalComponent, StateComponent } from "~/ecs/base";

export class Interactive extends LocalComponent {
  static props = {
    mouse: {
      type: BooleanType,
      default: false,
    },
  };

  editor: {
    label: "Interactive"
  }
}

export class InteractiveApplied extends StateComponent {}