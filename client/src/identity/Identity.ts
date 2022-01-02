import { get } from "svelte/store";
import { Avatar } from "./Avatar";

import type { IdentityManager } from "./IdentityManager";
import { worldManager } from "~/world";
import { IdentityData, PlayerID, TransformData } from "./types";
import { defaultIdentityData, localIdentityData } from "./identityData";
import { getSecureParams, secureParamsAsHeaders } from "./secureParams";
import { DecoratedECSWorld } from "~/types/DecoratedECSWorld";

const LONG_TIME_AGO = 600000; // 5 minutes ago
const LAST_SEEN_TIMEOUT = 15000;

export class Identity {
  manager: IdentityManager;

  playerId: PlayerID;
  clientId: number;

  isLocal: boolean;

  sharedFields: IdentityData;
  sharedFieldsUpdated: boolean;

  lastSeen: number;

  // Avatar is responsible for all visuals/rendering of this identity
  avatar: Avatar;

  constructor(
    manager: IdentityManager,
    ecsWorld: DecoratedECSWorld,
    playerId: PlayerID,
    isLocal: boolean = false
  ) {
    this.manager = manager;
    this.playerId = playerId;
    this.isLocal = isLocal;

    this.sharedFields = { ...defaultIdentityData };

    // Create an avatar to go with the identity
    this.avatar = new Avatar(this, ecsWorld);
  }

  // Number of milliseconds since last seen
  get seenAgo(): number {
    const lastSeen = this.lastSeen;
    return lastSeen === undefined
      ? LONG_TIME_AGO
      : performance.now() - this.lastSeen;
  }

  get isActive(): boolean {
    return this.seenAgo < 2500;
  }

  async getPrivateKey() {
    const params = await getSecureParams(window.location.href);

    return secureParamsAsHeaders(params);
  }

  wasRecentlySeen() {
    return this.seenAgo < LAST_SEEN_TIMEOUT;
  }

  setTransformData(clientId, transformData: TransformData) {
    this.clientId = clientId;
    this.lastSeen = performance.now();
    this.avatar.setTransformData(transformData);
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

      if (worldManager.avConnection) {
        if ("showAudio" in fields) {
          if (this.sharedFields.showAudio) {
            worldManager.avConnection.adapter.enableMic();
          } else {
            worldManager.avConnection.adapter.disableMic();
          }
        }
        if ("showVideo" in fields) {
          if (this.sharedFields.showVideo) {
            worldManager.avConnection.adapter.enableCam();
          } else {
            worldManager.avConnection.adapter.disableCam();
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

  // setAvName(name) {
  //   avStore.dispatch(
  //     setMe({
  //       peerId: this.playerId,
  //       displayName: name,
  //       displayNameSet: false,
  //       device: browser,
  //     })
  //   );
  // }
}
