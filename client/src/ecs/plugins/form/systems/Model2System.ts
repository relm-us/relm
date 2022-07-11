import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader";

import { Mesh } from "three";

import { Entity, System, Not, Modified, Groups } from "~/ecs/base";
import { Object3DRef } from "~/ecs/plugins/core";
import { Asset, AssetLoaded } from "~/ecs/plugins/asset";

import { clone } from "~/ecs/shared/SkeletonUtils";

import { Model2, Model2Ref } from "../components";
import { rotateSkinnedMeshBB } from "../utils/rotateSkinnedMeshBB";
import { normalize } from "../utils/normalize";
import { applyMaterialSettings } from "../utils/applyMaterialSettings";

export class Model2System extends System {
  // Must be after AssetSystem
  order = Groups.Initialization + 10;

  static queries = {
    added: [Model2, AssetLoaded, Not(Model2Ref)],
    modifiedAsset: [Model2, Modified(Asset)],
    removed: [Model2Ref, Not(Model2)],
    removedAsset: [Model2Ref, Not(Asset)],
  };

  update() {
    this.queries.added.forEach((entity) => {
      this.build(entity);
    });

    this.queries.modifiedAsset.forEach((entity) => {
      this.remove(entity);
    });

    this.queries.removed.forEach((entity) => {
      this.remove(entity);
    });

    this.queries.removedAsset.forEach((entity) => {
      this.remove(entity);
    });
  }

  build(entity: Entity) {
    const gltf: GLTF = entity.get(AssetLoaded).value;

    const clonedScene = clone(gltf.scene);

    // TODO: Find a better way to fix bounding box for skinned mesh general case
    if (entity.name === "Avatar") clonedScene.traverse(rotateSkinnedMeshBB);

    clonedScene.traverse((e) => (e.castShadow = true));

    // TODO: Optimization: move `normalize` to Loader?
    normalize(clonedScene);

    applyMaterialSettings(clonedScene);

    entity.add(Model2Ref, { value: { ...gltf, scene: clonedScene } });

    this.attach(entity);
  }

  remove(entity: Entity) {
    const ref: Mesh = entity.get(Model2Ref)?.value;

    if (ref) {
      this.detach(entity);

      ref.geometry?.dispose();
    }

    entity.maybeRemove(Model2Ref);
  }

  attach(entity: Entity) {
    const object3dref: Object3DRef = entity.get(Object3DRef);

    if (object3dref) {
      const object3d = object3dref.value;

      const child: GLTF = entity.get(Model2Ref).value;
      object3d.add(child.scene);

      // Notify dependencies (e.g. colliders) that object3d has changed
      object3dref.modified();
    }
  }

  detach(entity: Entity) {
    const object3dref: Object3DRef = entity.get(Object3DRef);

    if (object3dref) {
      const object3d = object3dref.value;

      const child: GLTF = entity.get(Model2Ref).value;
      object3d.remove(child.scene);

      // Notify dependencies (e.g. colliders) that object3d has changed
      object3dref.modified();
    }
  }
}
