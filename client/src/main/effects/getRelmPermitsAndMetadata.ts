import { RelmRestAPI } from "~/identity/RelmRestAPI";
import { config } from "~/config";

import { Dispatch } from "../RelmStateAndMessage";

export const getRelmPermitsAndMetadata = (relmName) => async (
  dispatch: Dispatch
) => {
  const token = new URL(window.location.href).searchParams.get("t");
  const api = new RelmRestAPI(config.serverUrl, { token });

  const permits = await api.getPermits(relmName);

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
};
