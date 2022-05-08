import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer";

import { System, Groups, Not, Modified } from "~/ecs/base";
import { Object3DRef, Transform } from "~/ecs/plugins/core";
import { Queries } from "~/ecs/base/Query";

import { Renderable, RenderableRef, Document, CssPlane } from "../components";
import { getRenderableComponentByType } from "../renderables";
import { CssPresentation } from "../CssPresentation";
import { copyTransform } from "./copyTransform";

export class RenderableSystem extends System {
  cssPresentation: CssPresentation;

  // This needs to be after WorldTransformationSystem, so that the CSS
  // is updated with the latest world coords as soon as possible after
  // having computed them during WebGL render. It must be immediately
  // followed up with CssRenderSystem so that the actual render occurs.
  order = Groups.Initialization + 100;

  static queries: Queries = {
    added: [Renderable, Not(RenderableRef)],
    modified: [Modified(Renderable), RenderableRef],
    modifiedDocument: [Modified(Document), RenderableRef],
    modifiedCssPlane: [Modified(CssPlane), RenderableRef],
    active: [Renderable, RenderableRef, Object3DRef],
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

    this.queries.modifiedDocument.forEach((entity) => {
      this.modifyDocument(entity);
    });

    this.queries.modifiedCssPlane.forEach((entity) => {
      this.remove(entity);
      this.build(entity);
    });

    this.queries.active.forEach((entity) => {
      const transform: Transform = entity.get(Transform);

      const spec = entity.get(Renderable);
      const css3d = entity.get(RenderableRef)?.value;
      const cssPlane: CssPlane = entity.get(CssPlane);

      // TODO: remove deprecated spec.scale
      const scale = cssPlane.scale ?? spec.scale;

      copyTransform(css3d, transform, scale);
    });

    this.queries.removed.forEach((entity) => {
      this.remove(entity);
    });
  }

  build(entity) {
    const spec: Renderable = entity.get(Renderable);
    const transform: Transform = entity.get(Transform);
    const cssPlane: CssPlane = entity.get(CssPlane);

    if (!transform || !cssPlane) return;

    // TODO: remove deprecated spec.scale
    const scale = spec.scale;

    // TODO: remove deprecated spec.visible
    const visible = spec.visible;

    const screenSize = cssPlane.getScreenSize(scale);

    // Prepare a container for Svelte
    const containerElement = document.createElement("div");
    containerElement.style.width = screenSize.x + "px";
    containerElement.style.height = screenSize.y + "px";
    const css3d = new CSS3DObject(containerElement);

    // Create whatever Svelte component is specified by the type
    const isDocument = entity.has(Document);
    const RenderableComponent = getRenderableComponentByType(
      isDocument ? "DOCUMENT" : spec.kind
    );
    css3d.userData.renderable = new RenderableComponent({
      target: containerElement,
      props: {
        ...(isDocument ? entity.get(Document) : spec),
        width: screenSize.x,
        height: screenSize.y,
        visible,
        entity,
      },
    });

    copyTransform(css3d, transform, scale);

    this.cssPresentation.scene.add(css3d);

    entity.add(RenderableRef, { value: css3d });
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

  modifyDocument(entity) {
    const spec: Renderable = entity.get(Renderable);
    const cssPlane: CssPlane = entity.get(CssPlane);

    // TODO: remove deprecated spec.scale
    const scale = cssPlane.scale ?? spec.scale;

    // TODO: remove deprecated spec.visible
    const visible = cssPlane.visible ?? spec.visible;

    const screenSize = cssPlane.getScreenSize(scale);
    const props = {
      ...entity.get(Document),
      width: screenSize.x,
      height: screenSize.y,
      visible,
      entity,
    };
    const css3d = entity.get(RenderableRef).value;
    if (css3d) {
      const component = css3d.userData.renderable;
      component?.$set(props);
    }
  }
}
