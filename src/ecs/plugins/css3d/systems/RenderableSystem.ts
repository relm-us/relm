import { System, Groups, Not, Modified } from "hecs";
import { WorldTransform } from "hecs-plugin-core";
import {
  CSS3DObject,
  CSS3DSprite,
} from "three/examples/jsm/renderers/CSS3DRenderer";

import { isBrowser } from "~/utils/isBrowser";

import { Renderable, RenderableRef } from "../components";

import { getRenderableComponentByType } from "../renderables";

export class RenderableSystem extends System {
  active = isBrowser();
  // order = Groups.Simulation + 100;
  order = Groups.Simulation - 5;

  static queries = {
    added: [Renderable, Not(RenderableRef)],
    modified: [Modified(Renderable), RenderableRef],
    active: [Renderable, RenderableRef],
    removed: [Not(Renderable), RenderableRef],
  };

  init({ cssPresentation }) {
    if (!cssPresentation) {
      throw new Error("RenderableSystem requires CssPresentation");
    }
    this.cssPresentation = cssPresentation;
  }

  update() {
    this.queries.added.forEach((entity) => {
      this.build(entity);
    });

    this.queries.modified.forEach((entity) => {
      this.remove(entity);
      this.build(entity);
    });

    this.queries.active.forEach((entity) => {
      const spec = entity.get(Renderable);
      const ref = entity.get(RenderableRef);
      const transform = entity.get(WorldTransform);
      if (!transform) return;

      this.copyTransform(ref.value, transform, spec.scale);
    });

    this.queries.removed.forEach((entity) => {
      this.remove(entity);
    });
  }

  build(entity) {
    const spec = entity.get(Renderable);
    const transform = entity.get(WorldTransform);

    if (!transform) return;

    let object;

    // Prepare a container for Svelte
    const containerElement = document.createElement("div");
    containerElement.style.width = spec.width + "px";
    containerElement.style.height = spec.height + "px";
    object = new CSS3DObject(containerElement);

    // Create whatever Svelte component is specified by the type
    const RenderableComponent = getRenderableComponentByType(spec.kind);
    object.userData.renderable = new RenderableComponent({
      target: containerElement,
      props: {
        width: spec.width,
        height: spec.height,
        embedId: spec.embedId,
        url: spec.url,
      },
    });

    this.copyTransform(object, transform, spec.scale);

    this.cssPresentation.scene.add(object);

    entity.add(RenderableRef, { value: object });
  }

  remove(entity) {
    const ref = entity.get(RenderableRef);
    if (ref && ref.value) {
      // Remove CSS3DObject from scene, which will emit 'removed' event
      // and also remove HTML node from DOM.
      ref.value.parent.remove(ref.value);
    }

    entity.remove(RenderableRef);
  }

  copyTransform(object, transform, scale) {
    object.position
      .copy(transform.position)
      .multiplyScalar(this.cssPresentation.FACTOR);
    object.quaternion.copy(transform.rotation);
    object.scale
      .copy(transform.scale)
      .multiplyScalar(this.cssPresentation.FACTOR * scale);
  }
}
