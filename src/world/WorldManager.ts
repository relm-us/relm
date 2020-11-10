import { get, writable, Writable } from "svelte/store";
import {
  addDemonstrationEntities,
  removeDemonstrationEntities,
} from "~/world/demo";

// TODO: Create HECS World type
type World = any;

export default class WorldManager {
  world: World | null = null;
  viewport: HTMLElement;

  running: Writable<boolean>;
  previousLoopTime: number = 0;

  constructor() {
    this.running = writable(false);
    this.running.subscribe(($running) => {
      if ($running) {
        if (!this.world) {
          throw new Error(`Can't start when world is null`);
        }
        this.world.presentation.setLoop(this.loop.bind(this));
      } else {
        if (this.world) {
          this.world.presentation.setLoop(null);
        }
      }
    });
  }

  setWorld(world) {
    this.world = world;
    this.maybeMount();
  }

  setViewport(viewport) {
    this.viewport = viewport;
    this.maybeMount();
  }

  maybeMount() {
    if (this.world) {
      if (this.viewport) {
        if (this.world.cssPresentation) {
          // CSS3D elements go "behind" the WebGL canvas
          this.world.cssPresentation.setViewport(this.viewport);
          this.world.cssPresentation.renderer.domElement.style.zIndex = 0;
        }

        // WebGL canvas goes "on top" of CSS3D HTML elements
        this.world.presentation.setViewport(this.viewport);
        this.world.presentation.renderer.domElement.style.zIndex = 1;
      } else {
        if (this.world.cssPresentation) {
          this.world.cssPresentation.setViewport(null);
        }
        this.world.presentation.setViewport(null);
      }
    }
  }

  populate() {
    if (!this.world) {
      throw new Error(`Can't populate when world is null`);
    }

    // For now, we'll show a demo scene
    addDemonstrationEntities(this.world);
  }

  depopulate() {
    removeDemonstrationEntities();
  }

  start() {
    this.running.set(true);
  }

  stop() {
    this.running.set(false);
  }

  step() {
    if (get(this.running)) {
      this.stop();
    }
    requestAnimationFrame(this.loop.bind(this));
  }

  loop(time) {
    const delta = time - this.previousLoopTime;
    if (this.world) {
      this.world.update(get(this.running) ? delta : 1000 / 60);
    }
    this.previousLoopTime = time;
  }
}
