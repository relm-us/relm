import * as THREE from "three";
(window as any).THREE = THREE;

import { Asset, Transform, Vector3, Quaternion } from "hecs-plugin-core";
import { Model, Camera, LookAt } from "hecs-plugin-three";

// Components from ECS plugins (organized alphabetically by plugin name)
import { HtmlNode, CssPlane } from "~/ecs/plugins/css3d";
import { Follow } from "~/ecs/plugins/follow";
import { DirectionalLight } from "~/ecs/plugins/lighting";
import { NormalizeMesh } from "~/ecs/plugins/normalize";
import {
  HandController,
  HeadController,
  ThrustController,
} from "~/ecs/plugins/player-control";
import { PointerPlane } from "~/ecs/plugins/pointer-plane";
import { RigidBody, FixedJoint, Collider } from "~/ecs/plugins/rapier";
import { TransformEffects } from "~/ecs/plugins/transform-effects";

import {
  makeEntity,
  makeBox,
  makeBall,
  makePileOfBoxes,
  makeYouTube,
} from "./prefab";
import { keyE, keyQ } from "~/input";

export function addDemonstrationEntities(world) {
  // Create origin entity (target for the camera)
  const origin = makeEntity(world, "Origin")
    .add(Transform, {
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
    w: 0.2,
    h: 0.5,
    d: floorSize.d,
    color: "white",
    dynamic: false,
  }).activate();

  // Right Wall
  // makeBox(world, {
  //   ...{ x: floorSize.w / 2, y: -0.25 },
  //   ...{ w: 0.2, h: 0.5, d: floorSize.d },
  //   color: "white",
  //   dynamic: false,
  // }).activate();

  // Back Wall
  makeBox(world, {
    ...{ x: -0.05, y: -0.25, z: -floorSize.d / 2 },
    ...{ w: floorSize.w + 0.1, h: 0.5, d: 0.2 },
    color: "white",
    dynamic: false,
  }).activate();

  // Front Wall
  makeBox(world, {
    ...{ x: -0.05, y: -0.25, z: floorSize.d / 2 },
    ...{ w: floorSize.w + 0.1, h: 0.5, d: 0.2 },
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

  // TV Box
  const tvBox = makeBox(world, {
    ...{ x: -2.5, y: 0, z: 0, w: 3.2, h: 1.888, d: 0.6 },
    color: "gray",
    name: "BlueBox",
  }).activate();
  tvBox.get(Transform).rotation = new Quaternion().setFromEuler(
    new THREE.Euler(0, Math.PI / 4, 0)
  );

  const video = makeYouTube(world, {
    x: 0.0,
    y: 0.0,
    z: 0.301,
    embedId: "U_u91SjrEOE",
    frameWidth: 560,
    frameHeight: 315,
    worldWidth: 3,
  }).activate();

  video.setParent(tvBox);

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
    .add(PointerPlane)
    .add(Transform)
    .add(Model, {
      asset: new Asset("/avatar.glb"),
    })
    .add(NormalizeMesh)
    .add(RigidBody, {
      kind: "DYNAMIC",
      damping: 0.5,
    })
    .add(Collider, {
      kind: "BOX",
      boxSize: new Vector3(1, 1, 1),
    })
    .add(TransformEffects, {
      effects: [
        {
          function: "oscillate-scale",
          params: {
            phase: 0,
            min: new Vector3(0.97, 1, 0.97),
            max: new Vector3(1.03, 1, 1.03),
          },
        },
        {
          function: "oscillate-scale",
          params: {
            phase: Math.PI,
            min: new Vector3(1, 0.95, 1),
            max: new Vector3(1, 1.05, 1),
          },
        },
      ],
    })
    .activate();
  (window as any).avatar = avatar;

  const head = makeEntity(world, "Head")
    .add(HeadController, {
      pointerPlaneEntity: avatar.id,
    })
    .add(Transform, {
      position: new Vector3(0, 0.85, 0),
    })
    .add(HtmlNode, {
      renderable: {
        type: "AVATAR_HEAD",
        props: {
          width: 70,
          height: 70,
        },
      },
      scale: 0.7 / 70,
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
    damping: 5,
  })
    .add(FixedJoint, {
      entity: avatar.id,
    })
    .add(HandController, {
      pointerPlaneEntity: avatar.id,
      keyStore: keyE,
    })
    .activate();
  leftHand.setParent(avatar);

  const rightHand = makeBall(world, {
    ...{ x: 0.55, y: 0.0, z: 0.05 },
    r: 0.12,
    color: "#8daeff",
    name: "RightHand",
    damping: 5,
  })
    .add(FixedJoint, {
      entity: avatar.id,
    })
    .add(HandController, {
      pointerPlaneEntity: avatar.id,
      keyStore: keyQ,
    })
    .activate();
  rightHand.setParent(avatar);

  // Chair
  const chair = makeEntity(world, "Chair")
    .add(NormalizeMesh)
    .add(Transform, {
      // Put it in the corner
      position: new Vector3(5, 0, -3),
      rotation: new Quaternion().setFromEuler(
        new THREE.Euler(0, -Math.PI / 4, 0)
      ),
    })
    .add(TransformEffects, {
      effects: [
        { function: "position", params: { position: new Vector3(0, 0.45, 0) } },
      ],
    })
    .add(Model, {
      asset: new Asset("/chair.glb"),
    })
    .add(RigidBody, {
      kind: "DYNAMIC",
    })
    .add(Collider, {
      kind: "BOX",
      boxSize: new Vector3(0.8, 0.8, 0.8),
    })
    .activate();
  (window as any).chair = chair;

  // Create the singleton camera
  const camera = makeEntity(world, "Camera")
    .add(Transform, {
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
    .add(Transform, {
      position: new Vector3(-4, 20, 10),
    })
    .add(Follow, {
      entity: avatar.id,
    })
    .add(DirectionalLight)
    .activate();
}
