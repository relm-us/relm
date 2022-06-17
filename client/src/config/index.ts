export type Config = {
  assetUrl: string;
  serverUrl: string;
  serverYjsUrl: string;
  serverUploadUrl: string;
};

// Retrieve the `relmServer` string passed to us via webpack. Webpack sets
// this value based on the `RELM_SERVER` environment variable. See `src/index.html`.
export const relmServer = (window as any).relmServer;

export const config: Config = {
  assetUrl: "https://assets.ourrelm.com",
  serverUrl: relmServer,
  serverYjsUrl: relmServer.replace("http", "ws"),
  serverUploadUrl: `${relmServer}/asset/upload`,
};
