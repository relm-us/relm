import { get } from "svelte/store";
import { askMediaSetup } from "~/stores/askMediaSetup";
import { askAvatarSetup } from "~/stores/askAvatarSetup";
import { Dispatch, State } from "../ProgramTypes";

export const nextSetupStep = (state: State) => async (dispatch: Dispatch) => {
  if (!state.audioVideoSetupDone) {
    const skipAudioVideoSetup = get(askMediaSetup) === false;
    if (skipAudioVideoSetup) {
      dispatch({
        id: "didSetUpAudioVideo",
        audioDesired: false,
        videoDesired: false,
      });
    } else {
      dispatch({ id: "setUpAudioVideo" });
    }
  } else if (!state.avatarSetupDone) {
    const skipAvatarSetup = get(askAvatarSetup) === false;
    if (!skipAvatarSetup) {
      dispatch({ id: "setUpAvatar" });
    } else {
      dispatch({ id: "didSetUpAvatar", appearance: null });
    }
  } else {
    dispatch({ id: "loadStart" });
  }
};
