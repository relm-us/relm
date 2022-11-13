import { StateComponent, NumberType } from "~/ecs/base";

export class ModelAssetLoading extends StateComponent {
  static props = {
    id: { type: NumberType },
  };
}
