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
  } else if (state.avatarSetupDone) {
    dispatch({ id: "loadStart" });
  } else {
    if (state.savedIdentity && state.savedIdentity.appearance) {
      dispatch({ id: "didSetUpAvatar", appearance: state.savedIdentity.appearance });
    } else {
      const skipAvatarSetup = get(askAvatarSetup) === false;
      if (!skipAvatarSetup) {
        dispatch({ id: "setUpAvatar" });
      } else {
        dispatch({ id: "didSetUpAvatar", appearance: null });
      }
    }
  }
};
