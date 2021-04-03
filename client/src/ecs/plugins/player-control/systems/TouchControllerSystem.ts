import { System, Groups } from "~/ecs/base";
import { WorldTransform, Transform } from "~/ecs/plugins/core";
import { MathUtils, Euler, Quaternion, Vector3, Matrix4 } from "three";
import { get } from "svelte/store";

import { keyUp, keyDown, keyLeft, keyRight } from "~/input";
import { TouchController, ThrustController } from "../components";
import { PointerPlaneRef } from "~/ecs/plugins/pointer-plane";
import { signedAngleBetweenVectors } from "~/utils/signedAngleBetweenVectors";
import { RigidBodyRef } from "~/ecs/plugins/physics";

const MAX_VELOCITY = 5.0;
const thrust = new Vector3();

const vUp = new Vector3(0, 1, 0);
const vOut = new Vector3(0, 0, 1);
const vPointer = new Vector3();
const v1 = new Vector3();
const s1 = new Vector3();

const vFacing = new Vector3();
const q1 = new Quaternion();
const m1 = new Matrix4();

export class TouchControllerSystem extends System {
  order = Groups.Simulation;

  static queries = {
    default: [TouchController],
  };

  update() {
    this.queries.default.forEach((entity) => {
      this.rotateTowardPointer(entity);
    });
  }

  rotateTowardPointer(entity) {
    const pointer = entity.get(PointerPlaneRef);
    vPointer.copy(pointer.XZ);

    // If it's a very small number, it isn't real pointer position yet
    if (vPointer.lengthSq() < 0.001) return;

    // A vector pointing "out" on the XZ plane, indicating which way the avatar is facing.
    vFacing.copy(vOut);
    const rotation = entity.get(WorldTransform).rotation;
    vFacing.applyQuaternion(rotation);

    /**
     *
     *
     * vFacing: see above
     * pointer.XZ: a Vector3 where the mouse is positioned on the XZ plane
     * vUp: the XZ normal plane
     */
    const angle = signedAngleBetweenVectors(vFacing, vPointer, vUp);

    // Gently rotate towards the goal using spherical lerp
    const e1 = new Euler().setFromQuaternion(rotation, "YXZ");
    // Add current y-axis angle and angle between vFacing & vPointer
    e1.y += angle;
    q1.setFromEuler(e1);
    const transform = entity.get(Transform);
    transform.rotation.slerp(q1, 0.2);

    const bodyRef = entity.get(RigidBodyRef);
    v1.copy(bodyRef.value.linvel());
    v1.y = 0;
    let velocity = v1.length();

    // thrust toward direction if under maximum velocity
    if (velocity < MAX_VELOCITY) {
      const controller = entity.get(ThrustController);
      if (!controller) {
        console.warn("no thruster");
        return;
      }
      v1.copy(vOut);
      v1.applyQuaternion(q1);
      v1.multiplyScalar(controller.thrust);

      bodyRef.value.applyForce(v1, true);
    }
  }
}
