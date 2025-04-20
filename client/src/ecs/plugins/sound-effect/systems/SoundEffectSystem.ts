import { System, Groups, type Entity, Not } from "~/ecs/base"
import type { Presentation } from "~/ecs/plugins/core"
import { Impact } from "~/ecs/plugins/physics"

import { participantId } from "~/identity/participantId"

import { SoundAssetLoaded, SoundEffect, SoundEffectEntered } from "../components"

export class SoundEffectSystem extends System {
  presentation: Presentation

  order = Groups.Initialization

  static queries = {
    boundary: [SoundEffect, Impact],
    remove: [Not(SoundEffect), SoundEffectEntered],
  }

  init({ presentation }) {
    this.presentation = presentation
  }

  update() {
    this.queries.boundary.forEach((entity) => {
      const impact: Impact = entity.get(Impact)
      if (impact.other?.id !== participantId) return

      const enteredYet = entity.has(SoundEffectEntered)

      if (impact.started && !enteredYet) {
        this.enterSoundEffect(entity)
      } else if (!impact.started && enteredYet) {
        this.leaveSoundEffect(entity)
      }
    })

    this.queries.remove.forEach((entity) => {
      this.leaveSoundEffect(entity)
    })
  }

  enterSoundEffect(entity: Entity) {
    const spec: SoundEffect = entity.get(SoundEffect)
    const loaded: SoundAssetLoaded = entity.get(SoundAssetLoaded)

    const sound = loaded.value
    // If this is a "LAZYLOAD" sound effect, load it now
    if (sound.state() === "unloaded") sound.load()

    if (spec.fadeIn) {
      sound.fade(0, spec.volume, spec.fadeIn)
    } else {
      sound.volume(spec.volume)
    }

    sound.loop(spec.loop)
    sound.play()

    entity.add(SoundEffectEntered)
  }

  leaveSoundEffect(entity: Entity) {
    const spec: SoundEffect = entity.get(SoundEffect)
    const loaded: SoundAssetLoaded = entity.get(SoundAssetLoaded)

    if (loaded?.value) {
      const sound = loaded.value
      if (spec.fadeOut) {
        sound.fade(spec.volume, 0, spec.fadeOut)
        sound.once("fade", () => sound.stop())
      } else {
        sound.stop()
      }
    }
    entity.remove(SoundEffectEntered)
  }
}
