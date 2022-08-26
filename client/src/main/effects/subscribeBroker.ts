import type { Dispatch } from "../ProgramTypes";
import { Awareness } from "y-protocols/awareness";

import { ParticipantBroker } from "~/identity/ParticipantBroker";
import { GeckoProvider } from "~/identity/GeckoProvider";

export const subscribeBroker =
  (awareness: Awareness, gecko: GeckoProvider) => (dispatch: Dispatch) => {
    const broker = new ParticipantBroker(awareness, gecko);
    broker.subscribe(dispatch);
    dispatch({ id: "didSubscribeBroker", broker });
  };
