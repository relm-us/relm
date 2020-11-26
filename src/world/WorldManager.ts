import { get, writable, Writable } from "svelte/store";

import { WorldDoc } from "~/y-integration/WorldDoc";

import { difference } from "~/utils/setOps";
import { deltaTime, fpsTime } from "~/stores/stats";
import { worldRunning } from "~/stores/worldRunning";
import { selectedEntities } from "~/stores/selection";
import { globalEvents } from "~/events";

import {
  makeAvatarAndActivate,
  makeStageAndActivate,
  makeGround,
  makeInvisibleBox,
} from "~/prefab";
import { Outline } from "~/ecs/plugins/outline";
import { HeadController } from "~/ecs/plugins/player-control";

export default class WorldManager {
  world;
  avatar;
  connection;
  viewport: HTMLElement;

  wdoc: WorldDoc;

  previousLoopTime: number = 0;

  constructor({ world, connection, viewport }) {
    if (!world) throw new Error(`world is required`);
    if (!viewport) throw new Error(`viewport is required`);
    this.world = world;
    this.connection = connection;
    this.viewport = viewport;

    this.wdoc = new WorldDoc({
      name: "relm",
      world,
    });

    this.mount();
    this.activateSelection();
    this.populate();
    this.start();

    worldRunning.subscribe(($running) => {
      if ($running) {
        this.world.presentation.setLoop(this.loop.bind(this));
      } else {
        this.world.presentation.setLoop(null);
      }
    });

    globalEvents.on("mouseActivity", () => {
      if (this.avatar) {
        const head = this.avatar.getChildren()[0];
        const controller = head.get(HeadController);
        controller.enabled = true;
      }
    });
  }

  mount() {
    const world = this.world;

    // CSS3D elements go "behind" the WebGL canvas
    world.cssPresentation.setViewport(this.viewport);
    world.cssPresentation.renderer.domElement.style.zIndex = 0;

    // WebGL canvas goes "on top" of CSS3D HTML elements
    world.presentation.setViewport(this.viewport);
    world.presentation.renderer.domElement.style.zIndex = 1;
  }

  unmount() {
    const world = this.world;

    world.cssPresentation.setViewport(null);
    world.presentation.setViewport(null);
  }

  connect() {
    this.wdoc.connect(this.connection);
  }

  disconnect() {
    this.wdoc.disconnect();
  }

  reset() {
    this.unmount();
    this.world.reset();
  }

  // Show outline around selected entities
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
    this.avatar = makeAvatarAndActivate(this.world);
    makeStageAndActivate(this.world, this.avatar);
    makeGround(this.world).activate();
    makeInvisibleBox(this.world, {
      z: -50,
      w: 100,
      h: 100,
      d: 1,
      dynamic: false,
    }).activate();
    makeInvisibleBox(this.world, {
      w: 100,
      h: 100,
      d: 1,
      dynamic: false,
    }).activate();
  }

  depopulate() {
    this.world.reset();
  }

  start() {
    worldRunning.set(true);
  }

  stop() {
    worldRunning.set(false);
  }

  step() {
    if (get(worldRunning)) {
      this.stop();
    }
    requestAnimationFrame(this.loop.bind(this));
  }

  loop(time: number) {
    const delta = time - this.previousLoopTime;
    deltaTime.addData(delta);
    fpsTime.addData(1000 / delta);

    if (this.world) {
      this.world.update(get(worldRunning) ? delta : 1000 / 60);
    }

    this.previousLoopTime = time;
  }
}
