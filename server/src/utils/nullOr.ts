/**
 * If the first param to fn is null or undefined, skip calling the function and just
 * return null or undefined. Otherwise, call the function.
 *
 * @param {Function} fn
 */
export function nullOr(fn) {
  return (arg) => {
    if (arg === null || arg === undefined) {
      return arg;
    } else {
      return fn(arg);
    }
  };
}
