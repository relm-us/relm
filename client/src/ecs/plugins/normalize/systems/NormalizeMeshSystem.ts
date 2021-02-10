import { System, Groups, Not } from "~/ecs/base";
import { Object3D } from "~/ecs/plugins/core";
import { ModelMesh } from "~/ecs/plugins/core";
import { Box3, Vector3 } from "three";
import { NormalizeMesh, NormalizedMesh } from "../components";

export class NormalizeMeshSystem extends System {
  order = Groups.Presentation;

  static queries = {
    added: [ModelMesh, NormalizeMesh, Object3D, Not(NormalizedMesh)],
  };

  update() {
    this.queries.added.forEach((entity) => {
      const object3d = entity.get(ModelMesh).value;
      if (!object3d.parent) return;
      this.normalize(object3d, entity);
      entity.add(NormalizedMesh);
    });
  }

  normalize(object3d, entity) {
    const first = this.getFirstMeshOrGroup(object3d);

    if (first === object3d) {
      first.position.set(0, 0, 0);
      first.scale.set(1, 1, 1);
    } else {
      let child = first;
      while (child !== object3d) {
        child.position.set(0, 0, 0);
        child.scale.set(1, 1, 1);
        child = child.parent;
      }
    }

    if (first.type === "Mesh") {
      first.geometry.center();
    } else if (first.type === "Group") {
      const cent = new Vector3();
      const bbox = new Box3().setFromObject(first);
      bbox.getCenter(cent);
      console.warn(
        entity.name,
        "(Group centering not implemented)",
        "bbox:",
        bbox,
        "center:",
        cent
      );
    }

    const scale = this.getScaleRatio(first);
    first.traverse((obj) => {
      if (obj.type === "Mesh") {
        obj.castShadow = true;
        obj.receiveShadow = true;
        obj.geometry.scale(scale, scale, scale);
      }
    });
  }

  // TODO: Remove this (for reference only)
  normalize2(object3d) {
    const cent = new Vector3();
    const size = new Vector3();
    const bbox = new Box3().setFromObject(object3d);
    bbox.getCenter(cent);
    bbox.getSize(size);

    //Rescale the object to normalized space
    var maxAxis = Math.max(size.x, size.y, size.z);
    object3d.scale.multiplyScalar(1.0 / maxAxis);

    //Now get the updated/scaled bounding box again..
    bbox.setFromObject(object3d);
    bbox.getCenter(cent);
    bbox.getSize(size);

    object3d.position.x = -cent.x;
    object3d.position.y = -cent.y; //0;
    object3d.position.z = -cent.z;
  }

  getFirstMeshOrGroup(object3d) {
    let first = null;
    object3d.traverse((obj) => {
      if (first) return;
      if (obj.type === "Mesh") first = obj;
      if (this.countMeshChildren(obj) > 1) first = obj;
    });
    return first || object3d;
  }

  countMeshChildren(object3d) {
    let count = 0;
    for (const child of object3d.children) {
      if (child.type === "Mesh") count++;
    }
    return count;
  }

  /**
   * Returns a ratio that can be used to multiply by the object's current size
   * so as to scale it up or down to the desired largestSide size.
   *
   * @param {Object3D} object3d The THREE.Object3D whose size is of interest
   * @param {number} largestSide The size of the desired "largest side" after
   * scaling
   */
  getScaleRatio(object3d, largestSide = 1.0) {
    // Remove from hierarchy temporarily so that setFromObject doesn't include
    // ancestor scale
    const cachedParent = object3d.parent;
    object3d.parent.remove(object3d);

    const bbox = new Box3().setFromObject(object3d);

    cachedParent.add(object3d);

    let size = new Vector3();
    bbox.getSize(size);
    let ratio;
    if (size.x > size.y && size.x > size.z) {
      ratio = largestSide / size.x;
    } else if (size.x > size.z) {
      ratio = largestSide / size.y;
    } else {
      ratio = largestSide / size.z;
    }
    return ratio;
  }
}
