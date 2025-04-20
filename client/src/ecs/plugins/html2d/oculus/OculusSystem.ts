import { type Object3D, Vector3 } from "three"
import { Tween, Easing } from "@tweenjs/tween.js"

import { worldManager } from "~/world"

import { System, Groups, Not, type Entity, Modified } from "~/ecs/base"
import { Object3DRef, type Presentation } from "~/ecs/plugins/core"
import type { Perspective } from "~/ecs/plugins/perspective"

import { Oculus, OculusRef } from "../components"
import type { HtmlPresentation } from "../HtmlPresentation"

import IndividualContainer from "./IndividualContainer.svelte"
import type { CutCircle } from "./types"
import { circleOverlapIntersectionPoints } from "./circleOverlapIntersectionPoints"

const v1 = new Vector3()
const v2 = new Vector3()

/**
 * An Oculus is a "round window" in architectural design. Similarly, this Oculus
 * refers to the circular video feeds above participants' heads.
 */
export class OculusSystem extends System {
  presentation: Presentation
  htmlPresentation: HtmlPresentation
  perspective: Perspective
  circles: CutCircle[] = []

  // After CameraSystem
  order = Groups.Presentation + 450

  static queries = {
    new: [Oculus, Not(OculusRef)],
    modified: [Modified(Oculus), OculusRef],
    active: [Oculus, OculusRef, Object3DRef],
    removed: [Not(Oculus), OculusRef],
  }

  init({ presentation, htmlPresentation, perspective }) {
    this.presentation = presentation
    this.htmlPresentation = htmlPresentation
    this.perspective = perspective
  }

  update() {
    this.queries.new.forEach((entity) => {
      this.build(entity)
    })
    this.queries.modified.forEach((entity) => {
      this.remove(entity)
      this.build(entity)
    })

    this.circles.length = 0
    this.queries.active.forEach((entity) => {
      this.circles.push(this.updatePosition(entity))
    })

    this.cutCircles()

    this.queries.removed.forEach((entity) => {
      this.remove(entity)
    })
  }

  build(entity: Entity) {
    const spec = entity.get(Oculus)

    // Need avConnection to exist for Oculus to work
    if (!worldManager.avConnection) return

    // Prepare a container for Svelte
    const container = this.htmlPresentation.createContainer(3)
    container.classList.add("flex")
    const x = this.htmlPresentation.percent(spec.hanchor)
    const y = this.htmlPresentation.percent(spec.vanchor)
    container.style.transform = `translate(-50%,-50%) translate(${x},${y})`
    this.htmlPresentation.domElement.appendChild(container)

    // Create the Svelte component
    const component = new IndividualContainer({
      target: container,
      props: {
        ...spec,
        participants: worldManager.participants.store,
        entity,
      },
    })

    entity.add(OculusRef, { container, component })
  }

  remove(entity: Entity) {
    const ref: OculusRef = entity.get(OculusRef)

    // Destroy Svelte component
    if (ref.component) ref.component.$destroy()

    // Remove HTML container of Svelte component
    if (ref.container) ref.container.remove()

    entity.remove(OculusRef)
  }

  updatePosition(entity: Entity): CutCircle {
    if (this.presentation.skipUpdate > 0) return

    const object3d: Object3D = entity.get(Object3DRef)?.value
    const spec: Oculus = entity.get(Oculus)

    if (spec.tween && spec.tweenedTargetOffset) {
      if (spec.tweenedTargetOffset.distanceTo(spec.targetOffset) <= 0.001) {
        spec.tween.update()
      } else {
        spec.tweenedTargetOffset = null
        spec.tween = null
      }
    } else if (spec.offset.distanceTo(spec.targetOffset) >= 0.001) {
      let time
      if (spec.offset.y > spec.targetOffset.y) {
        time = 2200
      } else {
        time = 100
      }
      spec.tweenedTargetOffset = new Vector3().copy(spec.targetOffset)
      spec.tween = new Tween(spec.offset)
        .to(spec.targetOffset, time)
        .easing(Easing.Sinusoidal.InOut)
        .onComplete(() => {
          spec.tweenedTargetOffset = null
          spec.tween = null
        })
        .start()
    }

    // calculate left, top
    v1.copy(object3d.position)
    v1.add(spec.offset)

    const dist = this.presentation.camera.parent.position.distanceTo(v1)
    const diameter = Math.round(1200 / dist)

    // Convert `v1` from 3d space to 2d space
    this.htmlPresentation.project(v1)

    const { container, component } = entity.get(OculusRef) as OculusRef

    // TODO: is there a way to detect a failed `project()` in a better way than this?
    if (!isNaN(v1.x) && isFinite(v1.x) && !isNaN(v1.y) && isFinite(v1.y)) {
      if (!spec.previous) spec.previous = new Vector3().copy(v1)

      v2.copy(spec.previous)

      if (spec.previous.distanceToSquared(v1) >= 0.5) v2.copy(v1)

      container.style.left = v2.x + "px"
      container.style.top = v2.y + "px"

      container.style.width = `${diameter}px`
      container.style.height = `${diameter}px`

      spec.previous.copy(v2)
    }

    return {
      component,
      diameter,
      x: v2.x,
      y: v2.y,
      visible: spec.showVideo,
      cuts: null,
    }
  }

  cutCircles() {
    for (const c1 of this.circles) {
      // Reset cuts
      c1.cuts = null

      if (!c1.visible) continue

      for (const c2 of this.circles) {
        // Don't try overlapping with self
        if (c1 === c2) continue
        if (!c2.visible) continue

        const isect = circleOverlapIntersectionPoints(c1, c2)

        if (isect) {
          if (!c1.cuts) c1.cuts = []
          c1.cuts.push([
            { x: isect.x1, y: isect.y1 },
            { x: isect.x2, y: isect.y2 },
          ])
        }
      }
    }

    for (const circle of this.circles) {
      circle.component.$set({
        diameter: circle.diameter,
        cuts: circle.cuts,
      })
    }
  }
}
