import {
  connect,
  Room,
  ConnectOptions,
  RemoteParticipant,
  RemoteTrackPublication,
  RemoteTrack,
  LocalTrack,
} from "twilio-video";

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
    this.room.participants.forEach(this._participantConnected.bind(this));

    // Add participants yet to connect
    this.room.on("participantConnected", this._participantConnected.bind(this));

    this.room.on(
      "participantDisconnected",
      this._participantDisconnected.bind(this)
    );
  }

  _participantConnected(participant: RemoteParticipant) {
    const participantId = participant.identity;

    this.emit("participant-added", {
      id: participant.identity,
      isDominant: false,
      connectionScore: 1,
    });

    // Add tracks already available for participant
    const publications = Array.from(participant.tracks.values());
    this._tracksPublished(publications, participant);

    // Add tracks yet to be published by participant
    participant.on("trackPublished", (publication: RemoteTrackPublication) =>
      this._tracksPublished([publication], participant)
    );

    participant.on("trackUnpublished", this._trackUnpublished.bind(this));
  }

  _participantDisconnected(participant: RemoteParticipant) {
    this.emit("participant-removed", participant.identity);
  }

  _tracksPublished(
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

  _trackUnpublished(publication: RemoteTrackPublication) {
    this.emit("resources-removed", [publication.trackSid]);
  }

  publishLocalTracks(tracks: Array<MediaStreamTrack>) {
    const localParticipant = this.room.localParticipant;
    let previousTrack: LocalTrack;
    for (const track of tracks) {
      if (!track) continue;
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

  _enableMedia(kind = "audio", enable = true) {
    // TODO: sync with audo/video desired
    if (!this.room) return;
    
    const publications = this.room.localParticipant[
      kind == "audio" ? "audioTracks" : "videoTracks"
    ];
    publications.forEach(function (publication) {
      publication.track[enable ? 'enable' : 'disable']();
    });
  }

  enableMic() {
    this._enableMedia('audio', true);
  }
  disableMic(pause: boolean = false) {
    this._enableMedia('audio', false);
  }

  enableCam() {
    this._enableMedia('video', true);
  }
  disableCam(pause: boolean = false) {
    this._enableMedia('video', false);
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
