import {
  BufferGeometry,
  Mesh,
  sRGBEncoding,
  Object3D as ThreeObject3D,
} from "three";

import { IS_BROWSER } from "../utils";
import { traverseMaterials } from "~/utils/traverseMaterials";

import { System, Not, Modified, Groups } from "~/ecs/base";
import { Queries } from "~/ecs/base/Query";

import { Object3D, Model, ModelLoading, ModelMesh } from "../components";
import { Presentation } from "../Presentation";

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
    if (!asset.url) return this.loadingError(entity, "asset.url empty");

    const id = ++ids;
    entity.add(ModelLoading, { id });

    let scene, clips;
    try {
      const loaded = await this.presentation.loadGltf(asset.url);
      scene = loaded.scene;
      clips = loaded.clips;

      const invalidModel = this.invalidModel(scene);
      if (invalidModel) return this.loadingError(entity, invalidModel);

      this.applyMaterialSettings(scene);
    } catch (error) {
      return this.loadingError(entity, error.toString());
    }

    const loadingId = entity.get(ModelLoading)?.id;
    entity.remove(ModelLoading);

    if (loadingId === id) {
      const object3d = entity.get(Object3D)?.value;
      if (object3d) {
        object3d.add(scene);
        entity.add(ModelMesh, { value: scene, clips });
      }
    } else {
      return this.loadingError(entity, `${id} was cancelled`);
    }
  }

  loadingError(entity, msg) {
    entity.maybeRemove(Model);
    entity.maybeRemove(ModelLoading);
    console.warn(`ModelSystem: ${msg}`, entity);
  }

  invalidModel(scene: ThreeObject3D): any {
    let maybeInvalid = undefined;
    scene.traverse((node) => {
      const geometry: BufferGeometry = (node as Mesh).geometry;
      if (geometry) {
        const attrs = Object.entries(geometry.attributes);
        for (const [attrName, attrVal] of attrs) {
          if (!attrVal) {
            maybeInvalid = `Invalid model--attribute '${attrName}' is null`;
          }
        }
      }
    });
    return maybeInvalid;
  }

  applyMaterialSettings(scene) {
    const encoding = sRGBEncoding;
    traverseMaterials(scene, (material) => {
      if (material.map) material.map.encoding = encoding;
      if (material.emissiveMap) material.emissiveMap.encoding = encoding;
      if (material.map || material.emissiveMap) material.needsUpdate = true;
    });
  }
}
