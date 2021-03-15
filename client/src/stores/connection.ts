import { derived, writable, Readable, Writable } from "svelte/store";
import axios from "axios";

import { config } from "~/config/store";
import { getSecureParams } from "~/identity";
import { subrelm } from "./subrelm";

export type YConnectionStatus =
  | "error"
  | "connecting"
  | "connected"
  | "disconnected";

export const yConnectStatus: Writable<YConnectionStatus> = writable(
  "disconnected"
);

export type ConnectInitial = {
  state: "initial";
};
export type ConnectOptions = {
  state: "connected";
  url: string;
  room: string;
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

async function playerPermit(params, serverUrl, room) {
  let url = `${serverUrl}/relm/${room}/can/access`;
  if (params.t) {
    url += `?t=${params.t}`;
  }
  const res = await axios.get(url, {
    headers: {
      "x-relm-id": params.id,
      "x-relm-s": params.s,
      "x-relm-x": params.x,
      "x-relm-y": params.y,
      "x-relm-jwt": params.jwt,
    },
  });
  if (res.data.status === "success") {
    if (res.data.relm.authmode=='public') {
      console.log('public authmode enabled');
    } else {
      console.log('jwt authmode enabled');
      console.log('username from JWT',res.data.relm.username );
    }
    return res.data.relm;
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
          .then((relm) => {
            set({
              state: "connected",
              url: config.serverYjsUrl,
              room: relm.permanentDocId,
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
