export type Config = {
  assetsUrl: string;
  fontsUrl: string;
  logoUrl: string;
  langDefault: string;
  serverUrl: string;
  serverYjsUrl: string;
  serverUploadUrl: string;
};

// Retrieve the env vars passed to us via webpack. See `src/index.html.handlebars`.
export const env = (window as any).config as {
  assetsUrl: string;
  fontsUrl: string;
  logoUrl: string;
  langDefault: string;
  server: string;
  home: string;
};

export const config: Config = {
  assetsUrl: env.assetsUrl,
  fontsUrl: env.fontsUrl,
  logoUrl: env.logoUrl,
  langDefault: env.langDefault,
  serverUrl: env.server,
  serverYjsUrl: env.server.replace(/^http/, "ws"),
  serverUploadUrl: `${env.server}/asset/upload`,
};
