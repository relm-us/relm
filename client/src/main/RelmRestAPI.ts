import axios from "axios";

import type { AuthenticationHeaders } from "~/identity/types";

export class RelmRestAPI {
  url: string;
  authHeaders: AuthenticationHeaders;

  constructor(url, authHeaders: AuthenticationHeaders) {
    this.url = url;
    this.authHeaders = authHeaders;
  }

  async get(path, params = {}) {
    const url = `${this.url}${path}`;
    return await axios.get(url, { headers: this.authHeaders });
  }

  async post(path, body = {}) {
    const url = `${this.url}${path}`;
    return await axios.post(url, body, { headers: this.authHeaders });
  }

  async getMetadata(relm: string) {
    const res = await this.get(`/relm/${relm}/meta`);
    if (res?.status === 200) {
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

  async getPermits(relm: string): Promise<{ permits: string[]; jwt: any }> {
    let res;
    try {
      res = await this.get(`/relm/${relm}/permits`);
    } catch (err) {
      if (err.response) {
        if (err.response.status === 404) {
          throw Error(`relm named "${relm}" not found`);
        } else if (err.response.status === 401 || err.response.status === 400) {
          throw Error(`permission denied: ${err.response.data.reason}`);
        }
      }
      throw Error(`not allowed`);
    }
    
    if (res?.status === 200) {
      if (res.data.status === "success") {
        return res.data;
      } else {
        throw Error(`can't get permissions (${res.data?.status})`);
      }
    } else {
      throw Error(`can't get permissions (${res?.status})`);
    }
  }

  async getPermitsForManyRelms(relms: string[]) {
    const res = await this.post("/auth/permissions", { relms });
    if (res?.status === 200) {
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
