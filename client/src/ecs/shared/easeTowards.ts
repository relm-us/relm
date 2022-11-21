import { MathUtils, Vector3 } from "three";

const DECEL_RADIUS = 2;
const DAMPENING_CONSTANT = 5;

const v1 = new Vector3();

export function easeTowards(
  position: Vector3,
  target: Vector3,
  dampening: number = 1
) {
  const distance = position.distanceTo(target);

  let speed = 0;

  if (distance === 0) {
    // arrived; do nothing
  } else {
    speed =
      MathUtils.clamp(distance, 0, DECEL_RADIUS) /
      DECEL_RADIUS /
      (dampening * DAMPENING_CONSTANT);

    // arrow pointing to where we need to go
    v1.copy(target).sub(position);
    if (v1.length() > speed) {
      v1.normalize().multiplyScalar(speed);
    } else {
      // small vector; will soon arrive
    }

    position.add(v1);
  }
}
