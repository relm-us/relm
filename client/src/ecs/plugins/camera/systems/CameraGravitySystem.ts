import { get } from "svelte/store"
import { Mesh, MeshBasicMaterial, SphereGeometry, Vector3 } from "three"

import { System, Groups, type Entity } from "~/ecs/base"
import type { Queries } from "~/ecs/base/Query"
import { Object3DRef, Transform } from "~/ecs/plugins/core"
import { participantId } from "~/identity/participantId"
import { worldUIMode } from "~/stores"

import { CameraGravity, CameraGravityActive, CameraGravityVisualRef } from "../components"

import { sCurve } from "../utils/sCurve"

const v1 = new Vector3()

export class CameraGravitySystem extends System {
  order = Groups.Presentation + 401

  /**
   * The coordinates of the centroid of all CameraGravity entities
   */
  static centroid: Vector3 = new Vector3()

  /**
   * Number of entities that are currently part of the gravity calculation
   */
  static count: number = 0

  static queries: Queries = {
    gravity: [Transform, CameraGravity, CameraGravityActive],
  }

  get participant(): Entity {
    return this.world.entities.getById(participantId)
  }

  update() {
    CameraGravitySystem.count = this.calculateGravityCentroid()
  }

  calculateGravityCentroid() {
    let gravityCount = 0
    let totalMass = 0
    CameraGravitySystem.centroid.set(0, 0, 0)

    const participantTransform: Transform = this.participant?.get(Transform)

    // Camera can exist before self avatar exists
    if (!participantTransform) return

    const mode = get(worldUIMode)

    this.queries.gravity.forEach((entity) => {
      if (mode === "play") {
        this.removeVisual(entity)
      } else {
        this.removeVisual(entity)
        this.buildVisual(entity)
      }
      const transform: Transform = entity.get(Transform)
      const gravity: CameraGravity = entity.get(CameraGravity)

      const distance: number = participantTransform.position.distanceTo(transform.position)

      // use Vector2.x as innerRange and .y as outerRange
      const innerRadius = gravity.range.x
      const outerRadius = gravity.range.y
      const radiusRange = Math.abs(outerRadius - innerRadius)

      let mass
      if (distance < innerRadius) {
        // Camera weight has full effect for "near" entities
        mass = gravity.mass
      } else if (distance > outerRadius) {
        // Camera weight has no effect for "far" entities
        mass = 0
      } else {
        // Smooth transition between "near" and "far" weighting
        mass = gravity.mass * sCurve((outerRadius - distance) / radiusRange)
      }

      if (mass > 0) {
        // track number of entities
        gravityCount++

        totalMass += mass
        v1.setFromSpherical(gravity.sphere)
        v1.applyQuaternion(transform.rotation)

        // Constrain to XY plane
        // v1.z = 0;

        v1.add(transform.position).multiplyScalar(mass)

        CameraGravitySystem.centroid.add(v1)
      }
    })

    if (totalMass > 0) {
      CameraGravitySystem.centroid.divideScalar(totalMass)
    }

    return gravityCount
  }

  buildVisual(entity: Entity) {
    const object3d = entity.get(Object3DRef).value
    const gravity: CameraGravity = entity.get(CameraGravity)

    const geometry = new SphereGeometry(0.1)
    const material = new MeshBasicMaterial({ color: 0xffff00 })
    const circle = new Mesh(geometry, material)

    circle.position.setFromSpherical(gravity.sphere)

    object3d.add(circle)

    entity.add(CameraGravityVisualRef, { object: circle })
  }

  removeVisual(entity: Entity) {
    const ref: CameraGravityVisualRef = entity.get(CameraGravityVisualRef)
    if (ref) {
      ref.object.removeFromParent()
      entity.remove(CameraGravityVisualRef)
    }
  }
}
