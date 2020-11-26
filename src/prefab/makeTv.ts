import { Transform, Quaternion } from "hecs-plugin-core";
import { Euler, Color } from "three";

import { makeBox, makeYoutube } from "~/prefab";

export function makeTv(
  world,
  { x = 0, y = 0, z = 0, embedId = "U_u91SjrEOE", color = "gray" }
) {
  const linearColor = new Color(color);
  linearColor.convertSRGBToLinear();

  const tvBox = makeBox(world, {
    ...{ x: x - 2.5, y: y + 0, z: z + 0, w: 3.2, h: 1.888, d: 0.6 },
    color: `#${linearColor.getHexString()}`,
    name: "BlueBox",
  });
  tvBox.get(Transform).rotation = new Quaternion().setFromEuler(
    new Euler(0, Math.PI / 4, 0)
  );

  const video = makeYoutube(world, {
    x: 0.0,
    y: 0.0,
    z: 0.301,
    embedId,
    frameWidth: 560,
    frameHeight: 315,
    worldWidth: 3,
  });
  video.setParent(tvBox);

  return tvBox;
}
