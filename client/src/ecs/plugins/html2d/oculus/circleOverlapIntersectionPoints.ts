import { Circle } from "./types"

/**
 * Calculate the two intersection points between overlapping circles
 * (Taken from: https://jsfiddle.net/SalixAlba/54Fb2/)
 *
 * @param c1 First circle
 * @param c2 Second circle
 * @returns {x1, y1, x2, y2} | null if the circles do not overlap
 */
export function circleOverlapIntersectionPoints(c1: Circle, c2: Circle) {
  const dx = c1.x - c2.x
  const dy = c1.y - c2.y

  const dist_sq = dx * dx + dy * dy
  const dist = Math.sqrt(dist_sq)

  const r1 = c1.diameter / 2
  const r2 = c2.diameter / 2
  if (r1 < 0 || r2 < 0) {
    return null
  } else if (dist > r1 + r2) {
    return null
  } else {
    const c1r_sq = r1 * r1
    const c2r_sq = r2 * r2

    const d = (c1r_sq - c2r_sq + dist_sq) / (2 * dist)
    const h = Math.sqrt(c1r_sq - d * d)

    const dx = c2.x - c1.x
    const dy = c2.y - c1.y

    const dxd = (dx * d) / dist
    const dyd = (dy * d) / dist
    const dxh = (dx * h) / dist
    const dyh = (dy * h) / dist

    const x1 = dxd + dyh + r1
    const y1 = dyd - dxh + r1
    const x2 = dxd - dyh + r1
    const y2 = dyd + dxh + r1

    return { x1, y1, x2, y2 }
  }
}
