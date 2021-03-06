import { Transform, Asset } from "~/ecs/plugins/core";
import { Vector3 } from "three";

import { Renderable, CssPlane } from "~/ecs/plugins/css3d";

import { makeEntity } from "./makeEntity";

export function makeYoutube(
  world,
  {
    x = 0,
    y = 4,
    z = 0,
    yOffset = 0,
    embedId,
    frameWidth,
    frameHeight,
    worldWidth,
  }
) {
  // YouTube Video
  const iframeRatio = frameWidth / frameHeight;
  const rectangleSize = new Vector3(worldWidth, worldWidth / iframeRatio, 0.2);
  const scale = rectangleSize.x / frameWidth;
  const video = makeEntity(world, "Video")
    .add(Transform, {
      position: new Vector3(x, y + yOffset, z),
    })
    .add(Renderable, {
      kind: "YOUTUBE",
      width: frameWidth,
      height: frameHeight,
      embedId: embedId,
      scale,
    })
    .add(CssPlane, {
      kind: "RECTANGLE",
      rectangleSize,
    });
  return video;
}
