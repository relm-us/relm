import { PerspectiveCamera, Vector3 } from "three";
import { System, Groups, Not, Entity, Modified } from "~/ecs/base";
import { Html2d, Html2dRef } from "../components";
import { Presentation, WorldTransform } from "~/ecs/plugins/core";
import { getHtmlComponent } from "../html";

const v1 = new Vector3();

export class Html2dSystem extends System {
  presentation: Presentation;

  order = Groups.Presentation + 250;

  static queries = {
    new: [Html2d, Not(Html2dRef)],
    modified: [Modified(Html2d), Html2dRef],
    active: [Html2d, Html2dRef],
    removed: [Not(Html2d), Html2dRef],
  };

  init({ presentation }) {
    this.presentation = presentation;
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
      const world = entity.get(WorldTransform);
      const spec = entity.get(Html2d);
      v1.copy(world.position);
      v1.add(spec.offset);
      this.project(v1, this.presentation.camera);
      this.updatePosition(entity, v1);
    });
    this.queries.removed.forEach((entity) => {
      this.remove(entity);
    });
  }

  build(entity: Entity) {
    const spec = entity.get(Html2d);

    const pct = (enumVal) => {
      // prettier-ignore
      switch (enumVal) {
        case 0: return "-50%";
        case 1: return "0%";
        case 2: return "-100%";
      }
    };
    // Prepare a container for Svelte
    const container = document.createElement("div");
    const style = container.style;
    // just above the 3d world, but below the editor panel
    style.zIndex = "1";
    // when an Html2d object touches the edge of the page, we don't want it to resize
    style.width = "fit-content";
    // position the element where we need it, "on top of" the 3d world
    style.position = "absolute";
    style.transform = `translate(${pct(spec.hanchor)},${pct(spec.vanchor)})`;

    document.body.appendChild(container);

    // Create whatever Svelte component is specified by the type
    const Component = getHtmlComponent(spec.kind);
    new Component({
      target: container,
      props: { ...spec, entity },
    });

    entity.add(Html2dRef, { value: container });
  }

  remove(entity: Entity) {
    const container = entity.get(Html2dRef).value;
    container.remove();
  }

  project(position: Vector3, camera: PerspectiveCamera) {
    position.project(camera);
    position.x = ((position.x + 1) * window.innerWidth) / 2;
    position.y = (-(position.y - 1) * window.innerHeight) / 2;
    position.z = 0;
  }

  updatePosition(entity: Entity, position: Vector3) {
    const container = entity.get(Html2dRef).value;
    container.style.left = position.x + "px";
    container.style.top = position.y + "px";
  }
}
