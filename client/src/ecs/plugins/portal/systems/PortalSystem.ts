import { Vector3 } from "three";

import { System, Groups, Entity, Not } from "~/ecs/base";
import { Presentation, Transform } from "~/ecs/plugins/core";
import { Impact, Impactable } from "~/ecs/plugins/physics";
import { Controller } from "~/ecs/plugins/player-control";

import { worldManager } from "~/world";

import { Portal, PortalActive } from "../components";
import { inFrontOf } from "~/utils/inFrontOf";
import { Particles } from "../../particles";

const portalsDisabled = (localStorage.getItem("debug") || "")
  .split(":")
  .includes("noportal");

export class PortalSystem extends System {
  presentation: Presentation;

  order = Groups.Simulation + 1;

  static queries = {
    setup: [Portal, Not(Impactable)],
    active: [Portal, PortalActive],
    contact: [Portal, Not(PortalActive), Impact],
  };

  init({ presentation }) {
    this.presentation = presentation;
  }

  update(delta: number) {
    this.queries.setup.forEach((entity) => {
      entity.add(Impactable);
    });

    if (portalsDisabled) return;

    this.queries.contact.forEach((entity) => {
      const otherEntity: Entity = entity.get(Impact).other;

      // Portals only affect participants (i.e. entities with Controller)
      if (!otherEntity.has(Controller)) return;

      // Make avatar light up
      otherEntity.get(Particles).enabled = true;

      const transform = otherEntity.get(Transform);
      const portal: Portal = entity.get(Portal);

      if (portal.kind === "LOCAL") {
        entity.add(PortalActive, {
          destination: {
            type: "LOCAL",
            // Make participant show up on the "other side" of the
            // portal destination, depending on movement direction.
            coords: inFrontOf(portal.coords, transform.rotation),
          },
          countdown: 2000,
        });
      } else if (portal.kind === "REMOTE") {
        entity.add(PortalActive, {
          destination: {
            type: "REMOTE",
            relm: portal.relm,
            entryway: portal.entry || "default",
          },
          countdown: 2000,
        });
      }
    });

    this.queries.active.forEach((entity) => {
      const active: PortalActive = entity.get(PortalActive);

      if (active.countdown > 0) {
        active.countdown -= 1 / delta;
      } else {
        if (active.destination.type === "LOCAL") {
          worldManager.moveTo(active.destination.coords, false);
        } else if (active.destination.type === "REMOTE") {
          worldManager.dispatch({
            id: "enterPortal",
            relmName: active.destination.relm,
            entryway: active.destination.entryway,
          });
        }

        // Animation complete
        active.sparkles.destroy();
        entity.remove(PortalActive);
      }
    });
  }
}
