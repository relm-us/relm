import { System, Not, Modified, Groups } from "~/ecs/base";
import { Object3D, Transform } from "~/ecs/plugins/core";
import * as THREE from "three";
import { RigidBodyRef } from "~/ecs/plugins/rapier";
import { mode } from "~/stores/mode";
import { get } from "svelte/store";

import { isBrowser } from "~/utils/isBrowser";
import { Wall, WallMesh, WallColliderRef, WallVisible } from "../components";
import { WallGeometry, wallGeometryData } from "../WallGeometry";
import { OBJECT_INTERACTION } from "~/config/colliderInteractions";
import { colliderMaterial } from "~/ecs/shared/colliderMaterial";

export class WallSystem extends System {
  active = isBrowser();
  order = Groups.Initialization;

  static queries = {
    added: [Object3D, Wall, Not(WallMesh)],
    needsCollider: [Wall, RigidBodyRef, Not(WallColliderRef)],
    modified: [Object3D, Modified(Wall), WallMesh],
    modifiedTransform: [WallColliderRef, Modified(Transform)],
    removedObj: [Not(Object3D), WallMesh],
    removed: [Object3D, Not(Wall), WallMesh],

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

      // Notify outline to rebuild if necessary
      entity.getByName("Outline")?.modified();
    });
    this.queries.modifiedTransform.forEach((entity) => {
      this.removeCollider(entity);
    });
    this.queries.needsCollider.forEach((entity) => {
      this.buildCollider(entity);
    });
    this.queries.removedObj.forEach((entity) => {
      const mesh = entity.get(WallMesh).value;
      mesh.parent.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
      entity.remove(WallMesh);
    });
    this.queries.removed.forEach((entity) => {
      this.remove(entity);
    });

    const $mode = get(mode);
    if ($mode === "build") {
      this.queries.needsVisible.forEach((entity) => {
        const object3d = entity.get(Object3D).value;
        object3d.visible = true;
        entity.add(WallVisible);
      });
    } else if ($mode === "play") {
      this.queries.needsHidden.forEach((entity) => {
        const object3d = entity.get(Object3D).value;
        const wall = entity.get(Wall);
        object3d.visible = wall.visible;
        entity.remove(WallVisible);
      });
    }
  }

  build(entity) {
    const wall = entity.get(Wall);
    const object3d = entity.get(Object3D).value;
    const geometry = WallGeometry(
      wall.size.x,
      wall.size.y,
      wall.size.z,
      wall.convexity,
      wall.segments
    );

    let material;
    if (wall.visible) {
      material = new THREE.MeshStandardMaterial({
        color: wall.color,
        roughness: wall.roughness,
        metalness: wall.metalness,
        emissive: wall.emissive,
      });
    } else {
      material = colliderMaterial;
    }
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    object3d.add(mesh);

    // Honor visibility of wall right from the start
    object3d.visible = wall.visible;

    entity.add(WallMesh, { value: mesh });
  }

  remove(entity) {
    const mesh = entity.get(WallMesh).value;
    if (mesh) {
      const object3d = entity.get(Object3D).value;
      object3d.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();

      entity.remove(WallMesh);
    }
  }

  removeCollider(entity) {
    const { world } = (this.world as any).physics;
    const colliderRef = entity.get(WallColliderRef);
    if (!colliderRef) return;

    world.removeCollider(colliderRef.value);
    entity.remove(WallColliderRef);
  }

  buildCollider(entity) {
    const rigidBodyRef = entity.get(RigidBodyRef);

    const { world, rapier } = (this.world as any).physics;

    const wall = entity.get(Wall);
    const { vertices, indices } = wallGeometryData(
      wall.size.x,
      wall.size.y,
      wall.size.z,
      wall.convexity,
      wall.segments
    );

    const colliderDesc = rapier.ColliderDesc.trimesh(
      new Float32Array(vertices),
      new Uint32Array(indices)
    );

    // TODO: Make this configurable, like ColliderSystem
    colliderDesc.setCollisionGroups(OBJECT_INTERACTION);

    const collider = world.createCollider(
      colliderDesc,
      rigidBodyRef.value.handle
    );

    entity.add(WallColliderRef, { value: collider });
  }
}
