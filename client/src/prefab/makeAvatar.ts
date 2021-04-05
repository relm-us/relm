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

export function makeAvatar(
  world,
  { x = 0, y = 0, z = 0, kinematic = false } = {},
  id?
) {
  // Create the avatar's torso, which we connect everything else to
  const avatar = makeEntity(world, "Avatar", id)
    .add(PointerPlane)
    .add(Impactable)
    .add(Transform, {
      position: new Vector3(x, y, z),
      scale: new Vector3(0.25, 0.25, 0.25),
    })
    .add(Model, {
      asset: new Asset("/humanoid.glb"),
    })
    .add(NormalizeMesh)
    .add(Animation, {
      clipName: "breathing idle",
    })
    .add(FaceMapColors, {
      colors: {
        shoes: ["#ffffff", 0.9],
        skin: ["#ffcd94", 0.9],
        hair: ["#aa8833", 0.9],
        arms: ["#ffcd94", 0.9],
        cuffs: ["#ffcd94", 0.9],
        beard: ["#ffcd94", 0.9],
        belt: ["#ffffff", 0.9],
        pelvis: ["#a0a0ff", 0.9],
        shorts: ["#a0a0ff", 0.9],
        capris: ["#a0a0ff", 0.9],
        socks: ["#a0a0ff", 0.9],
        collar: ["#ffffff", 0.9],
        top: ["#ffffff", 0.9],
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
      // capsuleHeight: 0.8,
      // capsuleRadius: 0.36,
      capsuleHeight: 5.5,
      capsuleRadius: 1,
      offset: new Vector3(0, 3.5, 0),
      // interaction: AVATAR_INTERACTION,
    })
    .add(Interactive, { mouse: false });

  // Move these things as a unit on portal
  avatar.subgroup = [];

  return { avatar };
}
