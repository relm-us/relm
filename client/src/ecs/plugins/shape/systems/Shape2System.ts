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

import {
  Shape2,
  Shape2Mesh,
  ShapeNeedsTexture,
  ShapeBuilt,
} from "../components";
import {
  shapeParamsToGeometry,
  shapeToShapeParams,
} from "~/ecs/shared/createShape";

function blank(str: string) {
  return str === undefined || str === null || str === "";
}
export class Shape2System extends System {
  active = isBrowser();
  order = Groups.Initialization;

  static queries = {
    added: [Shape2, Not(ShapeBuilt)],
    addedWithTexture: [Shape2, ShapeNeedsTexture, AssetLoaded, Not(Shape2Mesh)],
    modified: [Modified(Shape2)],
    removed: [Not(Shape2), Shape2Mesh],
  };

  update() {
    this.queries.added.forEach((entity) => {
      this.build(entity);
    });
    this.queries.addedWithTexture.forEach((entity) => {
      this.buildWithTexture(entity);
    });
    this.queries.modified.forEach((entity) => {
      this.remove(entity);

      const shape: Shape2 = entity.get(Shape2);
      const asset: Asset = entity.get(Asset);
      const texture: Texture = entity.get(AssetLoaded)?.value;
      if (!blank(shape.texture.url)) {
        if (texture && shape.texture.url === asset?.value.url) {
          this.buildWithTexture(entity);
        } else {
          this.build(entity);
        }
      } else {
        this.buildWithoutTexture(entity);
      }
    });
    this.queries.removed.forEach((entity) => {
      this.remove(entity);
      entity.maybeRemove(ShapeBuilt);
    });
  }

  build(entity: Entity) {
    const shape: Shape2 = entity.get(Shape2);
    entity.add(ShapeBuilt);

    if (!blank(shape.texture.url)) {
      entity.add(ShapeNeedsTexture);

      let asset: Asset = entity.get(Asset);
      if (asset) {
        asset.value = shape.texture;
        asset.modified();
      } else {
        entity.add(Asset, { kind: "TEXTURE", value: shape.texture });
      }
    } else {
      entity.maybeRemove(Asset);
      this.buildWithoutTexture(entity);
    }
  }

  buildWithTexture(entity: Entity) {
    const spec: Shape2 = entity.get(Shape2);
    const texture: Texture = entity.get(AssetLoaded)?.value;

    if (!texture) {
      console.error("Can't build with null texture", entity.id);
      entity.remove(Shape2);
      return;
    }

    texture.repeat.set(spec.textureScale, spec.textureScale);
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;

    const material = new MeshStandardMaterial({
      roughness: 0.8,
      metalness: 0,
      map: texture,
    });

    const mesh = this.makeMesh(spec, material);
    entity.add(Shape2Mesh, { value: mesh });
    this.attach(entity);
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

  remove(entity: Entity) {
    const mesh: Mesh = entity.get(Shape2Mesh)?.value;

    if (mesh) {
      this.detach(entity);

      mesh.geometry?.dispose();

      entity.remove(Shape2Mesh);
    }
    entity.maybeRemove(ShapeNeedsTexture);
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
      shapeToShapeParams(shape.kind, shape.size, shape.detail)
    );

    const mesh = new Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;
  }
}
