import { Vector3 } from "three";

import type WorldManager from "./WorldManager";

import { Entity } from "~/ecs/base";
import { Follow } from "~/ecs/plugins/follow";

import { scale } from "~/stores/viewport";

import { makeCamera } from "~/prefab/makeCamera";

export class CameraManager {
  worldManager: WorldManager;

  entity: Entity;
  offset: Vector3 = new Vector3();

  constructor(worldManager: WorldManager) {
    this.worldManager = worldManager;
  }

  init() {
    this.entity = makeCamera(
      this.worldManager.world,
      this.worldManager.avatar
    ).activate();

    scale.subscribe(($scale) => {
      const follow = this.entity?.get(Follow);
      if (!follow) return;

      this.offset.y = 5.5 + (20 * $scale) / 100;
      this.offset.z = 5 + (20 * $scale) / 100;
    });
  }

  update(delta: number) {
    const follow: Follow = this.entity?.get(Follow);
    if (!follow) return;

    follow.offset.lerp(this.offset, 0.4);
  }
}
