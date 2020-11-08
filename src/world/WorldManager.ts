import {
  addDemonstrationEntities,
  removeDemonstrationEntities,
} from "~/world/demo";

// TODO: Create HECS World type
type World = any;

export default class WorldManager {
  world: World | null = null;
  viewport: HTMLElement;

  running: boolean = false;
  previousLoopTime: number = 0;

  setWorld(world) {
    this.world = world;
    this.maybeMount();
  }

  setViewport(viewport) {
    this.viewport = viewport;
    this.maybeMount();
  }

  maybeMount() {
    if (this.world && this.viewport) {
      // CSS3D elements go "behind" the WebGL canvas
      this.world.cssPresentation.setViewport(this.viewport);
      this.world.cssPresentation.renderer.domElement.style.zIndex = 0;

      // WebGL canvas goes "on top" of CSS3D HTML elements
      this.world.presentation.setViewport(this.viewport);
      this.world.presentation.renderer.domElement.style.zIndex = 1;
    }
  }

  populate() {
    if (!this.world) {
      throw new Error(`Can't populate when world is null`);
    }

    addDemonstrationEntities(this.world);
  }

  depopulate() {
    removeDemonstrationEntities();
  }

  start() {
    if (!this.world) {
      throw new Error(`Can't start when world is null`);
    }

    this.world.presentation.setLoop(this.loop.bind(this));
    this.running = true;
  }

  stop() {
    if (this.world) {
      this.world.presentation.setLoop(null);
    }
    this.running = false;
  }

  step() {
    if (this.running) {
      this.stop();
    }
    requestAnimationFrame(this.loop.bind(this));
  }

  loop(time) {
    const delta = time - this.previousLoopTime;
    if (this.world) {
      this.world.update(delta);
    }
    this.previousLoopTime = time;
  }
}
