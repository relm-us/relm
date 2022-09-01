import type { AuthenticationHeaders, SavedIdentityData } from "relm-common";
import type { LibraryAsset } from "~/types";

import { CancellablePromise } from "real-cancellable-promise";
import { simpleFetch } from "~/utils/simpleFetch";
import { AuthenticationResponse, RelmOAuthManager } from "./RelmOAuthAPI";

export type LoginCredentials = {
  email: string;
  password: string;
};

export class RelmRestAPI {
  url: string;
  relmName: string;
  authHeaders: AuthenticationHeaders;
  oAuth: RelmOAuthManager;

  constructor(url, relmName, authHeaders: AuthenticationHeaders) {
    this.url = url;
    this.relmName = relmName;
    this.authHeaders = authHeaders;
    this.oAuth = new RelmOAuthManager(url, authHeaders);
  }

  /*
   * General HTTP methods
   */

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

  /*
   * Specific API endpoints
   */

  async getPermitsAndMeta(): Promise<{ permits: string[]; jwt: any }> {
    type Result =
      | { status: "success"; permits: string[]; jwt: any }
      | { status: "error"; code?: number; reason: string };
    let result: Result = await this.post("/relm/permitsAndMeta", {
      relmName: this.relmName,
    });
    if (result.status === "success") {
      return result;
    } else if (result.code === 404) {
      throw Error(`relm named "${this.relmName}" not found`);
    } else {
      throw Error(`permission denied: ${result.reason}`);
    }
  }

  queryAssets({
    keywords,
    tags,
    page,
    perPage = 12,
  }: {
    keywords?: string[];
    tags?: string[];
    page?: number;
    perPage?: number;
  }): CancellablePromise<LibraryAsset[]> {
    type Result =
      | { status: "success"; assets: any[] }
      | { status: "error"; code?: number; reason: string };
    return this.post("/asset/library/query", {
      keywords,
      tags,
      page,
      perPage,
    }).then((result: Result) => {
      if (result.status === "success") {
        return result.assets;
      } else {
        throw Error(`can't get assets: ${result.reason}`);
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
    type Result =
      | { status: "success" }
      | { status: "error"; code?: number; reason: string };
    const result: Result = await this.post("/asset/library/create", {
      name,
      description,
      tags,
      thumbnail,
      ecsProperties,
    });
    if (result.status === "success") {
      return true;
    } else {
      throw Error(`can't get assets: ${result.reason}`);
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
    const content: Content = await this.post("/relm/setvars", {
      relmName: this.relmName,
      changes,
    });
    if (content.status === "success") {
      return true;
    } else {
      throw Error(`can't set variables: ${content.reason}`);
    }
  }

  async itemTake({
    entityId,
    yCenter = 0,
  }: {
    entityId: string;
    yCenter?: number;
  }): Promise<string> {
    type Result =
      | { status: "success"; asset: any }
      | { status: "error"; code?: number; reason: string };
    const result: Result = await this.post(`/asset/inventory/take`, {
      relmName: this.relmName,
      entityId,
      yCenter,
    });
    if (result.status === "success") {
      return result.asset;
    } else {
      throw Error(`can't take item: ${result.reason}`);
    }
  }

  async itemDrop({
    assetId,
    position,
  }: {
    assetId: string;
    position: number[];
  }): Promise<boolean> {
    type Result =
      | { status: "success"; asset: any }
      | { status: "error"; code?: number; reason: string };
    const result: Result = await this.post(`/asset/inventory/drop`, {
      relmName: this.relmName,
      assetId,
      position,
    });
    if (result.status === "success") {
      return true;
    } else {
      throw Error(`can't drop item: ${result.reason}`);
    }
  }

  async itemQuery(): Promise<any[]> {
    type Result =
      | { status: "success"; assets: any[] }
      | { status: "error"; code?: number; reason: string };
    const result: Result = await this.post(`/asset/inventory/query`, {
      relmName: this.relmName,
      perPage: 1,
    });
    if (result.status === "success") {
      return result.assets;
    } else {
      throw Error(`can't list inventory: ${result.reason}`);
    }
  }

  async makeInvitation({
    withEditPermission = false,
    withInvitePermission = false,
    maxUses = 1,
  }: {
    withEditPermission: boolean;
    withInvitePermission: boolean;
    maxUses: number;
  }): Promise<{ token: string; permits: string[]; url: string }> {
    type Result =
      | { status: "success"; invitation: any }
      | { status: "error"; code?: number; reason: string };

    const permits = ["access"];
    if (withEditPermission) permits.push("edit");
    if (withInvitePermission) permits.push("invite");

    const result: Result = await this.post(`/invite/make`, {
      relmName: this.relmName,
      permits,
      maxUses,
    });
    if (result.status === "success") {
      const url =
        location.origin +
        location.pathname +
        `?t=${result.invitation.token}` +
        location.hash;
      return {
        token: result.invitation.token,
        permits: result.invitation.permits,
        url,
      };
    } else {
      throw Error(`can't drop item: ${result.reason}`);
    }
  }

  async cloneRelm({
    subrelmName,
  }: {
    subrelmName?: string;
  } = {}): Promise<{
    relm: {
      relmId: string;
      relmName: string;
      isPublic: boolean;
      // ... and others
    };
  }> {
    type Result =
      | { status: "success"; relm: any; permits: boolean }
      | { status: "error"; code?: number; reason: string };

    const result: Result = await this.post(`/relm/clone`, {
      relmName: this.relmName,
      subrelmName,
    });

    if (result.status === "success") {
      return result.relm;
    } else {
      throw Error(`can't clone relm: ${result.reason}`);
    }
  }

  async getIdentityData() {
    type Result =
      | { status: "success"; isConnected: boolean; identity: SavedIdentityData }
      | { status: "error"; code?: number; reason: string };

    const result: Result = await this.get("/auth/identity");

    if (result.status === "success") {
      const { isConnected, identity } = result;
      return {
        isConnected,
        identity,
      };
    } else {
      throw Error(`Failed to retrieve identity data: ${result.reason}`);
    }
  }

  async setIdentityData({ identity }: { identity: SavedIdentityData }) {
    type Result =
      | { status: "success" }
      | { status: "error"; code?: number; reason: string };

    const result: Result = await this.post("/auth/identity", {
      identity,
    });

    if (result.status === "success") {
      return true;
    } else {
      throw Error(`Failed to retrieve identity data: ${result.reason}`);
    }
  }

  async registerParticipant(
    credentials: LoginCredentials
  ): Promise<AuthenticationResponse> {
    const result: AuthenticationResponse = await this.post(
      "/auth/connect/local/signup",
      {
        ...credentials,
      }
    );

    return result;
  }

  async login(credentials: LoginCredentials): Promise<AuthenticationResponse> {
    const result: AuthenticationResponse = await this.post(
      "/auth/connect/local/signin",
      {
        ...credentials,
      }
    );

    return result;
  }
}
