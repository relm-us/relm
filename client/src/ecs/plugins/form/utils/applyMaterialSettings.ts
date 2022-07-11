import { Scene, sRGBEncoding } from "three";
import { traverseMaterials } from "~/ecs/shared/traverseMaterials";

export function applyMaterialSettings(scene: Scene) {
  const encoding = sRGBEncoding;
  traverseMaterials(scene, (material) => {
    if (material.map) material.map.encoding = encoding;
    if (material.emissiveMap) material.emissiveMap.encoding = encoding;
    if (material.map || material.emissiveMap) material.needsUpdate = true;
  });
}
