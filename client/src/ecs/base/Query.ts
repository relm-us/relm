import { World } from "./World";
import { Archetype } from "./Archetype";
import { Component, ComponentClass } from "./Component";
import { Entity } from "./Entity";

export type Predicate = {
  Component: typeof Component;
  isNot?: boolean;
  isModified?: boolean;
};

export type ComponentRequirement = typeof Component | Predicate;

export type Queries = Record<string, Array<ComponentRequirement>>;

export class Query {
  world: World;
  archetypes: Array<Archetype>;
  Components: Array<ComponentRequirement>;
  Modified: Array<typeof Component>;

  constructor(world: World, Components: Array<ComponentRequirement>) {
    this.world = world;
    this.Components = Components;
    this.Modified = [];
    this.archetypes = [];

    for (let i = 0; i < Components.length; i++) {
      const maybePredicate = Components[i] as Predicate;
      if (maybePredicate.isModified) {
        this.Modified.push(maybePredicate.Component);
      }
    }

    for (const archetypeId in this.world.archetypes.archetypes) {
      const archetype = this.world.archetypes.archetypes[archetypeId];
      if (this.matchesArchetype(archetype)) {
        this.archetypes.push(archetype);
      }
    }
  }

  isModified(entity) {
    for (let i = 0; i < this.Modified.length; i++) {
      const Component = this.Modified[i];
      const modifiedTick = entity.get(Component).modifiedUntilSystemTick;
      const systemTick = this.world.systems.tick;
      if (modifiedTick >= systemTick) {
        return true;
      }
    }
    return false;
  }

  forEach(callback: (entity: Entity) => void) {
    if (this.Modified.length) {
      this._forEachModified(callback);
    } else {
      this._forEach(callback);
    }
  }

  _forEachModified(callback) {
    // archetypes are iterated in reverse to exclude any newly
    // spawned archetypes created during the current loop.
    // this also protects against an entity having callback() called more
    // than once due to his archetype changing to the newly spawned archetype.
    for (let a = this.archetypes.length - 1; a >= 0; --a) {
      const entities = this.archetypes[a].entities;

      // array is iterated in reverse so that if an entity is removed from
      // it during iteration it continues to run
      for (let e = entities.length - 1; e >= 0; --e) {
        const entity = entities[e];
        if (this.isModified(entity)) callback(entity);
      }
    }
  }

  _forEach(callback) {
    // archetypes are iterated in reverse to exclude any newly
    // spawned archetypes created during the current loop.
    for (let a = this.archetypes.length - 1; a >= 0; --a) {
      const entities = this.archetypes[a].entities;

      // array is iterated in reverse so that if an entity is removed from
      // it during iteration it continues to run
      for (let e = entities.length - 1; e >= 0; --e) {
        const entity = entities[e];
        callback(entity);
      }
    }
  }

  count() {
    let count = 0;
    this.forEach(() => count++);
    return count;
  }

  onArchetypeCreated(archetype) {
    if (this.matchesArchetype(archetype)) {
      this.archetypes.push(archetype);
    }
  }

  matchesArchetype(archetype: Archetype) {
    for (let c = 0; c < this.Components.length; c++) {
      let Component: ComponentClass;
      let maybePredicate = this.Components[c] as Predicate;

      // The only way to tell if it's a ComponentClass or a Predicate is
      // by the presence of isNot and isModified properties; Typescript
      // probably has a better way to handle this, but here's my attempt.
      const isNot = maybePredicate.isNot;
      const isModified = maybePredicate.isModified;
      if (isNot || isModified)
        Component = (maybePredicate.Component as unknown) as ComponentClass;
      else Component = (this.Components[c] as unknown) as ComponentClass;

      if (isNot) {
        if (archetype.Components.indexOf(Component) !== -1) {
          return false;
        }
      } else {
        if (archetype.Components.indexOf(Component) === -1) {
          return false;
        }
      }
    }
    return true;
  }
}
