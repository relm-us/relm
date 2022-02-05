import { worldManager } from "~/world";
import { System, Groups, Entity } from "~/ecs/base";
import { Presentation } from "~/ecs/plugins/core";

import { Clickable, Clicked } from "../components";

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
            worldManager.worldDoc.syncFrom(entity);
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
    const [componentName, propertyName, newValue] = state;

    const componentType =
      this.presentation.world.components.componentsByName[componentName];

    const component = entity.getByName(componentName);
    if (component && componentType) {
      const propertyType = componentType.props[propertyName];
      component[propertyName] = propertyType.type.fromJSON(newValue);
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
