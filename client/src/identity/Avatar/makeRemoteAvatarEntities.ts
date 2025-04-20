import { Vector3 } from "three"

import type { DecoratedECSWorld } from "~/types/DecoratedECSWorld"
import { BoneTwist, headFollowsAngle } from "~/ecs/plugins/bone-twist"
import { Distance } from "~/ecs/plugins/distance"

import type { AvatarEntities } from "~/types"
import { participantId as localParticipantId } from "../participantId"
import { makeAvatarEntities } from "./makeAvatarEntities"

export function makeRemoteAvatarEntities(
  ecsWorld: DecoratedECSWorld,
  participantId: string,
  {
    position = new Vector3(),
    getHeadAngle = () => 0,
  }: {
    getHeadAngle?: () => number
    position?: Vector3
  },
): AvatarEntities {
  const entities = makeAvatarEntities(ecsWorld, participantId, {
    position,
    kinematic: true,
  })

  entities.body
    .add(BoneTwist, {
      boneName: "mixamorigHead",
      function: headFollowsAngle(getHeadAngle),
    })
    .add(Distance, {
      // Remote avatars all measure their distance to the local avatar
      target: localParticipantId,
    })

  Object.values(entities).forEach((entity) => entity.activate())

  return entities
}
