import { Vector2 } from "three";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass";

import { Object3D } from "hecs-plugin-three";
import { findEntity } from "~/ecs/utils";

// https://jsfiddle.net/6k1x8bfq/

export class Effects {
  composer: EffectComposer;
  renderPass: RenderPass;
  bloomPass: any;
  outlinePass: any;

  constructor(world, options) {
    const { composer, renderer, scene, camera, size } = world.presentation;

    this.outlinePass = new OutlinePass(
      new Vector2(window.innerWidth, window.innerHeight),
      scene,
      camera
    );
    // this.outlinePass.depthMaterial.skinning = true;
    // this.outlinePass.prepareMaskMaterial.skinning = true;
    this.outlinePass.visibleEdgeColor.set(0xffffff);
    this.outlinePass.hiddenEdgeColor.set(0x444444);
    this.outlinePass.edgeGlow = 0;
    this.outlinePass.edgeThickness = 1; // Default is 1.
    this.outlinePass.edgeStrength = 3; // Default is 3.
    composer.addPass(this.outlinePass);

    // const bloomParams = {
    //   strength: 0.25,
    //   radius: 0.1,
    //   threshold: 0.96,
    // };
    // this.bloomPass = new UnrealBloomPass(
    //   new Vector2(window.innerWidth, window.innerHeight),
    //   bloomParams.strength,
    //   bloomParams.radius,
    //   bloomParams.threshold
    // );

    // composer.addPass(this.bloomPass);
  }
}
