import { writable, Writable } from "svelte/store";

export type ShadowMapConfig = "BASIC" | "PCF" | "VSM";
export const shadowMapConfig: ShadowMapConfig = "VSM";

function getDefaultConfig(location) {
  let serverUrl: string;
  let serverYjsUrl: string;
  let serverUploadUrl: string;
  if (location.origin === "https://relm.us") {
    serverUrl = "https://y.relm.us";
    serverYjsUrl = "wss://y.relm.us";
  } else if (location.origin === "https://staging.relm.us") {
    serverUrl = "https://y-staging.relm.us";
    serverYjsUrl = "wss://y-staging.relm.us";
  } else {
    serverUrl = `http://${location.hostname}:1234`;
    serverYjsUrl = `ws://${location.hostname}:1234`;
  }
  serverUploadUrl = `${serverUrl}/asset`;

  return { serverUrl, serverYjsUrl, serverUploadUrl };
}

export type Config = {
  serverUrl: string;
  serverYjsUrl: string;
  serverUploadUrl: string;
};

export const config: Writable<Config> = writable(
  getDefaultConfig(window.location)
);
