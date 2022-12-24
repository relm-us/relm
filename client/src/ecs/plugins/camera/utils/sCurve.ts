/**
 *
 * @param t a value between 0 and 1 that represents the position on the curve.
 * @param a a value that controls the steepness of the curve.
 * @param b a value that controls the midpoint of the curve.
 * @returns
 */
export function sCurve(t: number, a: number = 10, b: number = 0.5): number {
  return 1 / (1 + Math.exp(-a * (t - b)));
}
