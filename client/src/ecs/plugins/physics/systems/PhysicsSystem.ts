import type {
  EventQueue,
  RigidBody as RapierRigidBody,
  World,
} from "@dimforge/rapier3d";
import { System, Modified, Groups } from "~/ecs/base";
import { Impact, RigidBody, RigidBodyRef } from "../components";
import { Transform, WorldTransform } from "~/ecs/plugins/core";
import { Matrix4, Vector3, Quaternion } from "three";
import { Physics } from "..";

const v3_1 = new Vector3();
const q_1 = new Quaternion();
const m4_1 = new Matrix4();
const m4_2 = new Matrix4();
const m4_3 = new Matrix4();
const scale = new Vector3(1, 1, 1);

const TIMESTEP = 1 / 60;

function createFixedTimestep(
  timestep: number,
  callback: (delta: number) => void
) {
  let accumulator = 0;
  return (delta: number) => {
    accumulator += delta;
    while (accumulator >= timestep) {
      callback(accumulator);
      if (accumulator >= 1) {
        // give up, too slow to catch up
        accumulator = 0;
      } else {
        accumulator -= timestep;
      }
    }
  };
}

export class PhysicsSystem extends System {
  fixedUpdate: Function;
  physics: Physics;

  order = Groups.Presentation + 300;

  static queries = {
    default: [RigidBodyRef, Transform, WorldTransform],
    modified: [RigidBodyRef, Modified(Transform)],
    impacts: [Impact],
  };

  init({ physics }) {
    this.physics = physics;

    // Create a regular, fixed physics time-step, regardless of rendering framerate
    this.fixedUpdate = createFixedTimestep(
      TIMESTEP,
      this.onFixedUpdate.bind(this)
    );
  }

  // delta is number if milliseconds since last frame, e.g. 16.6ms if framerate is 60fps
  update(delta: number) {
    const dt = 1 / (1000 / delta);

    // Impact components last just one cycle; clean up old ones
    this.queries.impacts.forEach((entity) => {
      entity.remove(Impact);
    });

    this.fixedUpdate(dt);

    // Clear the actions list, so that it can be re-filled during next ECS world step
    RigidBodyRef.actions.length = 0;
  }

  onFixedUpdate(accum) {
    if (!this.active) return;
    const { world, eventQueue }: { world: World; eventQueue: EventQueue } =
      this.physics;

    /**
     * We re-apply forces and torques during each fixedUpdate, so that
     * avatars move at a constant rate even when render framerate changes.
     */
    RigidBodyRef.actions.forEach(({ ref, name, args }) => {
      ref.value[name].apply(ref.value, args);
    });

    this.queries.modified.forEach((entity) => {
      const body: RapierRigidBody = entity.get(RigidBodyRef).value;
      const local = entity.get(Transform);
      body.setTranslation(local.position, true);
      body.setRotation(local.rotation, true);
    });

    world.step(eventQueue);

    // Add Impacts when contact or intersection takes place. We need to
    // do this here, rather than in a separate system, because the Physics
    // System is happening faster than the regular loop.
    const handleContactEvent = (
      handle1: number,
      handle2: number,
      contactStarted: boolean
    ) => {
      const entity1 = this.physics.handleToEntity.get(handle1);
      const entity2 = this.physics.handleToEntity.get(handle2);

      if (contactStarted) {
        entity1.add(Impact, { other: entity2 });
        entity2.add(Impact, { other: entity1 });
      }
    };
    eventQueue.drainContactEvents(handleContactEvent);
    eventQueue.drainIntersectionEvents(handleContactEvent);

    this.queries.default.forEach((entity) => {
      const parent = entity.getParent();
      const local = entity.get(Transform);
      const world = entity.get(WorldTransform);
      const spec = entity.get(RigidBody);
      const body = entity.get(RigidBodyRef).value;

      if (spec.kind === "DYNAMIC") {
        if (!parent) {
          // if (entity.name === "Avatar") return;
          local.position.copy(body.translation());
          world.position.copy(body.translation());
          local.rotation.copy(body.rotation());
          world.rotation.copy(body.rotation());
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
