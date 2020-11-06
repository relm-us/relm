import { System, Groups, Not } from "hecs";
import { Transform } from "hecs-plugin-core";
import {
  CSS3DObject,
  CSS3DSprite,
} from "three/examples/jsm/renderers/CSS3DRenderer";

import { IS_BROWSER } from "../utils";

import { HtmlNode } from "../components/HtmlNode";
import { HtmlInScene } from "../components/HtmlInScene";

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
      const spec = entity.get(HtmlNode);
      const transform = entity.get(Transform);
      if (!transform) return;
      // console.log("added HtmlNode; transform:", transform);
      const object = spec.billboard
        ? new CSS3DSprite(spec.node)
        : new CSS3DObject(spec.node);

      object.position.copy(transform.position);
      object.quaternion.copy(transform.rotation);
      object.scale.copy(transform.scale);
      object.scale.multiplyScalar(spec.scale);

      // console.log(
      //   `[HtmlNodeSystem] update added (${entity.name})`,
      //   object.position,
      //   object.quaternion
      // );

      this.presentation.scene.add(object);
      spec.object = object;

      entity.add(HtmlInScene);
    });

    this.queries.active.forEach((entity) => {
      const spec = entity.get(HtmlNode);
      const transform = entity.get(Transform);
      if (!transform) return;
      // console.log("active HtmlNode; transform:", transform);
      spec.object.position.copy(transform.position);
      spec.object.quaternion.copy(transform.rotation);
      spec.object.scale.copy(transform.scale);
      spec.object.scale.multiplyScalar(spec.scale);

      // console.log(
      //   `[HtmlNodeSystem] update active (${entity.name})`,
      //   spec.object.position,
      //   spec.object.quaternion
      // );
    });
  }
}
