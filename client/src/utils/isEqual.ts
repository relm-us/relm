export function isEqual(a, b) {
  if (typeof a !== typeof b) {
    return false
  }

  if (a === null && b === null) {
    return true
  }

  if (typeof a === "function") {
    return a.toString() === b.toString()
  }

  if (typeof a === "object") {
    // Check if all of the keys match.
    const keysOfA = Object.keys(a || {})
    const keysOfB = Object.keys(b || {})
    if (keysOfA.length !== keysOfB.length) {
      return false
    }

    for (const key of keysOfA) {
      if (!isEqual(a[key], b[key])) {
        return false
      }
    }

    return true
  }

  return a === b
}
