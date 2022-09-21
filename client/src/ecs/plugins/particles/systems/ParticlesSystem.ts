import { Vector3, Color, AdditiveBlending } from "three";

import { System, Groups, Entity, Not, Modified } from "~/ecs/base";
import { Object3DRef, Presentation, Transform } from "~/ecs/plugins/core";

import { Particles, ParticlesRef } from "../components";
import { GPUParticleSystem } from "../GPUParticleSystem";

import { textures } from "../textures";

function rand(low, high) {
  const range = high - low;
  return Math.random() * range + low;
}

const motionPattern = {
  DISPERSE_3D: (spec: Particles, transform: Transform, options) => {
    options.velocity.set(rand(-1, 1), rand(-1, 1), rand(-1, 1));
    return options;
  },
  DISPERSE_2D: (spec: Particles, transform: Transform, options) => {
    options.velocity.set(rand(-1, 1), rand(-1, 1), 0);
    return options;
  },
  GATEWAY: (spec: Particles, transform: Transform, options) => {
    const theta = Math.random() * Math.PI * 2;
    const radius = Math.max(spec.params.x, 0.1);
    options.position.x += Math.cos(theta) * radius;
    options.position.y += Math.sin(theta) * radius;

    const s = 0.02;
    options.velocity.set(rand(-s, s), rand(-s, s), rand(-s, s));

    return options;
  },
};

export class ParticlesSystem extends System {
  presentation: Presentation;
  renderer: any;

  order = Groups.Simulation - 1;

  static queries = {
    new: [Particles, Not(ParticlesRef)],
    active: [Particles, ParticlesRef],
    modified: [Modified(Particles), ParticlesRef],
    removed: [Not(Particles), ParticlesRef],
  };

  init({ presentation }) {
    this.presentation = presentation;
  }

  update(delta: number) {
    this.queries.removed.forEach((entity) => this.remove(entity));

    this.queries.modified.forEach((entity) => this.remove(entity));

    this.queries.new.forEach((entity) => this.build(entity));

    this.queries.active.forEach((entity) => {
      const system: GPUParticleSystem = entity.get(ParticlesRef).value;

      system.update(performance.now());
    });
  }

  async build(entity: Entity) {
    const ref: Object3DRef = entity.get(Object3DRef);
    if (!ref) return;

    const spec: Particles = entity.get(Particles);
    const transform: Transform = entity.get(Transform);

    const options = {
      position: new Vector3(),
      velocity: new Vector3(),
      acceleration: new Vector3(),

      color: new Color(spec.startColor),
      endColor: new Color(spec.endColor),

      lifetime: spec.particleLt,
      size: (spec.sizeMin + spec.sizeMax) / 2,
      sizeRandomness: (spec.sizeMax - spec.sizeMin) * 2,
    };

    let needMore = 0;
    let lastTime = 0;
    const system = new GPUParticleSystem({
      maxParticles: spec.maxParticles,
      fadeIn: spec.fadeIn,
      fadeOut: spec.fadeOut,
      texture: textures[spec.sprite] || textures["circle_05"],
      blending: AdditiveBlending,
      onTop: spec.onTop,
      onTick: (system, time) => {
        const delta = time - lastTime;
        lastTime = time;

        // Build up until we need to emit
        needMore += spec.rate * delta;

        // Fizzle out when disabled
        if (!spec.enabled) {
          needMore = 0;
          system.initialTime = system.time;
          return;
        }

        // Fizzle out when past the effect lifetime
        if (spec.effectLt > 0 && time > spec.effectLt) return;

        // Create as many particles as needed based on rate
        for (let i = 0; i < needMore; i++) {
          if (spec.relative) {
            options.position.copy(spec.offset);
          } else {
            options.position.copy(transform.position);
            options.position.add(spec.offset);
          }

          const newOptions = motionPattern[spec.pattern](
            spec,
            transform,
            options
          );
          system.spawnParticle(newOptions);
          needMore--;
        }
      },
    });

    if (spec.relative) {
      ref.value.add(system);
    } else {
      this.presentation.scene.add(system);
    }

    entity.add(ParticlesRef, { value: system });
  }

  remove(entity) {
    const system: GPUParticleSystem = entity.get(ParticlesRef).value;
    system.removeFromParent();
    system.dispose();
    entity.remove(ParticlesRef);
  }
}
