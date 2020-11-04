import { World } from "hecs";

import { Asset, Transform, Vector3, Quaternion } from "hecs-plugin-core";
import ThreePlugin, { Model, Shape, Camera, LookAt } from "hecs-plugin-three";
import RapierPlugin, {
  RigidBody,
  RigidBodyRef,
  Collider,
} from "./ecs/plugins/rapier";

import Css3DPlugin, { HtmlNode, CssPlane } from "./ecs/plugins/css3d";

import ComposablePlugin, {
  ComposableTransform,
  NoisyPosition,
  NoisyRotation,
  NoisyScale,
  OscillatePosition,
  OscillateRotation,
  OscillateScale,
} from "./ecs/plugins/composable";

import { CenteredMesh } from "./ecs/components/CenteredMesh";
import { CenteredMeshSystem } from "./ecs/systems/CenteredMeshSystem";
import { Euler } from "three";

const playerForce = new Vector3();
const playerForces = {
  up: new Vector3(),
  down: new Vector3(),
  left: new Vector3(),
  right: new Vector3(),
};

function start(RAPIER) {
  const world = new World({
    plugins: [ThreePlugin, RapierPlugin, ComposablePlugin, Css3DPlugin],
    components: [CenteredMesh],
    systems: [CenteredMeshSystem],
  });

  world.physics.Transform = ComposableTransform;
  world.cssPresentation.setViewport(document.body);
  world.presentation.setViewport(document.body);
  world.presentation.renderer.domElement.style.zIndex = 1;
  world.presentation.renderer.domElement.style.position = "absolute";
  world.presentation.renderer.domElement.style.pointerEvents = "none";

  function makeBox({
    x = 0,
    y = 0,
    z = 0,
    w = 1,
    h = 1,
    d = 1,
    color = "red",
    dynamic = true,
  }) {
    return world.entities
      .create("Box")
      .add(ComposableTransform, {
        position: new Vector3(x, y, z),
      })
      .add(Shape, {
        color,
        boxSize: new Vector3(w, h, d),
      })
      .add(RigidBody, {
        kind: dynamic ? "DYNAMIC" : "STATIC",
      })
      .add(Collider, {
        kind: "BOX",
        boxSize: new Vector3(w, h, d),
      });
  }

  // const el = document.createElement("img");
  // el.src = "/square.png";
  const el = document.createElement("iframe");
  el.width = "560";
  el.height = "315";
  el.src = "https://www.youtube.com/embed/nn8YGPZdCvA";
  el.allow = "autoplay; encrypted-media";
  el.allowFullscreen = true;

  world.entities
    .create("Image")
    .add(ComposableTransform, {
      position: new Vector3(0, 1, -2),
    })
    .add(HtmlNode, {
      node: el,
      scale: 0.007,
    })
    .add(CssPlane, {
      kind: "RECTANGLE",
      rectangleSize: {
        x: 2 * 2,
        y: 1.125 * 2,
      },
    })
    // .add(OscillatePosition, {
    //   frequency: 0.2,
    //   min: new Vector3(0, 0, -2),
    //   max: new Vector3(0, 0, 2),
    // })
    .add(OscillateRotation, {
      min: new Quaternion().setFromEuler(new Euler(0, -Math.PI / 4, 0)),
      max: new Quaternion().setFromEuler(new Euler(0, Math.PI / 4, 0)),
    })
    .activate();

  // Create the floor
  const origin = makeBox({
    y: -0.505,
    w: 8,
    h: 0.1,
    d: 6,
    color: "white",
    dynamic: false,
  }).activate();

  const wall1 = makeBox({
    x: -4,
    y: -0.25,
    w: 0.1,
    h: 0.5,
    d: 6,
    color: "white",
    dynamic: false,
  }).activate();

  const wall2 = makeBox({
    x: 4,
    y: -0.25,
    w: 0.1,
    h: 0.5,
    d: 6,
    color: "white",
    dynamic: false,
  }).activate();

  const wall3 = makeBox({
    x: 0,
    y: -0.25,
    z: -3,
    w: 8,
    h: 0.5,
    d: 0.1,
    color: "white",
    dynamic: false,
  }).activate();

  const chair = world.entities
    .create("Chair")
    .add(CenteredMeshSystem)
    .add(ComposableTransform, {
      position: new Vector3(0, 0, 0),
      scale: new Vector3(1, 1, 1),
    })
    .add(Model, {
      asset: new Asset("/chair.glb"),
    })
    // .add(OscillateRotation, {
    //   min: new Quaternion().setFromEuler(new Euler(0, 0, -Math.PI / 4)),
    //   max: new Quaternion().setFromEuler(new Euler(0, 0, Math.PI / 4)),
    // })
    .add(OscillatePosition, {
      frequency: 0.6,
      min: new Vector3(-0.5, 0, 0),
      max: new Vector3(0.5, 0, 0),
    })
    // .add(NoisyPosition, { speed: 2, magnitude: new Vector3(0, 0, 10) })
    .activate();

  const orangeBox = makeBox({ x: 0, y: 0, z: -2, color: "orange" })
    // .add(NoisyPosition, { speed: 4, magnitude: new Vector3(0, 2, 4) })
    .activate();

  const blueBox = makeBox({ x: -2, y: 0, z: 0, color: "blue" })
    // .add(NoisyScale, {
    //   speed: 4,
    //   magnitude: new Vector3(1, 1, 1),
    // })
    .add(Transform)
    .activate();

  const brownBox = makeBox({ x: 2, y: 0, z: 0, color: "brown" })
    // .add(OscillateScale, {
    //   min: new Vector3(1, 1, 1),
    //   max: new Vector3(1, 2, 1),
    // })
    // .add(NoisyRotation, { speed: 4, magnitude: new Vector3(0, 1, 0) })
    .activate();

  // Create the singleton camera
  const cameraBoom = new Vector3(0, 5, 5);
  const camera = world.entities
    .create("Camera")
    .add(ComposableTransform, {
      position: new Vector3().copy(cameraBoom),
    })
    // .add(Oscillate, { phase: Math.PI / 2, behavior: "HARD_BOUNCE" })
    .add(LookAt, {
      entity: origin.id,
    })
    .add(Camera)
    .activate();

  (window as any).world = world;
  (window as any).chair = chair;

  let previousTime = 0;
  const gameLoop = (time) => {
    const delta = time - previousTime;
    world.update(delta);
    previousTime = time;

    const ref = blueBox.get(RigidBodyRef);
    if (ref) {
      playerForce.set(0, 0, 0);
      Object.values(playerForces).forEach((force) => {
        playerForce.add(force);
      });
      // console.log("applyForce", playerForce);
      ref.value.applyForce(playerForce);
    }
  };

  // return;
  world.presentation.setLoop(gameLoop);
}

import("@dimforge/rapier3d").then((RAPIER) => {
  (window as any).RAPIER = RAPIER;
  start(RAPIER);
});

const playerForceMagnitude = 25;
document.addEventListener("keydown", (event) => {
  if (event.repeat) return;
  let handled = false;
  switch (event.key) {
    case "ArrowUp":
      playerForces.up.set(0, 0, -playerForceMagnitude);
      handled = true;
      // console.log("ArrowUp", playerForceMagnitude, playerForces.up);
      break;
    case "ArrowDown":
      playerForces.down.set(0, 0, playerForceMagnitude);
      handled = true;
      // console.log("ArrowDown", playerForceMagnitude, playerForces.down);
      break;
    case "ArrowLeft":
      playerForces.left.set(-playerForceMagnitude, 0, 0);
      handled = true;
      // console.log("ArrowLeft", playerForceMagnitude, playerForces.left);
      break;
    case "ArrowRight":
      playerForces.right.set(playerForceMagnitude, 0, 0);
      handled = true;
      // console.log("ArrowRight", playerForceMagnitude, playerForces.right);
      break;
  }
  // console.log("right", playerForces.right, playerForces);
  // console.log("keydown", event.key, handled, playerForces);
  if (handled) event.preventDefault();
});
document.addEventListener("keyup", (event) => {
  // console.log("keyup", event.key, playerForces);
  switch (event.key) {
    case "ArrowUp":
      playerForces.up.z = 0;
      // console.log("ArrowUp kd");
      break;
    case "ArrowDown":
      playerForces.down.z = 0;
      // console.log("ArrowDown kd");
      break;
    case "ArrowLeft":
      playerForces.left.x = 0;
      // console.log("ArrowLeft kd");
      break;
    case "ArrowRight":
      playerForces.right.x = 0;
      // console.log("ArrowRight kd");
      break;
  }
});
