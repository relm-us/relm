import { Euler, Quaternion, Spherical, Vector3 } from "three";

import type { DecoratedECSWorld } from "~/types/DecoratedECSWorld";

import {
  IDLE,
  AVATAR_BODY_SCALE,
  AVATAR_HEIGHT_UNSCALED,
  COLLIDER_HEIGHT_STAND,
  OCULUS_HEIGHT_STAND,
  PROXIMITY_CAMERA_GRAVITY_INNER_RADIUS,
  PROXIMITY_CAMERA_GRAVITY_OUTER_RADIUS,
} from "~/config/constants";
import { AvatarEntities } from "~/types";

import { makeEntity } from "~/prefab/makeEntity";

import { Entity } from "~/ecs/base";
import { Asset, Transform } from "~/ecs/plugins/core";
import { Model3 } from "~/ecs/plugins/model";
import { PointerPosition } from "~/ecs/plugins/pointer-position";
import { Impactable } from "~/ecs/plugins/physics";
import {
  PhysicsOptions,
  Collider3,
  Collider3Active,
} from "~/ecs/plugins/collider";
import { Animation } from "~/ecs/plugins/animation";
import { Repulsive } from "~/ecs/plugins/player-control";
import {
  AlwaysOnStage,
  CameraGravity,
  CameraGravityActive,
} from "~/ecs/plugins/camera";
import { Particles2 } from "~/ecs/plugins/particles";

import avatarsGlb from "./avatars.glb";

export function makeAvatarEntities(
  world: DecoratedECSWorld,
  participantId: string,
  {
    position = new Vector3(),
    kinematic = false,
  }: { position?: Vector3; kinematic?: boolean }
): AvatarEntities {
  // Create the avatar's torso, which we connect everything else to
  const body: Entity = makeEntity(world, "Avatar", participantId)
    .add(Transform, {
      position: new Vector3().copy(position),
      rotation: new Quaternion().setFromEuler(new Euler(0, Math.PI, 0)),
      scale: new Vector3().setScalar(AVATAR_BODY_SCALE),
    })
    .add(PointerPosition, {
      offset: new Vector3(0, 1, 0),
    })

    .add(CameraGravityActive)
    .add(CameraGravity, {
      mass: 1.0,
      range: new Vector3(
        PROXIMITY_CAMERA_GRAVITY_INNER_RADIUS,
        PROXIMITY_CAMERA_GRAVITY_OUTER_RADIUS
      ),
      sphere: new Spherical(OCULUS_HEIGHT_STAND),
    })

    .add(Repulsive)
    .add(Impactable)
    .add(Model3, { asset: new Asset(avatarsGlb) })
    .add(Animation, {
      clipName: IDLE,
    })
    .add(PhysicsOptions, {
      rotRestrict: "Y",
    })
    .add(AlwaysOnStage)

    .add(Collider3Active)
    .add(Collider3, {
      kind: kinematic ? "AVATAR-OTHER" : "AVATAR-PLAY",
      shape: "CAPSULE",
      size: new Vector3(0.5, COLLIDER_HEIGHT_STAND, 0),
      offset: new Vector3(0, 1.1, 0),
    })

    .add(Particles2, {
      pattern: "RING",
      params: new Vector3(2, 0.05, 1),
      offset: new Vector3(0, 1.5, 0),
      sprite: "circle_05",
      onTop: true,
      relative: false,
      startColor: "#ff00ff",
      endColor: "#00ffff",
      sizeMin: 10,
      sizeMax: 20,
      rate: 50,
      maxParticles: 1000,
      particleLt: 1,
      effectLt: 0,
      fadeIn: 1,
      fadeOut: 1,
    });

  const head = makeEntity(world, "AvatarHead")
    .add(Transform, {
      position: new Vector3(0, AVATAR_HEIGHT_UNSCALED, 0),
    })
    .add(AlwaysOnStage);
  head.setParent(body);

  const emoji = makeEntity(world, "AvatarEmoji")
    .add(Transform, {
      position: new Vector3(0, AVATAR_HEIGHT_UNSCALED, 0),
    })
    .add(AlwaysOnStage);
  emoji.setParent(body);

  return { body, head, emoji };
}
