import { LineBasicMaterial, BufferGeometry, Line } from "three"

import { System, Groups, type Entity, Not } from "~/ecs/base"
import { type Presentation, Transform } from "~/ecs/plugins/core"

import { LineHelper, LineHelperRef } from "../components"

export class LineHelperSystem extends System {
  presentation: Presentation

  order = Groups.Simulation - 1

  static queries = {
    added: [LineHelper, Not(LineHelperRef), Transform],
    active: [LineHelper, LineHelperRef],
    removed: [Not(LineHelper), LineHelperRef],
  }

  init({ presentation }) {
    this.presentation = presentation
  }

  update() {
    this.queries.added.forEach((entity) => {
      this.build(entity)
    })

    this.queries.active.forEach((entity) => {
      this.updatePos(entity)
    })

    this.queries.removed.forEach((entity) => {
      this.release(entity)
    })
  }

  build(entity: Entity) {
    const spec = entity.get(LineHelper)

    if (!spec.function || typeof spec.function !== "function") {
      entity.remove(LineHelper)
      return
    }

    const origin = entity.get(Transform).position
    const endpoint = spec.function(entity)
    if (!endpoint) return

    const material = new LineBasicMaterial({ color: spec.color })
    const geometry = new BufferGeometry().setFromPoints([origin, endpoint])
    const line = new Line(geometry, material)

    entity.add(LineHelperRef, { value: line })
    this.presentation.scene.add(line)
  }

  updatePos(entity: Entity) {
    const spec = entity.get(LineHelper)

    const origin = entity.get(Transform)?.position
    const endpoint = spec.function(entity)
    if (!endpoint) return

    const line: Line = entity.get(LineHelperRef).value
    line.geometry.setFromPoints([origin, endpoint])
  }

  release(entity: Entity) {
    const line: Line = entity.get(LineHelperRef).value

    entity.remove(LineHelperRef)

    this.presentation.scene.remove(line)
  }
}
