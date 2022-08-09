import {
  Vector3,
  Matrix4,
  Color,
  Texture,
  BoxGeometry,
  Object3D,
  Mesh,
  ShaderMaterial,
  LinearFilter,
  ClampToEdgeWrapping,
  MathUtils,
} from "three";

import { FireShader } from "./FireShader";

/**
 * @author mattatz / http://github.com/mattatz
 *
 * Ray tracing based real-time procedural volumetric fire object for three.js
 */
const fireMaterial = new ShaderMaterial({
  defines: FireShader.defines,
  uniforms: FireShader.uniforms,
  vertexShader: FireShader.vertexShader,
  fragmentShader: FireShader.fragmentShader,
  transparent: true,
  depthWrite: false,
  depthTest: true,
});

export class Fire extends Mesh {
  material: ShaderMaterial;
  fireTex: Texture;
  color: Color;
  colorMix: number;
  blaze: number;
  octaves: number;

  constructor(fireTex, color, colorMix, blaze, octaves) {
    fireTex.magFilter = fireTex.minFilter = LinearFilter;
    fireTex.wrapS = fireTex.wrapT = ClampToEdgeWrapping;

    const material = fireMaterial.clone();

    material.uniforms.iterations.value = Math.floor(blaze);
    material.uniforms.octaves.value = Math.floor(octaves);

    material.uniforms.fireTex.value = fireTex;
    material.uniforms.color.value = color;
    material.uniforms.invModelMatrix.value = new Matrix4();
    material.uniforms.scale.value = new Vector3(1, 1, 1);
    material.uniforms.seed.value = Math.random() * 19.19;
    material.uniforms.colorMix.value = MathUtils.clamp(colorMix, 0, 1);

    const box = new BoxGeometry(1, 1, 1);
    super(box, material);

    // Keep initializer args around so we can `copy` later
    this.fireTex = fireTex;
    this.color = color;
    this.colorMix = colorMix;
    this.blaze = blaze;
    this.octaves = octaves;
  }

  update(time) {
    var invModelMatrix = this.material.uniforms.invModelMatrix.value;

    this.updateMatrixWorld();

    invModelMatrix.copy((this as Object3D).matrixWorld).invert();

    if (time !== undefined) {
      this.material.uniforms.time.value = time;
    }

    this.material.uniforms.invModelMatrix.value = invModelMatrix;

    this.material.uniforms.scale.value = (this as Object3D).scale;
  }

  clone(recursive): this {
    const fire = new Fire(
      this.fireTex,
      this.color,
      this.colorMix,
      this.blaze,
      this.octaves
    );
    return (fire as any).copy(this, recursive) as any;
  }
}
