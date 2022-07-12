import { StateComponent, StringType } from "~/ecs/base";

export class AssetError extends StateComponent {
  static props = {
    error: {
      type: StringType,
      default: null,
    },
  };
}
