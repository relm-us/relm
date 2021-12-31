import { config } from "~/config";

import { Dispatch } from "../RelmStateAndMessage";
import { RelmRestAPI } from "../RelmRestAPI";

export const getRelmPermitsAndMetadata = (relmName) => async (
  dispatch: Dispatch
) => {
  const token = new URL(window.location.href).searchParams.get("t");
  const api = new RelmRestAPI(config.serverUrl, { token });

  let permits;
  try {
    permits = await api.getPermits(relmName);
  } catch (err) {
    dispatch({ id: "error", message: err.message });
    return;
  }

  try {
    const {
      permanentDocId,
      entitiesCount,
      assetsCount,
      twilioToken,
    } = await api.getMetadata(relmName);
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
