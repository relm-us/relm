import { State } from "../ProgramTypes";
import { RelmRestAPI } from "../RelmRestAPI";

import { config } from "~/config";
import { get } from "svelte/store";
import { IDENTITY_SAVE_INTERVAL } from "~/config/constants";
import { connectedAccount } from "~/stores/connectedAccount";

let saveTimer;

export const saveIdentityData = (state: State) => () => {
  const api = new RelmRestAPI(
    config.serverUrl,
    state.authHeaders,
    state.pageParams.relmName
  );

  if (saveTimer !== null) {
    clearTimeout(saveTimer);
  }

  // a timer is set to prevent hundreds of requests being sent when updating slider values.
  saveTimer = setTimeout(async () => {
    if (get(connectedAccount)) {
      await api.setIdentityData({
        identity: get(state.localIdentityData),
      });
    }
  }, IDENTITY_SAVE_INTERVAL);
};
