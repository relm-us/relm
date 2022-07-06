import { Circle } from "./types";

/**
 * Calculate the two intersection points between overlapping circles
 * (Taken from: https://jsfiddle.net/SalixAlba/54Fb2/)
 *
 * @param c1 First circle
 * @param c2 Second circle
 * @returns {x1, y1, x2, y2} | null if the circles do not overlap
 */
export function circleOverlapIntersectionPoints(c1: Circle, c2: Circle) {
  const dx = c1.x - c2.x;
  const dy = c1.y - c2.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (c1.r < 0 || c2.r < 0) {
    return null;
  } else if (dist > c1.r + c2.r) {
    return null;
  } else {
    const c1r_sq = c1.r * c1.r;
    const c2r_sq = c2.r * c2.r;
    const d = (c1r_sq - c2r_sq + dist * dist) / (2 * dist);
    const h = Math.sqrt(c1r_sq - d * d);

    const dx = c2.x - c1.x;
    const dy = c2.y - c1.y;
    const x1 = (dx * d) / dist + (dy * h) / dist + c1.r;
    const y1 = (dy * d) / dist - (dx * h) / dist + c1.r;
    const x2 = (dx * d) / dist - (dy * h) / dist + c1.r;
    const y2 = (dy * d) / dist + (dx * h) / dist + c1.r;

    return { x1, y1, x2, y2 };
  }
}
