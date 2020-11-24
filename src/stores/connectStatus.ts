import { writable, Writable } from "svelte/store";

export type ConnectionStatus =
  | "error"
  | "connecting"
  | "connected"
  | "disconnected";

export const yConnectStatus: Writable<ConnectionStatus> = writable(
  "disconnected"
);
