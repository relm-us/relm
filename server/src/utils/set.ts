/**
 * Set union - taken from MDN
 *
 * @param {Set} setA
 * @param {Set} setB
 */
export function union<T>(setA: Set<T>, setB: Set<T>): Set<T> {
  let _union = new Set(setA);
  for (let elem of setB) {
    _union.add(elem);
  }
  return _union;
}

/**
 * Set difference - taken from MDN
 *
 * @param {Set} setA
 * @param {Set} setB
 */
export function difference<T>(setA: Set<T>, setB: Set<T>): Set<T> {
  let _difference = new Set(setA);
  for (let elem of setB) {
    _difference.delete(elem);
  }
  return _difference;
}

/**
 * Set intersection - taken from MDN
 *
 * @param {Set} setA
 * @param {Set} setB
 */
export function intersection<T>(setA: Set<T>, setB: Set<T>): Set<T> {
  let _intersection = new Set<T>();
  for (let elem of setB) {
    if (setA.has(elem)) {
      _intersection.add(elem);
    }
  }
  return _intersection;
}
