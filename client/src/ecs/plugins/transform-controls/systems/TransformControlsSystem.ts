import { type Object3D, Vector3 } from "three"
import { TransformControls as ThreeTransformControls } from "./TransformControls"

import { System, Groups, type Entity, Not } from "~/ecs/base"
import { type Presentation, Object3DRef, Transform } from "~/ecs/plugins/core"

import { TransformControls, TransformControlsRef } from "../components"

const start = new Vector3()
const delta = new Vector3()
export class TransformControlsSystem extends System {
  static selected: Entity = null

  presentation: Presentation

  order = Groups.Simulation

  static queries = {
    added: [TransformControls, Object3DRef, Not(TransformControlsRef)],
    removed: [Not(TransformControls), TransformControlsRef],
  }

  init({ presentation }) {
    this.presentation = presentation
  }

  update(delta) {
    this.queries.added.forEach((entity) => {
      this.build(entity)
    })

    this.queries.removed.forEach((entity) => {
      this.remove(entity)
    })
  }

  build(entity: Entity) {
    const spec: TransformControls = entity.get(TransformControls)
    const transform: Transform = entity.get(Transform)
    const object3d: Object3D = entity.get(Object3DRef).value

    const controls = new ThreeTransformControls(
      this.presentation.camera,
      this.presentation.renderer.domElement.parentElement,
    )

    this.presentation.scene.add(controls)

    let changed = false
    controls.addEventListener("change", () => {
      // Update physics engine
      if (!transform.position.equals(object3d.position)) {
        delta.copy(object3d.position).sub(start)
        spec.onMove?.(entity, delta)
        changed = true
      }
      if (!transform.rotation.equals(object3d.quaternion)) {
        spec.onRotate?.(entity, start, controls.rotationAngle, controls.rotationAxis)
        changed = true
      }
      if (!transform.scale.equals(object3d.scale)) {
        transform.scale.copy(object3d.scale)
        changed = true
      }
      if (changed) {
        transform.modified()
        spec.onChange?.(entity)
      }
    })

    controls.addEventListener("mouseDown", () => {
      start.copy(transform.position)
      spec.onBegin?.(entity)
    })
    controls.addEventListener("mouseUp", () => {
      spec.onComplete?.(entity)
    })

    controls.attach(object3d)

    entity.add(TransformControlsRef, { value: controls })
  }

  remove(entity: Entity) {
    const ref: TransformControlsRef = entity.get(TransformControlsRef)

    ref.value.detach()
    ref.value.dispose()

    entity.remove(TransformControlsRef)
  }
}
