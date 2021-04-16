import { System, Groups } from "~/ecs/base";
import { WorldTransform, Transform } from "~/ecs/plugins/core";
import { MathUtils, Euler, Quaternion, Vector3 } from "three";
import { get } from "svelte/store";

import { keyUp, keyDown, keyLeft, keyRight } from "~/input";
import { HeadController } from "../components";
import { PointerPositionRef } from "~/ecs/plugins/pointer-position";
import { signedAngleBetweenVectors } from "~/utils/signedAngleBetweenVectors";

const vUp = new Vector3(0, 1, 0);
const vOut = new Vector3(0, 0, 1);
const vPointer = new Vector3();

const bodyFacing = new Vector3();
const q = new Quaternion();

export class HeadControllerSystem extends System {
  order = Groups.Simulation;

  static queries = {
    default: [HeadController, PointerPositionRef],
  };

  update() {
    this.queries.default.forEach((entity) => {
      this.rotateTowardPointer(entity);
    });
  }

  rotateTowardPointer(entity) {
    const controller = entity.get(HeadController);
    const pointer = entity.get(PointerPositionRef);
    vPointer.copy(pointer.XZ);

    const world = entity.getByName("WorldTransform");
    // If it's a very small number, it isn't real pointer position yet
    if (vPointer.lengthSq() < 0.001) return;

    // A vector pointing "out" on the XZ plane, indicating which way the avatar is facing.
    // This is the "center value" that the head would most naturally face if unturned.
    bodyFacing.copy(vOut);
    bodyFacing.applyQuaternion(entity.getParent().get(Transform).rotation);

    if (get(keyUp) || get(keyDown) || get(keyLeft) || get(keyRight)) {
      controller.enabled = false;
    }

    // Pretend like the pointer plane is at the same height as the head
    bodyFacing.y = world.position.y;

    /**
     * 1. Get the signed angle between vectors on a plane (vUp).
     * 2. Clamp it to a reasonable value so that the head doesn't swivel backwards.
     *
     * bodyFacing: see above
     * pointer.XZ: a Vector3 where the mouse is positioned on the XZ plane
     * vUp: the XZ normal plane
     */
    const angle = MathUtils.clamp(
      signedAngleBetweenVectors(
        bodyFacing,
        controller.enabled ? vPointer : bodyFacing,
        vUp
      ),
      // Any more than 0.49 of PI and the slerp below will make it so
      // the head moves in an "impossible" way because the shortest
      // angle from looking over one shoulder to the other shoulder
      // is to spin the head backwards.
      -Math.PI * 0.49,
      Math.PI * 0.49
    );

    // Gently rotate towards the goal using spherical lerp
    q.setFromEuler(new Euler(0, angle, 0));
    const local = entity.get(Transform);
    local.rotation.slerp(q, 0.2);
  }
}
