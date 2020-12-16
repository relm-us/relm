import { derived, writable, Readable, Writable } from "svelte/store";
import { config, Config, defaultConfig } from "./config";

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
};

export const relmId: Writable<string> = writable(defaultConfig.relmId);

export const connection: Readable<ConnectOptions> = derived(
  [config, relmId],
  ([$config, $relmId]: [Config, string], set) => {
    set({
      url: $config.serverYjsUrl,
      room: $relmId,
    });
  }
);
