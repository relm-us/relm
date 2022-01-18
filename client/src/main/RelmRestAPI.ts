import axios from "axios";

import { Security } from "~/identity/Security";
import { playerId } from "~/identity/playerId";
import { SecureParams } from "~/identity/secureParams";

export class RelmRestAPI {
  _authenticationParams: SecureParams;
  _token: string;
  _jwt: string;
  url: string;
  security: Security = new Security();

  constructor(url, { token, jwt }: { token?: string; jwt?: string } = {}) {
    if (!window.crypto.subtle) {
      throw new Error(
        `Unable to authenticate: please use a browser that ` +
          `supports signing with public keys, such as Firefox or Chrome.`
      );
    }

    this.url = url;

    this._token = token;
    this._jwt = jwt;
  }

  async getAuthenticationParams() {
    if (!this._authenticationParams) {
      const pubkey = await this.security.exportPublicKey();
      const signature = await this.security.sign(playerId);

      const params: SecureParams = {
        id: playerId,
        s: signature,
        x: pubkey.x,
        y: pubkey.y,
      };
      if (this._token) params.t = this._token;
      if (this._jwt) params.jwt = this._jwt;

      this._authenticationParams = params;
    }
    return this._authenticationParams;
  }

  async getHeaders() {
    const params = await this.getAuthenticationParams();

    let headers = {
      "x-relm-id": params.id,
      "x-relm-s": params.s,
      "x-relm-x": params.x,
      "x-relm-y": params.y,
    };
    if (params.jwt) {
      headers["x-relm-jwt"] = params.jwt;
    }
    if (params.t) {
      headers["x-relm-t"] = params.t;
    }
    return headers;
  }

  async get(path, params = {}) {
    const url = `${this.url}${path}`;
    const headers = await this.getHeaders();
    return await axios.get(url, { headers });
  }

  async post(path, body = {}) {
    const url = `${this.url}${path}`;
    const headers = await this.getHeaders();
    return await axios.post(url, body, { headers });
  }

  async getMetadata(relm: string) {
    const res = await this.get(`/relm/${relm}/meta`);
    if (res.status === 200) {
      if (res.data.status === "success") {
        const r = res.data.relm;
        return { ...res.data.relm, twilioToken: res.data.twilioToken };
      } else {
        throw Error(`can't get metadata for ${relm} (${res.data.status})`);
      }
    } else {
      throw Error(`can't get metadata for ${relm} (${res.status})`);
    }
  }

  async getPermits(relm: string): Promise<string[]> {
    let res;
    try {
      res = await this.get(`/relm/${relm}/permissions`);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        throw Error(`relm named "${relm}" not found`);
      } else if (err.response && err.response.status === 400) {
        throw Error(`permission denied`);
      }
    }
    if (res.status === 200) {
      if (res.data.status === "success") {
        return res.data.permits;
      } else {
        throw Error(`can't get permissions (${res.data?.status})`);
      }
    } else {
      throw Error(`can't get permissions (${res?.status})`);
    }
  }

  async getPermitsForManyRelms(relms: string[]) {
    const res = await this.post("/auth/permissions", { relms });
    if (res.status === 200) {
      if (res.data?.status === "success") {
        return res.data.permits;
      } else {
        throw Error(`can't get permissions (${res.data?.status})`);
      }
    } else {
      throw Error(`can't get permissions (${res?.status})`);
    }
  }
}
