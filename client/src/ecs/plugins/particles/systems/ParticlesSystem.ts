import { Vector3, Color, AdditiveBlending } from "three";

import { System, Groups, Entity, Not, Modified } from "~/ecs/base";
import { Object3DRef, Presentation, Transform } from "~/ecs/plugins/core";

import { Particles2, ParticlesActive, ParticlesRef } from "../components";
import { GPUParticleSystem } from "../GPUParticleSystem";

import { textures } from "../textures";

function rand(low, high) {
  const range = high - low;
  return Math.random() * range + low;
}

const motionPattern = {
  STILL: (spec: Particles2, transform: Transform, options) => {
    options.position.set(
      rand(-spec.params.x / 2, spec.params.x / 2),
      rand(-spec.params.y / 2, spec.params.y / 2),
      rand(-spec.params.z / 2, spec.params.z / 2)
    );

    const s = 0.02;
    options.velocity.set(rand(-s, s), rand(-s, s), rand(-s, s));

    return options;
  },
  EXPLODE: (spec: Particles2, transform: Transform, options) => {
    options.position.set(0, 0, 0);
    options.velocity.set(
      rand(-spec.params.x, spec.params.x),
      rand(-spec.params.y, spec.params.y),
      rand(-spec.params.z, spec.params.z)
    );
    return options;
  },
  RING: (spec: Particles2, transform: Transform, options) => {
    const theta = Math.random() * Math.PI * 2;
    const radius = Math.max(spec.params.x, 0.1);
    const x = Math.cos(theta) * radius;
    const y = Math.sin(theta) * radius;
    options.position.set(x, y, 0);

    const s = spec.params.y;
    options.velocity.set(rand(-s, s), rand(-s, s), rand(-s, s));

    // Fall towards center
    options.velocity.x += -x * spec.params.z;
    options.velocity.y += -y * spec.params.z;

    return options;
  },
  TRAILS: (spec: Particles2, transform: Transform, options) => {
    const radius = Math.max(spec.params.x, 0.1);
    options.position.set(
      Math.cos(spec.theta) * radius,
      Math.sin(spec.theta) * radius,
      Math.sin(spec.gamma) * radius
    );
    spec.theta += (spec.params.y / 180) * Math.PI;
    spec.gamma += (spec.params.z / 180) * Math.PI;

    const s = 0.02;
    options.velocity.set(rand(-s, s), rand(-s, s), rand(-s, s));

    return options;
  },
  RAINING: (spec: Particles2, transform: Transform, options) => {
    options.velocity.set(0, -rand(0.5, 2), 0);
    options.position.set(
      rand(-spec.params.x / 2, spec.params.x / 2),
      rand(-spec.params.y / 2, spec.params.y / 2),
      rand(-spec.params.z / 2, spec.params.z / 2)
    );
    return options;
  },
};

export class ParticlesSystem extends System {
  presentation: Presentation;
  renderer: any;

  order = Groups.Simulation - 1;

  static queries = {
    new: [Particles2, Not(ParticlesRef)],
    active: [Particles2, ParticlesRef],
    modified: [Modified(Particles2), ParticlesRef],
    modifiedTransform: [Modified(Transform), ParticlesRef],
    removed: [Not(Particles2), ParticlesRef],
  };

  init({ presentation }) {
    this.presentation = presentation;
  }

  update(delta: number) {
    this.queries.removed.forEach((entity) => this.remove(entity));

    this.queries.modified.forEach((entity) => this.remove(entity));

    this.queries.new.forEach((entity) => this.build(entity));

    this.queries.modifiedTransform.forEach((entity) => {
      const spec: Particles2 = entity.get(Particles2);
      const transform: Transform = entity.get(Transform);
      const system: GPUParticleSystem = entity.get(ParticlesRef).value;
      system.position.copy(transform.position);
      system.position.add(spec.offset);
    });

    this.queries.active.forEach((entity) => {
      const system: GPUParticleSystem = entity.get(ParticlesRef).value;

      system.update(performance.now());
    });
  }

  async build(entity: Entity) {
    const ref: Object3DRef = entity.get(Object3DRef);
    if (!ref) return;

    const spec: Particles2 = entity.get(Particles2);
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

    let needMore = spec.initialCount;
    let lastTime = 0;
    const system = new GPUParticleSystem({
      maxParticles: spec.maxParticles,
      fadeIn: spec.fadeIn,
      fadeOut: spec.fadeOut,
      texture: textures[spec.sprite]() || textures["circle_05"](),
      blending: AdditiveBlending,
      onTop: spec.onTop,
      onTick: (system, time) => {
        const delta = time - lastTime;
        lastTime = time;

        // Build up until we need to emit
        needMore += spec.rate * delta;

        // Fizzle out when disabled
        if (!entity.has(ParticlesActive)) {
          needMore = 0;
          system.initialTime = system.time;
          return;
        }

        if (!(spec.pattern in motionPattern)) {
          // invalid state
          return;
        }

        // Fizzle out when past the effect lifetime
        if (spec.effectLt > 0 && time > spec.effectLt) return;

        // Create as many particles as needed based on rate
        for (let i = 0; i < needMore; i++) {
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

    system.position.copy(transform.position);
    system.position.add(spec.offset);
    this.presentation.scene.add(system);

    entity.add(ParticlesRef, { value: system });
  }

  remove(entity) {
    const system: GPUParticleSystem = entity.get(ParticlesRef).value;
    system.removeFromParent();
    system.dispose();
    entity.remove(ParticlesRef);
  }
}
