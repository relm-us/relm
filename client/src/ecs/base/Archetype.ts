import type { World } from "./World"
import type { Entity } from "./Entity"
import type { ComponentClass } from "./Component"

/**
 * An Archetype is an exact, distinct set of components.
 * Entities always belong to exactly one archetype at a time.
 */
export class Archetype {
  world: World
  id: string
  entities: Array<Entity>
  Components: Array<ComponentClass>

  constructor(world, id, Components) {
    this.world = world
    this.id = id
    this.Components = Components
    this.entities = []
  }
}
