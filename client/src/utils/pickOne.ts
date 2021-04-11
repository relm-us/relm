/**
 * Pick one element, at random, from an array
 * @param arr Array of options to pick frome
 * @returns one of the options
 */
export function pickOne(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
