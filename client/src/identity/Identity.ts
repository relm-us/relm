import { Avatar } from "./Avatar";

import { writable, derived, Readable, Writable } from "svelte/store";
import type { IdentityManager } from "./IdentityManager";
import {
  IdentityData,
  SharedIdentityFields,
  LocalIdentityFields,
  PlayerID,
} from "./types";

/**
 * A participant's Identity is created from Shared fields such as
 * name and color, as well as Local fields, such as a temporary clientId.
 *
 * There are two types of identities: local & remote. A `local` identity
 * is assembled from 2 "layers", with each subsequent layer taking higher
 * precedence:
 *
 * 1. defaultIdentity - this provides a random name and color
 * 2. localstorageSharedFields - provides name and color, stored in localstorage
 *
 * A `remote` identity is created based on SharedIdentityFields that are sent
 * via yjs.
 */
export class Identity implements Readable<IdentityData> {
  manager: IdentityManager;

  playerId: PlayerID;

  /**
   * We store some identity fields, e.g. name & color on the yjs
   * document so that everyone can get access.
   */
  sharedFields: Writable<SharedIdentityFields>;

  /**
   * Local fields track this player's subjective view of other
   * player data; e.g. when the other player was last seen
   */
  localFields: Writable<LocalIdentityFields>;

  /**
   * This is the "full dataset" of players in the relm. Combines
   * Shared & Local fields.
   */
  derivedIdentity: Readable<IdentityData>;

  avatar: Avatar;

  constructor(
    manager: IdentityManager,
    playerId: PlayerID,
    {
      sharedFieldsStore,
      sharedFields = {},
      localFieldsStore,
      localFields = { isLocal: false },
    }: {
      sharedFieldsStore?: Writable<SharedIdentityFields>;
      sharedFields?: SharedIdentityFields;
      localFieldsStore?: Writable<LocalIdentityFields>;
      localFields?: LocalIdentityFields;
    }
  ) {
    this.manager = manager;
    this.playerId = playerId;
    this.sharedFields = sharedFieldsStore || writable(sharedFields);
    this.localFields = localFieldsStore || writable(localFields);
    this.derivedIdentity = this.deriveIdentityStore();

    // Give IdentityManager a way to look this identity up
    this.manager.identities.set(playerId, this);

    this.sharedFields.subscribe(($sharedFields) => {
      // If clientId changes, we need to map it
      if ($sharedFields.clientId) {
        this.manager.lookupPlayerId.set($sharedFields.clientId, this.playerId);
      }
    });

    // Create an avatar to go with the identity
    this.avatar = new Avatar(this.derivedIdentity, this.manager.wdoc.world);
  }

  deriveIdentityStore(): Readable<IdentityData> {
    return derived(
      [this.sharedFields, this.localFields],
      ([$shared, $local], set) => {
        set({
          playerId: this.playerId,
          shared: $shared,
          local: $local,
        });
      }
    );
  }

  subscribe(handler) {
    return this.derivedIdentity.subscribe(handler);
  }

  setName(name) {
    this.sharedFields.update(($fields) => ({ ...$fields, name }));
  }
}
