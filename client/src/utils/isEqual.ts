export function isEqual(a, b) {
  if (typeof a !== typeof b) {
    return false;
  }

  if (typeof a === "function") {
    return a.toString() === b.toString();
  } else if (typeof a === "object") {
    // null is treated as an object in JS
    if ((a === null && b !== null) || (a !== null && b === null)) {
      return false;
    }

    // Check if all of the keys match.
    const keysOfA = Object.keys(a);
    const keysOfB = Object.keys(b);
    if (keysOfA.length !== keysOfB.length) {
      return false;
    }

    for (const key of keysOfA) {
      if (!isEqual(a[key], b[key])) {
        return false;
      }
    }

    return true;
  } else {
    return a === b;
  }
}