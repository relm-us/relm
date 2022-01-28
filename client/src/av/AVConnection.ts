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

  async connect({ roomId, token }: AVConnectOpts) {
    await this.adapter.connect(roomId, token);
    this.watchLocalTrackChanges();
    this.watchRemoteTrackChanges();

    return async () => {
      await this.adapter.disconnect();
    };
  }

  async disconnect() {
    await this.adapter.disconnect();
  }

  // Reactively waits for local participant's stream changes (e.g. if they
  // reconfigure their video or audio with video-mirror) and then publishes
  // any changes.
  watchLocalTrackChanges() {
    // Whenever local audio source or settings change, update the adapter
    localAudioTrackStore.subscribe((track: MediaStreamTrack) => {
      this.adapter.publishLocalTracks([track]);
    });

    // // Whenever local video source or settings change, update the adapter
    localVisualTrackStore.subscribe((track: MediaStreamTrack) => {
      this.adapter.publishLocalTracks([track]);
    });

    // localAudioTrackStore.subscribe((localAudioTrack: MediaStreamTrack) => {
    //   this.adapter.replaceLocalTracks([localAudioTrack]);
    //   this.acceptTracks(this.participantId, [localAudioTrack]);
    // });

    // localVideoTrackStore.subscribe((localVideoTrack: MediaStreamTrack) => {
    //   this.adapter.replaceLocalTracks([localVideoTrack]);
    //   this.acceptTracks(this.participantId, [localVideoTrack]);
    // });
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
        const tracks = resources.map((r) => r.track);
        if (participantId !== this.participantId)
          this.acceptTracks(participantId, tracks);
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
    for (const track of tracks) {
      const store = this.getTrackStore(participantId, track.kind as TrackKind);
      store.set(track);
    }
    // this.getStreamStore(participantId).update((stream) => {
    //   let previousTrack;
    //   for (const track of tracks) {
    //     if (track.kind === "video") previousTrack = stream.getVideoTracks()[0];
    //     if (track.kind === "audio") previousTrack = stream.getAudioTracks()[0];

    //     if (previousTrack) stream.removeTrack(stream.getVideoTracks()[0]);
    //     stream.addTrack(track);
    //   }
    //   console.log("accepTracks stream", stream, stream.getTracks());
    //   return stream;
    // });
  }
}
