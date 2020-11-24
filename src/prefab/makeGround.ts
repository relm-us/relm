import { makeBox } from "~/prefab";

const groundSize = {
  w: 1000,
  h: 100,
  d: 100,
};

export function makeGround(world) {
  return makeBox(world, {
    ...groundSize,
    y: -groundSize.h / 2,
    z: -groundSize.d / 2,
    color: "#22bb11",
    dynamic: false,
  });
}
