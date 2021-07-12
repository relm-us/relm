import { Vector3 } from "three";

import type WorldManager from "./WorldManager";

import { Entity } from "~/ecs/base";
import { Follow } from "~/ecs/plugins/follow";

import { scale } from "~/stores/viewport";

import { makeCamera } from "~/prefab/makeCamera";

export class CameraManager {
  worldManager: WorldManager;

  entity: Entity;
  targetOffset: Vector3 = new Vector3();

  constructor(worldManager: WorldManager) {
    this.worldManager = worldManager;
  }

  init() {
    // Create the ECS camera entity that holds the ThreeJS camera
    this.entity = makeCamera(
      this.worldManager.world,
      this.worldManager.avatar
    ).activate();

    // Listen to the mousewheel for zoom events
    scale.subscribe(($scale) => {
      this.targetOffset.y = 5.5 + (20 * $scale) / 100;
      this.targetOffset.z = 5 + (20 * $scale) / 100;
    });
  }

  update(delta: number) {
    const follow: Follow = this.entity?.get(Follow);
    if (!follow) return;

    // follow.offset.copy(this.targetOffset);
    follow.offset.lerp(this.targetOffset, 0.4);
  }
}
