export type Config = {
  assetUrl: string;
  serverUrl: string;
  serverYjsUrl: string;
  serverUploadUrl: string;
  fontsUrl: string;
};

// Retrieve the env vars passed to us via webpack. See `src/index.html.handlebars`.
export const env = (window as any).config as {
  server: string;
  fontsUrl: string;
};

export const config: Config = {
  assetUrl: "https://assets.ourrelm.com",
  serverUrl: env.server,
  serverYjsUrl: env.server.replace(/^http/, "ws"),
  serverUploadUrl: `${env.server}/asset/upload`,
  fontsUrl: env.fontsUrl,
};
