export type Config = {
  assetsUrl: string;
  fontsUrl: string;
  langDefault: string;
  serverUrl: string;
  serverScreenshotUrl: string;
  serverUploadUrl: string;
};

// Retrieve the env vars passed to us via webpack. See `src/index.html.handlebars`.
export const env = (window as any).config as {
  assetsUrl: string;
  fontsUrl: string;
  langDefault: string;
  server: string;
  screenshotServer: string;
};

export const config: Config = {
  assetsUrl: env.assetsUrl,
  fontsUrl: env.fontsUrl,
  langDefault: env.langDefault,
  serverUrl: env.server,
  serverScreenshotUrl: env.screenshotServer,
  serverUploadUrl: `${env.server}/asset/upload`,
};
