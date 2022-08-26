export function getWithDefault<K extends string, V>(
  map: Map<K, V>,
  key: K,
  defaultFn: () => V
): V {
  if (map.has(key)) {
    return map.get(key);
  } else {
    const value = defaultFn();
    map.set(key, value);
    return value;
  }
}
