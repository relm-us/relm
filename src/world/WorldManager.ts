import { get, writable, Writable } from "svelte/store";
import { deltaTime, fpsTime } from "./stats";
import { selectedEntities } from "./selection";
import { Outline } from "~/ecs/plugins/outline";
import { difference } from "~/utils/setOps";
import { WorldDoc } from "~/y-integration/WorldDoc";

import { makeDemo, makeAvatar, makeStage } from "~/prefab";

export default class WorldManager {
  wdoc: WorldDoc;
  viewport: HTMLElement;

  running: Writable<boolean>;
  previousLoopTime: number = 0;

  constructor() {
    this.running = writable(false);
    this.running.subscribe(($running) => {
      if ($running) {
        if (!this.wdoc) {
          throw new Error(`Can't start when world is null`);
        }
        this.wdoc.world.presentation.setLoop(this.loop.bind(this));
      } else {
        if (this.wdoc) {
          this.wdoc.world.presentation.setLoop(null);
        }
      }
    });
  }

  setWorld(world) {
    // Make debugging easier
    (window as any).world = world;

    this.wdoc = new WorldDoc({
      name: "relm",
      world,
      connection: {
        url: "ws://localhost:1234",
      },
    });
    this.maybeMount();
    this.activateSelection();
  }

  setViewport(viewport) {
    this.viewport = viewport;
    this.maybeMount();
  }

  maybeMount() {
    const world = this.wdoc.world;
    if (world) {
      if (this.viewport) {
        if (world.cssPresentation) {
          // CSS3D elements go "behind" the WebGL canvas
          world.cssPresentation.setViewport(this.viewport);
          world.cssPresentation.renderer.domElement.style.zIndex = 0;
        }

        // WebGL canvas goes "on top" of CSS3D HTML elements
        world.presentation.setViewport(this.viewport);
        world.presentation.renderer.domElement.style.zIndex = 1;
      } else {
        if (world.cssPresentation) {
          world.cssPresentation.setViewport(null);
        }
        world.presentation.setViewport(null);
      }
    }
  }

  activateSelection() {
    const previouslySelected = new Set();
    selectedEntities.subscribe(($selected) => {
      const added = difference($selected, previouslySelected);
      const removed = difference(previouslySelected, $selected);

      for (const entityId of removed) {
        const entity = this.wdoc.world.entities.getById(entityId);
        previouslySelected.delete(entityId);
        entity.remove(Outline);
      }

      for (const entityId of added) {
        const entity = this.wdoc.world.entities.getById(entityId);
        previouslySelected.add(entityId);
        entity.add(Outline);
      }
    });
  }

  populate() {
    const world = this.wdoc.world;

    if (!world) {
      throw new Error(`Can't populate when world is null`);
    }

    // For now, we'll show a demo scene
    const { avatar } = makeAvatar(world);
    makeStage(world, avatar);
    makeDemo(world);
  }

  depopulate() {
    this.wdoc.world.reset();
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

    if (this.wdoc.world) {
      this.wdoc.world.update(get(this.running) ? delta : 1000 / 60);
    }

    this.previousLoopTime = time;
  }
}
