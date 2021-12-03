import { Logger } from "./Logger";
import type { ProtooNotification } from "protoo-client";
import { parseScalabilityMode } from "mediasoup-client";
import type { ProtooRequest, ProtooResponse } from "protoo-client";
import type { RoomClient } from "./RoomClient";
import type { RtpParameters } from "mediasoup-client/lib/RtpParameters";
import type { RequestAcceptFunction, RequestRejectFunction } from "./types";

const logger = new Logger("dispatch");

function producerScore(room: RoomClient, producerId, score) {
  console.log("score", producerId, score);
  //
}

function newPeer(room: RoomClient, peer) {
  room.emit("peer-added", peer);
}

function peerClosed(room: RoomClient, peerId) {
  room.emit("peer-removed", peerId);
}

function peerDisplayNameChanged(
  room: RoomClient,
  peerId,
  displayName,
  oldDisplayName
) {
  //
}

function downlinkBandwidthEstimation(
  room: RoomClient,
  desiredBitrate: number,
  effectiveDesiredBitrate: number,
  availableBitrate: number
) {
  room.emit("bandwidth-estimate", {
    desired: desiredBitrate,
    actual: availableBitrate,
  });
}

async function newConsumer(
  room: RoomClient,
  accept: RequestAcceptFunction,
  reject: RequestRejectFunction,
  peerId: string,
  producerId: string,
  id: string,
  kind: "audio" | "video",
  rtpParameters: RtpParameters,
  type: "simple" | "simulcast" | "svc" | "pipe",
  appData,
  producerPaused
) {
  const consumer = await room.recvTransport.consume({
    id,
    producerId,
    kind,
    rtpParameters,
    appData: { ...appData, peerId },
  });

  try {
    room.consumers.set(consumer.id, consumer);

    consumer.on("transportclose", () => {
      logger.debug("consumer transportclosed", consumer.id);
      this.consumers.delete(consumer.id);
    });

    const { spatialLayers, temporalLayers } = parseScalabilityMode(
      consumer.rtpParameters.encodings[0].scalabilityMode
    );

    room.emit("consumer-added", {
      id: consumer.id,
      peerId,
      kind,
      type: type,
      locallyPaused: false,
      remotelyPaused: producerPaused,
      rtpParameters: consumer.rtpParameters,
      spatialLayers: spatialLayers,
      temporalLayers: temporalLayers,
      preferredSpatialLayer: spatialLayers - 1,
      preferredTemporalLayer: temporalLayers - 1,
      priority: 1,
      codec: consumer.rtpParameters.codecs[0].mimeType.split("/")[1],
      track: consumer.track,
    });
  } catch (err) {
    logger.error("rejecting consumer: %s", err);
    reject();
    return;
  }

  // We are ready. Answer the protoo request so the server will
  // resume this Consumer (which was paused for now if video).
  accept();
}

function consumerClosed(room: RoomClient, consumerId) {
  const consumer = room.consumers.get(consumerId);

  if (consumer) {
    consumer.close();
    room.consumers.delete(consumerId);

    const { peerId } = consumer.appData;

    room.emit("consumer-removed", peerId);
  }
}

function consumerPaused(room: RoomClient, consumerId) {
  //
}

function consumerResumed(room: RoomClient, consumerId) {
  //
}

function consumerLayersChanged(
  room: RoomClient,
  consumerId,
  spatialLayer,
  temporalLayer
) {
  //
}
function consumerScore(room: RoomClient, consumerId, score) {
  //
}

function activeSpeaker(room: RoomClient, peerId) {
  //
}

export function dispatchNotification(
  client: RoomClient,
  notification: ProtooNotification
) {
  const data = notification.data;

  if (
    ["producerScore", "consumerScore", "activeSpeaker", "downlinkBwe"].includes(
      notification.method
    )
  ) {
    // logger.debug("notification: %o", notification);
  } else {
    logger.debug("notification: %o", notification);
  }

  switch (notification.method) {
    case "producerScore":
      return producerScore(client, data.producerId, data.score);
    case "newPeer":
      return newPeer(client, data);
    case "peerClosed":
      return peerClosed(client, data.peerId);
    case "peerDisplayNameChanged":
      return peerDisplayNameChanged(
        client,
        data.peerId,
        data.displayName,
        data.oldDisplayName
      );
    case "downlinkBwe":
      return downlinkBandwidthEstimation(
        client,
        data.desiredBitrate,
        data.effectiveDesiredBitrate,
        data.availableBitrate
      );
    case "consumerClosed":
      return consumerClosed(client, data.consumerId);
    case "consumerPaused":
      return consumerPaused(client, data.consumerId);
    case "consumerResumed":
      return consumerResumed(client, data.consumerId);
    case "consumerLayersChanged":
      return consumerLayersChanged(
        client,
        data.consumerId,
        data.spatialLayer,
        data.temporalLayer
      );
    case "consumerScore":
      return consumerScore(client, data.consumerId, data.score);
    case "activeSpeaker":
      return activeSpeaker(client, data.peerId);
    default:
      logger.warn(
        "NotificationHandler unknown method",
        notification.method,
        data
      );
  }
}

export async function dispatchRequest(
  room: RoomClient,
  request: ProtooRequest,
  accept: RequestAcceptFunction,
  reject: RequestRejectFunction
) {
  const data = request.data;

  // debug: show all notifications
  logger.debug("request: %o", request);

  switch (request.method) {
    case "newConsumer":
      return await newConsumer(
        room,
        accept,
        reject,
        data.peerId,
        data.producerId,
        data.id,
        data.kind,
        data.rtpParameters,
        data.type,
        data.appData,
        data.producerPaused
      );
    case "newDataConsumer":
      // For now, we don't support data channels
      reject(403, "I do not want DataChannels");
      break;
    default:
      logger.warn("RequestHandler unknown method", request.method, data);
  }
}
