import { Vector3 } from "three";
import {
  PROXIMITY_CAMERA_GRAVITY_INNER_RADIUS,
  PROXIMITY_CAMERA_GRAVITY_OUTER_RADIUS,
} from "~/config/constants";

import { System, Not, Groups, Entity } from "~/ecs/base";
import { Queries } from "~/ecs/base/Query";
import { Object3DRef, Transform } from "~/ecs/plugins/core";
import { DistanceRef } from "../../distance";

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
    const radiusRange =
      PROXIMITY_CAMERA_GRAVITY_OUTER_RADIUS -
      PROXIMITY_CAMERA_GRAVITY_INNER_RADIUS;
    this.queries.gravity.forEach((entity) => {
      // Other avatars are tracked with DistanceRef; non-avatar entities
      // will be considered "0" distance away
      const distance: number = entity.get(DistanceRef)?.value ?? 0;

      const transform: Transform = entity.get(Transform);
      const gravity: CameraGravity = entity.get(CameraGravity);

      let mass;
      if (distance < PROXIMITY_CAMERA_GRAVITY_INNER_RADIUS) {
        // Camera weight has full effect for "near" avatars (and all entities)
        mass = gravity.mass;
      } else if (distance > PROXIMITY_CAMERA_GRAVITY_OUTER_RADIUS) {
        // Camera weight has no effect for "far" avatars
        mass = 0;
      } else {
        // Smooth transition between other avatar affecting/not affecting centroid
        mass =
          gravity.mass *
          sCurve(
            (PROXIMITY_CAMERA_GRAVITY_OUTER_RADIUS - distance) / radiusRange
          );
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
