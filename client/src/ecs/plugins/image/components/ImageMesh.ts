import type { Mesh } from "three"
import { StateComponent, RefType } from "~/ecs/base"

export class ImageMesh extends StateComponent {
  value: Mesh

  static props = {
    value: {
      type: RefType,
    },
  }
}
