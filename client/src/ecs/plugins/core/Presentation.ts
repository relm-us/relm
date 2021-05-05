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
  skipUpdate: number;
  mouse2d: Vector2;
  mouseMoveListener: (event: MouseEvent) => void;
  touchMoveListener: (event: TouchEvent) => void;

  constructor(world: World, options: PresentationOptions) {
    this.world = world;
    this.viewport = null;
    this.size = new Vector2(1, 1);
    this.object3ds = [];
    this.scene = options.scene || this.createScene();
    this.renderer = options.renderer || this.createRenderer();
    this.camera = options.camera || this.createCamera();
    this.cameraTarget = null; // can be set later with setCameraTarget
    this.resizeObserver = new ResizeObserver(this.resize.bind(this));
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

  createScene() {
    const scene = new Scene();
    scene.background = new Color(0xaec7ed);
    scene.name = "scene";

    const hemiLight = new HemisphereLight(0x444444, 0xffffff);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const dirLight = new DirectionalLight(0xffffff, 6);
    dirLight.position.set(-3, 20, -40);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.camera.top = 15;
    dirLight.shadow.camera.bottom = -15;
    dirLight.shadow.camera.left = -15;
    dirLight.shadow.camera.right = 15;
    dirLight.shadow.camera.near = 20;
    dirLight.shadow.camera.far = 60;
    dirLight.shadow.radius = 1;
    dirLight.shadow.bias = -0.01;
    scene.add(dirLight);

    return scene;
  }

  createRenderer() {
    const renderer = new WebGLRenderer({
      antialias: true,
    });
    // renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(this.size.x, this.size.y);
    renderer.physicallyCorrectLights = true;
    renderer.outputEncoding = sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = VSMShadowMap;
    (renderer.domElement as any).style = "outline:0;";

    // TODO: move to XRSystem?
    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType("local-floor");

    return renderer;
  }

  createCamera() {
    return new PerspectiveCamera(75, this.size.x / this.size.y, 0.1, 1000);
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
