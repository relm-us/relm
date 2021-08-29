import { Archetype } from "./Archetype";
import type { World } from "./World";

export class ArchetypeManager {
  world: World;
  archetypes: Record<number, Archetype>;
  initialId: string;

  constructor(world) {
    this.world = world;
    this.archetypes = {};
    this.initialId = null;
  }

  init() {
    this.initialId = "";
    let idSize = this.world.components.count;
    while (idSize) {
      this.initialId += "0";
      idSize--;
    }
    // console.log(`hecs: using ${this.world.components.count} bit archetype ids`)
    this.createArchetype(this.initialId, []);
  }

  onEntityActive(entity) {
    this.addToArchetype(entity);
  }

  onEntityComponentChange(entity, Component, isAdded) {
    if (entity.active) {
      this.removeFromArchetype(entity);
    }

    if (Component.id === undefined) {
      throw Error('Unregistered component');
    }

    entity.archetypeId =
      entity.archetypeId.substring(0, Component.id) +
      (isAdded ? "1" : "0") +
      entity.archetypeId.substring(Component.id + 1);

    if (!this.archetypes[entity.archetypeId]) {
      /**
       * New Archetypes are created on the fly, as they appear.
       * There is a performance penalty for creating them because
       * it requires looping and checking every query, but this
       * isn't an issue as most archetypes are discovered within
       * the first few frames of running a world.
       */
      this.createArchetype(entity.archetypeId, entity.Components);
    }

    if (entity.active) {
      this.addToArchetype(entity);
    }
  }

  onEntityInactive(entity) {
    this.removeFromArchetype(entity);
  }

  addToArchetype(entity) {
    // @todo do we really need to check index here?
    const archetype = this.archetypes[entity.archetypeId];
    const idx = archetype.entities.indexOf(entity);
    if (idx === -1) {
      archetype.entities.push(entity);
    }
  }

  removeFromArchetype(entity) {
    const entities = this.archetypes[entity.archetypeId].entities;
    const idx = entities.indexOf(entity);
    if (idx !== -1) {
      entities.splice(idx, 1);
    }
  }

  createArchetype(id, Components) {
    Components = Components.slice();
    const archetype = new Archetype(this.world, id, Components);
    this.archetypes[archetype.id] = archetype;
    this.world.queries.onArchetypeCreated(archetype);
    return archetype;
  }
}
