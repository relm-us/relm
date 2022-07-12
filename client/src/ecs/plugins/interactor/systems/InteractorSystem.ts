import {
  Vector3,
  Mesh,
  SphereGeometry,
  MeshBasicMaterial,
  Quaternion,
} from "three";

import { isInteractiveNearby } from "~/utils/isInteractive";

import { System, Groups, Entity } from "~/ecs/base";
import { Presentation, Transform } from "~/ecs/plugins/core";
import { Outline } from "~/ecs/plugins/outline";
import { Physics } from "~/ecs/plugins/physics";

import { Interactor } from "../components";
import { Ball, Collider } from "@dimforge/rapier3d";

const vOut = new Vector3(0, 0, 1);
const vProjectOutward = new Vector3();
const vProbeCenter = new Vector3();
const PROBE_DISTANCE = 0.75;
const PROBE_RADIUS = 1.0;
const NO_ROTATION = new Quaternion();

export class InteractorSystem extends System {
  static selected: Entity = null;

  presentation: Presentation;
  physics: Physics;
  sphereHelper: Mesh;
  candidates: Entity[];
  probe: Ball;

  order = Groups.Simulation;

  static queries = {
    active: [Interactor],
  };

  init({ presentation, physics }) {
    this.presentation = presentation;
    this.physics = physics;
    this.candidates = [];
    this.probe = new this.physics.rapier.Ball(PROBE_RADIUS);
  }

  update(delta) {
    this.queries.active.forEach((entity) => {
      const spec = entity.get(Interactor);
      const probeCenter = this.getProbeCenter(entity);

      if (spec.debug)
        this.updateSphereHelper(entity, probeCenter, PROBE_RADIUS);

      // Add intersecting entities to candidates list
      this.candidates.length = 0;

      this.physics.world.intersectionsWithShape(
        probeCenter,
        NO_ROTATION,
        this.probe,
        0xffffffff,
        (collider: Collider) => {
          const entity = this.physics.colliders.get(collider.handle);
          if (!entity.parent && isInteractiveNearby(entity)) {
            this.candidates.push(entity);
          }
          return true;
        }
      );

      // Sort candidates by centers' proximity to probe center
      this.candidates.sort((a: Entity, b: Entity) => {
        const aPos = a.get(Transform).positionWorld;
        const bPos = b.get(Transform).positionWorld;
        return aPos.distanceTo(probeCenter) - bPos.distanceTo(probeCenter);
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

  getProbeCenter(entity: Entity): Vector3 {
    const transform: Transform = entity.get(Transform);

    vProjectOutward
      .copy(vOut)
      .applyQuaternion(transform.rotation)
      .multiplyScalar(PROBE_DISTANCE);

    vProbeCenter.copy(transform.position).add(vProjectOutward);

    return vProbeCenter;
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
