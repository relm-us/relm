/**
 * @param object JS object
 * @returns a list of keys whose values are not undefined
 */
export function getDefinedKeys(object): any[] {
  return Object.keys(object)
    .filter((k) => object[k] !== undefined)
    .sort()
}
