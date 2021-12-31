import { get } from "svelte/store";
import { askMediaSetup } from "~/stores/askMediaSetup";
import { askAvatarSetup } from "~/stores/askAvatarSetup";
import { Dispatch, RelmState } from "../RelmStateAndMessage";

export const nextSetupStep = (state: RelmState) => async (
  dispatch: Dispatch
) => {
  if (!state.audioVideoSetupDone) {
    const skipAudioVideoSetup = get(askMediaSetup) === false;
    if (!skipAudioVideoSetup) {
      dispatch({ id: "configureAudioVideo" });
    } else {
      dispatch({ id: "configuredAudioVideo", state: null });
    }
  } else if (!state.avatarSetupDone) {
    const skipAvatarSetup = get(askAvatarSetup) === false;
    if (!skipAvatarSetup) {
      dispatch({ id: "chooseAvatar" });
    } else {
      dispatch({ id: "choseAvatar", appearance: null });
    }
  } else {
    dispatch({ id: "loading" });
  }
};
