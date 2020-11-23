import { get, writable, Writable } from "svelte/store";
import { deltaTime, fpsTime } from "./stats";
import { World } from "~/types/hecs/world";
import { selectedEntities } from "./selection";
import { Outline } from "~/ecs/plugins/outline";
import { difference } from "~/utils/setOps";

import { makeDemo, makeAvatar, makeStage } from "~/prefab";

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
    // Make debugging easier
    (window as any).world = world;

    this.world = world;
    this.maybeMount();
    this.activateSelection();
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

  activateSelection() {
    const previouslySelected = new Set();
    selectedEntities.subscribe(($selected) => {
      const added = difference($selected, previouslySelected);
      const removed = difference(previouslySelected, $selected);

      for (const entityId of removed) {
        const entity = this.world.entities.getById(entityId);
        previouslySelected.delete(entityId);
        entity.remove(Outline);
      }

      for (const entityId of added) {
        const entity = this.world.entities.getById(entityId);
        previouslySelected.add(entityId);
        entity.add(Outline);
      }
    });
  }

  populate() {
    if (!this.world) {
      throw new Error(`Can't populate when world is null`);
    }

    // For now, we'll show a demo scene
    const { avatar } = makeAvatar(this.world);
    makeStage(this.world, avatar);
    makeDemo(this.world);
  }

  depopulate() {
    this.world.reset();
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
    deltaTime.addData(delta);
    fpsTime.addData(1000 / delta);

    if (this.world) {
      this.world.update(get(this.running) ? delta : 1000 / 60);
    }

    this.previousLoopTime = time;
  }
}
