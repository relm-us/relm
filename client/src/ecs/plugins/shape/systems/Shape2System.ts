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

import { Shape2, Shape2Mesh, Shape2Texture } from "../components";
import { shapeParamsToGeometry, toShapeParams } from "~/ecs/shared/createShape";
import { TEXTURE_PER_WORLD_UNIT } from "~/config/constants";

export class Shape2System extends System {
  active = isBrowser();

  // Must be after AssetSystem
  order = Groups.Initialization + 10;

  static queries = {
    modified: [Modified(Shape2)],
    modifiedAsset: [Modified(Asset), Shape2Texture],

    added: [Shape2, Object3DRef, Not(Shape2Mesh)],
    addedAsset: [Shape2, Shape2Mesh, AssetLoaded, Not(Shape2Texture)],

    removed: [Not(Shape2), Shape2Mesh],
    removedAsset: [Not(Asset), Shape2Texture],
  };

  update() {
    this.queries.modified.forEach((entity) => {
      this.remove(entity);
      this.removeTexture(entity);
    });
    this.queries.modifiedAsset.forEach((entity) => {
      this.removeTexture(entity);
    });

    this.queries.added.forEach((entity) => {
      this.build(entity);
    });
    this.queries.addedAsset.forEach((entity) => {
      const loaded: AssetLoaded = entity.get(AssetLoaded);
      if (loaded.kind === "TEXTURE") this.buildTexture(entity);
      else {
        console.warn("ignoring non-texture asset for shape", entity.id);
        entity.add(Shape2Texture);
      }
    });

    this.queries.removed.forEach((entity) => {
      this.remove(entity);
    });
    this.queries.removedAsset.forEach((entity) => {
      this.removeTexture(entity);
    });
  }

  build(entity: Entity) {
    const shape: Shape2 = entity.get(Shape2);

    const mesh = this.makeMesh(
      shape,
      new MeshStandardMaterial({
        color: shape.color,
        roughness: shape.roughness,
        metalness: shape.metalness,
        emissive: shape.emissive,
      })
    );
    entity.add(Shape2Mesh, { value: mesh });

    // Final step, attach the mesh to the entity's object3d container
    this.attach(entity);
  }

  remove(entity: Entity) {
    this.detach(entity);

    const mesh: Shape2Mesh = entity.get(Shape2Mesh);

    if (mesh) {
      mesh.value.geometry?.dispose();
      entity.remove(Shape2Mesh);
    }
  }

  buildTexture(entity: Entity) {
    const spec: Shape2 = entity.get(Shape2);
    const texture: Texture = entity.get(AssetLoaded).value;
    const mesh: Shape2Mesh = entity.get(Shape2Mesh);

    (mesh.value.material as MeshStandardMaterial).map = texture;

    if (spec.fixedTexture) {
      const w = spec.size.x;
      const h = spec.size.z;
      const tw = texture.image.naturalWidth;
      const th = texture.image.naturalHeight;

      const repeatX = (spec.textureScale * w) / (tw / TEXTURE_PER_WORLD_UNIT);
      const repeatY = (spec.textureScale * h) / (th / TEXTURE_PER_WORLD_UNIT);

      texture.repeat.set(repeatX, repeatY);

      // center it
      texture.offset.set(-((repeatX - 1) / 2), -((repeatY - 1) / 2));
    } else {
      texture.repeat.set(spec.textureScale, spec.textureScale);
    }
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;

    entity.add(Shape2Texture);
  }

  removeTexture(entity: Entity) {
    const mesh: Shape2Mesh = entity.get(Shape2Mesh);
    if (mesh) {
      (mesh.value.material as MeshStandardMaterial).map = null;
    }

    entity.maybeRemove(Shape2Texture);
  }

  attach(entity: Entity) {
    const object3dref: Object3DRef = entity.get(Object3DRef);

    // Attach shape mesh to container object3d
    const mesh: Shape2Mesh = entity.get(Shape2Mesh);
    object3dref.value.add(mesh.value);

    // Notify dependencies, e.g. BoundingBox, that object3d has changed
    object3dref.modified();
  }

  detach(entity: Entity) {
    // Detach shape mesh from container object3d
    const mesh: Shape2Mesh = entity.get(Shape2Mesh);
    mesh?.value.removeFromParent();

    // Notify dependencies, (e.g. collider), that object3d has changed
    const object3dref: Object3DRef = entity.get(Object3DRef);
    object3dref?.modified();
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
