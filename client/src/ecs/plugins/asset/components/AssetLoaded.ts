import { StateComponent, RefType } from "~/ecs/base";

export class AssetLoaded extends StateComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}
