import type { AVConnection } from "av"

import type { Participant } from "~/types"

import type { Dispatch } from "../ProgramTypes"

export const joinAudioVideo =
  (
    localParticipant: Participant,
    avConnection: AVConnection,
    avDisconnectPrevious: Function,
    roomId: string,
    twilioToken: string,
  ) =>
  async (dispatch: Dispatch) => {
    if (avDisconnectPrevious) {
      console.log("joinAudioVideo disconnect previous...")
      await avDisconnectPrevious()
    } else {
      console.log("joinAudioVideo first time")
    }

    // Join the room
    console.log("joinAudioVideo connect...")
    const avDisconnect = await avConnection.connect({
      roomId,
      displayName: localParticipant.identityData.name,
      token: twilioToken,
    })
    console.log("joinAudioVideo joined")

    dispatch({ id: "didJoinAudioVideo", avDisconnect })
  }
