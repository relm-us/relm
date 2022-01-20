import { AuthenticationHeaders } from "~/identity/types";
import { PageParams } from "~/types";
import { config } from "~/config";

import { Dispatch } from "../ProgramTypes";
import { RelmRestAPI } from "../RelmRestAPI";

export const getRelmPermitsAndMetadata =
  (pageParams: PageParams, authHeaders: AuthenticationHeaders) =>
  async (dispatch: Dispatch) => {
    const api = new RelmRestAPI(config.serverUrl, authHeaders);

    let permits;
    let participantName;
    try {
      const result = await api.getPermits(pageParams.relmName);
      permits = result.permits;
      participantName = result.jwt?.username;
    } catch (err) {
      return dispatch({ id: "error", message: err.message });
    }

    if (!permits.includes("access")) {
      return dispatch({
        id: "error",
        message: `Sorry! It looks like you don't have permission to enter here.`,
      });
    }

    try {
      const { permanentDocId, entitiesCount, assetsCount, twilioToken } =
        await api.getMetadata(pageParams.relmName);
      return dispatch({
        id: "gotRelmPermitsAndMetadata",
        permits,
        relmDocId: permanentDocId,
        entitiesMax: entitiesCount, // TODO: Change metadata API to return 'entitiesMax'
        assetsMax: assetsCount,
        participantName,
        twilioToken,
      });
    } catch (err) {
      return dispatch({ id: "error", message: err.message });
    }
  };
