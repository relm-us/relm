import * as Y from "yjs";
import EventEmitter from "eventemitter3";
import { get } from "svelte/store";

import { withArrayEdits, withMapEdits } from "~/y-integration/observeUtils";

import { WorldDoc } from "~/y-integration/WorldDoc";

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

export class IdentityManager extends EventEmitter {
  wdoc: WorldDoc;

  yfields: Y.Map<SharedIdentityFields>;

  ymessages: Y.Array<ChatMessage>;

  identities: Map<PlayerID, Identity>;

  lookupPlayerId: Map<YClientID, PlayerID>;

  // Fast transform cache
  setTransformFns: Map<YClientID, Function>;

  isSynced: boolean;

  me: Identity;

  constructor(wdoc: WorldDoc, myData: IdentityData = defaultIdentity) {
    super();
    this.wdoc = wdoc;
    this.yfields = wdoc.ydoc.getMap("identities");
    this.ymessages = wdoc.ydoc.getArray("messages");
    this.identities = new Map();
    this.lookupPlayerId = new Map();
    this.setTransformFns = new Map();
    this.isSynced = false;

    this.registerMe(myData, this.wdoc.ydoc.clientID);

    this.observeFields();
    this.observeChat();
  }

  registerMe(myData: IdentityData, clientId: YClientID) {
    myData.shared.clientId = clientId;

    this.updateLocalFields(myData.playerId, myData.local);
    this.updateSharedFields(myData.playerId, myData.shared);

    const identity = this.identities.get(myData.playerId);
    identity.sharedFields.subscribe(($sharedFields) => {
      if (this.isSynced) {
        this.yfields.set(myData.playerId, $sharedFields);
      }
    });

    /**
     * After getting 'sync' signal, yjs doc is synced and
     * can accept a new "me" as more recent than previous.
     */
    this.wdoc.on("sync", () => {
      this.isSynced = true;
      identity.sharedFields.set(myData.shared);
    });

    this.me = identity;
  }

  updateSharedFields(playerId: PlayerID, sharedFields: SharedIdentityFields) {
    let identity = this.identities.get(playerId);
    if (!identity) {
      identity = new Identity(this.wdoc.world, playerId, { sharedFields });
      this.identities.set(playerId, identity);

      identity.sharedFields.subscribe(($sharedFields) => {
        // If clientId changes, we need to map it
        if ($sharedFields.clientId) {
          this.lookupPlayerId.set($sharedFields.clientId, playerId);
        }
      });
    } else {
      identity.sharedFields.set(sharedFields);
    }
    return identity;
  }

  updateLocalFields(playerId: PlayerID, localFields: LocalIdentityFields) {
    let identity = this.identities.get(playerId);
    if (!identity) {
      identity = new Identity(this.wdoc.world, playerId, { localFields });
      this.identities.set(playerId, identity);
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

  setTransform(clientId: YClientID, transform: Array<number>) {
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

      fn = identity.avatar.setTransform.bind(identity.avatar);
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
