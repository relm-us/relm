import { StateComponent, NumberType } from "~/ecs/base"

export class ImageAssetLoading extends StateComponent {
  static props = {
    id: { type: NumberType },
  }
}
