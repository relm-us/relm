import { writable, Writable } from "svelte/store";

export type YConnectState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

export const yConnectState: Writable<YConnectState> = writable("disconnected");
