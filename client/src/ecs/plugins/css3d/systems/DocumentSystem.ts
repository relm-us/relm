import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer";

import { System, Groups, Not, Modified } from "~/ecs/base";
import { Object3DRef, Transform } from "~/ecs/plugins/core";
import { Queries } from "~/ecs/base/Query";

import { Document, DocumentRef, CssPlane } from "../components";
import DocumentComponent from "../renderables/Document.svelte";

import { CssPresentation } from "../CssPresentation";
import { copyTransform } from "./copyTransform";

export class DocumentSystem extends System {
  cssPresentation: CssPresentation;

  // This needs to be after WorldTransformationSystem, so that the CSS
  // is updated with the latest world coords as soon as possible after
  // having computed them during WebGL render. It must be immediately
  // followed up with CssRenderSystem so that the actual render occurs.
  order = Groups.Initialization + 100;

  static queries: Queries = {
    added: [Document, Not(DocumentRef)],
    modified: [Modified(Document), DocumentRef],
    modifiedCssPlane: [Modified(CssPlane), DocumentRef],
    active: [Document, DocumentRef, Object3DRef],
    removed: [Not(Document), DocumentRef],
  };

  init({ cssPresentation }) {
    this.cssPresentation = cssPresentation;
  }

  update() {
    this.queries.added.forEach((entity) => {
      this.build(entity);
    });

    this.queries.modified.forEach((entity) => {
      this.modify(entity);
    });

    this.queries.modifiedCssPlane.forEach((entity) => {
      this.remove(entity);
      this.build(entity);
    });

    this.queries.active.forEach((entity) => {
      const transform: Transform = entity.get(Transform);

      const css3d = entity.get(DocumentRef)?.value;
      const cssPlane: CssPlane = entity.get(CssPlane);

      copyTransform(css3d, transform, cssPlane.getFracScale());
    });

    this.queries.removed.forEach((entity) => {
      this.remove(entity);
    });
  }

  build(entity) {
    const spec: Document = entity.get(Document);
    const transform: Transform = entity.get(Transform);
    const cssPlane: CssPlane = entity.get(CssPlane);

    if (!transform || !cssPlane) return;

    // Prepare a container for Svelte
    const containerElement = cssPlane.createComponentContainer();
    const css3d = new CSS3DObject(containerElement);

    // Create whatever Svelte component is specified by the type
    css3d.userData.renderable = new DocumentComponent({
      target: containerElement,
      props: { ...spec, visible: cssPlane.visible },
    });

    copyTransform(css3d, transform, cssPlane.getFracScale());

    this.cssPresentation.scene.add(css3d);

    entity.add(DocumentRef, { value: css3d });
  }

  remove(entity) {
    const ref = entity.get(DocumentRef);
    if (ref && ref.value) {
      // Remove CSS3DObject from scene, which will emit 'removed' event
      // and also remove HTML node from DOM.
      ref.value.parent.remove(ref.value);
    }

    entity.remove(DocumentRef);
  }

  modify(entity) {
    const spec: Document = entity.get(Document);
    const cssPlane: CssPlane = entity.get(CssPlane);

    const css3d = entity.get(DocumentRef).value;
    if (css3d) {
      const component = css3d.userData.renderable;
      component?.$set({ ...spec, visible: cssPlane.visible });
    }
  }
}
