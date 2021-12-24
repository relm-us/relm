import { derived, Readable } from "svelte/store";
import axios from "axios";

import { config } from "~/config";
import {
  getSecureParams,
  secureParamsAsHeaders,
} from "~/identity/secureParams";
import { subrelm } from "./subrelm";

export type ConnectInitial = {
  state: "initial";
};
export type ConnectOptions = {
  state: "connected";
  url: string;
  room: string;
  entitiesCount: number;
  assetsCount: number;
  twilio?: string;
  username?: string;
  params: {
    s: string;
    x: string;
    y: string;
    id: string;
    jwt: string;
  };
};
export type ConnectError = {
  state: "error";
  error: string;
};
export type ConnectStatus = ConnectInitial | ConnectOptions | ConnectError;

async function playerPermit(params, serverUrl, subrelm) {
  let url = `${serverUrl}/relm/${subrelm}/can/access`;
  if (params.t) {
    url += `?t=${params.t}`;
  }
  const res = await axios.get(url, {
    headers: secureParamsAsHeaders(params),
  });
  if (res.data.status === "success") {
    if (res.data.authmode == "public") {
      console.log("public authmode enabled");
    } else {
      console.log("jwt authmode enabled");
      console.log("username from JWT", res.data.user?.name);
    }
    return res.data;
  } else {
    console.error(`Unable to get permission`, res);
    throw Error(`Unable to get permission`);
  }
}

export const connection: Readable<ConnectStatus> = derived(
  [subrelm],
  ([$subrelm]: [string], set: (ConnectStatus) => void) => {
    getSecureParams(window.location.href)
      .then((params) => {
        playerPermit(params, config.serverUrl, $subrelm)
          .then(({ relm, user, twilio }) => {
            set({
              state: "connected",
              url: config.serverYjsUrl,
              room: relm.permanentDocId,
              entitiesCount: relm.entitiesCount,
              assetsCount: relm.assetsCount,
              username: user?.name,
              twilio,
              params,
            });
          })
          .catch((err) => {
            set({
              state: "error",
              error: err.message,
            });
            console.error(err);
          });
      })
      .catch((err) => {
        set({
          state: "error",
          error: err.message,
        });
        console.error(err);
      });
  },
  { state: "initial" }
);
