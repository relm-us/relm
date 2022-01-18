import { config } from "~/config";

import { Dispatch } from "../ProgramTypes";
import { RelmRestAPI } from "../RelmRestAPI";

export const getRelmPermitsAndMetadata =
  (relmName) => async (dispatch: Dispatch) => {
    const params = new URL(window.location.href).searchParams;
    const token = params.get("t");
    const jwt = (window as any).jwt || params.get("jwt");
    const api = new RelmRestAPI(config.serverUrl, { token, jwt });

    let permits;
    try {
      permits = await api.getPermits(relmName);
    } catch (err) {
      dispatch({ id: "error", message: err.message });
      return;
    }

    if (!permits.includes("access")) {
      dispatch({
        id: "error",
        message: `Sorry! It looks like you don't have permission to enter here.`,
      });
      return;
    }

    try {
      const { permanentDocId, entitiesCount, assetsCount, twilioToken } =
        await api.getMetadata(relmName);
      dispatch({
        id: "gotRelmPermitsAndMetadata",
        permits,
        relmDocId: permanentDocId,
        entitiesMax: entitiesCount, // TOOD: Change metadata API call to return 'max' values
        assetsMax: assetsCount,
        twilioToken,
      });
    } catch (err) {
      dispatch({ id: "error", message: err.message });
      return;
    }
  };
