import { Matrix4, MathUtils } from "three"

// Rotate bounding box
export function rotateSkinnedMeshBB(obj) {
  if (obj.isSkinnedMesh) {
    const m = new Matrix4()
    m.makeRotationX(MathUtils.degToRad(-90))
    obj.geometry.boundingBox.applyMatrix4(m)
    obj.geometry.boundingSphere.applyMatrix4(m)
  }
}
