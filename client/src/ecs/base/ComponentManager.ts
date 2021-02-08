import type { World } from "./World";
import type { TypeOfComponent } from "./Component";

export class ComponentManager {
  world: World;
  count: number;
  lastComponentId: number;
  componentsByName: Record<string, TypeOfComponent>;

  constructor(world) {
    this.world = world;
    this.count = 0;
    this.lastComponentId = 0;
    this.componentsByName = {};
  }

  register(Component: TypeOfComponent) {
    if (this.componentsByName[Component.name]) {
      throw new Error(`ECS: component already registered '${Component.name}'`);
    }
    (Component as any).id = this.lastComponentId++;
    this.componentsByName[Component.name] = Component;
    this.count++;
    return this;
  }

  getByName(name: string): TypeOfComponent {
    return this.componentsByName[name];
  }
}
