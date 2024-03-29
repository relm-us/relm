export function formatNumber(n, editing, digits = 1) {
  if (typeof n === "string") {
    return 0;
    // return n;
  } else if (typeof n === "number") {
    const fixed = n.toFixed(digits);
    if (editing) {
      return n;
    } else {
      if (digits > 1 && fixed.endsWith("0")) {
        return formatNumber(n, editing, digits - 1);
      } else {
        return fixed;
      }
    }
  } else if (n === undefined) {
    return "[undefined]";
  } else {
    console.warn("unknown type of NumberType", n);
    return "[unknown]";
  }
}
