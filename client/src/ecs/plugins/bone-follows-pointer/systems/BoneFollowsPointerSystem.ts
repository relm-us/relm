import { Vector3, Quaternion, Matrix4, MathUtils } from "three";

import { signedAngleBetweenVectors } from "~/utils/signedAngleBetweenVectors";

import { System, Groups, Entity, Not } from "~/ecs/base";
import { Presentation } from "~/ecs/plugins/core";
import { PointerPositionRef } from "~/ecs/plugins/pointer-position";

import {
  BoneFollowsPointer,
  BoneFollowsPointerError,
  BoneFollowsPointerRef,
} from "../components";
import { ModelAttached } from "~/ecs/plugins/model";

const HEAD_TURN_SPEED = 0.15;

const vBodyFacing = new Vector3();
const vUp = new Vector3(0, 1, 0);
const vOut = new Vector3(0, 0, 1);
const vPointerPos = new Vector3();
const vBonePos = new Vector3();
const qParent = new Quaternion();
const vParent = new Vector3();
const vLookAt = new Vector3();
const mBone = new Matrix4();
const qBoneTarget = new Quaternion();
const mBoneParent = new Matrix4();
const qBoneParent = new Quaternion();

export class BoneFollowsPointerSystem extends System {
  presentation: Presentation;

  // After both AnimationSystem and PointerPositionSystem
  order = Groups.Simulation + 15;

  static queries = {
    added: [
      BoneFollowsPointer,
      ModelAttached,
      Not(BoneFollowsPointerRef),
      Not(BoneFollowsPointerError),
    ],
    active: [BoneFollowsPointer, BoneFollowsPointerRef, PointerPositionRef],
    removed: [Not(BoneFollowsPointer), BoneFollowsPointerRef],
  };

  init({ presentation }) {
    this.presentation = presentation;
  }

  update() {
    this.queries.added.forEach((entity) => {
      this.build(entity);
    });

    this.queries.active.forEach((entity) => {
      const spec = entity.get(BoneFollowsPointer);
      this.follow(entity, spec.enabled);
    });

    this.queries.removed.forEach((entity) => {
      entity.maybeRemove(BoneFollowsPointerRef);
      entity.maybeRemove(BoneFollowsPointerError);
    });
  }

  build(entity: Entity) {
    const spec = entity.get(BoneFollowsPointer);
    const { parent, child } = entity.get(ModelAttached);
    let bone;
    child.traverse((node) => {
      if (node.isBone && node.name === spec.boneName) {
        bone = node;
      }
    });
    if (bone) {
      entity.add(BoneFollowsPointerRef, { value: bone, parent });
    } else {
      console.warn(`bone not found`, spec.boneName);
      entity.add(BoneFollowsPointerError);
    }
  }

  follow(entity: Entity, enabled = true) {
    const pointer = entity.get(PointerPositionRef).value;
    const { value: bone, parent } = entity.get(BoneFollowsPointerRef);

    parent.getWorldQuaternion(qParent);
    parent.getWorldPosition(vParent);

    bone.getWorldPosition(vBonePos);

    vPointerPos.copy(pointer.points.xz).sub(vParent);
    vPointerPos.y = 0;

    vBodyFacing.copy(vOut);
    vBodyFacing.applyQuaternion(qParent);
    vBodyFacing.y = 0;

    /**
     * 1. Get the signed angle between vectors on a plane (vUp).
     * 2. Clamp it to a reasonable value so that the head doesn't swivel backwards.
     *
     * vBodyFacing: see above
     * pointer.XZ: a Vector3 where the mouse is positioned on the XZ plane
     * vUp: the XZ normal plane
     */

    const angle = MathUtils.clamp(
      signedAngleBetweenVectors(
        vBodyFacing,
        enabled ? vPointerPos : vBodyFacing,
        vUp
      ),
      // Any more than 0.49 of PI and the slerp below will make it so
      // the head moves in an "impossible" way because the shortest
      // angle from looking over one shoulder to the other shoulder
      // is to spin the head backwards.
      -Math.PI * 0.49,
      Math.PI * 0.49
    );

    vLookAt.copy(vBodyFacing);
    vLookAt.applyAxisAngle(vUp, angle);
    vLookAt.add(vParent);

    // We'll need to calculate world rotation, not just local rotation
    bone.updateWorldMatrix(true, false);

    mBone.lookAt(vLookAt, vParent, vUp);
    qBoneTarget.setFromRotationMatrix(mBone);
    // Keep track of the BoneFollowsPointer rotation target for this bone
    if (!bone.quaternionBFP) {
      bone.quaternionBFP = new Quaternion();
    }
    // Gently move head direction (rather than abruptly changing directions)
    bone.quaternionBFP.slerp(qBoneTarget, HEAD_TURN_SPEED);
    // Since animations move bones, we have to "override" the animation
    bone.quaternion.copy(bone.quaternionBFP);

    // Bone's parent rotation must be taken into account
    // https://github.com/mrdoob/three.js/blob/dev/src/core/Object3D.js#L287
    if (bone.parent) {
      mBoneParent.extractRotation(bone.parent.matrixWorld);
      qBoneParent.setFromRotationMatrix(mBoneParent);
      bone.quaternion.premultiply(qBoneParent.invert());
    }
  }
}
