import { Transform, Asset } from "hecs-plugin-core";
import { Vector3 } from "three";

import { Renderable, CssPlane } from "~/ecs/plugins/css3d";

import { makeEntity } from "./makeEntity";

export function makeYoutube(
  world,
  { x = 0, y = 0, z = 0, embedId, frameWidth, frameHeight, worldWidth }
) {
  // YouTube Video
  const iframeRatio = frameWidth / frameHeight;
  const rectangleSize = new Vector3(worldWidth, worldWidth / iframeRatio, 0.2);
  const scale = rectangleSize.x / frameWidth;
  const video = makeEntity(world, "Video")
    .add(Transform, {
      position: new Vector3(x, y, z),
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
