import { System, Groups, Entity, Not } from "~/ecs/base";
import { Presentation, Transform } from "~/ecs/plugins/core";
import { Portal } from "../components";
import { Impact, Impactable } from "~/ecs/plugins/physics";
import { Controller } from "~/ecs/plugins/player-control";
import { Vector3 } from "three";
import { moveAvatarTo } from "~/identity/Avatar";

const bodyFacing = new Vector3();
const vOut = new Vector3(0, 0, 1);
export class PortalSystem extends System {
  presentation: Presentation;

  order = Groups.Simulation - 1;

  static queries = {
    setup: [Portal, Not(Impactable)],
    contact: [Portal, Impact],
  };

  init({ presentation }) {
    this.presentation = presentation;
  }

  update() {
    this.queries.setup.forEach((entity) => {
      entity.add(Impactable);
    });

    this.queries.contact.forEach((entity) => {
      const portal = entity.get(Portal);
      const others: Map<Entity, number> = entity.get(Impact).others;
      for (const [otherEntity, magnitude] of others) {
        if (otherEntity.has(Controller)) {
          if (portal.kind === "LOCAL") {
            const transform = otherEntity.get(Transform);
            const newCoords = new Vector3().copy(portal.coords);

            // Make participant show up on the "other side" of the
            // portal destination, depending on movement direction.
            bodyFacing
              .copy(vOut)
              .applyQuaternion(transform.rotation)
              .normalize();
            newCoords.add(bodyFacing);

            moveAvatarTo(newCoords, otherEntity);
          } else if (portal.kind === "REMOTE") {
            // TODO
          }
        }
      }
    });
  }
}
