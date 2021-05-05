import { StateComponent, NumberType, RefType } from "~/ecs/base";

export class AssetLoading extends StateComponent {
  static props = {
    id: {
      type: NumberType,
    },
  };
}
