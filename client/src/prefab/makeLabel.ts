import { Transform } from "~/ecs/plugins/core";
import { Vector3 } from "three";

import { Renderable, CssPlane } from "~/ecs/plugins/css3d";

import { makeEntity } from "./makeEntity";

export function makeLabel(
  world,
  {
    x = 0,
    y = 1.5,
    z = 0,
    text,
    fontSize,
    frameWidth = 200,
    frameHeight = 200,
    worldWidth = 1,
  }
) {
  const iframeRatio = frameWidth / frameHeight;
  const rectangleSize = new Vector3(worldWidth, worldWidth / iframeRatio, 0.2);
  const scale = rectangleSize.x / frameWidth;
  const label = makeEntity(world, "Label")
    .add(Transform, {
      position: new Vector3(x, y, z),
    })
    .add(Renderable, {
      kind: "LABEL",
      width: frameWidth,
      height: frameHeight,
      scale,
      text,
      fontSize,
    })
    .add(CssPlane, {
      kind: "RECTANGLE",
      rectangleSize,
    });
  return label;
}
