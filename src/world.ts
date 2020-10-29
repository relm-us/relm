import {
  World,
  System,
  Component,
  StateComponent,
  Not,
  Modified,
  StringType,
  RefType,
} from "hecs";

import CorePlugin, { Transform, Asset, Vector3 } from "hecs-plugin-core";
import ThreePlugin, {
  Shape,
  Model,
  Camera,
  LookAt,
  ModelSystem,
} from "hecs-plugin-three";

import { Shake } from "./components/Shake";
import { CompositeTransform } from "./components/CompositeTransform";
import { Oscillate } from "./components/Oscillate";
import { CenteredLoadedMesh } from "./components/CenteredLoadedMesh";

import { ShakeSystem } from "./systems/ShakeSystem";
import { OscillateSystem } from "./systems/OscillateSystem";
import { CompositeTransformSystem } from "./systems/CompositeTransformSystem";
import { CenteredLoadedMeshSystem } from "./systems/CenteredLoadedMeshSystem";

const world = new World({
  plugins: [ThreePlugin],
  components: [Shake, Oscillate, CompositeTransform, CenteredLoadedMesh],
  systems: [
    ShakeSystem,
    OscillateSystem,
    CompositeTransformSystem,
    CenteredLoadedMeshSystem,
  ],
});

world.presentation.setViewport(document.body);

function makeBox({ x = 0, y = 0, z = 0, w = 1, h = 1, d = 1, color = "red" }) {
  return world.entities
    .create("Box")
    .add(CompositeTransform, {
      position: new Vector3(x, y, z),
    })
    .add(Shape, {
      color,
      boxSize: new Vector3(w, h, d),
    });
}

// Create an entity
const origin = makeBox({
  y: -0.505,
  w: 8,
  h: 0.1,
  d: 6,
  color: "white",
}).activate();

const chair = world.entities
  .create("Chair")
  .add(CenteredLoadedMeshSystem)
  .add(CompositeTransform, {
    position: new Vector3(0, 0, 2),
    scale: new Vector3(1, 1, 1),
    offsets: {
      static: {
        position: new Vector3(0, -0.5, 0),
      },
    },
  })
  .add(Model, {
    asset: new Asset("/chair.glb"),
  })
  .add(Oscillate, {
    speed: 0.5,
    behavior: "OSCILLATE",
    direction: new Vector3(0, 0, 1),
  })
  .activate();

const orangeBox = makeBox({ x: 0, y: 0, z: -2, color: "orange" })
  .add(Oscillate)
  .activate();
orangeBox
  .get(CompositeTransform)
  .setCompositePosition("static", new Vector3(0, 1, 0));

const blueBox = makeBox({ x: -2, y: 0, z: 0, color: "blue" })
  .add(Shake, { magnitude: new Vector3(0, 0, 4) })
  .add(Oscillate, {
    speed: 0.5,
    behavior: "OSCILLATE",
    direction: new Vector3(1, 0, 0),
  })
  .activate();

const brownBox = makeBox({ x: 2, y: 0, z: 0, color: "brown" })
  .add(Oscillate, {
    behavior: "BOUNCE",
    phase: Math.PI,
    speed: 1,
    direction: new Vector3(1, 0, 0),
  })
  .activate();

// Create the singleton camera
const cameraBoom = new Vector3(0, 5, 5);
const camera = world.entities
  .create("Camera")
  .add(CompositeTransform, {
    position: new Vector3().copy(cameraBoom),
    offsets: {
      static: cameraBoom,
    },
  })
  // .add(Oscillate, { phase: Math.PI / 2, behavior: "HARD_BOUNCE" })
  .add(LookAt, {
    entity: origin.id,
  })
  .add(Camera)
  .activate();

(window as any).world = world;
(window as any).chair = chair;

import("@dimforge/rapier3d").then((RAPIER) => {
  const gravity = new RAPIER.Vector3(0.0, -9.81, 0.0);
  const physWorld = new RAPIER.World(gravity);
});

let previousTime = 0;
let mag = 0;
const gameLoop = (time) => {
  const delta = time - previousTime;
  world.update(delta);
  previousTime = time;
  // physWorld.step();
  mag += 0.005;
};

world.presentation.setLoop(gameLoop);
