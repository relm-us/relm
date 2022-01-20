import { Vector3 } from "three";
import { DecoratedECSWorld } from "~/types/DecoratedECSWorld";

import { Controller } from "~/ecs/plugins/player-control";
import { TwistBone, headFollowsPointer } from "~/ecs/plugins/twist-bone";

import { makeAvatarEntities } from "../Avatar/makeAvatarEntities";
import { Dispatch } from "../ProgramTypes";
import { Avatar } from "../Avatar";

export const makeLocalAvatar =
  (ecsWorld: DecoratedECSWorld, position: Vector3) => (dispatch: Dispatch) => {
    const entities = makeAvatarEntities(ecsWorld, position, false);

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
