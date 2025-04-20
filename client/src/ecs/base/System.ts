import type { World } from "./World"
import type { Query, ComponentRequirement } from "./Query"
import { Groups } from "./Groups"

export type TypeOfSystem = typeof System

export type SystemClass = typeof System & {
  queries: Record<string, ComponentRequirement>
}

export class System {
  world: World
  queries: Record<string, Query>
  active: boolean
  elapsedTime: number

  order = Groups.Simulation

  static queries: Record<string, any[]>

  constructor(world: World) {
    this.world = world
    this.queries = {}
    this.active = true
    this.createQueries((this.constructor as SystemClass).queries)
  }

  createQueries(queries) {
    for (const queryName in queries) {
      const Components = queries[queryName]
      this.queries[queryName] = this.world.queries.create(Components)
    }
  }

  init(world) {}

  update(delta) {}

  reset() {}
}
