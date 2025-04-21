/**
 * Filter and Map an Array in a single loop
 * @param {array} list The list to process
 * @param {function} checker The filtering logic (predicate)
 * @param {function} mapper The transforming logic (mapper)
 */
export function filterMap<A, B>(list: A[], checker: (item: A) => boolean, mapper: (item: A) => B) {
  return list.reduce((acc: B[], current: A) => (checker(current) ? acc.push(mapper(current)) && acc : acc), [])
}
