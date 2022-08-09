import { FALLING } from "~/config/constants";

import { Entity } from "~/ecs/base";
import { Animation } from "~/ecs/plugins/animation";
import { BoneTwist } from "~/ecs/plugins/bone-twist";

export function changeAnimationClip(
  entity: Entity,
  clipName: string,
  loop: boolean = false
) {
  const animation: Animation = entity.get(Animation);

  // The falling animation doesn't look good if the head is "upright",
  // so we disable the head-follows-mouse BoneTwist for this case
  if (entity.name === "Avatar" && entity.has(BoneTwist)) {
    const isFalling = clipName === FALLING;

    if (isFalling) {
      animation.maybeChangeClip(FALLING, true);
    } else {
      animation.maybeChangeClip(clipName, loop);
    }

    const twist: BoneTwist = entity.get(BoneTwist);
    twist.enabled = !isFalling;
  } else {
    // Any other animation clip is handled the usual way
    animation.maybeChangeClip(clipName, loop);
  }
}
