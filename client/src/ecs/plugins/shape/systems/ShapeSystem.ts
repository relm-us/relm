import { Mesh, MeshStandardMaterial, RepeatWrapping } from "three";

import { isBrowser } from "~/utils/isBrowser";

import {
  Entity,
  System,
  Not,
  Modified,
  Groups,
  StateComponent,
} from "~/ecs/base";
import { Object3D } from "~/ecs/plugins/core";
import { Asset, AssetLoaded } from "~/ecs/plugins/asset";

import { Shape, ShapeMesh, ShapeAttached } from "../components";

import { getGeometry } from "../ShapeCache";

class ShapeWithTexture extends StateComponent {}
class ShapeWithoutTexture extends StateComponent {}

function blank(str: string) {
  return str === undefined || str === null || str === "";
}
export class ShapeSystem extends System {
  active = isBrowser();
  order = Groups.Initialization;

  static queries = {
    added: [Shape, Not(ShapeWithTexture), Not(ShapeWithoutTexture)],
    addedWithTexture: [Shape, ShapeWithTexture, AssetLoaded],
    addedWithoutTexture: [Shape, ShapeWithoutTexture],
    modified: [Modified(Shape)],
    removed: [Not(Shape), ShapeMesh],

    attachable: [Object3D, ShapeMesh, Not(ShapeAttached)],
    detachable: [Not(ShapeMesh), ShapeAttached],
  };

  update() {
    this.queries.added.forEach((entity) => {
      this.build(entity);
    });
    this.queries.addedWithTexture.forEach((entity) => {
      this.buildWithTexture(entity);
    });
    this.queries.addedWithoutTexture.forEach((entity) => {
      this.buildWithoutTexture(entity);
    });
    this.queries.modified.forEach((entity) => {
      entity.maybeRemove(ShapeMesh);

      // Notify outline to rebuild if necessary
      entity.getByName("Outline")?.modified();
    });
    this.queries.removed.forEach((entity) => {
      this.remove(entity);
    });

    this.queries.attachable.forEach((entity) => this.attach(entity));
    this.queries.detachable.forEach((entity) => {
      this.detach(entity);
    });
  }

  build(entity: Entity) {
    const shape = entity.get(Shape);
    console.log("build shape", shape);
    if (!blank(shape.texture.url) && !entity.has(ShapeWithTexture)) {
      console.log("build ShapeWithTexture", shape.texture.url);
      entity.add(ShapeWithTexture);

      let asset = entity.get(Asset);
      if (asset) {
        asset.texture = shape.texture;
        asset.modified();
      } else {
        entity.add(Asset, { texture: shape.texture });
      }
    } else if (!entity.has(ShapeWithoutTexture)) {
      console.log("build ShapeWithoutTexture", entity.has(Asset));
      entity.maybeRemove(Asset);
      entity.add(ShapeWithoutTexture);
    }
  }

  buildWithTexture(entity: Entity) {
    const shape = entity.get(Shape);
    const texture = entity.get(AssetLoaded).value;

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
  }

  remove(entity: Entity) {
    const mesh = entity.get(ShapeMesh)?.value;

    if (mesh) {
      mesh.geometry?.dispose();
      mesh.material?.dispose();
      mesh.dispose?.();

      entity.remove(ShapeMesh);
    }
    entity.maybeRemove(ShapeWithTexture);
    entity.maybeRemove(ShapeWithoutTexture);
  }

  attach(entity: Entity) {
    const parent = entity.get(Object3D).value;
    const child = entity.get(ShapeMesh).value;
    parent.add(child);
    entity.add(ShapeAttached, { parent, child });
  }

  detach(entity: Entity) {
    const { parent, child } = entity.get(ShapeAttached);
    parent.remove(child);
    entity.remove(ShapeAttached);
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
