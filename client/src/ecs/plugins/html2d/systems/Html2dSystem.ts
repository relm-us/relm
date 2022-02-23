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

  update() {
    const vb = this.perspective.visibleBounds;
    const boundsWidth = vb.max.x - vb.min.x;

    this.queries.new.forEach((entity) => {
      this.build(entity);
    });
    this.queries.modified.forEach((entity) => {
      this.remove(entity);
      this.build(entity);
    });
    this.queries.active.forEach((entity) => {
      this.updatePosition(entity, boundsWidth);
    });
    this.queries.removed.forEach((entity) => {
      this.remove(entity);
    });
  }

  build(entity: Entity) {
    const spec = entity.get(Html2d);

    // Prepare a container for Svelte
    const container = this.htmlPresentation.createContainer(
      spec.hanchor,
      spec.vanchor
    );

    // When hovering over the container and we're zoomed out, we still want
    // the HTML label (for example) to have plenty of width so it can be read.
    container.addEventListener("mouseenter", () => {
      // if (isOverflowing(container)) container.style.minWidth = "300px";
    });
    container.addEventListener("mouseleave", () => {
      container.style.minWidth = "";
    });

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

  updatePosition(entity: Entity, boundsWidth: number) {
    if (this.presentation.skipUpdate > 0) return;

    const transform: Transform = entity.get(Transform);
    const spec = entity.get(Html2d);

    // calculate left, top
    v1.copy(transform.positionWorld);
    v1.add(spec.offset);

    this.htmlPresentation.project(v1);

    const container = entity.get(Html2dRef).container;
    container.style.left = v1.x + "px";
    container.style.top = v1.y + "px";
    container.style.pointerEvents = "auto";

    // calculate width
    let width = (35 / boundsWidth) * spec.width * 60;
    container.style.maxWidth = Math.floor(width) + "px";
  }
}
