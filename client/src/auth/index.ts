import { Security } from "./Security";

const URL = window.URL;

const security = new Security();

export type SecureParams = {
  id: string;
  s: string;
  x: string;
  y: string;
  t?: string;
};

/**
 *
 * @param href window.location.href
 */
export async function getSecureParams(href: string): Promise<SecureParams> {
  if (!window.crypto.subtle) {
    throw new Error(
      `Unable to authenticate: ` +
        `please use a browser that ` +
        `supports signing with public keys, ` +
        `such as Firefox or Chrome.`
    );
  }

  const playerId = await security.getOrCreateId();
  const pubkey = await security.exportPublicKey();
  const signature = await security.sign(playerId);
  const params: SecureParams = {
    id: playerId,
    s: signature,
    x: pubkey.x,
    y: pubkey.y,
  };
  const url = new URL(href);
  const token = url.searchParams.get("t");
  if (token) {
    params.t = token;
  }

  return params;
}
