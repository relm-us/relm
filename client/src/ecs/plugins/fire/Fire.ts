import {
  Vector3,
  Matrix4,
  Color,
  BoxGeometry,
  Mesh,
  UniformsUtils,
  ShaderMaterial,
  LinearFilter,
  ClampToEdgeWrapping,
} from "three";
import { FireShader } from "./FireShader";

/**
 * @author mattatz / http://github.com/mattatz
 *
 * Ray tracing based real-time procedural volumetric fire object for three.js
 */

export class Fire extends Mesh {
  material: ShaderMaterial;

  constructor(fireTex, color, blaze) {
    var fireMaterial = new ShaderMaterial({
      defines: FireShader.defines,
      uniforms: UniformsUtils.clone(FireShader.uniforms),
      vertexShader: FireShader.vertexShader,
      fragmentShader: FireShader.fragmentShader,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });

    // initialize uniforms

    fireTex.magFilter = fireTex.minFilter = LinearFilter;
    fireTex.wrapS = fireTex.wrapT = ClampToEdgeWrapping;

    fireMaterial.uniforms.fireTex.value = fireTex;
    fireMaterial.uniforms.color.value = color;
    fireMaterial.uniforms.blaze.value = blaze;
    fireMaterial.uniforms.invModelMatrix.value = new Matrix4();
    fireMaterial.uniforms.scale.value = new Vector3(1, 1, 1);
    fireMaterial.uniforms.seed.value = Math.random() * 19.19;

    const box = new BoxGeometry(1, 1, 1);
    super(box, fireMaterial);
  }

  update(time) {
    var invModelMatrix = this.material.uniforms.invModelMatrix.value;

    this.updateMatrixWorld();

    invModelMatrix.copy(this.matrixWorld).invert();

    if (time !== undefined) {
      this.material.uniforms.time.value = time;
    }

    this.material.uniforms.invModelMatrix.value = invModelMatrix;

    this.material.uniforms.scale.value = this.scale;
  }
}
