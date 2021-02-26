import { derived, writable, Readable, Writable } from "svelte/store";
import axios from "axios";

import { config, Config, defaultConfig } from "~/config/store";
import { getSecureParams } from "~/identity";

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
  };
};
export type ConnectError = {
  state: "error";
  error: string;
};
export type ConnectStatus = ConnectInitial | ConnectOptions | ConnectError;

export const relmId: Writable<string> = writable(defaultConfig.relmId);

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
    },
  });
  if (res.data.status === "success") {
    return res.data.relm;
  } else {
    console.error(`Unable to get permission`, res);
    throw Error(`Unable to get permission`);
  }
}

export const connection: Readable<ConnectStatus> = derived(
  [config, relmId],
  ([$config, $relmId]: [Config, string], set: (ConnectStatus) => void) => {
    getSecureParams(window.location.href)
      .then((params) => {
        playerPermit(params, $config.serverUrl, $relmId)
          .then((relm) => {
            set({
              state: "connected",
              url: $config.serverYjsUrl,
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
