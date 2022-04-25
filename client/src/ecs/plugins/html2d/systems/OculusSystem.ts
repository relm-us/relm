import { Object3D, Vector3 } from "three";
import { Tween, Easing } from "@tweenjs/tween.js";

import { System, Groups, Not, Entity, Modified } from "~/ecs/base";
import { Object3DRef, Presentation } from "~/ecs/plugins/core";
import { Perspective } from "~/ecs/plugins/perspective";

import HtmlOculus from "../HtmlOculus.svelte";
import { Oculus, OculusRef } from "../components";
import { HtmlPresentation } from "../HtmlPresentation";
import { worldManager } from "~/world";

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
    active: [Oculus, OculusRef, Object3DRef],
    removed: [Not(Oculus), OculusRef],
  };

  init({ presentation, htmlPresentation, perspective }) {
    this.presentation = presentation;
    this.htmlPresentation = htmlPresentation;
    this.perspective = perspective;
  }

  update() {
    this.queries.new.forEach((entity) => {
      this.build(entity);
    });
    this.queries.modified.forEach((entity) => {
      this.remove(entity);
      this.build(entity);
    });
    this.queries.active.forEach((entity) => {
      this.updatePosition(entity);
    });
    this.queries.removed.forEach((entity) => {
      this.remove(entity);
    });
  }

  build(entity: Entity) {
    const spec = entity.get(Oculus);

    // Need avConnection to exist for Oculus to work
    if (!worldManager.avConnection) return;

    // Prepare a container for Svelte
    const container = this.htmlPresentation.createContainer(3);
    container.style.display = "flex";
    container.style.justifyContent = "center";
    container.style.alignItems = "center";
    container.style.pointerEvents = "none";
    this.htmlPresentation.domElement.appendChild(container);

    // Create the Svelte component
    const component = new HtmlOculus({
      target: container,
      props: { ...spec, entity },
    });

    entity.add(OculusRef, { container, component });
  }

  remove(entity: Entity) {
    const ref = entity.get(OculusRef);

    // Destroy Svelte component
    if (ref.component) ref.component.$destroy();

    // Remove HTML container of Svelte component
    if (ref.container) ref.container.remove();

    entity.remove(OculusRef);
  }

  updatePosition(entity: Entity) {
    if (this.presentation.skipUpdate > 0) return;

    const object3d: Object3D = entity.get(Object3DRef)?.value;
    const spec = entity.get(Oculus);
    const dist = this.presentation.camera.parent.position.distanceTo(
      object3d.position
    );

    if (spec.tween && spec.tweenedTargetOffset) {
      if (spec.tweenedTargetOffset.distanceTo(spec.targetOffset) <= 0.001) {
        spec.tween.update();
      } else {
        spec.tweenedTargetOffset = null;
        spec.tween = null;
      }
    } else if (spec.offset.distanceTo(spec.targetOffset) >= 0.001) {
      let time;
      if (spec.offset.y > spec.targetOffset.y) {
        time = 2200;
      } else {
        time = 100;
      }
      spec.tweenedTargetOffset = new Vector3().copy(spec.targetOffset);
      spec.tween = new Tween(spec.offset)
        .to(spec.targetOffset, time)
        .easing(Easing.Sinusoidal.InOut)
        .onComplete(() => {
          spec.tweenedTargetOffset = null;
          spec.tween = null;
        })
        .start();
    }

    // calculate left, top
    v1.copy(object3d.position);
    v1.add(spec.offset);

    this.htmlPresentation.project(v1);

    const container = entity.get(OculusRef).container;
    container.style.left = Math.round(v1.x) + "px";
    container.style.top = Math.round(v1.y) + "px";

    // calculate width
    container.style.width = `${Math.round(1200 / dist)}px`;
    container.style.height = `${Math.round(1200 / dist)}px`;
  }
}
