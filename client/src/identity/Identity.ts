import { Avatar } from "./Avatar";

import type { IdentityManager } from "./IdentityManager";
import { IdentityData, PlayerID } from "./types";
import { defaultIdentityData, localIdentityData } from "./identityData";

import { setMe } from "~/av/redux/stateActions";
import { store as avStore } from "~/av";
import { browser } from "~/av/browserInfo";

const LONG_TIME_AGO = 600000; // 5 minutes ago
const LAST_SEEN_TIMEOUT = 15000;

export class Identity {
  manager: IdentityManager;

  playerId: PlayerID;

  isLocal: boolean;

  sharedFields: IdentityData;
  sharedFieldsUpdated: boolean;

  // Avatar is responsible for all visuals/rendering of this identity
  avatar: Avatar;

  constructor(
    manager: IdentityManager,
    playerId: PlayerID,
    isLocal: boolean = false
  ) {
    this.manager = manager;
    this.playerId = playerId;
    this.isLocal = isLocal;

    this.sharedFields = { ...defaultIdentityData };

    // Create an avatar to go with the identity
    this.avatar = new Avatar(this, this.manager.relm.wdoc.world);
  }

  get lastSeen() {
    return this.manager.clientLastSeen.get(this.sharedFields.clientId);
  }

  get seenAgo() {
    const lastSeen = this.lastSeen;
    return lastSeen === undefined
      ? LONG_TIME_AGO
      : performance.now() - this.lastSeen;
  }

  wasRecentlySeen() {
    return this.seenAgo < LAST_SEEN_TIMEOUT;
  }

  set(fields: object, propagate: boolean = true) {
    Object.assign(this.sharedFields, fields);
    if (this.isLocal) {
      for (const key of ["name", "color", "appearance"]) {
        if (key in fields) {
          localIdentityData.update(($data) => ({
            ...$data,
            [key]: fields[key],
          }));
        }
      }

      if (this.manager.relm.roomClient) {
        if ("showAudio" in fields) {
          if (this.sharedFields.showAudio) {
            this.manager.relm.roomClient.unmuteMic();
          } else {
            this.manager.relm.roomClient.muteMic();
          }
        }
        if ("showVideo" in fields) {
          if (this.sharedFields.showVideo) {
            this.manager.relm.roomClient.enableWebcam();
          } else {
            this.manager.relm.roomClient.disableWebcam();
          }
        }
      }
    }

    this.sharedFieldsUpdated = true;
    if (propagate) {
      this.manager.yfields.set(this.playerId, this.sharedFields);
    }
  }

  get(key: string) {
    return this.sharedFields[key];
  }

  toggleShowAudio() {
    const showAudio = !this.sharedFields.showAudio;
    this.set({ showAudio });
    return showAudio;
  }

  toggleShowVideo() {
    const showVideo = !this.sharedFields.showVideo;
    this.set({ showVideo });
    return showVideo;
  }

  setAvName(name) {
    avStore.dispatch(
      setMe({
        peerId: this.playerId,
        displayName: name,
        displayNameSet: false,
        device: browser,
      })
    );
  }
}
