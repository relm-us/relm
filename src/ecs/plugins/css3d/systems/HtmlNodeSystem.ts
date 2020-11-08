import { System, Groups, Not } from "hecs";
import { Transform } from "hecs-plugin-core";
import {
  CSS3DObject,
  CSS3DSprite,
} from "three/examples/jsm/renderers/CSS3DRenderer";

import { IS_BROWSER } from "../utils";

import { HtmlNode } from "../components/HtmlNode";
import { HtmlInScene } from "../components/HtmlInScene";

import { getRenderableComponentByType } from "../renderables";

export class HtmlNodeSystem extends System {
  active = IS_BROWSER;
  // order = Groups.Simulation + 100;
  order = Groups.Initialization + 10;

  static queries = {
    added: [HtmlNode, Not(HtmlInScene)],
    active: [HtmlNode, HtmlInScene],
  };

  init({ presentation, cssPresentation }) {
    if (!cssPresentation) {
      throw new Error("HtmlNodeSystem requires CssPresentation");
    }
    if (!presentation) {
      throw new Error("HtmlNodeSystem requires hecs-plugin-three");
    }
    this.presentation = presentation;
    this.cssPresentation = cssPresentation;
  }

  update() {
    this.queries.added.forEach((entity) => {
      const html = entity.get(HtmlNode);
      const transform = entity.get(Transform);

      if (!transform) return;

      const createObject = (node) => {
        return html.billboard ? new CSS3DSprite(node) : new CSS3DObject(node);
      };

      let object;
      if (html.node) {
        // If it's just a regular HTMLElement, create a corresponding CSS3DObject for it
        object = createObject(html.node);
      } else if (html.specification) {
        const spec = html.specification;

        // Prepare a container for Svelte
        const containerElement = document.createElement("div");
        containerElement.style.width = spec.props.width + "px";
        containerElement.style.height = spec.props.height + "px";
        object = createObject(containerElement);

        // Create whatever Svelte component is specified by the type
        const RenderableComponent = getRenderableComponentByType(spec.type);
        object.userData.renderable = new RenderableComponent({
          target: containerElement,
          props: spec.props,
        });
      }

      object.position.copy(transform.position);
      object.quaternion.copy(transform.rotation);
      object.scale.copy(transform.scale);
      object.scale.multiplyScalar(html.scale);

      this.presentation.scene.add(object);
      html.object = object;

      entity.add(HtmlInScene);
    });

    this.queries.active.forEach((entity) => {
      const spec = entity.get(HtmlNode);
      const transform = entity.get(Transform);
      if (!transform) return;

      spec.object.position.copy(transform.position);
      spec.object.quaternion.copy(transform.rotation);
      spec.object.scale.copy(transform.scale);
      spec.object.scale.multiplyScalar(spec.scale);
    });
  }
}
