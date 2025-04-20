import type { Mesh } from "three"
import { StateComponent, RefType } from "~/ecs/base"

export class WallMeshRef extends StateComponent {
  value: Mesh

  static props = {
    value: {
      type: RefType,
    },
  }
}
