import type { Awareness } from "relm-common";
import type { Dispatch } from "../ProgramTypes";

import { ParticipantBroker } from "~/identity/ParticipantBroker";

export const subscribeBroker =
  (awareness: Awareness) => (dispatch: Dispatch) => {
    const broker = new ParticipantBroker(awareness);
    broker.subscribe(dispatch);
    dispatch({ id: "didSubscribeBroker", broker });
  };
