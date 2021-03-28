import { Loader } from "./Loader";
import { World } from "~/ecs/base";
import {
  Object3D,
  TextureLoader,
  ImageBitmapLoader,
  Color,
  HemisphereLight,
  DirectionalLight,
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  VSMShadowMap,
  sRGBEncoding,
  CanvasTexture,
  Texture,
  Vector3,
  Vector2,
  Raycaster,
  Plane,
  Box3,
  Frustum,
  Matrix4,
} from "three";
import isFirefox from "@braintree/browser-detection/is-firefox";
import isIosSafari from "@braintree/browser-detection/is-ios-safari";

let loader;
let textureLoader;
let imageBitmapLoader;

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

const _raycaster = new Raycaster();
const _intersect = new Vector3();
const _up = new Vector3(0, 1, 0);
const _plane = new Plane(_up, -0.01);
const _v2 = new Vector2();

export class Presentation {
  world: World;
  viewport: HTMLElement;
  size: { width: number; height: number };
  object3ds: Array<Object3D>;
  scene: Scene;
  renderer: WebGLRenderer;
  camera: PerspectiveCamera;
  cameraTarget: Vector3;
  resizeObserver: ResizeObserver;
  visibleBounds: Box3;
  skipUpdate: number;
  loadTexture: (url) => Promise<Texture>;

  constructor(world: World, options: PresentationOptions) {
    this.world = world;
    this.viewport = null;
    this.size = { width: 1, height: 1 };
    this.object3ds = [];
    this.scene = options.scene || this.createScene();
    this.renderer = options.renderer || this.createRenderer();
    this.camera = options.camera || this.createCamera();
    this.cameraTarget = null; // can be set later with setCameraTarget
    this.resizeObserver = new ResizeObserver(this.resize.bind(this));
    this.visibleBounds = new Box3();
    this.skipUpdate = 0;
    if (!loader) loader = new Loader();

    if (!textureLoader) textureLoader = new TextureLoader();
    this.loadTexture = this.loadTexture_TextureLoader;

    // TODO: Why doesn't this autodetect correctly in safari?
    // if (isFirefox() || isIosSafari()) {
    //   if (!textureLoader) textureLoader = new TextureLoader();
    //   this.loadTexture = this.loadTexture_TextureLoader;
    // } else {
    //   if (!imageBitmapLoader) {
    //     imageBitmapLoader = new ImageBitmapLoader();
    //     imageBitmapLoader.options = { imageOrientation: "flipY" };
    //   }
    //   this.loadTexture = this.loadTexture_ImageBitmapLoader;
    // }
  }

  setViewport(viewport) {
    if (this.viewport === viewport) {
      return;
    }
    if (this.viewport) {
      this.resizeObserver.unobserve(this.viewport);
      this.viewport.removeChild(this.renderer.domElement);
      this.viewport = null;
    }
    this.viewport = viewport;
    this.resize();
    if (this.viewport) {
      this.viewport.appendChild(this.renderer.domElement);
      this.resizeObserver.observe(this.viewport);
    }
  }

  setLoop(fn) {
    this.renderer.setAnimationLoop(fn);
  }

  load(url) {
    return loader.load(url);
  }

  async loadTexture_TextureLoader(url: string): Promise<Texture> {
    return new Promise((resolve, reject) => {
      textureLoader.load(url, resolve, null, reject);
    });
  }

  async loadTexture_ImageBitmapLoader(url: string): Promise<Texture> {
    return new Promise((resolve, reject) => {
      imageBitmapLoader.load(
        url,
        (imageBitmap) => {
          resolve(new CanvasTexture(imageBitmap));
        },
        null,
        reject
      );
    });
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
    renderer.setSize(this.size.width, this.size.height);
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
    return new PerspectiveCamera(
      75,
      this.size.width / this.size.height,
      0.1,
      1000
    );
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
    this.updateVisibleBounds();
  }

  getWorldFromScreenCoords(
    x: number,
    y: number,
    target: Vector3 = _intersect,
    alreadyNormalized = false,
    camera: PerspectiveCamera = this.camera
  ): Vector3 {
    if (!alreadyNormalized) {
      x = (x * 2) / window.innerWidth - 1;
      y = (-y * 2) / window.innerHeight + 1;
    }
    _v2.set(x, y);
    _raycaster.setFromCamera(_v2, camera);
    _raycaster.ray.intersectPlane(_plane, target);
    return target;
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

  updateVisibleBounds() {
    if (this.cameraTarget) {
      _plane.set(_up, -this.cameraTarget.y);
    }
    this.visibleBounds = new Box3();
    for (let x = -1; x <= 1; x += 2) {
      for (let y = -1; y <= 1; y += 2) {
        const point = this.getWorldFromScreenCoords(x, y, _intersect, true);
        this.visibleBounds.expandByPoint(point);
      }
    }
  }
}
