import {
  BufferGeometry,
  Mesh,
  sRGBEncoding,
  Group,
  Matrix4,
  MathUtils,
} from "three";
import { SkeletonUtils } from "three/examples/jsm/utils/SkeletonUtils";

import { traverseMaterials } from "~/utils/traverseMaterials";

import { System, Not, Modified, Groups, Entity } from "~/ecs/base";
import { Queries } from "~/ecs/base/Query";

import { Model, ModelRef, ModelAttached } from "../components";
import { Presentation, Object3DRef } from "~/ecs/plugins/core";
import { Asset, AssetLoaded } from "~/ecs/plugins/asset";

import { normalize } from "../normalize";

/**
 * ModelSystem represents a 3D model, and is responsible for attaching it
 * to a threejs Object3D, contained by an ECS Object3D component (note:
 * they share the same class name but are different--an ECS Object3D is
 * a component that holds a reference to a threejs Object3D).
 *
 * ModelSystem relies on AssetSystem to load the 3d model asset and present
 * it as an `AssetLoaded` component.
 *
 * When an entity has a Model, it need not have an Asset component right
 * away--the ModelSystem will add an Asset component as needed to load the
 * 3D model asset.
 */
export class ModelSystem extends System {
  presentation: Presentation;

  order = Groups.Initialization;

  /**
   * AssetLoaded <-> ModelRef
   * Object3D <-> ModelAttached
   */
  static queries: Queries = {
    missingAsset: [Model, Not(Asset)],

    added: [Model, AssetLoaded, Not(ModelRef)],
    modified: [Modified(Model), AssetLoaded],
    removed: [Not(Model), ModelRef],

    detached: [Object3DRef, ModelRef, Not(ModelAttached)],
    attached: [Object3DRef, Not(ModelRef), ModelAttached],
    dangling: [Not(Object3DRef), ModelRef],
  };

  init({ presentation }) {
    this.presentation = presentation;
  }

  update() {
    this.queries.missingAsset.forEach((entity) => {
      const model = entity.get(Model);
      if (model.asset.url !== "") entity.add(Asset, { model: model.asset });
    });

    this.queries.added.forEach((entity) => this.build(entity));

    // once ModelRef is removed, Asset & Model will be built again
    this.queries.modified.forEach((entity) => this.remove(entity));

    // since Model is already gone, remove ModelRef and clean up (it won't be built again)
    this.queries.removed.forEach((entity) => this.remove(entity));

    this.queries.detached.forEach((entity) => this.attach(entity));
    this.queries.attached.forEach((entity) => this.detach(entity));
    this.queries.dangling.forEach((entity) => this.remove(entity));
  }

  build(entity: Entity) {
    const { scene, animations } = entity.get(AssetLoaded).value;

    const invalidErrorMsg = this.invalidModel(scene);
    if (invalidErrorMsg) return this.error(entity, invalidErrorMsg);

    const clonedScene = SkeletonUtils.clone(scene);

    // TODO: Find a better way to fix bounding box for skinned mesh general case
    if (entity.name === "Avatar")
      clonedScene.traverse(rotateSkinnedMeshBoundingBox);

    clonedScene.traverse((e) => (e.castShadow = true));

    // TODO: Optimization: move `normalize` to Loader?
    normalize(clonedScene);

    this.applyMaterialSettings(clonedScene);

    entity.add(ModelRef, { scene: clonedScene, animations });
  }

  remove(entity: Entity) {
    const { scene } = entity.get(ModelRef);

    scene.geometry?.dispose();
    scene.material?.dispose();
    scene.dispose?.();

    entity.remove(ModelRef);
    entity.maybeRemove(Asset);
  }

  attach(entity: Entity) {
    const object3dref = entity.get(Object3DRef);
    const parent = object3dref.value;
    const child = entity.get(ModelRef).scene;
    parent.add(child);
    entity.add(ModelAttached, { parent, child });

    // Notify dependencies, e.g. BoundingBox, that object3d has changed
    object3dref.modified();
  }

  detach(entity: Entity) {
    const { parent, child } = entity.get(ModelAttached);
    parent.remove(child);
    entity.remove(ModelAttached);

    // Notify dependencies, e.g. BoundingBox, that object3d has changed
    entity.get(Object3DRef).modified();
  }

  invalidModel(scene: Group): any {
    let maybeInvalid = undefined;
    if (!scene) {
      return `Invalid model: no scene`;
    }
    scene.traverse((node) => {
      const geometry: BufferGeometry = (node as Mesh).geometry;
      if (geometry) {
        const attrs = Object.entries(geometry.attributes);
        for (const [attrName, attrVal] of attrs) {
          if (!attrVal) {
            maybeInvalid = `Invalid model: attribute '${attrName}' is null`;
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

  error(entity, msg) {
    entity.maybeRemove(Model);
    entity.maybeRemove(ModelRef);
    console.warn(`ModelSystem: ${msg}`, entity);
  }
}

function rotateSkinnedMeshBoundingBox(obj) {
  if (obj.isSkinnedMesh) {
    let m = new Matrix4();
    m.makeRotationX(MathUtils.degToRad(-90));
    obj.geometry.boundingBox.applyMatrix4(m);
    obj.geometry.boundingSphere.applyMatrix4(m);
  }
}
