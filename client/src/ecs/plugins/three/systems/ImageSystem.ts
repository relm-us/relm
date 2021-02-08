import { System, Not, Modified, Groups } from "~/ecs/base";
import * as THREE from "three";

import { IS_BROWSER } from "../utils";
import { Image, ImageLoader, ImageMesh, Object3D } from "../components";
import { Queries } from "~/ecs/base/Query";

let loaderIds = 0;

export class ImageSystem extends System {
  active = IS_BROWSER;
  order = Groups.Initialization;

  static queries: Queries = {
    added: [Object3D, Image, Not(ImageLoader), Not(ImageMesh)],
    unbuilt: [Object3D, Image, ImageLoader],
    modified: [Object3D, Modified(Image)],
    removedObj: [Not(Object3D), ImageMesh],
    removed: [Not(Image), ImageMesh],
  };

  update() {
    this.queries.added.forEach((entity) => {
      this.load(entity);
    });
    this.queries.unbuilt.forEach((entity) => {
      const loader = entity.get(ImageLoader);
      if (!loader.texture) return;
      this.build(entity);
    });
    this.queries.modified.forEach((entity) => {
      this.load(entity);
    });
    this.queries.removedObj.forEach((entity) => {
      this.cleanup(entity);
    });
    this.queries.removed.forEach((entity) => {
      this.cleanup(entity);
    });
  }

  async load(entity) {
    const { loadTexture } = (this.world as any).presentation;
    const url = entity.get(Image).asset.url;
    if (!url) {
      if (entity.has(ImageMesh)) this.cleanup(entity);
      return;
    }
    const loader =
      entity.get(ImageLoader) || entity.add(ImageLoader, undefined, true);
    loader.id = ++loaderIds;
    loader.texture = await loadTexture(url);
  }

  build(entity) {
    const spec = entity.get(Image);
    const object3d = entity.get(Object3D).value;
    const texture = entity.get(ImageLoader).texture;
    let planeWidth = spec.width;
    let planeHeight = spec.height;

    const imageWidth = texture.image.width;
    const imageHeight = texture.image.height;

    const planeAspect = planeWidth / planeHeight;
    const imageAspect = imageWidth / imageHeight;

    // Cover: the image will expand to ensure it fits exactly
    // the size specified. When the aspect ratio of the plane
    // and the image are different, this results in some of the
    // image being cropped off the vertical/horizontal edges.
    if (spec.fit === "COVER") {
      let yScale = 1;
      let xScale = planeAspect / imageAspect;
      if (xScale > yScale) {
        xScale = 1;
        yScale = imageAspect / planeAspect;
      }
      texture.repeat.set(xScale, yScale);
      texture.offset.set((1 - xScale) / 2, (1 - yScale) / 2);
    }

    // Contain: the image will fit inside the size specified.
    // If the specified ratio and image ratio are different, the
    // plane will be shrunk horizontally or vertically to match
    // the image.
    if (spec.fit === "CONTAIN") {
      if (planeAspect > imageAspect) {
        // plane is too wide, shrink to fit
        planeWidth = planeHeight * imageAspect;
      }
      if (planeAspect < imageAspect) {
        // plane is too high, shrink to fit
        planeHeight = (imageHeight / imageWidth) * planeWidth;
      }
    }

    const geometry = new THREE.PlaneBufferGeometry(planeWidth, planeHeight);
    const material = new THREE.MeshStandardMaterial({
      roughness: 0.8,
      metalness: 0,
      transparent: true, // supports png transparency
      map: texture,
    });
    const mesh = new THREE.Mesh(geometry, material);
    object3d.add(mesh);
    if (entity.has(ImageMesh)) {
      const component = entity.get(ImageMesh);
      component.value.parent.remove(component.value);
      component.value.geometry.dispose();
      component.value.material.map?.dispose();
      component.value.material.dispose();
      component.value = mesh;
      component.modified();
    } else {
      entity.add(ImageMesh, { value: mesh });
    }
    entity.remove(ImageLoader);
  }

  cleanup(entity) {
    const mesh = entity.get(ImageMesh).value;
    mesh.parent.remove(mesh);
    mesh.geometry.dispose();
    mesh.material.map?.dispose();
    mesh.material.dispose();
    entity.remove(ImageMesh);
  }
}
