import {
  Object3D,
  DirectionalLight,
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Vector3,
  Vector2,
  Box3,
  Sphere,
} from "three";
import { createScene } from "./createScene";

export class PhotoBooth {
  scene: Scene;
  container1: Object3D;
  container2: Object3D;
  container3: Object3D;

  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  light: DirectionalLight;

  constructor(renderer) {
    this.renderer = renderer;
    this.scene = this.createPhotoBoothScene();
  }

  createPhotoBoothScene() {
    const scene = createScene();
    scene.background = null;
    scene.fog = null;

    this.light = new DirectionalLight("#ffffff", 2.5);
    this.light.position.set(-5 * 10, 5 * 10, 2.5 * 10);
    scene.add(this.light);

    this.container1 = new Object3D();
    this.container2 = new Object3D();
    this.container3 = new Object3D();

    scene.add(this.container1);
    this.container1.add(this.container2);
    this.container2.add(this.container3);

    this.camera = new PerspectiveCamera(
      35,
      1 /* aspect to be updated later */,
      0.1,
      1000
    );
    this.camera.position.set(0, 10, 10);

    return scene;
  }

  takeShot(object: Object3D) {
    // Update camera aspect to current canvas width/height
    const canvasSize = new Vector2();
    this.renderer.getSize(canvasSize);
    this.camera.aspect = canvasSize.x / canvasSize.y;
    this.camera.updateProjectionMatrix();

    // Save parent for restore step (last step)
    const parent = object.parent;

    // Add object to inner container, neutralizing position
    this.container3.add(object);
    this.container3.position.copy(object.position).multiplyScalar(-1);

    // Neutralize rotation, making object face camera
    this.container2.quaternion.copy(object.quaternion).invert();

    // Measure object size
    const box = new Box3().setFromObject(this.container1);
    const bbSize = new Vector3();
    box.getSize(bbSize);

    // Place object in visual center
    const center = new Vector3();
    box.getCenter(center);
    this.container1.position.copy(center).multiplyScalar(-1);

    // Rotate a quarter-turn to the left, so objects aren't facing straight on to camera
    this.container2.rotation.y -= Math.PI / 4;

    // Move camera so that object takes up full view
    var fov = this.camera.fov * (Math.PI / 180);
    var distance = Math.abs(Math.min(bbSize.x, bbSize.y) / Math.sin(fov / 2));
    this.camera.position.set(0, 1, 1).normalize().multiplyScalar(distance);
    // this.camera.lookAt(this.container1.position);
    this.camera.lookAt(0, 0, 0);

    // Take photo
    this.renderer.render(this.scene, this.camera);
    const srcUrl = this.renderer.domElement.toDataURL("image/png");

    // Restore object to its original place
    parent.add(object);

    // Create new Image object
    var image = new Image();
    image.src = srcUrl;

    return image;
  }

  showShot(object: Object3D) {
    return this.showImage(this.takeShot(object));
  }

  showImage(img) {
    img.style.position = "absolute";
    img.style.zIndex = "5";
    img.style.top = "0px";
    document.body.appendChild(img);
    return img;
  }
}
