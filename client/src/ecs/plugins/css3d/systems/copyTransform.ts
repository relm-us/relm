import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer";
import { Transform } from "~/ecs/plugins/core";
import { CssPresentation } from "../CssPresentation";

export function copyTransform(
  css3d: CSS3DObject,
  transform: Transform,
  scale: number
) {
  if (!css3d) {
    console.warn(`Can't copyTransform, css3d is null`, css3d);
    return;
  }

  css3d.position
    .copy(transform.positionWorld)
    .multiplyScalar(CssPresentation.FACTOR);

  css3d.quaternion.copy(transform.rotationWorld);

  css3d.scale
    .copy(transform.scaleWorld)
    .multiplyScalar(CssPresentation.FACTOR * scale);

  css3d.updateMatrix();
}
