import { nanoid } from "nanoid";

export function makeEntity(world, name: string, id?) {
  return world.entities.create(name, id ?? nanoid());
}
