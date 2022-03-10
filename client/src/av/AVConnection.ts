import { writable, Writable } from "svelte/store";

import { localAudioTrack as localAudioTrackStore } from "video-mirror";
import { localVisualTrackStore } from "./localVisualTrackStore";

import { ClientAVAdapter } from "./base/ClientAVAdapter";
import { TwilioClientAVAdapter } from "./twilio/TwilioClientAVAdapter";
import { AVResource, Track, TrackKind } from "./base/types";
import { groupBy } from "~/utils/groupBy";

type AVConnectOpts = {
  roomId: string;
  token?: string;
  displayName?: string;
  produceAudio?: boolean;
  produceVideo?: boolean;
};

export class AVConnection {
  participantId: string; // same as playerId
  adapter: ClientAVAdapter;
  audioTrackStores: Record<string, Writable<Track>>;
  videoTrackStores: Record<string, Writable<Track>>;
  connectedStore: Writable<boolean> = writable(false);

  constructor(participantId) {
    this.participantId = participantId;
    this.adapter = new TwilioClientAVAdapter();
    this.audioTrackStores = {};
    this.videoTrackStores = {};

    // Assign the local audio/video stream to the local participant
    // TODO: Shouldn't assign a Readable to a Writable
    this.audioTrackStores[participantId] = localAudioTrackStore as any;
    this.videoTrackStores[participantId] = localVisualTrackStore as any;
  }

  async connect({ roomId, token, displayName }: AVConnectOpts) {
    console.log("Joining video conference room", this);

    await this.adapter.connect(roomId, token, { displayName });
    this.watchLocalTrackChanges();
    this.watchRemoteTrackChanges();

    this.connectedStore.set(true);

    return async () => {
      await this.adapter.disconnect();
    };
  }

  async disconnect() {
    console.log("Leaving video conference room", this);
    try {
      await this.adapter.disconnect();
    } catch (err) {
      console.log("Unable to disconnect from video conference", err);
    }
    this.connectedStore.set(false);
  }

  // Reactively waits for local participant's stream changes (e.g. if they
  // reconfigure their video or audio with video-mirror) and then publishes
  // any changes.
  watchLocalTrackChanges() {
    // Whenever local audio source or settings change, update the adapter
    localAudioTrackStore.subscribe((track: MediaStreamTrack) => {
      console.log("localAudioTrackStore changed", track);
      this.adapter.publishLocalTracks([track]);
    });

    // Whenever local video/screenshare source or settings change, update the adapter
    localVisualTrackStore.subscribe((track: MediaStreamTrack) => {
      console.log("localVisualTrackStore changed", track);
      this.adapter.publishLocalTracks([track]);
    });
  }

  // Reactively waits for remote participants' stream changes and updates
  // our streamStores.
  watchRemoteTrackChanges() {
    // Each time resources are added, they are probably part of a single
    // participant's resources, but are not guaranteed to be so; therefore,
    // we group by a participant ID and then accept the resources as part
    // of our internal stream stores.
    this.adapter.on("resources-added", (resources: AVResource[]) => {
      const groups = groupBy(resources, "participantId");

      for (const [participantId, resources] of Object.entries(groups)) {
        if (participantId !== this.participantId) {
          const tracks = resources.map((r) => r.track);
          this.acceptTracks(participantId, tracks);
        }
      }
    });
  }

  // Finds or creates an audio track associated with a remote participant
  getAudioTrackStore(participantId: string): Writable<Track> {
    if (!this.audioTrackStores[participantId]) {
      this.audioTrackStores[participantId] = writable(null);
    }
    return this.audioTrackStores[participantId];
  }

  // Finds or creates a video track associated with a remote participant
  getVideoTrackStore(participantId: string): Writable<Track> {
    if (!this.videoTrackStores[participantId]) {
      this.videoTrackStores[participantId] = writable(null);
    }
    return this.videoTrackStores[participantId];
  }

  getTrackStore(participantId: string, kind: TrackKind) {
    const storage = this.getTrackMemberByKind(kind);
    if (!this[storage][participantId]) {
      this[storage][participantId] = writable(null);
    }
    return this[storage][participantId];
  }

  getTrackMemberByKind(kind: TrackKind) {
    // prettier-ignore
    switch (kind) {
      case "audio": return "audioTrackStores";
      case "video": return "videoTrackStores";
      default: throw Error(`unknown track kind: ${kind}`);
    }
  }

  // Adds or replaces the tracks associated with a remote participant
  // that this peer knows about.
  acceptTracks(participantId: string, tracks: Array<Track>) {
    console.log(
      "AV acceptTracks",
      participantId,
      tracks.map((t) => t.kind)
    );
    for (const track of tracks) {
      const store = this.getTrackStore(participantId, track.kind as TrackKind);
      store.set(track);
    }
  }
}
