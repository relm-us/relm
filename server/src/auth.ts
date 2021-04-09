import { Crypto } from "@peculiar/webcrypto";
import base64 from "base64-arraybuffer";

import { joinError } from "./util";
import { SECURITY_CONFIG } from "./config";

const { encode } = require("fastestsmallesttextencoderdecoder");

const crypto = new Crypto();

/**
 * The 'x' and 'y' components of ECDSA key that can be used to create a public key.
 * @typedef XYDoc
 * @property {string} x The 'x' component of the ECDSA public key, base64 encoded
 * @property {string} y The 'y' component of the ECDSA public key, base64 encoded
 */

export async function xyDocToPubKeyDoc(xydoc) {
  return {
    crv: "P-384",
    ext: true,
    key_ops: ["verify"],
    kty: "EC",
    x: xydoc.x,
    y: xydoc.y,
  };
}

export async function pubKeyDocToPubKey(pubkeyDoc) {
  return await crypto.subtle.importKey(
    "jwk",
    pubkeyDoc,
    SECURITY_CONFIG,
    true,
    ["verify"]
  );
}

export async function xyDocToPubKey(xydoc) {
  return await pubKeyDocToPubKey(await xyDocToPubKeyDoc(xydoc));
}

export async function verify(message, signature, publicKey) {
  let encoded;
  try {
    encoded = encode(message);
  } catch (err) {
    throw joinError(err, Error(`can't encode message`));
  }

  let signatureArrayBuffer;
  if (!signature) {
    throw Error(`signature is required`);
  }
  try {
    signatureArrayBuffer = base64.decode(signature);
  } catch (err) {
    throw joinError(err, Error(`can't decode signature`));
  }

  const result = await crypto.subtle.verify(
    {
      name: SECURITY_CONFIG.name,
      hash: { name: SECURITY_CONFIG.namedHash },
    },
    publicKey,
    signatureArrayBuffer,
    encoded
  );
  return result;
}

module.exports = {
  verify,
  xyDocToPubKeyDoc,
  pubKeyDocToPubKey,
  xyDocToPubKey,
};
