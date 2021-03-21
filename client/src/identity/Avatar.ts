import { Readable } from "svelte/store";
import { Vector3, Euler } from "three";

import { IdentityData } from "./types";
import { makeAvatar } from "~/prefab/makeAvatar";
import { makeAvatarAndActivate } from "~/prefab/makeAvatarAndActivate";

import { World, Entity } from "~/ecs/base";
import { Presentation, Transform } from "~/ecs/plugins/core";
import { Html2d, Oculus } from "~/ecs/plugins/html2d";

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

  destroy() {
    this.entity?.destroy();
  }

  syncEntity(identity: IdentityData) {
    this.syncLabel(identity);
    this.syncSpeech(identity);
    this.syncOculus(identity.playerId);
  }

  syncSpeech(identity: IdentityData) {
    const visible = !!identity.local.message && identity.shared.speaking;
    if (visible && !this.head.has(Html2d)) {
      this.addSpeech(identity.local.message);
    } else if (visible && this.head.has(Html2d)) {
      this.changeSpeech(identity.local.message);
    } else if (!visible && this.head.has(Html2d)) {
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

  syncOculus(playerId: string) {
    if (!this.entity.has(Oculus)) {
      this.entity.add(Oculus, {
        playerId,
        hanchor: 0,
        vanchor: 2,
        offset: new Vector3(0, 1.35, 0),
      });
    }
  }

  changeSpeech(message: string) {
    const label = this.head.get(Html2d);
    label.content = message;
    label.modified();
  }

  disableEditingLabel() {
    const label = this.entity.get(Html2d);
    label.editable = false;
    label.modified();
  }

  syncLabel(identity: IdentityData) {
    if (identity.shared.name && !this.entity.has(Html2d)) {
      this.addLabel(
        identity.shared.name,
        identity.local.isLocal,
        identity.shared.color
      );
    } else if (identity.shared.name && this.entity.has(Html2d)) {
      this.changeLabel(identity.shared.name, identity.shared.color);
    } else if (!identity.shared.name && this.entity.has(Html2d)) {
      this.entity.remove(Html2d);
    }
  }

  addLabel(name: string, editable: boolean, color?: string) {
    const label = {
      kind: "LABEL",
      content: name,
      underlineColor: null,
      offset: new Vector3(0, -0.75, 0),
      vanchor: 1,
      editable,
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

  moveTo(coords: Vector3) {
    const presentation = (this.world as any).presentation;
    moveAvatarTo(coords, presentation, this.entity);
  }

  getTransformData() {
    const transformData = [];
    const transform = this.entity.get(Transform);

    // Get position of body
    transform.position.toArray(transformData, 0);

    // Get angle of body
    e1.setFromQuaternion(transform.rotation);
    transformData[3] = e1.y;

    // Get angle of head
    const transformHead = this.head.get(Transform);
    e1.setFromQuaternion(transformHead.rotation);
    transformData[4] = e1.y;

    return transformData;
  }

  setTransformData([x, y, z, theta, headTheta]) {
    const transform = this.entity.get(Transform);

    // Set position of body
    transform.position.set(x, y, z);

    // Set angle of body
    e1.setFromQuaternion(transform.rotation);
    e1.y = theta;
    transform.rotation.setFromEuler(e1);

    // Set angle of head
    const transformHead = this.head.get(Transform);
    e1.setFromQuaternion(transform.rotation);
    e1.y = headTheta;
    transformHead.rotation.setFromEuler(e1);
  }
}

export function moveAvatarTo(
  newCoords: Vector3,
  presentation: Presentation,
  entity: Entity
) {
  const transform = entity.get(Transform);
  const delta = new Vector3().copy(newCoords).sub(transform.position);

  // Move the participant
  entity.traverse((e) => e.get(Transform).position.add(delta), false, true);

  // Don't render the next 3 frames so that everything has
  // a chance to "catch up" to the participant's new position
  presentation.skipUpdate = 3;
}
