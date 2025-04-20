import type { Object3D } from "three"
import { System, Groups, type Entity, Not, Modified } from "~/ecs/base"
import { Object3DRef } from "~/ecs/plugins/core"

import { NonInteractive, NonInteractiveApplied } from "../components"

export class NonInteractiveSystem extends System {
  order = Groups.Initialization

  static queries = {
    new: [Object3DRef, NonInteractive, Not(NonInteractiveApplied)],
    modified: [Modified(NonInteractive)],
    removed: [Not(NonInteractive), NonInteractiveApplied],
  }

  update() {
    this.queries.new.forEach((entity) => {
      this.build(entity)
    })
    this.queries.modified.forEach((entity) => {
      this.remove(entity)
      this.build(entity)
    })
    this.queries.removed.forEach((entity) => {
      this.remove(entity)
    })
  }

  build(entity: Entity) {
    const object3d: Object3D = entity.get(Object3DRef).value
    object3d.userData.nonInteractive = true
    entity.add(NonInteractiveApplied)
  }

  remove(entity: Entity) {
    const object3d: Object3D = entity.get(Object3DRef)?.value
    if (object3d) delete object3d.userData.nonInteractive
    entity.remove(NonInteractiveApplied)
  }
}
