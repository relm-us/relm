import {
  PlaneGeometry,
  MeshStandardMaterial,
  Mesh,
  DoubleSide,
  Texture,
} from "three";

import { System, Not, Modified, Groups, Entity } from "~/ecs/base";
import { Queries } from "~/ecs/base/Query";

import { Image, ImageMesh, ImageTexture } from "../components";
import { Presentation, Object3DRef } from "~/ecs/plugins/core";
import { Asset, AssetLoaded } from "~/ecs/plugins/asset";

type Size = {
  width: number;
  height: number;
};

/**
 * ImageSystem represents a 3D model, and is responsible for attaching it
 * to a threejs Object3D, contained by an ECS Object3D component (note:
 * they share the same class name but are different--an ECS Object3D is
 * a component that holds a reference to a threejs Object3D).
 *
 * ImageSystem relies on AssetSystem to load the 3d model asset and present
 * it as an `AssetLoaded` component.
 *
 * When an entity has a Image, it need not have an Asset component right
 * away--the ImageSystem will add an Asset component as needed to load the
 * 3D model asset.
 */
export class ImageSystem extends System {
  presentation: Presentation;

  order = Groups.Initialization;

  static queries: Queries = {
    modified: [Modified(Image)],
    modifiedAsset: [Modified(Asset), ImageTexture],

    added: [Image, Object3DRef, Not(ImageMesh)],
    addedAsset: [Image, ImageMesh, AssetLoaded, Not(ImageTexture)],

    removed: [Not(Image), ImageMesh],
    removedAsset: [Not(Asset), ImageTexture],
  };

  init({ presentation }) {
    this.presentation = presentation;
  }

  update() {
    this.queries.modified.forEach((entity) => {
      console.log("modified", entity.id);
      this.removeTexture(entity);
      this.remove(entity);
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
        entity.add(ImageTexture);
      }
    });

    this.queries.removedAsset.forEach((entity) => {
      this.removeTexture(entity);
    });
    this.queries.removed.forEach((entity) => {
      this.remove(entity);
    });
  }

  attach(entity: Entity) {
    const object3dref: Object3DRef = entity.get(Object3DRef);

    // Attach shape mesh to container object3d
    const mesh: ImageMesh = entity.get(ImageMesh);
    object3dref.value.add(mesh.value);

    // Notify dependencies, e.g. BoundingBox, that object3d has changed
    object3dref.modified();
  }

  detach(entity: Entity) {
    // Detach shape mesh from container object3d
    const mesh: ImageMesh = entity.get(ImageMesh);
    mesh?.value.removeFromParent();

    // Notify dependencies, (e.g. collider), that object3d has changed
    const object3dref: Object3DRef = entity.get(Object3DRef);
    object3dref?.modified();
  }

  build(entity: Entity, overrideWidth?: number, overrideHeight?: number) {
    const spec: Image = entity.get(Image);

    const plane = {
      width: overrideWidth ?? spec.width,
      height: overrideHeight ?? spec.height,
    };

    const mesh = this.buildMesh(plane);

    entity.add(ImageMesh, { value: mesh });

    this.attach(entity);
  }

  buildMesh(size: { width: number; height: number }) {
    const geometry = new PlaneGeometry(size.width, size.height);
    const material = new MeshStandardMaterial({
      roughness: 0.8,
      metalness: 0,
      transparent: true, // supports png transparency
      side: DoubleSide,
    });
    const mesh = new Mesh(geometry, material);
    mesh.receiveShadow = true;

    return mesh;
  }

  buildTexture(entity: Entity) {
    const spec: Image = entity.get(Image);
    const texture: Texture = entity.get(AssetLoaded).value;
    let mesh: ImageMesh = entity.get(ImageMesh);

    const image = { width: texture.image.width, height: texture.image.height };
    const plane = { width: spec.width, height: spec.height };

    this.remove(entity);

    if (spec.fit === "COVER") {
      const cover = this.getCover(plane, image);
      texture.repeat.set(cover.width, cover.height);
      texture.offset.set(cover.x, cover.y);

      this.build(entity);
    } else if (spec.fit === "CONTAIN") {
      const contain = this.getContain(plane, image);

      texture.repeat.set(1, 1);
      texture.offset.set(0, 0);
      this.build(entity, contain.width, contain.height);
    }

    mesh = entity.get(ImageMesh);

    (mesh.value.material as MeshStandardMaterial).map = texture;

    entity.add(ImageTexture);
  }

  remove(entity: Entity) {
    this.detach(entity);

    const mesh: ImageMesh = entity.get(ImageMesh);

    if (mesh) {
      mesh.value.geometry?.dispose();
      entity.remove(ImageMesh);
    }
  }

  removeTexture(entity: Entity) {
    const mesh: ImageMesh = entity.get(ImageMesh);
    if (mesh) {
      (mesh.value.material as MeshStandardMaterial).map = null;
    }

    entity.maybeRemove(ImageTexture);
  }

  /**
   * COVER: the image will expand to ensure it fits exactly
   * the size specified. When the aspect ratio of the plane
   * and the image are different, this results in some of the
   * image being cropped off the vertical/horizontal edges.
   */
  getCover(plane: Size, image: Size): Size & { x: number; y: number } {
    const planeAspect = plane.width / plane.height;
    const imageAspect = image.width / image.height;

    let yScale = 1;
    let xScale = planeAspect / imageAspect;
    if (xScale > yScale) {
      xScale = 1;
      yScale = imageAspect / planeAspect;
    }

    return {
      width: xScale,
      height: yScale,
      x: (1 - xScale) / 2,
      y: (1 - yScale) / 2,
    };
  }

  /**
   * CONTAIN: the image will fit inside the size specified.
   * If the specified ratio and image ratio are different, the
   * plane will be shrunk horizontally or vertically to match
   * the image.
   */
  getContain(plane: Size, image: Size): Size {
    const contain = {
      width: plane.width,
      height: plane.height,
    };

    const planeAspect = plane.width / plane.height;
    const imageAspect = image.width / image.height;

    // plane is too wide, shrink to fit
    if (planeAspect > imageAspect) contain.width = contain.height * imageAspect;

    // plane is too high, shrink to fit
    if (planeAspect < imageAspect)
      contain.height = (image.height / image.width) * contain.width;

    return contain;
  }
}
