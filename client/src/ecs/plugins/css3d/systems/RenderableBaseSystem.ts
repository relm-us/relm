import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer";

import { System, Groups } from "~/ecs/base";
import { Transform } from "~/ecs/plugins/core";

import { CssPlane } from "../components";
import { CssPresentation } from "../CssPresentation";
import { copyTransform } from "./copyTransform";

export class RenderableBaseSystem extends System {
  cssPresentation: CssPresentation;
  RenderableComponent: any;
  EcsComponent: any;
  EcsComponentRef: any;

  // This needs to be after WorldTransformationSystem, so that the CSS
  // is updated with the latest world coords as soon as possible after
  // having computed them during WebGL render. It must be immediately
  // followed up with CssRenderSystem so that the actual render occurs.
  order = Groups.Initialization + 100;

  init({ cssPresentation }) {
    this.cssPresentation = cssPresentation;
  }

  buildCssPlane(entity) {
    const plane = new CssPlane(this.world);
    entity.add(plane);
  }

  build(entity) {
    if (!entity.has(CssPlane)) this.buildCssPlane(entity);

    const spec: any = entity.get(this.EcsComponent);
    const transform: Transform = entity.get(Transform);
    const cssPlane: CssPlane = entity.get(CssPlane);

    // Prepare a container for Svelte
    const containerElement = cssPlane.createComponentContainer();
    const css3d = new CSS3DObject(containerElement);

    // Create whatever Svelte component is specified by the type
    css3d.userData.renderable = new this.RenderableComponent({
      target: containerElement,
      props: this.getProps(entity),
    });

    copyTransform(css3d, transform, cssPlane.getFracScale(), cssPlane.offset);

    this.cssPresentation.scene.add(css3d);

    entity.add(this.EcsComponentRef, { value: css3d });
  }

  modify(entity) {
    const spec: any = entity.get(this.EcsComponent);
    const cssPlane: CssPlane = entity.get(CssPlane);

    const css3d = entity.get(this.EcsComponentRef).value;
    if (css3d) {
      const component = css3d.userData.renderable;
      component?.$set(this.getProps(entity));
    }
  }

  transform(entity) {
    const tf: Transform = entity.get(Transform);

    const css3d = entity.get(this.EcsComponentRef)?.value;
    const cssPlane: CssPlane = entity.get(CssPlane);

    copyTransform(css3d, tf, cssPlane.getFracScale(), cssPlane.offset);
  }

  rebuild(entity) {
    this.remove(entity);
    this.build(entity);
  }

  remove(entity) {
    const ref = entity.get(this.EcsComponentRef);
    if (ref && ref.value) {
      // Remove CSS3DObject from scene, which will emit 'removed' event
      // and also remove HTML node from DOM.
      ref.value.parent.remove(ref.value);
    }

    entity.remove(this.EcsComponentRef);
  }

  getProps(entity) {
    const spec: any = entity.get(this.EcsComponent);
    const cssPlane: CssPlane = entity.get(CssPlane);
    const size = cssPlane.getScreenSize();
    return { ...spec, size, visible: cssPlane.visible };
  }
}
