import { Vector3 } from "three";

import { System, Groups, Entity, Not } from "~/ecs/base";
import { Presentation, Transform } from "~/ecs/plugins/core";
import { Impact, Impactable } from "~/ecs/plugins/physics";
import { Controller } from "~/ecs/plugins/player-control";
import { Particles } from "~/ecs/plugins/particles";

import { worldManager } from "~/world";

import { Portal } from "../components";

const portalsDisabled = (localStorage.getItem("debug") || "")
  .split(":")
  .includes("noportal");

const bodyFacing = new Vector3();
const vOut = new Vector3(0, 0, 1);
export class PortalSystem extends System {
  presentation: Presentation;

  order = Groups.Simulation + 1;

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

    if (portalsDisabled) return;

    this.queries.contact.forEach((entity) => {
      const portal = entity.get(Portal);
      const otherEntity: Entity = entity.get(Impact).other;
      if (otherEntity.has(Controller)) {
        console.log("portal triggered", portal);
        if (portal.kind === "LOCAL") {
          const transform = otherEntity.get(Transform);
          const newCoords = new Vector3().copy(portal.coords);

          // Make participant show up on the "other side" of the
          // portal destination, depending on movement direction.
          bodyFacing.copy(vOut).applyQuaternion(transform.rotation).normalize();
          newCoords.add(bodyFacing);

          const sparklesEntrance = this.world.entities
            .create("Portal Sparkle")
            .add(Transform, {
              position: new Vector3()
                .copy(transform.position)
                .add(new Vector3(0, 1.5, 0)),
            })
            .add(Particles, { prefab: "TELEPORT" })
            .activate();

          setTimeout(() => {
            worldManager.moveTo(newCoords, false);
            sparklesEntrance.destroy();

            const sparklesExit = this.world.entities
              .create("Portal Sparkle")
              .add(Transform, {
                position: new Vector3()
                  .copy(newCoords)
                  .add(new Vector3(0, 1.5, 0)),
              })
              .add(Particles, { prefab: "TELEPORT" })
              .activate();

            setTimeout(() => {
              sparklesExit.destroy();
            }, 1000);
          }, 1000);
        } else if (portal.kind === "REMOTE") {
          worldManager.dispatch({
            id: "enterPortal",
            relmName: portal.relm,
            entryway: portal.entryway,
          });
        }
      }
    });
  }
}
