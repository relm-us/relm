import {
  localAudioTrack as localAudioTrackStore,
  localVideoTrack as localVideoTrackStore,
} from "video-mirror";
import { writable, Writable } from "svelte/store";

import { ClientAVAdapter } from "./base/ClientAVAdapter";
import { TwilioClientAVAdapter } from "./twilio/TwilioClientAVAdapter";
import { AVResource } from "./base/types";
import { groupBy } from "~/utils/groupBy";

export class AVConnection {
  adapter: ClientAVAdapter;
  streamStores: Record<string, Writable<MediaStream>>;

  constructor() {
    this.adapter = new TwilioClientAVAdapter();
  }

  async connect(roomId, token) {
    await this.adapter.connect(roomId, token);
    this.watchLocalStreamChanges();
  }

  // Reactively waits for local participant's stream changes (e.g. if they
  // reconfigure their video or audio with video-mirror) and then publishes
  // any changes.
  watchLocalStreamChanges() {
    // Whenever local audio source or settings change, update the adapter
    localAudioTrackStore.subscribe((localAudioTrack: MediaStreamTrack) => {
      this.adapter.replaceLocalTracks([localAudioTrack]);
    });

    // Whenever local video source or settings change, update the adapter
    localVideoTrackStore.subscribe((localVideoTrack: MediaStreamTrack) => {
      this.adapter.replaceLocalTracks([localVideoTrack]);
    });
  }

  // Reactively waits for remote participants' stream changes and updates
  // our streamStores.
  watchRemoteStreamChanges() {
    // Each time resources are added, they are probably part of a single
    // participant's resources, but are not guaranteed to be so; therefore,
    // we group by a participant ID and then accept the resources as part
    // of our internal stream stores.
    this.adapter.on("resources-added", (resources: AVResource[]) => {
      const groups = groupBy(resources, "participantId");

      for (const [participantId, resources] of Object.entries(groups)) {
        const tracks = resources.map(r => r.track);
        this.acceptRemoteTracks(participantId, tracks);
      }
    });
  }

  // Finds or creates a streamStore associated with a remote participant
  getRemoteStreamStore(participantId: string): Writable<MediaStream> {
    if (!this.streamStores[participantId]) {
      this.streamStores[participantId] = writable(new MediaStream());
    }
    return this.streamStores[participantId];
  }

  // Adds or replaces the tracks associated with a remote participant
  // that this peer knows about.
  acceptRemoteTracks(participantId: string, tracks: Array<MediaStreamTrack>) {
    this.getRemoteStreamStore(participantId).update((stream) => {
      let previousTrack;
      for (const track of tracks) {
        if (track.kind === "video") previousTrack = stream.getVideoTracks()[0];
        if (track.kind === "audio") previousTrack = stream.getAudioTracks()[0];

        if (previousTrack) stream.removeTrack(stream.getVideoTracks()[0]);
        stream.addTrack(track);
      }
      return stream;
    });
  }
}

