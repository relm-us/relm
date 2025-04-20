import { AnimationMixer, LoopOnce } from "three"

import { type Entity, System, Groups, Not, Modified } from "~/ecs/base"
import { ModelRef } from "~/ecs/plugins/model"

import { Animation, MixerRef } from "../components"

export class AnimationSystem extends System {
  order = Groups.Simulation + 1

  static queries = {
    new: [Animation, ModelRef, Not(MixerRef)],
    modified: [Modified(Animation)],
    active: [Animation, MixerRef],
    removed: [Not(Animation), MixerRef],
  }

  update(delta) {
    this.queries.new.forEach((entity) => {
      this.build(entity)
      this.setAnimation(entity)
    })
    this.queries.modified.forEach((entity) => {
      this.setAnimation(entity)
    })
    this.queries.active.forEach((entity) => {
      const { value: mixer } = entity.get(MixerRef)
      mixer.update(delta)
    })
    this.queries.removed.forEach((entity) => {
      this.remove(entity)
    })
  }

  build(entity: Entity) {
    // Create Mixer
    const ref: ModelRef = entity.get(ModelRef)
    const mixer = new AnimationMixer(ref.value.scene)
    entity.add(MixerRef, { value: mixer })

    // Flag Skinned Meshes as non-frustum-cullable, except avatar,
    // which we handle as a special case in ModelSystem normalize
    if (ref.value.scene.parent.name === "Avatar") return
    ref.value.scene.traverse((node) => {
      if ((node as any).isSkinnedMesh) node.frustumCulled = false
    })
  }

  setAnimation(entity: Entity) {
    const spec = entity.get(Animation)
    const mixer: MixerRef = entity.get(MixerRef)
    if (!mixer) return

    const ref: ModelRef = entity.get(ModelRef)

    mixer.previousAction = mixer.activeAction
    const clip = ref.value.animations.find((c) => c.name === spec.clipName)
    if (!clip) return

    mixer.activeAction = mixer.value.clipAction(clip)

    if (mixer.previousAction && mixer.previousAction !== mixer.activeAction) {
      mixer.previousAction.fadeOut(spec.transition)
    }

    mixer.activeAction
      .reset()
      .setEffectiveTimeScale(spec.timeScale)
      .setEffectiveWeight(1)
      .fadeIn(spec.transition)
      .play()
    if (!spec.loop) {
      mixer.activeAction.setLoop(LoopOnce, 1)
      mixer.activeAction.clampWhenFinished = true
    }
  }

  remove(entity: Entity) {
    const mixer = entity.get(MixerRef).value

    mixer.stopAllAction()
    mixer.uncacheRoot(mixer.getRoot())

    entity.remove(MixerRef)
  }
}
