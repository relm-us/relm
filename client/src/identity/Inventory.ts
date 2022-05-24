import type { DecoratedECSWorld, Participant } from "~/types";

import { Entity, EntityId } from "~/ecs/base";
import { BoneAttach } from "~/ecs/plugins/bone-attach";
import { Transform } from "~/ecs/plugins/core";
import { RelmRestAPI } from "~/main/RelmRestAPI";
import { createPrefab } from "~/prefab";
import { makeBox } from "~/prefab/makeBox";
import { inFrontOf } from "~/utils/inFrontOf";

export class Inventory {
  api: RelmRestAPI;
  world: DecoratedECSWorld;
  participant: Participant;

  assets: any[];
  heldEntity: Entity;

  get heldAsset() {
    return this.assets[0];
  }

  get firstHeldEntity() {
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

    if (this.assets && this.assets.length > 0) {
      this.showHoldingIndicator();
    } else {
      this.removeHoldingIndicator();
    }
  }

  async take(entityId: EntityId) {
    const entity = this.world.entities.getById(entityId);

    const yCenter =
      entity.get(Transform).position.y - this.participant.avatar.position.y;

    const asset = await this.api.itemTake({
      entityId: entity.id as string,
      yCenter,
    });

    await this.loadAssets();
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
    if (!result) {
      console.error("Unable to drop item");
    }

    await this.loadAssets();
  }

  showHoldingIndicator() {
    this.heldEntity = makeBox(this.world, {
      w: 0.8,
      h: 0.8,
      d: 0.8,
      color: "#ff0000",
      collider: false,
    }).activate();

    const avatar = this.participant.avatar;
    if (avatar) {
      avatar.entities.body.add(BoneAttach, {
        boneName: "mixamorigRightHand",
        entityToAttachId: this.heldEntity.id,
      });
    } else {
      console.warn("Can't showHoldingIndicator: avatar not available");
    }
  }

  removeHoldingIndicator() {
    if (this.heldEntity) {
      const avatar = this.participant.avatar;
      if (avatar) {
        avatar.entities.body.remove(BoneAttach);
        this.heldEntity.destroy();
        this.heldEntity = null;
      } else {
        console.warn("Can't removeHoldingIndicator: avatar not available");
      }
    }
  }

  actionable(): boolean {
    return Boolean(this.firstHeldEntity?.Item.power);
  }

  action() {
    const power = this.firstHeldEntity?.Item.power;
    if (power) {
      const parts = power.split(":");
      if (parts[0] === "make") {
        const name = parts[1];

        // Make the item in front of the avatar
        const transform = this.participant.avatar.transform;
        const position = inFrontOf(transform.position, transform.rotation);
        createPrefab(name, { x: position.x, y: position.y, z: position.z });
      }
    }
  }
}
