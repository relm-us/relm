import { State } from "../ProgramTypes";
import { RelmRestAPI } from "../RelmRestAPI";

import { config } from "~/config";
import { get } from "svelte/store";
import { IDENTITY_SAVE_INTERVAL } from "~/config/constants";

let saveTimer;

export const saveIdentityData = 
  (state: State) =>
  () => {
    const api = new RelmRestAPI(
      config.serverUrl,
      state.pageParams.relmName,
      state.authHeaders
    );

    if (saveTimer !== null) {
      clearTimeout(saveTimer);
    }

    // a timer is set to prevent hundreds of requests being sent when updating slider values.
    saveTimer = setTimeout(async () => {
      await api.setIdentityData({
        identity: get(state.localIdentityData)
      });
    }, IDENTITY_SAVE_INTERVAL);
  };
