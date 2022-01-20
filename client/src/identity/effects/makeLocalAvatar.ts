import { Vector3 } from "three";
import { get } from "svelte/store";
import { DecoratedECSWorld } from "~/types/DecoratedECSWorld";

import { Controller } from "~/ecs/plugins/player-control";
import { TwistBone, headFollowsPointer } from "~/ecs/plugins/twist-bone";

import { makeAvatarEntities } from "../Avatar/makeAvatarEntities";
import { localIdentityData } from "../identityData";
import { playerId } from "../playerId";
import { Dispatch } from "../ProgramTypes";
import { Appearance, Participant } from "../types";
import { Avatar } from "../Avatar";
import { setAvatarFromParticipant } from "../Avatar";

export const makeLocalAvatar =
  (
    // localParticipant: Participant,
    ecsWorld: DecoratedECSWorld,
    position: Vector3
    // clientId: number,
    // appearance: Appearance
  ) =>
  (dispatch: Dispatch) => {
    const entities = makeAvatarEntities(ecsWorld, position, false);

    // const identityData = get(localIdentityData);
    // identityData.clientId = clientId;

    // Participant may have chosen appearance from 'quick start' avatar screen
    // if (appearance) identityData.appearance = appearance;

    // const localParticipant: Participant = {
    //   participantId: playerId,
    //   isLocal: true,
    //   modified: false,
    //   identityData,
    // };

    const avatar = new Avatar(ecsWorld, entities);

    const storeHeadAngle = (angle) => {
      if (avatar) avatar.headAngle = angle;
    };

    entities.body.add(Controller, { canFly: true }).add(TwistBone, {
      boneName: "mixamorigHead",
      function: headFollowsPointer(storeHeadAngle),
    });

    Object.values(entities).forEach((entity) => entity.activate());

    dispatch({ id: "didMakeLocalAvatar", avatar });
  };
