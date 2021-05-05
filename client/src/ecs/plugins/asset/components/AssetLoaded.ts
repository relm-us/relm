import { StateComponent, RefType, StringType } from "~/ecs/base";

export class AssetLoaded extends StateComponent {
  static props = {
    value: {
      type: RefType,
    },
  };
}
