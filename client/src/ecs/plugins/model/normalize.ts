import { Box3, Vector3, Matrix4, MathUtils, Object3D } from "three";

export function normalize(object3d: Object3D) {
  const first = getFirstMeshOrGroup(object3d);

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
    // console.warn("Group centering not implemented", name);
  }

  const scale = getScaleRatio(first);
  first.traverse((obj) => {
    if (obj.type === "Mesh") {
      obj.castShadow = true;
      obj.receiveShadow = true;
      obj.geometry.scale(scale, scale, scale);
    }
  });

  return first;
}

function getFirstMeshOrGroup(object3d) {
  let first = null;
  object3d.traverse((obj) => {
    if (first) return;
    if (obj.type === "Mesh") first = obj;
    if (countMeshChildren(obj) > 1) first = obj;
  });
  return first || object3d;
}

function countMeshChildren(object3d) {
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
function getScaleRatio(object3d: Object3D, largestSide = 1.0) {
  // Remove from hierarchy temporarily so that setFromObject doesn't include
  // ancestor scale
  const cachedParent = object3d.parent;
  if (cachedParent) object3d.parent.remove(object3d);

  const bbox = new Box3().setFromObject(object3d);

  if (cachedParent) cachedParent.add(object3d);

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
