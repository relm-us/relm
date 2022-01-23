import { AuthenticationHeaders } from "~/identity/types";
import { PageParams } from "~/types";
import { config } from "~/config";

import { Dispatch } from "../ProgramTypes";
import { RelmRestAPI } from "../RelmRestAPI";

export const getRelmPermitsAndMetadata =
  (pageParams: PageParams, authHeaders: AuthenticationHeaders) =>
  async (dispatch: Dispatch) => {
    const api = new RelmRestAPI(config.serverUrl, authHeaders);

    let result;
    try {
      result = await api.getPermitsAndMeta(pageParams.relmName);
    } catch (err) {
      return dispatch({ id: "error", message: err.message });
    }

    if (!result.permits.includes("access")) {
      return dispatch({
        id: "error",
        message: `Sorry! It looks like you don't have permission to enter here.`,
      });
    }

    try {
      return dispatch({
        id: "gotRelmPermitsAndMetadata",
        permits: result.permits,
        relmDocId: result.relm.permanentDocId,
        entitiesMax: result.relm.entitiesCount, // TODO: Change metadata API to return 'entitiesMax'
        assetsMax: result.relm.assetsCount,
        participantName: result.jwt?.participantName,
        twilioToken: result.twilioToken,
      });
    } catch (err) {
      return dispatch({ id: "error", message: err.message });
    }
  };
