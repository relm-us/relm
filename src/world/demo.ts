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
  makeThing,
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
    w: floorSize.w + 0.2,
    h: 0.5,
    d: floorSize.d + 0.2,
    color: "white",
    dynamic: false,
  }).activate();
  // Westx1
  makeBox(world, {
    x: -floorSize.w,
    y: -3,
    w: floorSize.w + 0.2,
    h: 0.5,
    d: floorSize.d + 0.2,
    color: "white",
    dynamic: false,
  }).activate();
  // Westx2
  makeBox(world, {
    x: -floorSize.w * 2,
    y: 1,
    w: floorSize.w + 0.2,
    h: 0.5,
    d: floorSize.d + 0.2,
    color: "white",
    dynamic: false,
  }).activate();

  // makePlant(world, { x: -floorSize.w * 2.5, y: 1.5, z: 0 });
  makeThing(world, {
    url: "/lamp.glb",
    x: -floorSize.w * 2 - 3,
    y: 1.5,
    z: 0,
    yOffset: 1,
  });

  makeThing(world, {
    url: "/couch.glb",
    x: -floorSize.w * 2,
    y: 1.5,
    z: 0,
    w: 4,
    h: 4,
    d: 4,
    yOffset: -0.2,
  });

  const floorBelowSize = {
    w: 150,
    h: 0.5,
    d: 150,
  };
  // Create the grass
  makeBox(world, {
    y: -10,
    ...floorBelowSize,
    color: "#44ba63",
    dynamic: false,
  }).activate();

  // Create "Sun"
  const sun = makeBall(world, {
    x: 10,
    y: 22,
    z: -60,
    r: 5,
    color: "#ffffdd",
    emissive: "#ffff00",
    collider: false,
  }).activate();
  // sun.get()

  // Create Mountains
  for (let i = 0; i < 3; i++) {
    const mountain = makeBox(world, {
      x: (i - 1) * 20,
      y: -10,
      z: -40,
      w: 20,
      h: 20,
      d: 20,
      color: "#44ba63",
      collider: false,
    }).activate();
    mountain
      .get(Transform)
      .rotation.setFromEuler(new THREE.Euler(-Math.PI / 4, 0, -Math.PI / 4));
  }
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

  // Ramp
  const ramp1 = makeBox(world, {
    ...{ x: 14.75, y: -5.5, z: 2 },
    ...{ w: 20, h: 0.5, d: 4 },
    color: "white",
    dynamic: false,
  }).activate();
  ramp1
    .get(Transform)
    .rotation.setFromEuler(
      new THREE.Euler(-Math.PI / 12, 0, -Math.PI / 6, "ZYX")
    );
  const ramp2 = makeBox(world, {
    ...{ x: 14.75, y: -5.5, z: -2 },
    ...{ w: 20, h: 0.5, d: 4 },
    color: "white",
    dynamic: false,
  }).activate();
  ramp2
    .get(Transform)
    .rotation.setFromEuler(
      new THREE.Euler(Math.PI / 12, 0, -Math.PI / 6, "ZYX")
    );

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
    metalness: 0.9,
    roughness: 0.2,
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
    .add(ThrustController, {
      thrust: 50,
      torque: 8,
    })
    .add(PointerPlane)
    .add(Transform)
    .add(Model, {
      asset: new Asset("/avatar.glb"),
    })
    .add(NormalizeMesh)
    .add(RigidBody, {
      kind: "DYNAMIC",
      linearDamping: 0.1,
      angularDamping: 12.5,
      mass: 0.5,
    })
    .add(Collider, {
      // shape: "BOX",
      // boxSize: new Vector3(1, 1, 1),
      shape: "CAPSULE",
      capsuleHeight: 0.8,
      capsuleRadius: 0.36,
    })
    .add(TransformEffects, {
      effects: [
        { function: "position", params: { position: new Vector3(0, 0, 0) } },
        {
          function: "oscillate-scale",
          params: {
            phase: 0,
            min: new Vector3(0.99, 1, 0.99),
            max: new Vector3(1.02, 1, 1.02),
          },
        },
        {
          function: "oscillate-scale",
          params: {
            phase: Math.PI,
            min: new Vector3(1, 0.99, 1),
            max: new Vector3(1, 1.01, 1),
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
      scale: new Vector3(0.6, 0.6, 0.6),
    })
    .add(TransformEffects, {
      effects: [
        {
          function: "oscillate-position",
          params: {
            phase: Math.PI,
            min: new Vector3(0, 0.0, 0),
            max: new Vector3(0, 0.02, 0),
          },
        },
      ],
    })
    .add(Model, {
      asset: new Asset("/head.glb"),
    })
    .add(NormalizeMesh)
    .activate();
  head.setParent(avatar);

  const face = makeEntity(world, "Face")
    .add(Transform, {
      position: new Vector3(0, 0, 0.4),
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
  face.setParent(head);

  const leftHand = makeBall(world, {
    ...{ x: -0.6, y: 0.0, z: 0.05 },
    r: 0.12,
    color: "#59a4d8",
    name: "LeftHand",
    linearDamping: 4,
  })
    .add(FixedJoint, {
      entity: avatar.id,
    })
    .add(HandController, {
      pointerPlaneEntity: avatar.id,
      keyStore: keyE,
    })
    .activate();
  // leftHand.setParent(avatar);

  const rightHand = makeBall(world, {
    ...{ x: 0.6, y: 0.0, z: 0.05 },
    r: 0.12,
    color: "#59a4d8",
    name: "RightHand",
    linearDamping: 4,
  })
    .add(FixedJoint, {
      entity: avatar.id,
    })
    .add(HandController, {
      pointerPlaneEntity: avatar.id,
      keyStore: keyQ,
    })
    .activate();
  // rightHand.setParent(avatar);

  // Chair
  const chair = makeEntity(world, "Chair")
    .add(NormalizeMesh)
    .add(Transform, {
      // Put it in the corner
      position: new Vector3(5, 0, -3),
      scale: new Vector3(0.75, 0.75, 0.75),
      rotation: new Quaternion().setFromEuler(
        new THREE.Euler(0, -Math.PI / 4, 0)
      ),
    })
    .add(TransformEffects, {
      effects: [
        { function: "position", params: { position: new Vector3(0, 0.35, 0) } },
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
      position: new Vector3(-20, 20, 10),
    })
    .add(Follow, {
      entity: avatar.id,
    })
    .add(DirectionalLight, {
      color: 0x553333,
      shadowTop: 24 - 10,
      shadowBottom: -24 - 10,
    })
    .activate();

  const sunLight = makeEntity(world, "DirectionalLight")
    .add(Transform, {
      position: new Vector3(5, 10, -20),
    })
    .add(Follow, {
      entity: avatar.id,
    })
    .add(DirectionalLight, {
      color: 0xdddddd,
    })
    .activate();
}
