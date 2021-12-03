import { TypedEmitter } from "tiny-typed-emitter";
import type {
  AVParticipant,
  AVResource,
  ConnectOptions,
  ConnectStatus,
  TrackStore,
  BandwidthEstimate,
} from "./types";

interface AVAdapterEvents {
  "participant-added": (peer: AVParticipant) => void;
  "participant-updated": (peer: AVParticipant) => void;
  "participant-removed": (peerId: string) => void;

  "resource-added": (resource: AVResource) => void;
  "resource-updated": (resource: AVResource) => void;
  "resource-removed": (resourceId: string) => void;

  "bandwidth-estimate": (estimate: BandwidthEstimate) => void;
  "status-updated": (status: ConnectStatus) => void;
}

export class ClientAVAdapter extends TypedEmitter<AVAdapterEvents> {
  origin: string;

  async connect(
    identity: string, // may be token, may be username, depends on service
    roomId: string,
    localAudioTrackStore: TrackStore,
    localVideoTrackStore: TrackStore,
    options: ConnectOptions = {}
  ) {}

  async disconnect() {}

  enableMic() {}
  disableMic(pause: boolean = false) {}

  enableCam() {}
  disableCam(pause: boolean = false) {}

  enableShare() {}
  disableShare(pause: boolean = false) {}
}
