import { worldManager } from "~/world";
import { System, Groups, Entity } from "~/ecs/base";
import { Presentation } from "~/ecs/plugins/core";

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

      case "TOGGLE":
        {
          const html2d = entity.getByName("Html2d");
          html2d.visible = !html2d.visible;
          html2d.modified();
          worldManager.worldDoc.syncFrom(entity);
        }

        break;
    }
    entity.remove(Clicked);
  }
}
