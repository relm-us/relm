import type { Entity } from "~/ecs/base"
import type { DecoratedECSWorld } from "~/types"
import type { ColliderParams } from "./types"

import { type Object3D, Box3, Quaternion, Vector3 } from "three"

import { Object3DRef, Transform } from "~/ecs/plugins/core"

import { Collider3 } from "../components"
import { makeExplicitColliderParams } from "./makeExplicitColliderParams"

const _b3 = new Box3()

const logEnabled = (localStorage.getItem("debug") || "").split(":").includes("collider")

export function makeImplicitColliderParams(world: DecoratedECSWorld, entity: Entity): ColliderParams {
  const transform: Transform = entity.get(Transform)

  const rotation = new Quaternion()
  const offset = new Vector3()
  const scale = new Vector3(1, 1, 1)

  // We only use Collider3 transiently here; it is not added as a Component
  const spec = new Collider3(world, {
    kind: "ETHEREAL",
  })
  const object3d: Object3D = entity.get(Object3DRef).value

  _b3.setFromObject(object3d)

  if (_b3.isEmpty()) {
    if (entity.has(Collider3)) {
      return makeExplicitColliderParams(entity)
    } else {
      if (logEnabled) {
        console.warn("Creating empty implicit collider", entity.id)
      }
      _b3.setFromArray([0, 0, 0, 1, 1, 1])
    }
  }

  _b3.getSize(spec.size)
  _b3.getCenter(offset).sub(transform.position)

  // The AABB needs to be inverted so that the usual rotation re-aligns it to the world axes
  rotation.copy(transform.rotation).invert()

  return { spec, offset, rotation, scale }
}
