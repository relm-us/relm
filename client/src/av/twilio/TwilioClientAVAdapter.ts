import {
  connect,
  Room,
  ConnectOptions,
  Participant,
  RemoteAudioTrack,
  RemoteParticipant,
  RemoteTrackPublication,
  RemoteVideoTrack,
} from "twilio-video";
import { get, writable, Writable } from "svelte/store";

import { TrackStore } from "../base/types";
import { ClientAVAdapter } from "../base/ClientAVAdapter";

// https://www.twilio.com/docs/video
export class TwilioClientAVAdapter extends ClientAVAdapter {
  room: Room;

  async connect(
    roomId: string,
    identityOrToken: string,
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
    this.room = await connect(identityOrToken, options);

    this.room.on("participantConnected", (participant: RemoteParticipant) => {
      const participantId = participant.identity;

      this.emit("participant-added", {
        id: participant.identity,
        isDominant: false,
        connectionScore: 1,
      });

      this.emit(
        "resources-added",
        Object.entries(participant.tracks).map(([trackSid, track]) => ({
          participantId,
          id: trackSid,
          paused: false,
          kind: track.kind,
          track: track,
        }))
      );
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
        this.emit("resources-added", [
          {
            id: publication.trackSid,
            participantId: participant.identity,
            paused: false,
            kind,
            track,
          },
        ]);
      }
    );
    this.room.on("trackUnpublished", (publication: RemoteTrackPublication) => {
      this.emit("resources-removed", [publication.trackSid]);
    });
  }

  replaceLocalTracks(tracks: Array<MediaStreamTrack>) {
    const localParticipant = this.room.localParticipant;
    let previousTrack;
    for (const track of tracks) {
      if (track.kind === "video")
        previousTrack = localParticipant.videoTracks.values()[0];
      if (track.kind === "audio")
        previousTrack = localParticipant.audioTracks.values()[0];

      if (previousTrack) localParticipant.unpublishTrack(previousTrack);
      localParticipant.publishTrack(track);
    }
  }

  removeLocalTracks(tracks: Array<MediaStreamTrack>) {
    const localParticipant = this.room.localParticipant;
    for (const track of tracks) {
      localParticipant.unpublishTrack(track);
    }
  }
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
