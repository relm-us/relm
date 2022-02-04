import { get } from "svelte/store";
import { Vector3 } from "three";

import { worldManager } from "~/world";
import { worldUIMode } from "~/stores/worldUIMode";
import { groupTree } from "~/stores/selection";
import { copyBuffer } from "~/stores/copyBuffer";
import { Transform } from "~/ecs/plugins/core";
import {
  assignNewGroupIds,
  assignNewIds,
  deserializeCopyBuffer,
} from "./common";

export function paste(clipboardData?: DataTransfer) {
  const offset = new Vector3();
  if (get(worldUIMode) !== "build") return;

  const cbdata = clipboardData?.getData("text");

  let buffer;

  if (cbdata?.startsWith("relm:")) {
    // clipboard paste?
    try {
      buffer = deserializeCopyBuffer(cbdata.slice(5));
    } catch (err) {
      console.warn("unable to parse clipboard data", err);
    }
  }

  if (!buffer) {
    // local paste; could be from asset library
    buffer = get(copyBuffer);
  }

  if (buffer.entities.length === 0) {
    console.warn("nothing to paste");
    return;
  }

  // Entities in copy buffer get new IDs on every paste
  const idMap = assignNewIds(buffer.entities);

  // Re-create group(s) by assigning new group IDs and merging in
  assignNewGroupIds(buffer.groupTree, idMap);
  groupTree.mergeTree(buffer.groupTree);

  const targetPosition = new Vector3().copy(
    worldManager.participants.local.avatar.position
  );
  targetPosition.y = buffer.center.y;

  const entities = [];

  // Create a copy of each entity and put it in it's new location
  for (const json of buffer.entities) {
    const entity = worldManager.world.entities
      .create()
      .fromJSON(json)
      .activate();
    const transform = entity.get(Transform);
    if (transform && entity.parent === null) {
      offset.copy(transform.position);
      transform.position.copy(targetPosition).add(offset);
    }
    entities.push(entity);
  }

  // Update yjs WorldDoc
  for (const entity of entities) {
    entity.bind();
    worldManager.worldDoc.syncFrom(entity);
  }
}
