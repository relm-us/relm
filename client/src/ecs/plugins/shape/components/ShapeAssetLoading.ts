import { StateComponent, NumberType } from "~/ecs/base"

export class ShapeAssetLoading extends StateComponent {
  static props = {
    id: { type: NumberType },
  }
}
