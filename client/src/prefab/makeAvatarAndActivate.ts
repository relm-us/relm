import { makeAvatar } from "./makeAvatar";

import {
  HandController,
  HeadController,
  ThrustController,
} from "~/ecs/plugins/player-control";

import { keyE, keyQ } from "~/input";

export function makeAvatarAndActivate(world, { x = 0, y = 0.75, z = 0 } = {}) {
  const { avatar, } = makeAvatar(world, {
    x,
    y,
    z,
  });

  avatar
    .add(ThrustController, {
      thrust: 15,
      torque: 5,
    })
    .activate();

  return avatar;
}
