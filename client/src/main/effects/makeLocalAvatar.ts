import type { DecoratedECSWorld } from "~/types";
import type { Dispatch } from "../ProgramTypes";

import { Vector3 } from "three";

import { Entity } from "~/ecs/base";
import { Interactor } from "~/ecs/plugins/interactor";
import { Controller } from "~/ecs/plugins/player-control";
import { BoneTwist, headFollowsPointer } from "~/ecs/plugins/bone-twist";

import { worldManager } from "~/world";

import { makeAvatarEntities } from "~/identity/Avatar/makeAvatarEntities";
import { participantId } from "~/identity/participantId";
import { Avatar } from "~/identity/Avatar";

export const makeLocalAvatar =
  (ecsWorld: DecoratedECSWorld, position: Vector3) => (dispatch: Dispatch) => {
    const entities = makeAvatarEntities(ecsWorld, position, false, participantId);

    const avatar = new Avatar(ecsWorld, entities);

    const storeHeadAngle = (angle) => {
      if (avatar) avatar.headAngle = angle;
    };

    entities.body
      .add(Controller, { onActivity: () => worldManager.didControlAvatar() })
      .add(Interactor)
      .add(BoneTwist, {
        boneName: "mixamorigHead",
        function: headFollowsPointer(storeHeadAngle),
      });

    Object.values(entities).forEach((entity: Entity) => entity.activate());

    dispatch({ id: "didMakeLocalAvatar", avatar });
  };
