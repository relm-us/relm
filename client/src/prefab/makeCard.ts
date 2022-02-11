import { Color } from "three";
import { makeBox } from "./makeBox";

export function makeCard(
  world,
  { x = 0, y = 0, z = 0, embedId = "U_u91SjrEOE", color = "gray" }
) {
  const linearColor = new Color(color);
  linearColor.convertSRGBToLinear();

  const w = 2.0;
  const h = 1.2;
  const d = 0.1;

  const card = makeBox(world, {
    ...{ x, y, z, w, h, d, rx: -1.57 },
    color: `#${linearColor.getHexString()}`,
    name: "Card",
    collider: false,
  });

  return card;
}
