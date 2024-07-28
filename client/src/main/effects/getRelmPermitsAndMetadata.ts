import type { AuthenticationHeaders } from "relm-common";

import { PageParams } from "~/types";
import { config } from "~/config";

import { Dispatch } from "../ProgramTypes";
import { RelmRestAPI } from "../RelmRestAPI";

export const getRelmPermitsAndMetadata =
  (pageParams: PageParams, authHeaders: AuthenticationHeaders) => async (dispatch: Dispatch) => {
    const api = new RelmRestAPI(config.serverUrl, authHeaders, pageParams.relmName);

    let result;
    try {
      result = await api.getPermitsAndMeta();
    } catch (err) {
      return dispatch({ id: "error", message: err.message });
    }

    if (
      (pageParams.isCloneRequest && !result.permits.includes("read")) ||
      (!pageParams.isCloneRequest && !result.permits.includes("access"))
    ) {
      return dispatch({
        id: "error",
        message: `Sorry! It looks like you don't have permission to enter here.`,
      });
    }

    try {
      return dispatch({
        id: "gotRelmPermitsAndMetadata",
        permits: result.permits,
        permanentDocId: result.relm.permanentDocId,
        transientDocId: result.relm.transientDocId,
        entitiesMax: result.relm.entitiesCount, // TODO: Change metadata API to return 'entitiesMax'
        assetsMax: result.relm.assetsCount,
        overrideParticipantName: result.jwt?.username,
        twilioToken: result.twilioToken,
      });
    } catch (err) {
      return dispatch({ id: "error", message: err.message });
    }
  };
