import {
  TextureLoader,
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Texture,
  Vector3,
  Vector2,
  Frustum,
  Matrix4,
  Object3D,
} from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import {
  EffectComposer,
  EffectPass,
  RenderPass,
  BlendFunction,
  OutlineEffect,
  SelectiveBloomEffect,
  SMAAEffect,
  SMAAPreset,
  EdgeDetectionMode,
} from "postprocessing";

import { World } from "~/ecs/base";

import { IntersectionFinder } from "./IntersectionFinder";

export type PlaneOrientation = "xz" | "xy";

let gltfLoader: GLTFLoader;
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
  frame: number;

  scene: Scene;
  camera: PerspectiveCamera;
  visibleCandidates: Set<Object3D>;

  renderer: WebGLRenderer;
  composer: EffectComposer;

  outlineEffect: OutlineEffect;
  bloomEffect: SelectiveBloomEffect;

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
    this.frame = 0;

    this.scene = options.scene;
    this.camera = options.camera;
    this.visibleCandidates = new Set();

    this.renderer = options.renderer;

    const isWebGL2 = this.renderer.capabilities.isWebGL2;
    const maxSamples = Math.min(
      4,
      (this.renderer.capabilities as any).maxSamples || 1
    );

    if (isWebGL2) {
      this.composer = new EffectComposer(this.renderer, {
        multisampling: maxSamples,
      });
    } else {
      this.composer = new EffectComposer(this.renderer);
    }

    this.composer.addPass(new RenderPass(this.scene, this.camera));

    // prepare outline effect for outline EffectPass
    this.outlineEffect = new OutlineEffect(this.scene, this.camera, {
      blendFunction: BlendFunction.ALPHA,
      multisampling: maxSamples,
      edgeStrength: 5,
      visibleEdgeColor: 0xffffff,
      hiddenEdgeColor: 0x5f5f5f,
      blur: true,
      xRay: true,
    });

    this.bloomEffect = new SelectiveBloomEffect(this.scene, this.camera, {
      blendFunction: BlendFunction.ADD,
      intensity: 1,
      luminanceThreshold: 0.3,
      luminanceSmoothing: 0.025,
    });

    if (isWebGL2) {
      this.composer.addPass(
        new EffectPass(this.camera, this.bloomEffect, this.outlineEffect)
      );
    } else {
      // Add anti-aliasing last
      this.composer.addPass(
        new EffectPass(
          this.camera,
          this.outlineEffect,
          new SMAAEffect({
            preset: SMAAPreset.HIGH,
            edgeDetectionMode: EdgeDetectionMode.COLOR,
          }),
          this.bloomEffect
        )
      );
    }

    this.cameraTarget = null; // can be set later with setCameraTarget
    this.resizeObserver = new ResizeObserver(this.resize.bind(this));
    this.intersectionFinder = new IntersectionFinder(this.camera, this.scene);

    this.skipUpdate = 0;
    this.mouse2d = new Vector2();
    this.mouseMoveListener = this.handleMouseMove.bind(this);
    this.touchMoveListener = this.handleTouchMove.bind(this);

    if (!gltfLoader) gltfLoader = new GLTFLoader();
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

  async loadGltf(url): Promise<GLTF> {
    return new Promise((resolve, reject) => {
      gltfLoader.load(url, (data) => resolve(data), null, reject);
    });
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
    this.composer.setSize(this.size.x, this.size.y);
    if (this.viewport) {
      this.composer.render();
    }
  }

  setCameraTarget(target: Vector3) {
    this.cameraTarget = target;
  }

  compile() {
    this.renderer.compile(this.scene, this.camera);
  }

  update(delta) {
    if (!this.viewport) return;
    if (this.skipUpdate > 0) {
      this.scene.updateMatrixWorld();
      this.camera.updateMatrixWorld();
      this.skipUpdate--;
      return;
    }

    this.frame++;

    this.renderer.info.reset();

    this.composer.render(delta);

    this.frame++;
  }

  getFrustum({ scale = 1.0, grow = 0 } = {}) {
    const frustum = new Frustum();

    const m4 = new Matrix4()
      .copy(this.camera.projectionMatrix)
      .multiplyScalar(scale);
    this.camera.updateProjectionMatrix();
    frustum.setFromProjectionMatrix(
      m4.multiply(this.camera.matrixWorldInverse)
    );
    if (grow) {
      frustum.planes.forEach((plane) => {
        plane.constant += grow;
      });
    }

    return frustum;
  }
}
