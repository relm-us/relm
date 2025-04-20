import { LineSegments, LineBasicMaterial, BufferGeometry, BufferAttribute } from "three"

import { PHYSICS_TIMESTEP } from "~/config/constants"

import { System, Groups } from "~/ecs/base"
import { type Presentation, Transform } from "~/ecs/plugins/core"
import { NonInteractive } from "~/ecs/plugins/non-interactive"

import type { Physics } from ".."
import { Impact } from "../components"
import { createFixedTimestep } from "./createFixedTimestep"

const empty = new BufferAttribute(new Float32Array(), 0)

export class PhysicsSystem extends System {
  fixedUpdate: Function
  physics: Physics
  presentation: Presentation
  lines: LineSegments

  order = Groups.Presentation + 300

  static showDebug: boolean = false

  static queries = {
    impacts: [Impact],
  }

  init({ physics, presentation }) {
    this.physics = physics
    this.presentation = presentation

    // Create a regular, fixed physics time-step, regardless of rendering framerate
    this.fixedUpdate = createFixedTimestep(PHYSICS_TIMESTEP, this.onFixedUpdate.bind(this))
  }

  // delta is number of seconds since last frame, e.g. 0.0166s if framerate is 60fps
  update(delta: number) {
    // Impact components last just one cycle; clean up old ones
    this.queries.impacts.forEach((entity) => {
      entity.remove(Impact)
    })

    // NOTE: ColliderSystem will have already updated the rigid body's translation
    //       and rotation by this point.

    this.fixedUpdate(delta)

    this.copyActiveTransforms(true)

    if (PhysicsSystem.showDebug) {
      this.showDebug()
    } else if (this.lines) {
      this.lines.geometry.setAttribute("position", empty)
      this.lines.geometry.setAttribute("color", empty)
    }
  }

  onFixedUpdate(dt) {
    if (!this.active) return

    const { world, eventQueue } = this.physics

    world.integrationParameters.dt = dt
    world.step(eventQueue)

    // Add Impacts when contact or intersection takes place. We need to
    // do this here, rather than in a separate system, because the Physics
    // System is happening faster than the regular loop.
    eventQueue.drainCollisionEvents((handle1: number, handle2: number, started: boolean) => {
      const entity1 = this.physics.colliders.get(handle1)
      const entity2 = this.physics.colliders.get(handle2)

      if (!entity1.has(NonInteractive) && !entity2.has(NonInteractive)) {
        entity1.add(Impact, { other: entity2, started })
        entity2.add(Impact, { other: entity1, started })
      }
    })
  }

  // Copy the physics engine's positions and rotations back to our ECS world Transform;
  // Optionally: Clear the actions list, so that it can be re-filled during next ECS world step
  copyActiveTransforms(reset = true) {
    this.physics.world.forEachActiveRigidBody((body) => {
      const entity = this.physics.bodies.get(body.handle)

      const parent = entity.getParent()
      const transform = entity.get(Transform)

      if (!parent) {
        transform.position.copy(body.translation())
        transform.rotation.copy(body.rotation())

        // Notify all dependent systems that the Transform has changed
        // NOTE: other systems should NOT update physics directly, or
        // an infinite loop can occur, and physics goes wonky
        transform.modified()
      } else {
        console.log("physics disabled for entity with parent")
      }

      if (reset) {
        body.resetForces(false)
        body.resetTorques(false)
      }
    })
  }

  showDebug() {
    if (!this.lines) {
      let material = new LineBasicMaterial({
        color: 0xffffff,
        vertexColors: true,
      })
      let geometry = new BufferGeometry()
      this.lines = new LineSegments(geometry, material)
      this.presentation.scene.add(this.lines)
    }

    let buffers = this.physics.world.debugRender()

    const position = new BufferAttribute(buffers.vertices, 3)
    this.lines.geometry.setAttribute("position", position)

    const color = new BufferAttribute(buffers.colors, 4)
    this.lines.geometry.setAttribute("color", color)
  }
}
