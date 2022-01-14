import { Participant, UpdateData } from "~/identity/types";
import { mapParticipantEffect } from "../mapParticipantEffect";
import { Dispatch } from "../ProgramTypes";
import { updateLocalParticipant as ulp } from "~/identity/effects/updateLocalParticipant";

// Wrap the Participant Program's `updateLocalParticipant` message, so we
// can call it easily from the Main Program
export const updateLocalParticipant =
  (localParticipant: Participant, updateData: UpdateData) =>
  (dispatch: Dispatch) => {
    mapParticipantEffect(ulp(localParticipant, updateData))(dispatch);
  };
