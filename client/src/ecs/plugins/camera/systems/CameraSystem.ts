import { Collider, ConvexPolyhedron } from "@dimforge/rapier3d";
import { Vector3, PerspectiveCamera, Matrix4 } from "three";

import { System, Not, Groups, Entity } from "~/ecs/base";
import { Queries } from "~/ecs/base/Query";
import { Object3DRef, Transform } from "~/ecs/plugins/core";
import { Physics } from "~/ecs/plugins/physics";

import {
  Camera,
  CameraAttached,
  AlwaysOnStage,
  KeepOnStage,
} from "../components";

function isAlwaysOnStage(entity) {
  return entity.has(AlwaysOnStage) || entity.has(KeepOnStage);
}

const vUp = new Vector3(0, 1, 0);
const v1 = new Vector3();
const m4 = new Matrix4();

export class CameraSystem extends System {
  physics: Physics;
  camera: PerspectiveCamera;
  frustumShape: ConvexPolyhedron;
  frustumAspect: number;
  deactivateOffCameraEntities: boolean;

  recentlyOnSet: Set<Entity>;
  nowOnSet: Set<Entity>;

  order = Groups.Presentation + 400;

  static stageNeedsUpdate: boolean = false;

  static queries: Queries = {
    added: [Object3DRef, Camera, Not(CameraAttached)],
    active: [Camera, CameraAttached],
    removed: [Not(Camera), CameraAttached],
    // For entities tagged with "KeepOnStage", promote to StateComponent
    promote: [KeepOnStage, Not(AlwaysOnStage)],
  };

  init({ physics, presentation }) {
    this.physics = physics;
    this.camera = presentation.camera;

    this.buildFrustum();

    this.recentlyOnSet = new Set();
    this.deactivateOffCameraEntities = false;
  }

  update() {
    // TODO: combine this with resize observer?
    if (this.camera.aspect !== this.frustumAspect) {
      this.buildFrustum();
    }

    this.queries.added.forEach((entity) => this.build(entity));
    this.queries.active.forEach((entity) => this.move(entity));
    this.queries.removed.forEach((entity) => this.remove(entity));
    this.queries.promote.forEach((entity) => entity.add(AlwaysOnStage));

    if (this.world.version % 13 === 0 || CameraSystem.stageNeedsUpdate) {
      CameraSystem.stageNeedsUpdate = false;

      // There should be just 1 active camera, but we access it via forEach
      this.queries.active.forEach((entity) => {
        const transform: Transform = entity.get(Transform);

        // NOTE: This call takes about 0.6 ms on my system, in a world of 30 entities.
        this.physics.world.intersectionsWithShape(
          transform.position,
          transform.rotation,
          this.frustumShape,
          (collider: Collider) => {
            const entity = this.physics.colliders.get(collider.handle);

            if (!isAlwaysOnStage(entity)) {
              (entity as any).lastSeenOnSet = this.world.version;
              this.recentlyOnSet.add(entity);
            }

            // Activate anything within the Frustum that is inactive
            if (!entity.active) {
              entity.activate();
            }

            return true;
          }
        );
      });

      if (!this.deactivateOffCameraEntities) return;

      for (const entity of this.recentlyOnSet) {
        const lastSeen = (entity as any).lastSeenOnSet;
        if (this.world.version - lastSeen > 30) {
          this.recentlyOnSet.delete(entity);
          if (!isAlwaysOnStage(entity)) entity.deactivate();
        }
      }
    }
  }

  build(entity: Entity) {
    const object3d = entity.get(Object3DRef).value;

    object3d.add(this.camera);

    entity.add(CameraAttached);
  }

  move(entity: Entity) {
    const camera: Camera = entity.get(Camera);
    const transform: Transform = entity.get(Transform);

    v1.setFromSpherical(camera.sphere);

    transform.position.copy(camera.center).add(v1);

    m4.lookAt(transform.position, camera.lookAt, vUp);
    transform.rotation.setFromRotationMatrix(m4);

    transform.modified();
  }

  remove(entity: Entity) {
    this.camera.parent.remove(this.camera);
    entity.remove(CameraAttached);
  }

  buildFrustum() {
    this.frustumAspect = this.camera.aspect;
    this.frustumShape = this.getFrustumShape();
  }

  getFrustumShape(): ConvexPolyhedron {
    const vertices = getCameraFrustumVertices(this.camera, 50, -3);
    return new this.physics.rapier.ConvexPolyhedron(
      vertices.flatMap((v) => [v.x, v.y, v.z])
    );
  }

  addEverythingToSet() {
    for (const entity of this.world.entities.entities.values()) {
      if (!isAlwaysOnStage(entity)) {
        (entity as any).lastSeenOnSet = this.world.version;
        this.recentlyOnSet.add(entity);
      }
    }
  }

  beginDeactivatingOffCameraEntities() {
    this.deactivateOffCameraEntities = true;
  }

  endDeactivatingOffCameraEntities() {
    this.deactivateOffCameraEntities = false;
  }
}

function getCameraFrustumVertices(
  camera: PerspectiveCamera,
  far: number = null,
  padding: number = 0
) {
  const n = camera.near + padding;
  const f = far ?? camera.far + padding;

  const halfPI = Math.PI / 180;
  const fov = camera.fov * halfPI; // convert degrees to radians

  // Near Plane dimensions (near width, near height)
  const nH = 2 * Math.tan(fov / 2) * n - padding;
  const nW = nH * camera.aspect - padding; // width

  // Far Plane dimensions (far width, far height)
  const fH = 2 * Math.tan(fov / 2) * f - padding; // height
  const fW = fH * camera.aspect - padding; // width

  const vertices = [
    new Vector3(nW / 2, nH / 2, -n),
    new Vector3(-nW / 2, nH / 2, -n),
    new Vector3(nW / 2, -nH / 2, -n),
    new Vector3(-nW / 2, -nH / 2, -n),
    new Vector3(fW / 2, fH / 2, -f),
    new Vector3(-fW / 2, fH / 2, -f),
    new Vector3(fW / 2, -fH / 2, -f),
    new Vector3(-fW / 2, -fH / 2, -f),
  ];

  return vertices;
}
