import { derived, writable, Readable, Writable } from "svelte/store";
import axios from "axios";

import { config, Config, defaultConfig } from "./config";
import { getSecureParams } from "~/auth";

export type ConnectionStatus =
  | "error"
  | "connecting"
  | "connected"
  | "disconnected";

export const yConnectStatus: Writable<ConnectionStatus> = writable(
  "disconnected"
);

export type ConnectOptions = {
  url: string;
  room: string;
  params: object;
};

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

export const connection: Readable<ConnectOptions> = derived(
  [config, relmId],
  ([$config, $relmId]: [Config, string], set) => {
    getSecureParams(window.location.href)
      .then((params) => {
        playerPermit(params, $config.serverUrl, $relmId)
          .then((relm) => {
            set({
              url: $config.serverYjsUrl,
              room: relm.permanentDocId,
              params,
            });
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
        set({
          url: $config.serverYjsUrl,
          room: $relmId,
          params: {},
        });
      });
  }
);
