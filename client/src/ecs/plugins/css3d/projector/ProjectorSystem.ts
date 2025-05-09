import type { Collider } from "@dimforge/rapier3d"

import { worldManager } from "~/world"

import { Not, Modified } from "~/ecs/base"
import { Object3DRef, Transform } from "~/ecs/plugins/core"
import type { Queries } from "~/ecs/base/Query"
import type { Physics } from "~/ecs/plugins/physics"
import { ImplicitColliderRef } from "~/ecs/plugins/collider"

import { RenderableBaseSystem } from "../base/RenderableBaseSystem"
import { CssPlane } from "../components"

import { Projector } from "./Projector"
import { ProjectorRef } from "./ProjectorRef"
import ProjectorComponent from "./Projector.svelte"

// How far away an avatar can be from the Projector before it is no longer
// considered to be "near"
const NEAR_EXTENT = 1

export class ProjectorSystem extends RenderableBaseSystem {
  physics: Physics

  static queries: Queries = {
    added: [Projector, Not(ProjectorRef)],
    modified: [Modified(Projector), ProjectorRef],
    modifiedCssPlane: [Modified(CssPlane), ProjectorRef],
    active: [Projector, ProjectorRef, Object3DRef],
    removed: [Not(Projector), ProjectorRef],
  }

  init({ cssPresentation, physics }) {
    this.cssPresentation = cssPresentation
    this.physics = physics

    this.EcsComponent = Projector
    this.EcsComponentRef = ProjectorRef
    this.RenderableComponent = ProjectorComponent
  }

  update() {
    this.queries.added.forEach((entity) => this.build(entity))
    this.queries.modified.forEach((entity) => this.modify(entity))
    this.queries.modifiedCssPlane.forEach((entity) => this.rebuild(entity))
    this.queries.active.forEach((entity) => {
      this.transform(entity)

      // Find nearest video stream and share it
      if (this.world.version % 17 === 0) {
        const transform: Transform = entity.get(Transform)
        const ref: ImplicitColliderRef = entity.get(ImplicitColliderRef)
        const shape = new this.physics.rapier.Cuboid(
          ref.size.x / 2 + NEAR_EXTENT,
          ref.size.y / 2,
          ref.size.z / 2 + NEAR_EXTENT,
        )

        let iAmNear = false
        this.physics.world.intersectionsWithShape(
          transform.position,
          transform.rotation,
          shape,
          (collider: Collider) => {
            const entity = this.physics.colliders.get(collider.handle)

            if (entity === worldManager.avatar.entities.body) {
              iAmNear = true
            }

            return true
          },
        )

        this.setSvelteProps(entity, { iAmNear })
      }
    })
    this.queries.removed.forEach((entity) => this.remove(entity))
  }
}
