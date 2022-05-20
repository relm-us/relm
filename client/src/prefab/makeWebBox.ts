import { Vector2, Vector3, Color } from "three";

import { CssPlane, WebPage } from "~/ecs/plugins/css3d";

import { makeBox } from "./makeBox";

export function makeWebBox(
  world,
  {
    x = 0,
    y = 2.3,
    z = 0,
    w = 3.2,
    h = 3.2,
    d = 0.6,
    yOffset = 0,
    url = "https://google.com?igu=1",
    color = "gray",
  }
) {
  const linearColor = new Color(color);
  linearColor.convertSRGBToLinear();

  const box = makeBox(world, {
    ...{ x, y: y + yOffset, z, w, h, d },
    color: `#${linearColor.getHexString()}`,
    name: "WebPage",
  })
    .add(WebPage, { url })
    .add(CssPlane, {
      kind: "RECTANGLE",
      rectangleSize: new Vector2(w - 0.2, h - 0.2),
      scale: 1.0,
      offset: new Vector3(0, 0, d / 2 + 0.05),
    });

  return box;
}
