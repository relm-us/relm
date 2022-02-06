import { AuthenticationHeaders } from "types/identity";
import { PageParams } from "~/types";
import { config } from "~/config";

import { Dispatch } from "../ProgramTypes";
import { RelmRestAPI } from "../RelmRestAPI";

export const getRelmPermitsAndMetadata =
  (pageParams: PageParams, authHeaders: AuthenticationHeaders) =>
  async (dispatch: Dispatch) => {
    const api = new RelmRestAPI(
      config.serverUrl,
      pageParams.relmName,
      authHeaders
    );

    let result;
    try {
      result = await api.getPermitsAndMeta();
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
        overrideParticipantName: result.jwt?.username,
        twilioToken: result.twilioToken,
      });
    } catch (err) {
      return dispatch({ id: "error", message: err.message });
    }
  };
