import { Matrix4, Vector3, Quaternion } from "three";
import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer";

import { Transform } from "~/ecs/plugins/core";

import { CssPresentation } from "./CssPresentation";

const _pos = new Vector3();
const _rot = new Quaternion();
const _sca = new Vector3();

export function copyTransform(
  css3d: CSS3DObject,
  transform: Transform,
  scale: number,
  offset: Vector3
) {
  if (!css3d) {
    console.warn(`Can't copyTransform, css3d is null`, css3d);
    return;
  }

  // TODO: Why must the FACTOR be multiplied by 2 here?
  _pos.copy(offset).multiplyScalar(CssPresentation.FACTOR * 2);
  const offsetMatrix = new Matrix4().setPosition(_pos);

  const primaryMatrix = new Matrix4();
  _pos.copy(transform.positionWorld).multiplyScalar(CssPresentation.FACTOR);
  _sca
    .copy(transform.scaleWorld)
    .multiplyScalar(CssPresentation.FACTOR * scale);

  primaryMatrix.compose(_pos, transform.rotationWorld, _sca);
  primaryMatrix.multiply(offsetMatrix);
  primaryMatrix.decompose(css3d.position, css3d.quaternion, css3d.scale);
}
