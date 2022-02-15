import { System, Groups, Not, Modified } from "~/ecs/base";
import { WorldTransform } from "~/ecs/plugins/core";
import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer";

import { isBrowser } from "~/utils/isBrowser";

import { Renderable, RenderableRef, CssPlane } from "../components";

import { getRenderableComponentByType } from "../renderables";
import { Queries } from "~/ecs/base/Query";
import { CssPresentation } from "../CssPresentation";

export class RenderableSystem extends System {
  cssPresentation: CssPresentation;

  active = isBrowser();
  // This needs to be after WorldTransformationSystem, so that the CSS
  // is updated with the latest world coords as soon as possible after
  // having computed them during WebGL render. It must be immediately
  // followed up with CssRenderSystem so that the actual render occurs.
  order = Groups.Presentation + 300;

  static queries: Queries = {
    added: [Renderable, Not(RenderableRef)],
    modified: [Modified(Renderable), RenderableRef],
    modifiedCssPlane: [Modified(CssPlane), RenderableRef],
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

    this.queries.modifiedCssPlane.forEach((entity) => {
      this.remove(entity);
      this.build(entity);
    });

    this.queries.active.forEach((entity) => {
      const transform = entity.get(WorldTransform);
      if (!transform) return;

      const spec = entity.get(Renderable);
      const ref = entity.get(RenderableRef);

      this.copyTransform(ref.value, transform, spec.scale);
    });

    this.queries.removed.forEach((entity) => {
      this.remove(entity);
    });
  }

  build(entity) {
    const spec = entity.get(Renderable);
    const transform = entity.get(WorldTransform);
    const cssPlane = entity.get(CssPlane);

    if (!transform || !cssPlane) return;

    const screenSize = cssPlane.getScreenSize(spec.scale);

    // Prepare a container for Svelte
    const containerElement = document.createElement("div");
    containerElement.style.width = screenSize.x + "px";
    containerElement.style.height = screenSize.y + "px";
    const object = new CSS3DObject(containerElement);

    // Create whatever Svelte component is specified by the type
    const RenderableComponent = getRenderableComponentByType(spec.kind);
    object.userData.renderable = new RenderableComponent({
      target: containerElement,
      props: { ...spec, width: screenSize.x, height: screenSize.y, entity },
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
    if (!object) {
      console.warn(`Can't copyTransform, object is null`, object);
      return;
    }
    object.position
      .copy(transform.position)
      .multiplyScalar(this.cssPresentation.FACTOR);
    object.quaternion.copy(transform.rotation);
    object.scale
      .copy(transform.scale)
      .multiplyScalar(this.cssPresentation.FACTOR * scale);
  }
}
