import { Dispatch } from "./RelmStateAndMessage";
import { RelmRestAPI } from "~/identity/RelmRestAPI";
import { config } from "~/config";

export const getMetadata = (subrelm) => async (dispatch: Dispatch) => {
  const token = new URL(window.location.href).searchParams.get("t");
  const api = new RelmRestAPI(config.serverUrl, { token });

  const {
    permanentDocId,
    entitiesCount,
    assetsCount,
    twilioToken,
  } = await api.getMetadata(subrelm);

  dispatch({
    id: "gotMetadata",
    subrelmDocId: permanentDocId,
    entitiesCount,
    assetsCount,
    twilioToken,
  });
};
