import { Object3D, Mesh, MeshStandardMaterial } from "three";
import { get } from "svelte/store";

import { OBJECT_INTERACTION } from "~/config/colliderInteractions";

import { System, Not, Modified, Groups } from "~/ecs/base";
import { Object3DRef, Transform } from "~/ecs/plugins/core";
// import { RigidBodyRef } from "~/ecs/plugins/physics";
import { colliderMaterial } from "~/ecs/shared/colliderMaterial";

import { worldUIMode } from "~/stores/worldUIMode";
import { isBrowser } from "~/utils/isBrowser";

import { Wall, WallMeshRef, WallColliderRef, WallVisible } from "../components";
import { WallGeometry, wallGeometryData } from "../WallGeometry";
export class WallSystem extends System {
  active = isBrowser();
  order = Groups.Initialization;

  static queries = {
    added: [Object3DRef, Wall, Not(WallMeshRef)],
    modified: [Object3DRef, Modified(Wall), WallMeshRef],
    removed: [Object3DRef, Not(Wall), WallMeshRef],
  };

  update() {
    this.queries.added.forEach((entity) => {
      this.build(entity);
    });

    this.queries.modified.forEach((entity) => {
      this.remove(entity);
      this.build(entity);
    });

    this.queries.removed.forEach((entity) => {
      this.remove(entity);
    });
  }

  build(entity) {
    const wall = entity.get(Wall);
    const object3d = entity.get(Object3DRef).value;
    const geometry = WallGeometry(
      wall.size.x,
      wall.size.y,
      wall.size.z,
      wall.convexity,
      wall.segments
    );

    const material = new MeshStandardMaterial({
      color: wall.color,
      roughness: wall.roughness,
      metalness: wall.metalness,
      emissive: wall.emissive,
    });

    const mesh = new Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    object3d.add(mesh);

    // Notify dependencies, e.g. BoundingBox, that object3d has changed
    entity.get(Object3DRef)?.modified();

    entity.add(WallMeshRef, { value: mesh });
  }

  remove(entity) {
    const ref: WallMeshRef = entity.get(WallMeshRef);
    if (ref) {
      const mesh = ref.value;

      mesh.removeFromParent();

      mesh.geometry.dispose();

      entity.remove(WallMeshRef);
    }
  }
}
