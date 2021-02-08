import { System, Groups, Not } from "~/ecs/base";
import { Transform } from "~/ecs/plugins/core";
import { Portal } from "../components";
import { Impact, Impactable } from "~/ecs/plugins/rapier";
import { ThrustController } from "~/ecs/plugins/player-control";
import { Vector3 } from "three";
import { relmId } from "~/stores/connection";

export class PortalSystem extends System {
  order = Groups.Simulation + 1;

  static queries = {
    setup: [Portal, Not(Impactable)],
    contact: [Portal, Impact],
  };

  update() {
    this.queries.setup.forEach((entity) => {
      entity.add(Impactable);
    });

    this.queries.contact.forEach((entity) => {
      const impact = entity.get(Impact);
      const portal = entity.get(Portal);
      for (const [otherEntity, magnitude] of impact.others) {
        if (otherEntity.has(ThrustController)) {
          if (portal.kind === "LOCAL") {
            const transform = otherEntity.get(Transform);
            const delta = new Vector3()
              .copy(portal.coords)
              .sub(transform.position);
            transform.position.copy(portal.coords);

            // If otherEntity has a subgroup, move it as well
            if (otherEntity.subgroup) {
              for (const subEntity of otherEntity.subgroup) {
                const subTransform = subEntity.get(Transform);
                subTransform.position.add(delta);
              }
            }
          } else if (portal.kind === "REMOTE") {
            relmId.set(portal.relm);
          }
        }
      }
    });
  }
}
