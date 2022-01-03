import { get } from "svelte/store";
import { askMediaSetup } from "~/stores/askMediaSetup";
import { askAvatarSetup } from "~/stores/askAvatarSetup";
import { Dispatch, State } from "../ProgramTypes";

export const nextSetupStep = (state: State) => async (
  dispatch: Dispatch
) => {
  if (!state.audioVideoSetupDone) {
    const skipAudioVideoSetup = get(askMediaSetup) === false;
    if (!skipAudioVideoSetup) {
      dispatch({ id: "setUpAudioVideo" });
    } else {
      dispatch({ id: "didSetUpAudioVideo", state: null });
    }
  } else if (!state.avatarSetupDone) {
    const skipAvatarSetup = get(askAvatarSetup) === false;
    if (!skipAvatarSetup) {
      dispatch({ id: "setUpAvatar" });
    } else {
      dispatch({ id: "didSetUpAvatar", appearance: null });
    }
  } else {
    dispatch({ id: "loading" });
  }
};
