import { Vector3 } from "three";

import { Asset, Transform } from "~/ecs/plugins/core";
import { Model } from "~/ecs/plugins/core";
import { NormalizeMesh } from "~/ecs/plugins/normalize";
import { PointerPlane } from "~/ecs/plugins/pointer-plane";
import { RigidBody, Collider, Impactable } from "~/ecs/plugins/physics";
import { Interactive } from "~/ecs/plugins/interactive";
import { Animation } from "~/ecs/plugins/animation";
import { FaceMapColors } from "~/ecs/plugins/coloration";

import { makeEntity } from "./index";
import { Morph } from "~/ecs/plugins/morph";
import { IDLE } from "~/ecs/plugins/player-control/constants";
import { Entity } from "~/ecs/base";

import { AVATAR_INTERACTION } from "~/config/colliderInteractions";

const UNSCALED_CHARACTER_HEIGHT = 7;

export function makeAvatar(
  world,
  { x = 0, y = 0, z = 0, kinematic = false } = {},
  id?
) {
  // Create the avatar's torso, which we connect everything else to
  const skin = "#ffcd94";
  const avatar: Entity = makeEntity(world, "Avatar", id)
    .add(PointerPlane)
    .add(Impactable)
    .add(Transform, {
      position: new Vector3(x, y, z),
      scale: new Vector3(0.25, 0.25, 0.25),
    })
    .add(Model, {
      asset: new Asset("/humanoid-001.glb"),
    })
    .add(NormalizeMesh)
    .add(Animation, {
      clipName: IDLE,
    })
    .add(Morph, {
      influences: {
        "gender": 0.8,
        "wide": 0.1,
        "hair": 0.1,
        "hair-02": 0,
      },
    })
    .add(FaceMapColors, {
      colors: {
        "hair": ["#aa8833", 0.9],
        "beard": [skin, 0.9],
        "skin": [skin, 0.9],
        "top-01": ["#ffc0cb", 0.9],
        "top-02": ["#ffc0cb", 0.9],
        "top-03": ["#ffc0cb", 0.9],
        "belt": ["#ffc0cb", 0.9],
        "pants-01": ["#ffffff", 0.9],
        "pants-02": ["#ffffff", 0.9],
        "pants-03": ["#ffffff", 0.9],
        "pants-04": [skin, 0.9],
        "shoes": ["#cccccc", 0.9],
      },
    })
    .add(RigidBody, {
      kind: kinematic ? "KINEMATIC" : "DYNAMIC",
      linearDamping: 20,
      angularDamping: 25,
      mass: 0.0,
    })
    .add(Collider, {
      shape: "CAPSULE",
      capsuleHeight: 5.5,
      capsuleRadius: 1,
      offset: new Vector3(0, UNSCALED_CHARACTER_HEIGHT / 2, 0),
      interaction: AVATAR_INTERACTION,
    })
    .add(Interactive, { mouse: false });

  const head = makeEntity(world, "AvatarHead").add(Transform, {
    position: new Vector3(0, UNSCALED_CHARACTER_HEIGHT, 0),
  });
  head.setParent(avatar);

  // Move these things as a unit on portal
  avatar.subgroup = [];

  return { avatar, head };
}
