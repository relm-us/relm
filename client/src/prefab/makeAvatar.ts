import { Vector3 } from "three";

import { AVATAR_INTERACTION } from "~/config/colliderInteractions";

import { makeEntity } from "./index";

import { Entity } from "~/ecs/base";
import { Asset, Transform } from "~/ecs/plugins/core";
import { Model } from "~/ecs/plugins/model";
import {
  PointerPosition,
  PointerPositionRef,
} from "~/ecs/plugins/pointer-position";
import { RigidBody, Collider, Impactable } from "~/ecs/plugins/physics";
import { Animation } from "~/ecs/plugins/animation";
import { IDLE } from "~/ecs/plugins/player-control/constants";

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
      asset: new Asset("/humanoid-002.glb"),
    })
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

  const emoji = makeEntity(world, "AvatarEmoji").add(Transform, {
    position: new Vector3(0, UNSCALED_CHARACTER_HEIGHT, 0),
  });
  emoji.setParent(avatar);

  // Move these things as a unit on portal
  avatar.subgroup = [];

  return { avatar, head, emoji };
}
