import { NumberType, LocalComponent, StateComponent } from "~/ecs/base";

export class Translucent extends LocalComponent {
  static props = {
    opacity: {
      type: NumberType,
      default: 0.5,
    },
  };
}

export class TranslucentApplied extends StateComponent {}