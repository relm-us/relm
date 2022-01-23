import { AVConnection } from "av";

import { Participant } from "~/identity/types";
import { updateLocalParticipant } from "./updateLocalParticipant";

import { Dispatch } from "../ProgramTypes";

export const joinAudioVideo =
  (
    localParticipant: Participant,
    avConnection: AVConnection,
    avDisconnect: Function,
    audioDesired: boolean,
    videoDesired: boolean,
    relmDocId: string,
    twilioToken: string
  ) =>
  async (dispatch: Dispatch) => {
    if (avDisconnect) {
      try {
        // await avDisconnect();
      } catch {}
    }

    // Join the room
    const disconnect = await avConnection.connect({
      roomId: relmDocId,
      token: twilioToken,
      // displayName: localParticipant.identityData.name,
      produceAudio: audioDesired,
      produceVideo: videoDesired,
    });

    dispatch({ id: "didJoinAudioVideo", avDisconnect: disconnect });
  };
