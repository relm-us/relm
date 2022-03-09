import {
  Vector3,
  Box3,
  Sphere,
  Mesh,
  SphereGeometry,
  MeshBasicMaterial,
} from "three";

import { SPATIAL_INDEX_THRESHOLD } from "~/config/constants";
import { System, Groups, Entity } from "~/ecs/base";
import { Presentation, Transform } from "~/ecs/plugins/core";
import { SpatiallyIndexed, SpatialIndex } from "~/ecs/plugins/spatial-index";
import { Outline } from "~/ecs/plugins/outline";
import { BoundingBox } from "~/ecs/plugins/bounding-box";
import { Clicked, Clickable } from "~/ecs/plugins/clickable";

import { Item, ItemActor } from "../components";
import { isInteractive } from "~/utils/isInteractive";

const vOut = new Vector3(0, 0, 1);
const vProjectOutward = new Vector3();
const probe = new Sphere();

export class ItemActorSystem extends System {
  static selected: Entity = null;

  presentation: Presentation;
  spatial: SpatialIndex;
  sphereHelper: Mesh;
  candidates: Entity[];

  order = Groups.Simulation;

  static queries = {
    active: [ItemActor],
  };

  init({ presentation }) {
    this.presentation = presentation;
    this.spatial = presentation.spatial;
    this.candidates = [];
  }

  update(delta) {
    this.queries.active.forEach((entity) => {
      const spec = entity.get(ItemActor);
      const entitiesNearby = this.getEntitiesNearby(entity);
      const probe = this.makeProbe(entity);

      if (spec.debug)
        this.updateSphereHelper(entity, probe.center, probe.radius);

      // Add intersecting entities to candidates list
      this.candidates.length = 0;
      for (let entity of entitiesNearby) {
        if (entity.parent) continue;
        if (!isInteractive(entity)) continue;
        const box: Box3 = entity.get(BoundingBox)?.box;
        if (box && probe.intersectsBox(box)) {
          this.candidates.push(entity);
        }
      }

      // Sort candidates by centers' proximity to probe center
      this.candidates.sort((a: Entity, b: Entity) => {
        const aPos = a.get(Transform).positionWorld;
        const bPos = b.get(Transform).positionWorld;
        return aPos.distanceTo(probe.center) - bPos.distanceTo(probe.center);
      });

      const shouldOutline: Entity = this.candidates.length
        ? this.candidates[0]
        : null;

      const selected = ItemActorSystem.selected;
      if (selected && selected !== shouldOutline && selected.has(Outline)) {
        selected.remove(Outline);
        ItemActorSystem.selected = null;
      }

      if (shouldOutline && !shouldOutline.has(Outline)) {
        shouldOutline.add(Outline);
        ItemActorSystem.selected = shouldOutline;
      }
    });
  }

  getEntitiesNearby(entity: Entity) {
    const spatiallyIndexed = entity.get(SpatiallyIndexed);
    if (!spatiallyIndexed) return [];
    return this.spatial.octree
      .findPoints(spatiallyIndexed.index, SPATIAL_INDEX_THRESHOLD, true)
      .filter((found) => Boolean(found.data))
      .map((found) => found.data);
  }

  makeProbe(entity: Entity): Sphere {
    const transform: Transform = entity.get(Transform);
    const boundingBox: BoundingBox = entity.get(BoundingBox);

    // TODO: consider making radius relative to this entity's size?
    // TODO: make radius adjustable via a Component prop?
    const radius = 1.0;
    boundingBox.box.getCenter(probe.center);
    vProjectOutward
      .copy(vOut)
      .applyQuaternion(transform.rotation)
      .multiplyScalar(radius * 0.75);
    probe.center.add(vProjectOutward);
    probe.radius = radius;

    return probe;
  }

  updateSphereHelper(entity: Entity, center: Vector3, radius: number) {
    const itemActor: ItemActor = entity.get(ItemActor);

    if (!itemActor.sphereHelper) {
      const geometry = new SphereGeometry(radius);
      itemActor.sphereHelper = new Mesh(
        geometry,
        new MeshBasicMaterial({ transparent: true, opacity: 0.2 })
      );
      this.presentation.scene.add(itemActor.sphereHelper);
    }
    itemActor.sphereHelper.position.copy(center);
  }
}
