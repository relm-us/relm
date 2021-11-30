import {
  WebSocketTransport,
  Peer,
  ProtooNotification,
  ProtooRequest,
} from "protoo-client";
import { Device } from "mediasoup-client";

import { Logger } from "./Logger";
import {
  PC_PROPRIETARY_CONSTRAINTS,
  WEBCAM_KSVC_ENCODINGS,
  WEBCAM_SIMULCAST_ENCODINGS,
} from "./constants";
import type { RoomClient } from "./RoomClient";
import { dispatchNotification, dispatchRequest } from "./dispatch";
import * as sendTransportHandler from "./SendTransportHandler";
import * as recvTransportHandler from "./RecvTransportHandler";
import type { RequestAcceptFunction, RequestRejectFunction } from "./types";
import { TrackStore } from "../base/types";

const logger = new Logger("ConferencePeer");

type ProducerType = "micProducer" | "camProducer" | "shareProducer";
type Unsubscriber = () => void;

export class ConferencePeer extends Peer {
  client: RoomClient;
  browserDevice: Device;

  audioTrackStore: TrackStore;
  videoTrackStore: TrackStore;
  audioTrackUnsub: Unsubscriber = null;
  videoTrackUnsub: Unsubscriber = null;

  constructor(
    room: RoomClient,
    audioTrackStore: TrackStore,
    videoTrackStore: TrackStore,
    transport: WebSocketTransport
  ) {
    super(transport);
    this.client = room;
    this.audioTrackStore = audioTrackStore;
    this.videoTrackStore = videoTrackStore;

    this.on("open", this.onOpen.bind(this));
    this.on("request", this.onRequest.bind(this));
    this.on("notification", this.onNotification.bind(this));
    this.on("close", this.onClose.bind(this));
    this.on("failed", this.onFailed.bind(this));
    this.on("disconnected", this.onDisconnected.bind(this));
  }

  async createBrowserDevice() {
    this.browserDevice = new Device({
      handlerName: undefined, // TODO: do our own browser detection?
    });

    const routerRtpCapabilities = await this.request(
      "getRouterRtpCapabilities"
    );

    await this.browserDevice.load({ routerRtpCapabilities });

    return this.browserDevice;
  }

  async establishSendTransport() {
    const { id, iceParameters, iceCandidates, dtlsParameters, sctpParameters } =
      await this.request("createWebRtcTransport", {
        forceTcp: false, // configurable?
        producing: true,
        consuming: false,
        sctpCapabilities: undefined, // TODO: data channels?
      });

    this.client.sendTransport = this.browserDevice!.createSendTransport({
      id,
      iceParameters,
      iceCandidates,
      dtlsParameters,
      sctpParameters,
      iceServers: [],
      proprietaryConstraints: PC_PROPRIETARY_CONSTRAINTS,
    });

    sendTransportHandler.listen(this.client.sendTransport, this);
  }

  async establishRecvTransport() {
    const { id, iceParameters, iceCandidates, dtlsParameters, sctpParameters } =
      await this.request("createWebRtcTransport", {
        forceTcp: false, // configurable?
        producing: false,
        consuming: true,
        sctpCapabilities: undefined, // TODO: data channel?
      });

    this.client.recvTransport = this.browserDevice!.createRecvTransport({
      id,
      iceParameters,
      iceCandidates,
      dtlsParameters,
      sctpParameters,
      iceServers: [],
    });

    recvTransportHandler.listen(this.client.recvTransport, this);
  }

  // Once browserDevice and recv/send Transports are established, we can
  // connect to the room.
  async connectRoom() {
    const { peers } = await this.request("join", {
      displayName: this.client.displayName,
      device: this.browserDevice!,
      // send our RTP capabilities only if we want to consume
      rtpCapabilities: this.client.consume
        ? this.browserDevice.rtpCapabilities
        : undefined,
      sctpCapabilities: undefined, // TODO: data channels?
    });

    this.client.state.set({ status: "connected" });

    // Populate initial list of peers
    for (const peer of peers) {
      this.client.emit("peer-added", peer);
    }
  }

  // Enable mic/webcam.
  async enableProduce() {
    if (this.client.produceAudio || this.client.produceVideo) {
      // Set our media capabilities.
      this.client.browserCan.set({
        audio: this.browserDevice!.canProduce("audio"),
        video: this.browserDevice!.canProduce("video"),
      });

      if (this.client.produceAudio) await this.enableMic();

      if (this.client.produceVideo) await this.enableCam();
    }
  }

  // Check if we can produce audio or video, yielding a little
  // more diagnostic log info than Device.canProduce() if not.
  canProduce(media: "audio" | "video", msg: string = null) {
    let prefix = msg ? msg + ": " : "";
    if (!this.browserDevice) {
      logger.error(`${prefix}no browserDevice yet`);
      return false;
    } else if (!this.browserDevice.canProduce(media)) {
      logger.error(`${prefix}cannot produce ${media}`);
      return false;
    } else {
      return true;
    }
  }

  async enableMic() {
    if (!this.canProduce("audio", "enableMic()")) return;

    if (this.audioTrackUnsub) {
      this.audioTrackUnsub?.();
    }

    this.audioTrackUnsub = this.audioTrackStore.subscribe(async (track) => {
      if (this.client.micProducer) {
        await this.closeProducer("micProducer");
      }

      await this.openMicProducer(track as MediaStreamTrack);
    });
  }

  async openMicProducer(track: MediaStreamTrack) {
    const client = this.client;

    const producer = await client.sendTransport.produce({
      track,
      stopTracks: false,
      codecOptions: {
        opusStereo: true, // 1?
        opusDtx: true, // 1?
      },
    });

    producer.on("transportclose", () => {
      client.micProducerState.set("closed");
      client.micProducer = null;
    });
    producer.on("trackended", () => {
      logger.warn("microphone disconnected");
      client.micProducerState.set("closed");
      client.emit("notify", {
        type: "error",
        text: "Microphone disconnected",
      });

      this.disableMic().catch(() => {});
    });

    client.micProducer = producer;
    client.micProducerState.set("open");

    client.emit("producer-added", {
      id: producer.id,
      type: "front", // TODO: get actual front/back value
      paused: producer.paused,
      track: producer.track,
      rtpParameters: producer.rtpParameters,
      codec: producer.rtpParameters.codecs[0].mimeType.split("/")[1],
    });
  }

  async disableMic() {
    this.audioTrackUnsub?.();
    this.audioTrackUnsub = null;

    await this.closeProducer("micProducer");
  }

  async enableCam() {
    if (!this.canProduce("video", "enableCam()")) return;

    if (this.videoTrackUnsub) {
      this.videoTrackUnsub?.();
    }

    this.videoTrackUnsub = this.videoTrackStore.subscribe(async (track) => {
      if (this.client.camProducer) {
        await this.closeProducer("camProducer");
      }

      try {
        await this.openCamProducer(track as MediaStreamTrack);
      } catch (err) {
        logger.error("enableCam() | failed: %o", err);

        this.client.emit("notify", {
          type: "error",
          text: `Error enabling webcam: ${err}`,
        });

        // if (track) track.stop()
      }
    });
  }

  async openCamProducer(track: MediaStreamTrack) {
    const client = this.client;

    const producer = await client.sendTransport.produce({
      track,
      stopTracks: false,
      encodings: getEncodings(this.browserDevice, true),
      codecOptions: {
        videoGoogleStartBitrate: 1000,
      },
      // codec: codec
    });

    producer.on("transportclose", () => {
      client.camProducerState.set("closed");
      client.camProducer = null;
    });
    producer.on("trackended", () => {
      logger.warn("camera disconnected");
      client.camProducerState.set("closed");
      client.emit("notify", {
        type: "error",
        text: "Camera disconnected",
      });

      this.disableCam().catch(() => {});
    });

    client.camProducer = producer;
    client.camProducerState.set("open");

    console.log("producer added", producer);
    client.emit("producer-added", {
      id: producer.id,
      // deviceLabel: device.label,
      type: "front", // this._getWebcamType(device),
      paused: producer.paused,
      track: producer.track,
      rtpParameters: producer.rtpParameters,
      codec: producer.rtpParameters.codecs[0].mimeType.split("/")[1],
    });
  }

  async closeProducer(producerType: ProducerType) {
    const client = this.client;

    if (client[producerType]) {
      const producerId = client[producerType].id;

      client[producerType].close();

      try {
        await this.request("closeProducer", { producerId });
      } catch (error) {
        logger.warn(`error closing server-side ${producerType}: %o`, error);
      }

      client[producerType] = null;
      client.emit("producer-removed", producerId);
    } else {
      logger.warn(`no ${producerType}, can't close`);
    }
  }

  async disableCam() {
    this.videoTrackUnsub?.();
    this.videoTrackUnsub = null;

    await this.closeProducer("camProducer");
  }

  // *** Events ***

  async onOpen() {
    await this.createBrowserDevice();

    if (this.client.produceAudio || this.client.produceVideo) {
      await this.establishSendTransport();
    }

    if (this.client.consume) {
      await this.establishRecvTransport();
    }

    try {
      await this.connectRoom();
    } catch (error) {
      logger.error("connectRoom() failed", error);
      this.client.state.set({
        status: "error",
        error: Error(`Could not join the room: ${error}`),
      });
    }

    await this.enableProduce();
  }

  async onRequest(
    request: ProtooRequest,
    accept: RequestAcceptFunction,
    reject: RequestRejectFunction
  ) {
    dispatchRequest(this.client, request, accept, reject);
  }

  async onNotification(notification: ProtooNotification) {
    dispatchNotification(this.client, notification);
  }

  async onClose() {
    this.client.state.set({ status: "disconnected" });
  }

  async onFailed() {
    this.client.state.set({
      status: "error",
      error: Error("WebSocket connection failed"),
    });
  }

  async onDisconnected() {
    this.client.state.set({
      status: "error",
      error: Error("WebSocket disconnected"),
    });
    this.client.closeTransports();
  }
}

function getEncodings(device, useSimulcast = true) {
  if (useSimulcast) {
    // If VP9 is the only available video codec then use SVC.
    const firstVideoCodec = device.rtpCapabilities.codecs.find(
      (c) => c.kind === "video"
    );

    if (firstVideoCodec.mimeType.toLowerCase() === "video/vp9") {
      return WEBCAM_KSVC_ENCODINGS;
    } else {
      return WEBCAM_SIMULCAST_ENCODINGS;
    }
  }
  // return undefined
}
