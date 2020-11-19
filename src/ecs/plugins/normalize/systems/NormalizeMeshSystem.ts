import { System, Groups, Not } from "hecs";
import { ModelMesh, Object3D } from "hecs-plugin-three";
import { Box3, Vector3 } from "three";
import { NormalizeMesh, NormalizedMesh } from "../components";

export class NormalizeMeshSystem extends System {
  order = Groups.Initialization + 40;

  static queries = {
    new: [ModelMesh, NormalizeMesh, Object3D, Not(NormalizedMesh)],
  };

  update() {
    this.queries.new.forEach((entity) => {
      const object3d = entity.get(ModelMesh).value;
      if (!object3d.parent) return;

      this.normalize(object3d);
      // object3d.parent.scale.copy(parentScale);

      entity.add(NormalizedMesh);
    });
  }

  normalize(object3d) {
    const parentScale = new Vector3().copy(object3d.parent.scale);
    const first = this.getFirstMeshOrGroup(object3d);
    if (first !== object3d) {
      object3d.parent.add(first);
      object3d.parent.remove(object3d);
    }

    first.position.x = 0;
    first.position.y = 0;
    first.position.z = 0;

    if (first.type === "Mesh") {
      first.geometry.center();
    } else {
      console.warn("Not Implemented: center mesh with multiple children");
    }

    const scale = this.getScaleRatio(first);
    first.traverse((obj) => {
      if (obj.type === "Mesh") {
        obj.castShadow = true;
        obj.receiveShadow = true;
        obj.geometry.scale(scale, scale, scale);
      }
    });

    first.scale.copy(parentScale);
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
    const bbox = new Box3().setFromObject(object3d);
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
