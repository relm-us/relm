import { System, Not, Modified, Groups } from "~/ecs/base";
import * as THREE from "three";

import { IS_BROWSER } from "../utils";
import { Object3D, Model, ModelLoading, ModelMesh } from "../components";
import { Presentation } from "../Presentation";
import { Queries } from "~/ecs/base/Query";
import { traverseMaterials } from "~/utils/traverseMaterials";

let ids = 0;

export class ModelSystem extends System {
  presentation: Presentation;

  active = IS_BROWSER;
  order = Groups.Initialization;

  static queries: Queries = {
    added: [Object3D, Model, Not(ModelLoading), Not(ModelMesh)],
    modified: [Modified(Model)],
    removedObj: [Not(Object3D), ModelMesh],
    removed: [Not(Model), ModelMesh],
  };

  init({ presentation }) {
    this.presentation = presentation;
  }

  update() {
    this.queries.added.forEach((entity) => {
      // console.log(`ModelSystem: ${entity.name} added`)
      this.build(entity);
    });
    this.queries.modified.forEach((entity) => {
      const model = entity.get(Model);
      console.log(
        `ModelSystem: ${entity.name} Model modified`,
        JSON.stringify(model.asset)
      );
      if (entity.has(ModelMesh)) {
        const mesh = entity.get(ModelMesh).value;
        if (mesh) {
          mesh.parent.remove(mesh);
          mesh.dispose?.();
          mesh.geometry?.dispose();
          mesh.material?.dispose();
        }
        entity.remove(ModelMesh);
      }
      if (entity.has(ModelLoading)) entity.remove(ModelLoading);
      this.build(entity);
    });
    this.queries.removedObj.forEach((entity) => {
      console.log(`ModelSystem: ${entity.name} Object3D removed`);
      const mesh = entity.get(ModelMesh).value;
      mesh.parent.remove(mesh);
      mesh.dispose?.();
      mesh.geometry?.dispose();
      mesh.material?.dispose();
      entity.remove(ModelMesh);
    });
    this.queries.removed.forEach((entity) => {
      console.log(`ModelSystem: ${entity.name} Model removed`);
      const mesh = entity.get(ModelMesh).value;
      mesh.parent.remove(mesh);
      mesh.dispose?.();
      mesh.geometry?.dispose();
      mesh.material?.dispose();
      entity.remove(ModelMesh);
    });
  }

  async build(entity) {
    const asset = entity.get(Model).asset;
    if (!asset.url) {
      // attach a blank Object3D to move this entity to
      // a query that won't spam this build function repeatedly
      const mesh = new THREE.Object3D();
      const object3d = entity.get(Object3D).value;
      object3d.add(mesh);
      entity.add(ModelMesh, { value: mesh });
      // console.log(`ModelSystem: ${entity.name} has no asset, using placeholder`)
      return;
    }
    const id = ++ids;
    entity.add(ModelLoading, { id });
    // console.log(`ModelSystem: loading id:${id}`)
    let mesh;
    try {
      mesh = await this.presentation.load(asset.url);
      this.applyMeshSettings(mesh);
    } catch (error) {
      console.error(error);
      return;
    }
    const loadingId = entity.get(ModelLoading)?.id;
    // console.log(`ModelSystem: post-loading id:${loadingId}`)
    // if the id was changed/removed, exit
    if (loadingId !== id) {
      // console.log(`ModelSystem: cancelled id:${id} (id was removed/changed)`)
      return;
    }
    const object3d = entity.get(Object3D)?.value;
    // if there is no longer an Object3D to attach the mesh to, exit
    if (!object3d) {
      // console.log('ModelSystem: entity no longer has Object3D, reverting')
      entity.remove(ModelLoading);
      return;
    }
    // otherwise, all good to continue
    entity.remove(ModelLoading);
    object3d.add(mesh);
    entity.add(ModelMesh, { value: mesh });
  }

  applyMeshSettings(mesh) {
    const encoding = THREE.sRGBEncoding;
    traverseMaterials(mesh, (material) => {
      if (material.map) material.map.encoding = encoding;
      if (material.emissiveMap) material.emissiveMap.encoding = encoding;
      if (material.map || material.emissiveMap) material.needsUpdate = true;
    });
  }
}
