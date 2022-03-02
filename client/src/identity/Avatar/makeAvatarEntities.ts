import { Vector3 } from "three";

import { AVATAR_INTERACTION } from "~/config/colliderInteractions";
import type { DecoratedECSWorld } from "~/types/DecoratedECSWorld";

import { makeEntity } from "~/prefab/makeEntity";

import { Entity } from "~/ecs/base";
import { Asset, Transform } from "~/ecs/plugins/core";
import { Model } from "~/ecs/plugins/model";
import { PointerPosition } from "~/ecs/plugins/pointer-position";
import { RigidBody, Collider, Impactable } from "~/ecs/plugins/physics";
import { Animation } from "~/ecs/plugins/animation";
import { Repulsive } from "~/ecs/plugins/player-control";
import { TranslucentOptions } from "~/ecs/plugins/translucent";
import { AVATAR_HEIGHT_UNSCALED, IDLE } from "~/config/constants";

import { AvatarEntities } from "~/types";

export function makeAvatarEntities(
  world: DecoratedECSWorld,
  position: Vector3,
  kinematic: boolean,
  participantId: string
): AvatarEntities {
  // Create the avatar's torso, which we connect everything else to
  const body: Entity = makeEntity(world, "Avatar", participantId)
    .add(PointerPosition, {
      offset: new Vector3(0, 1, 0),
    })
    .add(Repulsive)
    .add(Impactable)
    .add(Transform, {
      position: new Vector3().copy(position),
      scale: new Vector3(0.25, 0.25, 0.25),
    })
    .add(Model, {
      asset: new Asset("/humanoid-003.glb"),
    })
    .add(TranslucentOptions, { time: 100 })
    .add(Animation, {
      clipName: IDLE,
    })
    .add(RigidBody, {
      kind: kinematic ? "KINEMATIC" : "DYNAMIC",
      linearDamping: 20,
      angularDamping: 25,
    })
    .add(Collider, {
      shape: "CAPSULE",
      capsuleHeight: 5.5,
      capsuleRadius: 1,
      offset: new Vector3(0, AVATAR_HEIGHT_UNSCALED / 2, 0),
      interaction: AVATAR_INTERACTION,
    });

  const head = makeEntity(world, "AvatarHead").add(Transform, {
    position: new Vector3(0, AVATAR_HEIGHT_UNSCALED, 0),
  });
  head.setParent(body);

  const emoji = makeEntity(world, "AvatarEmoji").add(Transform, {
    position: new Vector3(0, AVATAR_HEIGHT_UNSCALED, 0),
  });
  emoji.setParent(body);

  // Move these things as a unit on portal
  body.subgroup = [];

  return { body, head, emoji };
}
