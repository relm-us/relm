import { Vector3 } from "three";

import { System, Groups, Entity } from "~/ecs/base";
import { Queries } from "~/ecs/base/Query";
import { Transform } from "~/ecs/plugins/core";
import { participantId } from "~/identity/participantId";

import { CameraGravity } from "../components";

import { sCurve } from "../utils/sCurve";

const v1 = new Vector3();

export class CameraGravitySystem extends System {
  order = Groups.Presentation + 401;

  static centroid: Vector3 = new Vector3();

  static queries: Queries = {
    gravity: [Transform, CameraGravity],
  };

  update() {
    this.calculateGravityCentroid();
  }

  calculateGravityCentroid() {
    let totalMass = 0;
    CameraGravitySystem.centroid.set(0, 0, 0);

    const participantTransform: Transform = this.world.entities
      .getById(participantId)
      .get(Transform);

    this.queries.gravity.forEach((entity) => {
      // Other avatars are tracked with DistanceRef; non-avatar entities
      // will be considered "0" distance away

      const transform: Transform = entity.get(Transform);
      const gravity: CameraGravity = entity.get(CameraGravity);

      const distance: number = participantTransform.position.distanceTo(
        transform.position
      );

      // use Vector2.x as innerRange and .y as outerRange
      const innerRadius = gravity.range.x;
      const outerRadius = gravity.range.y;
      const radiusRange = Math.abs(outerRadius - innerRadius);

      let mass;
      if (distance < innerRadius) {
        // Camera weight has full effect for "near" entities
        mass = gravity.mass;
      } else if (distance > outerRadius) {
        // Camera weight has no effect for "far" entities
        mass = 0;
      } else {
        // Smooth transition between "near" and "far" weighting
        mass = gravity.mass * sCurve((outerRadius - distance) / radiusRange);
      }

      totalMass += mass;
      v1.setFromSpherical(gravity.sphere)
        .applyQuaternion(transform.rotation)
        .add(transform.position)
        .multiplyScalar(mass);

      CameraGravitySystem.centroid.add(v1);
    });

    if (totalMass > 0) {
      CameraGravitySystem.centroid.divideScalar(totalMass);
    }
  }

  build(entity: Entity) {
    // const object3d = entity.get(Object3DRef).value;
    // object3d.add(this.camera);
    // entity.add(CameraAttached);
  }

  remove(entity: Entity) {
    // this.camera.parent.remove(this.camera);
    // entity.remove(CameraAttached);
  }
}
