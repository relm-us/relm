import { PerspectiveCamera, Plane, Raycaster, Vector3 } from "three";
import { System, Groups, Not, Entity, Modified } from "~/ecs/base";
import { Oculus, OculusRef } from "../components";
import { Presentation, WorldTransform } from "~/ecs/plugins/core";
import { HtmlPresentation } from "../HtmlPresentation";
import HtmlOculus from "../HtmlOculus.svelte";

const v1 = new Vector3();
/**
 * An Oculus is a "round window" in architectural design. Similarly, this Oculus
 * refers to the circular video feeds above participants' heads.
 */
export class OculusSystem extends System {
  presentation: Presentation;
  htmlPresentation: HtmlPresentation;

  order = Groups.Presentation + 251;

  static queries = {
    new: [Oculus, Not(OculusRef)],
    modified: [Modified(Oculus), OculusRef],
    active: [Oculus, OculusRef, WorldTransform],
    removed: [Not(Oculus), OculusRef],
  };

  init({ presentation, htmlPresentation }) {
    this.presentation = presentation;
    this.htmlPresentation = htmlPresentation;
  }

  update() {
    const boundsWidth =
      this.presentation.visibleBounds.max.x -
      this.presentation.visibleBounds.min.x;

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
    const spec = entity.get(Oculus);

    // Prepare a container for Svelte
    const container = this.htmlPresentation.createContainer(
      spec.hanchor,
      spec.vanchor
    );
    this.htmlPresentation.domElement.appendChild(container);

    // Create whatever Svelte component is specified by the type
    const component = new HtmlOculus({
      target: container,
      props: { ...spec, entity },
    });

    entity.add(OculusRef, { container, component });
  }

  remove(entity: Entity) {
    const container = entity.get(OculusRef).value;
    container.remove();

    entity.remove(OculusRef);
  }

  updatePosition(entity: Entity, boundsWidth: number) {
    if (this.presentation.skipUpdate > 0) return;

    const world = entity.get(WorldTransform);
    const spec = entity.get(Oculus);
    const dist = this.presentation.camera.parent.position.distanceTo(
      entity.get(WorldTransform).position
    );
    // console.log("dist", dist);

    // calculate left, top
    v1.copy(world.position);
    v1.add(spec.offset);

    this.htmlPresentation.project(v1);

    const container = entity.get(OculusRef).container;
    container.style.left = v1.x + "px";
    container.style.top = v1.y + "px";
    container.style.pointerEvents = "auto";

    // calculate width
    container.style.width = `${1500 / dist}px`;
    container.style.height = `${1500 / dist}px`;
  }
}
