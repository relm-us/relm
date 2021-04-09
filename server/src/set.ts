/**
 * Set union - taken from MDN
 *
 * @param {Set} setA 
 * @param {Set} setB 
 */
export function union(setA, setB) {
  let _union = new Set(setA)
  for (let elem of setB) {
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
export function difference(setA, setB) {
  let _difference = new Set(setA)
  for (let elem of setB) {
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
export function intersection(setA, setB) {
  let _intersection = new Set()
  for (let elem of setB) {
      if (setA.has(elem)) {
          _intersection.add(elem)
      }
  }
  return _intersection
}
