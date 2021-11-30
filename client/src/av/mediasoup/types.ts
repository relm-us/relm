import type { Device } from "mediasoup-client";
import type { RtpParameters } from "mediasoup-client/lib/RtpParameters";
import type { ProtooResponse } from "protoo-client";

export type ProducerState = "closed" | "open" | "paused" | "error";

export type RoomState =
  | { status: "disconnected" }
  | { status: "connecting" }
  | { status: "connected" }
  | { status: "error"; error: Error };

export type BandwidthEstimate = {
  desired: number;
  actual: number;
};

export type MSPeer = {
  id: string;
  displayName: string;
  device: Device;
};

export type MSConsumer = {
  id: string;
  peerId: string;
  kind: "audio" | "video";
  type: string; // TODO: what types?
  locallyPaused: boolean;
  remotelyPaused: boolean;
  rtpParameters: RtpParameters;
  spatialLayers: number;
  temporalLayers: number;
  preferredSpatialLayer: number;
  preferredTemporalLayer: number;
  priority: number;
  codec: string;
  track: MediaStreamTrack;
};

export type MSProducer = {
  id: string;
  type: "front" | "back";
  paused: boolean;
  track: MediaStreamTrack;
  rtpParameters: RtpParameters;
  codec: string;
};

export type MSJoinOptions = {
  token?: string;
  roomId?: string;
  displayName?: string;
  peerId?: string;
  produceAudio?: boolean;
  produceVideo?: boolean;
  consume?: boolean;
};

export type RequestAcceptFunction = (data?: ProtooResponse) => void;
export type RequestRejectFunction = (
  error?: Error | number,
  errorReason?: string
) => void;

