import { makeAvatar } from "./makeAvatar";

import {
  HandController,
  HeadController,
  ThrustController,
} from "~/ecs/plugins/player-control";

import { keyE, keyQ } from "~/input";

export function makeAvatarAndActivate(
  world,
  { x = 0, y = 0.75, z = -10 } = {}
) {
  const { avatar, head, face, leftHand, rightHand } = makeAvatar(world, {
    x,
    y,
    z,
  });

  avatar
    .add(ThrustController, {
      thrust: 15,
      torque: 4,
    })
    .activate();

  head.add(HeadController).activate();

  face.activate();

  leftHand
    .add(HandController, {
      pointerPlaneEntity: avatar.id,
      keyStore: keyE,
    })
    .activate();

  // Right Hand (from avatar's point of view)
  rightHand
    .add(HandController, {
      pointerPlaneEntity: avatar.id,
      keyStore: keyQ,
    })
    .activate();

  return avatar;
}
