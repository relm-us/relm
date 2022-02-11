import { Quaternion, Vector3 } from "three";

import { worldManager } from "~/world";
import { System, Groups, Entity } from "~/ecs/base";
import { Presentation } from "~/ecs/plugins/core";

import { Clickable, Clicked } from "../components";
import { Transition } from "~/ecs/plugins/transition";

export class ClickableSystem extends System {
  presentation: Presentation;
  componentNames: Set<string>;
  propertyNames: Set<string>;

  order = Groups.Initialization;

  static queries = {
    clicked: [Clickable, Clicked],
  };

  init({ presentation }) {
    this.presentation = presentation;
    this.componentNames;
  }

  update() {
    this.queries.clicked.forEach((entity) => {
      this.click(entity);
    });
  }

  click(entity: Entity) {
    const clickable = entity.get(Clickable);

    switch (clickable.action) {
      case "OPEN":
        window.open(clickable.link);
        break;

      case "LINK":
        window.open(clickable.link, "_blank");
        break;

      case "CHANGES": {
        if (!clickable.changes) {
          console.log("Clickable: changes not defined", entity.id);
          break;
        }

        worldManager.api.changeVariables({ changes: clickable.changes });
        break;
      }

      case "TOGGLE": {
        const html2d = entity.getByName("Html2d");
        html2d.visible = !html2d.visible;
        html2d.modified();
        worldManager.worldDoc.syncFrom(entity);
        break;
      }

      case "FLIP": {
        const transform = entity.getByName("Transform");
        const rotation = new Quaternion();
        const direction = Math.abs(transform.rotation.w) < 0.5 ? -1 : 1;
        rotation.setFromAxisAngle(new Vector3(0, 0, direction), Math.PI);
        rotation.multiply(transform.rotation);
        transition(worldManager.worldDoc, entity, { rotation });
        break;
      }
    }
    entity.remove(Clicked);
  }
}

function transition(
  worldDoc,
  entity,
  {
    position,
    rotation,
    scale,
  }: {
    position?: Vector3;
    rotation?: Quaternion;
    scale?: Vector3;
  }
) {
  const transform = entity.getByName("Transform");
  const prePosition = transform.position;
  const preRotation = transform.rotation;
  const preScale = transform.scale;
  const target: any = {};
  if (position) {
    transform.position = position;
    target.position = position;
    target.positionSpeed = 0.1;
  }
  if (rotation) {
    transform.rotation = rotation;
    target.rotation = rotation;
    target.rotationSpeed = 0.1;
  }
  if (scale) {
    transform.scale = scale;
    target.scale = scale;
    target.scaleSpeed = 0.1;
  }
  worldDoc.syncFrom(entity);
  transform.position = prePosition;
  transform.rotation = preRotation;
  transform.scale = preScale;
  entity.add(Transition, target);
}
