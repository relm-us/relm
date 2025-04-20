export function formatNumber(n, editing, digits = 1) {
  if (typeof n === "string") {
    return 0
  }
  if (typeof n === "number") {
    const fixed = n.toFixed(digits)
    if (editing) {
      return n
    }

    if (digits > 1 && fixed.endsWith("0")) {
      return formatNumber(n, editing, digits - 1)
    }

    return fixed
  }
  if (n === undefined) {
    return "[undefined]"
  }
  console.warn("unknown type of NumberType", n)
  return "[unknown]"
}
