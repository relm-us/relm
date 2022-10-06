type OneArgFn<A, B> = (arg: A) => B;

/**
 * If the first param to fn is null or undefined, skip calling the function and just
 * return null or undefined. Otherwise, call the function.
 */
export function nullOr<A, B>(fn: OneArgFn<A, B>): OneArgFn<A, B> {
  return (arg: A) => {
    if (arg === null || arg === undefined) {
      return null;
    } else {
      return fn(arg);
    }
  };
}
