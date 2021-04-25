import { System, Groups } from "~/ecs/base";
import type { RigidBody as RapierRigidBody } from "@dimforge/rapier3d";
import { RigidBody, RigidBodyRef } from "../components";
import { Transform, WorldTransform } from "~/ecs/plugins/core";
import { Matrix4, Vector3, Quaternion } from "three";

const v3_1 = new Vector3();
const q_1 = new Quaternion();
const m4_1 = new Matrix4();
const m4_2 = new Matrix4();
const m4_3 = new Matrix4();
const scale = new Vector3(1, 1, 1);

const TIMESTEP = 1 / 60;

function createFixedTimestep(timestep, callback) {
  let accumulator = 0;
  return (delta) => {
    accumulator += delta;
    while (accumulator >= timestep) {
      callback(accumulator);
      accumulator -= timestep;
    }
  };
}
export class PhysicsSystem extends System {
  fixedUpdate: Function;
  order = Groups.Presentation + 300;

  static queries = {
    default: [RigidBodyRef, Transform, WorldTransform],
  };

  init() {
    // Create a regular, fixed physics time-step, regardless of rendering framerate
    this.fixedUpdate = createFixedTimestep(
      TIMESTEP,
      this.onFixedUpdate.bind(this)
    );
  }

  update(delta) {
    const dt = 1 / (1000 / delta);
    this.fixedUpdate(dt);
  }

  onFixedUpdate() {
    const { world, eventQueue } = (this.world as any).physics;

    this.queries.default.forEach((entity) => {
      const world = entity.get(WorldTransform);
      const spec = entity.get(RigidBody);
      const body = entity.get(RigidBodyRef).value as RapierRigidBody;
      const transform = entity.get(Transform);

      // @todo Should we teleport if the distance is huge?

      if (spec.kind === "KINEMATIC") {
        body.setNextKinematicTranslation(transform.position);
        body.setNextKinematicRotation(transform.rotation);
      }
      if (spec.kind === "STATIC" || spec.kind === "DYNAMIC") {
        body.setTranslation(world.position, false);
        body.setRotation(world.rotation, false);
      }
      if (spec.kind === "DYNAMIC") {
        body.setAngvel(spec.angularVelocity, false);
        body.setLinvel(spec.linearVelocity, false);
      }
    });

    world.step(eventQueue);

    this.queries.default.forEach((entity) => {
      const parent = entity.getParent();
      const local = entity.get(Transform);
      const world = entity.get(WorldTransform);
      const spec = entity.get(RigidBody);
      const body = entity.get(RigidBodyRef).value;

      if (spec.kind === "DYNAMIC") {
        if (!parent) {
          local.position.copy(body.translation());
          local.rotation.copy(body.rotation());
        } else {
          v3_1.copy(body.translation());
          q_1.copy(body.rotation());
          // make a sim world matrix
          m4_1.compose(v3_1, q_1, scale);
          // make an inverse world matrix
          m4_2.copy(world.matrix).invert();
          // -world * sim (diff to apply to local)
          m4_3.multiplyMatrices(m4_2, m4_1);
          // add diff matrix to local
          local.matrix.multiply(m4_3);
          // decompose and update world
          local.matrix.decompose(local.position, local.rotation, local.scale);
          world.matrix.copy(m4_1);
          world.matrix.decompose(world.position, world.rotation, world.scale);
        }

        spec.angularVelocity.copy(body.angvel());
        spec.linearVelocity.copy(body.linvel());
      }
    });
  }
}
