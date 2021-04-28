import * as Y from "yjs";
import EventEmitter from "eventemitter3";

import { withArrayEdits, withMapEdits } from "relm-common/yjs/observeUtils";

import { WorldDoc } from "~/y-integration/WorldDoc";
import type WorldManager from "~/world/WorldManager";

import {
  IdentityData,
  SharedIdentityFields,
  LocalIdentityFields,
  PlayerID,
  YClientID,
} from "./types";

import { loadingState } from "~/stores/loading";
import { avPermission } from "~/stores/avPermission";
import { defaultIdentity } from "./defaultIdentity";
import { Identity } from "./Identity";
import { ChatMessage, getEmojiFromMessage } from "~/world/ChatManager";
import { localstorageSharedFields } from "./localstorageSharedFields";

const ACTIVE_TIMEOUT = 30000;

type PeerData = {
  // Moment the peer was last seen, in milliseconds from start of window
  lastSeen?: number;

  // Unique UUID of player
  playerId?: string;

  // Fast transform cache
  transform?: Function;
};

export class IdentityManager extends EventEmitter {
  relm: WorldManager;
  wdoc: WorldDoc;

  yfields: Y.Map<SharedIdentityFields>;

  ymessages: Y.Array<ChatMessage>;

  identities: Map<PlayerID, Identity>;

  peers: Map<YClientID, PeerData>;

  me: Identity;

  isSynced: boolean;

  constructor(relm: WorldManager, myData: IdentityData = defaultIdentity) {
    super();
    this.relm = relm;
    this.yfields = relm.wdoc.ydoc.getMap("identities");
    this.ymessages = relm.wdoc.ydoc.getArray("messages");
    this.identities = new Map();
    this.peers = new Map();
    this.isSynced = false;

    this.registerMe(myData, relm.wdoc.ydoc.clientID);

    this.observeFields();
    this.observeChat();
  }

  registerMe(myData: IdentityData, clientId: YClientID) {
    myData.shared.clientId = clientId;

    localstorageSharedFields.update(($fields) => {
      return { ...$fields, emoting: false, status: "initial" };
    });

    const identity = new Identity(this, myData.playerId, {
      // Swap out the regular store for a localstorage store
      sharedFieldsStore: localstorageSharedFields,
      localFields: myData.local,
    });
    this.identities.set(myData.playerId, identity);

    avPermission.subscribe(($avPermission) => {
      identity.sharedFields.update(($fields) => {
        return {
          ...$fields,
          showAudio: $avPermission.audio,
          showVideo: $avPermission.video,
        };
      });
    });

    /**
     * Whenever the sharedFields svelte store is updated, also set the
     * yjs document corresponding to the playerId.
     */
    identity.sharedFields.subscribe(($sharedFields) => {
      this.yfields.set(myData.playerId, $sharedFields);

      /**
       * Only "I" can set my audio mute state
       */
      if (this.relm.roomClient) {
        if ($sharedFields.showAudio) {
          this.relm.roomClient.unmuteMic();
        } else {
          this.relm.roomClient.muteMic();
        }

        if ($sharedFields.showVideo) {
          this.relm.roomClient.enableWebcam();
        } else {
          this.relm.roomClient.disableWebcam();
        }
      }
    });

    /**
     * After getting 'sync' signal, yjs doc is synced and can accept
     * more up to date values, such as the clientId of this connection.
     */
    loadingState.subscribe(($state) => {
      if ($state === "loaded") {
        identity.sharedFields.update(($fields) => {
          return { ...$fields, clientId };
        });
        this.isSynced = true;
      }
    });

    this.me = identity;
  }

  getOrCreatePeer(clientId: YClientID) {
    if (!clientId) console.warn("missing clientId");

    let peer = this.peers.get(clientId);

    if (!peer) {
      peer = { lastSeen: performance.now() };
      this.peers.set(clientId, peer);
    }
    return peer;
  }

  getOrCreateIdentity(playerId) {
    let identity = this.identities.get(playerId);
    if (!identity) {
      identity = new Identity(this, playerId);
      this.identities.set(playerId, identity);
    }

    return identity;
  }

  updateSharedFields(playerId: PlayerID, sharedFields: SharedIdentityFields) {
    // Don't allow the network to override my own shared fields prior to sync
    const allowUpdate = playerId !== this.me.playerId || this.isSynced;
    if (allowUpdate) {
      const peer = this.getOrCreatePeer(sharedFields.clientId);
      peer.playerId = playerId;

      const identity = this.getOrCreateIdentity(playerId);
      identity.sharedFields.set(sharedFields);
      return identity;
    }
  }

  updateLocalFields(playerId: PlayerID, localFields: LocalIdentityFields) {
    const identity = this.getOrCreateIdentity(playerId);
    identity.localFields.update(($fields) => {
      const newFields = { ...$fields, ...localFields };
      return newFields;
    });
    return identity;
  }

  get(playerId: PlayerID): Identity {
    return this.identities.get(playerId);
  }

  remove(playerId: PlayerID) {
    const identity = this.get(playerId);
    identity?.avatar.destroy();
    this.identities.delete(playerId);
  }

  removeByClientId(clientId: YClientID) {
    const playerId = this.peers.get(clientId)?.playerId;
    if (playerId) this.remove(playerId);
    this.peers.delete(clientId);
  }

  setTransformData(clientId: YClientID, transformData: Array<number>) {
    let peer = this.peers.get(clientId);
    if (!peer) {
      peer = {
        lastSeen: performance.now(),
      };
    }

    /**
     * If we don't know the peer's playerId yet, wait until they broadcast it
     * and we can pair it up with their clientId. In the meantime, wait.
     */
    if (!peer.playerId) return;

    if (!peer.transform) {
      // Copy our clientId 'lastSeen' to the playerId 'lastSeen'
      const identity = this.updateLocalFields(peer.playerId, {
        lastSeen: peer.lastSeen,
      });

      peer.transform = identity.avatar.setTransformData.bind(identity.avatar);
    }

    peer.transform(transformData);
  }

  get active() {
    let count = 0;
    for (const identity of this.identities.values()) {
      if (identity.avatar.entity) count++;
    }
    return count;
  }

  get total() {
    return this.identities.size;
  }

  observeFields() {
    this.yfields.observe(
      (
        event: Y.YMapEvent<SharedIdentityFields>,
        transaction: Y.Transaction
      ) => {
        if (transaction.local) return;
        withMapEdits(event, {
          onAdd: this.updateSharedFields.bind(this),
          onUpdate: this.updateSharedFields.bind(this),
          onDelete: (playerId, fields) => {
            console.log("delete playerId", playerId, fields.clientId);
            this.peers.delete(fields.clientId);
            this.identities.delete(playerId);
          },
        });
      }
    );
  }

  /**
   * This observes both local and remote changes to the chat log ('append' operations).
   */
  observeChat() {
    this.ymessages.observe(
      (event: Y.YArrayEvent<ChatMessage>, transaction: Y.Transaction) => {
        withArrayEdits(event, {
          onAdd: (msg: ChatMessage) => {
            const playerId = msg.u;
            const localFields: LocalIdentityFields = {};

            const emoji = getEmojiFromMessage(msg);
            if (emoji) {
              localFields.emoji = emoji;
            } else {
              localFields.message = msg.c;
            }

            this.updateLocalFields(playerId, localFields);
          },
        });
      }
    );
  }
}
