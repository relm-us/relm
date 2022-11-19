import type { DecoratedECSWorld, Participant } from "~/types";
import type { Equipment, EquipmentObject } from "relm-common";

import { EntityId } from "~/ecs/base";
import { Transform } from "~/ecs/plugins/core";
import { RelmRestAPI } from "~/main/RelmRestAPI";
import { createPrefabByName } from "~/prefab";
import { inFrontOf } from "~/utils/inFrontOf";

import { worldManager } from "~/world";
import { Vector3 } from "three";

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

    let equipment: Equipment;
    if (entityJSON) {
      const object = this.getEquipmentObjectFromJSON(entityJSON);

      const item = entityJSON.Item2 ?? entityJSON.Item;
      const version = item.compat === true ? "1" : "2";

      const s1 = new Vector3().fromArray(entityJSON.Transform.scale);
      const s2 = new Vector3().fromArray(item.scale);

      equipment = {
        version,
        bone: item.attach,
        position: item.position,
        rotation: item.rotation,
        scale: version === "2" ? s1.multiply(s2).toArray() : item.scale,
        object,
      };
    }

    worldManager.participants.setEquipment(equipment);
  }

  getEquipmentObjectFromJSON(entityJSON: any): EquipmentObject {
    if (entityJSON.Model3) {
      return {
        type: "model",
        assetUrl: entityJSON.Model3.asset.url,
        facemapColors: entityJSON.FaceMapColors
          ? JSON.parse(entityJSON.FaceMapColors.colors)
          : undefined,
      };
    } else if (entityJSON.Asset && entityJSON.Model2) {
      return {
        type: "model",
        assetUrl: entityJSON.Asset.value.url,
        facemapColors: entityJSON.FaceMapColors
          ? JSON.parse(entityJSON.FaceMapColors.colors)
          : undefined,
      };
    } else if (entityJSON.Shape3) {
      // TODO: implement shape
      return { type: "shape", shape: null };
    } else {
      return { type: "empty" };
    }
  }

  async take(entityId: EntityId) {
    const entity = this.world.entities.getById(entityId);

    console.log("take", entityId, entity);
    if (!entity) return;

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
    console.log("drop", assetId, this.heldAsset);

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

  get power(): string {
    const json = this.firstHeldEntityJSON;
    return json?.Item2?.power ?? json?.Item.power;
  }

  actionable(): boolean {
    console.log("actionable", this.power, this.firstHeldEntityJSON);
    return Boolean(this.power);
  }

  action() {
    console.log("action", this.power, this.firstHeldEntityJSON);
    if (this.power) {
      const parts = this.power.split(":");
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
