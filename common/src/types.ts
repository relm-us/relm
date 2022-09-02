export type AuthenticationHeaders = {
  "x-relm-participant-id": string;
  "x-relm-participant-sig": string;
  "x-relm-pubkey-x": string;
  "x-relm-pubkey-y": string;
  "x-relm-invite-token"?: string;
  "x-relm-jwt"?: string;
};

export type Result<S, E, C> =
  | { status: "success"; code: C; data?: S }
  | { status: "error"; code: C; data?: E };
