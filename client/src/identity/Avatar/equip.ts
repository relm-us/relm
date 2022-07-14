import type { Equipment } from "relm-common";
import type { Avatar } from ".";

import { Vector3, Quaternion } from "three";

import { BoneAttach } from "~/ecs/plugins/bone-attach";
import { Item } from "~/ecs/plugins/item";

import { AvatarEntities, DecoratedECSWorld } from "~/types";
import { Entity } from "~/ecs/base";
import { makeEntity } from "~/prefab/makeEntity";
import { Asset, Transform } from "~/ecs/plugins/core";
import { Asset as AssetComp } from "~/ecs/plugins/asset";
import { Model2 } from "~/ecs/plugins/form";
import { FaceMapColors } from "~/ecs/plugins/coloration";
import { makeBox } from "~/prefab/makeBox";
import { AlwaysOnStage } from "~/ecs/plugins/camera";

const HAND_LENGTH = 0.25;
const BACK_OFFSET = 0.25;

export function setEquipped(
  this: void,
  entities: AvatarEntities,
  equipment: Equipment
) {
  if (equipment) {
    showHoldingIndicator(entities, equipment);
  } else {
    removeHoldingIndicator(entities);
  }
}

export function showHoldingIndicator(
  entities: AvatarEntities,
  equipment: Equipment
) {
  const heldEntity = makeHeldEntity(
    entities.body.world as DecoratedECSWorld,
    equipment
  );

  const attachParams = getBoneAttachParams(equipment);

  const { position, rotation, scale } = equipment;
  const item = new Item(null).fromJSON({ position, rotation, scale });
  attachParams.position.add(item.position);
  attachParams.rotation.copy(item.rotation);
  attachParams.scale.copy(item.scale);

  if (entities) {
    // Will add (or modify, if BoneAttach already exists)
    entities.body.add(BoneAttach, {
      entityToAttachId: heldEntity.id,
      ...attachParams,
    });
  } else {
    console.warn("Can't showHoldingIndicator: avatar not available");
  }

  return heldEntity;
}

export function removeHoldingIndicator(entities: AvatarEntities) {
  if (!entities) return;

  entities.body.maybeRemove(BoneAttach);
  entities.equipped?.destroy();
  delete entities.equipped;
}

function makeHeldEntity(world: DecoratedECSWorld, equipment: Equipment) {
  let entity: Entity;

  if (equipment?.model) {
    entity = makeEntity(world, "Held")
      .add(AlwaysOnStage)
      .add(Transform)
      .add(AssetComp, { value: new Asset(equipment.model) })
      .add(Model2);

    if (equipment.colors) {
      entity.add(FaceMapColors, {
        colors: equipment.colors,
      });
    }
  } else {
    entity = makeBox(world, {
      name: "Held",
      w: 0.8,
      h: 0.8,
      d: 0.8,
      color: "#cc9900",
      collider: false,
    });
  }

  return entity.activate();
}

function getBoneAttachParams(equipment: Equipment) {
  const height = 1.0;
  switch (equipment.bone) {
    case "HEAD":
      return {
        boneName: "mixamorigHeadTop_End",
        position: new Vector3(0, height / 2, 0),
        rotation: new Quaternion(),
        scale: new Vector3(1, 1, 1),
      };
    case "BACK":
      return {
        boneName: "mixamorigSpine2",
        position: new Vector3(0, 0, -height / 2 - BACK_OFFSET),
        rotation: new Quaternion(),
        scale: new Vector3(1, 1, 1),
      };
    default:
      return {
        boneName: "mixamorigRightHand",
        position: new Vector3(0, height / 2 + HAND_LENGTH, 0),
        rotation: new Quaternion(),
        scale: new Vector3(1, 1, 1),
      };
  }
}
