import { Vector3 } from "three";

import { Controller } from "~/ecs/plugins/player-control";
import { BoneTwist, headFollowsPointer } from "~/ecs/plugins/bone-twist";

import type { DecoratedECSWorld } from "~/types";
import type { Dispatch } from "../ProgramTypes";

import { makeAvatarEntities } from "~/identity/Avatar/makeAvatarEntities";
import { Avatar } from "~/identity/Avatar";
import { Entity } from "~/ecs/base";
import { playerId } from "~/identity/playerId";

export const makeLocalAvatar =
  (ecsWorld: DecoratedECSWorld, position: Vector3) => (dispatch: Dispatch) => {
    const entities = makeAvatarEntities(ecsWorld, position, false, playerId);

    const avatar = new Avatar(ecsWorld, entities);

    const storeHeadAngle = (angle) => {
      if (avatar) avatar.headAngle = angle;
    };

    entities.body.add(Controller).add(BoneTwist, {
      boneName: "mixamorigHead",
      function: headFollowsPointer(storeHeadAngle),
    });

    Object.values(entities).forEach((entity: Entity) => entity.activate());

    dispatch({ id: "didMakeLocalAvatar", avatar });
  };
