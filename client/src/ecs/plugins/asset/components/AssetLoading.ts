import { LocalComponent, NumberType } from "~/ecs/base";

export class AssetLoading extends LocalComponent {
  static props = {
    id: {
      type: NumberType,
    },
  };
}
