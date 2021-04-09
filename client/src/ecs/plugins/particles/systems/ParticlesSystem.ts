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
      const spec = entity.get(Particles);
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

  onStart(entity: Entity) {
    console.log("started particles", entity);
  }

  onEnd(entity: Entity) {
    console.log("ended", entity);
    // const system = entity.get(ParticlesRef).value;
    // system.destroy();
    // entity.remove(ParticlesRef);
  }

  build(entity: Entity) {
    entity.add(ParticlesLoading);

    Nebula.fromJSONAsync(blueFire, THREE, { shouldAutoEmit: false }).then(
      (loaded) => {
        const renderer = new SpriteRenderer(this.presentation.scene, THREE);
        const system = loaded.addRenderer(renderer);
        system.emit({
          onStart: () => this.onStart(entity),
          // onEnd: () => this.onEnd(entity),
        });

        entity.remove(ParticlesLoading);
        entity.add(ParticlesRef, { value: system });
      }
    );
  }
}
