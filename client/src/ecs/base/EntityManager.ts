import { World } from "./World";
import { Entity } from "./Entity";

export class EntityManager {
  world: World;
  entities: Map<string, Entity>;
  nextEntityId: number;

  constructor(world) {
    this.world = world;
    this.entities = new Map();
    this.nextEntityId = 0;
  }

  create(name?: string, id?: string) {
    if (!id) id = `${this.world.id}:${this.nextEntityId++}`;
    const entity = new Entity(this.world, name, id);
    return entity;
  }

  getById(id) {
    return this.entities.get(id);
  }

  getByComponentName(componentName) {
    const entities = [];
    this.entities.forEach((entity, _id) => {
      if (entity.hasByName(componentName)) {
        entities.push(entity);
      }
    });
    return entities;
  }

  onEntityActive(entity) {
    this.entities.set(entity.id, entity);
    this.world.emit("entity-active", entity);
  }

  onEntityInactive(entity) {
    this.entities.delete(entity.id);
    this.world.emit("entity-inactive", entity);
  }

  reset() {
    this.entities.forEach((entity) => {
      entity.destroy();
    });
  }
}
