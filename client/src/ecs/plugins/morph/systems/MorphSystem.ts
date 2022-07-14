import { Entity, System, Groups, Not, Modified } from "~/ecs/base";
import { Model2Ref } from "~/ecs/plugins/form";
import { Morph, MorphApplied } from "../components";

export class MorphSystem extends System {
  order = Groups.Simulation + 1;

  static queries = {
    new: [Morph, Model2Ref, Not(MorphApplied)],
    modified: [Modified(Morph), Model2Ref],
    removed: [Not(Morph), MorphApplied],
  };

  update() {
    this.queries.new.forEach((entity) => {
      this.build(entity);
    });
    this.queries.modified.forEach((entity) => {
      this.setInfluences(entity);
    });
    this.queries.removed.forEach((entity) => {
      this.remove(entity);
    });
  }

  build(entity: Entity) {
    this.setInfluences(entity);
    entity.add(MorphApplied);
  }

  resetInfluences(entity: Entity) {
    const ref: Model2Ref = entity.get(Model2Ref);
    const scene = ref?.value?.scene;
    if (!scene) return;

    scene.traverse((node) => {
      const influences = (node as any).morphTargetInfluences;
      if ((node as any).isMesh && influences) {
        for (let i = 0; i < influences.length; i++) {
          influences[i] = 0;
        }
      }
    });
  }

  setInfluences(entity: Entity) {
    const ref: Model2Ref = entity.get(Model2Ref);
    const scene = ref?.value?.scene;
    if (!scene) return;

    const spec = entity.get(Morph);

    if (!spec.influences) return;

    scene.traverse((node) => {
      const influences = (node as any).morphTargetInfluences;
      if ((node as any).isMesh && influences) {
        const mesh = node;
        for (const [key, influence] of Object.entries(spec.influences)) {
          const index = (mesh as any).morphTargetDictionary[key];
          influences[index] = influence;
        }
      }
    });
  }

  remove(entity: Entity) {
    this.resetInfluences(entity);
    entity.remove(MorphApplied);
  }
}
