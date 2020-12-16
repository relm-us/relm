import { nanoid } from "nanoid";

export function makeEntity(world, name: string) {
  return world.entities.create(name, nanoid());
}
