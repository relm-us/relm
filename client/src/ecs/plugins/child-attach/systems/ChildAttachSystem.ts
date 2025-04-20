import { Object3D } from "three"
import { System, Groups, Not, Modified, type Entity } from "~/ecs/base"
import { Object3DRef, type Presentation } from "~/ecs/plugins/core"

import { ChildAttach, ChildAttachRef } from "../components"

export class ChildAttachSystem extends System {
  presentation: Presentation

  order = Groups.Simulation + 15

  static queries = {
    added: [ChildAttach, Object3DRef, Not(ChildAttachRef)],
    modified: [Modified(ChildAttach), Object3DRef],
    removed: [Not(ChildAttach), ChildAttachRef],
  }

  init({ presentation }) {
    this.presentation = presentation
  }

  update() {
    this.queries.added.forEach((entity) => {
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
    const spec = entity.get(ChildAttach)
    const ref: Object3DRef = entity.get(Object3DRef)
    const parentObj3d: Object3D = ref.value
    const child: Entity = this.world.entities.getById(spec.entityToAttachId)
    if (child) {
      const childObj3d: Object3D = child.get(Object3DRef)?.value

      const container = new Object3D()
      container.position.copy(spec.position)
      container.quaternion.copy(spec.rotation)
      container.scale.copy(spec.scale)
      container.add(childObj3d)

      ref.value.add(container)

      entity.add(ChildAttachRef, { parent: parentObj3d, child: childObj3d })
    } else {
      console.warn(`can't attach to Child: entity not found`, spec.entityToAttachId)

      entity.add(ChildAttachRef, {
        parent: parentObj3d,
        child: new Object3D(),
      })
    }
  }

  remove(entity) {
    const ref: ChildAttachRef = entity.get(ChildAttachRef)
    if (ref) {
      ref.child.removeFromParent()
      entity.remove(ChildAttachRef)
    }
  }
}
