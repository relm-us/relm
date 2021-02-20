import { PerspectiveCamera } from "three";

const ResizeObserver = (window as any).ResizeObserver;

export class HtmlPresentation {
  world: any;
  domElement: HTMLElement;
  viewport: HTMLElement;

  constructor(world) {
    this.world = world;
    this.domElement = this.createDomElement();
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
