import { AVConnection } from "av";

import { Participant } from "~/types";

import { Dispatch } from "../ProgramTypes";

export const joinAudioVideo =
  (
    localParticipant: Participant,
    avConnection: AVConnection,
    avDisconnectPrevious: Function,
    relmDocId: string,
    twilioToken: string
  ) =>
  async (dispatch: Dispatch) => {
    if (avDisconnectPrevious) {
      console.log("joinAudioVideo disconnect previous...");
      await avDisconnectPrevious();
    } else {
      console.log("joinAudioVideo first time");
    }

    // Join the room
    console.log("joinAudioVideo connect...");
    const avDisconnect = await avConnection.connect({
      roomId: relmDocId,
      displayName: localParticipant.identityData.name,
      token: twilioToken,
    });
    console.log("joinAudioVideo joined");

    dispatch({ id: "didJoinAudioVideo", avDisconnect });
  };
