import { Avatar } from "./Avatar";

import { World } from "~/ecs/base";
import { get, writable, derived, Readable, Writable } from "svelte/store";
import {
  IdentityData,
  SharedIdentityFields,
  LocalIdentityFields,
  PlayerID,
} from "./types";

export class Identity implements Readable<IdentityData> {
  world: World;

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
    world: World,
    playerId: PlayerID,
    {
      sharedFields = {},
      localFields = { isLocal: false },
    }: {
      sharedFields?: SharedIdentityFields;
      localFields?: LocalIdentityFields;
    }
  ) {
    this.world = world;
    this.playerId = playerId;
    this.sharedFields = writable(sharedFields);
    this.localFields = writable(localFields);
    this.derivedIdentity = this.deriveIdentityStore();

    this.avatar = new Avatar(this.derivedIdentity, this.world);
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
}
