import { Vector3, Vector2, Color } from "three"
import { CssPlane, YouTube } from "~/ecs/plugins/css3d"
import { makeBox } from "./makeBox"

export function makeTv(world, { x = 0, y = 0, z = 0, embedId = "U_u91SjrEOE", color = "gray" }) {
  const linearColor = new Color(color)
  linearColor.convertSRGBToLinear()

  const w = 3.2
  const h = 1.888
  const d = 0.3

  return makeBox(world, {
    ...{ x, y, z, w, h, d, rx: -0.2 },
    color: `#${linearColor.getHexString()}`,
    name: "TV",
  })
    .add(YouTube, {
      embedId: embedId,
    })
    .add(CssPlane, {
      kind: "ROUNDED",
      circleRadius: 0.1,
      rectangleSize: new Vector2(w - 0.2, h - 0.2),
      scale: 1.0,
      offset: new Vector3(0, 0, d / 2 + 0.05),
    })
}
