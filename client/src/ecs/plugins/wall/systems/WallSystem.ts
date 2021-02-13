import { System, Not, Modified, Groups } from "~/ecs/base";
import { Object3D } from "~/ecs/plugins/core";
import * as THREE from "three";
import { RigidBodyRef } from "~/ecs/plugins/rapier";

import { isBrowser } from "~/utils/isBrowser";
import { Wall, WallMesh, WallColliderRef } from "../components";
import { WallGeometry, wallGeometryData } from "../WallGeometry";

export class WallSystem extends System {
  active = isBrowser();
  order = Groups.Initialization;

  static queries = {
    added: [Object3D, Wall, Not(WallMesh)],
    needsCollider: [Wall, RigidBodyRef, Not(WallColliderRef)],
    modified: [Object3D, Modified(Wall), WallMesh],
    removedObj: [Not(Object3D), WallMesh],
    removed: [Object3D, Not(Wall), WallMesh],
  };

  update() {
    this.queries.added.forEach((entity) => {
      this.build(entity);
    });
    this.queries.modified.forEach((entity) => {
      const object3d = entity.get(Object3D).value;
      const mesh = entity.get(WallMesh).value;
      object3d.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
      this.build(entity);

      this.removeCollider(entity);

      // Notify outline to rebuild if necessary
      entity.getByName("Outline")?.modified();
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
      const object3d = entity.get(Object3D).value;
      const mesh = entity.get(WallMesh).value;
      object3d.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
      entity.remove(WallMesh);
    });
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
    const materialOpts = {
      color: wall.color,
      roughness: wall.roughness,
      metalness: wall.metalness,
      emissive: wall.emissive,
    };

    const material = new THREE.MeshStandardMaterial(materialOpts);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    object3d.add(mesh);

    entity.add(WallMesh, { value: mesh });
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

    const collider = world.createCollider(
      colliderDesc,
      rigidBodyRef.value.handle
    );

    entity.add(WallColliderRef, { value: collider });
  }
}
