import { Vector3, Matrix4, Quaternion } from "three"
import { System, type Entity } from "~/ecs/base"

import { Transform, type Presentation } from "~/ecs/plugins/core"
import { LookAt } from "../components"

const m1 = new Matrix4()
const q1 = new Quaternion()
const targetPosition = new Vector3()
const targetRotation = new Quaternion()
const position = new Vector3()
const up = new Vector3(0, 1, 0)
const delta = new Vector3()

export class LookAtSystem extends System {
  presentation: Presentation
  cameraId: string
  frames: number = 0

  order = 3001

  static queries = {
    targeted: [LookAt],
  }

  init({ presentation }) {
    this.presentation = presentation
    this.cameraId = null
  }

  update() {
    // Keep cameraId around because we access it for each entity
    this.cameraId = this.presentation.camera.parent?.userData.entityId

    this.queries.targeted.forEach((entity) => {
      this.lookAt(entity)
    })
  }

  lookAt(entity: Entity) {
    const lookAt = entity.get(LookAt)
    const transform = entity.get(Transform)

    const targetEntity = this.world.entities.getById(lookAt.target)
    if (!targetEntity) return

    const targetTransform = targetEntity.get(Transform) as any
    if (!targetTransform) return

    position.copy(transform.position)

    targetPosition.copy(targetTransform.position)

    // Camera looks down negative z-axis, so when it is the thing doing the looking, flip it around
    if (entity.id === this.cameraId) {
      delta.copy(targetPosition).sub(position).multiplyScalar(2)
      targetPosition.sub(delta).sub(lookAt.offset)
    } else {
      targetPosition.add(lookAt.offset)
    }

    if (lookAt.limit === "X_AXIS") {
      targetPosition.x = position.x
    } else if (lookAt.limit === "Y_AXIS") {
      targetPosition.y = position.y
    } else if (lookAt.limit === "Z_AXIS") {
      targetPosition.z = position.z
    }

    m1.lookAt(targetPosition, position, up)
    if (lookAt.stepRadians == 0) {
      transform.rotation.setFromRotationMatrix(m1)
    } else {
      targetRotation.setFromRotationMatrix(m1)
      transform.rotation.rotateTowards(targetRotation, lookAt.stepRadians)
    }

    const parent = entity.getParent()
    if (parent) {
      m1.extractRotation(parent.get(Transform).matrix)
      q1.setFromRotationMatrix(m1).invert()
      transform.rotation.premultiply(q1)
    }

    if (lookAt.oneShot) {
      if (this.frames > 30 && transform.rotation.angleTo(targetRotation) < 0.001) {
        lookAt.oneShot = false
        this.frames = 0
        entity.remove(LookAt)
      }
      this.frames++
    }

    transform.modified()
  }
}
