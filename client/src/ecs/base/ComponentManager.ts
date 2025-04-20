import type { World } from "./World"
import type { TypeOfComponent } from "./Component"

export class ComponentManager {
  world: World
  count: number
  lastComponentId: number
  components: Record<string, TypeOfComponent>
  activators: Record<string, TypeOfComponent>

  constructor(world) {
    this.world = world
    this.count = 0
    this.lastComponentId = 0
    this.components = {}
    this.activators = {}
  }

  register(Component: TypeOfComponent) {
    if (this.components[Component.name]) {
      throw new Error(`ECS: component already registered '${Component.name}'`)
    }
    ;(Component as any).id = this.lastComponentId++
    this.components[Component.name] = Component

    const activator = (Component as any).activator
    if (activator) {
      this.activators[activator.name] = Component
    }

    this.count++
    return this
  }

  getByName(name: string): TypeOfComponent {
    return this.components[name]
  }
}
