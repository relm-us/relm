import type { WorldManager } from "./WorldManager";

import { get } from "svelte/store";
import { Vector3 } from "three";

import { WorldDoc } from "~/y-integration/WorldDoc";
import { first, difference } from "~/utils/setOps";

import { Entity, EntityId } from "~/ecs/base";
import { Outline } from "~/ecs/plugins/outline";
import { Transform } from "~/ecs/plugins/core";

import { selectedEntities, selectedGroups } from "~/stores/selection";
import { openPanel } from "~/stores";
import { worldUIMode } from "~/stores/worldUIMode";

export class SelectionManager {
  worldManager: WorldManager;

  constructor(worldManager) {
    this.worldManager = worldManager;

    this.subscribe();
  }

  get wdoc(): WorldDoc {
    return this.worldManager.worldDoc;
  }

  get ids(): Array<string> {
    return [...get(selectedEntities)];
  }

  get length(): number {
    return this.ids.length;
  }

  get entities(): Array<Entity> {
    return this.ids
      .map((id) => this.wdoc.world.entities.getById(id))
      .filter((entity) => entity && entity.has(Transform));
  }

  hasEntityId(entityId: EntityId): boolean {
    return selectedEntities.has(entityId);
  }

  clear(groupsToo = false) {
    selectedEntities.clear();
    if (groupsToo) {
      selectedGroups.clear();
    }
  }

  addEntityId(entityId: EntityId) {
    selectedEntities.add(entityId);
  }

  addEntityIds(entityIds: Array<EntityId>) {
    for (const id of entityIds) {
      this.addEntityId(id);
    }
  }

  addGroupId(groupId) {
    selectedGroups.add(groupId);
  }

  deleteEntityId(entityId) {
    selectedEntities.delete(entityId);
  }

  getFirst(): Entity {
    const $selected = get(selectedEntities);
    const entityId = first($selected);
    if (entityId) {
      return this.wdoc.world.entities.getById(entityId);
    }
  }

  get centroid(): Vector3 {
    const center = new Vector3();
    let count = 0;
    for (const entity of this.entities) {
      const position = entity.get(Transform).position;
      center.add(position);
      count++;
    }
    if (count === 0) {
      return;
    } else {
      center.divideScalar(count);
      return center;
    }
  }

  savePositions() {
    for (const entity of this.entities) {
      const position = entity.get(Transform).position;
      (entity as any).savedPosition = new Vector3().copy(position);
    }
  }

  moveRelativeToSavedPositions(
    vector: Vector3,
    adjust?: (position: Vector3) => void
  ) {
    for (const entity of this.entities) {
      // Only move root entities:
      if (entity.getParent()) continue;

      const transform = entity.get(Transform);
      const savedPos = (entity as any).savedPosition;
      if (savedPos) {
        transform.position.copy(savedPos).add(vector);
        adjust?.(transform.position);
        transform.modified(); // update physics engine
      }
    }
  }

  rotate(
    center: Vector3,
    radians: number,
    axis: Vector3 = new Vector3(0, 1, 0)
  ) {
    for (const entity of this.entities) {
      // Only rotate root entities:
      if (entity.getParent()) continue;

      const transform = entity.get(Transform);
      const savedPos = (entity as any).savedPosition;
      const pos = transform.position

      pos.copy(savedPos);
      pos.sub(center);
      pos.applyAxisAngle(axis, radians);
      pos.add(center);

      transform.rotation.setFromAxisAngle(axis, radians);

      transform.modified();
    }
  }

  syncEntities() {
    this.entities.forEach((entity) => {
      this.wdoc.syncFrom(entity);
    });
  }

  // Show outline around selected entities
  subscribe() {
    const previouslySelected = new Set();
    selectedEntities.subscribe(($selected) => {
      const added = difference($selected, previouslySelected);
      const removed = difference(previouslySelected, $selected);

      if ($selected.size === 1 && added.size === 1) {
        openPanel.set("modify");
      }

      if (get(worldUIMode) === "build") {
        if ($selected.size > 0) {
          // Transform Controls
          const entityId = first($selected);
          const entity = this.wdoc.world.entities.getById(entityId);
          this.worldManager.showTransformControls(entity);
        } else {
          this.worldManager.hideTransformControls();
        }
      }

      for (const entityId of removed) {
        const entity = this.wdoc.world.entities.getById(entityId);
        if (!entity || !entity.has(Outline)) continue;
        previouslySelected.delete(entityId);
        entity.remove(Outline);
      }

      for (const entityId of added) {
        const entity = this.wdoc.world.entities.getById(entityId);
        if (!entity || entity.has(Outline)) continue;
        previouslySelected.add(entityId);
        entity.add(Outline);
      }
    });
  }
}
