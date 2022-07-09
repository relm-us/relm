import { Vector3 } from "three";

import { AVATAR_INTERACTION } from "~/config/colliderInteractions";
import type { DecoratedECSWorld } from "~/types/DecoratedECSWorld";

import { makeEntity } from "~/prefab/makeEntity";

import { Entity } from "~/ecs/base";
import { Asset, Transform } from "~/ecs/plugins/core";
import { Model } from "~/ecs/plugins/model";
import { PointerPosition } from "~/ecs/plugins/pointer-position";
import {
  RigidBody,
  Collider,
  Impactable,
  PhysicsOptions,
  Collider2,
} from "~/ecs/plugins/physics";
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
    .add(PhysicsOptions, {
      rotRestrict: "Y",
    })
    .add(Collider2, {
      kind: "AVATAR-PLAY",
      shape: "CAPSULE",
      size: new Vector3(0.5, 1.8, 0),
      offset: new Vector3(0, 1.1, 0),
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
