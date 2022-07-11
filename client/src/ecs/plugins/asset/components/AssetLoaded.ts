import { LocalComponent, RefType } from "~/ecs/base";

export class AssetLoaded extends LocalComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}
