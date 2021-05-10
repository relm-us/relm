import { Vector3 } from "three";

import { makeAvatar } from "./makeAvatar";

import { Controller } from "~/ecs/plugins/player-control";
import { TwistBone } from "~/ecs/plugins/twist-bone";
import { headFollowsPointer } from "~/ecs/plugins/twist-bone/headFollowsPointer";

export function makeAvatarAndActivate(world, { x = 0, y = 0.75, z = 0 } = {}) {
  const { avatar, head, emoji } = makeAvatar(world, { x, y, z });

  avatar
    .add(Controller)
    .add(TwistBone, {
      boneName: "mixamorigHead",
      function: headFollowsPointer,
    })
    .activate();

  head.activate();

  emoji.activate();

  return avatar;
}
