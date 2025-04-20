import { worldManager } from "~/world"
import { System, Groups, type Entity } from "~/ecs/base"
import type { Presentation } from "~/ecs/plugins/core"

import { AudioZone, AudioZoneEntered } from "../components"
import { Impact } from "~/ecs/plugins/physics"

export class AudioZoneSystem extends System {
  presentation: Presentation

  order = Groups.Initialization

  static queries = {
    boundary: [AudioZone, Impact],
  }

  init({ presentation }) {
    this.presentation = presentation
  }

  update() {
    this.queries.boundary.forEach((entity) => {
      const impact: Impact = entity.get(Impact)

      // AudioZone is only applicable to the player; we should ignore
      // other objects or (remote) players entering/exiting audio zones
      // because they should not affect what the player is hearing
      if (impact.other !== worldManager.avatar.entities.body) return

      const enteredYet = entity.has(AudioZoneEntered)

      if (impact.started && !enteredYet) {
        this.enterAudioZone(entity)
      } else if (!impact.started && enteredYet) {
        this.leaveAudioZone(entity)
      }
    })
  }

  enterAudioZone(entity: Entity) {
    const spec = entity.get(AudioZone)
    entity.add(AudioZoneEntered, { zone: spec.zone })

    worldManager.changeAudioZone(spec.zone)
  }

  leaveAudioZone(entity: Entity) {
    entity.remove(AudioZoneEntered)

    worldManager.changeAudioZone(null)
  }
}
