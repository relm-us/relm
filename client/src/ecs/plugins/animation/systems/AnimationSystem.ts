import { AnimationMixer, LoopOnce } from "three";

import { Entity, System, Groups, Not, Modified } from "~/ecs/base";
import { ModelRef } from "~/ecs/plugins/model";

import { Animation, MixerRef } from "../components";

export class AnimationSystem extends System {
  order = Groups.Simulation + 1;

  static queries = {
    new: [Animation, ModelRef, Not(MixerRef)],
    modified: [Modified(Animation)],
    active: [Animation, MixerRef],
    removed: [Not(Animation), MixerRef],
  };

  update(delta) {
    const dt = 1 / (1000 / delta);
    this.queries.new.forEach((entity) => {
      this.build(entity);
      this.setAnimation(entity);
    });
    this.queries.modified.forEach((entity) => {
      this.setAnimation(entity);
    });
    this.queries.active.forEach((entity) => {
      const { value: mixer } = entity.get(MixerRef);
      mixer.update(dt);
    });
    this.queries.removed.forEach((entity) => {
      this.remove(entity);
    });
  }

  build(entity: Entity) {
    // Create Mixer
    const { scene } = entity.get(ModelRef);
    const mixer = new AnimationMixer(scene);
    entity.add(MixerRef, { value: mixer });

    // Flag Skinned Meshes as non-frustum-cullable, except avatar,
    // which we handle as a special case in ModelSystem normalize
    if (scene.parent.name === "Avatar") return;
    scene.traverse((node) => {
      if (node.isSkinnedMesh) node.frustumCulled = false;
    });
  }

  setAnimation(entity: Entity) {
    const spec = entity.get(Animation);
    const mixer = entity.get(MixerRef)?.value;
    if (!mixer) return;

    const { animations } = entity.get(ModelRef);

    if (spec.transition === 0) {
      mixer.stopAllAction();
      mixer.uncacheRoot(mixer.getRoot());

      mixer.timeScale = spec.timeScale;
      const clip = animations.find((c) => c.name === spec.clipName);
      if (clip) {
        mixer.activeAction = mixer.clipAction(clip).reset().play();
        if (!spec.loop) {
          mixer.activeAction.setLoop(LoopOnce);
          mixer.activeAction.clampWhenFinished = true;
        }
      }
    } else {
      mixer.previousAction = mixer.activeAction;
      const clip = animations.find((c) => c.name === spec.clipName);
      if (!clip) return;

      mixer.activeAction = mixer.clipAction(clip);

      if (mixer.previousAction && mixer.previousAction !== mixer.activeAction) {
        mixer.previousAction.fadeOut(spec.transition);
      }

      mixer.activeAction
        .reset()
        .setEffectiveTimeScale(1)
        .setEffectiveWeight(1)
        .fadeIn(spec.transition)
        .play();
      if (!spec.loop) {
        mixer.activeAction.setLoop(LoopOnce);
        mixer.activeAction.clampWhenFinished = true;
      }
    }
  }

  remove(entity: Entity) {
    const mixer = entity.get(MixerRef).value;

    mixer.stopAllAction();
    mixer.uncacheRoot(mixer.getRoot());

    entity.remove(MixerRef);
  }
}
