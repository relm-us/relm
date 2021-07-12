import { Vector3 } from "three";

import type WorldManager from "./WorldManager";

import { Entity } from "~/ecs/base";
import { WorldTransform } from "~/ecs/plugins/core";
import { Follow } from "~/ecs/plugins/follow";
import { LookAt } from "~/ecs/plugins/look-at";

import { scale } from "~/stores/viewport";

import { makeCamera } from "~/prefab/makeCamera";

type ViewPerspective = "top" | "front";

// type CameraAngle = {
//   entityId: string;

// }

// type CameraStateNormal = {
//   state: "normal";
//   entityId: string;
// };

// type CameraStateFocused = {
//   state: "focused";
//   alpha: number;
//   startPos: Vector3;
//   startQuat: Quaternion;
//   view: ViewPerspective;
//   entityId: string;
// };

// type CameraState = CameraStateFollowing | CameraStateZooming;

export class CameraManager {
  worldManager: WorldManager;

  // The ECS entity with a Camera component holding the ThreeJS PerspectiveCamera object
  entity: Entity;

  // The ECS entity that the camera is targeting (usually the participant's Avatar)
  target: Entity;

  // 0: zoomed all the way in; 1: zoomed all the way out
  zoom: number;

  //
  pan: Vector3 = new Vector3();

  followOffset: Vector3 = new Vector3();
  lookAtOffset: Vector3 = new Vector3();
  zoomedInOffset: Vector3 = new Vector3(0, 5.5, 5.0);
  zoomedOutOffset: Vector3 = new Vector3(0, 25.5, 25.0);

  constructor(worldManager: WorldManager, initialTarget: Entity) {
    this.worldManager = worldManager;
    this.target = initialTarget;
  }

  init() {
    // Create the ECS camera entity that holds the ThreeJS camera
    this.entity = makeCamera(
      this.worldManager.world,
      this.worldManager.avatar
    ).activate();

    // Listen to the mousewheel for zoom events
    scale.subscribe(($scale) => {
      this.zoom = $scale / 100;
    });
  }

  update(delta: number) {
    this.followOffset
      .copy(this.zoomedInOffset)
      .lerp(this.zoomedOutOffset, this.zoom)
      .add(this.pan);
    this.entity?.get(Follow).offset.copy(this.followOffset);

    this.lookAtOffset.copy(this.pan);
    this.entity?.get(LookAt).offset.copy(this.lookAtOffset);
  }

  setPan(x, z) {
    this.pan.x = x;
    this.pan.z = z;
  }
}
