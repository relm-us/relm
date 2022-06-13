export type AuthenticationHeaders = {
  "x-relm-participant-id": string;
  "x-relm-participant-sig": string;
  "x-relm-pubkey-x": string;
  "x-relm-pubkey-y": string;
  "x-relm-invite-token"?: string;
  "x-relm-jwt"?: string;
};

