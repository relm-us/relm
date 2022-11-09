import { Mesh, MeshStandardMaterial } from "three";

import { System, Not, Modified, Groups } from "~/ecs/base";
import { Object3DRef } from "~/ecs/plugins/core";

import { isBrowser } from "~/utils/isBrowser";

import { Wall, WallMeshRef } from "../components";
import { WallGeometry } from "../WallGeometry";
export class WallSystem extends System {
  active = isBrowser();
  order = Groups.Initialization;

  static queries = {
    added: [Object3DRef, Wall, Not(WallMeshRef)],
    modified: [Object3DRef, Modified(Wall), WallMeshRef],
    removed: [Not(Wall), WallMeshRef],
  };

  update() {
    this.queries.added.forEach((entity) => {
      this.build(entity);
    });

    this.queries.modified.forEach((entity) => {
      this.remove(entity);
      this.build(entity);
    });

    this.queries.removed.forEach((entity) => {
      this.remove(entity);
    });
  }

  build(entity) {
    const wall = entity.get(Wall);
    const object3d = entity.get(Object3DRef).value;
    const geometry = WallGeometry(
      wall.size.x,
      wall.size.y,
      wall.size.z,
      wall.convexity,
      wall.segments
    );

    const material = new MeshStandardMaterial({
      color: wall.color,
      roughness: wall.roughness,
      metalness: wall.metalness,
      emissive: wall.emissive,
    });

    const mesh = new Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    object3d.add(mesh);

    // Notify dependencies, e.g. BoundingBox, that object3d has changed
    entity.get(Object3DRef)?.modified();

    entity.add(WallMeshRef, { value: mesh });
  }

  remove(entity) {
    const ref: WallMeshRef = entity.get(WallMeshRef);
    if (ref) {
      const mesh = ref.value;

      mesh.removeFromParent();

      mesh.geometry.dispose();

      entity.remove(WallMeshRef);
    }
  }
}
