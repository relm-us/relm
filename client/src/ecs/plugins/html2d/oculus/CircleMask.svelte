<script lang="ts">
import type { Cut } from "./types"

export let diameter: number = null
export let cuts: Cut[] = null

type Point = { x: number; y: number }

// A default clip path that clips nothing.
const box: Point[] = [
  { x: -100, y: -100 },
  { x: 200, y: -100 },
  { x: 200, y: 200 },
  { x: -100, y: 200 },
]

/**
 * An array of points that make up the complete clip-path;
 * measured in "percent" units (not pixels) so that the clip-
 * path is invariant to radius and therefore won't need to
 * be re-calculated if radius changes.
 */
let points: Point[] = null

function intersect(from1, to1, from2, to2) {
  var dX = to1.x - from1.x
  var dY = to1.y - from1.y
  var determinant = dX * (to2.y - from2.y) - (to2.x - from2.x) * dY
  if (determinant === 0) return {} // parallel lines
  var lambda = ((to2.y - from2.y) * (to2.x - from1.x) + (from2.x - to2.x) * (to2.y - from1.y)) / determinant
  var gamma = ((from1.y - to1.y) * (to2.x - from1.x) + dX * (to2.y - from1.y)) / determinant

  // check if there is an intersection
  // if (!(0 <= lambda && lambda <= 1) || !(0 <= gamma && gamma <= 1)) return undefined;
  const cross1 = 0 <= lambda && lambda <= 1
  const cross2 = 0 <= gamma && gamma <= 1

  return {
    x: from1.x + lambda * dX,
    y: from1.y + lambda * dY,
    cross: cross1 && cross2,
    cross1,
    cross2,
    lambda,
    gamma,
  }
}

function addLine(l1, l2) {
  const ixs = []
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length
    const p1 = points[i]
    const p2 = points[j]
    const p3 = intersect(l1, l2, p1, p2)
    // If there's an intersection, and it isn't exactly at
    // point p2, then add it to the intersections list
    if (p3.cross && (p2.x !== p3.x || p2.y !== p3.y)) {
      ixs.push({ i, point: { x: p3.x, y: p3.y } })
    }
  }
  switch (ixs.length) {
    case 0:
      console.log("no intersections")
      break
    case 1:
      console.log("partial intersection")
      break
    case 2:
      const p1 = ixs[0].point
      const p2 = ixs[1].point

      // Angle between p1 and p2, with respect to center of circle at x, y
      // See https://stackoverflow.com/a/31334882/159344
      const x = 50,
        y = 50
      const sweep = Math.atan2(p2.y - y, p2.x - x) - Math.atan2(p1.y - y, p1.x - x)

      // console.log("intersection!", sweep, ixs);
      if ((sweep >= 0 && sweep < Math.PI) || sweep < -Math.PI) {
        // regular case
        const nReplace = ixs[1].i - ixs[0].i
        points.splice(ixs[0].i + 1, nReplace, ixs[0].point, ixs[1].point)
      } else {
        // special case: wrap-around
        points = [ixs[0].point, ...points.slice(ixs[0].i + 1, ixs[1].i + 1), ixs[1].point]
      }
      break
    default:
      console.log("error: more than 2 intersections")
  }
}

$: if (diameter && cuts) {
  // Fresh copy of original box coords
  points = box.slice(0)

  const d = diameter / 100
  for (let [l1, l2] of cuts) {
    const l1pct = { x: l1.x / d, y: l1.y / d }
    const l2pct = { x: l2.x / d, y: l2.y / d }

    const ixs = []
    for (let i = 0; i < box.length; i++) {
      const j = (i + 1) % box.length
      const p1 = box[i]
      const p2 = box[j]
      const p3 = intersect(p1, p2, l1pct, l2pct)
      if (p3.cross1 && (p2.x !== p3.x || p2.y !== p3.y)) {
        ixs.push({ i, point: { x: p3.x, y: p3.y } })
      }
    }
    if (ixs.length === 2) {
      addLine(ixs[0].point, ixs[1].point)
    } else {
      console.log("unexpected intersections", l1pct, l2pct, ixs)
    }
  }
} else {
  points = null
}

function clipPathFromPoints(points) {
  if (points) {
    return "polygon(" + points.map(({ x, y }) => `${x}% ${y}%`).join(", ") + ")"
  } else {
    return ""
  }
}

let style
$: style = [`--diameter:${diameter}px`, `clip-path:${clipPathFromPoints(points)}`].join(";")
</script>

<r-circle-mask {style}>
  <slot />
</r-circle-mask>

<style>
  r-circle-mask {
    display: block;
    overflow: hidden;
    width: var(--diameter);
    height: var(--diameter);
    border-radius: 99.91% 99.92% 99.93% 99.94%;
  }
</style>
