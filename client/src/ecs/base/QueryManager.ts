import type { World } from "./World"
import { type ComponentRequirement, Query } from "./Query"

export class QueryManager {
  world: World
  queries: Array<Query>

  constructor(world) {
    this.world = world
    this.queries = []
  }

  create(Components: Array<ComponentRequirement>) {
    const query = new Query(this.world, Components)
    this.queries.push(query)
    return query
  }

  onArchetypeCreated(archetype) {
    for (let q = 0; q < this.queries.length; q++) {
      const query = this.queries[q]
      query.onArchetypeCreated(archetype)
    }
  }
}
