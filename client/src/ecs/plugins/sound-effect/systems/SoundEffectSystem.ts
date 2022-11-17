import { Howl, Howler } from "howler";

import { assetUrl } from "~/config/assetUrl";

import { System, Groups, Entity, Not } from "~/ecs/base";
import { Presentation } from "~/ecs/plugins/core";
import { Impact } from "~/ecs/plugins/physics";

import {
  SoundAssetLoaded,
  SoundEffect,
  SoundEffectEntered,
} from "../components";

export class SoundEffectSystem extends System {
  presentation: Presentation;

  order = Groups.Initialization;

  static queries = {
    boundary: [SoundEffect, Impact],
    remove: [Not(SoundEffect), SoundEffectEntered],
  };

  init({ presentation }) {
    this.presentation = presentation;
  }

  update() {
    this.queries.boundary.forEach((entity) => {
      const impact: Impact = entity.get(Impact);
      const enteredYet = entity.has(SoundEffectEntered);

      if (impact.started && !enteredYet) {
        this.enterSoundEffect(entity);
      } else if (!impact.started && enteredYet) {
        this.leaveSoundEffect(entity);
      }
    });

    this.queries.remove.forEach((entity) => {
      this.leaveSoundEffect(entity);
    });
  }

  enterSoundEffect(entity: Entity) {
    const spec: SoundEffect = entity.get(SoundEffect);
    const loaded: SoundAssetLoaded = entity.get(SoundAssetLoaded);

    if (loaded?.value) {
      const sound = loaded.value;
      entity.add(SoundEffectEntered);
      if (!spec.preload) sound.load();
      if (spec.fadeIn) sound.fade(0, 1, spec.fadeIn);
      else sound.volume(1);
      sound.loop(spec.loop);
      sound.play();
    }
  }

  leaveSoundEffect(entity: Entity) {
    const spec: SoundEffect = entity.get(SoundEffect);
    const loaded: SoundAssetLoaded = entity.get(SoundAssetLoaded);

    if (loaded?.value) {
      const sound = loaded.value;
      if (spec.fadeOut) {
        sound.fade(1, 0, spec.fadeOut);
        sound.once("fade", () => sound.stop());
      } else {
        sound.stop();
      }
    }
    entity.remove(SoundEffectEntered);
  }
}
