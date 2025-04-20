import { nanoid } from "nanoid"
import { Vector3, Vector2, Color } from "three"

import { CssPlane, Document } from "~/ecs/plugins/css3d"

import { makeBox } from "./makeBox"

export function makeWhiteboard(world, { x = 0, y = 0, z = 0, color = "gray" }) {
  const linearColor = new Color(color)
  linearColor.convertSRGBToLinear()

  const w = 3
  const h = 2
  const d = 0.3

  return makeBox(world, {
    ...{ x, y, z, w, h, d, rx: -0.5 },
    color: `#${linearColor.getHexString()}`,
    name: "Whiteboard",
  })
    .add(Document, {
      docId: nanoid(10), // make a unique whiteboard each time
      editable: true,
      bgColor: "#efefef",
    })
    .add(CssPlane, {
      kind: "ROUNDED",
      circleRadius: 0.1,
      rectangleSize: new Vector2(w - 0.2, h - 0.2),
      scale: 1.0,
      offset: new Vector3(0, 0, d / 2 + 0.05),
    })
}
