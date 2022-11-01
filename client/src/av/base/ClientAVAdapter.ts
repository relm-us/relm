import { TypedEmitter } from "tiny-typed-emitter";
import type {
  AVParticipant,
  AVResource,
  ConnectOptions,
  ConnectStatus,
  BandwidthEstimate,
  SimplifiedTrack,
} from "./types";

interface AVAdapterEvents {
  "participant-added": (peer: AVParticipant) => void;
  "participant-updated": (peer: AVParticipant) => void;
  "participant-removed": (peerId: string) => void;

  "resources-added": (resources: Array<AVResource>) => void;
  "resources-updated": (resource: Array<AVResource>) => void;
  "resources-removed": (resourceId: Array<string>) => void;

  "bandwidth-estimate": (estimate: BandwidthEstimate) => void;
  "status-updated": (status: ConnectStatus) => void;

  "disconnected": () => void;
}

export class UnimplementedError extends Error {
  constructor(public reason = "Not Implemented") {
    super("Not Implemented");
  }
}

// prettier-ignore
export class ClientAVAdapter extends TypedEmitter<AVAdapterEvents> {
  origin: string;

  async connect(
    roomId: string,
    identityOrToken: string, // may be token, may be username, depends on service
    options: ConnectOptions = {}
  ) { throw new UnimplementedError(); }

  async disconnect() { throw new UnimplementedError(); }

  enableMic() { throw new UnimplementedError(); }
  disableMic(pause: boolean = false) { throw new UnimplementedError(); }

  enableCam() { throw new UnimplementedError(); }
  disableCam(pause: boolean = false) { throw new UnimplementedError(); }

  enableShare() { throw new UnimplementedError(); }
  disableShare(pause: boolean = false) { throw new UnimplementedError(); }

  publishLocalTracks(tracks: Array<MediaStreamTrack | SimplifiedTrack>) {
    throw new UnimplementedError();
  }
  unpublishLocalTracks(tracks: Array<MediaStreamTrack | SimplifiedTrack>) {
    throw new UnimplementedError();
  }
}
