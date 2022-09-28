import { Vector3, Quaternion } from "three";

const vOut = new Vector3(0, 0, 1);
const facing = new Vector3();

export function inFrontOf(
  position: Vector3,
  rotation: Quaternion,
  distance: number = 1.0
) {
  facing
    .copy(vOut)
    .applyQuaternion(rotation)
    .normalize()
    .multiplyScalar(distance);
  return new Vector3().copy(position).add(facing);
}
