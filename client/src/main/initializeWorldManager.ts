import { Dispatch, RelmState } from "./RelmStateAndMessage";
import { worldManager } from "~/world";

export const initializeWorldManager = (state: RelmState) => async (
  dispatch: Dispatch
) => {
  worldManager.init(
    dispatch,
    state.ecsWorld,
    state.worldDoc,
    state.subrelm,
    state.entryway,
    state.subrelmDocId,
    state.twilioToken
  );
};
