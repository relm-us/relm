import * as base64 from "base64-arraybuffer-es6";

const TextEncoder = window.TextEncoder;

// see https://github.com/PeculiarVentures/webcrypto-docs/blob/master/ECDSA.md
const SECURITY_CONFIG = {
  name: "ECDSA",
  namedCurve: "P-384",
  namedHash: "SHA-384",
};

export type SecretMethods = {
  getSecret: () => any;
  setSecret: (secret: any) => void
};

export class Security {
  secureId;
  keypair;
  secretMethods: SecretMethods;

  constructor(secretMethods: SecretMethods) {
    if (!window.crypto.subtle) {
      throw new Error(
        `Unable to authenticate: please use a browser that ` +
          `supports signing with public keys, such as Firefox or Chrome.`
      );
    }
    
    this.secretMethods = secretMethods;
  }

  async getOrCreateSecret() {
    if (!this.secret) {
      const pair = await window.crypto.subtle.generateKey(
        SECURITY_CONFIG,
        true, // can export
        ["sign", "verify"]
      );
      this.secret = {
        pu: await window.crypto.subtle.exportKey("jwk", pair.publicKey),
        pr: await window.crypto.subtle.exportKey("jwk", pair.privateKey),
      };
    }
    
    return this.secret;
  }

  async getOrCreateKeyPair() {
    const secret = await this.getOrCreateSecret();
    return {
      pu: await window.crypto.subtle.importKey(
        "jwk",
        secret.pu,
        SECURITY_CONFIG,
        true,
        ["verify"]
      ),
      pr: await window.crypto.subtle.importKey(
        "jwk",
        secret.pr,
        SECURITY_CONFIG,
        true,
        ["sign"]
      ),
    };
  }

  async exportPublicKey() {
    const keypair = await this.getOrCreateKeyPair();
    return await window.crypto.subtle.exportKey("jwk", keypair.pu);
  }

  async publicKey() {
    return (await this.getOrCreateKeyPair()).pu;
  }

  async privateKey() {
    return (await this.getOrCreateKeyPair()).pr;
  }

  async sign(message) {
    const encoded = new TextEncoder().encode(message);
    const privateKey = await this.privateKey();
    const signatureArrayBuffer = await window.crypto.subtle.sign(
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
    const encoded = new TextEncoder().encode(message);
    const publicKey = await this.publicKey();
    const signatureArrayBuffer = base64.decode(signature);

    const result = await window.crypto.subtle.verify(
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
