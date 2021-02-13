import { makeBox } from "./makeBox";

export function makePileOfBoxes(
  world,
  {
    x = 0,
    y = 5,
    z = 0,
    w = 0.5,
    h = 0.5,
    d = 0.5,
    yOffset = 0,
    count = 10,
    color = "gray",
  }
) {
  const boxes = [];
  for (let i = 0; i < count; i++) {
    const box = makeBox(world, {
      ...{
        x: x + Math.random() * 2 - 1,
        y: y + Math.random() * 5 + yOffset,
        z: z + Math.random() * 2 - 1,
      },
      ...{ w, h, d },
      color,
      name: "GrayBox",
    }).activate();
    boxes.push(box);
  }
  return boxes;
}
