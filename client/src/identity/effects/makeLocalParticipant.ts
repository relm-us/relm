import { Vector3 } from "three";
import { get } from "svelte/store";
import { DecoratedECSWorld } from "~/types/DecoratedECSWorld";

import { makeLocalAvatar } from "../Avatar/makeAvatar";
import { localIdentityData } from "../identityData";
import { playerId } from "../playerId";
import { Dispatch } from "../ProgramTypes";
import { Appearance, Participant } from "../types";
import { Avatar2 } from "../Avatar2";
import { setAvatarFromParticipant } from "../Avatar";

export const makeLocalParticipant =
  (ecsWorld: DecoratedECSWorld, position: Vector3, appearance: Appearance) =>
  (dispatch: Dispatch) => {
    const entities = makeLocalAvatar(ecsWorld, position, () => {});
    const identityData = get(localIdentityData);
    if (appearance) identityData.appearance = appearance;
    const localParticipant: Participant = {
      participantId: playerId,
      isLocal: true,
      modified: false,
      identityData,
      avatar: new Avatar2(ecsWorld, entities),
    };

    setAvatarFromParticipant(localParticipant);

    dispatch({ id: "didMakeLocalParticipant", localParticipant });
  };
