import { Vector3, PerspectiveCamera } from "three";

export class HtmlPresentation {
  world: any;
  camera: PerspectiveCamera;
  domElement: HTMLElement;
  viewport: HTMLElement;

  constructor(world) {
    this.world = world;
    this.domElement = this.createDomElement();
    this.camera = this.world.presentation.camera;
    if (!this.camera) throw new Error("camera required");
  }

  createDomElement() {
    const el = document.createElement("div");
    el.style.position = "fixed";
    el.style.top = "0px";
    el.style.left = "0px";
    el.style.width = "100%";
    el.style.height = "100%";
    el.style.pointerEvents = "none";

    return el;
  }

  project(position: Vector3) {
    position.project(this.camera);
    position.x = ((position.x + 1) * window.innerWidth) / 2;
    position.y = (-(position.y - 1) * window.innerHeight) / 2;
    position.z = 0;
  }

  percent(enumVal) {
    // prettier-ignore
    switch (enumVal) {
        case 0: return "-50%";
        case 1: return "0%";
        case 2: return "-100%";
      }
  }

  createContainer(hanchor, vanchor) {
    const container = document.createElement("div");

    // just above the 3d world, but below the editor panel
    container.style.zIndex = "1";
    // when an Html2d object touches the edge of the page, we don't want it to resize
    container.style.width = "fit-content";
    // position the element where we need it, "on top of" the 3d world
    container.style.position = "fixed";

    const x = this.percent(hanchor);
    const y = this.percent(vanchor);
    container.style.transform = `translate(${x},${y})`;

    return container;
  }

  setViewport(viewport) {
    if (this.viewport === viewport) {
      return;
    }
    if (this.viewport) {
      this.viewport.removeChild(this.domElement);
    }
    this.viewport = viewport;
    if (this.viewport) {
      this.viewport.appendChild(this.domElement);
    }
  }
}
