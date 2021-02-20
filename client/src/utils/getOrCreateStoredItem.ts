/**
 * Find a named UUID in local storage, or create one if not found.
 *
 * @param {string} name - name of the local ID, e.g. 'secureId', or 'mouseId'
 */
export function getOrCreateStoredItem(key, create: () => string) {
  let value = localStorage.getItem(key);
  if (!value) {
    value = create();
    localStorage.setItem(key, value);
  }
  return value;
}
