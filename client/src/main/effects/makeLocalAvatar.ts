import type { DecoratedECSWorld } from "~/types";
import type { Dispatch } from "../ProgramTypes";

import { Vector3 } from "three";

import { Entity } from "~/ecs/base";
import { Interactor } from "~/ecs/plugins/interactor";
import { Controller } from "~/ecs/plugins/player-control";
import { BoneTwist, headFollowsPointer } from "~/ecs/plugins/bone-twist";

import { makeAvatarEntities } from "~/identity/Avatar/makeAvatarEntities";
import { participantId } from "~/identity/participantId";
import { Avatar } from "~/identity/Avatar";

export const makeLocalAvatar =
  (ecsWorld: DecoratedECSWorld) => (dispatch: Dispatch) => {
    const entities = makeAvatarEntities(ecsWorld, participantId, {
      kinematic: false,
    });

    const avatar = new Avatar(ecsWorld, entities);

    const storeHeadAngle = (angle) => {
      if (avatar) avatar.headAngle = angle;
    };

    entities.body
      .add(Controller)
      .add(Interactor)
      .add(BoneTwist, {
        boneName: "mixamorigHead",
        function: headFollowsPointer(storeHeadAngle),
      });

    Object.values(entities).forEach((entity: Entity) => entity.activate());

    dispatch({ id: "didMakeLocalAvatar", avatar });
  };
