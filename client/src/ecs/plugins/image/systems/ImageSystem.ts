import {
  Object3D,
  PlaneBufferGeometry,
  MeshStandardMaterial,
  Mesh,
  DoubleSide,
} from "three";

import { System, Not, Modified, Groups, Entity } from "~/ecs/base";
import { Queries } from "~/ecs/base/Query";

import { Image, ImageRef, ImageAttached } from "../components";
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

  /**
   * AssetLoaded <-> ImageRef
   * Object3D <-> ImageAttached
   */
  static queries: Queries = {
    missingAsset: [Image, Not(Asset)],

    added: [Image, AssetLoaded, Not(ImageRef)],
    modified: [Modified(Image), AssetLoaded],
    removed: [Not(Image), ImageRef],

    detached: [Object3DRef, ImageRef, Not(ImageAttached)],
    attached: [Object3DRef, Not(ImageRef), ImageAttached],
    dangling: [Not(Object3DRef), ImageRef],
  };

  init({ presentation }) {
    this.presentation = presentation;
  }

  update() {
    this.queries.missingAsset.forEach((entity) => {
      const model = entity.get(Image);
      entity.add(Asset, { texture: model.asset });
    });

    this.queries.added.forEach((entity) => this.build(entity));

    // once ImageRef is removed, Asset & Image will be built again
    this.queries.modified.forEach((entity) => this.remove(entity));

    // since Image is already gone, remove ImageRef and clean up (it won't be built again)
    this.queries.removed.forEach((entity) => this.remove(entity));

    this.queries.detached.forEach((entity) => this.attach(entity));
    this.queries.attached.forEach((entity) => this.detach(entity));
    this.queries.dangling.forEach((entity) => this.remove(entity));
  }

  build(entity: Entity) {
    const spec: Image = entity.get(Image);
    const texture = entity.get(AssetLoaded).value;

    const plane = { width: spec.width, height: spec.height };
    const image = { width: texture.image.width, height: texture.image.height };

    if (spec.fit === "COVER") {
      const cover = this.getCover(plane, image);
      texture.repeat.set(cover.width, cover.height);
      texture.offset.set(cover.x, cover.y);
    } else if (spec.fit === "CONTAIN") {
      const contain = this.getContain(plane, image);
      plane.width = contain.width;
      plane.height = contain.height;
    }

    const mesh = this.makeMesh(plane, texture);

    entity.add(ImageRef, { value: mesh });
  }

  remove(entity: Entity) {
    const mesh = entity.get(ImageRef).value;

    mesh.geometry?.dispose();
    mesh.material?.dispose();
    mesh.dispose?.();

    entity.remove(ImageRef);
    entity.maybeRemove(Asset);
  }

  attach(entity: Entity) {
    const object3dref: Object3DRef = entity.get(Object3DRef);
    const parent = object3dref.value;
    const child = entity.get(ImageRef).value;
    parent.add(child);
    entity.add(ImageAttached, { parent, child });

    // Notifiy dependencies, e.g. BoundingBox, that object3d has changed
    object3dref.modified();
  }

  detach(entity: Entity) {
    const { parent, child } = entity.get(ImageAttached);
    parent.remove(child);
    entity.remove(ImageAttached);

    // Notifiy dependencies, e.g. BoundingBox, that object3d has changed
    entity.get(Object3DRef).modified();
  }

  makeMesh(plane, texture) {
    const geometry = new PlaneBufferGeometry(plane.width, plane.height);
    const material = new MeshStandardMaterial({
      roughness: 0.8,
      metalness: 0,
      transparent: true, // supports png transparency
      map: texture,
      side: DoubleSide,
    });
    const mesh = new Mesh(geometry, material);
    mesh.receiveShadow = true;

    return mesh;
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
    if (planeAspect > imageAspect) plane.width = plane.height * imageAspect;

    // plane is too high, shrink to fit
    if (planeAspect < imageAspect)
      plane.height = (image.height / image.width) * plane.width;

    return contain;
  }

  error(entity, msg) {
    entity.maybeRemove(Image);
    entity.maybeRemove(ImageRef);
    console.warn(`ImageSystem: ${msg}`, entity);
  }
}
