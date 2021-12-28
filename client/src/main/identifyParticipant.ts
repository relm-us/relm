import { playerId } from "~/identity/playerId";
import { getSecureParams } from "~/identity/secureParams";
import { Dispatch } from "./RelmStateAndMessage";

export async function identifyParticipant(dispatch: Dispatch) {
  const secureParams = await getSecureParams(window.location.href);
  dispatch({ id: "identified", playerId, secureParams });
}
