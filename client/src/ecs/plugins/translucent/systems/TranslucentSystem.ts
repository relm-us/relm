import { FrontSide } from "three";
import { Tween, Easing } from "@tweenjs/tween.js";

import { System, Groups, Entity, Not, Modified } from "~/ecs/base";
import { Object3D } from "~/ecs/plugins/core";
import {
  Opaque,
  Translucent,
  TranslucentApplied,
  TranslucentTweening,
} from "../components";

export class TranslucentSystem extends System {
  order = Groups.Initialization + 1;

  static queries = {
    new: [Object3D, Translucent, Not(Opaque), Not(TranslucentApplied)],
    active: [Object3D, TranslucentTweening],
    modified: [Modified(Translucent)],
    removed: [Not(Translucent), TranslucentApplied],
  };

  update() {
    this.queries.new.forEach((entity) => {
      this.build(entity);
    });
    this.queries.active.forEach((entity) => {
      this.tween(entity);
    });
    this.queries.modified.forEach((entity) => {
      this.remove(entity);
      this.build(entity);
    });
    this.queries.removed.forEach((entity) => {
      this.remove(entity);
    });
  }

  build(entity: Entity) {
    const object3d = entity.get(Object3D);
    const translucent = entity.get(Translucent);
    // console.log("build translucent");

    object3d.value.traverse((node) => {
      if (node.isMesh && !node.material.transparent) {
        node.userData.translucent = {
          transparent: node.material.transparent,
          opacity: node.material.opacity,
          side: node.material.side,
        };
        node.material.transparent = true;
        // node.material.opacity = translucent.opacity;
        // node.material.side = FrontSide;
      }
    });

    this.startTween(entity, 1, translucent.opacity);

    entity.add(TranslucentApplied, {
      value: object3d,
      opacity: translucent.opacity,
    });
  }

  startTween(
    entity: Entity,
    startOpacity: number,
    endOpacity: number,
    onComplete?: () => void
  ) {
    const object3d = entity.get(Object3D);
    const tweening = entity.get(TranslucentTweening);

    if (tweening) {
      startOpacity = tweening.tween._object.opacity;
      tweening.tween?.stop();
      tweening.tween = null;
      entity.remove(TranslucentTweening);
    }

    const tween = new Tween({ opacity: startOpacity })
      .to({ opacity: endOpacity }, 500)
      .easing(Easing.Sinusoidal.InOut)
      .onUpdate(({ opacity }) => {
        object3d.value.traverse((node) => {
          if (node.isMesh && node.userData.translucent) {
            node.material.opacity = opacity;
          }
        });
      })
      .onComplete(() => {
        entity.remove(TranslucentTweening);
        onComplete?.();
      })
      .start();

    entity.add(TranslucentTweening, { tween });
  }

  tween(entity: Entity) {
    entity.get(TranslucentTweening).tween?.update();
  }

  remove(entity: Entity) {
    const applied = entity.get(TranslucentApplied);
    const object3d = applied.value;

    this.startTween(entity, applied.opacity, 1, () => {
      object3d.value.traverse((node) => {
        if (node.isMesh) {
          const former = node.userData.translucent;
          if (former) {
            node.material.transparent = former.transparent;
            node.material.side = former.side;
            node.material.opacity = former.opacity;
          }
          delete node.userData.translucent;
        }
      });
    });

    entity.remove(TranslucentApplied);
  }
}
