import * as Y from "yjs";
import EventEmitter from "eventemitter3";

import { withArrayEdits, withMapEdits } from "relm-common/yrelm/observeUtils";

import { IdentityData, PlayerID, TransformData, YClientID } from "./types";

import { playerId } from "./playerId";
import { Identity } from "./Identity";
import { getLocalIdentityData } from "./identityData";
import { ChatMessage, getEmojiFromMessage } from "~/world/ChatManager";
import { audioDesired } from "~/stores/audioDesired";
import { videoDesired } from "~/stores/videoDesired";
import { DecoratedECSWorld } from "~/types/DecoratedECSWorld";
import * as avatarTransform from "./Avatar/transform";

const logEnabled = (localStorage.getItem("debug") || "")
  .split(":")
  .includes("identity");

const identityPreload = (localStorage.getItem("debug") || "")
  .split(":")
  .includes("preload");

export class IdentityManager extends EventEmitter {
  ydoc: Y.Doc;
  ecsWorld: DecoratedECSWorld;
  transformDataCounter: number = 0;

  identities: Map<PlayerID, Identity> = new Map();

  me: Identity;

  unsubs: Function[] = [];
  _observeFields: any;
  _observeChat: any;

  activeCache: Identity[] = [];

  constructor(ydoc: Y.Doc, ecsWorld: DecoratedECSWorld) {
    super();
    this.ydoc = ydoc;
    this.ecsWorld = ecsWorld;
  }

  init() {
    this.registerMe();

    this.observeFields();
    this.observeChat();
  }

  deinit() {
    this.unsubs.forEach((f) => f());
    this.unsubs.length = 0;

    this.identities.forEach((identity, playerId) => {
      identity.deinit();
    });
    this.identities.clear();

    this.unobserveFields();
    this.unobserveChat();
  }

  get yfields(): Y.Map<IdentityData> {
    return this.ydoc.getMap("identities");
  }

  get ymessages(): Y.Array<ChatMessage> {
    return this.ydoc.getArray("messages");
  }

  registerMe() {
    const identity = this.getOrCreateIdentity(playerId, true);

    const data = {
      ...getLocalIdentityData(),
      emoting: false,
      status: "initial",
    };
    identity.set(data);

    this.unsubs.push(
      audioDesired.subscribe((showAudio) => identity.set({ showAudio }))
    );
    this.unsubs.push(
      videoDesired.subscribe((showVideo) => identity.set({ showVideo }))
    );

    this.me = identity;
  }

  getOrCreateIdentity(playerId: PlayerID, isLocal: boolean = false) {
    let identity = this.identities.get(playerId);

    if (!identity) {
      identity = new Identity(this, this.ecsWorld, playerId, isLocal);
      identity.init();
      this.identities.set(playerId, identity);
    }

    return identity;
  }

  updateSharedFields(playerId: PlayerID, sharedFields: IdentityData) {
    if (logEnabled) {
      console.log(
        "updateSharedFields playerId:",
        playerId,
        ", skip because is me?",
        playerId === this.me.playerId
      );
    }
    // Don't allow the network to override my own shared fields prior to sync
    if (playerId === this.me.playerId) return;

    const identity = this.getOrCreateIdentity(playerId);
    identity.set(sharedFields, false);
    return identity;
  }

  get(playerId: PlayerID): Identity {
    return this.identities.get(playerId);
  }

  remove(playerId: PlayerID) {
    this.get(playerId)?.avatar.deinit();
  }

  removeByClientId(clientId: number) {
    for (let [playerId, identity] of this.identities.entries()) {
      if (identity.clientId === clientId) this.remove(playerId);
    }
  }

  // TODO: Change name to `getMyTransformData()`
  getTransformData() {
    return avatarTransform.getTransformData(
      this.me.playerId,
      this.me.avatar.entities
    );
  }

  setTransformData(clientId: number, transformData: TransformData) {
    const playerId = transformData[0];
    this.getOrCreateIdentity(playerId).setTransformData(
      clientId,
      transformData
    );
  }

  sync() {
    for (const identity of this.identities.values()) {
      identity.avatar.syncFromIdentityState();
    }
  }

  get active(): Identity[] {
    this.activeCache.length = 0;
    for (const identity of this.identities.values()) {
      if (identity.isActive && identity.avatar.position)
        this.activeCache.push(identity);
    }
    return this.activeCache;
  }

  get total() {
    return this.identities.size;
  }

  observeFields() {
    this.yfields.forEach((value, key, map) => {
      if (identityPreload) {
        this.updateSharedFields(key, value);
        if (logEnabled)
          console.log("IdentityManager observeFields PRELOADING:", key, value);
      } else if (logEnabled) {
        console.log("IdentityManager observeFields ignoring:", key, value);
      }
    });

    this._observeFields = (
      event: Y.YMapEvent<IdentityData>,
      transaction: Y.Transaction
    ) => {
      if (transaction.local) return;
      withMapEdits(
        event,
        {
          onAdd: this.updateSharedFields.bind(this),
          onUpdate: this.updateSharedFields.bind(this),
          onDelete: (playerId, fields) => {
            this.identities.delete(playerId);
          },
        },
        logEnabled
      );
    };

    this.yfields.observe(this._observeFields);
  }

  unobserveFields() {
    if (!this._observeFields) return;
    this.yfields.unobserve(this._observeFields);
  }

  /**
   * This observes both local and remote changes to the chat log ('append' operations).
   */
  observeChat() {
    this._observeChat = (
      event: Y.YArrayEvent<ChatMessage>,
      transaction: Y.Transaction
    ) => {
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
    };
    this.ymessages.observe(this._observeChat);
  }

  unobserveChat() {
    if (!this._observeChat) return;
    this.ymessages.unobserve(this._observeChat);
  }
}
