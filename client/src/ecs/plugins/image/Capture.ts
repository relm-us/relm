import * as THREE from "three";
import { WebGLRenderer, PerspectiveCamera } from "three";
import { Presentation } from "./Presentation";

export class Capture {
  presentation: Presentation;
  renderer: WebGLRenderer;
  camera: PerspectiveCamera;

  constructor(presentation) {
    this.presentation = presentation;

    this.renderer = new WebGLRenderer({
      antialias: true,
    });
    this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.VSMShadowMap;
    this.camera = new PerspectiveCamera(75, 1 / 1, 0.1, 1000);
  }

  takePhoto(width, height) {
    // update sizes
    this.renderer.domElement.setAttribute("width", width);
    this.renderer.domElement.setAttribute("height", height);
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    // copy camera world transform
    this.presentation.camera.matrixWorld.decompose(
      this.camera.position,
      this.camera.quaternion,
      this.camera.scale
    );

    // capture it!
    this.renderer.render(this.presentation.scene, this.camera);
    const base64 = this.renderer.domElement.toDataURL();
    return base64;
  }
}
