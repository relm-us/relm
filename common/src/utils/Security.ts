import * as base64 from "base64-arraybuffer-es6";

export type SecretMethods = {
  getSecret: () => any,
  setSecret: (secret : any) => void
};

// see https://github.com/PeculiarVentures/webcrypto-docs/blob/master/ECDSA.md
const SECURITY_CONFIG = {
  name: "ECDSA",
  namedCurve: "P-384",
  namedHash: "SHA-384"
};

const TextEncoder = globalThis.TextEncoder;

async function getCrypto(): Promise<any> {
  if (typeof window !== "undefined") {
    // browser
    if (!window.crypto.subtle) {
      throw new Error(
        `Unable to authenticate: please use a browser that ` +
          `supports signing with public keys, such as Firefox or Chrome.`
      );
    }
    return window.crypto;
  } else {
    // node
    //@ts-ignore
    return (await import("crypto")).webcrypto;
  }
}

export class Security {
  secureId;
  keypair;
  secretMethods: SecretMethods;

  constructor(secretMethods: SecretMethods) {
    this.secretMethods = secretMethods;
  }

  async getOrCreateSecret() {
    const crypto = await getCrypto();

    if (!this.secret) {
      const pair = await crypto.subtle.generateKey(
        SECURITY_CONFIG,
        true, // can export
        ["sign", "verify"]
      );
      this.secret = {
        pu: await crypto.subtle.exportKey("jwk", pair.publicKey),
        pr: await crypto.subtle.exportKey("jwk", pair.privateKey),
      };
    }
    
    return this.secret;
  }

  async getOrCreateKeyPair() {
    const crypto = await getCrypto();
    const secret = await this.getOrCreateSecret();

    return {
      pu: await crypto.subtle.importKey(
        "jwk",
        secret.pu,
        SECURITY_CONFIG,
        true,
        ["verify"]
      ),
      pr: await crypto.subtle.importKey(
        "jwk",
        secret.pr,
        SECURITY_CONFIG,
        true,
        ["sign"]
      ),
    };
  }

  async exportPublicKey() {
    const crypto = await getCrypto();
    const keypair = await this.getOrCreateKeyPair();

    return await crypto.subtle.exportKey("jwk", keypair.pu);
  }

  async publicKey() {
    return (await this.getOrCreateKeyPair()).pu;
  }

  async privateKey() {
    return (await this.getOrCreateKeyPair()).pr;
  }

  async sign(message) {
    const crypto = await getCrypto();
    const encoded = new TextEncoder().encode(message);
    const privateKey = await this.privateKey();
    const signatureArrayBuffer = await crypto.subtle.sign(
      {
        name: SECURITY_CONFIG.name,
        hash: { name: SECURITY_CONFIG.namedHash },
      },
      privateKey,
      encoded
    );
    return base64.encode(
      signatureArrayBuffer,
      0,
      signatureArrayBuffer.byteLength
    );
  }

  async verify(message, signature) {
    const crypto = await getCrypto();
    const encoded = new TextEncoder().encode(message);
    const publicKey = await this.publicKey();
    const signatureArrayBuffer = base64.decode(signature);

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

  get secret() {
    return this.secretMethods.getSecret();
  }

  set secret(newSecret : any) {
    this.secretMethods.setSecret(newSecret);
  }
}