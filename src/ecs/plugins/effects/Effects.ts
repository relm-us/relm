import { Vector2, CustomBlending, SubtractiveBlending } from "three";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { BloomPass } from "three/examples/jsm/postprocessing/BloomPass";

import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass";
import { SSAOPass } from "three/examples/jsm/postprocessing/SSAOPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader";

import { store as sizeStore } from "~/world/size";

// https://jsfiddle.net/6k1x8bfq/

export class Effects {
  composer: EffectComposer;
  renderPass: RenderPass;
  bloomPass: any;
  outlinePass: any;
  antiAliasPass: any;
  ambientOcclusion: any;

  constructor(world, options) {
    const { composer, renderer, scene, camera, size } = world.presentation;

    /* BloomPass */
    // this.bloomPass = new BloomPass(1, 25, 8, 512);

    /* UnrealBloomPass */
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

    this.outlinePass = new OutlinePass(
      new Vector2(window.innerWidth, window.innerHeight),
      scene,
      camera
    );
    // this.outlinePass.depthMaterial.skinning = true;
    // this.outlinePass.prepareMaskMaterial.skinning = true;
    // Allows for dark edge colors
    this.outlinePass.overlayMaterial.blending = CustomBlending;
    this.outlinePass.visibleEdgeColor.set(0xff0000);
    this.outlinePass.hiddenEdgeColor.set(0x440000);
    this.outlinePass.edgeGlow = 0;
    this.outlinePass.edgeThickness = 1; // Default is 1.
    this.outlinePass.edgeStrength = 4; // Default is 3.
    composer.addPass(this.outlinePass);

    // this.ambientOcclusion = new SSAOPass(scene, camera);
    // this.ambientOcclusion.kernelRadius = 16;
    // this.ambientOcclusion.minDistance = 0.005;
    // this.ambientOcclusion.maxDistance = 0.25;
    // composer.addPass(this.ambientOcclusion);

    this.antiAliasPass = new ShaderPass(FXAAShader);
    sizeStore.subscribe(($size) => {
      this.antiAliasPass.uniforms["resolution"].value.set(
        1 / $size.width,
        1 / $size.height
      );
    });
    composer.addPass(this.antiAliasPass);
  }
}
