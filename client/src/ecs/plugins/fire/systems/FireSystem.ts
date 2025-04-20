import { MathUtils, Color, type Object3D } from "three"

import { type Entity, System, Groups, Not, Modified } from "~/ecs/base"
import { type Presentation, Object3DRef } from "~/ecs/plugins/core"

import { Fire, FireMesh } from "../components"
import { Fire as ThreeFire } from "../Fire"
import firePng from "../fire.png"

let fireTex

export class FireSystem extends System {
  order = Groups.Simulation + 1

  presentation: Presentation

  static queries = {
    new: [Fire, Object3DRef, Not(FireMesh)],
    modified: [Modified(Fire), FireMesh],
    active: [Fire, FireMesh],
    removed: [Not(Fire), FireMesh],
  }

  init({ presentation }) {
    this.presentation = presentation
    this.presentation.loadTexture(firePng).then((texture) => (fireTex = texture))
  }

  update(delta) {
    if (!fireTex) return

    this.queries.new.forEach((entity) => {
      this.build(entity)
    })
    this.queries.modified.forEach((entity) => {
      this.remove(entity)
      this.build(entity)
    })
    this.queries.active.forEach((entity) => {
      const spec = entity.get(Fire)
      const mesh = entity.get(FireMesh)

      mesh.value.update(mesh.time)
      mesh.time += spec.speed * (delta * 60)
    })
    this.queries.removed.forEach((entity) => {
      this.remove(entity)
    })
  }

  async build(entity: Entity) {
    const spec = entity.get(Fire)
    const object3dref: Object3DRef = entity.get(Object3DRef)
    const object3d: Object3D = object3dref.value

    const value = new ThreeFire(
      fireTex.clone(),
      new Color(spec.color),
      MathUtils.clamp(spec.colmix, 0, 1),
      Math.floor(MathUtils.clamp(spec.blaze, 5, 30)),
      Math.floor(MathUtils.clamp(spec.octaves, 1, 5)),
    )

    entity.add(FireMesh, { value })

    object3d.add(value)

    // Notify dependencies, e.g. BoundingBox, that object3d has changed
    object3dref.modified()
  }

  remove(entity: Entity) {
    const mesh = entity.get(FireMesh).value

    const object3dref: Object3DRef = entity.get(Object3DRef)
    if (object3dref) {
      entity.get(Object3DRef).value.remove(mesh)
      // Notify dependencies, e.g. BoundingBox, that object3d has changed
      // object3dref.modified();
    }

    entity.remove(FireMesh)
  }
}
