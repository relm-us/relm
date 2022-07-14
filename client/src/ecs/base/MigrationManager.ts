import { Entity } from "./Entity";
import type { World } from "./World";

export type Migration = (world: World, entity: Entity, data: any) => void;

export class MigrationManager {
  world: World;
  migrations: Record<string, Migration>;

  constructor(world) {
    this.world = world;
    this.migrations = {};
  }

  register(oldComponentName: string, migration: Migration) {
    if (this.migrations[oldComponentName]) {
      throw new Error(
        `ECS: migration for '${oldComponentName}' already registered`
      );
    }
    this.migrations[oldComponentName] = migration;
    return this;
  }

  has(oldComponentName: string) {
    return oldComponentName in this.migrations;
  }

  migrate(oldComponentName: string, entity: Entity, data: any) {
    return this.migrations[oldComponentName](this.world, entity, data);
  }
}
