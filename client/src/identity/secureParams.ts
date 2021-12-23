import { Security } from "./Security";
import { playerId } from "./playerId";

const URL = window.URL;

const security = new Security();

export type SecureParams = {
  id: string;
  s: string;
  x: string;
  y: string;
  jwt?: string;
  t?: string;
};

/**
 *
 * @param href window.location.href
 */
export async function getSecureParams(href?: string): Promise<SecureParams> {
  if (!window.crypto.subtle) {
    throw new Error(
      `Unable to authenticate: please use a browser that ` +
        `supports signing with public keys, such as Firefox or Chrome.`
    );
  }

  const pubkey = await security.exportPublicKey();
  const signature = await security.sign(playerId);
  const params: SecureParams = {
    id: playerId,
    s: signature,
    x: pubkey.x,
    y: pubkey.y,
    jwt: (window as any).jwt,
  };
  if (href) {
    const url = new URL(href);
    const token = url.searchParams.get("t");
    if (token) {
      params.t = token;
    }
  }

  return params;
}

export function secureParamsAsHeaders(params: SecureParams): object {
  return {
    "x-relm-id": params.id,
    "x-relm-s": params.s,
    "x-relm-x": params.x,
    "x-relm-y": params.y,
    "x-relm-jwt": params.jwt,
  };
}
