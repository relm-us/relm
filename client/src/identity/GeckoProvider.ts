import type { AuthenticationHeaders } from "relm-common";

import GeckoClient, { ClientChannel } from "@geckos.io/client";
import { SnapshotInterpolation } from "@geckos.io/snapshot-interpolation";
import EventEmitter from "eventemitter3";

export type GeckoStatus = "initial" | "connected" | "error" | "disconnected";

export class GeckoProvider extends EventEmitter {
  channel: ClientChannel;
  status: GeckoStatus = "initial";
  interpol: SnapshotInterpolation = new SnapshotInterpolation(30);

  connect(url: string, docId: string, authHeaders: AuthenticationHeaders) {
    const params = {
      docId,
      "participant-id": authHeaders["x-relm-participant-id"],
      "participant-sig": authHeaders["x-relm-participant-sig"],
      "pubkey-x": authHeaders["x-relm-pubkey-x"],
      "pubkey-y": authHeaders["x-relm-pubkey-y"],
      "invite-token": authHeaders["x-relm-token"],
      "jwt": authHeaders["x-relm-jwt"],
    };
    this.channel = GeckoClient({
      url,
      port: null,
      authorization: JSON.stringify(params),
    });

    // Keep a record of the latest server snapshots that we receive
    this.channel.on(
      "update",
      (snapshot: { id: string; time: number; state: Array<any> }) => {
        this.interpol.snapshot.add(snapshot);
      }
    );

    this.channel.onConnect((error?) => {
      if (error) this.changeStatus("error", error);
      else {
        this.changeStatus("connected");
      }
    });

    this.channel.onDisconnect((error?) => {
      if (error) this.changeStatus("error", error);
      else this.changeStatus("disconnected");
    });
  }

  disconnect() {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
  }

  changeStatus(newStatus: GeckoStatus, error?) {
    this.status = newStatus;
    if (error) console.warn(error);
    this.emit("status", newStatus);
  }
}
