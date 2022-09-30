export type ConnectOptions = {
  state: "connected";
  url: string;
  room: string;
  entitiesCount: number;
  assetsCount: number;
  twilio?: string;
  username?: string;
  params: {
    s: string;
    x: string;
    y: string;
    id: string;
    jwt: string;
  };
};
