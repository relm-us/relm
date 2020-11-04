import { CSS3DRenderer } from "three/examples/jsm/renderers/CSS3DRenderer";

const ResizeObserver = (window as any).ResizeObserver;

export class CssPresentation {
  world: any;
  renderer: any;
  size: { width: number; height: number };
  resizeObserver: any;
  viewport: HTMLElement;

  constructor(world) {
    this.world = world;
    this.size = { width: 1, height: 1 };
    this.renderer = this.createRenderer();
    this.resizeObserver = new ResizeObserver(this.resize.bind(this));
  }

  setViewport(viewport) {
    if (this.viewport === viewport) {
      return;
    }
    if (this.viewport) {
      this.resizeObserver.unobserve(this.viewport);
      this.viewport.removeChild(this.renderer.domElement);
    }
    this.viewport = viewport;
    this.resize();
    if (this.viewport) {
      this.viewport.appendChild(this.renderer.domElement);
      this.resizeObserver.observe(this.viewport);
    }
  }

  updateSize() {
    this.size.width = this.viewport?.offsetWidth || 1;
    this.size.height = this.viewport?.offsetHeight || 1;
  }

  resize() {
    this.updateSize();
    this.renderer.setSize(this.size.width, this.size.height);
  }

  createRenderer() {
    const renderer = new CSS3DRenderer();
    renderer.setSize(this.size.width, this.size.height);
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = "0px";
    renderer.domElement.style.zIndex = "-1";
    return renderer;
  }
}
