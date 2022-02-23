import { Mesh, MeshStandardMaterial, Object3D, RepeatWrapping } from "three";

import { isBrowser } from "~/utils/isBrowser";

import { Entity, System, Not, Modified, Groups } from "~/ecs/base";
import { Object3DRef } from "~/ecs/plugins/core";
import { Asset, AssetLoaded } from "~/ecs/plugins/asset";

import { Shape, ShapeBuilt, ShapeNeedsTexture, ShapeMesh } from "../components";

import { getGeometry } from "../ShapeCache";

function blank(str: string) {
  return str === undefined || str === null || str === "";
}
export class ShapeSystem extends System {
  active = isBrowser();
  order = Groups.Initialization;

  static queries = {
    added: [Shape, Not(ShapeBuilt)],
    addedWithTexture: [ShapeNeedsTexture, AssetLoaded, Not(ShapeMesh)],
    modified: [Modified(Shape)],
    removed: [Not(Shape), ShapeMesh],
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

      const shape = entity.get(Shape);
      const asset = entity.get(Asset);
      const texture = entity.get(AssetLoaded)?.value;
      if (!blank(shape.texture.url)) {
        if (texture && shape.texture.url === asset?.texture.url) {
          this.buildWithTexture(entity);
        } else {
          this.build(entity);
        }
      } else {
        this.buildWithoutTexture(entity);
      }

      // Notify outline to rebuild if necessary
      entity.getByName("Outline")?.modified();
    });
    this.queries.removed.forEach((entity) => {
      this.remove(entity);
      entity.maybeRemove(ShapeBuilt);
    });
  }

  build(entity: Entity) {
    const shape = entity.get(Shape);
    entity.add(ShapeBuilt);

    if (!blank(shape.texture.url)) {
      entity.add(ShapeNeedsTexture);

      let asset = entity.get(Asset);
      if (asset) {
        asset.texture = shape.texture;
        asset.modified();
      } else {
        entity.add(Asset, { texture: shape.texture });
      }
    } else {
      entity.maybeRemove(Asset);
      this.buildWithoutTexture(entity);
    }
  }

  buildWithTexture(entity: Entity) {
    const shape = entity.get(Shape);
    const texture = entity.get(AssetLoaded)?.value;

    if (!texture) {
      console.error("Can't build with null texture", entity.id);
      entity.remove(Shape);
      return;
    }

    texture.repeat.set(shape.textureScale, shape.textureScale);
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;

    const material = new MeshStandardMaterial({
      roughness: 0.8,
      metalness: 0,
      map: texture,
    });

    const mesh = this.makeMesh(shape, material);
    entity.add(ShapeMesh, { value: mesh });
    this.attach(entity);
  }

  buildWithoutTexture(entity: Entity) {
    const shape = entity.get(Shape);

    const material = new MeshStandardMaterial({
      color: shape.color,
      roughness: shape.roughness,
      metalness: shape.metalness,
      emissive: shape.emissive,
    });

    const mesh = this.makeMesh(shape, material);
    entity.add(ShapeMesh, { value: mesh });
    this.attach(entity);
  }

  remove(entity: Entity) {
    const mesh = entity.get(ShapeMesh)?.value;

    if (mesh) {
      this.detach(entity);

      mesh.geometry?.dispose();
      mesh.material?.dispose();
      mesh.dispose?.();

      entity.remove(ShapeMesh);
    }
    entity.maybeRemove(ShapeNeedsTexture);
  }

  attach(entity: Entity) {
    const parent: Object3D = entity.get(Object3DRef)?.value;
    if (!parent) return;
    const child = entity.get(ShapeMesh).value;
    parent.add(child);
  }

  detach(entity: Entity) {
    const child = entity.get(ShapeMesh).value;
    child.removeFromParent();
  }

  makeMesh(shape, material) {
    const geometry = getGeometry(shape);

    if (shape.kind === "CYLINDER" && shape.cylinderSegments <= 6) {
      material.flatShading = true;
    }
    const mesh = new Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;
  }
}
