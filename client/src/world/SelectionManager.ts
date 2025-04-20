import type { WorldManager } from "./WorldManager"

import { get } from "svelte/store"
import { Quaternion, Vector3 } from "three"

import type { WorldDoc } from "~/y-integration/WorldDoc"
import { first, difference } from "~/utils/setOps"

import type { Entity, EntityId } from "~/ecs/base"
import { Outline } from "~/ecs/plugins/outline"
import { Transform } from "~/ecs/plugins/core"

import { openPanel } from "~/stores"
import { worldUIMode } from "~/stores/worldUIMode"
import { selectedEntities, selectedGroups, groupTree } from "~/stores/selection"

const qInv = new Quaternion()
const qNewRot = new Quaternion()
const vAxisInv = new Vector3()
export class SelectionManager {
  worldManager: WorldManager

  constructor(worldManager) {
    this.worldManager = worldManager

    this.subscribe()
  }

  get wdoc(): WorldDoc {
    return this.worldManager.worldDoc
  }

  get ids(): Array<string> {
    return [...get(selectedEntities)]
  }

  get length(): number {
    return this.ids.length
  }

  get entities(): Array<Entity> {
    return this.ids
      .map((id) => this.wdoc.world.entities.getById(id))
      .filter((entity) => entity && entity.has(Transform))
  }

  hasEntityId(entityId: EntityId): boolean {
    return selectedEntities.has(entityId)
  }

  clear(groupsToo = false) {
    selectedEntities.clear()
    if (groupsToo) {
      selectedGroups.clear()
    }
  }

  addEntityId(entityId: EntityId) {
    selectedEntities.add(entityId)
  }

  addEntityIds(entityIds: Array<EntityId>) {
    for (const id of entityIds) {
      this.addEntityId(id)
    }
  }

  addGroupId(groupId) {
    selectedGroups.add(groupId)
  }

  deleteEntityId(entityId) {
    selectedEntities.delete(entityId)
  }

  getFirst(): Entity {
    const $selected = get(selectedEntities)
    const entityId = first($selected)
    if (entityId) {
      return this.wdoc.world.entities.getById(entityId)
    }
  }

  get centroid(): Vector3 | undefined {
    const center = new Vector3()
    let count = 0
    for (const entity of this.entities) {
      const position = entity.get(Transform).position
      center.add(position)
      count++
    }
    if (count === 0) {
      return undefined
    }

    center.divideScalar(count)
    return center
  }

  savePositions() {
    for (const entity of this.entities) {
      const transform = entity.get(Transform)
      entity.local.savedPosition = new Vector3().copy(transform.position)
      entity.local.savedRotation = new Quaternion().copy(transform.rotation)
    }
  }

  moveRelativeToSavedPositions(vector: Vector3, adjust?: (position: Vector3) => void) {
    for (const entity of this.entities) {
      // Only move root entities:
      if (entity.getParent()) continue

      const transform = entity.get(Transform)
      const savedPos = entity.local.savedPosition
      if (savedPos) {
        transform.position.copy(savedPos).add(vector)
        adjust?.(transform.position)
        transform.modified() // update physics engine
      }
    }
  }

  rotate(center: Vector3, radians: number, axis: Vector3 = new Vector3(0, 1, 0)) {
    for (const entity of this.entities) {
      // Only rotate root entities:
      if (entity.getParent()) continue

      const transform = entity.get(Transform)
      const savedPos: Vector3 = entity.local.savedPosition
      const savedRot: Quaternion = entity.local.savedRotation
      const pos: Vector3 = transform.position

      // Reposition all selected objects based on new rotation angle
      const posQ = new Quaternion().setFromAxisAngle(axis, radians)
      pos.copy(savedPos)
      pos.sub(center)
      pos.applyQuaternion(posQ)
      pos.add(center)

      // Rotate all selected objects based on new rotation angle
      qInv.copy(savedRot).invert()
      vAxisInv.copy(axis).applyQuaternion(qInv)
      qNewRot.copy(savedRot).multiply(new Quaternion().setFromAxisAngle(vAxisInv, radians)).normalize()
      transform.rotation.copy(qNewRot)

      // Inform ECS to show new pos/rot
      transform.modified()
    }
  }

  toggleGroup() {
    if (selectedGroups.getSize() === 0) {
      // is not a group => need to create a group
      const groupId = groupTree.makeGroup(get(selectedEntities))
      selectedGroups.add(groupId)
    } else {
      // is a group => need to ungroup
      for (const groupId of get(selectedGroups)) {
        groupTree.unmakeGroup(groupId)
        selectedGroups.delete(groupId)
      }
    }
  }

  syncEntities() {
    this.entities.forEach((entity) => {
      this.wdoc.syncFrom(entity)
    })
  }

  // Show outline around selected entities
  subscribe() {
    const previouslySelected = new Set()
    selectedEntities.subscribe(($selected) => {
      const added = difference($selected, previouslySelected)
      const removed = difference(previouslySelected, $selected)

      if ($selected.size === 1 && added.size === 1) {
        if (get(openPanel) !== "layers") openPanel.set("modify")
      }

      if (get(worldUIMode) === "build") {
        if ($selected.size > 0) {
          // Transform Controls
          const entityId = first($selected)
          const entity = this.worldManager.world.entities.getById(entityId)
          this.worldManager.showTransformControls(entity)
        } else {
          this.worldManager.hideTransformControls()
        }
      }

      for (const entityId of removed) {
        const entity = this.wdoc.world.entities.getById(entityId)
        if (!entity || !entity.has(Outline)) continue
        previouslySelected.delete(entityId)
        entity.remove(Outline)
      }

      for (const entityId of added) {
        const entity = this.wdoc.world.entities.getById(entityId)
        if (!entity || entity.has(Outline)) continue
        previouslySelected.add(entityId)
        entity.add(Outline)
      }
    })
  }
}
