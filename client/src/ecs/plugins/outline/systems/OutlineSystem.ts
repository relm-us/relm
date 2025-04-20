import type { Object3D } from "three"

import { System, Groups, Not, type Entity, Modified } from "~/ecs/base"
import { Object3DRef, type Presentation } from "~/ecs/plugins/core"
import { Outline, OutlineApplied } from "../components"

export class OutlineSystem extends System {
  presentation: Presentation
  selectedObjects: Object3D[]

  order = Groups.Initialization + 50

  static queries = {
    added: [Outline, Not(OutlineApplied), Object3DRef],
    modifiedObj3d: [Modified(Object3DRef)],
    removed: [Not(Outline), OutlineApplied],
  }

  init({ presentation }) {
    this.presentation = presentation
    this.selectedObjects = []
    this.presentation.outlineEffect.selection.set(this.selectedObjects)
  }

  update() {
    this.queries.modifiedObj3d.forEach((entity) => {
      this.removeOutline(entity)
    })

    this.queries.added.forEach((entity) => {
      this.addOutline(entity)
    })

    this.queries.removed.forEach((entity) => {
      this.removeOutline(entity)
    })
  }

  addOutline(entity) {
    const object: Object3D = entity.get(Object3DRef).value
    object.traverse((obj) => {
      this.presentation.outlineEffect.selection.add(obj)
    })
    entity.add(OutlineApplied, { object })
  }

  removeOutline(entity: Entity) {
    const applied = entity.get(OutlineApplied)
    if (applied) {
      applied.object.traverse((obj) => {
        this.presentation.outlineEffect.selection.delete(obj)
      })
      entity.remove(OutlineApplied)
    }
  }
}
