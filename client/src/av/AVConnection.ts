import { get, writable, Writable } from "svelte/store";

import { localAudioTrack as localAudioTrackStore } from "~/ui/VideoMirror";
import { localVisualTrackStore } from "./localVisualTrackStore";

import { AVAdapterEvents, ClientAVAdapter } from "./base/ClientAVAdapter";
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

const logEnabled = (localStorage.getItem("debug") || "")
  .split(":")
  .includes("video-mirror");

export class AVConnection {
  participantId: string; // same as playerId
  adapter: ClientAVAdapter;
  audioTrackStores: Record<string, Writable<Track>>;
  videoTrackStores: Record<string, Writable<Track>>;

  unsubs: Function[] = [];

  // Keep track of what room we are currently connected to; helps
  // avoid dup identity err https://www.twilio.com/docs/api/errors/532050
  connected: string = null;

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
    if (this.connected === roomId) {
      console.warn("Not joining AV: already connected", roomId);
      return;
    }

    if (logEnabled) console.log("Joining video conference room", this);

    await this.adapter.connect(roomId, token);
    this.watchLocalTrackChanges();
    this.watchRemoteTrackChanges();

    this.subscribe("disconnected", () => {
      this.connected = null;

      // `.set` only exists on remote 'writable' stores, so this avoids setting
      // localTrack stores to null
      for (let participantId in this.audioTrackStores)
        this.audioTrackStores[participantId].set?.(null);
      for (let participantId in this.videoTrackStores)
        this.videoTrackStores[participantId].set?.(null);

      this.unsubscribeAll();
    });

    this.connected = roomId;

    return async () => {
      await this.adapter.disconnect();
    };
  }

  async disconnect() {
    if (logEnabled) console.log("Leaving video conference room", this);
    try {
      await this.adapter.disconnect();
    } catch (err) {
      console.log("Unable to disconnect from video conference", err);
    }
  }

  // Reactively waits for local participant's stream changes (e.g. if they
  // reconfigure their video or audio with video-mirror) and then publishes
  // any changes.
  watchLocalTrackChanges() {
    // Whenever local audio source or settings change, update the adapter
    localAudioTrackStore.subscribe((track: MediaStreamTrack) => {
      if (logEnabled) console.log("localAudioTrackStore changed", track);
      if (track) {
        track.applyConstraints({ height: 720, width: 1280, frameRate: 24 });
        this.adapter.publishLocalTracks([track]);
      }
    });

    // Whenever local video/screenshare source or settings change, update the adapter
    localVisualTrackStore.subscribe((track) => {
      if (logEnabled) console.log("localVisualTrackStore changed", track);
      if (track) {
        this.adapter.publishLocalTracks(
          [track],
          (track as any).priority ?? "standard"
        );
      }
    });
  }

  // Reactively waits for remote participants' stream changes and updates
  // our streamStores.
  watchRemoteTrackChanges() {
    // Each time resources are added, they are probably part of a single
    // participant's resources, but are not guaranteed to be so; therefore,
    // we group by a participant ID and then accept the resources as part
    // of our internal stream stores.
    this.subscribe("resources-added", (resources: AVResource[]) => {
      const groups = groupBy(resources, "participantId");

      for (const [participantId, resources] of Object.entries(groups)) {
        if (participantId !== this.participantId) {
          const tracks = resources.map((r) => r.track);
          this.acceptTracks(participantId, tracks);
        }
      }
    });

    this.subscribe("resources-removed", (resourceIds: string[]) => {
      if (logEnabled) console.log("removed AV resources", resourceIds);
    });

    this.subscribe("participant-removed", (participantId: string) => {
      this.audioTrackStores[participantId]?.set?.(null);
      this.videoTrackStores[participantId]?.set?.(null);
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

  getTrackStore(participantId: string, kind: TrackKind): Writable<Track> {
    const storage = this.getTrackMemberByKind(kind);
    if (!this[storage][participantId]) {
      this[storage][participantId] = writable(null);
    }
    return this[storage][participantId];
  }

  getTrackMemberByKind(kind: TrackKind): "audioTrackStores" | "videoTrackStores" {
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
    if (logEnabled) {
      console.log(
        "AV acceptTracks",
        participantId,
        tracks.map((t) => t.kind)
      );
    }

    for (const track of tracks) {
      const store = this.getTrackStore(participantId, track.kind as TrackKind);
      store.set(track);
    }
  }

  subscribe(
    channel: keyof AVAdapterEvents,
    fn: AVAdapterEvents[keyof AVAdapterEvents]
  ) {
    const adapter = this.adapter;
    adapter.addListener(channel, fn);
    this.unsubs.push(() => adapter.removeListener(channel, fn));
  }

  unsubscribeAll() {
    this.unsubs.forEach((unsub) => unsub());
  }
}
