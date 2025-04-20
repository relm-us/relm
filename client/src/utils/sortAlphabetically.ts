export function sortAlphabetically<T>(array: Array<T>, getter: (T) => string) {
  array.sort((a, b) => {
    let A, B

    try {
      A = getter(a)
    } catch (err) {
      console.trace("sortAlphabetically getter failed")
    }
    if (!A) A = ""
    A = A.toUpperCase()

    try {
      B = getter(b)
    } catch (err) {
      console.trace("sortAlphabetically getter failed")
    }
    if (!B) B = ""
    B = B.toUpperCase()

    if (A < B) return -1
    if (A > B) return 1
    return 0
  })
  return array
}
