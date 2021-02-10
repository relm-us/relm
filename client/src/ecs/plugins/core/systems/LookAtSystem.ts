import * as THREE from "three";
import { System, Groups } from "~/ecs/base";

import { IS_BROWSER } from "../utils";
import { Transform, WorldTransform, LookAt, LookAtCamera } from "../components";
import { Presentation } from "../Presentation";
import { Queries } from "~/ecs/base/Query";

const m1 = new THREE.Matrix4();
const q1 = new THREE.Quaternion();
const targetPosition = new THREE.Vector3();
const position = new THREE.Vector3();
const up = new THREE.Vector3(0, 1, 0);
const delta = new THREE.Vector3();

export class LookAtSystem extends System {
  presentation: Presentation;
  cameraId: string;

  active = IS_BROWSER;
  order = Groups.Initialization;

  static queries: Queries = {
    targeted: [LookAt],
    cameras: [LookAtCamera],
  };

  init({ presentation }) {
    this.presentation = presentation;
    this.cameraId = null;
  }

  update() {
    // Keep cameraId around because we access it for each entity
    this.cameraId = this.presentation.camera.parent?.userData.entityId;

    this.queries.targeted.forEach((entity) => {
      const spec = entity.get(LookAt);
      this.lookAt(entity, spec.entity, spec.limit);
    });

    this.queries.cameras.forEach((entity) => {
      const { limit } = entity.get(LookAtCamera);
      this.lookAt(entity, this.cameraId, limit);
    });
  }

  lookAt(entity, targetId, limit) {
    const transform = entity.get(Transform);
    const world = entity.get(WorldTransform);
    const targetEntity = this.world.entities.getById(targetId);
    if (!targetEntity) return;
    const targetWorld = targetEntity.get(WorldTransform) as any;
    if (!targetWorld) return;
    targetPosition.copy(targetWorld.position);
    position.copy(world.position);

    if (limit === "NONE") {
      targetPosition.copy(targetWorld.position);
    } else if (limit === "X_AXIS") {
      targetPosition.x = position.x;
      targetPosition.y = targetWorld.position.y;
      targetPosition.z = targetWorld.position.z;
    } else if (limit === "Y_AXIS") {
      targetPosition.x = targetWorld.position.x;
      targetPosition.y = position.y;
      targetPosition.z = targetWorld.position.z;
    } else if (limit === "Z_AXIS") {
      targetPosition.x = targetWorld.position.x;
      targetPosition.y = targetWorld.position.y;
      targetPosition.z = position.z;
    }

    // Camera looks down negative z-axis, so when it is the thing doing the looking, flip it around
    if (entity.id === this.cameraId) {
      delta.copy(targetPosition).sub(position).multiplyScalar(2);
      targetPosition.sub(delta);
    }

    m1.lookAt(targetPosition, position, up);
    transform.rotation.setFromRotationMatrix(m1);

    const parent = entity.getParent();
    if (parent) {
      m1.extractRotation(parent.get(WorldTransform).matrix);
      q1.setFromRotationMatrix(m1);
      transform.rotation.premultiply(q1.inverse());
    }
  }
}
