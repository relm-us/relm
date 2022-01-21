import { Color } from "three";
import { makeBox } from "./makeBox";
import { makeYoutube } from "./makeYoutube";

// The Boy Who Tricked the Devil : 4nZ9gNGZwO0

export function makeTv(
  world,
  { x = 0, y = 0, z = 0, embedId = "U_u91SjrEOE", color = "gray" }
) {
  const linearColor = new Color(color);
  linearColor.convertSRGBToLinear();

  const tvBox = makeBox(world, {
    ...{ x: x, y: y, z: z, w: 3.2, h: 1.888, d: 0.6 },
    color: `#${linearColor.getHexString()}`,
    name: "BlueBox",
  });

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
