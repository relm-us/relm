import { Vector3 } from "three";

import { Controller } from "~/ecs/plugins/player-control";
import { TwistBone, headFollowsPointer } from "~/ecs/plugins/twist-bone";

import type { DecoratedECSWorld, Participant } from "~/types";
import type { Dispatch } from "../ProgramTypes";

import { makeAvatarEntities } from "~/identity/Avatar/makeAvatarEntities";
import { Avatar, setAvatarFromParticipant } from "~/identity/Avatar";

export const makeLocalAvatar =
  (
    localParticipant: Participant,
    ecsWorld: DecoratedECSWorld,
    position: Vector3,
    clientId: number,
    showAudio: boolean,
    showVideo: boolean
  ) =>
  (dispatch: Dispatch) => {
    const entities = makeAvatarEntities(ecsWorld, position, false);

    const avatar = new Avatar(ecsWorld, entities);

    const storeHeadAngle = (angle) => {
      if (avatar) avatar.headAngle = angle;
    };

    entities.body.add(Controller).add(TwistBone, {
      boneName: "mixamorigHead",
      function: headFollowsPointer(storeHeadAngle),
    });

    Object.values(entities).forEach((entity) => entity.activate());

    localParticipant.avatar = avatar;

    localParticipant.identityData = {
      ...localParticipant.identityData,
      ...{
        clientId,
        showVideo,
        showAudio,
      },
    };

    setAvatarFromParticipant(localParticipant);

    dispatch({ id: "didMakeLocalAvatar", avatar });
  };
