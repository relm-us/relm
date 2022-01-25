import { Dispatch } from "../ProgramTypes";
import { Participant, UpdateData } from "types/identity";
import { setAvatarFromParticipant} from "~/identity/Avatar/setAvatarFromParticipant";

export const updateLocalParticipant =
  (localParticipant: Participant, updateData: UpdateData) =>
  (dispatch: Dispatch) => {
    // Merge existing IdentityData with UpdateData
    const identityData = (localParticipant.identityData = {
      ...localParticipant.identityData,
      ...updateData,
    });

    console.log("updateLocalParticipant", updateData);

    // Update locally
    if (localParticipant.avatar) {
      setAvatarFromParticipant(localParticipant);
      console.log("set avatar");
    } else {
      console.log("no set avatar");
    }

    // Tell everyone else to update our avatar
    dispatch({
      id: "sendLocalParticipantData",
      identityData,
    });
  };
