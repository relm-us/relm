import { Vector3 } from "three";
import { get } from "svelte/store";
import { DecoratedECSWorld } from "~/types/DecoratedECSWorld";

import { makeLocalAvatar } from "../Avatar/makeAvatar";
import { localIdentityData } from "../identityData";
import { playerId } from "../playerId";
import { Dispatch } from "../ProgramTypes";
import { Appearance, Participant } from "../types";
import { Avatar } from "../Avatar";
import { setAvatarFromParticipant } from "../Avatar";

export const makeLocalParticipant =
  (
    ecsWorld: DecoratedECSWorld,
    position: Vector3,
    clientId: number,
    appearance: Appearance
  ) =>
  (dispatch: Dispatch) => {
    const entities = makeLocalAvatar(ecsWorld, position, () => {});

    const identityData = get(localIdentityData);
    identityData.clientId = clientId;

    // Participant may have chosen appearance from 'quick start' avatar screen
    if (appearance) identityData.appearance = appearance;

    const localParticipant: Participant = {
      participantId: playerId,
      isLocal: true,
      modified: false,
      identityData,
      avatar: new Avatar(ecsWorld, entities),
    };

    setAvatarFromParticipant(localParticipant);

    dispatch({ id: "didMakeLocalParticipant", localParticipant });
  };
