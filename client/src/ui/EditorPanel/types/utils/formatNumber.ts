export function formatNumber(n, editing, digits = 1) {
  if (typeof n === "string") {
    return n;
  } else if (typeof n === "number") {
    const fixed = n.toFixed(digits);
    if (editing || !(editing && n.toString().length < fixed.length)) {
      return fixed;
    } else {
      return n;
    }
  } else if (n === undefined) {
    return "[undefined]";
  } else {
    console.warn("unknown type of NumberType", n);
    return "[unknown]";
  }
}
