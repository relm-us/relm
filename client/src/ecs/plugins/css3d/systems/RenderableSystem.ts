import * as THREE from "three";

import { System, Groups, Not, Modified } from "~/ecs/base";
import { Object3D } from "~/ecs/plugins/core";
import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer";

import { isBrowser } from "~/utils/isBrowser";

import { Renderable, RenderableRef, CssPlane } from "../components";

import { getRenderableComponentByType } from "../renderables";
import { Queries } from "~/ecs/base/Query";
import { CssPresentation } from "../CssPresentation";

const _v1 = new THREE.Vector3();
const _q1 = new THREE.Quaternion();

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
    active: [Renderable, RenderableRef, Object3D],
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
      const object3d = entity.get(Object3D).value;

      const spec = entity.get(Renderable);
      const css3d = entity.get(RenderableRef)?.value;

      this.copyTransform(css3d, object3d, spec.scale);
    });

    this.queries.removed.forEach((entity) => {
      this.remove(entity);
    });
  }

  build(entity) {
    const spec = entity.get(Renderable);
    const object3d = entity.get(Object3D);
    const cssPlane = entity.get(CssPlane);

    if (!object3d || !cssPlane) return;

    const screenSize = cssPlane.getScreenSize(spec.scale);

    // Prepare a container for Svelte
    const containerElement = document.createElement("div");
    containerElement.style.width = screenSize.x + "px";
    containerElement.style.height = screenSize.y + "px";
    const css3d = new CSS3DObject(containerElement);

    // Create whatever Svelte component is specified by the type
    const RenderableComponent = getRenderableComponentByType(spec.kind);
    css3d.userData.renderable = new RenderableComponent({
      target: containerElement,
      props: { ...spec, width: screenSize.x, height: screenSize.y, entity },
    });

    this.copyTransform(css3d, object3d.value, spec.scale);

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

  copyTransform(css3d, object3d: THREE.Object3D, scale) {
    if (!css3d) {
      console.warn(`Can't copyTransform, css3d is null`, css3d);
      return;
    }
    object3d.getWorldPosition(_v1);
    css3d.position.copy(_v1).multiplyScalar(this.cssPresentation.FACTOR);
    object3d.getWorldQuaternion(_q1);
    css3d.quaternion.copy(_q1);
    object3d.getWorldScale(_v1);
    css3d.scale.copy(_v1).multiplyScalar(this.cssPresentation.FACTOR * scale);
  }
}
