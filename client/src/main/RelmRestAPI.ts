import { CancellablePromise } from "real-cancellable-promise";
import type { AuthenticationHeaders } from "~/types";
import type { LibraryAsset } from "~/types";
import { simpleFetch } from "~/utils/simpleFetch";

export class RelmRestAPI {
  url: string;
  relmName: string;
  authHeaders: AuthenticationHeaders;

  constructor(url, relmName, authHeaders: AuthenticationHeaders) {
    this.url = url;
    this.relmName = relmName;
    this.authHeaders = authHeaders;
  }

  get<T>(path): CancellablePromise<T> {
    return simpleFetch(`${this.url}${path}`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        ...this.authHeaders,
      },
    });
  }

  post<T>(path, params = {}): CancellablePromise<T> {
    const body = JSON.stringify(params, null, 2);
    return simpleFetch(`${this.url}${path}`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        ...this.authHeaders,
      },
      body,
    });
  }

  async getPermitsAndMeta(): Promise<{ permits: string[]; jwt: any }> {
    type Content =
      | { status: "success"; permits: string[]; jwt: any }
      | { status: "error"; code?: number; reason: string };
    let content: Content = await this.get(
      `/relm/${this.relmName}/permitsAndMeta`
    );
    if (content.status === "success") {
      return content;
    } else if (content.code === 404) {
      throw Error(`relm named "${this.relmName}" not found`);
    } else {
      throw Error(`permission denied: ${content.reason}`);
    }
  }

  queryAssets({
    keywords,
    tags,
    page,
    per_page = 12,
  }: {
    keywords?: string[];
    tags?: string[];
    page?: number;
    per_page?: number;
  }): CancellablePromise<LibraryAsset[]> {
    type Content =
      | { status: "success"; assets: any[] }
      | { status: "error"; code?: number; reason: string };
    return this.post("/asset/library/query", {
      keywords,
      tags,
      page,
      per_page,
    }).then((content: Content) => {
      if (content.status === "success") {
        return content.assets;
      } else {
        throw Error(`can't get assets: ${content.reason}`);
      }
    });
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
    type Content =
      | { status: "success" }
      | { status: "error"; code?: number; reason: string };
    const content: Content = await this.post("/asset/library/create", {
      name,
      description,
      tags,
      thumbnail,
      ecsProperties,
    });
    if (content.status === "success") {
      return true;
    } else {
      throw Error(`can't get assets: ${content.reason}`);
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
    type Content =
      | { status: "success" }
      | { status: "error"; code?: number; reason: string };
    const content: Content = await this.post(
      `/relm/${this.relmName}/variables`,
      { changes }
    );
    if (content.status === "success") {
      return true;
    } else {
      throw Error(`can't set variables: ${content.reason}`);
    }
  }

  async take({
    entityId,
    yCenter = 0,
  }: {
    entityId: string;
    yCenter?: number;
  }): Promise<string> {
    type Content =
      | { status: "success" }
      | { status: "error"; code?: number; reason: string };
    const content: Content = await this.post(`/asset/inventory/take`, {
      relmName: this.relmName,
      entityId,
      yCenter,
    });
    if (content.status === "success") {
      console.log("take", content);
      return "";
    } else {
      throw Error(`can't set variables: ${content.reason}`);
    }
  }
}
