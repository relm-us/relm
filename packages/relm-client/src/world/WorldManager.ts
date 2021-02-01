import { get } from "svelte/store";

import { WorldDoc } from "~/y-integration/WorldDoc";

import { deltaTime, fpsTime } from "~/stores/stats";
import { worldRunning } from "~/stores/worldRunning";
import { scale } from "~/stores/viewport";
import { globalEvents } from "~/events";

import {
  makeAvatarAndActivate,
  makeStageAndActivate,
  makeGround,
  makeInvisibleBox,
} from "~/prefab";
import { Follow } from "~/ecs/plugins/follow";
import { HeadController } from "~/ecs/plugins/player-control";
import { SelectionManager } from "./SelectionManager";

export default class WorldManager {
  world;
  avatar;
  camera;
  connection;
  viewport: HTMLElement;

  wdoc: WorldDoc;
  selection: SelectionManager;

  previousLoopTime: number = 0;

  constructor({ world, viewport }) {
    if (!world) throw new Error(`world is required`);
    if (!viewport) throw new Error(`viewport is required`);
    this.world = world;
    this.viewport = viewport;

    this.wdoc = new WorldDoc({
      name: "relm",
      world,
    });

    this.selection = new SelectionManager(this.wdoc);

    this.mount();
    this.populate();
    this.start();

    worldRunning.subscribe(($running) => {
      if ($running) {
        this.world.presentation.setLoop(this.loop.bind(this));
      } else {
        this.world.presentation.setLoop(null);
      }
    });

    scale.subscribe(($scale) => {
      if (!this.camera) return;

      const follow = this.camera.get(Follow);
      if (!follow) return;

      const distance = 5 + (20 * $scale) / 100;
      follow.offset.set(0, distance, distance);
    });

    globalEvents.on("mouseActivity", () => {
      if (this.avatar) {
        const head = this.avatar.getChildren()[0];
        const controller = head.get(HeadController);
        if (controller) controller.enabled = true;
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

  connect(connection) {
    this.connection = connection;
    this.wdoc.connect(this.connection);
  }

  disconnect() {
    this.wdoc.disconnect();
  }

  reset() {
    this.disconnect();
    this.unmount();
    this.world.reset();
  }

  populate() {
    if (!this.world) {
      throw new Error(`Can't populate when world is null`);
    }

    // For now, we'll show a demo scene
    this.avatar = makeAvatarAndActivate(this.world);
    const { camera } = makeStageAndActivate(this.world, this.avatar);
    this.camera = camera;

    makeGround(this.world).activate();
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
