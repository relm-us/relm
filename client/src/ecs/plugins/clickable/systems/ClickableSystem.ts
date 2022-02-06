import { worldManager } from "~/world";
import { System, Groups, Entity } from "~/ecs/base";
import { Presentation, Transform } from "~/ecs/plugins/core";
import { Transition } from "~/ecs/plugins/transition";

import { Clickable, Clicked } from "../components";
import { Quaternion, Vector3 } from "three";

export type TargetAction = [
  string /* component name */,
  string /* property name */,
  any /* new value */
];

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
    this.propertyNames = new Set([
      "draggable",
      "visible",
      "editable",
      "alwaysOn",
    ]);
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

      case "CYCLE": {
        if (!clickable.cycle) {
          console.log("Clickable: cycle not defined", entity.id);
          break;
        }
        // [
        //   (cycle 0) [["Html2d", "visible", true], ["Html2d", "visible", true, "entity2"]]
        //   (cycle 1) [["Html2d", "visible", false], ["Html2d", "visible", false, "entity2"]]
        // ]
        const entitiesChanged = new Set([entity]);
        const index = Math.floor(clickable.idx ?? 0);
        const cycleStates = clickable.cycle?.states[index];
        if (!cycleStates) {
          console.log("Clickable: no states", index, entity.id);
          break;
        }
        for (let action of cycleStates) {
          let target: Entity;
          if (action[3]) {
            target = this.presentation.world.entities.getById(action[3]);
          } else {
            // default to self
            target = entity;
          }

          if (target) {
            if (action[0] && action[1]) {
              const state: TargetAction = [action[0], action[1], action[2]];
              entitiesChanged.add(target);
              this.setState(target, state);
            } else {
              console.log(
                "Clickable: cycle has no component/property",
                index,
                entity.id
              );
            }
          }
        }

        clickable.idx =
          Math.floor(clickable.idx + 1) % clickable.cycle.states.length;

        // On next tick, update yjs so all can see state change
        setTimeout(() => {
          entitiesChanged.forEach((entity) => {
            const transform = entity.get(Transform);
            const transition = entity.get(Transition);
            let p, r, s;
            if (transition) {
              /**
               * If we have started a local Transition, the entity's Transform will not
               * contain the correct position/rotation/scale to broadcast to everyone else.
               * So, we temporarily set the transform to the Transition's target, then
               * restore it after syncFrom.
               * 
               * On the other side, the Transform will be intercepted, and converted to a
               * Transition.
               */
              p = new Vector3().copy(transform.position);
              r = new Quaternion().copy(transform.rotation);
              s = new Vector3().copy(transform.scale);
              if (transition.positionSpeed > 0)
                transform.position.copy(transition.position);
              if (transition.rotationSpeed > 0)
                transform.rotation.copy(transition.rotation);
              if (transition.scaleSpeed > 0)
                transform.scale.copy(transition.scale);
            }
            worldManager.worldDoc.syncFrom(entity);
            if (transition) {
              transform.position.copy(p);
              transform.rotation.copy(r);
              transform.scale.copy(s);
            }
          });
        }, 0);
        break;
      }

      case "TOGGLE":
        {
          const html2d = entity.getByName("Html2d");
          html2d.visible = !html2d.visible;
          html2d.modified();
        }

        break;
    }
    entity.remove(Clicked);
  }

  setState(entity: Entity, state: TargetAction) {
    let [componentName, propertyName, newValue] = state;

    let component;
    if (componentName === "Transform") {
      componentName = "Transition";

      if (!entity.has(Transition)) {
        entity.add(Transition);
      }
      component = entity.get(Transition);

      if (propertyName === "position") component.positionSpeed = 0.1;
      if (propertyName === "rotation") component.rotationSpeed = 0.1;
      if (propertyName === "scale") component.scaleSpeed = 0.1;
    } else {
      component = entity.getByName(componentName);
    }

    const componentType =
      this.presentation.world.components.componentsByName[componentName];

    if (component && componentType) {
      const propertyType = componentType.props[propertyName];
      component[propertyName] = propertyType.type.fromJSON(
        newValue,
        component[propertyName]
      );
      component.modified();
    } else {
      console.log(
        "Clickable: entity does not have component",
        state[0],
        entity.id
      );
    }
  }
}
