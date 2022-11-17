import { Howl, Howler } from "howler";

import { assetUrl } from "~/config/assetUrl";

import { System, Groups, Entity } from "~/ecs/base";
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
  }

  enterSoundEffect(entity: Entity) {
    const spec: SoundEffect = entity.get(SoundEffect);
    const loaded: SoundAssetLoaded = entity.get(SoundAssetLoaded);

    if (loaded) {
      entity.add(SoundEffectEntered);
      if (!spec.preload) loaded.value.load();
      loaded.value.play();
    }
  }

  leaveSoundEffect(entity: Entity) {
    entity.remove(SoundEffectEntered);
  }
}
