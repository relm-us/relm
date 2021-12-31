import { get } from "svelte/store";
import { askMediaSetup } from "~/stores/askMediaSetup";
import { Dispatch, RelmState } from "../RelmStateAndMessage";

export const nextSetupStep = (state: RelmState) => async (
  dispatch: Dispatch
) => {
  const skipAudioVideoSetup = get(askMediaSetup) === false;

  if (!state.audioVideoSetupDone) {
    if (!skipAudioVideoSetup) {
      dispatch({ id: "configureAudioVideo" });
    } else {
      dispatch({ id: "configuredAudioVideo", state: null });
    }
  } else if (!state.avatarSetupDone) {
    dispatch({ id: "chooseAvatar" });
  } else {
    dispatch({ id: "loading" });
  }
};
