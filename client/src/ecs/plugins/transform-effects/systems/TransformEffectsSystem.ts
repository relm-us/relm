import { System, Groups, Not } from "~/ecs/base";
import { Object3DRef } from "~/ecs/plugins/core";

import { Matrix4 } from "three";

import { TransformEffects, TransformEffectsStack } from "../components";
import functions from "../functions";

export class TransformEffectsSystem extends System {
  // This system should go right after Object3DSystem, but before Presentation
  order = Groups.Presentation - 5;

  static queries = {
    added: [TransformEffects, Not(TransformEffectsStack)],
    active: [TransformEffects, TransformEffectsStack],
    removed: [Not(TransformEffects), TransformEffectsStack],
  };

  update(delta) {
    this.queries.added.forEach((entity) => {
      this.build(entity);
    });

    this.queries.active.forEach((entity) => {
      this.computeAndApply(entity, delta);
    });

    this.queries.removed.forEach((entity) => {
      entity.remove(TransformEffectsStack);
    });
  }

  build(entity) {
    const spec = entity.get(TransformEffects);
    const validEffects = spec.effects.filter((effect) => {
      const fn = functions[effect.function];
      if (fn) {
        return true;
      } else {
        console.error(
          `TransformEffects function not found: '${effect.function}'`
        );
        return false;
      }
    });
    // Replace component's list of effects with only valid ones
    spec.effects = validEffects;

    // Build stack from valid effects
    const stack = validEffects.map((effect) => {
      const fn = functions[effect.function];
      return {
        matrix: new Matrix4(),
        // initial state is set to params
        state: fn.initial(effect.params),
      };
    });
    entity.add(TransformEffectsStack, { stack });
  }

  computeAndApply(entity, delta) {
    const effects = entity.get(TransformEffects).effects;
    const stack = entity.get(TransformEffectsStack).stack;
    this.computeStack(effects, stack, delta);

    const object3dref = entity.get(Object3DRef);
    if (!object3dref) {
      console.warn("TransformEffectsSystem: entity has no object3d", entity);
      return;
    }
    this.applyStack(object3dref.value, stack);
  }

  removeEffectByIndex(effects, stack, index) {
    if (index < effects.length && index < stack.length) {
      effects.splice(index, 1);
      stack.splice(index, 1);
    }
  }

  computeStack(effects, stack, delta) {
    // reverse order so we can remove effects as we go, if needed
    for (let i = effects.length - 1; i >= 0; i--) {
      const effect = effects[i];
      const item = stack[i];

      const complete = functions[effect.function].compute(
        item.matrix,
        item.state,
        effect.params,
        delta
      );

      if (complete) {
        this.removeEffectByIndex(effects, stack, i);
      }
    }
  }

  applyStack(object3d, stack) {
    for (let i = stack.length - 1; i >= 0; i--) {
      object3d.updateMatrix();
      object3d.matrix.multiply(stack[i].matrix);
      object3d.matrix.decompose(
        object3d.position,
        object3d.quaternion,
        object3d.scale
      );
    }
  }
}
