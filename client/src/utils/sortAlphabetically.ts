export function sortAlphabetically<T>(array: Array<T>, getter: (T) => string) {
  array.sort((a, b) => {
    const A = getter(a).toUpperCase(); // ignore upper and lowercase
    const B = getter(b).toUpperCase(); // ignore upper and lowercase
    if (A < B) return -1;
    if (A > B) return 1;
    return 0;
  });
  return array;
}
