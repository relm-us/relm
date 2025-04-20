import { Vector3 } from "three"

const vA_copy = new Vector3()
export function signedAngleBetweenVectors(vA: Vector3, vB: Vector3, vNormal: Vector3) {
  vA_copy.copy(vA)
  return Math.atan2(vA_copy.cross(vB).dot(vNormal), vA.dot(vB))
}
