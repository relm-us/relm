import { Vector3 } from "three";

import type { Identity } from "./Identity";
import { makeAvatar } from "~/prefab/makeAvatar";
import { playerId } from "~/identity/playerId";

import { Entity } from "~/ecs/base";
import { Transform, WorldTransform } from "~/ecs/plugins/core";
import { Html2d } from "~/ecs/plugins/html2d";
import { Distance, DistanceRef } from "~/ecs/plugins/distance";
import { Controller } from "~/ecs/plugins/player-control";
import { Collider } from "~/ecs/plugins/physics";
import { Translucent } from "~/ecs/plugins/translucent";
import { NonInteractive } from "~/ecs/plugins/non-interactive";
import {
  TwistBone,
  headFollowsPointer,
  headFollowsAngle,
} from "~/ecs/plugins/twist-bone";

import { worldManager } from "~/world";

import {
  AVATAR_BUILDER_INTERACTION,
  AVATAR_INTERACTION,
} from "~/config/colliderInteractions";
import { worldUIMode } from "~/stores/worldUIMode";
import { AvatarEntities } from "./types";
import { DecoratedECSWorld } from "~/types/DecoratedECSWorld";
import { changeLabel, setLabel } from "./Avatar/label";
import { setSpeech } from "./Avatar/speech";
import { setEmoji } from "./Avatar/emoji";
import { setOculus } from "./Avatar/oculus";
import { setAppearance } from "./Avatar/appearance";

export class Avatar {
  identity: Identity;
  ecsWorld: DecoratedECSWorld;

  entities: AvatarEntities;

  _editableName: boolean;

  unsubs: Function[] = [];

  constructor(identity: Identity, ecsWorld: DecoratedECSWorld) {
    this.identity = identity;
    this.ecsWorld = ecsWorld;

    // By default, the avatar's name is allowed to be edited (but can be changed by JWT)
    this._editableName = this.identity.isLocal;
    this.entities = {
      head: null,
      body: null,
      emoji: null,
    };
  }

  init() {
    if (this.identity.isLocal) {
      this.makeLocalAvatar();
    }
  }

  deinit() {
    this.unsubs.forEach((f) => f());
    this.unsubs.length = 0;

    for (let key in this.entities) {
      this.entities[key]?.destroy();
      this.entities[key] = null;
    }
  }

  // Remove Avatar's distance to participant's Avatar
  get distance() {
    return this.entities.body?.get(DistanceRef)?.value;
  }

  get position(): Vector3 {
    return this.entities.body?.get(WorldTransform)?.position;
  }

  get editableName() {
    return this._editableName;
  }

  set editableName(value) {
    this._editableName = value;
    const name = this.identity.get("name");
    const color = this.identity.get("color");
    changeLabel(this.entities, name, color, this._editableName);
  }

  // This function is called regularly (each loop) and brings the ECS state
  // up to date with the Identity state, as needed.
  syncFromIdentityState() {
    this.maybeMakeRemoteAvatar();
    this.maybeSyncEntity();
  }

  makeAvatar(kinematic: boolean, callback?: (entity: Entity) => void) {
    const opts = { kinematic };
    const { avatar, head, emoji } = makeAvatar(
      this.ecsWorld,
      opts,
      this.identity.playerId
    );
    this.entities.head = head;
    this.entities.emoji = emoji;
    callback?.(avatar);
    avatar.traverse((entity) => entity.activate());

    this.entities.body = avatar;
  }

  makeLocalAvatar() {
    this.makeAvatar(false, (avatar) => {
      avatar.add(Controller).add(TwistBone, {
        boneName: "mixamorigHead",
        function: headFollowsPointer((angle) => {}),
      });
    });

    // Local participant name is hidden in build mode so the label does
    // not obstruct clicking / dragging etc.
    this.unsubs.push(
      worldUIMode.subscribe(($mode) => {
        const label = this.entities.body.get(Html2d);
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
          function: headFollowsAngle(() => 0),
        })
        .add(Distance, {
          target: playerId,
        });
    });
  }

  maybeMakeRemoteAvatar() {
    if (
      !this.entities.body &&
      !this.identity.isLocal &&
      this.identity.wasRecentlySeen() &&
      this.identity.get("status") !== "initial" &&
      this.identity.avatarStatusUpdated
    ) {
      this.makeRemoteAvatar();
      this.identity.avatarStatusUpdated = false;
    }
  }

  maybeSyncEntity() {
    if (this.entities.body && this.identity.sharedFieldsUpdated) {
      setLabel(
        this.entities,
        this.identity.get("name"),
        this.identity.get("color"),
        this._editableName
      );
      setSpeech(
        this.entities,
        this.identity.get("message"),
        this.identity.get("speaking"),
        this.identity.isLocal
      );
      setEmoji(
        this.entities,
        this.identity.get("emoji"),
        this.identity.get("emoting")
      );
      setOculus(
        this.entities,
        this.identity.playerId,
        this.identity.get("showAudio"),
        this.identity.get("showVideo")
      );
      setAppearance(this.entities, this.identity.get("appearance"));

      this.identity.sharedFieldsUpdated = false;
    }
  }

  moveTo(coords: Vector3) {
    moveAvatarTo(coords, this.entities.body);
  }

  enableCanFly(enabled = true) {
    const controller = this.entities.body.get(Controller);
    if (!controller) return;
    controller.canFly = enabled;
    controller.modified();
  }

  enablePhysics(enabled = true) {
    this.entities.body.traverse((entity) => {
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
      this.entities.body.add(Translucent, { opacity: 0.5 });
    } else {
      this.entities.body.maybeRemove(Translucent);
    }
  }

  enableNonInteractive(enabled = true) {
    if (enabled) {
      this.entities.body.add(NonInteractive);
    } else {
      this.entities.body.maybeRemove(NonInteractive);
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
