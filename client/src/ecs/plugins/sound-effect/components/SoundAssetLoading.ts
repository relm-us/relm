import { StateComponent, NumberType } from "~/ecs/base";

export class SoundAssetLoading extends StateComponent {
  static props = {
    id: { type: NumberType },
  };
}
