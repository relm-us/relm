import { Dispatch } from "../ProgramTypes";
import { Participant, UpdateData } from "~/identity/types";
import { setAvatarFromParticipant } from "~/identity/Avatar/setAvatarFromParticipant";

export const updateLocalParticipant =
  (localParticipant: Participant, updateData: UpdateData) =>
  (dispatch: Dispatch) => {
    // Merge existing IdentityData with UpdateData
    const identityData = (localParticipant.identityData = {
      ...localParticipant.identityData,
      ...updateData,
    });

    // Update locally
    if (localParticipant.avatar) {
      setAvatarFromParticipant(localParticipant);
    }

    // Tell everyone else to update our avatar
    dispatch({
      id: "sendLocalParticipantData",
      identityData,
    });
  };
