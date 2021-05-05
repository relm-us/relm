import { BufferGeometry, Mesh, sRGBEncoding, Group } from "three";
import { SkeletonUtils } from "three/examples/jsm/utils/SkeletonUtils";

import { traverseMaterials } from "~/utils/traverseMaterials";

import { System, Not, Modified, Groups, Entity } from "~/ecs/base";
import { Queries } from "~/ecs/base/Query";

import { Model, ModelRef, ModelAttached } from "../components";
import { Presentation, Object3D } from "~/ecs/plugins/core";
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

    detached: [Object3D, ModelRef, Not(ModelAttached)],
    attached: [Not(ModelRef), ModelAttached],
    dangling: [Not(Object3D), ModelRef],
  };

  init({ presentation }) {
    this.presentation = presentation;
  }

  update() {
    this.queries.missingAsset.forEach((entity) => {
      const model = entity.get(Model);
      console.log("add Asset", model.asset);
      entity.add(Asset, { model: model.asset });
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

    const invalidModel = this.invalidModel(scene);
    if (invalidModel) return this.error(entity, "invalid model");

    const clonedScene = SkeletonUtils.clone(scene);
    // TODO: Optimization: move `normalize` to Loader?
    normalize(clonedScene, entity.name);
    this.applyMaterialSettings(clonedScene);

    entity.add(ModelRef, { scene: clonedScene, animations });
  }

  remove(entity: Entity) {
    const { scene, animations } = entity.get(ModelRef);

    scene.geometry?.dispose();
    scene.material?.dispose();
    scene.dispose?.();

    entity.remove(ModelRef);
    entity.maybeRemove(Asset);
  }

  attach(entity: Entity) {
    const parent = entity.get(Object3D).value;
    const scene = entity.get(ModelRef).scene;
    parent.add(scene);
    entity.add(ModelAttached, { parent, scene });
  }

  detach(entity: Entity) {
    const { parent, scene } = entity.get(ModelAttached);
    parent.remove(scene);
    entity.remove(ModelAttached);
  }

  invalidModel(scene: Group): any {
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

  error(entity, msg) {
    entity.maybeRemove(Model);
    entity.maybeRemove(ModelRef);
    console.warn(`ModelSystem: ${msg}`, entity);
  }
}
