import { makeAvatar } from "./makeAvatar";

import { Controller } from "~/ecs/plugins/player-control";

export function makeAvatarAndActivate(world, { x = 0, y = 0.75, z = 0 } = {}) {
  const { avatar, head, emoji } = makeAvatar(world, { x, y, z });

  avatar.add(Controller).activate();

  head.activate();

  emoji.activate();

  return avatar;
}
