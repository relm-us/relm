import {
  Collider,
  ColliderDesc,
  ConvexPolyhedron,
  RigidBody,
} from "@dimforge/rapier3d";
import { Vector3, PerspectiveCamera, Quaternion } from "three";
import { OBJECT_INTERACTION } from "~/config/colliderInteractions";

import { System, Not, Groups, Entity } from "~/ecs/base";
import { Queries } from "~/ecs/base/Query";
import { Object3DRef, Transform } from "~/ecs/plugins/core";
import { Physics, Collider2Ref } from "~/ecs/plugins/physics";

import { Camera, CameraAttached, OnStage } from "../components";

export class CameraSystem extends System {
  physics: Physics;
  camera: PerspectiveCamera;
  frustumShape: ConvexPolyhedron;

  order = Groups.Initialization;

  static queries: Queries = {
    added: [Object3DRef, Camera, Not(CameraAttached)],
    removed: [Not(Camera), CameraAttached],

    active: [Camera, CameraAttached],
    notCamera: [Not(Camera), Collider2Ref],
  };

  init({ physics, presentation }) {
    this.physics = physics;
    this.camera = presentation?.camera;

    this.frustumShape = this.getFrustumShape();

    // const helper = new CameraHelper(this.camera);
    // presentation.scene.add(helper);
  }

  update() {
    this.queries.added.forEach((entity) => this.build(entity));
    this.queries.removed.forEach((entity) => this.remove(entity));

    const entitiesOnStage: Set<Entity> = new Set();

    this.queries.active.forEach((entity) => {
      const transform: Transform = entity.get(Transform);

      let count = 0;
      this.physics.world.intersectionsWithShape(
        transform.position,
        transform.rotation,
        this.frustumShape,
        0xffffffff,
        (collider: Collider) => {
          count++;
          const entity = this.physics.colliders.get(collider.handle);
          entitiesOnStage.add(entity);
          if (!entity.active) {
            // console.log("activating", entity.id);
            // entity.activate();
            // if (count > 18) debugger;
          }
          return true;
        }
      );

      // console.log("frustum count", count);
    });

    this.queries.notCamera.forEach((entity) => {
      if (!entitiesOnStage.has(entity)) {
        if (
          !entity.hasByName("Asset") ||
          (entity.hasByName("Asset") && !entity.hasByName("AssetLoading"))
        ) {
          if (entity.active) {
            // console.log("deactivating", entity.id);
            // entity.deactivate();
          }
        }
      }
    });
  }

  build(entity: Entity) {
    const object3d = entity.get(Object3DRef).value;

    object3d.add(this.camera);

    entity.add(CameraAttached);
  }

  remove(entity: Entity) {
    this.camera.parent.remove(this.camera);
    entity.remove(CameraAttached);
  }

  getFrustumShape(): ConvexPolyhedron {
    const vertices = getCameraFrustumVertices(this.camera, null, 0);
    return new this.physics.rapier.ConvexPolyhedron(
      vertices.flatMap((v) => [v.x, v.y, v.z])
    );
  }
}

function getCameraFrustumVertices(
  camera: PerspectiveCamera,
  far: number = null,
  padding: number = 0
) {
  // const camera = this.threeCamera;
  // camera.updateWorldMatrix(true, false);
  // camera.updateMatrixWorld(true);
  // camera.updateProjectionMatrix();

  const mw = camera.matrixWorld;
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
    // new Vector3(nW / 2, nH / 2, -n).applyMatrix4(mw),
    // new Vector3(-nW / 2, nH / 2, -n).applyMatrix4(mw),
    // new Vector3(nW / 2, -nH / 2, -n).applyMatrix4(mw),
    // new Vector3(-nW / 2, -nH / 2, -n).applyMatrix4(mw),
    // new Vector3(fW / 2, fH / 2, -f).applyMatrix4(mw),
    // new Vector3(-fW / 2, fH / 2, -f).applyMatrix4(mw),
    // new Vector3(fW / 2, -fH / 2, -f).applyMatrix4(mw),
    // new Vector3(-fW / 2, -fH / 2, -f).applyMatrix4(mw),
  ];

  return vertices;
}
