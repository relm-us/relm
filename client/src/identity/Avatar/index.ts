import { Vector3 } from "three";
import { DecoratedECSWorld } from "~/types/DecoratedECSWorld";

import {
  AVATAR_BUILDER_INTERACTION,
  AVATAR_INTERACTION,
} from "~/config/colliderInteractions";
import { AvatarEntities } from "~/types";

import { Transform } from "~/ecs/plugins/core";
import { Controller } from "~/ecs/plugins/player-control";
import { Collider2 } from "~/ecs/plugins/physics";
import { Translucent } from "~/ecs/plugins/translucent";
import { NonInteractive } from "~/ecs/plugins/non-interactive";
import { InteractorSystem } from "~/ecs/plugins/interactor";

export { setAppearance } from "./appearance";
export { setEmoji } from "./emoji";
export { setOculus } from "./oculus";
export { setSpeech } from "./speech";

export { setAvatarFromParticipant } from "./setAvatarFromParticipant";

export class Avatar {
  ecsWorld: DecoratedECSWorld;

  entities: AvatarEntities;

  headAngle: number;

  constructor(ecsWorld: DecoratedECSWorld, entities: AvatarEntities) {
    this.ecsWorld = ecsWorld;
    this.entities = entities;
  }

  get transform(): Transform {
    return this.entities.body.get(Transform);
  }

  get position(): Vector3 {
    return this.transform.position;
  }

  set position(newCoords: Vector3) {
    const entity = this.entities.body;

    const transform = entity.get(Transform);
    // How much to move Avatar by to arrive at newCoords
    const delta = new Vector3().copy(newCoords).sub(transform.position);

    // Move the participant
    entity.traverse(
      (e) => {
        // Update ECS Transform object
        const transform = e.get(Transform);
        transform.position.add(delta);
        transform.modified();
      },
      false,
      true
    );
  }

  enableCanFly(enabled = true) {
    const controller = this.entities.body.get(Controller);
    if (!controller) return;
    controller.canFly = enabled;
    controller.modified();
  }

  enablePhysics(enabled = true) {
    this.entities.body.traverse((entity) => {
      const collider: Collider2 = entity.get(Collider2);
      if (!collider) return;

      collider.kind = enabled ? "AVATAR-PLAY" : "AVATAR-BUILD";

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

  enableInteractor(enabled = true) {
    const system = this.ecsWorld.systems.get(
      InteractorSystem
    ) as InteractorSystem;
    system.active = enabled;
    if (!enabled) {
      system.deselect();
    }
  }
}
