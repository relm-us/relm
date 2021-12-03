import type { types as media } from "mediasoup-client";
import type { Transport } from "mediasoup-client/lib/Transport";
import { TypedEmitter } from "tiny-typed-emitter";
import { WebSocketTransport } from "protoo-client";
import { writable, Writable } from "svelte/store";

import { Logger } from "./Logger";
import { ConferencePeer } from "./ConferencePeer";
import type {
  MSConsumer,
  MSProducer,
  MSPeer,
  RoomState,
  ProducerState,
  BandwidthEstimate,
  MSJoinOptions,
} from "./types";

const logger = new Logger("RoomClient");

function randomPeerId() {
  return Math.random().toString().slice(2);
}

interface RoomClientEvents {
  // messages for user, e.g. errors
  "notify": ({ type, text }: { type: string; text: string }) => void;

  "bandwidth-estimate": (estimate: BandwidthEstimate) => void;

  "peer-added": (peer: MSPeer) => void;
  "peer-removed": (peerId: string) => void;

  "consumer-added": (consumer: MSConsumer) => void;
  "consumer-removed": (consumerId: string) => void;

  "producer-added": (producer: MSProducer) => void;
  "producer-removed": (producerId: string) => void;
}

export class RoomClient extends TypedEmitter<RoomClientEvents> {
  // Params
  origin: string; // e.g. https://media.mydomain.com:4443
  roomId: string;
  peerId: string;
  displayName: string;
  produceAudio: boolean;
  produceVideo: boolean;
  consume: boolean;

  // Internal state
  consumers: Map<String, media.Consumer> = new Map();

  micProducer: media.Producer;
  micProducerState: Writable<ProducerState>;

  camProducer: media.Producer;
  camProducerState: Writable<ProducerState>;

  shareProducer: media.Producer;
  shareProducerState: Writable<ProducerState>;

  sendTransport: Transport;
  recvTransport: Transport;
  peer: ConferencePeer;

  // Reactive stores
  state: Writable<RoomState> = writable({ status: "disconnected" });
  browserCan: Writable<{ audio: boolean; video: boolean }> = writable({
    audio: false,
    video: false,
  });

  constructor(origin) {
    super();
    logger.debug("constructor()");

    this.origin = origin;

    this.micProducerState = writable("closed");
    this.camProducerState = writable("closed");
    this.shareProducerState = writable("closed");
  }

  getMediasoupUrl() {
    return `${this.origin}/?roomId=${this.roomId}&peerId=${this.peerId}`;
  }

  join(
    localAudioTrackStore,
    localVideoTrackStore,
    {
      roomId = "default",
      peerId = randomPeerId(),
      displayName = "user",
      produceAudio = true,
      produceVideo = true,
      consume = true,
    }: MSJoinOptions
  ) {
    logger.debug("join()");

    this.roomId = roomId;
    this.peerId = peerId;
    this.displayName = displayName;
    this.produceAudio = produceAudio;
    this.produceVideo = produceVideo;
    this.consume = consume;

    this.peer = new ConferencePeer(
      this,
      localAudioTrackStore,
      localVideoTrackStore,
      new WebSocketTransport(this.getMediasoupUrl())
    );
    this.state.set({ status: "connecting" });
  }

  close() {
    this.closeTransports();
    this.peer.close();
    this.state.set({ status: "disconnected" });
  }

  async muteMic() {
    if (!this.micProducer) {
      logger.debug("mic already muted");
      return;
    }

    this.micProducer.pause();

    try {
      await this.peer.request("pauseProducer", {
        producerId: this.micProducer.id,
      });

      this.micProducerState.set("paused");
    } catch (error) {
      logger.error("muteMic() | failed: %o", error);

      this.micProducerState.set("error");

      this.emit("notify", {
        type: "error",
        text: `Error pausing server-side mic Producer: ${error}`,
      });
    }
  }

  closeTransports() {
    if (this.sendTransport) {
      this.sendTransport.close();
      this.sendTransport = null;
    }

    if (this.recvTransport) {
      this.recvTransport.close();
      this.recvTransport = null;
    }
  }
}
