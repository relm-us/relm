import { Entity, System, Groups, Not, Modified } from "~/ecs/base";
import { Presentation, Object3D } from "~/ecs/plugins/core";
import { Fire, FireMesh } from "../components";
import { MathUtils, Color } from "three";
import { Fire as ThreeFire } from "../Fire";

export class FireSystem extends System {
  order = Groups.Simulation + 1;

  presentation: Presentation;

  static queries = {
    new: [Fire, Object3D, Not(FireMesh)],
    modified: [Modified(Fire), FireMesh],
    active: [Fire, FireMesh],
    removed: [Not(Fire), FireMesh],
  };

  init({ presentation }) {
    this.presentation = presentation;
  }

  update() {
    this.queries.new.forEach((entity) => {
      this.build(entity);
    });
    this.queries.modified.forEach((entity) => {
      this.remove(entity);
      this.build(entity);
    });
    this.queries.active.forEach((entity) => {
      const spec = entity.get(Fire);
      const mesh = entity.get(FireMesh);
      if (mesh.loaded) {
        mesh.value.update(mesh.time);
        mesh.time += spec.speed;
      }
    });
    this.queries.removed.forEach((entity) => {
      this.remove(entity);
    });
  }

  async build(entity: Entity) {
    const spec = entity.get(Fire);
    const object3d = entity.get(Object3D).value;

    if (!entity.has(FireMesh)) {
      entity.add(FireMesh);
    }

    const fireTex = await this.presentation.loadTexture("/fire.png");
    const fireMesh = entity.get(FireMesh);
    if (fireMesh) {
      fireMesh.loaded = true;

      const mesh = new ThreeFire(
        fireTex,
        new Color(spec.color),
        MathUtils.clamp(spec.colmix, 0, 1),
        Math.floor(MathUtils.clamp(spec.blaze, 5, 30)),
        Math.floor(MathUtils.clamp(spec.octaves, 1, 5))
      );

      object3d.add(mesh);
      fireMesh.value = mesh;
    }
  }

  remove(entity: Entity) {
    const mesh = entity.get(FireMesh).value;

    const object3d = entity.get(Object3D);
    if (object3d) {
      object3d.value.remove(mesh);
    }

    entity.remove(FireMesh);
  }
}
