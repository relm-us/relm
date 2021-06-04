import {
  Vector3,
  Matrix4,
  Color,
  Texture,
  BoxGeometry,
  Object3D,
  Mesh,
  UniformsUtils,
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

export class Fire extends Mesh {
  material: ShaderMaterial;
  fireTex: Texture;
  color: Color;
  colorMix: number;
  blaze: number;
  octaves: number;

  constructor(fireTex, color, colorMix, blaze, octaves) {
    var fireMaterial = new ShaderMaterial({
      defines: FireShader.defines,
      uniforms: UniformsUtils.clone(FireShader.uniforms),
      vertexShader: FireShader.vertexShader,
      fragmentShader: FireShader.fragmentShader,
      transparent: true,
      depthWrite: false,
      depthTest: true,
    });

    // initialize uniforms

    fireTex.magFilter = fireTex.minFilter = LinearFilter;
    fireTex.wrapS = fireTex.wrapT = ClampToEdgeWrapping;

    fireMaterial.uniforms.fireTex.value = fireTex;
    fireMaterial.uniforms.color.value = color;
    fireMaterial.uniforms.invModelMatrix.value = new Matrix4();
    fireMaterial.uniforms.scale.value = new Vector3(1, 1, 1);
    fireMaterial.uniforms.seed.value = Math.random() * 19.19;
    fireMaterial.uniforms.colorMix.value = MathUtils.clamp(colorMix, 0, 1);
    fireMaterial.defines.ITERATIONS = blaze;
    fireMaterial.defines.OCTAVES = Math.floor(octaves);

    const box = new BoxGeometry(1, 1, 1);
    super(box, fireMaterial);

    // Keep initializer args around so we can `copy` later
    this.fireTex = fireTex;
    this.color = color;
    this.colorMix = colorMix;
    this.blaze = blaze;
    this.octaves = octaves;
  }

  update(time) {
    var invModelMatrix = this.material.uniforms.invModelMatrix.value;

    (this as Object3D).updateMatrixWorld();

    invModelMatrix.copy((this as Object3D).matrixWorld).invert();

    if (time !== undefined) {
      this.material.uniforms.time.value = time;
    }

    this.material.uniforms.invModelMatrix.value = invModelMatrix;

    this.material.uniforms.scale.value = (this as Object3D).scale;
  }

  clone(recursive?: boolean): Object3D {
    const fire = new Fire(
      this.fireTex,
      this.color,
      this.colorMix,
      this.blaze,
      this.octaves
    );
    return (fire as Object3D).copy(this, recursive);
  }
}
