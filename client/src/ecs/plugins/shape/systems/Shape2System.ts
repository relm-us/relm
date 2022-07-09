import {
  Material,
  Mesh,
  MeshStandardMaterial,
  RepeatWrapping,
  Texture,
} from "three";

import { isBrowser } from "~/utils/isBrowser";

import { Entity, System, Not, Modified, Groups } from "~/ecs/base";
import { Object3DRef } from "~/ecs/plugins/core";
import { Asset, AssetLoaded } from "~/ecs/plugins/asset";

import { Shape2, Shape2Mesh, ShapeHasTexture } from "../components";
import {
  shapeParamsToGeometry,
  toShapeParams,
} from "~/ecs/shared/createShape";

function blank(str: string) {
  return str === undefined || str === null || str === "";
}
export class Shape2System extends System {
  active = isBrowser();

  // Must be after AssetSystem
  order = Groups.Initialization + 10;

  static queries = {
    added: [Shape2, Not(Shape2Mesh)],
    addedAsset: [Shape2, AssetLoaded, Not(ShapeHasTexture)],

    modified: [Modified(Shape2)],
    modifiedAsset: [Shape2, Modified(Asset)],

    removed: [Not(Shape2), Shape2Mesh],
    removedAsset: [Shape2, Not(Asset), ShapeHasTexture],
  };

  update() {
    this.queries.added.forEach((entity) => {
      this.buildWithoutTexture(entity);
    });
    this.queries.addedAsset.forEach((entity) => {
      this.addTexture(entity);
    });

    this.queries.modified.forEach((entity) => {
      this.remove(entity);
      this.buildWithoutTexture(entity);
      if (entity.has(ShapeHasTexture)) {
        this.addTexture(entity);
      }
    });
    this.queries.modifiedAsset.forEach((entity) => {
      if (entity.has(AssetLoaded)) {
        this.addTexture(entity);
      } else {
        entity.maybeRemove(ShapeHasTexture);
      }
    });

    this.queries.removed.forEach((entity) => {
      this.remove(entity);
    });
    this.queries.removedAsset.forEach((entity) => {
      this.removeTexture(entity);
    });
  }

  buildWithoutTexture(entity: Entity) {
    const shape: Shape2 = entity.get(Shape2);

    const material = new MeshStandardMaterial({
      color: shape.color,
      roughness: shape.roughness,
      metalness: shape.metalness,
      emissive: shape.emissive,
    });

    const mesh = this.makeMesh(shape, material);
    entity.add(Shape2Mesh, { value: mesh });
    this.attach(entity);
  }

  addTexture(entity: Entity) {
    const asset: Asset = entity.get(Asset);
    if (asset.kind === "TEXTURE") {
      const spec: Shape2 = entity.get(Shape2);
      const texture: Texture = entity.get(AssetLoaded)?.value;
      const mesh: Shape2Mesh = entity.get(Shape2Mesh);

      (mesh.value.material as MeshStandardMaterial).map = texture;

      texture.repeat.set(spec.textureScale, spec.textureScale);
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;

      entity.add(ShapeHasTexture);
    } else if (asset.kind === null) {
      this.removeTexture(entity);
      console.warn("removing texture", entity.id);
    } else {
      this.removeTexture(entity);
      console.warn("not adding non-texture asset to shape", entity.id);

      // Add ShapeHasTexture so we don't loop infinitely
      entity.add(ShapeHasTexture);
    }
  }

  removeTexture(entity: Entity) {
    const mesh: Shape2Mesh = entity.get(Shape2Mesh);

    (mesh.value.material as MeshStandardMaterial).map = null;

    entity.remove(ShapeHasTexture);
  }

  remove(entity: Entity) {
    const mesh: Mesh = entity.get(Shape2Mesh)?.value;

    if (mesh) {
      this.detach(entity);

      mesh.geometry?.dispose();

      entity.remove(Shape2Mesh);
    }
    entity.maybeRemove(ShapeHasTexture);
  }

  attach(entity: Entity) {
    const object3dref: Object3DRef = entity.get(Object3DRef);

    if (object3dref) {
      const object3d = object3dref.value;

      const child = entity.get(Shape2Mesh).value;
      object3d.add(child);

      // Notify dependencies, e.g. BoundingBox, that object3d has changed
      object3dref.modified();
    }
  }

  detach(entity: Entity) {
    const object3dref: Object3DRef = entity.get(Object3DRef);

    if (object3dref) {
      const object3d = object3dref.value;

      const child = entity.get(Shape2Mesh).value;
      object3d.remove(child);

      // Notify dependencies, e.g. BoundingBox, that object3d has changed
      object3dref.modified();
    }
  }

  makeMesh(shape: Shape2, material: Material) {
    const geometry = shapeParamsToGeometry(
      toShapeParams(shape.kind, shape.size, shape.detail)
    );

    const mesh = new Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;
  }
}
