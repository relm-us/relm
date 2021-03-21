/**
 * Abuses the meaning of "Set" a bit, and returns the "first" item
 * in the set. Useful when we know there is just one item and need
 * to get it out of the set.
 *
 * @param set A Set
 */
export function first<T>(set: Set<T>): T {
  if (set.size > 0) {
    const item = set.values().next().value;
    return item;
  }
}
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
  let _difference = new Set<T>(setA);
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

/**
 * Set equality - taken from https://stackoverflow.com/posts/31129384/revisions
 *
 * @param {Set} setA
 * @param {Set} setB
 */
export function equals<T>(setA: Set<T>, setB: Set<T>): boolean {
  if (setA.size !== setB.size) return false;
  for (var a of setA) if (!setB.has(a)) return false;
  return true;
}
