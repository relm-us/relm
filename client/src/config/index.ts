export type Config = {
  assetUrl: string;
  serverUrl: string;
  serverYjsUrl: string;
  serverUploadUrl: string;
  mediasoupUrl: string;
};

export const config: Config = {
  assetUrl: "https://assets.ourrelm.com",
  ...getServerConfig(window.location),
  mediasoupUrl: "wss://media2.relm.us:4443",
};

function getServerConfig(
  location
): { serverUrl: string; serverYjsUrl: string; serverUploadUrl: string } {
  let serverUrl: string;
  let serverYjsUrl: string;
  let serverUploadUrl: string;
  if (location.origin === "https://relm.us") {
    serverUrl = "https://y-prod.relm.us";
    serverYjsUrl = "wss://y-prod.relm.us";
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
  };
}
