import { writable, Writable } from "svelte/store";
import { DEFAULT_RELM_ID } from "./constants";

function getDefaultRelmId(location): string {
  const params = new URLSearchParams(location.search.substring(1));

  const relm = {
    // Normally, the relm is specified as part of the path, e.g. "/demo"
    path: location.pathname.split("/")[1],
    // Also allow relmId to be specified as a query param, e.g. "?relm=demo"
    queryParam: params.get("relm"),
  };

  let relmId;
  if (relm.queryParam) {
    relmId = relm.queryParam;
  } else if (relm.path !== "") {
    relmId = relm.path;
  } else {
    relmId = DEFAULT_RELM_ID;
  }

  return relmId.toLowerCase().replace(/[^a-z0-9\-]+/, "-");
}

function getDefaultConfig(location): Config {
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
    serverUrl = `http://${location.hostname}:3000`;
    serverYjsUrl = `ws://${location.hostname}:3000`;
  }
  serverUploadUrl = `${serverUrl}/asset`;

  return {
    serverUrl,
    serverYjsUrl,
    serverUploadUrl,
    relmId: getDefaultRelmId(location),
  };
}

export const defaultConfig = getDefaultConfig(window.location);

export type Config = {
  serverUrl: string;
  serverYjsUrl: string;
  serverUploadUrl: string;
  relmId: string;
};

export const config: Writable<Config> = writable(defaultConfig);
