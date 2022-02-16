import { Loader } from "./Loader";
import {
  Object3D,
  TextureLoader,
  Color,
  HemisphereLight,
  DirectionalLight,
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  VSMShadowMap,
  sRGBEncoding,
  Texture,
  Vector3,
  Vector2,
  Frustum,
  Matrix4,
} from "three";

import { World } from "~/ecs/base";
import { IntersectionFinder } from "./IntersectionFinder";

export type PlaneOrientation = "xz" | "xy";

let gltfLoader: Loader;
let textureLoader: TextureLoader;

declare class ResizeObserver {
  constructor(fn: () => void);
  observe: (element: HTMLElement) => void;
  unobserve: (element: HTMLElement) => void;
}

export type PresentationOptions = {
  scene: Scene;
  renderer: WebGLRenderer;
  camera: PerspectiveCamera;
};

export class Presentation {
  world: World;
  viewport: HTMLElement;
  size: Vector2;
  object3ds: Array<Object3D>;
  scene: Scene;
  renderer: WebGLRenderer;
  camera: PerspectiveCamera;
  cameraTarget: Vector3;
  resizeObserver: ResizeObserver;
  intersectionFinder: IntersectionFinder;

  skipUpdate: number;
  mouse2d: Vector2;
  mouseMoveListener: (event: MouseEvent) => void;
  touchMoveListener: (event: TouchEvent) => void;

  constructor(world: World, options: PresentationOptions) {
    this.world = world;
    this.viewport = null;
    this.size = new Vector2(1, 1);
    this.object3ds = [];
    this.scene = options.scene;
    this.renderer = options.renderer;
    this.camera = options.camera;
    this.cameraTarget = null; // can be set later with setCameraTarget
    this.resizeObserver = new ResizeObserver(this.resize.bind(this));
    this.intersectionFinder = new IntersectionFinder(this.camera, this.scene);

    this.skipUpdate = 0;
    this.mouse2d = new Vector2();
    this.mouseMoveListener = this.handleMouseMove.bind(this);
    this.touchMoveListener = this.handleTouchMove.bind(this);

    if (!gltfLoader) gltfLoader = new Loader();

    if (!textureLoader) textureLoader = new TextureLoader();
  }

  handleMouseMove(event: MouseEvent) {
    this.mouse2d.x = event.clientX;
    this.mouse2d.y = event.clientY;
  }

  handleTouchMove(event: TouchEvent) {
    var touches = event.changedTouches;
    this.mouse2d.x = touches[0].clientX;
    this.mouse2d.y = touches[0].clientY;
  }

  setViewport(viewport) {
    if (this.viewport === viewport) {
      return;
    }
    if (this.viewport) {
      this.resizeObserver.unobserve(this.viewport);
      this.viewport.removeEventListener("mousemove", this.mouseMoveListener);
      this.viewport.removeEventListener("touchmove", this.touchMoveListener);
      this.viewport.removeEventListener("touchstart", this.touchMoveListener);
      this.viewport.removeChild(this.renderer.domElement);
      this.viewport = null;
    }
    this.viewport = viewport;
    this.resize();
    if (this.viewport) {
      this.viewport.appendChild(this.renderer.domElement);
      this.viewport.addEventListener("touchstart", this.touchMoveListener);
      this.viewport.addEventListener("touchmove", this.touchMoveListener);
      this.viewport.addEventListener("mousemove", this.mouseMoveListener);
      this.resizeObserver.observe(this.viewport);
    }
  }

  setLoop(fn) {
    this.renderer.setAnimationLoop(fn);
  }

  loadGltf(url) {
    return gltfLoader.load(url);
  }

  async loadTexture(url: string): Promise<Texture> {
    return new Promise((resolve, reject) => {
      textureLoader.load(url, resolve, null, reject);
    });
  }

  updateSize() {
    this.size.x = this.viewport?.offsetWidth || 1;
    this.size.y = this.viewport?.offsetHeight || 1;
  }

  resize() {
    this.updateSize();
    this.camera.aspect = this.size.x / this.size.y;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.size.x, this.size.y);
    if (this.viewport) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  setCameraTarget(target: Vector3) {
    this.cameraTarget = target;
  }

  compile() {
    this.renderer.compile(this.scene, this.camera);
  }

  update() {
    if (!this.viewport) return;
    if (this.skipUpdate > 0) {
      this.scene.updateMatrixWorld();
      this.camera.updateMatrixWorld();
      this.skipUpdate--;
      return;
    }
    this.renderer.render(this.scene, this.camera);
  }

  getFrustum(camera: PerspectiveCamera = this.camera) {
    const frustum = new Frustum();
    const cameraViewProjectionMatrix = new Matrix4();

    camera.updateMatrixWorld();
    camera.matrixWorldInverse.copy(camera.matrixWorld).invert();
    cameraViewProjectionMatrix.multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse
    );
    frustum.setFromProjectionMatrix(cameraViewProjectionMatrix);

    return frustum;
  }
}
