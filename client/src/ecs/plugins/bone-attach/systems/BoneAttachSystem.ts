import { Object3D, type Bone } from "three"
import { System, Groups, Not, Modified, type Entity } from "~/ecs/base"
import { Object3DRef, type Presentation } from "~/ecs/plugins/core"

import { BoneAttach, BoneAttachError, BoneAttachRef } from "../components"
import { ModelRef } from "~/ecs/plugins/model"

export class BoneAttachSystem extends System {
  presentation: Presentation

  order = Groups.Simulation + 15

  static queries = {
    added: [BoneAttach, ModelRef, Not(BoneAttachRef), Not(BoneAttachError)],
    modified: [Modified(BoneAttach), ModelRef],
    removed: [Not(BoneAttach), BoneAttachRef],
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
    const spec: BoneAttach = entity.get(BoneAttach)
    const ref: ModelRef = entity.get(ModelRef)
    const child = ref.value.scene
    const bone = this.findBone(child, spec.boneName)
    if (bone) {
      const child = this.attach(entity, bone)
      if (child) entity.add(BoneAttachRef, { bone, child })
      else entity.add(BoneAttachError)
    } else {
      console.warn("bone not found", spec.boneName)
      entity.add(BoneAttachError)
    }
  }

  attach(entity: Entity, bone: Bone) {
    const spec = entity.get(BoneAttach)
    const entityToAttach = this.world.entities.getById(spec.entityToAttachId)
    if (entityToAttach) {
      const object: Object3D = entityToAttach.get(Object3DRef)?.value
      if (object) {
        const container = new Object3D()
        container.position.copy(spec.position)
        container.quaternion.copy(spec.rotation)
        container.scale.copy(spec.scale)
        container.add(object)

        bone.add(container)

        return container
      } else {
        console.warn(`can't attach to bone: entityToAttach has no object3d`, entityToAttach)
      }
    } else {
      console.warn(`can't attach to bone: entity not found`, spec.entityToAttachId)
    }
  }

  remove(entity) {
    const ref: BoneAttachRef = entity.get(BoneAttachRef)
    if (ref) {
      ref.child.removeFromParent()
      entity.remove(BoneAttachRef)
    }
    entity.maybeRemove(BoneAttachError)
  }

  findBone(root: Object3D, boneName: string): Bone {
    let bone
    root.traverse((node) => {
      if ((node as Bone).isBone && node.name === boneName) {
        bone = node
      }
    })
    return bone
  }
}
