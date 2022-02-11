import { Clickable } from "~/ecs/plugins/clickable";
import { Color } from "three";
import { makeBox } from "./makeBox";

export function makeCard(world, { x = 0, y = 0, z = 0, color = "gray" }) {
  const linearColor = new Color(color);
  linearColor.convertSRGBToLinear();

  const w = 2.0;
  const h = 1.2;
  const d = 0.02;

  const card = makeBox(world, {
    ...{ x, y, z, w, h, d, rx: -1.57 },
    color: `#${linearColor.getHexString()}`,
    name: "Card",
    collider: false,
  }).add(Clickable, {
    action: "FLIP",
  });

  const front = makeBox(world, {
    x: 0,
    y: -h / 2,
    z: 0.03,
    w,
    h,
    d,
    color: `#${new Color("white").getHexString()}`,
    name: "Card Front",
    collider: false,
  });
  front.setParent(card);

  return card;
}
