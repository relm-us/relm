import { Color } from "three";

import { makeBox, makeWebPage } from "~/prefab";

export function makeWebBox(
  world,
  { x = 0, y = 0, z = 0, url = "https://google.com?igu=1", color = "gray" }
) {
  const linearColor = new Color(color);
  linearColor.convertSRGBToLinear();

  const box = makeBox(world, {
    ...{ x: x, y: y, z: z, w: 3.2, h: 3.2, d: 0.6 },
    color: `#${linearColor.getHexString()}`,
    name: "Web Box",
  });

  const page = makeWebPage(world, {
    x: 0.0,
    y: 0.0,
    z: 0.301,
    url,
    frameWidth: 560,
    frameHeight: 560,
    worldWidth: 3,
  });
  page.setParent(box);

  return box;
}
