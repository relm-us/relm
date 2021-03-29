import * as Y from "yjs";
import EventEmitter from "eventemitter3";
import { get } from "svelte/store";

import { audioRequested, videoRequested } from "video-mirror";
import { withArrayEdits, withMapEdits } from "~/y-integration/observeUtils";

import { WorldDoc } from "~/y-integration/WorldDoc";
import type WorldManager from "~/world/WorldManager";

import {
  IdentityData,
  SharedIdentityFields,
  LocalIdentityFields,
  PlayerID,
  YClientID,
} from "./types";

import { defaultIdentity } from "./defaultIdentity";
import { Identity } from "./Identity";
import { ChatMessage } from "~/world/ChatManager";
import { localstorageSharedFields } from "./localstorageSharedFields";

export class IdentityManager extends EventEmitter {
  relm: WorldManager;
  wdoc: WorldDoc;

  yfields: Y.Map<SharedIdentityFields>;

  ymessages: Y.Array<ChatMessage>;

  identities: Map<PlayerID, Identity>;

  lookupPlayerId: Map<YClientID, PlayerID>;

  // Fast transform cache
  setTransformFns: Map<YClientID, Function>;

  me: Identity;

  isSynced: boolean;

  constructor(relm: WorldManager, myData: IdentityData = defaultIdentity) {
    super();
    this.relm = relm;
    this.yfields = relm.wdoc.ydoc.getMap("identities");
    this.ymessages = relm.wdoc.ydoc.getArray("messages");
    this.identities = new Map();
    this.lookupPlayerId = new Map();
    this.setTransformFns = new Map();
    this.isSynced = false;

    this.registerMe(myData, relm.wdoc.ydoc.clientID);

    this.observeFields();
    this.observeChat();
  }

  registerMe(myData: IdentityData, clientId: YClientID) {
    myData.shared.clientId = clientId;

    const identity = new Identity(this, myData.playerId, {
      // Swap out the regular store for a localstorage store
      sharedFieldsStore: localstorageSharedFields,
      localFields: myData.local,
    });

    audioRequested.subscribe((showAudio) => {
      identity.sharedFields.update(($fields) =>
        Object.assign($fields, { showAudio })
      );
    });

    videoRequested.subscribe((showVideo) => {
      identity.sharedFields.update(($fields) =>
        Object.assign($fields, { showVideo })
      );
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
      }
    });

    /**
     * After getting 'sync' signal, yjs doc is synced and can accept
     * more up to date values, such as the clientId of this connection.
     */
    this.relm.wdoc.on("sync", () => {
      identity.sharedFields.update(($fields) => {
        return { ...$fields, clientId };
      });
      this.isSynced = true;
    });

    this.me = identity;
  }

  updateSharedFields(playerId: PlayerID, sharedFields: SharedIdentityFields) {
    // Don't allow the network to override my own shared fields prior to sync
    const allowUpdate = playerId !== this.me.playerId || this.isSynced;

    if (allowUpdate) {
      let identity = this.identities.get(playerId);
      if (!identity) {
        identity = new Identity(this, playerId, { sharedFields });
      } else {
        identity.sharedFields.set(sharedFields);
      }
      return identity;
    }
  }

  updateLocalFields(playerId: PlayerID, localFields: LocalIdentityFields) {
    let identity = this.identities.get(playerId);
    if (!identity) {
      identity = new Identity(this, playerId, { localFields });
    } else {
      const existingLocalFields = get(identity.localFields);
      identity.localFields.set(
        Object.assign({}, existingLocalFields, localFields)
      );
    }
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
    const playerId = this.lookupPlayerId.get(clientId);
    if (playerId) this.remove(playerId);
    this.lookupPlayerId.delete(clientId);
    this.setTransformFns.delete(clientId);
  }

  setTransformData(clientId: YClientID, transform: Array<number>) {
    let fn = this.setTransformFns.get(clientId);

    if (!fn) {
      // optimize by keeping this out of the fast-path
      const playerId = this.lookupPlayerId.get(clientId);
      if (!playerId) {
        /**
         * We can't set the remote player's transform yet, because
         * we don't know the playerId. We'll assume that whoever
         * it is will soon broadcast their playerId/clientId pair
         * so we can map clientId to playerId. In the meantime, just
         * wait until next time.
         */
        return;
      }

      const identity = this.updateLocalFields(playerId, {
        lastSeen: performance.now(),
      });

      fn = identity.avatar.setTransformData.bind(identity.avatar);
      this.setTransformFns.set(clientId, fn);
    }

    fn(transform);
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
            this.lookupPlayerId.delete(fields.clientId);
            this.identities.delete(playerId);
          },
        });
      }
    );
  }

  observeChat() {
    this.ymessages.observe(
      (event: Y.YArrayEvent<ChatMessage>, transaction: Y.Transaction) => {
        withArrayEdits(event, {
          onAdd: (msg: ChatMessage) => {
            const playerId = msg.u;
            this.updateLocalFields(playerId, { message: msg.c });
          },
        });
      }
    );
  }
}
