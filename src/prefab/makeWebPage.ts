import { Transform } from "hecs-plugin-core";
import { Vector3 } from "three";

import { Renderable, CssPlane } from "~/ecs/plugins/css3d";

import { makeEntity } from "./makeEntity";

export function makeWebPage(
  world,
  { x = 0, y = 0, z = 0, url, frameWidth, frameHeight, worldWidth }
) {
  // Web Page
  const iframeRatio = frameWidth / frameHeight;
  const rectangleSize = new Vector3(worldWidth, worldWidth / iframeRatio, 0.2);
  const scale = rectangleSize.x / frameWidth;
  const page = makeEntity(world, "Web Page")
    .add(Transform, {
      position: new Vector3(x, y, z),
    })
    .add(Renderable, {
      kind: "WEB_PAGE",
      width: frameWidth,
      height: frameHeight,
      url,
      scale,
    })
    .add(CssPlane, {
      kind: "RECTANGLE",
      rectangleSize,
    });
  return page;
}
