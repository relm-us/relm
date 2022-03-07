import type { AuthenticationHeaders } from "~/types";
import type { LibraryAsset } from "~/types";
import { fetch } from "~/utils/fetch";

export class RelmRestAPI {
  url: string;
  relmName: string;
  authHeaders: AuthenticationHeaders;

  constructor(url, relmName, authHeaders: AuthenticationHeaders) {
    this.url = url;
    this.relmName = relmName;
    this.authHeaders = authHeaders;
  }

  async get(path): Promise<Response> {
    return await fetch(`${this.url}${path}`, { headers: this.authHeaders });
  }

  async post(path, body = {}): Promise<Response> {
    return await fetch(`${this.url}${path}`, {
      method: "POST",
      headers: this.authHeaders,
      body: JSON.stringify(body, null, 2),
    });
  }

  async getPermitsAndMeta(): Promise<{ permits: string[]; jwt: any }> {
    let res;
    try {
      res = await this.get(`/relm/${this.relmName}/permitsAndMeta`);
    } catch (err) {
      if (err.response) {
        if (err.response.status === 404) {
          throw Error(`relm named "${this.relmName}" not found`);
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
      const body = await res.json();
      if (body.data?.status === "success") {
        return body.data.permits;
      } else {
        throw Error(`can't get permissions (${body.data?.status})`);
      }
    } else {
      throw Error(`can't get permissions (${res?.status})`);
    }
  }

  async queryAssets({
    keywords,
    tags,
    page,
    per_page = 12,
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
      const body = await res.json();
      if (body.data?.status === "success") {
        return body.data.assets;
      } else {
        throw Error(`can't get assets (${body.data?.status})`);
      }
    } else {
      throw Error(`can't get assets (${res?.status})`);
    }
  }

  async addAsset({
    name,
    description,
    tags,
    thumbnail,
    ecsProperties,
  }: {
    name: string;
    description: string;
    tags: string[];
    thumbnail: string;
    ecsProperties: any;
  }): Promise<boolean> {
    const res = await this.post("/asset/library/create", {
      name,
      description,
      tags,
      thumbnail,
      ecsProperties,
    });
    if (res?.status === 200) {
      const body = await res.json();
      if (body.data?.status === "success") {
        return true;
      } else {
        throw Error(`can't get assets (${body.data?.status})`);
      }
    } else {
      throw Error(`can't get assets (${res?.status})`);
    }
  }

  /**
   * changes require a form as follows:
   * {
   *   [operation]: {
   *     [variableName]: ...
   *   }
   * }
   *
   * where `operation` may be 'add', 'set', or 'map'
   */
  async changeVariables({ changes }: { changes: any }): Promise<boolean> {
    const url = `/relm/${this.relmName}/variables`;
    const res = await this.post(url, { changes });
    if (res?.status === 200) {
      const body = await res.json();
      if (body.data?.status === "success") {
        return true;
      } else {
        throw Error(`can't set variables (${body.data?.status})`);
      }
    } else {
      throw Error(`can't set variables (${res?.status})`);
    }
  }
}
