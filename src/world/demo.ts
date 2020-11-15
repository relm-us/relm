import * as THREE from "three";
(window as any).THREE = THREE;

import { Asset, Transform, Vector3, Quaternion } from "hecs-plugin-core";
import { Model, Shape, Camera, LookAt, Object3D } from "hecs-plugin-three";

import {
  ComposableTransform,
  OscillatePosition,
  OscillateScale,
} from "~/ecs/plugins/composable";
import { HtmlNode, CssPlane } from "~/ecs/plugins/css3d";
import { Follow } from "~/ecs/plugins/follow";
import { DirectionalLight } from "~/ecs/plugins/lighting";
import { NormalizeMesh } from "~/ecs/plugins/normalize";
import { RigidBody, Collider } from "~/ecs/plugins/rapier";

import { ThrustController } from "~/ecs/components";

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
    .add(ComposableTransform, {
      position: new Vector3(0, 0.5, 0.5),
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
    });
  // .activate();

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

  const floorBelowSize = {
    w: 150,
    d: 150,
  };
  // Create the floor
  makeBox(world, {
    y: -10,
    w: floorBelowSize.w,
    h: 0.1,
    d: floorBelowSize.d,
    color: "#44ba63",
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
  // makeBox(world, {
  //   ...{ x: floorSize.w / 2, y: -0.25 },
  //   ...{ w: 0.1, h: 0.5, d: floorSize.d },
  //   color: "white",
  //   dynamic: false,
  // }).activate();

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
  makeBox(world, {
    x: 4,
    y: 0,
    z: 2,
    color: "orange",
    name: "OrangeBox",
  }).activate();

  // Blue Box
  const blueBox = makeBox(world, {
    ...{ x: -2.5, y: 0, z: 0 },
    color: "blue",
    name: "BlueBox",
  }).activate();

  // Brown Box
  makeBox(world, {
    x: 2.5,
    y: 0,
    z: 0,
    color: "brown",
    name: "BrownBox",
  }).activate();

  /********* GAME OBJECTS *********/

  const ball = makeBall(world, {
    ...{ x: 0, y: 0.5, z: -2 },
    r: 0.5,
    color: "#ddff11",
    name: "Ball",
  }).activate();
  (window as any).ball = ball;

  const avatar = makeEntity(world, "Avatar")
    .add(ThrustController)
    .add(ComposableTransform, {})
    .add(Model, {
      asset: new Asset("/avatar.glb"),
    })
    .add(NormalizeMesh)
    .add(RigidBody, {
      kind: "DYNAMIC",
    })
    .add(Collider, {
      kind: "BOX",
      boxSize: new Vector3(1, 1, 1),
    })
    .add(OscillatePosition, {
      frequency: 1,
      phase: Math.PI * 0,
      min: new Vector3(0, 0.1, 0),
      max: new Vector3(0, 0.2, 0),
    })
    .add(OscillateScale, {
      frequency: 1,
      phase: Math.PI * 1,
      min: new Vector3(1, 1, 1),
      max: new Vector3(1.05, 1, 1.05),
    })
    .activate();
  (window as any).avatar = avatar;

  const head = makeEntity(world, "Head")
    .add(ComposableTransform, {
      position: new Vector3(0, 1, 0),
    })
    .add(HtmlNode, {
      specification: {
        type: "AVATAR_HEAD",
        props: {
          width: 60,
          height: 60,
        },
      },
      scale: 1.0 / 90,
    })
    .add(CssPlane, {
      kind: "CIRCLE",
      circleRadius: 0.35,
    })
    .activate();
  head.setParent(avatar);

  const leftHand = makeBall(world, {
    ...{ x: -0.55, y: 0.0, z: 0.05 },
    r: 0.12,
    color: "#8daeff",
    name: "LeftHand",
  }).activate();
  leftHand.setParent(avatar);

  const rightHand = makeBall(world, {
    ...{ x: 0.55, y: 0.0, z: 0.05 },
    r: 0.12,
    color: "#8daeff",
    name: "RightHand",
  }).activate();
  rightHand.setParent(avatar);

  // Chair
  const chair = makeEntity(world, "Chair")
    .add(NormalizeMesh)
    .add(ComposableTransform, {
      // Put it in the corner
      position: new Vector3(5, 0, -3),
      rotation: new Quaternion().setFromEuler(
        new THREE.Euler(0, -Math.PI / 4, 0)
      ),
      positionOffsets: {
        static: new Vector3(0, 0.45, 0),
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
  (window as any).chair = chair;

  // Create the singleton camera
  const camera = makeEntity(world, "Camera")
    .add(ComposableTransform, {
      position: new Vector3(0, 9, 15),
    })
    .add(LookAt, {
      entity: avatar.id,
      limit: "X_AXIS",
    })
    .add(Follow, {
      entity: avatar.id,
      limit: "X_AXIS",
    })
    .add(Camera)
    .activate();
  (window as any).camera = camera;

  const light = makeEntity(world, "DirectionalLight")
    .add(ComposableTransform, {
      position: new Vector3(-4, 20, 10),
    })
    .add(Follow, {
      entity: avatar.id,
    })
    .add(DirectionalLight)
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
