import { World } from "hecs";

import { Transform, Asset, Vector3, Quaternion } from "hecs-plugin-core";
import ThreePlugin, { Shape, Model, Camera, LookAt } from "hecs-plugin-three";

import { Noisy } from "./components/Noisy";
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
import Stats from "stats.js";

const world = new World({
  plugins: [ThreePlugin],
  components: [
    Noisy,
    OscillatePosition,
    OscillateRotation,
    OscillateScale,
    CenteredMesh,
  ],
  systems: [NoisySystem, /* OscillateSystem, */ CenteredMeshSystem],
});

world.presentation.setViewport(document.body);

function makeBox({ x = 0, y = 0, z = 0, w = 1, h = 1, d = 1, color = "red" }) {
  return world.entities
    .create("Box")
    .add(Transform, {
      position: new Vector3(x, y, z),
    })
    .add(Shape, {
      color,
      boxSize: new Vector3(w, h, d),
    });
}

function makeChair({ x = 0, y = 0, z = 0 }) {
  const p1 = world.entities
    .create("Chair")
    .add(Transform, {
      position: new Vector3(x, y - 0.15, z),
      scale: new Vector3(0.1, 0.1, 0.1),
    })
    .activate();

  const p2 = world.entities
    .create("ChairOscillatePosition")
    .add(Transform)
    .add(OscillatePosition, {
      frequency: 2,
      max: new Vector3(0, 0.5, 0),
    })
    .add(OscillateRotation, {
      phase: Math.random() * 100,
      min: new Quaternion().setFromEuler(new Euler(0, 0, -Math.PI / 4)),
      max: new Quaternion().setFromEuler(new Euler(0, 0, Math.PI / 4)),
    })
    .activate();

  p2.setParent(p1);

  // const p3 = world.entities
  //   .create("ChairOscillateRotation")
  //   .add(Transform)
  //   .add(OscillateRotation, {
  //     phase: Math.random() * 100,
  //     min: new Quaternion().setFromEuler(new Euler(0, 0, -Math.PI / 4)),
  //     max: new Quaternion().setFromEuler(new Euler(0, 0, Math.PI / 4)),
  //   })
  //   .activate();

  // p3.setParent(p2);

  const p4 = world.entities
    .create("ChairNoisy")
    .add(Transform)
    .add(Noisy, { speed: 2, magnitude: new Vector3(0, 0, 10) })
    .add(Model, {
      asset: new Asset("/chair.glb"),
    })
    .activate();

  p4.setParent(p2);

  // const p5 = world.entities
  //   .create("ChairModel")
  //   .add(Transform)
  //   // .add(CenteredMesh)
  //   .add(Model, {
  //     asset: new Asset("/chair.glb"),
  //   })
  //   .activate();

  // p5.setParent(p4);

  return p1;
}

// Create the floor
const origin = makeBox({
  y: -0.505,
  w: 8,
  h: 0.1,
  d: 6,
  color: "white",
}).activate();

// ~100 ms per frame
for (let dep = -8; dep < 8; dep++) {
  for (let row = 0; row < 16; row++) {
    for (let col = -8; col < 8; col++) {
      makeChair({ x: col / 4, y: row / 4, z: dep / 4 });
    }
  }
}

// Create the singleton camera
const cameraBoom = new Vector3(0, 8, 6);
const camera = world.entities
  .create("Camera")
  .add(Transform, {
    position: new Vector3().copy(cameraBoom),
    // offsets: {
    //   static: cameraBoom,
    // },
  })
  // .add(Oscillate, { phase: Math.PI / 2, behavior: "HARD_BOUNCE" })
  .add(LookAt, {
    entity: origin.id,
  })
  .add(Camera)
  .activate();

(window as any).world = world;
// (window as any).chair = chair;

import("@dimforge/rapier3d").then((RAPIER) => {
  const gravity = new RAPIER.Vector3(0.0, -9.81, 0.0);
  const physWorld = new RAPIER.World(gravity);
});

const stats = new Stats();
stats.showPanel(1);
document.body.appendChild(stats.dom);

let previousTime = 0;
let mag = 0;
const gameLoop = (time) => {
  stats.update();

  const delta = time - previousTime;
  world.update(delta);
  previousTime = time;
  // physWorld.step();
  mag += 0.005;
};

world.presentation.setLoop(gameLoop);
