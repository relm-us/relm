/**
 * Set union - taken from MDN
 *
 * @param {Set} setA
 * @param {Set} setB
 */
export function union<T>(setA: Set<T>, setB: Set<T>): Set<T> {
  const _union = new Set(setA)
  for (const elem of setB) {
    _union.add(elem)
  }
  return _union
}

/**
 * Set difference - taken from MDN
 *
 * @param {Set} setA
 * @param {Set} setB
 */
export function difference<T>(setA: Set<T>, setB: Set<T>): Set<T> {
  const _difference = new Set(setA)
  for (const elem of setB) {
    _difference.delete(elem)
  }
  return _difference
}

/**
 * Set intersection - taken from MDN
 *
 * @param {Set} setA
 * @param {Set} setB
 */
export function intersection<T>(setA: Set<T>, setB: Set<T>): Set<T> {
  const _intersection = new Set<T>()
  for (const elem of setB) {
    if (setA.has(elem)) {
      _intersection.add(elem)
    }
  }
  return _intersection
}
