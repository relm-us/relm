import { DoubleSide, FrontSide, Mesh, NoBlending, Object3D, Side } from "three";
import { Tween, Easing } from "@tweenjs/tween.js";

import { System, Groups, Entity, Not, Modified } from "~/ecs/base";
import { Object3DRef } from "~/ecs/plugins/core";
import {
  Translucent,
  TranslucentApplied,
  TranslucentTweening,
} from "../components";
import { traverseMaterials } from "~/ecs/shared/traverseMaterials";

export class TranslucentSystem extends System {
  order = Groups.Initialization + 1;

  static queries = {
    new: [Object3DRef, Translucent, Not(TranslucentApplied)],
    active: [Object3DRef, TranslucentTweening],
    modified: [Modified(Translucent), TranslucentApplied],
    modifiedObject: [Modified(Object3DRef), TranslucentApplied],
    modifiedApplication: [Modified(TranslucentApplied)],
    removed: [Not(Translucent), TranslucentApplied],
  };

  update() {
    this.queries.new.forEach((entity) => {
      this.build(entity);
    });
    this.queries.active.forEach((entity) => {
      this.updateTween(entity);
    });
    this.queries.modified.forEach((entity) => {
      this.remove(entity);
      this.build(entity);
    });
    this.queries.modifiedObject.forEach((entity) => {
      this.remove(entity);
      this.build(entity);
    });
    this.queries.modifiedApplication.forEach((entity) => {
      this.stopTween(entity);
      this.startTween(entity);
    });
    this.queries.removed.forEach((entity) => {
      this.remove(entity);
    });
  }

  build(entity: Entity) {
    const object3d: Object3D = entity.get(Object3DRef).value;
    const translucent: Translucent = entity.get(Translucent);

    const currentOpacity = translucent.startOpacity;

    this.saveTranslucentProperties(object3d);
    this.setTranslucentProperties(
      object3d,
      currentOpacity,
      translucent.twoSided
    );

    entity.add(TranslucentApplied, {
      value: object3d,
      currentOpacity,
      direction: "START",
    });
  }

  startTween(entity: Entity, onComplete: () => void = null) {
    const spec: Translucent = entity.get(Translucent);
    const applied: TranslucentApplied = entity.get(TranslucentApplied);
    const setOpacity = this.getOpacitySetter(entity);

    // Instantaneous transition does not require tweening
    if (spec.duration === 0) {
      setOpacity(spec.endOpacity);
      onComplete?.();
      return;
    }

    const endOpacity =
      applied.direction === "END" ? spec.endOpacity : spec.startOpacity;

    const tween = new Tween({ opacity: applied.currentOpacity })
      .to({ opacity: endOpacity }, spec.duration)
      .easing(Easing.Sinusoidal.InOut)
      .onUpdate(({ opacity }) => setOpacity(opacity))
      .onComplete(() => {
        entity.remove(TranslucentTweening);
        onComplete?.();
      })
      .start();

    entity.add(TranslucentTweening, { tween });
  }

  stopTween(entity: Entity) {
    const tweening = entity.get(TranslucentTweening);
    if (tweening) {
      tweening.tween?.stop();
      entity.remove(TranslucentTweening);
    }
  }

  updateTween(entity: Entity) {
    entity.get(TranslucentTweening).tween?.update();
  }

  remove(entity: Entity) {
    const applied: TranslucentApplied = entity.get(TranslucentApplied);

    this.restoreTranslucentProperties(applied.value);

    entity.remove(TranslucentApplied);
  }

  saveTranslucentProperties(object: Object3D) {
    traverseMaterials(object, (material) => {
      if (material.userData.translucent || material.userData.translucentImmune)
        return;

      material.userData.translucent = {
        transparent: material.transparent,
        opacity: material.opacity,
        side: material.side,
      };

      return true;
    });
  }

  restoreTranslucentProperties(object: Object3D) {
    traverseMaterials(object, (material) => {
      const former = material.userData.translucent;
      if (former) {
        material.transparent = former.transparent;
        material.side = former.side;
        material.opacity = former.opacity;
      }
      delete material.userData.translucent;

      return true;
    });
  }

  setTranslucentProperties(
    object: Object3D,
    opacity: number,
    twoSided: boolean
  ) {
    traverseMaterials(object, (material) => {
      if (material.userData.translucentImmune) return true;

      material.transparent = true;
      material.opacity = opacity;
      material.side = twoSided ? DoubleSide : FrontSide;

      return true;
    });
  }

  getOpacitySetter(entity: Entity) {
    const object: Object3D = entity.get(Object3DRef).value;
    const applied: TranslucentApplied = entity.get(TranslucentApplied);

    return (opacity: number) => {
      traverseMaterials(object, (material) => {
        /* Don't set transparency on CSS Planes */
        if (material.blending !== NoBlending) {
          material.opacity = applied.currentOpacity = opacity;
        }

        return true;
      });
    };
  }
}
