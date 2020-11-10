export function findEntity(world, filter) {
  if (!world) return null;

  for (const [id, entity] of world.entities.entities) {
    if (filter(entity)) return entity;
  }

  return null;
}
