import { System, Not, Modified, Groups } from "~/ecs/base";
import { Object3D } from "~/ecs/plugins/core";
import * as THREE from "three";
import { VertexNormalsHelper } from "three/examples/jsm/helpers/VertexNormalsHelper";

import { isBrowser } from "~/utils/isBrowser";
import { Wall, WallMesh } from "../components";
import { WallGeometry } from "../WallGeometry";

const geometryCache: Map<string, any> = new Map();
export class WallSystem extends System {
  active = isBrowser();
  order = Groups.Initialization;

  static queries = {
    added: [Object3D, Wall, Not(WallMesh)],
    modified: [Object3D, Modified(Wall), WallMesh],
    removedObj: [Not(Object3D), WallMesh],
    removed: [Object3D, Not(Wall), WallMesh],
  };

  update() {
    this.queries.added.forEach((entity) => {
      this.build(entity);
    });
    this.queries.modified.forEach((entity) => {
      const object3d = entity.get(Object3D).value;
      const mesh = entity.get(WallMesh).value;
      object3d.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
      this.build(entity);

      // Notify outline to rebuild if necessary
      entity.getByName("Outline")?.modified();
    });
    this.queries.removedObj.forEach((entity) => {
      const mesh = entity.get(WallMesh).value;
      mesh.parent.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
      entity.remove(WallMesh);
    });
    this.queries.removed.forEach((entity) => {
      const object3d = entity.get(Object3D).value;
      const mesh = entity.get(WallMesh).value;
      object3d.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
      entity.remove(WallMesh);
    });
  }

  build(entity) {
    const wall = entity.get(Wall);
    const object3d = entity.get(Object3D).value;
    const geometry = WallGeometry(
      wall.size.x,
      wall.size.y,
      wall.size.z,
      wall.convexity,
      wall.segments
    );
    const materialOpts = {
      color: wall.color,
      roughness: wall.roughness,
      metalness: wall.metalness,
      emissive: wall.emissive,
      // side: THREE.DoubleSide,
    };
    // console.log("material", materialOpts);
    const material = new THREE.MeshStandardMaterial(materialOpts);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    object3d.add(mesh);

    // const helper = new VertexNormalsHelper(mesh, 2, 0x00ff00);
    // object3d.add(helper);

    entity.add(WallMesh, { value: mesh });
  }
}
