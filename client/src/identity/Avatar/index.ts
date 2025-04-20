import type { Vector3 } from "three"
import type { DecoratedECSWorld } from "~/types/DecoratedECSWorld"

import type { AvatarEntities } from "~/types"

import { Transform } from "~/ecs/plugins/core"
import { Controller } from "~/ecs/plugins/player-control"
import { Collider3 } from "~/ecs/plugins/collider"
import { Translucent } from "~/ecs/plugins/translucent"
import { NonInteractive } from "~/ecs/plugins/non-interactive"

export { setAppearance } from "./appearance"
export { setEmoji } from "./emoji"
export { setOculus } from "./oculus"
export { setSpeech } from "./speech"

export { setAvatarFromParticipant } from "./setAvatarFromParticipant"

export class Avatar {
  ecsWorld: DecoratedECSWorld

  entities: AvatarEntities

  headAngle: number

  constructor(ecsWorld: DecoratedECSWorld, entities: AvatarEntities) {
    this.ecsWorld = ecsWorld
    this.entities = entities
  }

  get transform(): Transform {
    return this.entities.body.get(Transform)
  }

  get position(): Vector3 {
    return this.transform.position
  }

  enableCanFly(enabled = true) {
    const controller = this.entities.body.get(Controller)
    if (!controller) return
    controller.canFly = enabled
    controller.modified()
  }

  enablePhysics(enabled = true) {
    this.entities.body.traverse((entity) => {
      const collider: Collider3 = entity.get(Collider3)
      if (!collider) return

      collider.kind = enabled ? "AVATAR-PLAY" : "AVATAR-BUILD"

      collider.modified()
    })
  }

  enableTranslucency(enabled = true) {
    if (enabled) {
      this.entities.body.add(Translucent, { opacity: 0.5 })
    } else {
      this.entities.body.maybeRemove(Translucent)
    }
  }

  enableNonInteractive(enabled = true) {
    if (enabled) {
      this.entities.body.add(NonInteractive)
    } else {
      this.entities.body.maybeRemove(NonInteractive)
    }
  }
}
