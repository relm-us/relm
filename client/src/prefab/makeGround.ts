import { makeBox } from "~/prefab";
import { InvisibleToMouse } from "~/ecs/components/InvisibleToMouse";

const groundSize = {
  w: 1000,
  h: 100,
  d: 100,
};

export function makeGround(world) {
  return makeBox(world, {
    name: "Ground",
    ...groundSize,
    y: -groundSize.h * 0.5,
    z: -groundSize.d * 0.25,
    color: "#55814e",
    dynamic: false,
    interaction: 0x00010003,
  }).add(InvisibleToMouse);
}
