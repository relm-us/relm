import { Vector2 } from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";

import { OutlinePass } from "./library/OutlinePass";

// https://jsfiddle.net/6k1x8bfq/

export class Effects {
  composer: EffectComposer;
  renderPass: RenderPass;
  outlinePass: any;

  constructor(world, options) {
    const { renderer, scene, camera, size } = world.presentation;

    this.composer = new EffectComposer(renderer);
    this.renderPass = new RenderPass(scene, camera);
    // this.renderPass.setSize(size.x, size.y);
    this.renderPass.setSize(window.innerWidth, window.innerHeight);
    this.composer.addPass(this.renderPass);

    this.outlinePass = new OutlinePass(
      { x: window.innerWidth, y: window.innerHeight },
      scene,
      camera
    );
    // this.outlinePass.depthMaterial.skinning = true;
    // this.outlinePass.prepareMaskMaterial.skinning = true;
    this.outlinePass.visibleEdgeColor.set(0xff0000);
    this.outlinePass.hiddenEdgeColor.set(0xffff00);
    this.outlinePass.edgeGlow = 0;
    this.outlinePass.edgeThickness = 0.3; // Default is 1.
    this.outlinePass.edgeStrength = 3; // Default is 3.
    // this.outlinePass.setSize(size.x, size.y);
    this.outlinePass.setSize(window.innerWidth, window.innerHeight);

    this.composer.addPass(this.outlinePass);
  }
}
