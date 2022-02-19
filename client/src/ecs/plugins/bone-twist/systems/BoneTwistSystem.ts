import { Vector3, Quaternion, Matrix4, MathUtils } from "three";

import { System, Groups, Entity, Not } from "~/ecs/base";
import { Presentation } from "~/ecs/plugins/core";
import { PointerPositionRef } from "~/ecs/plugins/pointer-position";

import { BoneTwist, BoneTwistError, BoneTwistRef } from "../components";
import { ModelAttached } from "~/ecs/plugins/model";

const vUp = new Vector3(0, 1, 0);
const vOrigin = new Vector3(0, 0, 0);
const mBone = new Matrix4();
const qBoneTarget = new Quaternion();
const mBoneParent = new Matrix4();
const qBoneParent = new Quaternion();

export class BoneTwistSystem extends System {
  presentation: Presentation;

  // After both AnimationSystem and PointerPositionSystem
  order = Groups.Simulation + 15;

  static queries = {
    added: [BoneTwist, ModelAttached, Not(BoneTwistRef), Not(BoneTwistError)],
    active: [BoneTwist, BoneTwistRef, PointerPositionRef],
    removed: [Not(BoneTwist), BoneTwistRef],
  };

  init({ presentation }) {
    this.presentation = presentation;
  }

  update() {
    this.queries.added.forEach((entity) => {
      this.build(entity);
    });

    this.queries.active.forEach((entity) => {
      const spec = entity.get(BoneTwist);
      if (spec.enabled) {
        this.follow(entity);
      }
    });

    this.queries.removed.forEach((entity) => {
      entity.maybeRemove(BoneTwistRef);
      entity.maybeRemove(BoneTwistError);
    });
  }

  build(entity: Entity) {
    const spec = entity.get(BoneTwist);
    const { parent, child } = entity.get(ModelAttached);
    let bone;
    child.traverse((node) => {
      if (node.isBone && node.name === spec.boneName) {
        bone = node;
      }
    });
    if (bone) {
      entity.add(BoneTwistRef, { value: bone, parent });
    } else {
      console.warn(`bone not found`, spec.boneName);
      entity.add(BoneTwistError);
    }
  }

  follow(entity: Entity) {
    const spec = entity.get(BoneTwist);
    const bone = entity.get(BoneTwistRef).value;

    // Set the rotation matrix from the custom function used to set up BoneTwist
    // For example: vLookAt could be set by headFollowsPointer
    const vLookAt = spec.function(entity);
    if (!vLookAt) return;

    // We'll need to calculate world rotation, not just local rotation
    bone.updateWorldMatrix(true, false);

    mBone.lookAt(vLookAt, vOrigin, vUp);
    qBoneTarget.setFromRotationMatrix(mBone);

    // Keep track of the BoneTwist rotation target for this bone
    if (!bone.twistBoneQuaternion) {
      bone.twistBoneQuaternion = new Quaternion();
    }
    // Gently move head direction (rather than abruptly changing directions)
    bone.twistBoneQuaternion.slerp(qBoneTarget, spec.speed);
    if (impossibleNeck(bone.twistBoneQuaternion)) {
      bone.twistBoneQuaternion.copy(qBoneTarget);
    }
    // Since animations move bones, we have to "override" the animation
    bone.quaternion.copy(bone.twistBoneQuaternion);

    // Bone's parent rotation must be taken into account
    // https://github.com/mrdoob/three.js/blob/dev/src/core/Object3D.js#L287
    if (bone.parent) {
      mBoneParent.extractRotation(bone.parent.matrixWorld);
      qBoneParent.setFromRotationMatrix(mBoneParent);
      bone.quaternion.premultiply(qBoneParent.invert());
    }
  }
}

function impossibleNeck(q: Quaternion) {
  return false;
}
