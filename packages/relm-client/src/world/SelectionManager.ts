import { get } from "svelte/store";
import { Vector3 } from "three";
import { selectedEntities } from "~/stores/selection";
import { difference } from "~/utils/setOps";
import { WorldDoc } from "~/y-integration/WorldDoc";
import { Outline } from "~/ecs/plugins/outline";
import { Transform } from "hecs-plugin-core";

export class SelectionManager {
  wdoc: WorldDoc;

  constructor(worldDoc) {
    this.wdoc = worldDoc;

    this.subscribe();
  }

  get ids() {
    return [...get(selectedEntities)];
  }

  get length() {
    return this.ids.length;
  }

  get entities() {
    return this.ids.map((id) => this.wdoc.world.entities.getById(id));
  }

  get centroid() {
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
      entity.savedPosition = new Vector3().copy(position);
    }
  }

  moveRelativeToSavedPositions(vector) {
    for (const entity of this.entities) {
      const position = entity.get(Transform).position;
      if (entity.savedPosition) {
        position.copy(entity.savedPosition).add(vector);
      }
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
