import { System, Groups, Entity, Not } from "~/ecs/base";
import { Presentation, Transform } from "~/ecs/plugins/core";
import { Impact, Impactable } from "~/ecs/plugins/physics";
import { Controller } from "~/ecs/plugins/player-control";
import { ParticlesActive } from "~/ecs/plugins/particles";
import { Collider3 } from "~/ecs/plugins/collider";
import { Animation } from "~/ecs/plugins/animation";

import { worldManager } from "~/world";

import { Portal, PortalActive } from "../components";
import { inFrontOf } from "~/utils/inFrontOf";

const portalsDisabled = (localStorage.getItem("debug") || "")
  .split(":")
  .includes("noportal");

export class PortalSystem extends System {
  presentation: Presentation;

  order = Groups.Presentation + 400;

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

    this.queries.contact.forEach((entity: Entity) => {
      const otherEntity: Entity = entity.get(Impact).other;

      // Portals only affect participants (i.e. entities with Controller)
      if (!otherEntity.has(Controller)) return;

      // Make avatar light up
      otherEntity.add(ParticlesActive);

      const transform = otherEntity.get(Transform);
      const portal: Portal = entity.get(Portal);

      if (portal.kind === "LOCAL") {
        const active = entity.add(
          PortalActive,
          {
            destination: {
              type: "LOCAL",
              // Make participant show up on the "other side" of the
              // portal destination, depending on movement direction.
              coords: inFrontOf(portal.coords, transform.rotation),
            },
            countdown: 2000,
            animatedEntity: otherEntity,
          },
          true
        );

        // Make participant's avatar slow down
        this.saveAttrs(active, otherEntity);
        this.setAttrs(otherEntity, {
          density: 10,
          timeScale: 0.1,
          transition: 0,
        });
      } else if (portal.kind === "REMOTE") {
        entity.add(PortalActive, {
          destination: {
            type: "REMOTE",
            relm: portal.relm,
            entryway: portal.entry || "default",
          },
          countdown: 2000,
          animatedEntity: otherEntity,
        });
      }
    });

    this.queries.active.forEach((entity) => {
      const active: PortalActive = entity.get(PortalActive);

      active.countdown -= 1 / delta;

      if (active.countdown <= 0 && !active.triggered) {
        active.triggered = true;

        if (active.destination.type === "LOCAL") {
          this.restoreAttrs(active);
          worldManager.moveTo(active.destination.coords, false);
        } else if (active.destination.type === "REMOTE") {
          worldManager.dispatch({
            id: "enterPortal",
            relmName: active.destination.relm,
            entryway: active.destination.entryway,
          });
        }

        // Animation complete
        active.animatedEntity.maybeRemove(ParticlesActive);
      } else if (active.countdown <= -500 && active.triggered) {
        entity.remove(PortalActive);
      }
    });
  }

  saveAttrs(active: PortalActive, otherEntity: Entity) {
    const ref: Collider3 = otherEntity.get(Collider3);
    active.restoreAttrs.density = ref.density;

    const anim: Animation = otherEntity.get(Animation);
    active.restoreAttrs.timeScale = anim.timeScale;
    active.restoreAttrs.transition = anim.transition;
  }

  restoreAttrs(active: PortalActive) {
    this.setAttrs(active.animatedEntity, active.restoreAttrs);
  }

  setAttrs(otherEntity: Entity, { density, timeScale, transition }) {
    const ref: Collider3 = otherEntity.get(Collider3);
    ref.density = density;
    ref.modified();

    const anim: Animation = otherEntity.get(Animation);
    anim.timeScale = timeScale;
    anim.transition = transition;
    anim.modified();
  }
}
