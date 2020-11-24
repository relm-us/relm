export type ShadowMapConfig = "BASIC" | "PCF" | "VSM";
export const shadowMapConfig: ShadowMapConfig = "VSM";

export const connection = {
  url: config(window.location).serverYjsUrl,
};

function config(location) {
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
