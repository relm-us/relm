import { get } from "svelte/store"
import { Quaternion, Euler } from "three"

import { worldUIMode } from "~/stores/worldUIMode"

import { System, type Entity, Groups } from "~/ecs/base"
import { Transform } from "~/ecs/plugins/core"
import { Spin } from "../components"

const e1 = new Euler()
const r1 = new Quaternion()

export class SpinSystem extends System {
  order = Groups.Initialization

  static queries = {
    active: [Spin],
  }

  update(delta) {
    const $mode = get(worldUIMode)
    if ($mode === "build") return

    const time = performance.now() / 1000
    this.queries.active.forEach((entity) => {
      this.spinning(entity, time)
    })
  }

  spinning(entity: Entity, time: number) {
    const spin: Spin = entity.get(Spin)
    const transform = entity.get(Transform)

    const radian = spin.speed * Math.PI * 2 * time

    switch (spin.axis) {
      case "X":
        e1.set(radian, 0, 0)
        break
      case "Y":
        e1.set(0, radian, 0)
        break
      case "Z":
        e1.set(0, 0, radian)
        break
    }

    transform.rotation.setFromEuler(e1)
    transform.modified()
  }
}
