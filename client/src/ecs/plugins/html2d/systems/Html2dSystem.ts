import { Object3D, Vector3 } from "three";

import { System, Groups, Not, Entity, Modified } from "~/ecs/base";
import { Presentation, Object3DRef, Transform } from "~/ecs/plugins/core";
import { Perspective } from "~/ecs/plugins/perspective";

import { Html2d, Html2dRef } from "../components";
import { getHtmlComponent } from "../html";
import { HtmlPresentation } from "../HtmlPresentation";

const v1 = new Vector3();
export class Html2dSystem extends System {
  presentation: Presentation;
  htmlPresentation: HtmlPresentation;
  perspective: Perspective;

  order = Groups.Presentation + 250;

  static queries = {
    new: [Html2d, Not(Html2dRef)],
    modified: [Modified(Html2d), Html2dRef],
    active: [Html2d, Html2dRef, Object3DRef],
    removed: [Not(Html2d), Html2dRef],
  };

  init({ presentation, htmlPresentation, perspective }) {
    this.presentation = presentation;
    this.htmlPresentation = htmlPresentation;
    this.perspective = perspective;
  }

  update(delta) {
    const vb = this.perspective.visibleBounds;

    this.queries.new.forEach((entity) => {
      this.build(entity);
    });
    this.queries.modified.forEach((entity) => {
      this.remove(entity);
      this.build(entity);
    });
    // Optimization: only update CSS every 30 fps or so:
    if (
      delta >= 1 / 30 ||
      (delta < 1 / 30 && this.presentation.frame % 2 === 0)
    ) {
      this.queries.active.forEach((entity) => {
        this.updatePosition(entity);
      });
    }
    this.queries.removed.forEach((entity) => {
      this.remove(entity);
    });
  }

  build(entity: Entity) {
    const spec = entity.get(Html2d);

    // Prepare a container for Svelte
    const container = this.htmlPresentation.createContainer(
      spec.zoomInvariant ? 2 : 1
    );

    this.htmlPresentation.domElement.appendChild(container);

    // Create whatever Svelte component is specified by the type
    const Component = getHtmlComponent(spec.kind);
    const component = new Component({
      target: container,
      props: { ...spec, entity },
    });

    entity.add(Html2dRef, { container, component });
  }

  remove(entity: Entity) {
    const container = entity.get(Html2dRef).container;
    container.remove();

    entity.remove(Html2dRef);
  }

  updatePosition(entity: Entity) {
    if (this.presentation.skipUpdate > 0) return;

    const transform: Transform = entity.get(Transform);
    const spec: Html2d = entity.get(Html2d);

    // calculate left, top
    v1.copy(transform.positionWorld);
    v1.add(spec.offset);

    this.htmlPresentation.project(v1);

    const container: HTMLElement = entity.get(Html2dRef).container;
    container.style.left = v1.x + "px";
    container.style.top = v1.y + "px";

    this.presentation.camera.getWorldPosition(v1);
    const distance = v1.distanceTo(transform.positionWorld);
    const scale = spec.zoomInvariant ? 1 : (10 * spec.zoomSize) / distance;
    const x = this.percent(spec.hanchor);
    const y = this.percent(spec.vanchor);
    container.style.transform = `translate(-50%,-50%) scale(${scale}) translate(${x},${y})`;
  }

  percent(enumVal) {
    // prettier-ignore
    switch (enumVal) {
        case 0: return "0%";
        case 1: return "50%";
        case 2: return "-50%";
      }
  }
}
