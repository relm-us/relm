import { System, Groups, Not } from "hecs";
import { Transform } from "hecs-plugin-core";
import { LocalPortal } from "../components";
import { Impact, Impactable } from "~/ecs/plugins/rapier";
import { ThrustController } from "~/ecs/plugins/player-control";
import { Vector3 } from "three";

export class PortalSystem extends System {
  order = Groups.Simulation + 1;

  static queries = {
    impactable: [LocalPortal, Not(Impactable)],
    contact: [LocalPortal, Impact],
  };

  update() {
    this.queries.impactable.forEach((entity) => {
      entity.add(Impactable);
    });

    this.queries.contact.forEach((entity) => {
      const impact = entity.get(Impact);
      const portal = entity.get(LocalPortal);
      for (const [otherEntity, magnitude] of impact.others) {
        if (otherEntity.has(ThrustController)) {
          const transform = otherEntity.get(Transform);
          const delta = new Vector3()
            .copy(portal.destination)
            .sub(transform.position);
          transform.position.copy(portal.destination);

          // If otherEntity has a subgroup, move it as well
          if (otherEntity.subgroup) {
            for (const subEntity of otherEntity.subgroup) {
              const subTransform = subEntity.get(Transform);
              subTransform.position.add(delta);
            }
          }
        }
      }
    });
  }
}
