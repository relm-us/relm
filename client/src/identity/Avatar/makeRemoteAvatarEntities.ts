import { Vector3 } from "three";

import type { DecoratedECSWorld } from "~/types/DecoratedECSWorld";
import { BoneTwist, headFollowsAngle } from "~/ecs/plugins/bone-twist";
import { Distance } from "~/ecs/plugins/distance";

import { AvatarEntities } from "~/types";
import { playerId } from "../playerId";
import { makeAvatarEntities } from "./makeAvatarEntities";

export function makeRemoteAvatarEntities(
  this: void,
  ecsWorld: DecoratedECSWorld,
  position: Vector3,
  participantId: string,
  getHeadAngle: () => number
): AvatarEntities {
  const entities = makeAvatarEntities(ecsWorld, position, true, participantId);

  entities.body
    .add(BoneTwist, {
      boneName: "mixamorigHead",
      function: headFollowsAngle(getHeadAngle),
    })
    .add(Distance, {
      target: playerId,
    });

  Object.values(entities).forEach((entity) => entity.activate());

  return entities;
}
