import { Entity, System, Groups, Not, Modified } from "~/ecs/base";
import { Presentation, Object3D, ModelMesh } from "~/ecs/plugins/core";
import { Animation, MixerRef } from "../components";
import { AnimationMixer } from "three";

export class AnimationSystem extends System {
  order = Groups.Simulation + 1;

  presentation: Presentation;

  static queries = {
    new: [Animation, ModelMesh, Not(MixerRef)],
    modified: [Modified(Animation)],
    active: [Animation, MixerRef],
    removed: [Not(Animation), MixerRef],
  };

  init({ presentation }) {
    this.presentation = presentation;
  }

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
    const scene = entity.get(ModelMesh).value;
    const mixer = new AnimationMixer(scene);
    entity.add(MixerRef, { value: mixer });

    // Flag Skinned Meshes as non-frustum-cullable
    scene.traverse((node) => {
      if (node.isSkinnedMesh) {
        node.frustumCulled = false;
      }
    });
  }

  setAnimation(entity: Entity) {
    const spec = entity.get(Animation);
    const mixer = entity.get(MixerRef).value;
    const { clips } = entity.get(ModelMesh);

    mixer.stopAllAction();
    mixer.uncacheRoot(mixer.getRoot());

    mixer.timeScale = spec.timeScale;
    const clip = clips.find((c) => c.name === spec.clipName);
    if (clip) {
      mixer.clipAction(clip).reset().play();
    }
  }

  remove(entity: Entity) {
    const mixer = entity.get(MixerRef).value;

    mixer.stopAllAction();
    mixer.uncacheRoot(mixer.getRoot());

    entity.remove(MixerRef);
  }
}
