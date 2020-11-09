import { System, Groups } from "hecs";
import { WorldTransform } from "hecs-plugin-core";
import { RigidBody, RigidBodyRef } from "../components";

export class PhysicsSystem extends System {
  order = Groups.Simulation;

  // Dynamically create the `default` query, since we don't necessarily know
  // which Transform component to use at static compile time.
  init() {
    const { Transform } = this.world.physics;

    this.createQueries({
      default: [RigidBodyRef, Transform, WorldTransform],
    });
  }

  // TODO: remove this if https://github.com/gohyperr/hecs/pull/22 accepted
  createQueries(queries) {
    for (const queryName in queries) {
      const Components = queries[queryName];
      this.queries[queryName] = this.world.queries.create(Components);
    }
  }

  update() {
    const { world, eventQueue, Transform } = this.world.physics;

    // console.log("fixedUpdate");
    this.queries.default.forEach((entity) => {
      // const world = entity.get(WorldTransform);
      const spec = entity.get(RigidBody);
      const body = entity.get(RigidBodyRef).value;
      const transform = entity.get(Transform);

      // @todo Should we teleport if the distance is huge?

      if (spec.kind === "KINEMATIC") {
        body.setNextKinematicTranslation(transform.position);
        body.setNextKinematicRotation(transform.rotation);
      }
      if (spec.kind === "STATIC" || spec.kind === "DYNAMIC") {
        body.setTranslation(transform.position, false);
        body.setRotation(transform.rotation, false);
      }
      if (spec.kind === "DYNAMIC") {
        // console.log("apply force", force);
        // body.applyImpulse(force);
        // body.applyForce
        // body.applyAngularForce
        // body.setAngularVelocity(spec.angularVelocity, false);
        // body.setLinearVelocity(spec.linearVelocity, true); // autowake is true here, may be more performant?
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
          console.log("has parent");
          // Example:
          // worldY = 3 localY = 1 (this means parentWorldY = 2)
          // simulate()
          // simWorldY = 2.9
          // newWorldY = 2.9 newLocalY = 0.9
          // newLocalY = localY + (simWorldY - worldY)
          // copy sim values into three.js constructs
          // v3_1.copy(pose.translation);
          // q_1.copy(pose.rotation);
          // // make a sim world matrix
          // m4_1.compose(v3_1, q_1, scale);
          // // make an inverse world matrix
          // m4_2.getInverse(world.matrix);
          // // -world * sim (diff to apply to local)
          // m4_3.multiplyMatrices(m4_2, m4_1);
          // // add diff matrix to local
          // local.matrix.multiply(m4_3);
          // // decompose and update world
          // local.matrix.decompose(local.position, local.rotation, local.scale);
          // world.matrix.copy(m4_1);
          // world.matrix.decompose(world.position, world.rotation, world.scale);
        }

        // spec.angularVelocity.copy(body.angvel());
        // spec.linearVelocity.copy(body.linvel());
      }
    });
  }
}
