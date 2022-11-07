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
    // needsCollider: [Wall, RigidBodyRef, Not(WallColliderRef)],
    modified: [Object3DRef, Modified(Wall), WallMeshRef],
    modifiedTransform: [WallColliderRef, Modified(Transform)],
    removedObj: [Not(Object3DRef), WallMeshRef],
    removed: [Object3DRef, Not(Wall), WallMeshRef],

    needsVisible: [Wall, Not(WallVisible)],
    needsHidden: [WallVisible],
  };

  update() {
    this.queries.added.forEach((entity) => {
      this.build(entity);
    });
    this.queries.modified.forEach((entity) => {
      this.remove(entity);
      this.build(entity);

      this.removeCollider(entity);
      entity.remove(WallVisible);
    });
    this.queries.modifiedTransform.forEach((entity) => {
      this.removeCollider(entity);
    });
    // this.queries.needsCollider.forEach((entity) => {
    //   this.buildCollider(entity);
    // });
    this.queries.removedObj.forEach((entity) => {
      const mesh = entity.get(WallMeshRef).value;
      mesh.parent.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
      entity.remove(WallMeshRef);
    });
    this.queries.removed.forEach((entity) => {
      this.remove(entity);
    });

    const $mode = get(worldUIMode);
    if ($mode === "build") {
      this.queries.needsVisible.forEach((entity) => {
        const object3d: Object3D = entity.get(Object3DRef).value;
        object3d.visible = true;
        entity.add(WallVisible);
      });
    } else if ($mode === "play") {
      this.queries.needsHidden.forEach((entity) => {
        const object3d: Object3D = entity.get(Object3DRef).value;
        const wall = entity.get(Wall);
        object3d.visible = wall.visible;
        entity.remove(WallVisible);
      });
    }
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

    let material;
    if (wall.visible) {
      material = new MeshStandardMaterial({
        color: wall.color,
        roughness: wall.roughness,
        metalness: wall.metalness,
        emissive: wall.emissive,
      });
    } else {
      material = colliderMaterial;
    }
    const mesh = new Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    object3d.add(mesh);

    // Honor visibility of wall right from the start
    object3d.visible = wall.visible;

    // Notify dependencies, e.g. BoundingBox, that object3d has changed
    entity.get(Object3DRef)?.modified();

    entity.add(WallMeshRef, { value: mesh });
  }

  remove(entity) {
    const mesh = entity.get(WallMeshRef).value;
    if (mesh) {
      const object3d: Object3D = entity.get(Object3DRef).value;
      object3d.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();

      entity.remove(WallMeshRef);
    }
  }

  removeCollider(entity) {
    const { world } = (this.world as any).physics;
    const colliderRef = entity.get(WallColliderRef);
    if (!colliderRef) return;

    world.removeCollider(colliderRef.value);
    entity.remove(WallColliderRef);
  }

  // buildCollider(entity) {
  //   const rigidBodyRef = entity.get(RigidBodyRef);

  //   const { world, rapier } = (this.world as any).physics;

  //   const wall = entity.get(Wall);
  //   const { vertices, indices } = wallGeometryData(
  //     wall.size.x,
  //     wall.size.y,
  //     wall.size.z,
  //     wall.convexity,
  //     wall.segments
  //   );

  //   const colliderDesc = rapier.ColliderDesc.trimesh(
  //     new Float32Array(vertices),
  //     new Uint32Array(indices)
  //   );

  //   // TODO: Make this configurable, like ColliderSystem
  //   colliderDesc.setCollisionGroups(OBJECT_INTERACTION);

  //   const collider = world.createCollider(
  //     colliderDesc,
  //     rigidBodyRef.value.handle
  //   );

  //   entity.add(WallColliderRef, { value: collider });
  // }
}
