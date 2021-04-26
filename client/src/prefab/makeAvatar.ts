import { Vector3 } from "three";

import { Entity } from "~/ecs/base";
import { Asset, Model, Transform } from "~/ecs/plugins/core";
import { NormalizeMesh } from "~/ecs/plugins/normalize";
import {
  PointerPosition,
  PointerPositionRef,
} from "~/ecs/plugins/pointer-position";
import { RigidBody, Collider, Impactable } from "~/ecs/plugins/physics";
import { NonInteractive } from "~/ecs/plugins/non-interactive";
import { Animation } from "~/ecs/plugins/animation";
import { IDLE } from "~/ecs/plugins/player-control/constants";
import { LineHelper } from "~/ecs/plugins/line-helper";

import { makeEntity } from "./index";

import { AVATAR_INTERACTION } from "~/config/colliderInteractions";

const UNSCALED_CHARACTER_HEIGHT = 7;

function getPointerPosition(entity) {
  const pointer = entity.get(PointerPositionRef)?.value;
  return pointer?.points.xz;
}

export function makeAvatar(
  world,
  { x = 0, y = 0, z = 0, kinematic = false } = {},
  id?
) {
  // Create the avatar's torso, which we connect everything else to
  const avatar: Entity = makeEntity(world, "Avatar", id)
    // .add(LineHelper, { function: getPointerPosition })
    .add(PointerPosition, {
      offset: new Vector3(0, 1, 0),
    })
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
    });

  const head = makeEntity(world, "AvatarHead").add(Transform, {
    position: new Vector3(0, UNSCALED_CHARACTER_HEIGHT, 0),
  });
  head.setParent(avatar);

  // Move these things as a unit on portal
  avatar.subgroup = [];

  return { avatar, head };
}
