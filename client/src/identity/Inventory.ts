import type { DecoratedECSWorld, Participant } from "~/types";

import { EntityId } from "~/ecs/base";
import { Transform } from "~/ecs/plugins/core";
import { RelmRestAPI } from "~/main/RelmRestAPI";
import { createPrefabByName } from "~/prefab";
import { inFrontOf } from "~/utils/inFrontOf";

import { worldManager } from "~/world";

export class Inventory {
  api: RelmRestAPI;
  world: DecoratedECSWorld;
  participant: Participant;

  assets: any[] = [];

  get heldAsset() {
    return this.assets[0];
  }

  get firstHeldEntityJSON() {
    return this.heldAsset?.ecsProperties.entities[0];
  }

  constructor(
    api: RelmRestAPI,
    world: DecoratedECSWorld,
    participant: Participant
  ) {
    this.api = api;
    this.world = world;
    this.participant = participant;
  }

  async init() {
    await this.loadAssets();
  }

  async loadAssets() {
    this.assets = await this.api.itemQuery();
    this.syncIndicator();
  }

  syncIndicator() {
    const entityJSON = this.firstHeldEntityJSON;

    let equipment;
    if (entityJSON) {
      equipment = {
        bone: entityJSON.Item.attach,
        position: entityJSON.Item.position,
        rotation: entityJSON.Item.rotation,
        scale: entityJSON.Item.scale,
        model: entityJSON.Asset?.value.url,
        colors: entityJSON.FaceMapColors
          ? JSON.parse(entityJSON.FaceMapColors.colors)
          : undefined,
      };
    }

    worldManager.participants.setEquipment(equipment);
  }

  async take(entityId: EntityId) {
    const entity = this.world.entities.getById(entityId);

    const yCenter =
      entity.get(Transform).position.y - this.participant.avatar.position.y;

    const asset = await this.api.itemTake({
      entityId: entity.id as string,
      yCenter,
    });

    this.assets.unshift(asset);

    this.syncIndicator();
  }

  async drop(assetId?: string) {
    if (!assetId) {
      if (this.heldAsset) {
        assetId = this.heldAsset.assetId;
      } else {
        console.warn("No items to drop");
        return;
      }
    }

    const transform = this.participant.avatar.transform;
    const position = inFrontOf(transform.position, transform.rotation);

    const result = await this.api.itemDrop({
      assetId,
      position: position.toArray(),
    });

    if (result) {
      this.assets.shift();
      this.syncIndicator();
    } else {
      console.error("Unable to drop item");
    }
  }

  actionable(): boolean {
    return Boolean(this.firstHeldEntityJSON?.Item.power);
  }

  action() {
    const power = this.firstHeldEntityJSON?.Item.power;
    if (power) {
      const parts = power.split(":");
      if (parts[0] === "make") {
        const name = parts[1];

        // Make the item in front of the avatar
        const transform = this.participant.avatar.transform;
        const position = inFrontOf(transform.position, transform.rotation);
        createPrefabByName(name, {
          x: position.x,
          y: position.y,
          z: position.z,
        });
      }
    }
  }
}
