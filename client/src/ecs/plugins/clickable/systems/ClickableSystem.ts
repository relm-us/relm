import { get } from "svelte/store";

import { System, Groups, Entity } from "~/ecs/base";
import { Presentation } from "~/ecs/plugins/core";

import { Relm } from "~/stores/Relm";

import { Clickable, Clicked } from "../components";

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
      case "LINK":
        window.open(clickable.link, "_blank");
        break;

      case "TOGGLE":
        const world = this.presentation.world;
        const entities = clickable.toggle.entities || [entity.id];
        const componentName = clickable.toggle.component || "Html2d";
        const propertyName = clickable.toggle.property || "visible";
        entities.forEach((entityId) => {
          const entity = world.entities.getById(entityId);
          if (entity) {
            const component = this.getComponentFromEntity(
              entity,
              componentName
            );
            if (component && this.propertyNames.has(propertyName)) {
              component[propertyName] = !component[propertyName];
              component.modified();

              // On next tick, update yjs so all can see state change
              setTimeout(() => {
                get(Relm).wdoc.syncFrom(entity);
              }, 0);
            }
          }
        });
        break;
    }
    entity.remove(Clicked);
  }

  getComponentNames() {
    const components = Object.values(
      this.presentation.world.components.componentsByName
    );
    return components.map((c) => (c as any).editor?.label || c.name);
  }

  // We could just use entity.getByName, but this is safer because
  // we filter first on known component names
  getComponentFromEntity(entity, componentName) {
    if (!this.componentNames) {
      this.componentNames = new Set(this.getComponentNames());
    }
    if (this.componentNames.has(componentName)) {
      return entity.getByName(componentName);
    }
  }
}
