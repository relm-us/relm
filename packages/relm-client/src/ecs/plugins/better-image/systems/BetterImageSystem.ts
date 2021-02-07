import { System, Not, Modified, Groups } from "hecs";
import * as THREE from "three";

import { BetterImage, BetterImageLoader, BetterImageMesh } from "../components";
import { Object3D } from "hecs-plugin-three";

let loaderIds = 0;

export class BetterImageSystem extends System {
  order = Groups.Initialization;

  static queries = {
    added: [
      Object3D,
      BetterImage,
      Not(BetterImageLoader),
      Not(BetterImageMesh),
    ],
    unbuilt: [Object3D, BetterImage, BetterImageLoader],
    modified: [Object3D, Modified(BetterImage)],
    removedObj: [Not(Object3D), BetterImageMesh],
    removed: [Not(BetterImage), BetterImageMesh],
  };

  update() {
    this.queries.added.forEach((entity) => {
      this.load(entity);
    });
    this.queries.unbuilt.forEach((entity) => {
      const loader = entity.get(BetterImageLoader);
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
    const { loadTexture } = this.world.presentation;
    const url = entity.get(BetterImage).asset.url;
    if (!url) {
      this.cleanup(entity);
      return;
    }
    const loader =
      entity.get(BetterImageLoader) ||
      entity.add(BetterImageLoader, undefined, true);
    loader.id = ++loaderIds;
    try {
      loader.texture = await loadTexture(url);
    } catch (err) {
      console.warn("Unable to load asset for BetterImage:", url, entity.id);
      if (entity.has(BetterImageLoader)) {
        entity.remove(BetterImage);
        entity.remove(BetterImageLoader);
      }
    }
  }

  build(entity) {
    const spec = entity.get(BetterImage);
    const object3d = entity.get(Object3D).value;
    const texture = entity.get(BetterImageLoader).texture;
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
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = true;
    // mesh.castShadow = false;
    object3d.add(mesh);
    if (entity.has(BetterImageMesh)) {
      const component = entity.get(BetterImageMesh);
      component.value.parent.remove(component.value);
      component.value.geometry.dispose();
      component.value.material.map?.dispose();
      component.value.material.dispose();
      component.value = mesh;
      component.modified();
    } else {
      entity.add(BetterImageMesh, { value: mesh });
    }
    entity.remove(BetterImageLoader);
  }

  cleanup(entity) {
    if (entity.has(BetterImageMesh)) {
      const mesh = entity.get(BetterImageMesh).value;
      mesh.parent.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.map?.dispose();
      mesh.material.dispose();
      entity.remove(BetterImageMesh);
    }
  }
}
