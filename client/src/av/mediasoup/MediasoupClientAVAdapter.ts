import { ClientAVAdapter } from "../base/ClientAVAdapter";
import { TrackStore } from "../base/types";

import { RoomClient } from "./RoomClient";
import type { BandwidthEstimate, MSPeer } from "./types";

export class MediasoupClientAVAdapter extends ClientAVAdapter {
  room: RoomClient;

  async connect(
    roomId = "default",
    userId = randomPeerId(),
    { displayName = "user", produceAudio = true, produceVideo = true }
  ) {
    this.room = new RoomClient(this.origin);
    this.room.on("peer-added", (peer: MSPeer) => {
      this.emit("participant-added", {
        id: peer.id,
        isDominant: false,
        connectionScore: 1,
      });
    });
    this.room.on("peer-removed", (peerId: string) => {
      this.emit("participant-removed", peerId);
    });
    this.room.on("consumer-added", (consumer) => {
      this.emit("resources-added", [{
        id: consumer.id,
        participantId: consumer.peerId,
        paused: false,
        kind: consumer.kind,
        track: consumer.track,
      }]);
    });
    this.room.on("consumer-removed", (consumerId) => {
      this.emit("resources-removed", [consumerId]);
    });
    this.room.on("bandwidth-estimate", (estimate: BandwidthEstimate) => {
      this.emit("bandwidth-estimate", estimate);
    });
    // this.room.join(localAudioTrackStore, localVideoTrackStore, {
    //   roomId,
    //   peerId: userId,
    //   displayName,
    //   produceAudio,
    //   produceVideo,
    // });
  }
}

function randomPeerId() {
  return Math.random().toString().slice(2);
}
