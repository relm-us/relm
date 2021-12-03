import {
  connect,
  createLocalVideoTrack,
  Logger,
  Participant,
  RemoteAudioTrack,
  RemoteParticipant,
  RemoteTrackPublication,
  RemoteVideoTrack,
} from "twilio-video";
import type { Room, ConnectOptions } from "twilio-video";
import { get } from "svelte/store";
import type { Readable } from "svelte/store";

import { TrackStore } from "../base/types";
import { ClientAVAdapter } from "../base/ClientAVAdapter";

// https://www.twilio.com/docs/video
export class TwilioClientAVAdapter extends ClientAVAdapter {
  room: Room;

  async connect(
    identity: string,
    roomId: string,
    localAudioTrackStore: TrackStore,
    localVideoTrackStore: TrackStore,
    { displayName = "user", produceAudio = true, produceVideo = true }
  ) {
    const options: ConnectOptions = {
      name: roomId,

      // Available only in Small Group or Group Rooms only. Please set "Room Type"
      // to "Group" or "Small Group" in your Twilio Console:
      // https://www.twilio.com/console/video/configure
      bandwidthProfile: {
        video: {
          dominantSpeakerPriority: "high",
          mode: "collaboration",
          clientTrackSwitchOffControl: "auto",
          contentPreferencesMode: "auto",
          maxSubscriptionBitrate: isMobile ? 250000 : undefined,
        },
      },

      // Available only in Small Group or Group Rooms only. Please set "Room Type"
      // to "Group" or "Small Group" in your Twilio Console:
      // https://www.twilio.com/console/video/configure
      dominantSpeaker: true,

      // Comment this line if you are playing music.
      maxAudioBitrate: 16000,

      // VP8 simulcast enables the media server in a Small Group or Group Room
      // to adapt your encoded video quality for each RemoteParticipant based on
      // their individual bandwidth constraints. This has no utility if you are
      // using Peer-to-Peer Rooms, so you can comment this line.
      preferredVideoCodecs: [{ codec: "VP8", simulcast: true }],

      // We'll add audio and video tracks manually from local(*)TrackStore
      audio: false,
      video: false,

      // Capture 720p video @ 24 fps.
      // video: { deviceId: get(), height: 720, frameRate: 24, width: 1280 },
    };
    this.room = await connect(identity, options);

    // Whenever audio track changes, publish or re-publish
    let previousAudioTrack;
    localAudioTrackStore.subscribe((localAudioTrack: MediaStreamTrack) => {
      if (previousAudioTrack)
        this.room.localParticipant.unpublishTrack(previousAudioTrack);
      if (localAudioTrack) {
        this.room.localParticipant.publishTrack(localAudioTrack);
        previousAudioTrack = localAudioTrack;
      }
    });

    // Whenever video track changes, publish or re-publish
    let previousVideoTrack;
    localVideoTrackStore.subscribe((localVideoTrack) => {
      if (previousAudioTrack)
        this.room.localParticipant.unpublishTrack(previousVideoTrack);
      if (localVideoTrack) {
        this.room.localParticipant.publishTrack(localVideoTrack);
        previousVideoTrack = localVideoTrack;
      }
    });

    this.room.on("participantConnected", (participant: RemoteParticipant) => {
      this.emit("participant-added", {
        id: participant.identity,
        isDominant: false,
        connectionScore: 1,
      });
      for (const [trackSid, track] of Object.entries(participant.tracks)) {
        this.emit("resource-added", {
          id: trackSid,
          participantId: participant.identity,
          paused: false,
          kind: track.kind,
          track: track,
        });
      }
    });
    this.room.on(
      "participantDisconnected",
      (participant: RemoteParticipant) => {
        this.emit("participant-removed", participant.identity);
      }
    );
    this.room.on(
      "trackPublished",
      (publication: RemoteTrackPublication, participant: RemoteParticipant) => {
        const { kind, track } = getResourceKindTrack(publication);
        this.emit("resource-added", {
          id: publication.trackSid,
          participantId: participant.identity,
          paused: false,
          kind,
          track,
        });
      }
    );
    this.room.on("trackUnpublished", (publication: RemoteTrackPublication) => {
      this.emit("resource-removed", publication.trackSid);
    });
  }
}

function randomPeerId() {
  return Math.random().toString().slice(2);
}

/**
 * Whether the web app is running on a mobile browser.
 * @type {boolean}
 */
const isMobile = (() => {
  if (
    typeof navigator === "undefined" ||
    typeof navigator.userAgent !== "string"
  ) {
    return false;
  }
  return /Mobile/.test(navigator.userAgent);
})();

function getStoreValue(store) {
  let value;
  store.subscribe((v) => (value = v))();
  return value;
}

function getResourceKindTrack(
  publication: RemoteTrackPublication
): {
  kind: "audio" | "video";
  track: MediaStreamTrack;
} {
  switch (publication.kind) {
    case "audio": {
      const remoteAudioTrack = publication.track as RemoteAudioTrack;
      return { kind: "audio", track: remoteAudioTrack.mediaStreamTrack };
    }
    case "video": {
      const remoteVideoTrack = publication.track as RemoteVideoTrack;
      return { kind: "video", track: remoteVideoTrack.mediaStreamTrack };
    }
    default:
      throw Error(`unexpected kind of track: ${publication.kind}`);
  }
}
