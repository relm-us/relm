import { Readable } from "svelte/store";
import { Vector3, Euler } from "three";

import {
  IdentityData,
  LocalIdentityFields,
  SharedIdentityFields,
} from "./types";
import { makeAvatar } from "~/prefab/makeAvatar";
import { makeAvatarAndActivate } from "~/prefab/makeAvatarAndActivate";

import { World, Entity } from "~/ecs/base";
import { Transform } from "~/ecs/plugins/core";
import { Html2d } from "~/ecs/plugins/html2d";

const LAST_SEEN_TIMEOUT = 15000;
const e1 = new Euler(0, 0, 0, "YXZ");

export class Avatar {
  world: World;

  identity: Readable<IdentityData>;

  entity: Entity;

  constructor(identity: Readable<IdentityData>, world: World) {
    this.world = world;
    this.identity = identity;

    this.identity.subscribe(($id) => {
      const seenAgoMillis =
        performance.now() - ($id.local.lastSeen ?? -LAST_SEEN_TIMEOUT);
      if (!this.entity && $id.local.isLocal) {
        this.entity = this.makeLocalAvatar();
      } else if (!this.entity && !$id.local.isLocal) {
        if (seenAgoMillis < LAST_SEEN_TIMEOUT) {
          this.entity = this.makeRemoteAvatar($id.playerId);
        }
      }

      if (this.entity) {
        this.syncEntity($id);
      }
    });
  }

  // TODO: more configurable avatars; for now, we cheat a bit and return the head.
  get head() {
    return this.entity?.getChildren()[0];
  }

  makeLocalAvatar() {
    return makeAvatarAndActivate(this.world);
  }

  makeRemoteAvatar(playerId) {
    const opts = { kinematic: true };
    const { avatar } = makeAvatar(this.world, opts, playerId);
    avatar.traverse((entity) => entity.activate());
    return avatar;
  }

  syncEntity(identity: IdentityData) {
    console.log("syncEntity", identity);
    this.syncLabel(identity.shared);
    this.syncSpeech(identity.local);
  }

  syncSpeech(fields: LocalIdentityFields) {
    if (fields.message && !this.head.has(Html2d)) {
      this.addSpeech(fields.message);
    } else if (fields.message && this.head.has(Html2d)) {
      this.changeSpeech(fields.message);
    } else if (!fields.message && this.head.has(Html2d)) {
      this.head.remove(Html2d);
    }
  }

  addSpeech(message: string) {
    const speech = {
      kind: "SPEECH",
      content: message,
      offset: new Vector3(0.5, 0, 0),
      hanchor: 1,
      vanchor: 2,
    };
    this.head.add(Html2d, speech);
  }

  changeSpeech(message: string) {
    const label = this.head.get(Html2d);
    label.content = message;
    label.modified();
  }

  syncLabel(fields: SharedIdentityFields) {
    if (fields.name && !this.entity.has(Html2d)) {
      this.addLabel(fields.name, fields.color);
    } else if (fields.name && this.entity.has(Html2d)) {
      this.changeLabel(fields.name, fields.color);
    } else if (!fields.name && this.entity.has(Html2d)) {
      this.entity.remove(Html2d);
    }
  }

  addLabel(name: string, color?: string) {
    const label = {
      kind: "LABEL",
      content: name,
      underlineColor: null,
      offset: new Vector3(0, -0.75, 0),
      vanchor: 1,
    };
    if (color) {
      label.underlineColor = color;
    }
    this.entity.add(Html2d, label);
  }

  changeLabel(name: string, color?: string) {
    const label = this.entity.get(Html2d);
    label.content = name;
    if (color) {
      label.underlineColor = color;
    }
    label.modified();
  }

  setTransform([x, y, z, theta]) {
    const transform = this.entity.get(Transform);
    transform.position.set(x, y, z);
    e1.setFromQuaternion(transform.rotation);
    e1.y = theta;
    transform.rotation.setFromEuler(e1);
  }
}
