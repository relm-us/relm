import { System, Groups, Entity, Not, Modified } from "~/ecs/base";
import { Presentation, Object3DRef, Transform } from "~/ecs/plugins/core";
import { Particles, ParticlesRef, ParticlesLoading } from "../components";
import * as THREE from "three";
import NebulaSystem, * as N from "three-nebula";
import { blueFire } from "../prefab";
// https://codesandbox.io/s/three-nebula-quickstart-kz6uv?file=/src/index.js:281-287

const sparkleBodySprite = new N.BodySprite(THREE, "/teleport-sparkle.png");

export class ParticlesSystem extends System {
  presentation: Presentation;
  renderer: any;

  order = Groups.Simulation - 1;

  static queries = {
    new: [Particles, Not(ParticlesRef), Not(ParticlesLoading)],
    active: [Particles, ParticlesRef],
    modified: [Modified(Particles), ParticlesRef],
    removed: [Not(Particles), ParticlesRef],
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
      const spec = entity.get(Particles);
      const system = entity.get(ParticlesRef).value;

      if (spec.follows) {
        const transform: Transform = entity.get(Transform);
        system.emitters.forEach((emitter) => {
          emitter.position.copy(transform.positionWorld);
        });
      }

      system.update();
    });

    this.queries.removed.forEach((entity) => {
      this.remove(entity);
    });
  }

  onStart(entity: Entity) {
    // console.log("started particles", entity);
  }

  onEnd(entity: Entity) {
    // console.log("ended", entity);
  }

  async build(entity: Entity) {
    const spec: Particles = entity.get(Particles);

    entity.add(ParticlesLoading);

    let system;
    let onUpdate;
    switch (spec.prefab) {
      case "TELEPORT":
        const emitter = new N.Emitter()
          .setRate(new N.Rate(new N.Span(2.0, 4.0), new N.Span(0.005, 0.01)))
          .setInitializers([
            sparkleBodySprite,
            new N.Position(new N.BoxZone(0, 0, 0, 1.2, 1.2, 1.2)),
            new N.Mass(1.0, 2.0, true),
            new N.Radius(0.25, 0.75),
            new N.Life(1),
            new N.VectorVelocity(new N.Vector3D(0, 5, 0), 0),
          ])
          .setEmitterBehaviours([])
          .setBehaviours([
            new N.Alpha(1, 0.5),
            new N.Scale(0.9, 1.1),
            new N.Color(new THREE.Color("#FFFFFF"), new THREE.Color("#8833DF")),
            new N.Force(0, 0.5, 0),
          ])
          .emit();
        system = new NebulaSystem();
        system.addEmitter(emitter);
        break;
      default:
        /* BlueFire */
        system = await NebulaSystem.fromJSONAsync(blueFire, THREE, {
          shouldAutoEmit: false,
        });
        break;
    }

    system.addRenderer(new N.SpriteRenderer(this.presentation.scene, THREE));
    system.emit({ onUpdate });

    entity.remove(ParticlesLoading);
    entity.add(ParticlesRef, { value: system });
  }

  remove(entity) {
    const system = entity.get(ParticlesRef).value;
    for (let emitter of system.emitters) {
      emitter.stopEmit();

      // Workaround Nebula bug https://github.com/creativelifeform/three-nebula/discussions/147
      emitter.particles.forEach((particle) => {
        emitter.parent && emitter.parent.dispatch("PARTICLE_DEAD", particle);
        emitter.bindEmitterEvent && emitter.dispatch("PARTICLE_DEAD", particle);
        emitter.parent.pool.expire(particle.reset());
      });
    }
    system.destroy();
    entity.remove(ParticlesRef);
  }
}
