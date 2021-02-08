import { PerspectiveCamera, sRGBEncoding } from "three";
import { CSS3DRenderer } from "three/examples/jsm/renderers/CSS3DRenderer";

const ResizeObserver = (window as any).ResizeObserver;

export class CssPresentation {
  FACTOR = 1000;

  world: any;
  renderer: any;
  scene: any;
  camera: any;
  size: { width: number; height: number };
  resizeObserver: any;
  viewport: HTMLElement;

  constructor(world) {
    this.world = world;
    this.size = { width: 1, height: 1 };

    this.renderer = this.createRenderer();
    this.renderer.outputEncoding = sRGBEncoding;
    this.camera = this.createCamera();
    this.scene = world.presentation.scene;

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

    this.camera.aspect = this.size.width / this.size.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.size.width, this.size.height);
  }

  updateCamera() {
    // The way plugin/three works, it's the camera's *parent* that
    // holds positional information:
    const camera = this.world.presentation.camera.parent;
    if (!camera) return;

    this.camera.quaternion.copy(camera.quaternion);
    this.camera.position.copy(camera.position).multiplyScalar(this.FACTOR);

    // console.log("updateCamera", this.camera.position);
    // this.camera.updateProjectionMatrix();
    // this.camera.updateWorldMatrix();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  createRenderer() {
    const renderer = new CSS3DRenderer();
    renderer.setSize(this.size.width, this.size.height);
    renderer.domElement.style.backgroundColor = "black";
    renderer.domElement.style.position = "fixed";
    renderer.domElement.style.top = "0px";
    // this fixes an issue in Firefox where overflow:hidden offsets
    // the render view by some amount, inexplicably.
    renderer.domElement.style.overflow = "";
    return renderer;
  }

  createCamera() {
    const { fov, aspect, near, far } = this.world.presentation.camera;
    return new PerspectiveCamera(
      fov,
      aspect,
      near * this.FACTOR,
      far * this.FACTOR
    );
  }
}
