import type { RigidBody } from "@dimforge/rapier3d";

import { PHYSICS_TIMESTEP } from "~/config/constants";

import { System, Modified, Groups } from "~/ecs/base";
import { Transform } from "~/ecs/plugins/core";

import { Physics } from "..";
import { Impact, RigidBodyRef } from "../components";
import { RigidBodySystem } from ".";

export class PhysicsSystem extends System {
  fixedUpdate: Function;
  physics: Physics;

  order = Groups.Presentation + 300;

  static queries = {
    modified: [RigidBodyRef, Modified(Transform)],
    impacts: [Impact],
  };

  init({ physics }) {
    this.physics = physics;

    // Create a regular, fixed physics time-step, regardless of rendering framerate
    this.fixedUpdate = createFixedTimestep(
      PHYSICS_TIMESTEP,
      this.onFixedUpdate.bind(this)
    );
  }

  // delta is number of seconds since last frame, e.g. 0.0166s if framerate is 60fps
  update(delta: number) {
    // Impact components last just one cycle; clean up old ones
    this.queries.impacts.forEach((entity) => {
      entity.remove(Impact);
    });

    this.queries.modified.forEach((entity) => {
      const body: RigidBody = entity.get(RigidBodyRef).value;
      const transform = entity.get(Transform);
      body.setTranslation(transform.position, true);
      body.setRotation(transform.rotation, true);
    });

    this.fixedUpdate(delta);

    // Clear the actions list, so that it can be re-filled during next ECS world step
    RigidBodyRef.actions.length = 0;
  }

  onFixedUpdate(dt) {
    if (!this.active) return;

    const { world, eventQueue } = this.physics;

    /**
     * We re-apply forces and torques during each fixedUpdate, so that
     * avatars move at a constant rate even when render framerate changes.
     */
    RigidBodyRef.actions.forEach(({ ref, name, args }) => {
      ref.value[name].apply(ref.value, args);
    });

    world.integrationParameters.dt = dt;
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

    this.physics.world.forEachActiveRigidBody((body) => {
      const entity = RigidBodySystem.bodies.get(body.handle);
      // console.log("active rigidbody", body.handle, body.numColliders(), entity);

      const parent = entity.getParent();
      const transform = entity.get(Transform);

      if (!parent) {
        // console.log("phys body translation", transform.position, body.translation());
        transform.position.copy(body.translation());
        // console.log("phys body rotation", transform.rotation, body.rotation());
        transform.rotation.copy(body.rotation());
        transform.modified();
      } else {
        console.log("physics disabled for entity with parent");
      }
    });
  }
}

// Return a function that calls a callback as many times
// as needed in order to "catch up" to the current time
function createFixedTimestep(
  timestep: number /* e.g. 1/60 of a second */,
  callback: (delta: number) => void
) {
  let accumulator = 0;
  return (delta: number) => {
    // catch up via physics engine dt
    if (delta <= 2 * timestep) {
      callback(delta);
      accumulator = 0;
    } else {
      // catch up via multiple physics engine steps
      accumulator += delta;
      while (accumulator >= timestep) {
        callback(timestep);
        if (accumulator >= 1) {
          // give up, too slow to catch up
          accumulator = 0;
        } else {
          accumulator -= timestep;
        }
      }
    }
  };
}
