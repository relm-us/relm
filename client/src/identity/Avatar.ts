import { Vector3, Euler, AnimationClip } from "three";

import type { Identity } from "./Identity";
import { makeAvatar } from "~/prefab/makeAvatar";
import { playerId } from "~/identity/playerId";

import { World, Entity } from "~/ecs/base";
import { Transform, WorldTransform } from "~/ecs/plugins/core";
import { ModelRef } from "~/ecs/plugins/model";
import { Html2d, Oculus, OculusRef } from "~/ecs/plugins/html2d";
import { Animation } from "~/ecs/plugins/animation";
import { FaceMapColors } from "~/ecs/plugins/coloration";
import { Distance, DistanceRef } from "~/ecs/plugins/distance";
import { Morph } from "~/ecs/plugins/morph";
import { Controller } from "~/ecs/plugins/player-control";
import { Collider } from "~/ecs/plugins/physics";
import { Translucent } from "~/ecs/plugins/translucent";
import { NonInteractive } from "~/ecs/plugins/non-interactive";
import {
  TwistBone,
  headFollowsPointer,
  headFollowsAngle,
} from "~/ecs/plugins/twist-bone";

import { chatOpen } from "~/stores/chatOpen";
import { appearanceToCharacterTraits } from "./appearance";
import { worldManager } from "~/world";

import {
  AVATAR_BUILDER_INTERACTION,
  AVATAR_INTERACTION,
} from "~/config/colliderInteractions";
import { worldUIMode } from "~/stores/worldUIMode";
import { TransformData } from "./types";

const OCULUS_HEIGHT = 2.4;
const DEFAULT_LABEL_COLOR = "#D0D0D0";
const e1 = new Euler(0, 0, 0, "YXZ");
const v1 = new Vector3();

export class Avatar {
  identity: Identity;
  world: World;

  entity: Entity = null;
  headEntity: Entity;
  emojiEntity: Entity;

  headAngle: number;
  _editableName: boolean;

  unsubs: Function[] = [];

  constructor(identity: Identity, world: World) {
    this.identity = identity;
    this.world = world;

    // By default, the avatar's name is allowed to be edited (but can be changed by JWT)
    this._editableName = this.identity.isLocal;
  }

  init() {
    if (this.identity.isLocal) {
      this.makeLocalAvatar();
    }
  }

  deinit() {
    this.unsubs.forEach((f) => f());
    this.unsubs.length = 0;

    this.entity?.destroy();
    this.entity = null;
  }

  // Remove Avatar's distance to participant's Avatar
  get distance() {
    return this.entity?.get(DistanceRef)?.value;
  }

  get position(): Vector3 {
    return this.entity?.get(Transform)?.position;
  }

  get editableName() {
    return this._editableName;
  }

  set editableName(value) {
    this._editableName = value;
    const name = this.identity.get("name");
    const color = this.identity.get("color");
    this.changeLabel(name, color, this._editableName);
  }

  // This function is called regularly (each loop) and brings the ECS state
  // up to date with the Identity state, as needed.
  syncFromIdentityState() {
    if (this.identity.sharedFieldsUpdated) {
      this.maybeMakeRemoteAvatar();
      this.syncEntity();
      this.identity.sharedFieldsUpdated = false;
    }
  }

  maybeMakeRemoteAvatar() {
    if (
      !this.entity &&
      !this.identity.isLocal &&
      this.identity.wasRecentlySeen() &&
      this.identity.get("status") !== "initial"
    ) {
      this.makeRemoteAvatar();
    }
  }

  makeAvatar(kinematic: boolean, callback?: (entity: Entity) => void) {
    const opts = { kinematic };
    const { avatar, head, emoji } = makeAvatar(
      this.world,
      opts,
      this.identity.playerId
    );
    this.headEntity = head;
    this.emojiEntity = emoji;
    callback?.(avatar);
    avatar.traverse((entity) => entity.activate());

    this.entity = avatar;
  }

  makeLocalAvatar() {
    this.makeAvatar(false, (avatar) => {
      avatar.add(Controller).add(TwistBone, {
        boneName: "mixamorigHead",
        function: headFollowsPointer((angle) => (this.headAngle = angle)),
      });
    });

    // Local participant name is hidden in build mode so the label does
    // not obstruct clicking / dragging etc.
    this.unsubs.push(
      worldUIMode.subscribe(($mode) => {
        const label = this.entity.get(Html2d);
        if (label) {
          label.visible = $mode === "play";
          label.modified();
        }
      })
    );
  }

  makeRemoteAvatar() {
    this.makeAvatar(true, (avatar) => {
      avatar
        .add(TwistBone, {
          boneName: "mixamorigHead",
          function: headFollowsAngle(() => this.headAngle),
        })
        .add(Distance, {
          target: playerId,
        });
    });
  }

  syncEntity() {
    if (!this.entity) return;
    this.syncLabel();
    this.syncSpeech();
    this.syncEmoji();
    this.syncOculus();
    this.syncAppearance();
  }

  syncLabel() {
    const identity = this.identity;
    const name = identity.get("name");
    const color = identity.get("color");
    if (name && !this.entity.has(Html2d)) {
      this.addLabel(name, color, this.editableName);
    } else if (name && this.entity.has(Html2d)) {
      this.changeLabel(name, color, this.editableName);
    } else if (!name && this.entity.has(Html2d)) {
      this.entity.remove(Html2d);
    }
  }

  syncSpeech() {
    const identity = this.identity;
    const message = identity.get("message");
    const visible = !!message && identity.get("speaking");
    if (visible && !this.headEntity.has(Html2d)) {
      this.addSpeech(message, identity.isLocal);
    } else if (visible && this.headEntity.has(Html2d)) {
      this.changeSpeech(message);
    } else if (!visible && this.headEntity.has(Html2d)) {
      this.headEntity.remove(Html2d);
    }
  }

  syncEmoji() {
    const identity = this.identity;
    const emoji = identity.get("emoji");
    const visible = emoji && identity.get("emoting");
    if (visible && !this.emojiEntity.has(Html2d)) {
      this.addEmote(emoji);
    } else if (visible && this.emojiEntity.has(Html2d)) {
      this.changeEmote(emoji);
    } else if (!visible && this.emojiEntity.has(Html2d)) {
      this.emojiEntity.remove(Html2d);
    }
  }

  syncOculus() {
    const identity = this.identity;
    if (!this.entity.has(Oculus)) {
      this.entity.add(Oculus, {
        playerId: identity.playerId,
        hanchor: 0,
        vanchor: 2,
        showAudio: identity.get("showAudio"),
        showVideo: identity.get("showVideo"),
        offset: new Vector3(0, OCULUS_HEIGHT, 0),
      });
    } else {
      const component = this.entity.get(OculusRef)?.component;

      if (component) {
        component.$set({
          showAudio: identity.get("showAudio"),
          showVideo: identity.get("showVideo"),
        });
      }
    }
  }

  syncAppearance() {
    const identity = this.identity;
    const appearance = identity.get("appearance");

    const { morphs, colors } = appearanceToCharacterTraits(appearance);

    if (morphs) {
      if (!this.entity.has(Morph)) {
        this.entity.add(Morph, { influences: morphs });
      } else {
        const morph = this.entity.get(Morph);
        morph.influences = morphs;
        morph.modified();
      }
    }

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

  addEmote(content: string) {
    this.emojiEntity.add(Html2d, {
      kind: "EMOJI",
      content,
      hanchor: 2,
      offset: new Vector3(-0.25, 0, 0),
    });
  }

  changeEmote(content: string) {
    const html2d = this.emojiEntity.get(Html2d);
    if (!html2d) return;

    if (html2d.content !== content) {
      html2d.content = content;
      html2d.modified();
    }
  }

  removeEmote() {
    this.emojiEntity.maybeRemove(Html2d);
  }

  addSpeech(message: string, isLocal: boolean = false) {
    const onClose = isLocal ? () => chatOpen.set(false) : null;
    this.headEntity.add(Html2d, {
      kind: "SPEECH",
      content: message,
      offset: new Vector3(0.5, 0, 0),
      hanchor: 1,
      vanchor: 2,
      onClose,
    });
  }

  changeSpeech(message: string) {
    const label = this.headEntity.get(Html2d);
    if (!label) return;

    if (label.content !== message) {
      label.content = message;
      label.modified();
    }
  }

  addLabel(name: string, color: string, editable: boolean) {
    const label = {
      kind: "LABEL",
      content: name,
      underlineColor: color || DEFAULT_LABEL_COLOR,
      offset: new Vector3(0, -0.2, 0),
      vanchor: 1,
      editable,
    };
    this.entity.add(Html2d, label);
  }

  changeLabel(name: string, color: string, editable: boolean) {
    const label = this.entity.get(Html2d);
    if (!label) return;

    let modified = false;
    if (label.content !== name) {
      label.content = name;
      modified = true;
    }

    if (label.editable !== editable) {
      label.editable = editable;
      modified = true;
    }

    if (label.underlineColor !== color) {
      label.underlineColor = color;
      modified = true;
    }

    if (modified) label.modified();
  }

  moveTo(coords: Vector3) {
    moveAvatarTo(coords, this.entity);
  }

  getTransformData() {
    if (!this.entity) return;

    const transformData: any[] = [this.identity.playerId];
    const transform = this.entity.get(Transform);
    if (!transform) return;

    // Get position of body
    transform.position.toArray(transformData, 1);

    // Get angle of body
    e1.setFromQuaternion(transform.rotation);
    transformData[4] = e1.y;

    // Get angle of head
    transformData[5] = this.headAngle;

    const clips: AnimationClip[] = this.entity.get(ModelRef)?.animations;
    const clipName: string = this.entity.get(Animation)?.clipName;
    if (clips && clipName) {
      const index = clips.findIndex((c) => c.name === clipName);
      transformData[6] = index;
    }

    return transformData as TransformData;
  }

  setTransformData([
    _playerId,
    x,
    y,
    z,
    theta,
    headTheta,
    clipIndex,
  ]: TransformData) {
    if (!this.entity) return;

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
    this.headAngle = headTheta;

    const clips = this.entity.get(ModelRef)?.animations;
    const animation = this.entity.get(Animation);
    if (clips && clipIndex >= 0 && clipIndex < clips.length) {
      const newClipName = clips[clipIndex].name;
      if (animation.clipName !== newClipName) {
        animation.clipName = newClipName;
        animation.modified();
      }
    }
  }

  enableCanFly(enabled = true) {
    const controller = this.entity.get(Controller);
    if (!controller) return;
    controller.canFly = enabled;
    controller.modified();
  }

  enablePhysics(enabled = true) {
    this.entity.traverse((entity) => {
      const collider = entity.components.get(Collider);
      if (!collider) return;

      // prettier-ignore
      (collider as any).interaction =
        enabled ? AVATAR_INTERACTION : // interact with normal things
                  AVATAR_BUILDER_INTERACTION ; // interact only with ground

      collider.modified();
    });
  }

  enableTranslucency(enabled = true) {
    if (enabled) {
      this.entity.add(Translucent, { opacity: 0.5 });
    } else {
      this.entity.maybeRemove(Translucent);
    }
  }

  enableNonInteractive(enabled = true) {
    if (enabled) {
      this.entity.add(NonInteractive);
    } else {
      this.entity.maybeRemove(NonInteractive);
    }
  }
}

export function moveAvatarTo(newCoords: Vector3, entity: Entity) {
  const transform = entity.get(Transform);
  // How much to move Avatar by to arrive at newCoords
  const delta = new Vector3().copy(newCoords).sub(transform.position);

  // Move the participant
  entity.traverse(
    (e) => {
      // Update ECS Transform object
      const transform = e.get(Transform);
      transform.position.add(delta);

      const world = e.get(WorldTransform);
      world.position.add(delta);

      // Physics engine keeps a copy of position, update it too
      const rigidBody = (entity.getByName("RigidBody").sync = true);
    },
    false,
    true
  );

  worldManager.camera.moveTo(newCoords);

  // Don't render the next 3 frames so that everything has
  // a chance to "catch up" to the participant's new position
  // presentation.skipUpdate = 3;
}
