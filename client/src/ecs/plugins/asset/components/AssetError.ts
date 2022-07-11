import { LocalComponent, StringType } from "~/ecs/base";

export class AssetError extends LocalComponent {
  static props = {
    error: {
      type: StringType,
      default: null,
    },
  };
}
