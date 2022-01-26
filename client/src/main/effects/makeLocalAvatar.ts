import { Vector3 } from "three";

import { Controller } from "~/ecs/plugins/player-control";
import { TwistBone, headFollowsPointer } from "~/ecs/plugins/twist-bone";

import type { DecoratedECSWorld, Participant } from "~/types";
import type { Dispatch } from "../ProgramTypes";

import { makeAvatarEntities } from "~/identity/Avatar/makeAvatarEntities";
import { Avatar, setAvatarFromParticipant } from "~/identity/Avatar";
import { Entity } from "~/ecs/base";

export const makeLocalAvatar =
  (ecsWorld: DecoratedECSWorld, position: Vector3) => (dispatch: Dispatch) => {
    const entities = makeAvatarEntities(ecsWorld, position, false);

    const avatar = new Avatar(ecsWorld, entities);

    const storeHeadAngle = (angle) => {
      if (avatar) avatar.headAngle = angle;
    };

    entities.body.add(Controller).add(TwistBone, {
      boneName: "mixamorigHead",
      function: headFollowsPointer(storeHeadAngle),
    });

    Object.values(entities).forEach((entity: Entity) => entity.activate());

    dispatch({ id: "didMakeLocalAvatar", avatar });
  };
