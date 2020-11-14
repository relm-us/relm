import { Asset, Transform, Vector3, Quaternion } from "hecs-plugin-core";
import { Model, Shape, Camera, LookAt } from "hecs-plugin-three";

import {
  ComposableTransform,
  NoisyPosition,
  NoisyRotation,
  NoisyScale,
  OscillatePosition,
  OscillateRotation,
  OscillateScale,
} from "~/ecs/plugins/composable";
import { HtmlNode, CssPlane } from "~/ecs/plugins/css3d";
import { Outline } from "~/ecs/plugins/outline";
import { Follow } from "~/ecs/plugins/follow";
import { RigidBody, RigidBodyRef, Collider } from "~/ecs/plugins/rapier";

import {
  CenterMesh,
  Selectable,
  PotentiallyControllable,
  ThrustController,
} from "~/ecs/components";

import { makeEntity, makeBox, makeBall, makePileOfBoxes } from "./prefab";

export function addDemonstrationEntities(world) {
  const iframeSize = new Vector3(560, 315, 0);

  // YouTube Video
  const iframeWorldWidth = 3;
  const iframeRatio = iframeSize.x / iframeSize.y;
  const rectangleSize = new Vector3(
    iframeWorldWidth,
    iframeWorldWidth / iframeRatio,
    0.1
  );
  const scale = rectangleSize.x / parseFloat(iframeSize.x);
  makeEntity(world, "Video")
    .add(Selectable)
    .add(ComposableTransform, {
      position: new Vector3(0, 0, 0.5),
    })
    .add(HtmlNode, {
      specification: {
        type: "YOUTUBE",
        props: {
          width: 560,
          height: 315,
          embedId: "U_u91SjrEOE", // Prometheus
          // embedId: "nn8YGPZdCvA", // Midas
        },
      },
      scale,
    })
    .add(CssPlane, {
      kind: "RECTANGLE",
      rectangleSize,
    })
    .add(RigidBody, {
      kind: "DYNAMIC",
    })
    .add(Collider, {
      kind: "BOX",
      boxSize: rectangleSize,
    })
    .activate();

  // Create origin entity (target for the camera)
  const origin = makeEntity(world, "Origin")
    .add(ComposableTransform, {
      position: new Vector3(0, 0, 1),
    })
    .activate();

  const floorSize = {
    w: 12,
    d: 8,
  };
  // Create the floor
  makeBox(world, {
    y: -0.45,
    w: floorSize.w,
    h: 0.1,
    d: floorSize.d,
    color: "white",
    dynamic: false,
  }).activate();

  /********* WALLS **********/

  // Left Wall
  makeBox(world, {
    x: -floorSize.w / 2,
    y: -0.25,
    w: 0.1,
    h: 0.5,
    d: floorSize.d,
    color: "white",
    dynamic: false,
  }).activate();

  // Right Wall
  makeBox(world, {
    ...{ x: floorSize.w / 2, y: -0.25 },
    ...{ w: 0.1, h: 0.5, d: floorSize.d },
    color: "white",
    dynamic: false,
  }).activate();

  // Back Wall
  makeBox(world, {
    ...{ x: 0, y: -0.25, z: -floorSize.d / 2 },
    ...{ w: floorSize.w, h: 0.5, d: 0.1 },
    color: "white",
    dynamic: false,
  }).activate();

  // Front Wall
  makeBox(world, {
    ...{ x: 0, y: -0.25, z: floorSize.d / 2 },
    ...{ w: floorSize.w, h: 0.5, d: 0.1 },
    color: "white",
    dynamic: false,
  }).activate();

  /********* BOXES **********/

  // Pile of boxes
  makePileOfBoxes(world, { count: 10 });

  // Orange Box
  makeBox(world, { x: 0, y: 0, z: 2, color: "orange", name: "OrangeBox" })
    .add(Selectable)
    .activate();

  // Blue Box
  const blueBox = makeBox(world, {
    ...{ x: -2.5, y: 0, z: 0 },
    color: "blue",
    name: "BlueBox",
  })
    .add(ThrustController)
    .add(PotentiallyControllable)
    .add(Selectable)
    .add(OscillatePosition, {
      frequency: 1,
      phase: Math.PI * 0,
      min: new Vector3(0, -0.1, 0),
      max: new Vector3(0, 0, 0),
    })
    .add(OscillateScale, {
      frequency: 1,
      phase: Math.PI * 1,
      min: new Vector3(1, 1, 1),
      max: new Vector3(1.05, 1, 1.05),
    })
    .activate();

  const ball = makeBall(world, {
    ...{ x: 0, y: 0.5, z: -2 },
    r: 0.5,
    color: "#ddff11",
    name: "Ball",
  })
    .add(Selectable)
    .activate();

  // Brown Box
  makeBox(world, { x: 2.5, y: 0, z: 0, color: "brown", name: "BrownBox" })
    .add(Selectable)
    .activate();

  // Chair
  const chair = makeEntity(world, "Chair")
    .add(Selectable)
    .add(CenterMesh)
    .add(ComposableTransform, {
      position: new Vector3(0, 0, 0),
      scale: new Vector3(1, 1, 1),
      positionOffsets: {
        static: new Vector3(0, -0.5, 0),
      },
    })
    .add(Model, {
      asset: new Asset("/chair.glb"),
    })
    .add(RigidBody, {
      kind: "DYNAMIC",
    })
    .add(Collider, {
      kind: "BOX",
      boxSize: new Vector3(1, 1, 1),
    })
    .activate();

  // Plant
  // makeEntity(world, "Plant")
  //   .add(CenterMesh)
  //   .add(ComposableTransform, {
  //     position: new Vector3(3, 0, -3),
  //     scale: new Vector3(1, 1, 1),
  //     positionOffsets: {
  //       static: new Vector3(0, -0.5, 0),
  //     },
  //   })
  //   .add(Model, {
  //     asset: new Asset("/plant.glb"),
  //   })
  //   .add(RigidBody, {
  //     kind: "DYNAMIC",
  //   })
  //   .add(Collider, {
  //     kind: "BOX",
  //     boxSize: new Vector3(1, 1, 1),
  //   })
  //   .activate();

  // Create the singleton camera
  makeEntity(world, "Camera")
    .add(ComposableTransform, {
      position: new Vector3(0, 12, 20),
    })
    .add(LookAt, {
      entity: blueBox.id,
      limit: "X_AXIS",
    })
    .add(Follow, {
      entity: blueBox.id,
      limit: "X_AXIS",
    })
    .add(Camera)
    .activate();
}

/**
 * Sample Components
 */

// .add(OscillateRotation, {
//   min: new Quaternion().setFromEuler(new Euler(0, 0, -Math.PI / 4)),
//   max: new Quaternion().setFromEuler(new Euler(0, 0, Math.PI / 4)),
// })
// .add(OscillatePosition, {
//   frequency: 0.6,
//   min: new Vector3(-0.5, 0, 0),
//   max: new Vector3(0.5, 0, 0),
// })
// .add(NoisyPosition, { speed: 2, magnitude: new Vector3(0, 0, 10) })
