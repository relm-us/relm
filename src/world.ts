import { World } from "hecs";

import { Asset, Vector3, Quaternion } from "hecs-plugin-core";
import ThreePlugin, { Shape, Model, Camera, LookAt } from "hecs-plugin-three";

import { Noisy } from "./components/Noisy";
import { CompositeTransform } from "./components/CompositeTransform";
import {
  OscillatePosition,
  OscillateRotation,
  OscillateScale,
} from "./components/Oscillate";
import { CenteredMesh } from "./components/CenteredMesh";

import { NoisySystem } from "./systems/NoisySystem";
import { OscillateSystem } from "./systems/OscillateSystem";
import { CompositeTransformSystem } from "./systems/CompositeTransformSystem";
import { CenteredMeshSystem } from "./systems/CenteredMeshSystem";
import { Euler } from "three";

const world = new World({
  plugins: [ThreePlugin],
  components: [
    Noisy,
    OscillatePosition,
    OscillateRotation,
    OscillateScale,
    CompositeTransform,
    CenteredMesh,
  ],
  systems: [
    NoisySystem,
    OscillateSystem,
    CompositeTransformSystem,
    CenteredMeshSystem,
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

// Create the floor
const origin = makeBox({
  y: -0.505,
  w: 8,
  h: 0.1,
  d: 6,
  color: "white",
}).activate();

const chair = world.entities
  .create("Chair")
  .add(CenteredMeshSystem)
  .add(CompositeTransform, {
    position: new Vector3(0, 0, 0),
    scale: new Vector3(1, 1, 1),
    offsets: {
      static: {
        position: new Vector3(0, -0.15, 0),
      },
    },
  })
  .add(Model, {
    asset: new Asset("/chair.glb"),
  })
  .add(OscillateRotation, {
    min: new Quaternion().setFromEuler(new Euler(0, 0, -Math.PI / 4)),
    max: new Quaternion().setFromEuler(new Euler(0, 0, Math.PI / 4)),
  })
  .add(OscillatePosition, {
    frequency: 2,
    max: new Vector3(0, 0.5, 0),
  })
  .add(Noisy, { speed: 2, magnitude: new Vector3(0, 0, 10) })
  .activate();

const orangeBox = makeBox({ x: 0, y: 0, z: -2, color: "orange" })
  .add(Noisy, { speed: 4, magnitude: new Vector3(0, 2, 4) })
  .activate();

const blueBox = makeBox({ x: -2, y: 0, z: 0, color: "blue" })
  .add(Noisy, { speed: 4, magnitude: new Vector3(0, 2, 4) })
  .activate();

const brownBox = makeBox({ x: 2, y: 0, z: 0, color: "brown" })
  .add(Noisy, { speed: 4, magnitude: new Vector3(0, 2, 4) })
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
