import { AVConnection } from "av";

import { Participant } from "~/types";

import { Dispatch } from "../ProgramTypes";

export const joinAudioVideo =
  (
    localParticipant: Participant,
    avConnection: AVConnection,
    avDisconnect: Function,
    relmDocId: string,
    twilioToken: string
  ) =>
  async (dispatch: Dispatch) => {
    if (avDisconnect) {
      try {
        // await avDisconnect();
      } catch {}
    }

    const idData = {
      roomId: relmDocId,
      displayName: localParticipant.identityData.name,
    };

    // Join the room
    console.log("Joining video conference room", idData);
    const disconnect = await avConnection.connect({
      ...idData,
      token: twilioToken,
    });

    dispatch({
      id: "didJoinAudioVideo",
      avDisconnect: () => {
        console.log("Leaving video conference room", idData);
        disconnect();
      },
    });
  };
