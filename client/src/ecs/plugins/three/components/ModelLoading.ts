import { StateComponent, NumberType } from "~/ecs/base";

export class ModelLoading extends StateComponent {
  static props = {
    id: {
      type: NumberType,
    },
  };
}
