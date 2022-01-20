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

export type { DecoratedECSWorld } from "./DecoratedECSWorld";

/**
 * Parameters passed to the page via URL or inline
 */
export type PageParams = {
  // unique human name for the relm
  relmName: string;
  // a named location within the relm
  entryway: string;
  // an optional invitation token
  invitationToken?: string;
  // an optional JWT token
  jsonWebToken?: string;
};

export type WorldDocStatus = "connecting" | "connected" | "disconnected";
