import {
  connect,
  Room,
  ConnectOptions,
  Participant,
  RemoteAudioTrack,
  RemoteParticipant,
  RemoteTrackPublication,
  RemoteVideoTrack,
  TrackPublication,
  Track,
  RemoteTrack,
  LocalTrack,
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
    { displayName = "user", produceAudio = true, produceVideo = true } = {}
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
    if (isMobile) {
      options.bandwidthProfile.video.maxSubscriptionBitrate = 250000;
    }
    this.room = await connect(identityOrToken, options);

    // Add participants already in room
    this.room.participants.forEach(this.participantConnected.bind(this));

    // Add participants yet to connect
    this.room.on("participantConnected", this.participantConnected.bind(this));

    this.room.on(
      "participantDisconnected",
      this.participantDisconnected.bind(this)
    );
  }

  participantConnected(participant: RemoteParticipant) {
    const participantId = participant.identity;

    this.emit("participant-added", {
      id: participant.identity,
      isDominant: false,
      connectionScore: 1,
    });

    // Add tracks already available for participant
    const publications = Array.from(participant.tracks.values());
    this.tracksPublished(publications, participant);

    // Add tracks yet to be published by participant
    participant.on("trackPublished", (publication: RemoteTrackPublication) =>
      this.tracksPublished([publication], participant)
    );

    participant.on("trackUnpublished", this.trackUnpublished.bind(this));
  }

  participantDisconnected(participant: RemoteParticipant) {
    this.emit("participant-removed", participant.identity);
  }

  tracksPublished(
    publications: RemoteTrackPublication[],
    participant: RemoteParticipant
  ) {
    console.log(
      "tracksPublished publications",
      participant.identity,
      publications,
      publications.map((pub) => pub.track)
    );

    for (const publication of publications) {
      // if (publication.isSubscribed) {
      const track = publication.track;
      if (track)
        this.emit("resources-added", [
          {
            id: publication.trackSid,
            participantId: participant.identity,
            paused: false,
            kind: track.kind,
            track: track,
          },
        ]);
      // }
      publication.on("subscribed", (remoteTrack: RemoteTrack) => {
        if (remoteTrack)
          this.emit("resources-added", [
            {
              id: publication.trackSid,
              participantId: participant.identity,
              paused: false,
              kind: remoteTrack.kind,
              track: remoteTrack,
            },
          ]);
      });
    }
  }

  trackUnpublished(publication: RemoteTrackPublication) {
    this.emit("resources-removed", [publication.trackSid]);
  }

  publishLocalTracks(tracks: Array<MediaStreamTrack>) {
    const localParticipant = this.room.localParticipant;
    let previousTrack: LocalTrack;
    for (const track of tracks) {
      if (track.kind === "video")
        previousTrack = localParticipant.videoTracks.values()[0];
      if (track.kind === "audio")
        previousTrack = localParticipant.audioTracks.values()[0];

      if (previousTrack) localParticipant.unpublishTrack(previousTrack);
      localParticipant.publishTrack(track);
    }
  }

  unpublishLocalTracks(tracks: Array<MediaStreamTrack>) {
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
  remoteTrack: RemoteTrack
): {
  kind: "audio" | "video";
  track: MediaStreamTrack;
} {
  switch (remoteTrack.kind) {
    case "audio": {
      return { kind: "audio", track: remoteTrack.mediaStreamTrack };
    }
    case "video": {
      return { kind: "video", track: remoteTrack.mediaStreamTrack };
    }
    default:
      throw Error(`unexpected kind of track: ${remoteTrack.kind}`);
  }
}
