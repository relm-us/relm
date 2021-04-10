import { makeAvatar } from "./makeAvatar";

import { ThrustController } from "~/ecs/plugins/player-control";

export function makeAvatarAndActivate(world, { x = 0, y = 0.75, z = 0 } = {}) {
  const { avatar, head } = makeAvatar(world, { x, y, z });

  avatar
    .add(ThrustController, {
      thrust: 15,
      torque: 5,
    })
    .activate();

  head.activate();

  return avatar;
}
