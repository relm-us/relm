import { Readable } from "svelte/store";
import { Vector3, Euler, AnimationClip, MathUtils } from "three";

import { IdentityData } from "./types";
import { makeAvatar } from "~/prefab/makeAvatar";
import { makeAvatarAndActivate } from "~/prefab/makeAvatarAndActivate";

import { World, Entity } from "~/ecs/base";
import { Presentation, Transform, ModelMesh } from "~/ecs/plugins/core";
import { Html2d, Oculus, OculusRef } from "~/ecs/plugins/html2d";
import { Animation } from "~/ecs/plugins/animation";
import { FaceMapColors } from "~/ecs/plugins/coloration";
import { Morph } from "~/ecs/plugins/morph";

import { chatOpen } from "~/stores/chatOpen";

const OCULUS_HEIGHT = 2.4;
const LAST_SEEN_TIMEOUT = 15000;
const e1 = new Euler(0, 0, 0, "YXZ");
const v1 = new Vector3();

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
    this.syncOculus(identity);
    this.syncCharacter(identity);
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

  syncSpeech(identity: IdentityData) {
    const visible = !!identity.local.message && identity.shared.speaking;
    if (visible && !this.head.has(Html2d)) {
      this.addSpeech(identity.local.message, identity.local.isLocal);
    } else if (visible && this.head.has(Html2d)) {
      this.changeSpeech(identity.local.message);
    } else if (!visible && this.head.has(Html2d)) {
      this.head.remove(Html2d);
    }
  }

  syncOculus(identity: IdentityData) {
    if (!this.entity.has(Oculus)) {
      this.entity.add(Oculus, {
        playerId: identity.playerId,
        hanchor: 0,
        vanchor: 2,
        showAudio: identity.shared.showAudio,
        showVideo: identity.shared.showVideo,
        offset: new Vector3(0, OCULUS_HEIGHT, 0),
      });
    } else {
      const component = this.entity.get(OculusRef)?.component;

      if (component) {
        component.$set({
          showAudio: identity.shared.showAudio,
          showVideo: identity.shared.showVideo,
        });
      }
    }
  }

  syncCharacter(identity: IdentityData) {
    const influences = validInfluences(identity.shared.charMorphs);
    if (influences) {
      if (!this.entity.has(Morph)) {
        this.entity.add(Morph, { influences });
      } else {
        const morph = this.entity.get(Morph);
        morph.influences = influences;
        morph.modified();
      }
    }

    const colors = identity.shared.charColors;
    if (colors) {
      if (!this.entity.has(FaceMapColors)) {
        this.entity.add(FaceMapColors, { colors });
      } else {
        const facemap = this.entity.get(FaceMapColors);
        facemap.colors = colors;
        facemap.modified();
      }
    }
  }

  addSpeech(message: string, isLocal: boolean = false) {
    const onClose = isLocal ? () => chatOpen.set(false) : null;
    const speech = {
      kind: "SPEECH",
      content: message,
      offset: new Vector3(0.5, 0, 0),
      hanchor: 1,
      vanchor: 2,
      onClose,
    };
    this.head.add(Html2d, speech);
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

  addLabel(name: string, editable: boolean, color?: string) {
    const label = {
      kind: "LABEL",
      content: name,
      underlineColor: color ? color : null,
      offset: new Vector3(0, -0.2, 0),
      vanchor: 1,
      editable,
    };
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
    // const transformHead = this.entity.get(Transform);
    // e1.setFromQuaternion(transformHead.rotation);
    transformData[4] = 0;

    const clips: AnimationClip[] = this.entity.get(ModelMesh)?.clips;
    const clipName: string = this.entity.get(Animation)?.clipName;
    if (clips && clipName) {
      const index = clips.findIndex((c) => c.name === clipName);
      transformData[5] = index;
    }

    return transformData;
  }

  setTransformData([x, y, z, theta, headTheta, clipIndex]) {
    const transform = this.entity.get(Transform);

    // Set position of body
    // transform.position.set(x, y, z);
    v1.set(x, y, z);
    (transform.position as Vector3).lerp(v1, 0.3333);

    // Set angle of body
    e1.setFromQuaternion(transform.rotation);
    e1.y = theta;
    transform.rotation.setFromEuler(e1);

    // Set angle of head
    // const transformHead = this.head.get(Transform);
    // e1.setFromQuaternion(transform.rotation);
    // e1.y = headTheta;
    // transformHead.rotation.setFromEuler(e1);

    const clips = this.entity.get(ModelMesh)?.clips;
    const animation = this.entity.get(Animation);
    if (clips && clipIndex >= 0 && clipIndex < clips.length) {
      const newClipName = clips[clipIndex].name;
      if (animation.clipName !== newClipName) {
        animation.clipName = newClipName;
        animation.modified();
      }
    }
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

function validInfluences(influences) {
  if (!influences) return influences;
  else {
    return {
      "gender": MathUtils.clamp(influences["gender"] ?? 0, 0, 1),
      "wide": MathUtils.clamp(influences["wide"] ?? 0, 0, 1),
      "hair": MathUtils.clamp(influences["hair"] ?? 0, 0, 1),
      "hair-02": MathUtils.clamp(influences["hair-02"] ?? 0, 0, 1),
    };
  }
}
