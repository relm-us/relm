import { World } from "./World";
import { System, SystemClass } from "./System";

export class SystemManager {
  world: World;
  Systems: Map<SystemClass, System>;
  systems: Array<System>;
  systemsByName: Record<string, System>;
  tick: number;

  constructor(world) {
    this.world = world;
    this.Systems = new Map();
    this.systems = [];
    this.systemsByName = {};
    this.tick = 0;
  }

  register(System) {
    if (this.Systems.has(System)) {
      console.warn(`ECS: already registered system '${System.name}'`);
      return;
    }
    const system = new System(this.world);
    this.Systems.set(System, system);
    let position = 0;
    for (let i = 0; i < this.systems.length; i++) {
      const other = this.systems[i];
      if (other.order > system.order) break;
      position = i + 1;
    }
    this.systems.splice(position, 0, system);
    this.systemsByName[System.name] = system;
    return this;
  }

  init() {
    for (let i = 0; i < this.systems.length; i++) {
      const system = this.systems[i];
      system.init(this.world);
    }
  }

  get(System) {
    return this.Systems.get(System);
  }

  getByName(name) {
    return this.systemsByName[name];
  }

  update(delta) {
    let timeBefore;
    const getTime = this.world.getTime;
    for (let i = 0; i < this.systems.length; i++) {
      this.tick++;
      const system = this.systems[i];
      if (getTime) timeBefore = getTime();
      if (system.active) system.update(delta);
      if (getTime) system.elapsedTime = getTime() - timeBefore;
    }
  }

  reset() {
    this.systems.forEach((system) => {
      system.reset();
    });
  }
}
