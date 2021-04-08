import { System, Groups, Entity, Not } from "~/ecs/base";
import { Presentation, Object3D } from "~/ecs/plugins/core";
import { Particles, ParticlesRef, ParticlesLoading } from "../components";
import * as THREE from "three";
import Nebula, { SpriteRenderer } from "three-nebula";
import { blueFire } from "../prefab/blueFire";
// https://codesandbox.io/s/three-nebula-quickstart-kz6uv?file=/src/index.js:281-287

export class ParticlesSystem extends System {
  presentation: Presentation;
  renderer: any;

  order = Groups.Simulation - 1;

  static queries = {
    new: [Particles, Not(ParticlesRef), Not(ParticlesLoading)],
    active: [Particles, ParticlesRef],
    removed: [Not(Particles), ParticlesRef],
  };

  init({ presentation }) {
    this.presentation = presentation;
  }

  update() {
    this.queries.new.forEach((entity) => {
      this.build(entity);
    });
    this.queries.active.forEach((entity) => {
      const spec = entity.get(Particles)
      const system = entity.get(ParticlesRef).value;

      if (spec.follows) {
        const object3d = entity.get(Object3D).value;
        system.emitters.forEach((emitter) => {
          emitter.position.copy(object3d.position);
        });
      }

      system.update();
    });
  }

  build(entity: Entity) {
    entity.add(ParticlesLoading);

    Nebula.fromJSONAsync(blueFire, THREE).then((loaded) => {
      const renderer = new SpriteRenderer(this.presentation.scene, THREE);
      const system = loaded.addRenderer(renderer);

      entity.remove(ParticlesLoading);
      entity.add(ParticlesRef, { value: system });
    });
  }
}
