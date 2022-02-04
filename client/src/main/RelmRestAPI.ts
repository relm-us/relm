import axios from "axios";

import type { AuthenticationHeaders } from "~/types";
import type { LibraryAsset } from "~/types";

export class RelmRestAPI {
  url: string;
  authHeaders: AuthenticationHeaders;

  constructor(url, authHeaders: AuthenticationHeaders) {
    this.url = url;
    this.authHeaders = authHeaders;
  }

  async get(path) {
    const url = `${this.url}${path}`;
    return await axios.get(url, { headers: this.authHeaders });
  }

  async post(path, body = {}) {
    const url = `${this.url}${path}`;
    return await axios.post(url, body, { headers: this.authHeaders });
  }

  async getPermitsAndMeta(
    relm: string
  ): Promise<{ permits: string[]; jwt: any }> {
    let res;
    try {
      res = await this.get(`/relm/${relm}/permitsAndMeta`);
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

  async queryAssets({
    keywords,
    tags,
    page,
    per_page,
  }: {
    keywords?: string[];
    tags?: string[];
    page?: number;
    per_page?: number;
  }): Promise<LibraryAsset[]> {
    const res = await this.post("/asset/library/query", {
      keywords,
      tags,
      page,
      per_page,
    });
    if (res?.status === 200) {
      if (res.data?.status === "success") {
        return res.data.assets;
      } else {
        throw Error(`can't get assets (${res.data?.status})`);
      }
    } else {
      throw Error(`can't get assets (${res?.status})`);
    }
  }
}
