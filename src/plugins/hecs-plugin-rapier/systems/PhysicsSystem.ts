import { System, Groups } from "hecs";
import {
  Transform,
  WorldTransform,
  Matrix4,
  Vector3,
  Quaternion,
} from "hecs-plugin-core";
import { RigidBody, RigidBodyRef } from "../components";
import { ComposableTransform } from "hecs-plugin-composable";

export class PhysicsSystem extends System {
  order = Groups.Simulation;

  static queries = {
    default: [RigidBodyRef, ComposableTransform, WorldTransform],
  };

  init() {
    // this.update = createFixedTimestep(TIMESTEP, this.fixedUpdate.bind(this));
  }

  update() {
    const { world } = this.world.physics;

    // console.log("fixedUpdate");
    this.queries.default.forEach((entity) => {
      // const world = entity.get(WorldTransform);
      const spec = entity.get(RigidBody);
      const body = entity.get(RigidBodyRef).value;
      const transform = entity.get(ComposableTransform);

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

    world.step();
    // scene.simulate(TIMESTEP, true);
    // scene.fetchResults(true);

    this.queries.default.forEach((entity) => {
      const parent = entity.getParent();
      const local = entity.get(ComposableTransform);
      const world = entity.get(WorldTransform);
      const spec = entity.get(RigidBody);
      const body = entity.get(RigidBodyRef).value;

      if (spec.kind === "DYNAMIC") {
        if (!parent) {
          const position = body.translation();
          // console.log("new pos", position);
          local.position.copy(position);
          // local.rotation.copy(body.rotation());
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
