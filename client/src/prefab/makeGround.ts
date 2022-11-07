import { Color, Vector3 } from "three";

import { Transform } from "~/ecs/plugins/core";
import { Collider2 } from "~/ecs/plugins/collider";
import { Shape2 } from "~/ecs/plugins/shape";
import { NonInteractive } from "~/ecs/plugins/non-interactive";

import { makeEntity } from "./makeEntity";

export function makeGround(world, { x = 0, y = 0, z = 0, h = 1 }) {
  const color = new Color("#55814e");

  return makeEntity(world, "Ground")
    .add(Transform, { position: new Vector3(x, y - h / 2, z) })
    .add(Shape2, {
      kind: "CYLINDER",
      size: new Vector3(30, h, 1),
      color: "#" + color.getHexString(),
      detail: 1,
      metalness: 0.2,
      roughness: 0.8,
      emissive: "#000000",
    })
    .add(Collider2, {
      kind: "GROUND",
      shape: "CYLINDER",
      size: new Vector3(30, h, 1),
    })
    .add(NonInteractive);
}
