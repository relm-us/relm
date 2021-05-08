import { makeAvatar } from "./makeAvatar";

import { Controller } from "~/ecs/plugins/player-control";
import { BoneFollowsPointer } from "~/ecs/plugins/bone-follows-pointer";

export function makeAvatarAndActivate(world, { x = 0, y = 0.75, z = 0 } = {}) {
  const { avatar, head, emoji } = makeAvatar(world, { x, y, z });

  avatar
    .add(Controller)
    .add(BoneFollowsPointer, { boneName: "mixamorigHead" })
    .activate();

  head.activate();

  emoji.activate();

  return avatar;
}
