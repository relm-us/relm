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

import {
  Shape3,
  ShapeMesh,
  ShapeTexture,
  ShapeAssetLoaded,
} from "../components";
import { shapeParamsToGeometry, toShapeParams } from "~/ecs/shared/createShape";
import { TEXTURE_PER_WORLD_UNIT } from "~/config/constants";

export class ShapeSystem extends System {
  active = isBrowser();

  // Must be after AssetSystem
  order = Groups.Initialization + 10;

  static queries = {
    modified: [Modified(Shape3)],

    added: [Shape3, Object3DRef, Not(ShapeMesh)],
    addedAsset: [Shape3, ShapeMesh, ShapeAssetLoaded, Not(ShapeTexture)],

    removedMesh: [Not(Shape3), ShapeMesh],
    removedTexture: [Not(Shape3), ShapeTexture],
  };

  update() {
    this.queries.modified.forEach((entity) => {
      this.remove(entity);
      this.removeTexture(entity);
    });

    this.queries.added.forEach((entity) => {
      this.build(entity);
    });

    this.queries.addedAsset.forEach((entity) => {
      this.buildTexture(entity);
    });

    this.queries.removedMesh.forEach((entity) => {
      this.remove(entity);
    });
    this.queries.removedTexture.forEach((entity) => {
      this.removeTexture(entity);
    });
  }

  build(entity: Entity) {
    const shape: Shape3 = entity.get(Shape3);

    const mesh = this.makeMesh(
      shape,
      new MeshStandardMaterial({
        color: shape.color,
        roughness: shape.roughness,
        metalness: shape.metalness,
        emissive: shape.emissive,
      })
    );
    entity.add(ShapeMesh, { value: mesh });

    // Final step, attach the mesh to the entity's object3d container
    this.attach(entity);
  }

  remove(entity: Entity) {
    this.detach(entity);

    const mesh: ShapeMesh = entity.get(ShapeMesh);

    if (mesh) {
      mesh.value.geometry?.dispose();
      entity.remove(ShapeMesh);
    }
  }

  buildTexture(entity: Entity) {
    const spec: Shape3 = entity.get(Shape3);
    const texture: Texture = entity.get(ShapeAssetLoaded).value;
    const mesh: ShapeMesh = entity.get(ShapeMesh);

    if (!texture) {
      console.error("Can't build texture; texture is null", entity.id, spec.asset.url)
      return
    }

    (mesh.value.material as MeshStandardMaterial).map = texture;

    if (spec.fixedTexture) {
      const tw = texture.image.naturalWidth;
      const th = texture.image.naturalHeight;

      let w, h;
      if (spec.kind === "BOX") {
        w = spec.size.x;
        h = spec.size.z;
      } else {
        w = spec.size.x; // radius
        h = spec.size.x; // radius
      }

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

    texture.rotation = (spec.textureRotate / 180) * Math.PI;

    entity.add(ShapeTexture);
  }

  removeTexture(entity: Entity) {
    const mesh: ShapeMesh = entity.get(ShapeMesh);
    if (mesh) {
      (mesh.value.material as MeshStandardMaterial).map = null;
    }

    entity.maybeRemove(ShapeTexture);
  }

  attach(entity: Entity) {
    const object3dref: Object3DRef = entity.get(Object3DRef);

    // Attach shape mesh to container object3d
    const mesh: ShapeMesh = entity.get(ShapeMesh);
    object3dref.value.add(mesh.value);

    // Notify dependencies, e.g. BoundingBox, that object3d has changed
    object3dref.modified();
  }

  detach(entity: Entity) {
    // Detach shape mesh from container object3d
    const mesh: ShapeMesh = entity.get(ShapeMesh);
    mesh?.value.removeFromParent();

    // Notify dependencies, (e.g. collider), that object3d has changed
    const object3dref: Object3DRef = entity.get(Object3DRef);
    object3dref?.modified();
  }

  makeMesh(shape: Shape3, material: Material) {
    const geometry = shapeParamsToGeometry(
      toShapeParams(shape.kind, shape.size, shape.detail)
    );

    const mesh = new Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;
  }
}
