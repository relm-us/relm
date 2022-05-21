import {
  Vector3,
  Box3,
  Sphere,
  Mesh,
  SphereGeometry,
  MeshBasicMaterial,
} from "three";

import { SPATIAL_INDEX_THRESHOLD } from "~/config/constants";
import { isInteractiveNearby } from "~/utils/isInteractive";

import { System, Groups, Entity } from "~/ecs/base";
import { Presentation, Transform } from "~/ecs/plugins/core";
import { SpatiallyIndexed, SpatialIndex } from "~/ecs/plugins/spatial-index";
import { Outline } from "~/ecs/plugins/outline";
import { BoundingBox } from "~/ecs/plugins/bounding-box";

import { Interactor } from "../components";

const vOut = new Vector3(0, 0, 1);
const vProjectOutward = new Vector3();
const probe = new Sphere();

export class InteractorSystem extends System {
  static selected: Entity = null;

  presentation: Presentation;
  spatial: SpatialIndex;
  sphereHelper: Mesh;
  candidates: Entity[];

  order = Groups.Simulation;

  static queries = {
    active: [Interactor],
  };

  init({ presentation }) {
    this.presentation = presentation;
    this.spatial = presentation.spatial;
    this.candidates = [];
  }

  update(delta) {
    this.queries.active.forEach((entity) => {
      const spec = entity.get(Interactor);
      const entitiesNearby = this.getEntitiesNearby(entity);
      const probe = this.makeProbe(entity);

      if (spec.debug)
        this.updateSphereHelper(entity, probe.center, probe.radius);

      // Add intersecting entities to candidates list
      this.candidates.length = 0;
      for (let entity of entitiesNearby) {
        if (entity.parent) continue;
        if (!isInteractiveNearby(entity)) continue;
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

      const selected = InteractorSystem.selected;
      if (selected && selected !== shouldOutline && selected.has(Outline)) {
        selected.remove(Outline);
        InteractorSystem.selected = null;
      }

      if (shouldOutline && !shouldOutline.has(Outline)) {
        shouldOutline.add(Outline);
        InteractorSystem.selected = shouldOutline;
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
    const interactor: Interactor = entity.get(Interactor);

    if (!interactor.sphereHelper) {
      const geometry = new SphereGeometry(radius);
      interactor.sphereHelper = new Mesh(
        geometry,
        new MeshBasicMaterial({ transparent: true, opacity: 0.2 })
      );
      this.presentation.scene.add(interactor.sphereHelper);
    }
    interactor.sphereHelper.position.copy(center);
  }
}
