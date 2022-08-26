import type { AuthenticationHeaders } from "relm-common";

import { config } from "~/config";

import { Dispatch } from "../ProgramTypes";
import { GeckoProvider, GeckoStatus } from "~/identity/GeckoProvider";

export const connectGecko =
  (relmDocId: string, authHeaders: AuthenticationHeaders) =>
  (dispatch: Dispatch) => {
    const geckoProvider = new GeckoProvider();

    geckoProvider.on("status", (status: GeckoStatus) => {
      if (status === "connected") {
        dispatch({ id: "connectedGecko", geckoProvider });
      } else {
        console.error("Can't connect to gecko", status);
      }
    });

    geckoProvider.connect(config.serverUrl, relmDocId, authHeaders);
  };
