import { FrontSide, NoBlending, Object3D } from "three";
import { Tween, Easing } from "@tweenjs/tween.js";

import { System, Groups, Entity, Not, Modified } from "~/ecs/base";
import { Object3DRef } from "~/ecs/plugins/core";
import {
  Translucent,
  TranslucentApplied,
  TranslucentOptions,
  TranslucentTweening,
} from "../components";

export class TranslucentSystem extends System {
  order = Groups.Initialization + 1;

  static queries = {
    new: [Object3DRef, Translucent, Not(TranslucentApplied)],
    active: [Object3DRef, TranslucentTweening],
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
    const object3d: Object3D = entity.get(Object3DRef).value;
    const translucent = entity.get(Translucent);
    const options =
      entity.get(TranslucentOptions) || new TranslucentOptions(this.world);

    if (!options.opaque) {
      object3d.traverse((node: any) => {
        if (node.isMesh && !node.material.transparent) {
          node.userData.translucent = {
            transparent: node.material.transparent,
            opacity: node.material.opacity,
            side: node.material.side,
          };
          node.material.transparent = true;
          if (!options.twoSided) node.material.side = FrontSide;
        }
      });

      this.startTween(entity, 1, translucent.opacity, options.time);

      entity.add(TranslucentApplied, {
        value: object3d,
        opacity: translucent.opacity,
      });
    } else {
      // Add without `value`, means we won't touch it later, just remove it
      entity.add(TranslucentApplied);
    }
  }

  startTween(
    entity: Entity,
    startOpacity: number,
    endOpacity: number,
    time: number = 500,
    onComplete: () => void = null
  ) {
    if (!entity) return;

    const object3d: Object3D = entity.get(Object3DRef)?.value;
    if (!object3d) return;

    const tweening = entity.get(TranslucentTweening);

    if (tweening) {
      // If we're interrupting another tween, start with the opacity
      // at the level the interruption occurs:
      startOpacity = tweening.tween._object.opacity;

      tweening.tween?.stop();
      tweening.tween = null;
      entity.remove(TranslucentTweening);
    }

    const setOpacity = (opacity) => {
      object3d.traverse((node: any) => {
        if (
          node.isMesh &&
          node.userData.translucent &&
          /* Don't set transparency on CSS Planes */
          node.material.blending !== NoBlending
        ) {
          node.material.opacity = opacity;
        }
      });
    };

    if (time === 0) {
      setOpacity(endOpacity);
      onComplete?.();
    } else {
      const tween = new Tween({ opacity: startOpacity })
        .to({ opacity: endOpacity }, time)
        .easing(Easing.Sinusoidal.InOut)
        .onUpdate(({ opacity }) => setOpacity(opacity))
        .onComplete(() => {
          entity.remove(TranslucentTweening);
          onComplete?.();
        })
        .start();

      entity.add(TranslucentTweening, { tween });
    }
  }

  tween(entity: Entity) {
    entity.get(TranslucentTweening).tween?.update();
  }

  remove(entity: Entity) {
    const applied: TranslucentApplied = entity.get(TranslucentApplied);
    const options =
      entity.get(TranslucentOptions) || new TranslucentOptions(this.world);
    const object3d = applied.value;

    if (object3d) {
      this.startTween(entity, applied.opacity, 1, options.time, () => {
        object3d.traverse((node: any) => {
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
    }

    entity.remove(TranslucentApplied);
  }
}
