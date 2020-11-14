/**
 * When webpack builds Hecs for production, it seems to 'embelish' the
 * Systems' and Components' names, e.g. `PhysicsSystem` becomes
 * `PhysicsSystem_PhysicsSystem`. We de-dupe that name scheme here.
 *
 * @param name - system or component name to unduplicate
 */
export function getUnduplicatedName(name) {
  const parts = name.split("_");
  if (parts.length > 1) {
    return parts[1];
  } else {
    return parts[0];
  }
}
