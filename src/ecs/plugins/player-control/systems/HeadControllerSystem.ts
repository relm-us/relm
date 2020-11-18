import { System, Groups } from "hecs";
import { Transform, WorldTransform } from "hecs-plugin-core";
import { MathUtils, Matrix4, Euler, Quaternion, Vector3 } from "three";

import { HeadController } from "../components";
import { PointerPlaneRef } from "~/ecs/plugins/pointer-plane";
import { signedAngleBetweenVectors } from "~/utils/signedAngleBetweenVectors";

const vUp = new Vector3(0, 1, 0);
const vOut = new Vector3(0, 0, 1);

const bodyFacing = new Vector3();
const q = new Quaternion();

function toPiRange(rad) {
  rad = rad % (Math.PI * 2);
  if (rad > Math.PI) {
    return -Math.PI - (Math.PI - rad);
  } else {
    return rad;
  }
}

function limitDiff(angleBase, angleToLimit, maxDiff) {
  let diff = toPiRange(angleToLimit - angleBase);
  return Math.abs(diff) > maxDiff ? maxDiff * Math.sign(diff) : diff;
}

export class HeadControllerSystem extends System {
  order = Groups.Simulation;

  static queries = {
    default: [HeadController],
  };

  update() {
    this.queries.default.forEach((entity) => {
      this.rotateTowardPointer(entity);
    });
  }

  rotateTowardPointer(entity) {
    const controller = entity.get(HeadController);

    const ppEntity = this.world.entities.getById(controller.pointerPlaneEntity);
    if (!ppEntity) return;

    const pointer = ppEntity.get(PointerPlaneRef);
    // If it's a very small number, it isn't real pointer position yet
    if (pointer.XZ.lengthSq() < 0.001) return;

    const local = entity.get(Transform);

    // A vector pointing "out" on the XZ plane, indicating which way the avatar is facing.
    // This is the "center value" that the head would most naturally face if unturned.
    bodyFacing.copy(vOut);
    bodyFacing.applyQuaternion(entity.getParent().get(Transform).rotation);

    /**
     * 1. Get the signed angle between vectors on a plane (vUp).
     * 2. Clamp it to a reasonable value so that the head doesn't swivel backwards.
     *
     * bodyFacing: see above
     * pointer.XZ: a Vector3 where the mouse is positioned on the XZ plane
     * vUp: the XZ normal plane
     */
    const angle = MathUtils.clamp(
      signedAngleBetweenVectors(bodyFacing, pointer.XZ, vUp),
      -Math.PI / 3,
      Math.PI / 3
    );

    // Gently rotate towards the goal using spherical lerp
    q.setFromEuler(new Euler(0, angle, 0));
    local.rotation.slerp(q, 0.2);
  }
}
