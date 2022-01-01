import * as Y from "yjs";
import EventEmitter from "eventemitter3";

import { withArrayEdits, withMapEdits } from "relm-common/yrelm/observeUtils";

import { IdentityData, PlayerID, YClientID } from "./types";

import { playerId } from "./playerId";
import { Identity } from "./Identity";
import { getLocalIdentityData } from "./identityData";
import { ChatMessage, getEmojiFromMessage } from "~/world/ChatManager";
import { audioDesired } from "~/stores/audioDesired";
import { videoDesired } from "~/stores/videoDesired";
import { DecoratedECSWorld } from "~/types/DecoratedECSWorld";

type ClientUpdateFunction = (data: any[]) => void;

export class IdentityManager extends EventEmitter {
  ydoc: Y.Doc;
  ecsWorld: DecoratedECSWorld;

  identities: Map<PlayerID, Identity> = new Map();

  clientLastSeen: Map<YClientID, number> = new Map();
  clientUpdateFns: Map<YClientID, ClientUpdateFunction> = new Map();

  me: Identity;

  init(ydoc: Y.Doc, ecsWorld: DecoratedECSWorld) {
    this.ydoc = ydoc;
    this.ecsWorld = ecsWorld;

    this.registerMe(this.ydoc.clientID);

    this.observeFields();
    this.observeChat();
  }

  get yfields(): Y.Map<IdentityData> {
    return this.ydoc.getMap("identities");
  }

  get ymessages(): Y.Array<ChatMessage> {
    return this.ydoc.getArray("messages");
  }

  registerMe(clientId: YClientID) {
    const identity = this.getOrCreateIdentity(playerId, true);

    const data = {
      ...getLocalIdentityData(),
      clientId,
      emoting: false,
      status: "initial",
    };
    identity.set(data);

    audioDesired.subscribe((showAudio) => identity.set({ showAudio }));
    videoDesired.subscribe((showVideo) => identity.set({ showVideo }));

    this.me = identity;
  }

  getOrCreateIdentity(playerId: PlayerID, isLocal: boolean = false) {
    let identity = this.identities.get(playerId);

    if (!identity) {
      identity = new Identity(this, this.ecsWorld, playerId, isLocal);
      this.identities.set(playerId, identity);
    }

    return identity;
  }

  updateSharedFields(playerId: PlayerID, sharedFields: IdentityData) {
    // Don't allow the network to override my own shared fields prior to sync
    if (playerId === this.me.playerId) return;

    const identity = this.getOrCreateIdentity(playerId);
    identity.set(sharedFields, false);
    return identity;
  }

  get(playerId: PlayerID): Identity {
    return this.identities.get(playerId);
  }

  // Find Identity by YClientID; may be undefined if peer hasn't announced its clientId yet
  getByClientId(clientId: YClientID): Identity {
    if (!clientId) return;
    for (const identity of this.identities.values()) {
      if (identity.sharedFields.clientId === clientId) {
        return identity;
      }
    }
  }

  remove(playerId: PlayerID) {
    this.get(playerId)?.avatar.destroy();
  }

  removeByClientId(clientId: YClientID) {
    const identity = this.getByClientId(clientId);
    if (identity) this.remove(identity.playerId);
  }

  getTransformData() {
    return this.me.avatar.getTransformData();
  }

  setTransformData(clientId: YClientID, transformData: Array<number>) {
    this.clientLastSeen.set(clientId, performance.now());
    let update = this.clientUpdateFns.get(clientId);

    if (!update) {
      const identity = this.getByClientId(clientId);

      //  If we can't find the identity from a clientId yet, wait until we can
      if (!identity) return;

      update = identity.avatar.setTransformData.bind(identity.avatar);
      this.clientUpdateFns.set(clientId, update);
    }

    update(transformData);
  }

  sync() {
    for (const identity of this.identities.values()) {
      identity.avatar.syncFromIdentityState();
    }
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
      (event: Y.YMapEvent<IdentityData>, transaction: Y.Transaction) => {
        if (transaction.local) return;
        withMapEdits(event, {
          onAdd: this.updateSharedFields.bind(this),
          onUpdate: this.updateSharedFields.bind(this),
          onDelete: (playerId, fields) => {
            this.identities.delete(playerId);
            console.log("identity removed:", playerId, fields.clientId);
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
            const identity = this.getOrCreateIdentity(playerId);

            const emoji = getEmojiFromMessage(msg);
            if (emoji) {
              identity.set({ emoji: emoji }, false);
            } else {
              identity.set({ message: msg.c }, false);
            }
          },
        });
      }
    );
  }
}
