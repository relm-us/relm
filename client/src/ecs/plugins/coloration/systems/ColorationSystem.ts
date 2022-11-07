import { Color, BufferAttribute, Mesh } from "three";

import { Entity, System, Groups, Not, Modified } from "~/ecs/base";
import { Model2Ref } from "~/ecs/plugins/model";
import { FaceMapColors, ColorApplied } from "../components";
import { getFacemapNames } from "../getFacemapNames";

export class ColorationSystem extends System {
  order = Groups.Simulation + 1;

  static queries = {
    new: [FaceMapColors, Model2Ref, Not(ColorApplied)],
    modified: [Modified(FaceMapColors), Model2Ref],
    removed: [Not(FaceMapColors), ColorApplied],
  };

  update() {
    this.queries.new.forEach((entity) => {
      this.build(entity);
    });
    this.queries.modified.forEach((entity) => {
      this.setFaceMapColors(entity);
    });
    this.queries.removed.forEach((entity) => {
      this.remove(entity);
    });
  }

  build(entity: Entity) {
    this.cloneGeometry(entity);
    this.setFaceMapColors(entity);
    entity.add(ColorApplied);
  }

  resetFaceMapColors(entity: Entity) {
    const ref: Model2Ref = entity.get(Model2Ref);
    const scene = ref?.value?.scene;
    if (!scene) return;

    scene.traverse((node) => {
      if ((node as any).isMesh) {
        const facemapNames: Array<any> = getFacemapNames(node);
        if (facemapNames) {
          for (let i = 0; i < facemapNames.length; i++) {
            changeFacemapColor(node, i, "#000000", 0);
          }
        }
      }
    });
  }

  setFaceMapColors(entity: Entity) {
    const ref: Model2Ref = entity.get(Model2Ref);
    const scene = ref?.value?.scene;
    if (!scene) return;

    const spec = entity.get(FaceMapColors);

    if (!spec.colors) return;

    scene.traverse((node) => {
      if ((node as any).isMesh) {
        const facemapNames: Array<any> = getFacemapNames(node);
        if (facemapNames) {
          getOrCreateOriginalColorAttribute(node);

          for (const [name, target] of Object.entries(spec.colors)) {
            const index = facemapNames.findIndex((n) => n === name);
            if (index >= 0) {
              const targetColor = target[0];
              const targetAlpha = target[1];
              changeFacemapColor(node, index, targetColor, targetAlpha);
            }
          }
        }
      }
    });
  }

  remove(entity: Entity) {
    this.resetFaceMapColors(entity);
    entity.remove(ColorApplied);
  }

  cloneGeometry(entity: Entity) {
    const ref: Model2Ref = entity.get(Model2Ref);
    const scene = ref?.value?.scene;
    if (!scene) return;

    scene.traverse((node) => {
      if ((node as any).isMesh) {
        (node as Mesh).geometry = (node as Mesh).geometry.clone();
      }
    });
  }
}

function getOrCreateColorAttribute(node) {
  const geom = node.geometry;
  if (!("color" in geom.attributes)) {
    const position = geom.getAttribute("position");
    const array = new Uint16Array(position.count * 4);
    const color = new BufferAttribute(array, 4, true);
    const materialColor = node.material.color.convertLinearToSRGB();
    for (let i = 0; i < position.count; i++) {
      color.setXYZ(
        i,
        Math.floor(materialColor.r * 65535),
        Math.floor(materialColor.g * 65535),
        Math.floor(materialColor.b * 65535)
      );
    }
    geom.setAttribute("color", color);
    node.material.vertexColors = true;
    node.material.needsUpdate = true;
  }
  return geom.getAttribute("color");
}

function getOrCreateOriginalColorAttribute(node) {
  const geom = node.geometry;
  if (!("originalcolor" in geom.attributes)) {
    const color = getOrCreateColorAttribute(node);
    geom.setAttribute("originalcolor", color.clone());
  }
  return geom.getAttribute("originalcolor");
}

const sColor = new Color();
function lerpOriginalToColor(i, original, color, dColor, lerpAlpha) {
  sColor.r = original.getX(i) / 65535;
  sColor.g = original.getY(i) / 65535;
  sColor.b = original.getZ(i) / 65535;

  sColor.lerpColors(sColor, dColor, lerpAlpha);

  color.setXYZ(
    i,
    Math.floor(sColor.r * 65535),
    Math.floor(sColor.g * 65535),
    Math.floor(sColor.b * 65535)
  );
}

function changeFacemapColor(node, facemapIndex, destColor, lerpAlpha) {
  if (facemapIndex >= getFacemapNames(node).length) {
    console.warn(
      "Can't changeFacemapColor: no facemap index",
      facemapIndex,
      node
    );
    return;
  }

  const facemaps = node.geometry.getAttribute("_facemaps");
  if (!facemaps) {
    console.warn("Can't changeFacemapColor: no _facemaps attribute", node);
    return;
  }

  const dColor = new Color(destColor);

  const color = getOrCreateColorAttribute(node);
  const original = getOrCreateOriginalColorAttribute(node);

  for (let i = 0, len = facemaps.count; i < len; i++) {
    if (facemaps.array[i] === facemapIndex) {
      lerpOriginalToColor(i, original, color, dColor, lerpAlpha);
    }
  }

  color.needsUpdate = true;
}
