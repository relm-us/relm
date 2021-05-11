import { Vector3 } from "three";

import { System, Groups, Not, Entity, Modified } from "~/ecs/base";
import { WorldTransform, Presentation } from "~/ecs/plugins/core";
import { Perspective } from "~/ecs/plugins/perspective";

import { playerId } from "~/identity/playerId";
import { getStreamStore, getLocalStreamStore } from "~/av/getStreamStore";

import HtmlOculus from "../HtmlOculus.svelte";
import { Oculus, OculusRef } from "../components";
import { HtmlPresentation } from "../HtmlPresentation";

const v1 = new Vector3();
/**
 * An Oculus is a "round window" in architectural design. Similarly, this Oculus
 * refers to the circular video feeds above participants' heads.
 */
export class OculusSystem extends System {
  presentation: Presentation;
  htmlPresentation: HtmlPresentation;
  perspective: Perspective;

  order = Groups.Presentation + 251;

  static queries = {
    new: [Oculus, Not(OculusRef)],
    modified: [Modified(Oculus), OculusRef],
    active: [Oculus, OculusRef, WorldTransform],
    removed: [Not(Oculus), OculusRef],
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
    const spec = entity.get(Oculus);
    const isLocal = spec.playerId === playerId;
    const localStream = getLocalStreamStore();
    const stream = isLocal ? localStream : getStreamStore(spec.playerId);

    // Prepare a container for Svelte
    const container = this.htmlPresentation.createContainer(
      spec.hanchor,
      spec.vanchor,
      2
    );
    this.htmlPresentation.domElement.appendChild(container);

    // Create whatever Svelte component is specified by the type
    const component = new HtmlOculus({
      target: container,
      props: { ...spec, stream, localStream, isLocal },
    });

    entity.add(OculusRef, { container, component });
  }

  remove(entity: Entity) {
    const ref = entity.get(OculusRef);
    const container: HTMLElement = ref.container;

    if (container) container.remove();

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
    container.style.left = Math.round(v1.x) + "px";
    container.style.top = Math.round(v1.y) + "px";
    container.style.pointerEvents = "auto";

    // calculate width
    container.style.width = `${Math.round(1500 / dist)}px`;
    container.style.height = `${Math.round(1500 / dist)}px`;
  }
}
